
import React, { createContext, useContext, useState, useCallback } from "react";
import axios from "axios";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "./AuthContext";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/users/current");
      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        setError(response.data.message || "Failed to load user");
      }
    } catch (err) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put("/users/update", userData);
      if (response.data.success) {
        setUser(response.data.data.user);
      } else {
        setError(response.data.message || "Update failed");
      }
    } catch (err) {
      setError(err.message || "Failed to update user");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <ProfileContext.Provider
      value={{ user, updateUser, isEditing, setIsEditing, error, loading }}
    >
      {loading ? <LoadingScreen /> : children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === null) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};
