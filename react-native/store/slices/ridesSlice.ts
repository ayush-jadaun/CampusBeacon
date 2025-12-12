import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ridesService from '@/services/rides.service';

interface Ride {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seatsAvailable: number;
  totalSeats: number;
  pricePerSeat: number;
  vehicleType: string;
  driver: {
    name: string;
    phone: string;
  };
  participants: string[];
}

interface RidesState {
  rides: Ride[];
  filteredRides: Ride[];
  myRides: Ride[];
  isLoading: boolean;
  error: string | null;
  filters: {
    from: string;
    to: string;
    date: string;
  };
}

const initialState: RidesState = {
  rides: [],
  filteredRides: [],
  myRides: [],
  isLoading: false,
  error: null,
  filters: {
    from: '',
    to: '',
    date: '',
  },
};

export const fetchRides = createAsyncThunk(
  'rides/fetchRides',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ridesService.getAll();
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createRide = createAsyncThunk(
  'rides/createRide',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await ridesService.create(data);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinRide = createAsyncThunk(
  'rides/joinRide',
  async (rideId: string, { rejectWithValue }) => {
    try {
      const response = await ridesService.joinRide(rideId);
      if (response.success) return rideId;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const leaveRide = createAsyncThunk(
  'rides/leaveRide',
  async (rideId: string, { rejectWithValue }) => {
    try {
      const response = await ridesService.leaveRide(rideId);
      if (response.success) return rideId;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const ridesSlice = createSlice({
  name: 'rides',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.filteredRides = filterRides(state);
    },
    clearFilters: (state) => {
      state.filters = { from: '', to: '', date: '' };
      state.filteredRides = state.rides;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRides.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRides.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rides = action.payload;
        state.filteredRides = filterRides(state);
      })
      .addCase(fetchRides.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createRide.fulfilled, (state, action) => {
        state.rides.unshift(action.payload);
        state.filteredRides = filterRides(state);
      })
      .addCase(joinRide.fulfilled, (state, action) => {
        const ride = state.rides.find((r) => r.id === action.payload);
        if (ride && ride.seatsAvailable > 0) {
          ride.seatsAvailable -= 1;
        }
      })
      .addCase(leaveRide.fulfilled, (state, action) => {
        const ride = state.rides.find((r) => r.id === action.payload);
        if (ride) {
          ride.seatsAvailable += 1;
        }
      });
  },
});

function filterRides(state: RidesState): Ride[] {
  let filtered = [...state.rides];

  if (state.filters.from) {
    filtered = filtered.filter((ride) =>
      ride.from.toLowerCase().includes(state.filters.from.toLowerCase())
    );
  }

  if (state.filters.to) {
    filtered = filtered.filter((ride) =>
      ride.to.toLowerCase().includes(state.filters.to.toLowerCase())
    );
  }

  if (state.filters.date) {
    filtered = filtered.filter((ride) => ride.date === state.filters.date);
  }

  return filtered;
}

export const { setFilters, clearFilters } = ridesSlice.actions;
export default ridesSlice.reducer;
