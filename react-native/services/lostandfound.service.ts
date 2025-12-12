import api from '@/services/api';

export interface LostAndFoundItem {
  id: string;
  userId: string;
  itemType: string;
  itemName: string;
  description: string;
  location: string;
  date: string;
  status: 'lost' | 'found' | 'resolved';
  images: string[];
  contactInfo: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateLostAndFoundData {
  itemType: string;
  itemName: string;
  description: string;
  location: string;
  date: string;
  status: 'lost' | 'found';
  images?: string[];
  contactInfo: string;
}

const lostAndFoundService = {
  // Get all items
  async getAll(filters?: {
    status?: string;
    itemType?: string;
    search?: string;
  }): Promise<{ success: boolean; data: LostAndFoundItem[] }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.itemType) params.append('itemType', filters.itemType);
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get(`/lostandfound?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items');
    }
  },

  // Get item by ID
  async getById(id: string): Promise<{ success: boolean; data: LostAndFoundItem }> {
    try {
      const response = await api.get(`/lostandfound/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item');
    }
  },

  // Create new item
  async create(data: CreateLostAndFoundData): Promise<{ success: boolean; data: LostAndFoundItem }> {
    try {
      const response = await api.post('/lostandfound', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create item');
    }
  },

  // Update item
  async update(id: string, data: Partial<CreateLostAndFoundData>): Promise<{ success: boolean; data: LostAndFoundItem }> {
    try {
      const response = await api.put(`/lostandfound/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update item');
    }
  },

  // Delete item
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/lostandfound/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete item');
    }
  },
};

export default lostAndFoundService;
