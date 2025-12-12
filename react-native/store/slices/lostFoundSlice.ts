import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import lostFoundService from '@/services/lostandfound.service';

interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'lost' | 'found';
  location: string;
  date: string;
  images: string[];
  contactInfo: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface LostFoundState {
  items: LostFoundItem[];
  filteredItems: LostFoundItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  statusFilter: 'all' | 'lost' | 'found';
  categoryFilter: string;
}

const initialState: LostFoundState = {
  items: [],
  filteredItems: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  statusFilter: 'all',
  categoryFilter: 'All',
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
  async (itemData: any, { rejectWithValue }) => {
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
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
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
  async (id: string, { rejectWithValue }) => {
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
    setStatusFilter: (state, action: PayloadAction<'all' | 'lost' | 'found'>) => {
      state.statusFilter = action.payload;
      state.filteredItems = filterItems(state);
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
      state.filteredItems = filterItems(state);
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.statusFilter = 'all';
      state.categoryFilter = 'All';
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
function filterItems(state: LostFoundState): LostFoundItem[] {
  let filtered = [...state.items];

  // Filter by status
  if (state.statusFilter !== 'all') {
    filtered = filtered.filter((item) => item.status === state.statusFilter);
  }

  // Filter by category
  if (state.categoryFilter !== 'All') {
    filtered = filtered.filter((item) => item.category === state.categoryFilter);
  }

  // Filter by search query
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
    );
  }

  return filtered;
}

export const { setSearchQuery, setStatusFilter, setCategoryFilter, clearFilters } =
  lostFoundSlice.actions;
export default lostFoundSlice.reducer;
