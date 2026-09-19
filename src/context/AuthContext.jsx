import React, { createContext, useState, useEffect, useContext } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  // Hydrate user session on app launch if a token exists
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const data = await authService.getCurrentUser();
          setUser(data.user);
          setToken(storedToken);
        } catch (error) {
          console.warn("Session expired or invalid token:", error?.response?.data?.message || error.message);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await authService.login({ email, password });
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || "Login failed");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Invalid credentials";
      throw new Error(errorMsg);
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true, user: data.user };
      }
      throw new Error(data.message || "Registration failed");
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Registration failed";
      throw new Error(errorMsg);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
