import api from '@/services/api';

export interface Branch {
  id: string;
  name: string;
  code: string;
}

export interface Year {
  id: string;
  branchId: string;
  year: number;
  name: string;
}

export interface StudyMaterial {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  uploadedBy: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

const resourcesService = {
  // Get all branches
  async getBranches(): Promise<{ success: boolean; data: Branch[] }> {
    try {
      const response = await api.get('/resource/branches');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch branches');
    }
  },

  // Get years for a branch
  async getYears(branchId: string): Promise<{ success: boolean; data: Year[] }> {
    try {
      const response = await api.get(`/resource/branch/${branchId}/years`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch years');
    }
  },

  // Get subjects for a year
  async getSubjects(yearId: string): Promise<{ success: boolean; data: any[] }> {
    try {
      const response = await api.get(`/resource/year/${yearId}/subjects`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subjects');
    }
  },

  // Get study materials for a subject
  async getMaterials(subjectId: string): Promise<{ success: boolean; data: StudyMaterial[] }> {
    try {
      const response = await api.get(`/resource/subject/${subjectId}/materials`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch materials');
    }
  },

  // Upload study material
  async upload(data: FormData): Promise<{ success: boolean; data: StudyMaterial }> {
    try {
      const response = await api.post('/resource/upload', data, {
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
