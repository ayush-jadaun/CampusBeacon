import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import eventsService, { Club, Event, EventStatus, getEventStatus } from '@/services/events.service';

interface EventsState {
  events: Event[];
  filteredEvents: Event[];
  clubs: Club[];
  isLoading: boolean;
  error: string | null;
  eventFilter: EventStatus | 'all';
}

const initialState: EventsState = {
  events: [],
  filteredEvents: [],
  clubs: [],
  isLoading: false,
  error: null,
  eventFilter: 'upcoming',
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
      });
  },
});

function filterEvents(state: EventsState): Event[] {
  if (state.eventFilter === 'all') return state.events;
  return state.events.filter((event) => getEventStatus(event) === state.eventFilter);
}

export const { setEventFilter } = eventsSlice.actions;
export default eventsSlice.reducer;
