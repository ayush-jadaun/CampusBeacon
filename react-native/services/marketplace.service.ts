import api from '@/services/api';

export interface MarketplaceItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images: string[];
  contactInfo: string;
  isSold: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateMarketplaceData {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  images?: string[];
  contactInfo: string;
}

const marketplaceService = {
  // Get all items
  async getAll(filters?: {
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<{ success: boolean; data: MarketplaceItem[] }> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) params.append('category', filters.category);
      if (filters?.condition) params.append('condition', filters.condition);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await api.get(`/buy-and-sell/items?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items');
    }
  },

  // Get my items (current user)
  async getMyItems(): Promise<{ success: boolean; data: MarketplaceItem[] }> {
    try {
      const response = await api.get('/buy-and-sell/user/items');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch my items');
    }
  },

  // Get item by ID
  async getById(id: string): Promise<{ success: boolean; data: MarketplaceItem }> {
    try {
      const response = await api.get(`/buy-and-sell/items/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item');
    }
  },

  // Create new item
  async create(data: CreateMarketplaceData): Promise<{ success: boolean; data: MarketplaceItem }> {
    try {
      const response = await api.post('/buy-and-sell/items', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create item');
    }
  },

  // Update item
  async update(id: string, data: Partial<CreateMarketplaceData>): Promise<{ success: boolean; data: MarketplaceItem }> {
    try {
      const response = await api.put(`/buy-and-sell/items/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update item');
    }
  },

  // Delete item
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/buy-and-sell/items/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete item');
    }
  },

  // Mark as sold
  async markAsSold(id: string): Promise<{ success: boolean; data: MarketplaceItem }> {
    try {
      const response = await api.put(`/buy-and-sell/items/${id}`, { isSold: true });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark as sold');
    }
  },
};

export default marketplaceService;
