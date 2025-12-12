import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import marketplaceService from '@/services/marketplace.service';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  seller: {
    name: string;
    phone: string;
    email: string;
  };
  status: 'available' | 'sold';
  location: string;
  createdAt: string;
  updatedAt: string;
}

interface MarketplaceState {
  items: MarketplaceItem[];
  filteredItems: MarketplaceItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  categoryFilter: string;
  priceRange: { min: number; max: number };
  conditionFilter: string;
}

const initialState: MarketplaceState = {
  items: [],
  filteredItems: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  categoryFilter: 'All',
  priceRange: { min: 0, max: 100000 },
  conditionFilter: 'All',
};

// Async thunks
export const fetchMarketplaceItems = createAsyncThunk(
  'marketplace/fetchItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.getAll();
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createMarketplaceItem = createAsyncThunk(
  'marketplace/createItem',
  async (itemData: any, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.create(itemData);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const markAsSold = createAsyncThunk(
  'marketplace/markAsSold',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.markAsSold(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMarketplaceItem = createAsyncThunk(
  'marketplace/deleteItem',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.delete(id);
      if (response.success) {
        return id;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.filteredItems = filterItems(state);
    },
    setCategoryFilter: (state, action: PayloadAction<string>) => {
      state.categoryFilter = action.payload;
      state.filteredItems = filterItems(state);
    },
    setPriceRange: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.priceRange = action.payload;
      state.filteredItems = filterItems(state);
    },
    setConditionFilter: (state, action: PayloadAction<string>) => {
      state.conditionFilter = action.payload;
      state.filteredItems = filterItems(state);
    },
    clearFilters: (state) => {
      state.searchQuery = '';
      state.categoryFilter = 'All';
      state.priceRange = { min: 0, max: 100000 };
      state.conditionFilter = 'All';
      state.filteredItems = state.items;
    },
  },
  extraReducers: (builder) => {
    // Fetch items
    builder
      .addCase(fetchMarketplaceItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMarketplaceItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
        state.filteredItems = filterItems(state);
      })
      .addCase(fetchMarketplaceItems.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create item
    builder
      .addCase(createMarketplaceItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createMarketplaceItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items.unshift(action.payload);
        state.filteredItems = filterItems(state);
      })
      .addCase(createMarketplaceItem.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark as sold
    builder.addCase(markAsSold.fulfilled, (state, action) => {
      const item = state.items.find((item) => item.id === action.payload);
      if (item) {
        item.status = 'sold';
      }
      state.filteredItems = filterItems(state);
    });

    // Delete item
    builder.addCase(deleteMarketplaceItem.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.filteredItems = filterItems(state);
    });
  },
});

// Helper function to filter items
function filterItems(state: MarketplaceState): MarketplaceItem[] {
  let filtered = state.items.filter((item) => item.status === 'available');

  // Filter by category
  if (state.categoryFilter !== 'All') {
    filtered = filtered.filter((item) => item.category === state.categoryFilter);
  }

  // Filter by condition
  if (state.conditionFilter !== 'All') {
    filtered = filtered.filter((item) => item.condition === state.conditionFilter);
  }

  // Filter by price range
  filtered = filtered.filter(
    (item) => item.price >= state.priceRange.min && item.price <= state.priceRange.max
  );

  // Filter by search query
  if (state.searchQuery) {
    const query = state.searchQuery.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
    );
  }

  return filtered;
}

export const { setSearchQuery, setCategoryFilter, setPriceRange, setConditionFilter, clearFilters } =
  marketplaceSlice.actions;
export default marketplaceSlice.reducer;
