import api, { ApiResponse } from '@/services/api';

export interface Subject {
  subjectId: number;
  name: string;
  code: string;
  credits?: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

export interface AttendanceRecord {
  id: number;
  userId: number;
  subjectId: number;
  date: string;
  status: 'Present' | 'Absent';
  markedAt: string | null;
  createdAt: string;
  updatedAt: string;
  subject?: {
    id?: number;
    name: string;
    code: string;
  };
}

export interface SubjectAttendance {
  userId: number;
  subjectId: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

export interface OverallAttendance {
  userId: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
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
  async getAttendance(userId: string | number): Promise<ApiResponse<AttendanceStats>> {
    try {
      const response = await api.get('/attendance/percentage/subject-wise', {
        params: { userId },
      });
      const { data, ...rest } = response.data as ApiResponse<Subject[]>;
      const subjects = data || [];
      const totalClasses = subjects.reduce((sum, s) => sum + s.totalDays, 0);
      const attendedClasses = subjects.reduce((sum, s) => sum + s.presentDays, 0);
      return {
        ...rest,
        data: {
          totalSubjects: subjects.length,
          overallPercentage:
            totalClasses > 0
              ? parseFloat(((attendedClasses / totalClasses) * 100).toFixed(2))
              : 0,
          totalClasses,
          attendedClasses,
          subjects,
        },
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance');
    }
  },

  // Get raw attendance records
  async getRecords(params: {
    userId: string | number;
    subjectId?: string | number;
    date?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<AttendanceRecord[]>> {
    try {
      const response = await api.get('/attendance', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch attendance records');
    }
  },

  // Get attendance percentage for a subject
  async getSubjectAttendance(
    userId: string | number,
    subjectId: string | number
  ): Promise<ApiResponse<SubjectAttendance>> {
    try {
      const response = await api.get('/attendance/percentage', {
        params: { userId, subjectId },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subject attendance');
    }
  },

  // Get overall attendance percentage
  async getOverallAttendance(userId: string | number): Promise<ApiResponse<OverallAttendance>> {
    try {
      const response = await api.get('/attendance/percentage/overall', {
        params: { userId },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch overall attendance');
    }
  },

  // Mark attendance
  async markAttendance(data: {
    userId: string | number;
    subjectId: string | number;
    date: string;
    status: 'Present' | 'Absent';
  }): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const response = await api.post('/attendance', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to mark attendance');
    }
  },

  // Update attendance record
  async updateAttendance(
    recordId: string | number,
    data: { status: 'Present' | 'Absent' }
  ): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const response = await api.put(`/attendance/${recordId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update attendance');
    }
  },
};

export default attendanceService;
