import api from '@/services/api';

export interface Subject {
  id: string;
  name: string;
  code: string;
  credits: number;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  date: string;
  status: 'present' | 'absent';
  createdAt: string;
}

export interface AttendanceStats {
  totalSubjects: number;
  overallPercentage: number;
  totalClasses: number;
  attendedClasses: number;
  subjects: Subject[];
}

const attendanceService = {
  // Get all subjects with attendance
  async getAttendance(): Promise<{ success: boolean; data: AttendanceStats }> {
    try {
      const response = await api.get('/attendance');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance');
    }
  },

  // Get subject details
  async getSubject(subjectId: string): Promise<{ success: boolean; data: Subject }> {
    try {
      const response = await api.get(`/attendance/subject/${subjectId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subject');
    }
  },

  // Mark attendance
  async markAttendance(data: {
    subjectId: string;
    status: 'present' | 'absent';
    date?: string;
  }): Promise<{ success: boolean; data: AttendanceRecord }> {
    try {
      const response = await api.post('/attendance', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark attendance');
    }
  },

  // Update attendance record
  async updateAttendance(
    recordId: string,
    data: { status: 'present' | 'absent' }
  ): Promise<{ success: boolean; data: AttendanceRecord }> {
    try {
      const response = await api.put(`/attendance/${recordId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update attendance');
    }
  },

  // Get attendance analytics
  async getAnalytics(): Promise<{ success: boolean; data: any }> {
    try {
      const response = await api.get('/attendance/analytics');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch analytics');
    }
  },
};

export default attendanceService;
