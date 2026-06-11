import api from '@/services/api';

export interface HostelMenu {
  id: string;
  hostelId: string;
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
  items: string[];
  createdAt: string;
}

export interface HostelComplaint {
  id: string;
  userId: string;
  hostelId: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface HostelOfficial {
  id: string;
  hostelId: string;
  name: string;
  position: string;
  phone: string;
  email: string;
}

export interface Hostel {
  id: string;
  name: string;
  type: 'boys' | 'girls';
  warden: string;
  wardenContact: string;
}

const hostelService = {
  // Get all hostels
  async getAll(): Promise<{ success: boolean; data: Hostel[] }> {
    try {
      const response = await api.get('/hostels');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hostels');
    }
  },

  // Get hostel details
  async getById(id: string): Promise<{ success: boolean; data: Hostel }> {
    try {
      const response = await api.get(`/hostels/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hostel');
    }
  },

  // Get mess menu
  async getMenu(hostelId: string): Promise<{ success: boolean; data: HostelMenu[] }> {
    try {
      const response = await api.get(`/hostels/menus/hostel/${hostelId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch menu');
    }
  },

  // Get hostel officials
  async getOfficials(hostelId: string): Promise<{ success: boolean; data: HostelOfficial[] }> {
    try {
      const response = await api.get(`/hostels/officials/hostel/${hostelId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch officials');
    }
  },

  // Get complaints
  async getComplaints(hostelId: string): Promise<{ success: boolean; data: HostelComplaint[] }> {
    try {
      const response = await api.get(`/hostels/complaints/hostel/${hostelId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch complaints');
    }
  },

  // Submit complaint
  async submitComplaint(data: {
    hostelId: string;
    title: string;
    description: string;
    category: string;
  }): Promise<{ success: boolean; data: HostelComplaint }> {
    try {
      const response = await api.post('/hostels/complaints', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit complaint');
    }
  },
};

export default hostelService;
