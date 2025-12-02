const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface TeacherDashboardStats {
  totalModules: number;
  publishedModules: number;
  totalStudents: number;
  todayClasses: number;
  pendingGrading: number;
  recentEnrollments: number;
  enrollmentChange: {
    value: number;
    type: 'increase' | 'decrease';
  };
}

export interface UpcomingClass {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string | null;
  status: string;
  subject: string;
  module: string | null;
  className: string;
  meetingLink: string | null;
  youtubeUrl: string | null;
  attendanceCount: number;
}

export interface TeacherActivity {
  id: string;
  type: 'enrollment' | 'submission' | 'class';
  title: string;
  description: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  metadata: any;
}

export interface ModulePerformance {
  id: string;
  title: string;
  enrollments: number;
  reviews: number;
  averageRating: number;
  thumbnail: string | null;
}

export const teacherDashboardApiService = {
  /**
   * Get teacher dashboard statistics
   */
  async getStats(): Promise<TeacherDashboardStats> {
    const token = localStorage.getItem('teacher_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/teacher/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Teacher dashboard stats error:', errorData);
      throw new Error(errorData.message || `Failed to fetch dashboard stats (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get upcoming classes
   */
  async getUpcomingClasses(limit: number = 5): Promise<UpcomingClass[]> {
    const token = localStorage.getItem('teacher_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/teacher/dashboard/upcoming-classes?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch upcoming classes (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(limit: number = 10): Promise<TeacherActivity[]> {
    const token = localStorage.getItem('teacher_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/teacher/dashboard/recent-activity?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch recent activity (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get module performance
   */
  async getModulePerformance(): Promise<ModulePerformance[]> {
    const token = localStorage.getItem('teacher_token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/teacher/dashboard/module-performance`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch module performance (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },
};
