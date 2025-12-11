import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config.url?.includes("/users/");
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      !window.location.pathname.includes("/login")
    ) {
      console.warn("Redirect to login due to 401 intercepted.");
    }
    return Promise.reject(error);
  }
);

export const fetchAttendanceRecords = createAsyncThunk(
  "attendance/fetchRecords",
  async (filters, { rejectWithValue }) => {
    if (!filters.date || !/^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
      console.error(
        "Invalid or missing date format in fetchAttendanceRecords filter:",
        filters.date
      );
    }
    try {
      const response = await api.get("/attendance", { params: filters });
      return response.data.data || [];
    } catch (error) {
      console.error("Fetch Attendance Error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch attendance records"
      );
    }
  }
);
export const updateAttendance = createAsyncThunk(
  "attendance/update",
  async ({ recordId, status }, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await api.put(`/attendance/${recordId}`, { status });
      toast.success(response.data.message || "Attendance updated!");

      const userId = getState().auth.user?.id;
      const updatedRecord = response.data.data;

      if (!updatedRecord) {
        console.error("Update Attendance Error: API did not return updated record data.");
        if (userId) {
          dispatch(fetchOverallPercentage(userId));
        }
        return response.data;
      }

      const subjectId = updatedRecord?.subjectId;
      const date = updatedRecord?.date;

      if (userId && subjectId && date && typeof date === 'string') {
        dispatch(fetchOverallPercentage(userId));
        dispatch(fetchSubjectWisePercentages(userId));
        dispatch(fetchAttendancePercentage({ userId, subjectId }));
        dispatch(fetchAttendanceRecords({ userId, subjectId, date }));
      } else {
        console.error("Update Attendance Warning: Missing data for detailed record refetch.", { userId, subjectId, date });
        if (userId) {
          dispatch(fetchOverallPercentage(userId));
        }
      }

      return updatedRecord;

    } catch (error) {
      console.error("Update Attendance API Error:", error.response?.data || error.message || error);
      const errorMsg = error.response?.data?.message || "Failed to update attendance";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const markAttendance = createAsyncThunk(
  "attendance/mark",
  async (attendanceData, { rejectWithValue, dispatch, getState }) => {
    try {
      const response = await api.post("/attendance", attendanceData);
      toast.success(response.data.message || "Attendance marked!");

      const userId = getState().auth.user?.id;
      const createdRecord = response.data.data;

      if (!createdRecord) {
        console.error("Mark Attendance Error: API did not return created record data.");
        if (userId) {
          dispatch(fetchOverallPercentage(userId));
        }
        return response.data;
      }

      const subjectId = createdRecord?.subjectId;
      const date = createdRecord?.date;

      if (userId && subjectId && date && typeof date === 'string') {
        dispatch(fetchOverallPercentage(userId));
        dispatch(fetchSubjectWisePercentages(userId));
        dispatch(fetchAttendancePercentage({ userId, subjectId }));
        dispatch(fetchAttendanceRecords({ userId, subjectId, date }));
      } else {
        console.error("Mark Attendance Warning: Missing data for detailed record refetch.", { userId, subjectId, date });
        if (userId) {
          dispatch(fetchOverallPercentage(userId));
        }
      }

      return createdRecord;

    } catch (error) {
      console.error("Mark Attendance API Error:", error.response?.data || error.message || error);
      const errorMsg = error.response?.data?.message || "Failed to mark attendance";
      toast.error(errorMsg);
      return rejectWithValue(errorMsg);
    }
  }
);

export const fetchAttendancePercentage = createAsyncThunk(
  "attendance/fetchPercentage",
  async ({ userId, subjectId }, { rejectWithValue }) => {
    if (!userId || !subjectId) {
      return rejectWithValue("User ID and Subject ID required.");
    }
    try {
      const response = await api.get("/attendance/percentage", {
        params: { userId, subjectId },
      });
      return response.data.data || null;
    } catch (error) {
      console.error("Fetch Specific Percentage Error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch subject percentage"
      );
    }
  }
);

export const fetchOverallPercentage = createAsyncThunk(
  "attendance/fetchOverallPercentage",
  async (userId, { rejectWithValue }) => {
    if (!userId) return rejectWithValue("User ID required.");
    try {
      const response = await api.get("/attendance/percentage/overall", {
        params: { userId },
      });
      return response.data.data || null;
    } catch (error) {
      console.error("Fetch Overall Percentage Error:", error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch overall percentage"
      );
    }
  }
);

export const fetchSubjectWisePercentages = createAsyncThunk(
  "attendance/fetchSubjectWisePercentages",
  async (userId, { rejectWithValue }) => {
    if (!userId) return rejectWithValue("User ID required.");
    try {
      const response = await api.get("/attendance/percentage/subject-wise", {
        params: { userId },
      });
      return response.data.data || [];
    } catch (error) {
      console.error(
        "Fetch Subject-Wise Percentages Error:",
        error.response?.data
      );
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to fetch subject-wise percentages"
      );
    }
  }
);

const initialState = {
  records: [],
  percentageData: null,
  loading: false,
  loadingPercentage: false,
  error: null,
  errorPercentage: null,
  overallPercentageData: null,
  subjectPercentageList: [],
  loadingOverall: false,
  errorOverall: null,
  loadingSubjectPercentages: false,
  errorSubjectPercentages: null,
};

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
      state.errorPercentage = null;
      state.errorOverall = null;
      state.errorSubjectPercentages = null;
    },
    resetAttendance: (state) => {
      Object.assign(state, initialState);
    },
    clearDetailedAttendance: (state) => {
      state.records = [];
      state.percentageData = null;
      state.loading = false;
      state.loadingPercentage = false;
      state.error = null;
      state.errorPercentage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchAttendanceRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.records = [];
      })
      .addCase(markAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAttendancePercentage.pending, (state) => {
        state.loadingPercentage = true;
        state.errorPercentage = null;
      })
      .addCase(fetchAttendancePercentage.fulfilled, (state, action) => {
        state.loadingPercentage = false;
        state.percentageData = action.payload;
      })
      .addCase(fetchAttendancePercentage.rejected, (state, action) => {
        state.loadingPercentage = false;
        state.errorPercentage = action.payload;
        state.percentageData = null;
      })
      .addCase(fetchOverallPercentage.pending, (state) => {
        state.loadingOverall = true;
        state.errorOverall = null;
      })
      .addCase(fetchOverallPercentage.fulfilled, (state, action) => {
        state.loadingOverall = false;
        state.overallPercentageData = action.payload;
      })
      .addCase(fetchOverallPercentage.rejected, (state, action) => {
        state.loadingOverall = false;
        state.errorOverall = action.payload;
        state.overallPercentageData = null;
      })
      .addCase(fetchSubjectWisePercentages.pending, (state) => {
        state.loadingSubjectPercentages = true;
        state.errorSubjectPercentages = null;
      })
      .addCase(fetchSubjectWisePercentages.fulfilled, (state, action) => {
        state.loadingSubjectPercentages = false;
        state.subjectPercentageList = action.payload || [];
      })
      .addCase(fetchSubjectWisePercentages.rejected, (state, action) => {
        state.loadingSubjectPercentages = false;
        state.errorSubjectPercentages = action.payload;
        state.subjectPercentageList = [];
      });
  },
});

export const {
  clearAttendanceError,
  resetAttendance,
  clearDetailedAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
