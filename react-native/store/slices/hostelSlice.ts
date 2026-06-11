import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import hostelService from '@/services/hostel.service';

interface HostelMenu {
  id: string;
  hostelId: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  items: string[];
}

interface Hostel {
  id: string;
  name: string;
  type: string;
}

interface HostelOfficial {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
}

interface HostelComplaint {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
}

interface HostelState {
  hostels: Hostel[];
  selectedHostel: string | null;
  menu: HostelMenu[];
  officials: HostelOfficial[];
  complaints: HostelComplaint[];
  isLoading: boolean;
  error: string | null;
}

const initialState: HostelState = {
  hostels: [],
  selectedHostel: null,
  menu: [],
  officials: [],
  complaints: [],
  isLoading: false,
  error: null,
};

export const fetchHostels = createAsyncThunk(
  'hostel/fetchHostels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await hostelService.getAll();
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessMenu = createAsyncThunk(
  'hostel/fetchMessMenu',
  async (hostelId: string, { rejectWithValue }) => {
    try {
      const response = await hostelService.getMenu(hostelId);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOfficials = createAsyncThunk(
  'hostel/fetchOfficials',
  async (hostelId: string, { rejectWithValue }) => {
    try {
      const response = await hostelService.getOfficials(hostelId);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitComplaint = createAsyncThunk(
  'hostel/submitComplaint',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await hostelService.submitComplaint(data);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const hostelSlice = createSlice({
  name: 'hostel',
  initialState,
  reducers: {
    setSelectedHostel: (state, action) => {
      state.selectedHostel = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHostels.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHostels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hostels = action.payload;
      })
      .addCase(fetchHostels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMessMenu.fulfilled, (state, action) => {
        state.menu = action.payload;
      })
      .addCase(fetchOfficials.fulfilled, (state, action) => {
        state.officials = action.payload;
      })
      .addCase(submitComplaint.fulfilled, (state, action) => {
        state.complaints.unshift(action.payload);
      });
  },
});

export const { setSelectedHostel } = hostelSlice.actions;
export default hostelSlice.reducer;
