import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import resourcesService, {
  Branch,
  Year,
  Subject,
  StudyMaterial,
} from '@/services/resources.service';

interface ResourcesState {
  branches: Branch[];
  years: Year[];
  subjects: Subject[];
  materials: StudyMaterial[];
  selectedBranch: Branch | null;
  selectedYear: Year | null;
  selectedSubject: Subject | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ResourcesState = {
  branches: [],
  years: [],
  subjects: [],
  materials: [],
  selectedBranch: null,
  selectedYear: null,
  selectedSubject: null,
  isLoading: false,
  error: null,
};

export const fetchBranches = createAsyncThunk(
  'resources/fetchBranches',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resourcesService.getBranches();
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchYears = createAsyncThunk(
  'resources/fetchYears',
  async (branchId: number, { rejectWithValue }) => {
    try {
      const response = await resourcesService.getYears();
      if (response.success) return response.data.filter((year) => year.branch_id === branchId);
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSubjects = createAsyncThunk(
  'resources/fetchSubjects',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resourcesService.getSubjects();
      if (response.success) return response.data;
      return rejectWithValue(response.message);
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMaterials = createAsyncThunk(
  'resources/fetchMaterials',
  async (
    { branchId, yearId, subjectId }: { branchId: number; yearId: number; subjectId?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await resourcesService.getMaterials();
      if (response.success)
        return response.data.filter(
          (material) =>
            material.branch_id === branchId &&
            material.year_id === yearId &&
            (subjectId === undefined || material.subject_id === subjectId)
        );
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
    setSelectedBranch: (state, action: PayloadAction<Branch | null>) => {
      state.selectedBranch = action.payload;
      state.selectedYear = null;
      state.selectedSubject = null;
      state.materials = [];
    },
    setSelectedYear: (state, action: PayloadAction<Year | null>) => {
      state.selectedYear = action.payload;
      state.selectedSubject = null;
    },
    setSelectedSubject: (state, action: PayloadAction<Subject | null>) => {
      state.selectedSubject = action.payload;
    },
    resetSelection: (state) => {
      state.selectedBranch = null;
      state.selectedYear = null;
      state.selectedSubject = null;
      state.years = [];
      state.materials = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.branches = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchYears.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchYears.fulfilled, (state, action) => {
        state.isLoading = false;
        state.years = action.payload;
      })
      .addCase(fetchYears.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.subjects = action.payload;
      })
      .addCase(fetchMaterials.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.materials = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadResource.fulfilled, (state, action) => {
        state.materials.unshift(action.payload);
      });
  },
});

export const { setSelectedBranch, setSelectedYear, setSelectedSubject, resetSelection } =
  resourcesSlice.actions;
export default resourcesSlice.reducer;
