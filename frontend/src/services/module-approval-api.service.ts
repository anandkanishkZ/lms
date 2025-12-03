const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ModuleApprovalStats {
  pending: number;
  approved: number;
  rejected: number;
  published: number;
  total: number;
}

export interface PendingModule {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  level: string | null;
  duration: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: string;
    name: string;
    email: string;
    profileImage: string | null;
  };
  subject: {
    id: string;
    name: string;
  };
  class: {
    id: string;
    name: string;
    section: string;
  } | null;
  _count: {
    topics: number;
    enrollments: number;
  };
}

export interface ApprovedModule extends PendingModule {
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  approver: {
    id: string;
    name: string;
    email: string;
  } | null;
  rejecter: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export const moduleApprovalApiService = {
  /**
   * Get approval statistics
   */
  async getStats(): Promise<ModuleApprovalStats> {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/modules/approval/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch approval stats (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get pending modules for approval
   */
  async getPendingModules(page: number = 1, limit: number = 20): Promise<{
    modules: PendingModule[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/modules/approval/pending?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch pending modules (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get approval history
   */
  async getApprovalHistory(
    page: number = 1,
    limit: number = 20,
    status?: string
  ): Promise<{
    modules: ApprovedModule[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const url = new URL(`${API_BASE_URL}/admin/modules/approval/history`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    if (status) {
      url.searchParams.append('status', status);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch approval history (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Approve a module
   */
  async approveModule(
    moduleId: string,
    publishImmediately: boolean = false
  ): Promise<PendingModule> {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/modules/approval/${moduleId}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ publishImmediately }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to approve module (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Reject a module
   */
  async rejectModule(moduleId: string, reason: string): Promise<PendingModule> {
    const token = localStorage.getItem('adminToken');

    if (!token) {
      throw new Error('No authentication token found');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('Rejection reason is required');
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/modules/approval/${moduleId}/reject`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to reject module (${response.status})`);
    }

    const result = await response.json();
    return result.data;
  },
};
