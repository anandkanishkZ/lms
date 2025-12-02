const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  activeModules: number;
  liveClassesToday: number;
  changes: {
    students: {
      value: number;
      type: 'increase' | 'decrease';
    };
    teachers: {
      value: number;
      type: 'increase' | 'decrease';
    };
    modules: {
      value: number;
      type: 'increase' | 'decrease';
    };
    liveClasses: {
      value: number;
      type: 'increase' | 'decrease';
    };
  };
}

export interface EnrollmentGrowthData {
  month: string;
  students: number;
  teachers: number;
}

export interface CourseDistribution {
  name: string;
  value: number;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: 'enrollment' | 'class' | 'notice';
  title: string;
  description: string;
  timestamp: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ActivityChartData {
  date: string;
  enrollments: number;
  classes: number;
  exams: number;
}

export const dashboardApiService = {
  /**
   * Get dashboard statistics
   */
  async getStats(): Promise<DashboardStats> {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/analytics/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Dashboard stats error:', errorData);
      throw new Error(errorData.message || `Failed to fetch dashboard stats (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get enrollment growth data
   */
  async getEnrollmentGrowth(): Promise<EnrollmentGrowthData[]> {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/analytics/dashboard/enrollment-growth`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch enrollment growth data (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get course distribution data
   */
  async getCourseDistribution(): Promise<CourseDistribution[]> {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/analytics/dashboard/course-distribution`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch course distribution (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(): Promise<RecentActivity[]> {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/analytics/dashboard/recent-activity`, {
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
   * Get activity chart data
   */
  async getActivityChart(): Promise<ActivityChartData[]> {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/analytics/dashboard/activity-chart`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch activity chart data (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },
};
