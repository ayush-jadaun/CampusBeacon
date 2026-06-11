import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import lostFoundService, {
  LostAndFoundItem,
  CreateLostAndFoundData,
} from '@/services/lostandfound.service';

interface LostFoundState {
  items: LostAndFoundItem[];
  filteredItems: LostAndFoundItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: LostFoundState = {
  items: [],
  filteredItems: [],
  isLoading: false,
  error: null,
  searchQuery: '',
};

// Async thunks
export const fetchLostFoundItems = createAsyncThunk(
  'lostFound/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await lostFoundService.getAll();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createLostFoundItem = createAsyncThunk(
  'lostFound/createItem',
  async (itemData: CreateLostAndFoundData, { rejectWithValue }) => {
    try {
      const response = await lostFoundService.create(itemData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLostFoundItem = createAsyncThunk(
  'lostFound/updateItem',
  async (
    { id, data }: { id: number; data: Partial<CreateLostAndFoundData> },
    { rejectWithValue }
  ) => {
    try {
      const response = await lostFoundService.update(id, data);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLostFoundItem = createAsyncThunk(
  'lostFound/deleteItem',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await lostFoundService.delete(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const lostFoundSlice = createSlice({
  name: 'lostFound',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredItems = filterItems(state);
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.filteredItems = state.items;
    },
  },
  extraReducers: (builder) => {
    // Fetch items
    builder
      .addCase(fetchLostFoundItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLostFoundItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = filterItems(state);
      })
      .addCase(fetchLostFoundItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create item
    builder
      .addCase(createLostFoundItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createLostFoundItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.filteredItems = filterItems(state);
      })
      .addCase(createLostFoundItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update item
    builder
      .addCase(updateLostFoundItem.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.filteredItems = filterItems(state);
      });

    // Delete item
    builder
      .addCase(deleteLostFoundItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.filteredItems = filterItems(state);
      });
  },
});

// Helper function to filter items
function filterItems(state: LostFoundState): LostAndFoundItem[] {
  let filtered = [...state.items];

  // Filter by search query
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.item_name.toLowerCase().includes(query) ||
        (item.description ?? '').toLowerCase().includes(query) ||
        (item.location_found ?? '').toLowerCase().includes(query)
    );
  }

  return filtered;
}

export const { setSearchQuery, clearFilters } = lostFoundSlice.actions;
export default lostFoundSlice.reducer;
