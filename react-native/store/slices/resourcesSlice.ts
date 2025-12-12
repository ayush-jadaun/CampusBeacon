import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import resourcesService from '@/services/resources.service';

interface Resource {
  id: string;
  title: string;
  type: string;
  subject: string;
  year: number;
  branch: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
}

interface ResourcesState {
  resources: Resource[];
  branches: string[];
  selectedBranch: string | null;
  selectedYear: number | null;
  selectedSubject: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  resources: [],
  branches: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'CHE'],
  selectedBranch: null,
  selectedYear: null,
  selectedSubject: null,
  isLoading: false,
  error: null,
};

export const fetchResourcesByBranch = createAsyncThunk(
  'resources/fetchByBranch',
  async (branch: string, { rejectWithValue }) => {
    try {
      const response = await resourcesService.getByBranch(branch);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchResourcesByYear = createAsyncThunk(
  'resources/fetchByYear',
  async ({ branch, year }: { branch: string; year: number }, { rejectWithValue }) => {
    try {
      const response = await resourcesService.getByYear(branch, year);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchResourcesBySubject = createAsyncThunk(
  'resources/fetchBySubject',
  async (
    { branch, year, subject }: { branch: string; year: number; subject: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await resourcesService.getBySubject(branch, year, subject);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadResource = createAsyncThunk(
  'resources/upload',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await resourcesService.upload(data);
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    setSelectedBranch: (state, action) => {
      state.selectedBranch = action.payload;
      state.selectedYear = null;
      state.selectedSubject = null;
    },
    setSelectedYear: (state, action) => {
      state.selectedYear = action.payload;
      state.selectedSubject = null;
    },
    setSelectedSubject: (state, action) => {
      state.selectedSubject = action.payload;
    },
    resetSelection: (state) => {
      state.selectedBranch = null;
      state.selectedYear = null;
      state.selectedSubject = null;
      state.resources = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResourcesByBranch.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchResourcesByBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resources = action.payload;
      })
      .addCase(fetchResourcesByBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchResourcesByYear.fulfilled, (state, action) => {
        state.resources = action.payload;
      })
      .addCase(fetchResourcesBySubject.fulfilled, (state, action) => {
        state.resources = action.payload;
      })
      .addCase(uploadResource.fulfilled, (state, action) => {
        state.resources.unshift(action.payload);
      });
  },
});

export const { setSelectedBranch, setSelectedYear, setSelectedSubject, resetSelection } =
  resourcesSlice.actions;
export default resourcesSlice.reducer;
