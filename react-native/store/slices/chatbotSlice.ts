import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatbotService, { ChatMessage, ChatResponse } from '@/services/chatbot.service';

interface ChatbotState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  lastResponse: ChatResponse | null;
}

const initialState: ChatbotState = {
  messages: [],
  isLoading: false,
  error: null,
  lastResponse: null,
};

export const sendMessage = createAsyncThunk(
  'chatbot/sendMessage',
  async (question: string, { rejectWithValue }) => {
    try {
      const response = await chatbotService.sendMessage(question);
      if (response.success) {
        return {
          question,
          response: response.data,
        };
      }
      return rejectWithValue('Failed to send message');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchChatHistory = createAsyncThunk(
  'chatbot/fetchChatHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatbotService.getChatHistory();
      if (response.success) return response.data;
      return rejectWithValue('Failed to fetch chat history');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const clearChatHistory = createAsyncThunk(
  'chatbot/clearChatHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatbotService.clearHistory();
      if (response.success) return true;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const provideFeedback = createAsyncThunk(
  'chatbot/provideFeedback',
  async (
    data: { question: string; answer: string; helpful: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await chatbotService.provideFeedback(data);
      if (response.success) return true;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const chatbotSlice = createSlice({
  name: 'chatbot',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addLocalMessage: (state, action) => {
      // Add message optimistically to UI before backend response
      const message: ChatMessage = {
        id: Date.now().toString(),
        question: action.payload.question,
        answer: '',
        timestamp: new Date().toISOString(),
      };
      state.messages.push(message);
    },
  },
  extraReducers: (builder) => {
    builder
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lastResponse = action.payload.response;

        // Add the message to history
        const message: ChatMessage = {
          id: Date.now().toString(),
          question: action.payload.question,
          answer: action.payload.response.answer,
          timestamp: new Date().toISOString(),
        };
        state.messages.push(message);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Fetch Chat History
      .addCase(fetchChatHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Clear Chat History
      .addCase(clearChatHistory.fulfilled, (state) => {
        state.messages = [];
        state.lastResponse = null;
        state.error = null;
      })
      .addCase(clearChatHistory.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, addLocalMessage } = chatbotSlice.actions;
export default chatbotSlice.reducer;
