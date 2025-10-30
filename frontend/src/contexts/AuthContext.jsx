import React, { createContext, useContext, useReducer, useEffect } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

// Initial state
const initialState = {
  user: null,
  tokens: {
    accessToken: null,
    refreshToken: null,
  },
  loading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_ERROR: "LOGIN_ERROR",
  LOGOUT: "LOGOUT",
  UPDATE_USER: "UPDATE_USER",
  CLEAR_ERROR: "CLEAR_ERROR",
  TOKEN_REFRESHED: "TOKEN_REFRESHED",
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        user: null,
        tokens: { accessToken: null, refreshToken: null },
        loading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        tokens: { accessToken: null, refreshToken: null },
        loading: false,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
        error: null,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.TOKEN_REFRESHED:
      return {
        ...state,
        tokens: {
          ...state.tokens,
          accessToken: action.payload.accessToken,
        },
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize authentication
  const initializeAuth = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (accessToken) {
        // Set the token in API service
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        try {
          // Verify token and get user profile
          const response = await api.get("/auth/me");

          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: {
              user: response.data.user,
              tokens: { accessToken, refreshToken },
            },
          });

          // Set up token refresh interval
          scheduleTokenRefresh();
        } catch (error) {
          // Token might be expired, try to refresh
          if (refreshToken) {
            await refreshAccessToken();
          } else {
            throw error;
          }
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  };

  // Schedule token refresh
  const scheduleTokenRefresh = () => {
    // Refresh token 5 minutes before expiration
    const REFRESH_INTERVAL = 25 * 60 * 1000; // 25 minutes

    setInterval(async () => {
      if (state.tokens.accessToken) {
        await refreshAccessToken();
      }
    }, REFRESH_INTERVAL);
  };

  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await api.post("/auth/refresh", {
        refreshToken,
      });

      const { accessToken } = response.data;

      // Update local storage
      localStorage.setItem("accessToken", accessToken);

      // Update API header
      api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

      // Update state
      dispatch({
        type: AUTH_ACTIONS.TOKEN_REFRESHED,
        payload: { accessToken },
      });

      return accessToken;
    } catch (error) {
      console.error("Token refresh error:", error);
      // If refresh fails, logout user
      logout();
      throw error;
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { user, tokens } = response.data;

      // Store tokens in localStorage
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      // Set authorization header
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${tokens.accessToken}`;

      // Update state
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, tokens },
      });

      toast.success("Welcome back to SkillSwap!");

      return user;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Login failed. Please try again.";
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

      const response = await api.post("/auth/register", userData);

      const { user, tokens } = response.data;

      // Store tokens in localStorage
      localStorage.setItem("accessToken", tokens.accessToken);
      localStorage.setItem("refreshToken", tokens.refreshToken);

      // Set authorization header
      api.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${tokens.accessToken}`;

      // Update state
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, tokens },
      });

      toast.success("Welcome to SkillSwap! Your account has been created.");

      return user;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Registration failed. Please try again.";
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: errorMessage,
      });
      toast.error(errorMessage);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout endpoint to invalidate session on server
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      // Remove authorization header
      delete api.defaults.headers.common["Authorization"];

      // Update state
      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      toast.success("You have been logged out successfully.");
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/users/profile", profileData);

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.user,
      });

      toast.success("Profile updated successfully!");
      return response.data.user;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update profile.";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Update user skills
  const updateSkills = async (type, skills) => {
    try {
      const endpoint =
        type === "teachable" ? "/skills/teachable" : "/skills/desired";
      const response = await api.post(endpoint, { skills });

      const updatedUser = {
        ...state.user,
        skills: {
          ...state.user.skills,
          [type]: response.data.skills,
        },
      };

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: { skills: updatedUser.skills },
      });

      toast.success(`${type} skills updated successfully!`);
      return response.data.skills;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update skills.";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Upload avatar
  const uploadAvatar = async (imageData) => {
    try {
      const response = await api.post("/users/upload-avatar", {
        imageData,
      });

      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: {
          profile: {
            ...state.user.profile,
            avatar: response.data.avatarUrl,
          },
        },
      });

      toast.success("Avatar uploaded successfully!");
      return response.data.avatarUrl;
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to upload avatar.";
      toast.error(errorMessage);
      throw error;
    }
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await api.get("/auth/me");
      dispatch({
        type: AUTH_ACTIONS.UPDATE_USER,
        payload: response.data.user,
      });
      return response.data.user;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  };

  // Context value
  const value = {
    // State
    user: state.user,
    tokens: state.tokens,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    updateSkills,
    uploadAvatar,
    clearError,
    refreshAccessToken,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }

  return context;
};

export default AuthContext;
