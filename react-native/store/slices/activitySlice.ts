import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import activityService, { RecentActivity } from '@/services/activity.service';

interface ActivityState {
  activities: RecentActivity[];
  isLoading: boolean;
  error: string | null;
  lastFetch: number | null;
}

const initialState: ActivityState = {
  activities: [],
  isLoading: false,
  error: null,
  lastFetch: null,
};

export const fetchRecentActivities = createAsyncThunk(
  'activity/fetchRecentActivities',
  async (limit: number = 10, { rejectWithValue }) => {
    try {
      const response = await activityService.getRecentActivities(limit);
      if (response.success) return response.data;
      return rejectWithValue('Failed to fetch recent activities');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearActivities: (state) => {
      state.activities = [];
      state.lastFetch = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activities = action.payload;
        state.lastFetch = Date.now();
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearActivities } = activitySlice.actions;
export default activitySlice.reducer;
