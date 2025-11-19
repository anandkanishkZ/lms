'use client';

import React, { useState, useEffect } from 'react';
import { useUnifiedEnrollmentStore, type SubjectEnrollment } from '../../store/unifiedEnrollmentStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  Badge,
} from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { 
  Users, 
  BookOpen, 
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Plus,
  Search,
  Filter
} from 'lucide-react';

// ============================================
// UNIFIED ENROLLMENT MANAGEMENT COMPONENT
// Following the photo model: Batch -> Class -> Subject -> Student
// ============================================

interface UnifiedEnrollmentManagerProps {
  className?: string;
}

export const UnifiedEnrollmentManager: React.FC<UnifiedEnrollmentManagerProps> = ({
  className = ''
}) => {
  const {
    enrollments,
    statistics,
    loading,
    error,
    filters,
    pagination,
    fetchEnrollments,
    fetchEnrollmentStatistics,
    enrollStudentInSubject,
    bulkEnrollStudentsInSubject,
    enrollBatchInClass,
    updateEnrollment,
    deactivateEnrollment,
    setFilters,
    clearError,
  } = useUnifiedEnrollmentStore();

  // Local state for forms
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [showBulkEnrollForm, setShowBulkEnrollForm] = useState(false);
  const [enrollForm, setEnrollForm] = useState({
    studentId: '',
    subjectId: '',
    classId: '',
    batchId: '',
  });

  // Load data on component mount
  useEffect(() => {
    fetchEnrollments();
    fetchEnrollmentStatistics();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    fetchEnrollments(newFilters);
  };

  // Handle search
  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm || undefined };
    setFilters(newFilters);
    fetchEnrollments(newFilters);
  };

  // Handle enrollment submission
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await enrollStudentInSubject(enrollForm);
    if (success) {
      setShowEnrollForm(false);
      setEnrollForm({ studentId: '', subjectId: '', classId: '', batchId: '' });
    }
  };

  // Handle batch enrollment
  const handleBatchEnroll = async (batchId: string, classId: string) => {
    if (!batchId || !classId) {
      alert('Please select both batch and class');
      return;
    }
    
    const success = await enrollBatchInClass(batchId, classId);
    if (success) {
      alert('Batch enrolled successfully!');
    }
  };

  // Get status badge variant
  const getStatusBadge = (enrollment: SubjectEnrollment) => {
    if (!enrollment.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (enrollment.isCompleted) {
      return (
        <Badge variant={enrollment.isPassed ? "default" : "destructive"}>
          {enrollment.isPassed ? 'Passed' : 'Failed'}
        </Badge>
      );
    }
    return <Badge variant="outline">Active</Badge>;
  };

  // Get grade color
  const getGradeColor = (grade: string | undefined) => {
    if (!grade) return 'text-gray-500';
    
    const gradeColors: Record<string, string> = {
      'A_PLUS': 'text-green-600',
      'A': 'text-green-500',
      'B_PLUS': 'text-blue-600',
      'B': 'text-blue-500',
      'C_PLUS': 'text-yellow-600',
      'C': 'text-yellow-500',
      'D': 'text-orange-500',
      'F': 'text-red-500',
    };
    
    return gradeColors[grade] || 'text-gray-500';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Unified Enrollment Management</h2>
          <p className="text-muted-foreground">
            Manage student enrollments following the simplified relationship model
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowEnrollForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowBulkEnrollForm(true)}
            className="flex items-center space-x-2"
          >
            <Users className="w-4 h-4" />
            <span>Bulk Enroll</span>
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-auto"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.activeEnrollments} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {statistics.completedEnrollments} completed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.passRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {statistics.passedEnrollments} passed
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.averageAttendance.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {statistics.uniqueStudents} students
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select
              value={filters.batchId || ''}
              onValueChange={(value) => handleFilterChange('batchId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Batches</SelectItem>
                {/* Add batch options from API */}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.classId || ''}
              onValueChange={(value) => handleFilterChange('classId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Classes</SelectItem>
                {/* Add class options from API */}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.subjectId || ''}
              onValueChange={(value) => handleFilterChange('subjectId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {/* Add subject options from API */}
              </SelectContent>
            </Select>
            
            <Select
              value={filters.isActive?.toString() || ''}
              onValueChange={(value) => handleFilterChange('isActive', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments</CardTitle>
          <CardDescription>
            Showing {enrollments.length} of {pagination.total} enrollments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enrollment: SubjectEnrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{enrollment.student.name}</div>
                        <div className="text-sm text-gray-500">{enrollment.student.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: enrollment.subject.color || '#gray' }}
                        />
                        <span>{enrollment.subject.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {enrollment.class.name}
                      {enrollment.class.section && ` - ${enrollment.class.section}`}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{enrollment.batch.name}</div>
                        <div className="text-sm text-gray-500">
                          {enrollment.batch.startYear} - {enrollment.batch.endYear}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getGradeColor(enrollment.grade)}`}>
                        {enrollment.grade?.replace('_', '+') || '-'}
                      </span>
                      {enrollment.finalMarks && enrollment.totalMarks && (
                        <div className="text-sm text-gray-500">
                          {enrollment.finalMarks}/{enrollment.totalMarks}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {enrollment.attendance ? (
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            enrollment.attendance >= 80 ? 'bg-green-500' :
                            enrollment.attendance >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span>{enrollment.attendance.toFixed(1)}%</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(enrollment)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle edit - would open edit modal
                            console.log('Edit enrollment:', enrollment.id);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deactivateEnrollment(enrollment.id)}
                          disabled={!enrollment.isActive}
                        >
                          Remove
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Quick Enroll Form Modal */}
      {showEnrollForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Enroll Student in Subject</CardTitle>
              <CardDescription>
                Following the relationship model: Student → Subject (via Class + Batch)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEnrollSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Student ID</label>
                  <Input
                    required
                    value={enrollForm.studentId}
                    onChange={(e) => setEnrollForm(prev => ({
                      ...prev,
                      studentId: e.target.value
                    }))}
                    placeholder="Enter student ID"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subject ID</label>
                  <Input
                    required
                    value={enrollForm.subjectId}
                    onChange={(e) => setEnrollForm(prev => ({
                      ...prev,
                      subjectId: e.target.value
                    }))}
                    placeholder="Enter subject ID"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Class ID</label>
                  <Input
                    required
                    value={enrollForm.classId}
                    onChange={(e) => setEnrollForm(prev => ({
                      ...prev,
                      classId: e.target.value
                    }))}
                    placeholder="Enter class ID"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Batch ID</label>
                  <Input
                    required
                    value={enrollForm.batchId}
                    onChange={(e) => setEnrollForm(prev => ({
                      ...prev,
                      batchId: e.target.value
                    }))}
                    placeholder="Enter batch ID"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Enrolling...' : 'Enroll'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowEnrollForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UnifiedEnrollmentManager;