import api, { ApiResponse } from '@/services/api';

export interface Branch {
  branch_id: number;
  branch_name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Year {
  year_id: number;
  year_name: 'First Year' | 'Second Year' | 'Third Year' | 'Fourth Year';
  branch_id: number;
  createdAt: string;
  updatedAt: string;
  Branch?: Branch;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  credit: number | null;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyMaterial {
  material_id: number;
  title: string;
  material_type: 'Video' | 'PDF';
  material_url: string;
  subject_id: number;
  branch_id: number;
  year_id: number;
  createdAt: string;
  updatedAt: string;
}

const resourcesService = {
  // Get all branches
  async getBranches(): Promise<ApiResponse<Branch[]>> {
    try {
      const response = await api.get('/resources/branches');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch branches');
    }
  },

  // Get all years
  async getYears(): Promise<ApiResponse<Year[]>> {
    try {
      const response = await api.get('/resources/years');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch years');
    }
  },

  // Get all subjects
  async getSubjects(): Promise<ApiResponse<Subject[]>> {
    try {
      const response = await api.get('/resources/subjects');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subjects');
    }
  },

  // Get all study materials
  async getMaterials(): Promise<ApiResponse<StudyMaterial[]>> {
    try {
      const response = await api.get('/resources/study-materials');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch materials');
    }
  },

  // Upload study material
  async upload(data: FormData): Promise<ApiResponse<StudyMaterial>> {
    try {
      const response = await api.post('/resources/study-materials', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload material');
    }
  },
};

export default resourcesService;
