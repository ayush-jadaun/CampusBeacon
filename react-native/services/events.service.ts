import api, { ApiResponse } from '@/services/api';

export interface Event {
  id: number;
  name: string;
  description: string;
  images: string[] | null;
  videos: string[] | null;
  social_media_links: string[] | null;
  club_id: number;
  date: string;
  location: string;
  createdAt: string;
  updatedAt: string;
  club?: {
    id: number;
    name: string;
  };
  coordinators?: Coordinator[];
}

export type EventStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Club {
  id: number;
  name: string;
  description: string | null;
  images: string[] | null;
  social_media_links: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface Coordinator {
  id: number;
  name: string;
  designation: string;
  images: string[] | null;
  contact: string | number | null;
  social_media_links: string[] | null;
  club_id?: number;
  club?: {
    id: number;
    name: string;
  };
}

export function getEventStatus(event: Event): EventStatus {
  const eventDate = new Date(event.date);
  const now = new Date();
  if (eventDate.toDateString() === now.toDateString()) return 'ongoing';
  return eventDate > now ? 'upcoming' : 'completed';
}

const eventsService = {
  // Get all events
  async getAll(filters?: {
    status?: string;
    clubId?: string;
  }): Promise<ApiResponse<Event[]>> {
    try {
      const params = new URLSearchParams();
      if (filters?.clubId) params.append('club_id', filters.clubId);

      const response = await api.get(`/events/events?${params.toString()}`);
      const { success, events, message } = response.data;
      let data: Event[] = events ?? [];
      if (filters?.status && filters.status !== 'all') {
        data = data.filter((event) => getEventStatus(event) === filters.status);
      }
      return { success, data, message };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch events');
    }
  },

  // Get event by ID
  async getById(id: number): Promise<ApiResponse<Event>> {
    try {
      const response = await api.get(`/events/events/${id}`);
      const { success, event, message } = response.data;
      return { success, data: event, message };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch event');
    }
  },

  // Get all clubs
  async getClubs(): Promise<ApiResponse<Club[]>> {
    try {
      const response = await api.get('/club/clubs');
      const { success, clubs, message } = response.data;
      return { success, data: clubs ?? [], message };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clubs');
    }
  },

  // Get club by ID
  async getClubById(id: number): Promise<ApiResponse<Club>> {
    try {
      const response = await api.get(`/club/clubs/${id}`);
      const { success, club, message } = response.data;
      return { success, data: club, message };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch club');
    }
  },

  // Get club coordinators
  async getClubCoordinators(clubId: number): Promise<ApiResponse<Coordinator[]>> {
    try {
      const response = await api.get(`/coordinator/coordinators?club_id=${clubId}`);
      const { success, coordinators, message } = response.data;
      return { success, data: coordinators ?? [], message };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch coordinators');
    }
  },
};

export default eventsService;
