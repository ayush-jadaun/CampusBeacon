import api, { ApiResponse } from '@/services/api';

export interface RideUser {
  id: number;
  name: string;
  email: string;
}

export interface RideParticipant {
  id: number;
  rideId: number;
  userId: number;
  participant?: RideUser;
}

export interface Ride {
  id: number;
  creatorId: number;
  pickupLocation: string;
  dropLocation: string;
  departureDateTime: string;
  totalSeats: number;
  availableSeats: number;
  estimatedCost: number | null;
  status: 'OPEN' | 'FULL' | 'CANCELLED' | 'COMPLETED';
  description: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: RideUser;
  participants?: RideParticipant[];
}

export interface CreateRideData {
  pickupLocation: string;
  dropLocation: string;
  departureDateTime: string;
  totalSeats: number;
  estimatedCost?: number;
  description?: string;
  phoneNumber?: string;
}

const ridesService = {
  // Get all open rides
  async getAll(): Promise<ApiResponse<Ride[]>> {
    try {
      const response = await api.get('/rides');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch rides');
    }
  },

  // Get ride by ID
  async getById(id: number): Promise<ApiResponse<Ride>> {
    try {
      const response = await api.get(`/rides/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch ride');
    }
  },

  // Get current user's rides
  async getUserRides(): Promise<ApiResponse<Ride[]>> {
    try {
      const response = await api.get('/rides/user/rides');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user rides');
    }
  },

  // Create new ride
  async create(data: CreateRideData): Promise<ApiResponse<Ride>> {
    try {
      const response = await api.post('/rides', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create ride');
    }
  },

  // Join ride
  async join(rideId: number): Promise<ApiResponse<RideParticipant[]>> {
    try {
      const response = await api.post(`/rides/${rideId}/join`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to join ride');
    }
  },

  // Leave ride
  async leave(rideId: number): Promise<ApiResponse<RideParticipant[]>> {
    try {
      const response = await api.delete(`/rides/${rideId}/join`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to leave ride');
    }
  },

  // Delete ride
  async delete(id: number): Promise<ApiResponse<null>> {
    try {
      const response = await api.delete(`/rides/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete ride');
    }
  },
};

export default ridesService;
