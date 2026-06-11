import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ridesService, { Ride, CreateRideData } from '@/services/rides.service';

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

export const fetchMyRides = createAsyncThunk(
  'rides/fetchMyRides',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ridesService.getUserRides();
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createRide = createAsyncThunk(
  'rides/createRide',
  async (data: CreateRideData, { rejectWithValue }) => {
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
  async (rideId: number, { rejectWithValue }) => {
    try {
      const response = await ridesService.join(rideId);
      if (response.success) return rideId;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const leaveRide = createAsyncThunk(
  'rides/leaveRide',
  async (rideId: number, { rejectWithValue }) => {
    try {
      const response = await ridesService.leave(rideId);
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
      .addCase(fetchMyRides.fulfilled, (state, action) => {
        state.myRides = action.payload;
      })
      .addCase(createRide.fulfilled, (state, action) => {
        state.rides.unshift(action.payload);
        state.filteredRides = filterRides(state);
      })
      .addCase(joinRide.fulfilled, (state, action) => {
        const ride = state.rides.find((r) => r.id === action.payload);
        if (ride && ride.availableSeats > 0) {
          ride.availableSeats -= 1;
          if (ride.availableSeats === 0) {
            ride.status = 'FULL';
          }
        }
      })
      .addCase(leaveRide.fulfilled, (state, action) => {
        const ride = state.rides.find((r) => r.id === action.payload);
        if (ride) {
          ride.availableSeats += 1;
          if (ride.status === 'FULL') {
            ride.status = 'OPEN';
          }
        }
      });
  },
});

function filterRides(state: RidesState): Ride[] {
  let filtered = [...state.rides];

  if (state.filters.from) {
    filtered = filtered.filter((ride) =>
      ride.pickupLocation.toLowerCase().includes(state.filters.from.toLowerCase())
    );
  }

  if (state.filters.to) {
    filtered = filtered.filter((ride) =>
      ride.dropLocation.toLowerCase().includes(state.filters.to.toLowerCase())
    );
  }

  if (state.filters.date) {
    filtered = filtered.filter((ride) =>
      ride.departureDateTime.startsWith(state.filters.date)
    );
  }

  return filtered;
}

export const { setFilters, clearFilters } = ridesSlice.actions;
export default ridesSlice.reducer;
