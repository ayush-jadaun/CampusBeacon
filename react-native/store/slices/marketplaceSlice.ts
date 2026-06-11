import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LocalImage } from '@/services/api';
import marketplaceService, {
  MarketplaceItem,
  CreateMarketplaceData,
} from '@/services/marketplace.service';

interface MarketplaceState {
  items: MarketplaceItem[];
  filteredItems: MarketplaceItem[];
  myListings: MarketplaceItem[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  priceRange: { min: number; max: number };
  conditionFilter: string;
}

const initialState: MarketplaceState = {
  items: [],
  filteredItems: [],
  myListings: [],
  isLoading: false,
  error: null,
  searchQuery: '',
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

export const fetchMyListings = createAsyncThunk(
  'marketplace/fetchMyListings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await marketplaceService.getMyItems();
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
  async (
    { data, image }: { data: CreateMarketplaceData; image?: LocalImage | null },
    { rejectWithValue }
  ) => {
    try {
      const response = await marketplaceService.create(data, image);
      if (response.success) {
        return response.data;
      }
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMarketplaceItem = createAsyncThunk(
  'marketplace/deleteItem',
  async (id: number, { rejectWithValue }) => {
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

    // Fetch my listings
    builder
      .addCase(fetchMyListings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyListings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myListings = action.payload;
      })
      .addCase(fetchMyListings.rejected, (state, action) => {
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

    // Delete item
    builder.addCase(deleteMarketplaceItem.fulfilled, (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.filteredItems = filterItems(state);
    });
  },
});

// Helper function to filter items
function filterItems(state: MarketplaceState): MarketplaceItem[] {
  let filtered = [...state.items];

  // Filter by condition
  if (state.conditionFilter !== 'All') {
    filtered = filtered.filter((item) => item.item_condition === state.conditionFilter);
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
        item.item_name.toLowerCase().includes(query) ||
        (item.description ?? '').toLowerCase().includes(query)
    );
  }

  return filtered;
}

export const { setSearchQuery, setPriceRange, setConditionFilter, clearFilters } =
  marketplaceSlice.actions;
export default marketplaceSlice.reducer;
