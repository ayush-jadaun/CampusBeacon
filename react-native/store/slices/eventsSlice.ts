import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import eventsService, { Club, Event, EventStatus, getEventStatus } from '@/services/events.service';

interface EventsState {
  events: Event[];
  filteredEvents: Event[];
  clubs: Club[];
  isLoading: boolean;
  error: string | null;
  eventFilter: EventStatus | 'all';
  registeredEventIds: number[];
  registrationCounts: Record<number, number>;
  registeringEventId: number | null;
}

const initialState: EventsState = {
  events: [],
  filteredEvents: [],
  clubs: [],
  isLoading: false,
  error: null,
  eventFilter: 'upcoming',
  registeredEventIds: [],
  registrationCounts: {},
  registeringEventId: null,
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventsService.getAll();
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchClubs = createAsyncThunk(
  'events/fetchClubs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventsService.getClubs();
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyRegistrations = createAsyncThunk(
  'events/fetchMyRegistrations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventsService.getMyRegistrations();
      if (response.success) return response.data.registrations.map((r) => r.event_id);
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchRegistrationCounts = createAsyncThunk(
  'events/fetchRegistrationCounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventsService.getRegistrationCounts();
      if (response.success) {
        const counts: Record<number, number> = {};
        response.data.counts.forEach((c) => {
          counts[c.event_id] = Number(c.count);
        });
        return counts;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerForEvent = createAsyncThunk(
  'events/registerForEvent',
  async (eventId: number, { rejectWithValue }) => {
    try {
      const response = await eventsService.register(eventId);
      if (response.success) {
        return { eventId, registrationCount: response.data.registrationCount };
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const unregisterFromEvent = createAsyncThunk(
  'events/unregisterFromEvent',
  async (eventId: number, { rejectWithValue }) => {
    try {
      const response = await eventsService.unregister(eventId);
      if (response.success) {
        return { eventId, registrationCount: response.data.registrationCount };
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    setEventFilter: (state, action: PayloadAction<EventStatus | 'all'>) => {
      state.eventFilter = action.payload;
      state.filteredEvents = filterEvents(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
        state.filteredEvents = filterEvents(state);
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchClubs.fulfilled, (state, action) => {
        state.clubs = action.payload;
      })
      .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
        state.registeredEventIds = action.payload;
      })
      .addCase(fetchRegistrationCounts.fulfilled, (state, action) => {
        state.registrationCounts = action.payload;
      })
      .addCase(registerForEvent.pending, (state, action) => {
        state.registeringEventId = action.meta.arg;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.registeringEventId = null;
        if (!state.registeredEventIds.includes(action.payload.eventId)) {
          state.registeredEventIds.push(action.payload.eventId);
        }
        state.registrationCounts[action.payload.eventId] = action.payload.registrationCount;
      })
      .addCase(registerForEvent.rejected, (state) => {
        state.registeringEventId = null;
      })
      .addCase(unregisterFromEvent.pending, (state, action) => {
        state.registeringEventId = action.meta.arg;
      })
      .addCase(unregisterFromEvent.fulfilled, (state, action) => {
        state.registeringEventId = null;
        state.registeredEventIds = state.registeredEventIds.filter(
          (id) => id !== action.payload.eventId
        );
        state.registrationCounts[action.payload.eventId] = action.payload.registrationCount;
      })
      .addCase(unregisterFromEvent.rejected, (state) => {
        state.registeringEventId = null;
      });
  },
});

function filterEvents(state: EventsState): Event[] {
  if (state.eventFilter === 'all') return state.events;
  return state.events.filter((event) => getEventStatus(event) === state.eventFilter);
}

export const { setEventFilter } = eventsSlice.actions;
export default eventsSlice.reducer;
