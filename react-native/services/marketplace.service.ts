import api, { ApiResponse, LocalImage, toFormData } from '@/services/api';

export type ItemCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';

export interface MarketplaceItem {
  id: number;
  item_name: string;
  description: string | null;
  date_bought: string | null;
  owner_contact: string | null;
  price: number;
  image_url: string | null;
  userId: number;
  item_condition: ItemCondition;
  createdAt: string;
  updatedAt: string;
  users?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateMarketplaceData {
  item_name: string;
  description?: string;
  date_bought?: string;
  owner_contact?: string;
  item_condition: ItemCondition;
  price: number;
}

const marketplaceService = {
  // Get all items
  async getAll(): Promise<ApiResponse<MarketplaceItem[]>> {
    try {
      const response = await api.get('/buy-and-sell/items');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items');
    }
  },

  // Get my items (current user)
  async getMyItems(): Promise<ApiResponse<MarketplaceItem[]>> {
    try {
      const response = await api.get('/buy-and-sell/user/items');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch my items');
    }
  },

  // Get item by ID
  async getById(id: number): Promise<ApiResponse<MarketplaceItem>> {
    try {
      const response = await api.get(`/buy-and-sell/items/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item');
    }
  },

  // Create new item (backend expects multipart with optional "image" file)
  async create(data: CreateMarketplaceData, image?: LocalImage | null): Promise<ApiResponse<MarketplaceItem>> {
    try {
      const response = await api.post('/buy-and-sell/items', toFormData(data, image), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create item');
    }
  },

  // Update item
  async update(
    id: number,
    data: Partial<CreateMarketplaceData>,
    image?: LocalImage | null
  ): Promise<ApiResponse<MarketplaceItem>> {
    try {
      const response = await api.put(`/buy-and-sell/items/${id}`, toFormData(data, image), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update item');
    }
  },

  // Delete item
  async delete(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/buy-and-sell/items/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete item');
    }
  },
};

export default marketplaceService;
