import api from '@/services/api';

export interface Ride {
  id: string;
  userId: string;
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat: number;
  vehicleType: string;
  description: string;
  status: 'active' | 'completed' | 'cancelled';
  participants: RideParticipant[];
  createdAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface RideParticipant {
  id: string;
  rideId: string;
  userId: string;
  seatsBooked: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  user?: {
    firstName: string;
    lastName: string;
  };
}

export interface CreateRideData {
  from: string;
  to: string;
  date: string;
  time: string;
  availableSeats: number;
  pricePerSeat: number;
  vehicleType: string;
  description: string;
}

const ridesService = {
  // Get all rides
  async getAll(filters?: {
    from?: string;
    to?: string;
    date?: string;
  }): Promise<{ success: boolean; data: Ride[] }> {
    try {
      const params = new URLSearchParams();
      if (filters?.from) params.append('from', filters.from);
      if (filters?.to) params.append('to', filters.to);
      if (filters?.date) params.append('date', filters.date);

      const response = await api.get(`/ride?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch rides');
    }
  },

  // Get ride by ID
  async getById(id: string): Promise<{ success: boolean; data: Ride }> {
    try {
      const response = await api.get(`/ride/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch ride');
    }
  },

  // Create new ride
  async create(data: CreateRideData): Promise<{ success: boolean; data: Ride }> {
    try {
      const response = await api.post('/ride', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create ride');
    }
  },

  // Join ride
  async join(rideId: string, seatsBooked: number): Promise<{ success: boolean; data: RideParticipant }> {
    try {
      const response = await api.post(`/ride/${rideId}/join`, { seatsBooked });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to join ride');
    }
  },

  // Leave ride
  async leave(rideId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/ride/${rideId}/leave`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to leave ride');
    }
  },

  // Delete ride
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/ride/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete ride');
    }
  },
};

export default ridesService;
