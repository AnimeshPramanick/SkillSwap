import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState("light"); // "light" or "dark"
  const [colorTheme, setColorTheme] = useState("blue"); // "blue", "indigo", "teal"

  // Load from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("theme-mode") || "light";
    const savedColor = localStorage.getItem("theme-color") || "blue";
    setMode(savedMode);
    setColorTheme(savedColor);
    applyTheme(savedMode, savedColor);
  }, []);

  const applyTheme = (newMode, newColor) => {
    const root = document.documentElement;
    
    if (newMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    
    // Store in localStorage
    localStorage.setItem("theme-mode", newMode);
    localStorage.setItem("theme-color", newColor);
  };

  const toggleMode = () => {
    const newMode = mode === "light" ? "dark" : "light";
    setMode(newMode);
    applyTheme(newMode, colorTheme);
  };

  const cycleColorTheme = () => {
    const newColor = colorTheme === "blue" ? "indigo" : colorTheme === "indigo" ? "teal" : "blue";
    setColorTheme(newColor);
    applyTheme(mode, newColor);
  };

  const value = {
    mode,
    colorTheme,
    toggleMode,
    cycleColorTheme,
    isDark: mode === "dark",
    isLight: mode === "light",
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
