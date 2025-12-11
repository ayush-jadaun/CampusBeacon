/* eslint-disable no-unused-vars */
/**
 * Redux Auth Slice
 * Manages user authentication state and related async operations
 * Uses cookie-based authentication with axios interceptors
 */

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

/**
 * Axios instance configuration
 * - Configured for cookie-based authentication
 * - Includes automatic credential sending
 * - Handles 401 responses for non-auth endpoints
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for handling unauthorized requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint =
      error.config.url.includes("/users/login") ||
      error.config.url.includes("/users/signup") ||
      error.config.url.includes("/users/current");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      console.error("Received 401 Unauthorized for non-auth endpoint.");
    }
    return Promise.reject(error);
  }
);

// =============================================================================
// ASYNC THUNKS
// =============================================================================

/**
 * Check current authentication status
 * @returns {Object|null} User object if authenticated, null otherwise
 */
export const checkAuthStatus = createAsyncThunk(
  "auth/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/current");
      const user = response.data?.data?.user || null;
      return user;
    } catch (error) {
      return null;
    }
  }
);

/**
 * Handle user sign in
 * @param {Object} credentials - Email and password
 * @returns {Object} User object on success
 */
export const handleSignIn = createAsyncThunk(
  "auth/handleSignIn",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/login", { email, password });
      const user = response.data?.data?.user;

      if (!user) {
        return rejectWithValue("Login failed: Invalid response from server.");
      }

      return user;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue("Please verify your email before logging in.");
      }
      if (error.response?.status === 401 || error.response?.status === 400) {
        return rejectWithValue("Invalid email or password.");
      }
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to sign in. Please try again later."
      );
    }
  }
);

/**
 * Handle user sign up
 * @param {Object} credentials - Email and password
 * @returns {Object} Response data (success message)
 */
export const handleSignUp = createAsyncThunk(
  "auth/handleSignUp",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/signup", { email, password });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    }
  }
);

/**
 * Handle forgot password request
 * @param {string} email - User's email address
 * @returns {string} Success message
 */
export const handleForgetPassword = createAsyncThunk(
  "auth/handleForgetPassword",
  async (email, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/forgot-password", { email });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send password reset email."
      );
    }
  }
);

/**
 * Handle password reset
 * @param {Object} resetData - Token and new password
 * @returns {string} Success message
 */
export const handleResetPassword = createAsyncThunk(
  "auth/handleResetPassword",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/reset-password", {
        token,
        newPassword,
      });
      return response.data.message;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Password reset failed. The link might be invalid or expired."
      );
    }
  }
);

/**
 * Handle email verification
 * @param {string} token - Verification token
 * @returns {Object} User object on successful verification
 */
export const handleEmailVerification = createAsyncThunk(
  "auth/handleEmailVerification",
  async (token, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/verify-email?token=${token}`);
      const user = response.data?.data?.user;

      if (!user) {
        return rejectWithValue(
          "Email verification failed: Invalid response from server."
        );
      }

      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Email verification failed. The link might be invalid or expired."
      );
    }
  }
);

/**
 * Handle user logout
 * @returns {boolean} Success indicator
 */
export const handleLogout = createAsyncThunk(
  "auth/handleLogout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      await api.post("/users/logout");
      return true;
    } catch (error) {
      console.error("Server logout failed:", error);
      return rejectWithValue(
        "Server logout failed, but client session cleared."
      );
    }
  }
);

/**
 * Fetch all users (Admin only)
 * @returns {Array} Array of user objects
 */
export const fetchAllUsers = createAsyncThunk(
  "auth/fetchAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/users/admin/all");
      if (response.data.success && response.data.data?.users) {
        return response.data.data.users;
      } else {
        return rejectWithValue(
          response.data.message ||
            "Failed to fetch users: Invalid server response."
        );
      }
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue("Permission denied: Admin access required.");
      }
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "An error occurred while fetching users."
      );
    }
  }
);

/**
 * Handle Google OAuth authentication
 * @param {string} idToken - Google ID token
 * @returns {Object} User object on success
 */
export const handleGoogleAuth = createAsyncThunk(
  "auth/handleGoogleAuth",
  async (idToken, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/google-auth", { idToken });
      const user = response.data?.data?.user;

      if (!user) {
        return rejectWithValue(
          "Google authentication failed: Invalid response from server."
        );
      }

      return user;
    } catch (error) {
      if (error.response?.status === 403) {
        return rejectWithValue("Only MNNIT institutional emails are allowed.");
      }
      return rejectWithValue(
        error.response?.data?.message ||
          "Unable to authenticate with Google. Please try again later."
      );
    }
  }
);

// =============================================================================
// SLICE DEFINITION
// =============================================================================

const authSlice = createSlice({
  name: "auth",
  initialState: {
    // Core authentication state
    user: null,
    roles: [],
    isAuthenticated: false,
    loading: false,
    error: null,
    lastChecked: null,

    // Admin-specific state
    allUsers: [],
    loadingUsers: false,
    usersError: null,
  },
  reducers: {
    /**
     * Synchronously clear authentication state
     */
    logout: (state) => {
      state.user = null;
      state.roles = [];
      state.isAuthenticated = false;
      state.lastChecked = null;
      state.error = null;
      state.allUsers = [];
      state.usersError = null;
    },

    /**
     * Clear general authentication error
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * Clear users-specific error
     */
    clearUsersError: (state) => {
      state.usersError = null;
    },

    /**
     * Force re-check of authentication status
     */
    invalidateAuth: (state) => {
      state.lastChecked = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check Auth Status Cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.roles = action.payload?.roles || [];
        state.isAuthenticated = !!action.payload;
        state.lastChecked = Date.now();
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.lastChecked = Date.now();
        state.error =
          action.payload || "Failed to check authentication status.";
      })

      // Sign In Cases
      .addCase(handleSignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleSignIn.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.roles = action.payload.roles || [];
        state.isAuthenticated = true;
        state.lastChecked = Date.now();
        state.error = null;
      })
      .addCase(handleSignIn.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // Sign Up Cases
      .addCase(handleSignUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleSignUp.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(handleSignUp.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // Forgot Password Cases
      .addCase(handleForgetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleForgetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(handleForgetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset Password Cases
      .addCase(handleResetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleResetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(handleResetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Email Verification Cases
      .addCase(handleEmailVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleEmailVerification.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.roles = action.payload.roles || [];
        state.isAuthenticated = true;
        state.lastChecked = Date.now();
        state.error = null;
      })
      .addCase(handleEmailVerification.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // Logout Cases
      .addCase(handleLogout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleLogout.fulfilled, (state) => {
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.lastChecked = null;
        state.error = null;
        state.loading = false;
        state.allUsers = [];
        state.usersError = null;
      })
      .addCase(handleLogout.rejected, (state, action) => {
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.lastChecked = null;
        state.allUsers = [];
        state.usersError = null;
        state.loading = false;
        console.error("Logout rejected:", action.payload);
        state.error = action.payload;
      })

      // Google Auth Cases
      .addCase(handleGoogleAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(handleGoogleAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.roles = action.payload.roles || [];
        state.isAuthenticated = true;
        state.lastChecked = Date.now();
        state.error = null;
      })
      .addCase(handleGoogleAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.roles = [];
        state.isAuthenticated = false;
        state.error = action.payload;
      })

      // Fetch All Users Cases (Admin)
      .addCase(fetchAllUsers.pending, (state) => {
        state.loadingUsers = true;
        state.usersError = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loadingUsers = false;
        state.allUsers = action.payload;
        state.usersError = null;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loadingUsers = false;
        state.usersError = action.payload;
        state.allUsers = [];
      });
  },
});

// Export actions and reducer
export const { logout, clearError, clearUsersError, invalidateAuth } =
  authSlice.actions;
export default authSlice.reducer;
