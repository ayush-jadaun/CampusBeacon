import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eateriesService from '@/services/eateries.service';

interface Eatery {
  id: string;
  name: string;
  type: string;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  location: string;
  phone: string;
  openingHours: {
    open: string;
    close: string;
  };
  menu: Array<{
    id: string;
    name: string;
    price: number;
    category: string;
  }>;
}

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
  async ({ eateryId, rating }: { eateryId: string; rating: number }, { rejectWithValue }) => {
    try {
      const response = await eateriesService.submitRating(eateryId, rating);
      if (response.success) return { eateryId, rating };
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
      });
  },
});

export default eateriesSlice.reducer;
