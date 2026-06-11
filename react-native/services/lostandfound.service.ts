import api, { ApiResponse, LocalImage, toFormData } from '@/services/api';

export interface LostAndFoundItem {
  id: number;
  item_name: string;
  description: string | null;
  location_found: string | null;
  date_found: string | null;
  owner_contact: string | null;
  image_url: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLostAndFoundData {
  item_name: string;
  description?: string;
  location_found?: string;
  date_found?: string;
  owner_contact?: string;
}

const lostAndFoundService = {
  // Get all items
  async getAll(): Promise<ApiResponse<LostAndFoundItem[]>> {
    try {
      const response = await api.get('/lost-and-found/lost-items');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch items');
    }
  },

  // Get item by ID
  async getById(id: number): Promise<ApiResponse<LostAndFoundItem>> {
    try {
      const response = await api.get(`/lost-and-found/lost-items/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch item');
    }
  },

  // Create new item (backend expects multipart with optional "image" file)
  async create(data: CreateLostAndFoundData, image?: LocalImage | null): Promise<ApiResponse<LostAndFoundItem>> {
    try {
      const response = await api.post('/lost-and-found/lost-items', toFormData(data, image), {
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
    data: Partial<CreateLostAndFoundData>,
    image?: LocalImage | null
  ): Promise<ApiResponse<LostAndFoundItem>> {
    try {
      const response = await api.put(`/lost-and-found/lost-items/${id}`, toFormData(data, image), {
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
      const response = await api.delete(`/lost-and-found/lost-items/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete item');
    }
  },
};

export default lostAndFoundService;
