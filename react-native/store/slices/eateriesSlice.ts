import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eateriesService, { Eatery } from '@/services/eateries.service';

interface EateriesState {
  eateries: Eatery[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EateriesState = {
  eateries: [],
  isLoading: false,
  error: null,
};

export const fetchEateries = createAsyncThunk(
  'eateries/fetchEateries',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eateriesService.getAll();
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitRating = createAsyncThunk(
  'eateries/submitRating',
  async ({ eateryId, rating }: { eateryId: number; rating: number }, { rejectWithValue }) => {
    try {
      const response = await eateriesService.rate(eateryId, { rating });
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const eateriesSlice = createSlice({
  name: 'eateries',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEateries.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEateries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eateries = action.payload;
      })
      .addCase(fetchEateries.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(submitRating.fulfilled, (state, action) => {
        const index = state.eateries.findIndex((eatery) => eatery.id === action.payload.id);
        if (index !== -1) {
          state.eateries[index] = action.payload;
        }
      });
  },
});

export default eateriesSlice.reducer;
