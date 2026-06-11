import api from '@/services/api';

export interface Enrollment {
  id: string;
  userId: string;
  eventId: string;
  status: 'enrolled' | 'waitlisted' | 'cancelled';
  enrolledAt: string;
  event?: {
    id: string;
    title: string;
    date: string;
    location: string;
  };
}

const enrollmentService = {
  // Get user's enrollments
  async getMyEnrollments(): Promise<{ success: boolean; data: Enrollment[] }> {
    try {
      const response = await api.get('/enrollments');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch enrollments');
    }
  },

  // Enroll in event
  async enrollInEvent(eventId: string): Promise<{ success: boolean; data: Enrollment }> {
    try {
      const response = await api.post('/enrollments', { eventId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to enroll in event');
    }
  },

  // Cancel enrollment
  async cancelEnrollment(enrollmentId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel enrollment');
    }
  },

  // Check enrollment status
  async checkEnrollmentStatus(eventId: string): Promise<{ success: boolean; enrolled: boolean; enrollment?: Enrollment }> {
    try {
      const response = await api.get(`/enrollments/check/${eventId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check enrollment status');
    }
  },
};

export default enrollmentService;
