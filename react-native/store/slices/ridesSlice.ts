import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ridesService, { Ride, CreateRideData, RideParticipant } from '@/services/rides.service';

interface RidesState {
  rides: Ride[];
  filteredRides: Ride[];
  myRides: Ride[];
  isLoading: boolean;
  isCreating: boolean;
  actionRideId: number | null;
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
  isCreating: false,
  actionRideId: null,
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
      if (response.success) return { rideId, participants: response.data };
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
      if (response.success) return { rideId, participants: response.data };
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
      .addCase(createRide.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createRide.fulfilled, (state, action) => {
        state.isCreating = false;
        state.rides.unshift(action.payload);
        state.filteredRides = filterRides(state);
      })
      .addCase(createRide.rejected, (state) => {
        state.isCreating = false;
      })
      .addCase(joinRide.pending, (state, action) => {
        state.actionRideId = action.meta.arg;
      })
      .addCase(joinRide.fulfilled, (state, action) => {
        state.actionRideId = null;
        applyParticipants(state, action.payload.rideId, action.payload.participants);
      })
      .addCase(joinRide.rejected, (state) => {
        state.actionRideId = null;
      })
      .addCase(leaveRide.pending, (state, action) => {
        state.actionRideId = action.meta.arg;
      })
      .addCase(leaveRide.fulfilled, (state, action) => {
        state.actionRideId = null;
        applyParticipants(state, action.payload.rideId, action.payload.participants);
      })
      .addCase(leaveRide.rejected, (state) => {
        state.actionRideId = null;
      });
  },
});

function applyParticipants(state: RidesState, rideId: number, participants: RideParticipant[]) {
  for (const list of [state.rides, state.filteredRides, state.myRides]) {
    const ride = list.find((r) => r.id === rideId);
    if (ride) {
      ride.participants = participants;
      ride.availableSeats = Math.max(ride.totalSeats - participants.length, 0);
      if (ride.status === 'OPEN' && ride.availableSeats === 0) {
        ride.status = 'FULL';
      } else if (ride.status === 'FULL' && ride.availableSeats > 0) {
        ride.status = 'OPEN';
      }
    }
  }
}

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
