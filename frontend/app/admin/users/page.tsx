'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  Calendar,
  User,
  GraduationCap,
  Users as UsersIcon,
  X,
  Building,
  BookOpen,
  Shield,
  ShieldOff,
  Eye,
  Clock,
  AlertCircle,
  CheckCircle,
  Ban,
  History,
  Globe
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';
import { AdminLayout, adminApiService } from '@/src/features/admin';
import CredentialsModal from '@/src/features/admin/components/CredentialsModal';

// Use the service from the feature module
const adminApi = adminApiService;

// Validation schemas
const studentSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  school: z.string().min(2, 'School name is required'),
  phone: z.string().optional().refine((val) => !val || (val.length >= 10 && /^\+?[\d\s\-\(\)]+$/.test(val)), 'Invalid phone format'),
  email: z.string().optional().refine((val) => !val || z.string().email().safeParse(val).success, 'Invalid email format'),
});

const teacherSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  department: z.string().min(2, 'Department is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone format'),
  email: z.string().email('Invalid email address'),
  experience: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;
type TeacherFormData = z.infer<typeof teacherSchema>;

// Generate unique user ID
const generateUserId = () => {
  const currentYear = new Date().getFullYear();
  const uniqueCode = Math.floor(Math.random() * 900) + 100; // 3 digit random number
  return `${currentYear}${uniqueCode}`;
};

// User data interface
interface ApiUser {
  id: string;
  name: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  symbolNo: string | null;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  school: string | null;
  department: string | null;
  experience: string | null;
  verified: boolean;
  isActive: boolean;
  isBlocked: boolean;
  blockReason: string | null;
  blockedAt: string | null;
  blockedBy: string | null;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

// Role and status color mappings
const roleColors = {
  STUDENT: 'bg-blue-100 text-blue-800',
  TEACHER: 'bg-green-100 text-green-800',
  ADMIN: 'bg-purple-100 text-purple-800'
};

const statusColors = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-red-100 text-red-800',
  Pending: 'bg-yellow-100 text-yellow-800'
};

type TabType = 'students' | 'teachers' | 'admins';

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'student' | 'teacher'>('student');
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });

  // New state for enhanced functionality
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isUnblockModalOpen, setIsUnblockModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockNotes, setBlockNotes] = useState('');
  const [unblockNotes, setUnblockNotes] = useState('');
  const [deleteNotes, setDeleteNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [auditPagination, setAuditPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false
  });
  
  // Credentials modal state
  const [showCredentials, setShowCredentials] = useState(false);
  const [userCredentials, setUserCredentials] = useState<any>(null);
  
  const studentForm = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      school: '',
      phone: '',
      email: '',
    }
  });

  const teacherForm = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      department: '',
      phone: '',
      email: '',
      experience: '',
    }
  });

  // Fetch users from API
  const fetchUsers = async (role?: 'STUDENT' | 'TEACHER' | 'ADMIN', page = 1) => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers({
        role,
        page,
        limit: 10
      });

      if (response.success && response.data) {
        setUsers(response.data.users);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showErrorToast('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Load users when component mounts or tab changes
  useEffect(() => {
    const roleMap = {
      'students': 'STUDENT' as const,
      'teachers': 'TEACHER' as const,
      'admins': 'ADMIN' as const
    };
    fetchUsers(roleMap[activeTab]);
  }, [activeTab]);

  // Filter users by current tab
  const students = users.filter(user => user.role === 'STUDENT');
  const teachers = users.filter(user => user.role === 'TEACHER');
  const admins = users.filter(user => user.role === 'ADMIN');
  
  const currentUsers = activeTab === 'students' ? students : activeTab === 'teachers' ? teachers : admins;
  
  // Enhanced action handlers
  const handleOpenActionsModal = (user: ApiUser) => {
    setSelectedUser(user);
    setIsActionsModalOpen(true);
  };

  const handleViewUser = (user: ApiUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (user: ApiUser) => {
    setSelectedUser(user);
    setIsActionsModalOpen(false);
    
    // Populate form based on user role
    if (user.role === 'STUDENT') {
      studentForm.reset({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        school: user.school || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    } else if (user.role === 'TEACHER') {
      teacherForm.reset({
        firstName: user.firstName || '',
        middleName: user.middleName || '',
        lastName: user.lastName || '',
        department: user.department || '',
        phone: user.phone || '',
        email: user.email || '',
        experience: user.experience || '',
      });
    }
    
    setIsEditModalOpen(true);
  };

  const handleBlockUser = (user: ApiUser) => {
    setSelectedUser(user);
    setBlockReason('');
    setBlockNotes('');
    setIsActionsModalOpen(false);
    setIsBlockModalOpen(true);
  };

  const handleUnblockUser = (user: ApiUser) => {
    setSelectedUser(user);
    setUnblockNotes('');
    setIsActionsModalOpen(false);
    setIsUnblockModalOpen(true);
  };

  const handleDeleteUser = (user: ApiUser) => {
    setSelectedUser(user);
    setDeleteNotes('');
    setIsActionsModalOpen(false);
    setIsDeleteModalOpen(true);
  };

  const handleViewAuditTrail = async (user: ApiUser) => {
    setSelectedUser(user);
    setIsActionsModalOpen(false);
    setIsAuditModalOpen(true);
    await fetchAuditTrail(user.id);
  };

  const fetchAuditTrail = async (userId: string, page = 1) => {
    try {
      const response = await adminApi.getUserAuditTrail(userId, page, 10);
      if (response.success && response.data) {
        setAuditTrail(response.data.auditTrail);
        setAuditPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching audit trail:', error);
      showErrorToast('Failed to fetch audit trail');
    }
  };

  // Update user handler
  const handleUpdateUser = async (data: any) => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      const response = await adminApi.updateUser(selectedUser.id, data);
      
      if (response.success) {
        showSuccessToast('User updated successfully');
        setIsEditModalOpen(false);
        setSelectedUser(null);
        
        // Refresh users list
        const roleMap = {
          'students': 'STUDENT' as const,
          'teachers': 'TEACHER' as const,
          'admins': 'ADMIN' as const
        };
        await fetchUsers(roleMap[activeTab]);
      } else {
        showErrorToast(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  // Block user handler
  const handleBlockUserSubmit = async () => {
    if (!selectedUser || !blockReason.trim()) return;
    
    try {
      setActionLoading(true);
      const response = await adminApi.blockUser(selectedUser.id, {
        reason: blockReason,
        notes: blockNotes || undefined
      });
      
      if (response.success) {
        showSuccessToast('User blocked successfully');
        setIsBlockModalOpen(false);
        setSelectedUser(null);
        setBlockReason('');
        setBlockNotes('');
        
        // Refresh users list
        const roleMap = {
          'students': 'STUDENT' as const,
          'teachers': 'TEACHER' as const,
          'admins': 'ADMIN' as const
        };
        await fetchUsers(roleMap[activeTab]);
      } else {
        showErrorToast(response.message || 'Failed to block user');
      }
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to block user');
    } finally {
      setActionLoading(false);
    }
  };

  // Unblock user handler
  const handleUnblockUserSubmit = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      const response = await adminApi.unblockUser(selectedUser.id, unblockNotes || undefined);
      
      if (response.success) {
        showSuccessToast('User unblocked successfully');
        setIsUnblockModalOpen(false);
        setSelectedUser(null);
        setUnblockNotes('');
        
        // Refresh users list
        const roleMap = {
          'students': 'STUDENT' as const,
          'teachers': 'TEACHER' as const,
          'admins': 'ADMIN' as const
        };
        await fetchUsers(roleMap[activeTab]);
      } else {
        showErrorToast(response.message || 'Failed to unblock user');
      }
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to unblock user');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user handler
  const handleDeleteUserSubmit = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      const response = await adminApi.deleteUser(selectedUser.id, deleteNotes || undefined);
      
      if (response.success) {
        showSuccessToast('User deleted successfully');
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        setDeleteNotes('');
        
        // Refresh users list
        const roleMap = {
          'students': 'STUDENT' as const,
          'teachers': 'TEACHER' as const,
          'admins': 'ADMIN' as const
        };
        await fetchUsers(roleMap[activeTab]);
      } else {
        showErrorToast(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      showErrorToast(error.message || 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddUser = () => {
    if (activeTab === 'students') {
      setModalType('student');
    } else if (activeTab === 'teachers') {
      setModalType('teacher');
    } else {
      showSuccessToast('Admin creation coming soon');
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    studentForm.reset();
    teacherForm.reset();
  };

  const onSubmitStudent = async (data: StudentFormData) => {
    try {
      const response = await adminApi.createStudent(data);
      
      if (response.success && response.data) {
        // Set credentials and show modal
        setUserCredentials({
          id: response.data.id,
          name: response.data.name,
          symbolNo: response.data.symbolNo,
          email: response.data.email,
          phone: response.data.phone,
          tempPassword: response.data.tempPassword,
          role: 'STUDENT' as const,
          school: response.data.school,
        });
        setShowCredentials(true);
        
        handleCloseModal();
        // Refresh the users list
        fetchUsers('STUDENT');
      } else {
        showErrorToast(response.message || 'Failed to create student');
      }
    } catch (error: any) {
      console.error('Error creating student:', error);
      showErrorToast(error.message || 'Failed to create student');
    }
  };

  const onSubmitTeacher = async (data: TeacherFormData) => {
    try {
      const response = await adminApi.createTeacher(data);
      
      if (response.success && response.data) {
        // Set credentials and show modal
        setUserCredentials({
          id: response.data.id,
          name: response.data.name,
          symbolNo: response.data.symbolNo,
          email: response.data.email,
          phone: response.data.phone,
          tempPassword: response.data.tempPassword,
          role: 'TEACHER' as const,
          department: response.data.department,
        });
        setShowCredentials(true);
        
        handleCloseModal();
        // Refresh the users list
        fetchUsers('TEACHER');
      } else {
        showErrorToast(response.message || 'Failed to create teacher');
      }
    } catch (error: any) {
      console.error('Error creating teacher:', error);
      showErrorToast(error.message || 'Failed to create teacher');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="User Management" description="Loading users...">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="User Management"
      description="Manage students, teachers, and administrators in your LMS."
    >
      <div className="p-6 space-y-6">
        {/* Tab Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-2"
        >
          <nav className="flex space-x-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'students'
                  ? 'bg-white text-blue-600 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Students</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                activeTab === 'students' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
              }`}>
                {students.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'teachers'
                  ? 'bg-white text-emerald-600 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <UsersIcon className="w-4 h-4" />
              <span>Teachers</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                activeTab === 'teachers' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-600'
              }`}>
                {teachers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('admins')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'admins'
                  ? 'bg-white text-purple-600 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Admins</span>
              <span className={`ml-1 px-1.5 py-0.5 rounded text-xs font-medium ${
                activeTab === 'admins' ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-600'
              }`}>
                {admins.length}
              </span>
            </button>
          </nav>
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0"
        >
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>

            {/* Filter */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </motion.button>
          </div>

          {/* Add User Button */}
          <motion.button
            onClick={handleAddUser}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-all duration-200 shadow-lg ${
              activeTab === 'students' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : activeTab === 'teachers'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add {activeTab === 'students' ? 'Student' : activeTab === 'teachers' ? 'Teacher' : 'Admin'}</span>
          </motion.button>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'students' ? 'Students' : activeTab === 'teachers' ? 'Teachers' : 'Administrators'}
            </h3>
            <p className="text-sm text-gray-600">
              {activeTab === 'students' 
                ? 'Manage student accounts and academic information' 
                : activeTab === 'teachers'
                ? 'Manage teacher accounts and department assignments'
                : 'Manage administrator accounts and system permissions'
              }
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'students' ? 'School/ID' : activeTab === 'teachers' ? 'Department' : 'Role/Permissions'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {activeTab === 'students' ? (
                        <div className="text-sm">
                          <div 
                            className="font-medium text-gray-900 truncate max-w-[200px]" 
                            title={user.school || 'N/A'}
                          >
                            {user.school || 'N/A'}
                          </div>
                          <div className="text-gray-500">ID: {user.symbolNo}</div>
                        </div>
                      ) : activeTab === 'teachers' ? (
                        <div className="text-sm">
                          <div 
                            className="font-medium text-gray-900 truncate max-w-[200px]"
                            title={user.department || 'N/A'}
                          >
                            {user.department || 'N/A'}
                          </div>
                          <div className="text-gray-500 truncate max-w-[200px]" title={user.experience || 'N/A'}>
                            {user.experience || 'N/A'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{user.role}</div>
                          <div className="text-gray-500">Full Access</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {user.email && (
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="truncate max-w-32">{user.email}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View Button - Primary Action */}
                        <motion.button
                          onClick={() => handleViewUser(user)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-xs font-medium">View</span>
                        </motion.button>

                        {/* More Actions Button - Opens Modal */}
                        <motion.button
                          onClick={() => handleOpenActionsModal(user)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{currentUsers.length}</span> of{' '}
                <span className="font-medium">{pagination.totalCount}</span> {activeTab}
              </div>
              <div className="flex space-x-2">
                <button 
                  disabled={!pagination.hasPrev}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button className={`px-3 py-1 text-sm text-white rounded-md transition-colors ${
                  activeTab === 'students' ? 'bg-blue-600 hover:bg-blue-700' : activeTab === 'teachers' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}>
                  {pagination.currentPage}
                </button>
                <button 
                  disabled={!pagination.hasNext}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Add User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              {/* Background overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                onClick={handleCloseModal}
              />

              {/* Modal panel */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl relative"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Add New {modalType === 'student' ? 'Student' : 'Teacher'}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Fill in the information below to create a new {modalType} account
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Student Form */}
                {modalType === 'student' && (
                  <form onSubmit={studentForm.handleSubmit(onSubmitStudent)} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          {...studentForm.register('firstName')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter first name"
                        />
                        {studentForm.formState.errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">
                            {studentForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Middle Name
                        </label>
                        <input
                          {...studentForm.register('middleName')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter middle name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          {...studentForm.register('lastName')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter last name"
                        />
                        {studentForm.formState.errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">
                            {studentForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* School Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Building className="inline w-4 h-4 mr-1" />
                        School *
                      </label>
                      <input
                        {...studentForm.register('school')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="Enter school name"
                      />
                      {studentForm.formState.errors.school && (
                        <p className="mt-1 text-sm text-red-600">
                          {studentForm.formState.errors.school.message}
                        </p>
                      )}
                    </div>

                    {/* Contact Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="inline w-4 h-4 mr-1" />
                          Phone Number
                        </label>
                        <input
                          {...studentForm.register('phone')}
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="+1 (555) 123-4567 (Optional)"
                        />
                        {studentForm.formState.errors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {studentForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="inline w-4 h-4 mr-1" />
                          Email Address
                        </label>
                        <input
                          {...studentForm.register('email')}
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="student@example.com (Optional)"
                        />
                        {studentForm.formState.errors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {studentForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Create Student
                      </button>
                    </div>
                  </form>
                )}

                {/* Teacher Form */}
                {modalType === 'teacher' && (
                  <form onSubmit={teacherForm.handleSubmit(onSubmitTeacher)} className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name *
                        </label>
                        <input
                          {...teacherForm.register('firstName')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="Enter first name"
                        />
                        {teacherForm.formState.errors.firstName && (
                          <p className="mt-1 text-sm text-red-600">
                            {teacherForm.formState.errors.firstName.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Middle Name
                        </label>
                        <input
                          {...teacherForm.register('middleName')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="Enter middle name"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          {...teacherForm.register('lastName')}
                          type="text"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="Enter last name"
                        />
                        {teacherForm.formState.errors.lastName && (
                          <p className="mt-1 text-sm text-red-600">
                            {teacherForm.formState.errors.lastName.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Department Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BookOpen className="inline w-4 h-4 mr-1" />
                        Department *
                      </label>
                      <input
                        {...teacherForm.register('department')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="Enter department name"
                      />
                      {teacherForm.formState.errors.department && (
                        <p className="mt-1 text-sm text-red-600">
                          {teacherForm.formState.errors.department.message}
                        </p>
                      )}
                    </div>

                    {/* Contact Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Phone className="inline w-4 h-4 mr-1" />
                          Phone Number *
                        </label>
                        <input
                          {...teacherForm.register('phone')}
                          type="tel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="+1 (555) 123-4567"
                        />
                        {teacherForm.formState.errors.phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {teacherForm.formState.errors.phone.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Mail className="inline w-4 h-4 mr-1" />
                          Email Address *
                        </label>
                        <input
                          {...teacherForm.register('email')}
                          type="email"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                          placeholder="teacher@example.com"
                        />
                        {teacherForm.formState.errors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {teacherForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Experience Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience (Optional)
                      </label>
                      <input
                        {...teacherForm.register('experience')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="e.g., 5 years"
                      />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                      >
                        Create Teacher
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Block User Modal */}
      <AnimatePresence>
        {isBlockModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-orange-500" />
                  Block User
                </h3>
                <button
                  onClick={() => setIsBlockModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  You are about to block <strong>{selectedUser?.name}</strong>. 
                  This will prevent them from accessing the system.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for blocking *
                    </label>
                    <textarea
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter the reason for blocking this user..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      value={blockNotes}
                      onChange={(e) => setBlockNotes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      rows={2}
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsBlockModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlockUserSubmit}
                  disabled={!blockReason.trim() || actionLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 rounded-lg transition-colors"
                >
                  {actionLoading ? 'Blocking...' : 'Block User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unblock User Modal */}
      <AnimatePresence>
        {isUnblockModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShieldOff className="w-5 h-5 mr-2 text-green-500" />
                  Unblock User
                </h3>
                <button
                  onClick={() => setIsUnblockModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">
                  You are about to unblock <strong>{selectedUser?.name}</strong>.
                </p>
                
                {selectedUser?.blockReason && (
                  <div className="bg-red-50 p-3 rounded-lg mb-4">
                    <p className="text-sm font-medium text-red-800 mb-1">Current Block Reason:</p>
                    <p className="text-sm text-red-700">{selectedUser.blockReason}</p>
                    {selectedUser.blockedAt && (
                      <p className="text-xs text-red-600 mt-1">
                        Blocked on {new Date(selectedUser.blockedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={unblockNotes}
                    onChange={(e) => setUnblockNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                    placeholder="Reason for unblocking or any notes..."
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsUnblockModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnblockUserSubmit}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-lg transition-colors"
                >
                  {actionLoading ? 'Unblocking...' : 'Unblock User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete User Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Trash2 className="w-5 h-5 mr-2 text-red-500" />
                  Delete User
                </h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <div className="bg-red-50 p-4 rounded-lg mb-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Warning</h4>
                      <p className="text-sm text-red-700 mt-1">
                        This action cannot be undone. All data associated with this user will be permanently deleted.
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">
                  You are about to permanently delete <strong>{selectedUser?.name}</strong> 
                  ({selectedUser?.email || selectedUser?.phone}).
                </p>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for deletion (Optional)
                  </label>
                  <textarea
                    value={deleteNotes}
                    onChange={(e) => setDeleteNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows={2}
                    placeholder="Reason for deleting this user..."
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUserSubmit}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 rounded-lg transition-colors"
                >
                  {actionLoading ? 'Deleting...' : 'Delete User'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Enhanced Audit Trail Modal */}
      <AnimatePresence>
        {isAuditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-5xl mx-4 max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="bg-blue-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-700 p-3 rounded-lg">
                      <History className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Activity Timeline
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {selectedUser?.name} • {selectedUser?.email || 'No email'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAuditModalOpen(false)}
                    className="text-white hover:bg-blue-700 p-2 rounded-lg transition-all duration-200"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* User Info Bar */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {selectedUser?.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Joined {new Date(selectedUser?.createdAt || '').toLocaleDateString()}
                      </span>
                    </div>
                    {selectedUser?.isBlocked && (
                      <div className="flex items-center space-x-2">
                        <Ban className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600 font-medium">
                          Currently Blocked
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {auditPagination.totalCount} total activities
                  </div>
                </div>
              </div>

              {/* Timeline Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {auditTrail.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <History className="w-8 h-8 text-gray-400" />
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Activity Found</h4>
                    <p className="text-gray-500">This user doesn't have any recorded activities yet.</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>
                    
                    <div className="space-y-6">
                      {auditTrail.map((entry, index) => {
                        const getActionIcon = (action: string) => {
                          switch (action) {
                            case 'USER_BLOCKED': return <Ban className="w-5 h-5 text-red-500" />;
                            case 'USER_UNBLOCKED': return <CheckCircle className="w-5 h-5 text-green-500" />;
                            case 'USER_UPDATED': return <Edit className="w-5 h-5 text-blue-500" />;
                            case 'USER_DELETED': return <Trash2 className="w-5 h-5 text-red-500" />;
                            case 'LOGIN': return <Shield className="w-5 h-5 text-green-500" />;
                            default: return <Clock className="w-5 h-5 text-gray-500" />;
                          }
                        };

                        const getActionColor = (action: string) => {
                          switch (action) {
                            case 'USER_BLOCKED': return 'bg-red-50 border-red-200';
                            case 'USER_UNBLOCKED': return 'bg-green-50 border-green-200';
                            case 'USER_UPDATED': return 'bg-blue-50 border-blue-200';
                            case 'USER_DELETED': return 'bg-red-50 border-red-200';
                            case 'LOGIN': return 'bg-green-50 border-green-200';
                            default: return 'bg-gray-50 border-gray-200';
                          }
                        };

                        const formatActionTitle = (action: string) => {
                          return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                        };

                        return (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-start space-x-4"
                          >
                            {/* Timeline Node */}
                            <div className="relative z-10 flex-shrink-0">
                              <div className={`w-12 h-12 rounded-full border-3 shadow-sm flex items-center justify-center ${getActionColor(entry.action)}`}>
                                {getActionIcon(entry.action)}
                              </div>
                            </div>

                            {/* Content Card */}
                            <div className={`flex-1 border rounded-xl p-4 ${getActionColor(entry.action)} hover:shadow-md transition-all duration-200`}>
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <h4 className="font-semibold text-gray-900">
                                    {formatActionTitle(entry.action)}
                                  </h4>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    entry.action.includes('BLOCK') ? 'bg-red-100 text-red-700' :
                                    entry.action.includes('UNBLOCK') ? 'bg-green-100 text-green-700' :
                                    entry.action.includes('UPDATE') ? 'bg-blue-100 text-blue-700' :
                                    entry.action.includes('DELETE') ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {entry.entity || 'System'}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                                </div>
                              </div>

                              {/* Performed By */}
                              {entry.performedBy && (
                                <div className="flex items-center space-x-2 mb-2">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">
                                    Performed by <span className="font-medium">{entry.performedBy.name}</span>
                                    {entry.performedBy.email && (
                                      <span className="text-gray-500"> ({entry.performedBy.email})</span>
                                    )}
                                  </span>
                                </div>
                              )}

                              {/* Admin Notes */}
                              {entry.notes && (
                                <div className="mb-3 p-3 bg-white bg-opacity-60 rounded-lg border border-white border-opacity-40">
                                  <div className="flex items-start space-x-2">
                                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <p className="text-xs font-medium text-gray-700 mb-1">Admin Notes:</p>
                                      <p className="text-sm text-gray-800">{entry.notes}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Details */}
                              {entry.details && (
                                <div className="mt-3">
                                  <details className="group">
                                    <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800 flex items-center space-x-2 transition-colors">
                                      <span>View Details</span>
                                      <svg className="w-4 h-4 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </summary>
                                    <div className="mt-3 p-4 bg-white bg-opacity-80 rounded-lg border">
                                      {typeof entry.details === 'object' ? (
                                        <div className="space-y-3">
                                          {Object.entries(entry.details as any).map(([key, value]) => (
                                            <div key={key} className="border-b border-gray-100 pb-2 last:border-0">
                                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                              </dt>
                                              <dd className="text-sm text-gray-800">
                                                {typeof value === 'object' ? (
                                                  <pre className="bg-gray-50 p-2 rounded text-xs overflow-x-auto font-mono">
                                                    {JSON.stringify(value, null, 2)}
                                                  </pre>
                                                ) : (
                                                  <span>{String(value)}</span>
                                                )}
                                              </dd>
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                                          {JSON.stringify(entry.details, null, 2)}
                                        </pre>
                                      )}
                                    </div>
                                  </details>
                                </div>
                              )}

                              {/* IP Address */}
                              {entry.ipAddress && (
                                <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                                  <Globe className="w-3 h-3" />
                                  <span>IP: {entry.ipAddress}</span>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Pagination */}
              {auditPagination.totalPages > 1 && (
                <div className="border-t bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <span>Page</span>
                        <span className="font-semibold text-gray-900">{auditPagination.currentPage}</span>
                        <span>of</span>
                        <span className="font-semibold text-gray-900">{auditPagination.totalPages}</span>
                      </div>
                      <div className="h-4 w-px bg-gray-300 mx-2"></div>
                      <span className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">{auditPagination.totalCount}</span> total activities
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fetchAuditTrail(selectedUser!.id, auditPagination.currentPage - 1)}
                        disabled={!auditPagination.hasPrev}
                        className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span>Previous</span>
                      </button>
                      
                      <button
                        onClick={() => fetchAuditTrail(selectedUser!.id, auditPagination.currentPage + 1)}
                        disabled={!auditPagination.hasNext}
                        className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        <span>Next</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Credentials Modal */}
      
      {/* Actions Modal */}
      <AnimatePresence>
        {isActionsModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setIsActionsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <MoreVertical className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">User Actions</h2>
                    <p className="text-sm text-gray-300">{selectedUser.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsActionsModalOpen(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-2">
                  {/* Edit User */}
                  <motion.button
                    onClick={() => handleEditUser(selectedUser)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 transition-all group"
                  >
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">Edit User</p>
                      <p className="text-sm text-gray-600">Modify user information</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>

                  {/* Block/Unblock User */}
                  {selectedUser.isBlocked ? (
                    <motion.button
                      onClick={() => handleUnblockUser(selectedUser)}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center space-x-4 p-4 rounded-xl bg-green-50 hover:bg-green-100 border-2 border-green-200 transition-all group"
                    >
                      <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShieldOff className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">Unblock User</p>
                        <p className="text-sm text-gray-600">Restore user access</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={() => handleBlockUser(selectedUser)}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={selectedUser.role === 'ADMIN'}
                      className="w-full flex items-center space-x-4 p-4 rounded-xl bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-gray-900">Block User</p>
                        <p className="text-sm text-gray-600">Restrict user access</p>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  )}

                  {/* View Audit Trail */}
                  <motion.button
                    onClick={() => handleViewAuditTrail(selectedUser)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center space-x-4 p-4 rounded-xl bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 transition-all group"
                  >
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <History className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">View History</p>
                      <p className="text-sm text-gray-600">Check activity logs</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-4"></div>

                  {/* Delete User */}
                  <motion.button
                    onClick={() => handleDeleteUser(selectedUser)}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={selectedUser.role === 'ADMIN'}
                    className="w-full flex items-center space-x-4 p-4 rounded-xl bg-red-50 hover:bg-red-100 border-2 border-red-200 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Trash2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-semibold text-gray-900">Delete User</p>
                      <p className="text-sm text-gray-600">Permanently remove user</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-2xl border-t">
                <button
                  onClick={() => setIsActionsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View User Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setIsViewModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-500 rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">User Details</h2>
                    <p className="text-sm text-blue-100">{selectedUser.role} Information</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Status Banner */}
                <div className={`p-4 rounded-xl border-2 ${
                  selectedUser.isBlocked
                    ? 'bg-red-50 border-red-200'
                    : selectedUser.isActive
                    ? 'bg-green-50 border-green-200'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {selectedUser.isBlocked ? (
                        <>
                          <Ban className="w-6 h-6 text-red-600" />
                          <div>
                            <p className="font-semibold text-red-900">Account Blocked</p>
                            <p className="text-sm text-red-700">{selectedUser.blockReason || 'No reason provided'}</p>
                          </div>
                        </>
                      ) : selectedUser.isActive ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <div>
                            <p className="font-semibold text-green-900">Account Active</p>
                            <p className="text-sm text-green-700">User has full access to the system</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-6 h-6 text-gray-600" />
                          <div>
                            <p className="font-semibold text-gray-900">Account Inactive</p>
                            <p className="text-sm text-gray-700">User account is not active</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Full Name</label>
                      <p className="text-gray-900 font-medium">{selectedUser.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Symbol Number</label>
                      <p className="text-gray-900 font-medium">{selectedUser.symbolNo || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">First Name</label>
                      <p className="text-gray-900">{selectedUser.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Middle Name</label>
                      <p className="text-gray-900">{selectedUser.middleName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Name</label>
                      <p className="text-gray-900">{selectedUser.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Role</label>
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${roleColors[selectedUser.role]}`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email Address</label>
                      <p className="text-gray-900 break-all">{selectedUser.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <p className="text-gray-900">{selectedUser.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Academic/Professional Information */}
                {selectedUser.role === 'STUDENT' ? (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                      Academic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">School</label>
                        <p className="text-gray-900">{selectedUser.school || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ) : selectedUser.role === 'TEACHER' ? (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Department</label>
                        <p className="text-gray-900">{selectedUser.department || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Experience</label>
                        <p className="text-gray-900">{selectedUser.experience || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Account Status */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-blue-600" />
                    Account Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Verified</label>
                      <p className="text-gray-900">{selectedUser.verified ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Active</label>
                      <p className="text-gray-900">{selectedUser.isActive ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Blocked</label>
                      <p className="text-gray-900">{selectedUser.isBlocked ? 'Yes' : 'No'}</p>
                    </div>
                    {selectedUser.isBlocked && selectedUser.blockedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Blocked At</label>
                        <p className="text-gray-900">{new Date(selectedUser.blockedAt).toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Login</label>
                      <p className="text-gray-900">
                        {selectedUser.lastLogin
                          ? new Date(selectedUser.lastLogin).toLocaleString()
                          : 'Never'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Created</label>
                      <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Block Information (if blocked) */}
                {selectedUser.isBlocked && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-4 flex items-center">
                      <Ban className="w-5 h-5 mr-2" />
                      Block Information
                    </h3>
                    <div className="space-y-3">
                      {selectedUser.blockReason && (
                        <div>
                          <label className="text-sm font-medium text-red-700">Reason</label>
                          <p className="text-red-900">{selectedUser.blockReason}</p>
                        </div>
                      )}
                      {selectedUser.blockedBy && (
                        <div>
                          <label className="text-sm font-medium text-red-700">Blocked By</label>
                          <p className="text-red-900">{selectedUser.blockedBy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t rounded-b-2xl">
                <button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditUser(selectedUser);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit User</span>
                </button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit User Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={() => setIsEditModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-500 rounded-t-2xl z-10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <Edit className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Edit User</h2>
                    <p className="text-sm text-blue-100">Update {selectedUser.role.toLowerCase()} information</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6">
                {selectedUser.role === 'STUDENT' ? (
                  <form onSubmit={studentForm.handleSubmit(handleUpdateUser)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* First Name */}
                        <div>
                          <label htmlFor="edit-firstName" className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="edit-firstName"
                            type="text"
                            {...studentForm.register('firstName')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter first name"
                          />
                          {studentForm.formState.errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">
                              {studentForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        {/* Middle Name */}
                        <div>
                          <label htmlFor="edit-middleName" className="block text-sm font-medium text-gray-700 mb-2">
                            Middle Name
                          </label>
                          <input
                            id="edit-middleName"
                            type="text"
                            {...studentForm.register('middleName')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter middle name"
                          />
                        </div>

                        {/* Last Name */}
                        <div>
                          <label htmlFor="edit-lastName" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="edit-lastName"
                            type="text"
                            {...studentForm.register('lastName')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter last name"
                          />
                          {studentForm.formState.errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">
                              {studentForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Academic Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                        Academic Information
                      </h3>
                      <div>
                        <label htmlFor="edit-school" className="block text-sm font-medium text-gray-700 mb-2">
                          School Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="edit-school"
                          type="text"
                          {...studentForm.register('school')}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter school name"
                        />
                        {studentForm.formState.errors.school && (
                          <p className="mt-1 text-sm text-red-600">
                            {studentForm.formState.errors.school.message}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-blue-600" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div>
                          <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                          </label>
                          <input
                            id="edit-email"
                            type="email"
                            {...studentForm.register('email')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="student@example.com"
                          />
                          {studentForm.formState.errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {studentForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            id="edit-phone"
                            type="tel"
                            {...studentForm.register('phone')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="+977 9800000000"
                          />
                          {studentForm.formState.errors.phone && (
                            <p className="mt-1 text-sm text-red-600">
                              {studentForm.formState.errors.phone.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Update Student</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : selectedUser.role === 'TEACHER' ? (
                  <form onSubmit={teacherForm.handleSubmit(handleUpdateUser)} className="space-y-6">
                    {/* Personal Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="w-5 h-5 mr-2 text-blue-600" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* First Name */}
                        <div>
                          <label htmlFor="edit-teacher-firstName" className="block text-sm font-medium text-gray-700 mb-2">
                            First Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="edit-teacher-firstName"
                            type="text"
                            {...teacherForm.register('firstName')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter first name"
                          />
                          {teacherForm.formState.errors.firstName && (
                            <p className="mt-1 text-sm text-red-600">
                              {teacherForm.formState.errors.firstName.message}
                            </p>
                          )}
                        </div>

                        {/* Middle Name */}
                        <div>
                          <label htmlFor="edit-teacher-middleName" className="block text-sm font-medium text-gray-700 mb-2">
                            Middle Name
                          </label>
                          <input
                            id="edit-teacher-middleName"
                            type="text"
                            {...teacherForm.register('middleName')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter middle name"
                          />
                        </div>

                        {/* Last Name */}
                        <div>
                          <label htmlFor="edit-teacher-lastName" className="block text-sm font-medium text-gray-700 mb-2">
                            Last Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="edit-teacher-lastName"
                            type="text"
                            {...teacherForm.register('lastName')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter last name"
                          />
                          {teacherForm.formState.errors.lastName && (
                            <p className="mt-1 text-sm text-red-600">
                              {teacherForm.formState.errors.lastName.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Professional Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                        Professional Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Department */}
                        <div>
                          <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700 mb-2">
                            Department <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="edit-department"
                            type="text"
                            {...teacherForm.register('department')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Enter department"
                          />
                          {teacherForm.formState.errors.department && (
                            <p className="mt-1 text-sm text-red-600">
                              {teacherForm.formState.errors.department.message}
                            </p>
                          )}
                        </div>

                        {/* Experience */}
                        <div>
                          <label htmlFor="edit-experience" className="block text-sm font-medium text-gray-700 mb-2">
                            Experience
                          </label>
                          <input
                            id="edit-experience"
                            type="text"
                            {...teacherForm.register('experience')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="e.g., 5 years"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Mail className="w-5 h-5 mr-2 text-blue-600" />
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email */}
                        <div>
                          <label htmlFor="edit-teacher-email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="edit-teacher-email"
                            type="email"
                            {...teacherForm.register('email')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="teacher@example.com"
                          />
                          {teacherForm.formState.errors.email && (
                            <p className="mt-1 text-sm text-red-600">
                              {teacherForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label htmlFor="edit-teacher-phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="edit-teacher-phone"
                            type="tel"
                            {...teacherForm.register('phone')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="+977 9800000000"
                          />
                          {teacherForm.formState.errors.phone && (
                            <p className="mt-1 text-sm text-red-600">
                              {teacherForm.formState.errors.phone.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        disabled={actionLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>Update Teacher</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Admin users cannot be edited from this interface.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <CredentialsModal
        isOpen={showCredentials}
        onClose={() => setShowCredentials(false)}
        credentials={userCredentials}
      />
    </AdminLayout>
  );
}