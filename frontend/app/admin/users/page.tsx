'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Users as UsersIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminLayout from '@/components/admin/AdminLayout';

// Sample user data
const allUsers = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    role: 'Student',
    status: 'Active',
    joined: '2024-01-15',
    phone: '+1 (555) 123-4567',
    avatar: null,
    course: 'Computer Science',
    year: '2nd Year'
  },
  {
    id: 2,
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@email.com',
    role: 'Teacher',
    status: 'Active',
    joined: '2023-08-20',
    phone: '+1 (555) 987-6543',
    avatar: null,
    department: 'Computer Science',
    experience: '8 years'
  },
  {
    id: 3,
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    role: 'Student',
    status: 'Inactive',
    joined: '2024-03-10',
    phone: '+1 (555) 456-7890',
    avatar: null,
    course: 'Mathematics',
    year: '1st Year'
  },
  {
    id: 4,
    name: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    role: 'Teacher',
    status: 'Active',
    joined: '2023-11-05',
    phone: '+1 (555) 321-0987',
    avatar: null,
    department: 'Physics',
    experience: '5 years'
  },
  {
    id: 5,
    name: 'Alex Rodriguez',
    email: 'alex.rodriguez@email.com',
    role: 'Student',
    status: 'Active',
    joined: '2024-02-28',
    phone: '+1 (555) 654-3210',
    avatar: null,
    course: 'Biology',
    year: '3rd Year'
  },
  {
    id: 6,
    name: 'Prof. David Lee',
    email: 'david.lee@email.com',
    role: 'Teacher',
    status: 'Active',
    joined: '2022-09-15',
    phone: '+1 (555) 111-2222',
    avatar: null,
    department: 'Mathematics',
    experience: '12 years'
  },
  {
    id: 7,
    name: 'Lisa Garcia',
    email: 'lisa.garcia@email.com',
    role: 'Student',
    status: 'Active',
    joined: '2024-01-20',
    phone: '+1 (555) 333-4444',
    avatar: null,
    course: 'Chemistry',
    year: '2nd Year'
  },
  {
    id: 8,
    name: 'Dr. Mark Thompson',
    email: 'mark.thompson@email.com',
    role: 'Teacher',
    status: 'Active',
    joined: '2021-03-10',
    phone: '+1 (555) 555-6666',
    avatar: null,
    department: 'Chemistry',
    experience: '15 years'
  },
  {
    id: 9,
    name: 'Admin User',
    email: 'admin@lms.com',
    role: 'Admin',
    status: 'Active',
    joined: '2023-01-01',
    phone: '+1 (555) 000-0001',
    avatar: null,
    department: 'System Administration',
    permissions: 'Full Access'
  },
  {
    id: 10,
    name: 'Super Admin',
    email: 'superadmin@lms.com',
    role: 'Admin',
    status: 'Active',
    joined: '2022-06-15',
    phone: '+1 (555) 000-0002',
    avatar: null,
    department: 'System Administration',
    permissions: 'Full Access'
  }
];

const roleColors = {
  Student: 'bg-blue-100 text-blue-800',
  Teacher: 'bg-green-100 text-green-800',
  Admin: 'bg-purple-100 text-purple-800'
};

const statusColors = {
  Active: 'bg-green-100 text-green-800',
  Inactive: 'bg-red-100 text-red-800',
  Pending: 'bg-yellow-100 text-yellow-800'
};

type TabType = 'students' | 'teachers' | 'admins';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  phone: string;
  avatar: null;
  course?: string;
  year?: string;
  department?: string;
  experience?: string;
  permissions?: string;
}

export default function UsersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('students');
  
  const students = allUsers.filter(user => user.role === 'Student');
  const teachers = allUsers.filter(user => user.role === 'Teacher');
  const admins = allUsers.filter(user => user.role === 'Admin');
  
  const currentUsers = activeTab === 'students' ? students : activeTab === 'teachers' ? teachers : admins;
  
  const handleEditUser = (userId: number) => {
    toast.success(`Opening edit form for user ${userId}`);
  };

  const handleDeleteUser = (userId: number) => {
    toast.success(`User ${userId} deleted successfully`);
  };

  const handleAddUser = () => {
    toast.success(`Opening new ${activeTab.slice(0, -1)} form`);
  };

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
                    {activeTab === 'students' ? 'Course/Year' : activeTab === 'teachers' ? 'Department' : 'Role/Permissions'}
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
                {currentUsers.map((user: User, index: number) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activeTab === 'students' ? 'bg-blue-600' : activeTab === 'teachers' ? 'bg-emerald-600' : 'bg-purple-600'
                        }`}>
                          {activeTab === 'students' ? (
                            <GraduationCap className="w-5 h-5 text-white" />
                          ) : activeTab === 'teachers' ? (
                            <UsersIcon className="w-5 h-5 text-white" />
                          ) : (
                            <User className="w-5 h-5 text-white" />
                          )}
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
                          <div className="font-medium text-gray-900">{user.course}</div>
                          <div className="text-gray-500">{user.year}</div>
                        </div>
                      ) : activeTab === 'teachers' ? (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{user.department}</div>
                          <div className="text-gray-500">{user.experience} experience</div>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{user.department}</div>
                          <div className="text-gray-500">{user.permissions}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[user.status as keyof typeof statusColors]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        {new Date(user.joined).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="truncate max-w-32">{user.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 mr-2" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <motion.button
                          onClick={() => handleEditUser(user.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteUser(user.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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
                <span className="font-medium">{currentUsers.length}</span> {activeTab}
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Previous
                </button>
                <button className={`px-3 py-1 text-sm text-white rounded-md transition-colors ${
                  activeTab === 'students' ? 'bg-blue-600 hover:bg-blue-700' : activeTab === 'teachers' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'
                }`}>
                  1
                </button>
                <button className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  );
}