import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import attendanceService, { AttendanceStats } from '@/services/attendance.service';

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

const getUserId = (state: unknown) =>
  (state as { auth: { user: { id: string } | null } }).auth.user?.id;

// Async thunks
export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (_, { getState, rejectWithValue }) => {
    try {
      const userId = getUserId(getState());
      if (!userId) {
        return rejectWithValue('User not authenticated');
      }
      const response = await attendanceService.getAttendance(userId);
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
  async (
    data: { subjectId: string | number; date: string; status: 'Present' | 'Absent' },
    { getState, rejectWithValue }
  ) => {
    try {
      const userId = getUserId(getState());
      if (!userId) {
        return rejectWithValue('User not authenticated');
      }
      const response = await attendanceService.markAttendance({ userId, ...data });
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      const statsResponse = await attendanceService.getAttendance(userId);
      if (statsResponse.success) {
        return statsResponse.data;
      }
      return rejectWithValue(statsResponse.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async (
    { id, data }: { id: string | number; data: { status: 'Present' | 'Absent' } },
    { getState, rejectWithValue }
  ) => {
    try {
      const userId = getUserId(getState());
      if (!userId) {
        return rejectWithValue('User not authenticated');
      }
      const response = await attendanceService.updateAttendance(id, data);
      if (!response.success) {
        return rejectWithValue(response.message);
      }
      const statsResponse = await attendanceService.getAttendance(userId);
      if (statsResponse.success) {
        return statsResponse.data;
      }
      return rejectWithValue(statsResponse.message);
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
        state.stats = action.payload;
      });

    // Update attendance
    builder
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { clearAttendance } = attendanceSlice.actions;
export default attendanceSlice.reducer;
