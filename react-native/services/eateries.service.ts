import api from '@/services/api';

export interface Eatery {
  id: string;
  name: string;
  description: string;
  location: string;
  type: string;
  openingTime: string;
  closingTime: string;
  imageUrl: string;
  menu: MenuItem[];
  rating: number;
  totalReviews: number;
  contactNumber: string;
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
  description?: string;
}

export interface EateryRating {
  id: string;
  eateryId: string;
  userId: string;
  rating: number;
  review: string;
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

const eateriesService = {
  // Get all eateries
  async getAll(): Promise<{ success: boolean; data: Eatery[] }> {
    try {
      const response = await api.get('/eateries');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch eateries');
    }
  },

  // Get eatery by ID
  async getById(id: string): Promise<{ success: boolean; data: Eatery }> {
    try {
      const response = await api.get(`/eateries/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch eatery');
    }
  },

  // Rate eatery
  async rate(eateryId: string, data: {
    rating: number;
    review: string;
  }): Promise<{ success: boolean; data: EateryRating }> {
    try {
      const response = await api.post(`/eateries/${eateryId}/rate`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to rate eatery');
    }
  },
};

export default eateriesService;
