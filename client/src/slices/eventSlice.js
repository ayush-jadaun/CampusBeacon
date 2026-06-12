import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

export const fetchEvents = createAsyncThunk(
  "events/fetchEvents",
  async (clubId = null, { rejectWithValue }) => {
    try {
      const url = clubId ? `/events/events?club_id=${clubId}` : "/events/events";
      const response = await api.get(url);
      return response.data.events;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch events";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchEventById = createAsyncThunk(
  "events/fetchEventById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/events/${id}`);
      return response.data.event;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch event";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const createEvent = createAsyncThunk(
  "events/createEvent",
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await api.post("/events/events", eventData);
      toast.success("Event created successfully");
      return response.data.event;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to create event";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  "events/updateEvent",
  async ({ id, eventData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/events/events/${id}`, eventData);
      toast.success("Event updated successfully");
      return response.data.event;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update event";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/deleteEvent",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/events/events/${id}`);
      toast.success("Event deleted successfully");
      return id;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to delete event";
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/* ----------------------------------------------------------------
   Event registrations (new endpoints — responses use the
   { statusCode, success, data, message } wrapper)
---------------------------------------------------------------- */

export const fetchRegistrationCounts = createAsyncThunk(
  "events/fetchRegistrationCounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/events/events/registrations/counts");
      return response.data?.data?.counts || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch registration counts"
      );
    }
  }
);

export const fetchMyRegistrations = createAsyncThunk(
  "events/fetchMyRegistrations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/events/events/registrations/me");
      return response.data?.data?.registrations || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch your registrations"
      );
    }
  }
);

export const registerForEvent = createAsyncThunk(
  "events/registerForEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/events/events/${eventId}/register`);
      const data = response.data?.data || {};
      toast.success("Registered for event");
      return { eventId, registrationCount: data.registrationCount };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to register for event";
      toast.error(message);
      return rejectWithValue({
        eventId,
        message,
        alreadyRegistered:
          error.response?.status === 409 && /already registered/i.test(message),
      });
    }
  }
);

export const unregisterFromEvent = createAsyncThunk(
  "events/unregisterFromEvent",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/events/events/${eventId}/register`);
      const data = response.data?.data || {};
      toast.success("Registration cancelled");
      return { eventId, registrationCount: data.registrationCount };
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to cancel registration";
      toast.error(message);
      return rejectWithValue({ eventId, message });
    }
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState: {
    events: [],
    currentEvent: null,
    loading: false,
    error: null,
    // event_id -> number of registrations
    registrationCounts: {},
    // event ids the logged-in user is registered for
    myRegistrations: [],
    // event_id -> true while a register/unregister request is in flight
    registering: {},
  },
  reducers: {
    clearEventError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.events = [];
      })
      .addCase(fetchEventById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentEvent = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.map((event) =>
          event.id === action.payload.id ? action.payload : event
        );
        if (state.currentEvent && state.currentEvent.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(
          (event) => event.id !== action.payload
        );
        if (state.currentEvent && state.currentEvent.id === action.payload) {
          state.currentEvent = null;
        }
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchRegistrationCounts.fulfilled, (state, action) => {
        const counts = {};
        for (const row of action.payload) {
          counts[row.event_id] = Number(row.count) || 0;
        }
        state.registrationCounts = counts;
      })
      .addCase(fetchMyRegistrations.fulfilled, (state, action) => {
        state.myRegistrations = action.payload.map((r) => r.event_id);
      })
      .addCase(fetchMyRegistrations.rejected, (state) => {
        state.myRegistrations = [];
      })
      .addCase(registerForEvent.pending, (state, action) => {
        state.registering[action.meta.arg] = true;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        const { eventId, registrationCount } = action.payload;
        delete state.registering[eventId];
        if (!state.myRegistrations.includes(eventId)) {
          state.myRegistrations.push(eventId);
        }
        if (registrationCount !== undefined && registrationCount !== null) {
          state.registrationCounts[eventId] = Number(registrationCount) || 0;
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        const eventId = action.payload?.eventId ?? action.meta.arg;
        delete state.registering[eventId];
        if (
          action.payload?.alreadyRegistered &&
          !state.myRegistrations.includes(eventId)
        ) {
          state.myRegistrations.push(eventId);
        }
      })
      .addCase(unregisterFromEvent.pending, (state, action) => {
        state.registering[action.meta.arg] = true;
      })
      .addCase(unregisterFromEvent.fulfilled, (state, action) => {
        const { eventId, registrationCount } = action.payload;
        delete state.registering[eventId];
        state.myRegistrations = state.myRegistrations.filter(
          (id) => id !== eventId
        );
        if (registrationCount !== undefined && registrationCount !== null) {
          state.registrationCounts[eventId] = Number(registrationCount) || 0;
        }
      })
      .addCase(unregisterFromEvent.rejected, (state, action) => {
        const eventId = action.payload?.eventId ?? action.meta.arg;
        delete state.registering[eventId];
      });
  },
});

export const { clearEventError } = eventSlice.actions;
export default eventSlice.reducer;
