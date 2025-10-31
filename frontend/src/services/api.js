import axios from "axios";
import toast from "react-hot-toast";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => {
    // Calculate request duration for monitoring
    const endTime = new Date();
    const duration = endTime - response.config.metadata.startTime;

    console.log(
      `API ${response.config.method?.toUpperCase()} ${
        response.config.url
      } completed in ${duration}ms`
    );

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken) {
          const response = await axios.post(
            `${
              process.env.REACT_APP_API_URL || "http://localhost:5000/api"
            }/auth/refresh`,
            { refreshToken }
          );

          const { accessToken } = response.data;

          // Update stored token
          localStorage.setItem("accessToken", accessToken);

          // Update authorization header
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Retry original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    // Check if this request should suppress error toasts
    const suppressToast = originalRequest.suppressErrorToast;

    // Handle network errors
    if (!error.response && !suppressToast) {
      toast.error("Network error. Please check your connection.");
    }

    // Handle server errors - only show toast if not suppressed
    if (error.response?.status >= 500 && !suppressToast) {
      toast.error("Server error. Please try again later.");
    }

    // Handle rate limiting
    if (error.response?.status === 429 && !suppressToast) {
      toast.error(
        "Too many requests. Please wait a moment before trying again."
      );
    }

    // Log error for debugging
    console.error("API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    return Promise.reject(error);
  }
);

// API Service Object
const apiService = {
  // Authentication endpoints
  auth: {
    login: (credentials) => api.post("/auth/login", credentials),
    register: (userData) => api.post("/auth/register", userData),
    logout: () => api.post("/auth/logout"),
    refreshToken: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
    getProfile: () => api.get("/auth/me"),
  },

  // User endpoints
  users: {
    getProfile: (userId) => api.get(`/users/${userId}`),
    updateProfile: (profileData) => api.put("/users/profile", profileData),
    uploadAvatar: (imageData) =>
      api.post("/users/upload-avatar", { imageData }),
    updateNotificationPreferences: (preferences) =>
      api.put("/users/preferences/notifications", preferences),
    updatePrivacyPreferences: (preferences) =>
      api.put("/users/preferences/privacy", preferences),
    searchUsers: (filters) =>
      api.get("/users/search/discover", { params: filters }),
    getUserStats: (userId) => api.get(`/users/${userId}/stats`),
    deactivateAccount: () => api.delete("/users/account"),
    reactivateAccount: (credentials) =>
      api.post("/users/reactivate", credentials),
  },

  // Skills endpoints
  skills: {
    getCategories: () => api.get("/skills/categories"),
    searchSkills: (query) => api.get("/skills/search", { params: { query } }),
    getMySkills: () => api.get("/skills/my-skills"),
    addTeachableSkills: (skills) => api.post("/skills/teachable", { skills }),
    addDesiredSkills: (skills) => api.post("/skills/desired", { skills }),
    removeTeachableSkill: (skill) =>
      api.delete(`/skills/teachable/${encodeURIComponent(skill)}`),
    removeDesiredSkill: (skill) =>
      api.delete(`/skills/desired/${encodeURIComponent(skill)}`),
    updateSkillProficiency: (skill, level, type) =>
      api.put("/skills/proficiency", { skill, level, type }),
    getRecommendations: () => api.get("/skills/recommendations"),
  },

  // Matches endpoints
  matches: {
    findMatches: () => api.get("/matches/find-matches"),
    createMatch: (userId) => api.post("/matches", { userId }),
    getUserMatches: () => api.get("/matches"),
    getMatchDetails: (matchId) => api.get(`/matches/${matchId}`),
    updateMatchStatus: (matchId, status) =>
      api.patch(`/matches/${matchId}/status`, { status }),
    getFreshSuggestions: () => api.get("/matches/suggestions/refresh"),
  },

  // Messages endpoints
  messages: {
    sendMessage: (messageData) => api.post("/messages", messageData),
    getConversation: (userId, params = {}) =>
      api.get(`/messages/conversation/${userId}`, { params }),
    markAsRead: (userId) => api.patch(`/messages/conversation/${userId}/read`),
    getConversations: () => api.get("/messages/conversations"),
    sendTypingIndicator: (recipientId, isTyping) =>
      api.post("/messages/typing", { recipientId, isTyping }),
    deleteMessage: (messageId) => api.delete(`/messages/${messageId}`),
    deleteConversation: (userId) =>
      api.delete(`/messages/conversation/${userId}`),
    uploadFile: (fileData) => api.post("/messages/upload", fileData),
    searchMessages: (userId, query, params = {}) =>
      api.get(`/messages/conversation/${userId}/search`, {
        params: { q: query, ...params },
      }),
  },

  // Sessions endpoints
  sessions: {
    create: (sessionData) => api.post("/sessions", sessionData),
    createSession: (sessionData) => api.post("/sessions", sessionData),
    getUserSessions: (params = {}) => api.get("/sessions", { params }),
    getSessionDetails: (sessionId) => api.get(`/sessions/${sessionId}`),
    updateSession: (sessionId, updates) =>
      api.patch(`/sessions/${sessionId}`, updates),
    cancelSession: (sessionId, reason) =>
      api.post(`/sessions/${sessionId}/cancel`, { reason }),
    completeSession: (sessionId, feedback) =>
      api.post(`/sessions/${sessionId}/complete`, feedback),
    getUserAvailability: (userId, params = {}) =>
      api.get(`/sessions/availability/${userId}`, { params }),
    createInstantMeeting: (participantId) =>
      api.post("/sessions/instant", { participantId }),
  },

  // Health check
  health: {
    check: () => api.get("/health"),
  },

  // Admin endpoints
  admin: {
    getStats: () => api.get("/admin/stats"),
    getUsers: (params) => api.get("/admin/users", { params }),
    updateUser: (userId, updates) =>
      api.patch(`/admin/users/${userId}`, updates),
    deleteUser: (userId, permanent = false) =>
      api.delete(`/admin/users/${userId}`, { params: { permanent } }),
    getReports: (params) => api.get("/admin/reports", { params }),
    handleReport: (reportId, data) =>
      api.patch(`/admin/reports/${reportId}`, data),
    getActivity: (params) => api.get("/admin/activity", { params }),
    getHealth: () => api.get("/admin/health"),
    bulkAction: (action, userIds) =>
      api.post("/admin/bulk-action", { action, userIds }),
  },
};

// File upload utility
export const uploadFile = async (file, type = "avatar") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("type", type);

  try {
    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });

    return response.data;
  } catch (error) {
    console.error("File upload error:", error);
    throw error;
  }
};

// Base64 image conversion utility
export const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Image compression utility
export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(resolve, "image/jpeg", quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// Network status utility
export const checkNetworkStatus = () => {
  return navigator.onLine;
};

// Batch request utility
export const batchRequests = async (requests) => {
  try {
    const responses = await Promise.allSettled(requests);
    return responses.map((result, index) => ({
      index,
      status: result.status,
      data: result.status === "fulfilled" ? result.value.data : null,
      error: result.status === "rejected" ? result.reason : null,
    }));
  } catch (error) {
    console.error("Batch request error:", error);
    throw error;
  }
};

// Retry utility for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      if (i < maxRetries - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError;
};

// Export the configured axios instance
export default api;

// Silent API call helper - suppresses error toasts
export const silentApi = {
  get: (url, config = {}) =>
    api.get(url, { ...config, suppressErrorToast: true }),
  post: (url, data, config = {}) =>
    api.post(url, data, { ...config, suppressErrorToast: true }),
  put: (url, data, config = {}) =>
    api.put(url, data, { ...config, suppressErrorToast: true }),
  patch: (url, data, config = {}) =>
    api.patch(url, data, { ...config, suppressErrorToast: true }),
  delete: (url, config = {}) =>
    api.delete(url, { ...config, suppressErrorToast: true }),
};

// Export API service
export { apiService };
