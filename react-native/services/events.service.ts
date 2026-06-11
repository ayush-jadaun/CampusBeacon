import api from '@/services/api';

export interface Event {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  imageUrl: string;
  maxParticipants: number;
  registrationDeadline: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  createdAt: string;
  club?: {
    name: string;
    logo: string;
  };
  coordinators?: EventCoordinator[];
}

export interface EventCoordinator {
  id: string;
  eventId: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface Club {
  id: string;
  name: string;
  description: string;
  logo: string;
  category: string;
  email: string;
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  coordinators?: ClubCoordinator[];
}

export interface ClubCoordinator {
  id: string;
  clubId: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

const eventsService = {
  // Get all events
  async getAll(filters?: {
    status?: string;
    clubId?: string;
  }): Promise<{ success: boolean; data: Event[] }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.clubId) params.append('clubId', filters.clubId);

      const response = await api.get(`/events/events?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  },

  // Get event by ID
  async getById(id: string): Promise<{ success: boolean; data: Event }> {
    try {
      const response = await api.get(`/events/events/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
  },

  // Get all clubs
  async getClubs(): Promise<{ success: boolean; data: Club[] }> {
    try {
      const response = await api.get('/club');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clubs');
    }
  },

  // Get club by ID
  async getClubById(id: string): Promise<{ success: boolean; data: Club }> {
    try {
      const response = await api.get(`/club/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch club');
    }
  },

  // Get club coordinators
  async getClubCoordinators(clubId: string): Promise<{ success: boolean; data: ClubCoordinator[] }> {
    try {
      const response = await api.get(`/club/${clubId}/coordinators`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch coordinators');
    }
  },

  // Register for event
  async registerForEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post(`/events/events/${eventId}/register`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to register for event');
    }
  },

  // Unregister from event
  async unregisterFromEvent(eventId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/events/events/${eventId}/register`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to unregister from event');
    }
  },
};

export default eventsService;
