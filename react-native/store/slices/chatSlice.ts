import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import chatService, { ChatChannel, ChatMessage } from '@/services/chat.service';

interface ChatState {
  channels: ChatChannel[];
  activeChannelId: number | null;
  messages: Record<number, ChatMessage[]>; // channelId -> messages
  isLoading: boolean;
  error: string | null;
}

const initialState: ChatState = {
  channels: [],
  activeChannelId: null,
  messages: {},
  isLoading: false,
  error: null,
};

export const fetchMyChannels = createAsyncThunk(
  'chat/fetchMyChannels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatService.getMyChannels();
      if (response.success) return response.data;
      return rejectWithValue('Failed to fetch channels');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChannelMessages = createAsyncThunk(
  'chat/fetchChannelMessages',
  async ({ channelId, limit = 20, offset = 0 }: { channelId: number; limit?: number; offset?: number }, { rejectWithValue }) => {
    try {
      const response = await chatService.getChannelMessages(channelId, limit, offset);
      if (response.success) return { channelId, messages: response.data };
      return rejectWithValue('Failed to fetch messages');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ channelId, content, userId }: { channelId: number; content: string; userId: number }, { rejectWithValue }) => {
    try {
      const response = await chatService.sendMessage(channelId, content, userId);
      if (response.success) return { channelId, message: response.data };
      return rejectWithValue('Failed to send message');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createDirectChannel = createAsyncThunk(
  'chat/createDirectChannel',
  async ({ userId1, userId2 }: { userId1: number; userId2: number }, { rejectWithValue }) => {
    try {
      const response = await chatService.createDirectChannel(userId1, userId2);
      if (response.success) return response.data;
      return rejectWithValue('Failed to create direct channel');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChannel: (state, action: PayloadAction<number>) => {
      state.activeChannelId = action.payload;
    },
    addMessageToChannel: (state, action: PayloadAction<{ channelId: number; message: ChatMessage }>) => {
      const { channelId, message } = action.payload;
      if (!state.messages[channelId]) {
        state.messages[channelId] = [];
      }
      // Check if message already exists (to avoid duplicates from realtime)
      const exists = state.messages[channelId].some(m => m.id === message.id);
      if (!exists) {
        state.messages[channelId].push(message);
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Channels
      .addCase(fetchMyChannels.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyChannels.fulfilled, (state, action) => {
        state.isLoading = false;
        state.channels = action.payload;
      })
      .addCase(fetchMyChannels.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Channel Messages
      .addCase(fetchChannelMessages.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchChannelMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        const { channelId, messages } = action.payload;
        state.messages[channelId] = messages;
      })
      .addCase(fetchChannelMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Send Message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { channelId, message } = action.payload;
        if (message) {
          if (!state.messages[channelId]) {
            state.messages[channelId] = [];
          }
          state.messages[channelId].push(message);
        }
      })

      // Create Direct Channel
      .addCase(createDirectChannel.fulfilled, (state, action) => {
        if (action.payload) {
          state.channels.push(action.payload);
          state.activeChannelId = action.payload.id;
        }
      });
  },
});

export const { setActiveChannel, addMessageToChannel, clearError } = chatSlice.actions;
export default chatSlice.reducer;
