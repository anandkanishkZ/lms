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
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get enrollment growth data
   */
  async getEnrollmentGrowth(): Promise<EnrollmentGrowthData[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard/enrollment-growth`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch enrollment growth data');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get course distribution data
   */
  async getCourseDistribution(): Promise<CourseDistribution[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard/course-distribution`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch course distribution');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(): Promise<RecentActivity[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard/recent-activity`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch recent activity');
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get activity chart data
   */
  async getActivityChart(): Promise<ActivityChartData[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/analytics/dashboard/activity-chart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch activity chart data');
    }

    const result = await response.json();
    return result.data;
  },
};
