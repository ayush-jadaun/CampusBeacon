import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import eventsService from '@/services/events.service';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  club: {
    id: string;
    name: string;
    logo: string;
  };
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationRequired: boolean;
  maxParticipants: number;
  currentParticipants: number;
}

interface Club {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
  coordinators: Array<{
    name: string;
    phone: string;
    email: string;
  }>;
}

interface EventsState {
  events: Event[];
  filteredEvents: Event[];
  clubs: Club[];
  filteredClubs: Club[];
  isLoading: boolean;
  error: string | null;
  eventFilter: 'upcoming' | 'ongoing' | 'completed' | 'all';
  clubCategoryFilter: string;
}

const initialState: EventsState = {
  events: [],
  filteredEvents: [],
  clubs: [],
  filteredClubs: [],
  isLoading: false,
  error: null,
  eventFilter: 'upcoming',
  clubCategoryFilter: 'All',
};

export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventsService.getEvents();
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

export const registerForEvent = createAsyncThunk(
  'events/registerForEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await eventsService.registerForEvent(eventId);
      if (response.success) return eventId;
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
    setEventFilter: (state, action) => {
      state.eventFilter = action.payload;
      state.filteredEvents = filterEvents(state);
    },
    setClubCategoryFilter: (state, action) => {
      state.clubCategoryFilter = action.payload;
      state.filteredClubs = filterClubs(state);
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
        state.filteredClubs = filterClubs(state);
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        const event = state.events.find((e) => e.id === action.payload);
        if (event) {
          event.currentParticipants += 1;
        }
      });
  },
});

function filterEvents(state: EventsState): Event[] {
  if (state.eventFilter === 'all') return state.events;
  return state.events.filter((event) => event.status === state.eventFilter);
}

function filterClubs(state: EventsState): Club[] {
  if (state.clubCategoryFilter === 'All') return state.clubs;
  return state.clubs.filter((club) => club.category === state.clubCategoryFilter);
}

export const { setEventFilter, setClubCategoryFilter } = eventsSlice.actions;
export default eventsSlice.reducer;
