import api, { ApiResponse } from '@/services/api';

export type MenuDay =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export interface Hostel {
  hostel_id: number;
  hostel_name: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostelMenu {
  menu_id: number;
  hostel_id: number;
  day: MenuDay;
  breakfast: string | null;
  lunch: string | null;
  snacks: string | null;
  dinner: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HostelOfficial {
  official_id: number;
  hostel_id: number;
  name: string;
  email: string;
  phone: number | string;
  designation: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostelComplaint {
  complaint_id: number;
  hostel_id: number;
  student_name: string;
  student_email: string;
  official_id: number | null;
  official_name: string;
  official_email: string;
  complaint_type: string;
  complaint_description: string;
  due_date: string;
  createdAt: string;
  updatedAt: string;
}

const hostelService = {
  // Get all hostels
  async getAll(): Promise<ApiResponse<Hostel[]>> {
    try {
      const response = await api.get('/hostels');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hostels');
    }
  },

  // Get hostel details
  async getById(id: number): Promise<ApiResponse<Hostel>> {
    try {
      const response = await api.get(`/hostels/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch hostel');
    }
  },

  // Get mess menu
  async getMenu(hostelId: number): Promise<ApiResponse<HostelMenu[]>> {
    try {
      const response = await api.get(`/hostels/menus/hostel/${hostelId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch menu');
    }
  },

  // Get hostel officials
  async getOfficials(hostelId: number): Promise<ApiResponse<HostelOfficial[]>> {
    try {
      const response = await api.get(`/hostels/officials/hostel/${hostelId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch officials');
    }
  },

  // Get complaints
  async getComplaints(hostelId: number): Promise<ApiResponse<HostelComplaint[]>> {
    try {
      const response = await api.get(`/hostels/complaints/hostel/${hostelId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch complaints');
    }
  },

  // Submit complaint
  async submitComplaint(data: {
    hostel_id: number;
    student_name: string;
    student_email: string;
    official_id: number;
    complaint_type: string;
    complaint_description: string;
    due_date: string;
  }): Promise<ApiResponse<HostelComplaint>> {
    try {
      const response = await api.post('/hostels/complaints', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to submit complaint');
    }
  },
};

export default hostelService;
