import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceService from '@/services/attendance.service';

interface Subject {
  id: string;
  name: string;
  code: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  required: number;
  target: number;
}

interface AttendanceStats {
  overallPercentage: number;
  totalClasses: number;
  attendedClasses: number;
  subjects: Subject[];
}

interface AttendanceState {
  stats: AttendanceStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AttendanceState = {
  stats: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const response = await attendanceService.getAttendance();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addAttendance = createAsyncThunk(
  'attendance/addAttendance',
  async (data: { subjectId: string; date: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.addAttendance(data);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await attendanceService.updateAttendance(id, data);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendance: (state) => {
      state.stats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch attendance
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Add attendance
    builder
      .addCase(addAttendance.fulfilled, (state, action) => {
        if (state.stats) {
          state.stats = action.payload;
        }
      });

    // Update attendance
    builder
      .addCase(updateAttendance.fulfilled, (state, action) => {
        if (state.stats) {
          state.stats = action.payload;
        }
      });
  },
});

export const { clearAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
