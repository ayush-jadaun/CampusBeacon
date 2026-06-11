import api, { ApiResponse } from '@/services/api';

export interface Eatery {
  id: number;
  name: string;
  location: string;
  description: string | null;
  phoneNumber: string | null;
  openingTime: string | null;
  closingTime: string | null;
  rating: number | null;
  menuImageUrl: string | null;
  totalRatings: number;
  ratingSum: number;
  createdAt: string;
  updatedAt: string;
}

const eateriesService = {
  // Get all eateries
  async getAll(): Promise<ApiResponse<Eatery[]>> {
    try {
      const response = await api.get('/eateries');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch eateries');
    }
  },

  // Get eatery by ID
  async getById(id: number): Promise<ApiResponse<Eatery>> {
    try {
      const response = await api.get(`/eateries/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch eatery');
    }
  },

  // Rate eatery
  async rate(eateryId: number, data: {
    rating: number;
  }): Promise<ApiResponse<Eatery>> {
    try {
      const response = await api.post(`/eateries/${eateryId}/rate`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to rate eatery');
    }
  },
};

export default eateriesService;
