/**
 * Profile Page Template
 * Complete user profile page with viewing and editing capabilities
 * Includes: Profile header, About/Modules/Activity tabs, Edit mode, Settings
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select } from '../ui/Select';
import { FileUpload } from '../ui/FileUpload';
import { Avatar } from '../ui/Avatar';
import { Tabs } from '../ui/Tabs';
import { Table } from '../ui/Table';
import { cn } from '@/lib/utils';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  bio?: string;
  location?: string;
  website?: string;
  joinedDate: Date;
  stats: {
    modulesEnrolled?: number;
    modulesTeaching?: number;
    totalStudents?: number;
    completedModules?: number;
    certificatesEarned?: number;
    totalLearningHours?: number;
  };
}

export interface EnrolledModule {
  id: string;
  title: string;
  thumbnail?: string;
  progress: number;
  instructor: string;
  status: 'in-progress' | 'completed';
  lastAccessed: Date;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  type: 'module' | 'exam' | 'certificate' | 'system';
}

export interface ProfilePageTemplateProps {
  profile: UserProfile;
  enrolledModules?: EnrolledModule[];
  activityLogs?: ActivityLog[];
  isOwnProfile: boolean;
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: (updates: Partial<UserProfile>) => void;
  onAvatarChange?: (file: File) => void;
  onPasswordChange?: (oldPassword: string, newPassword: string) => void;
  onModuleClick?: (moduleId: string) => void;
  loading?: boolean;
  className?: string;
}

/**
 * Profile Page Template
 */
export const ProfilePageTemplate: React.FC<ProfilePageTemplateProps> = ({
  profile,
  enrolledModules = [],
  activityLogs = [],
  isOwnProfile,
  isEditing,
  onEditToggle,
  onSave,
  onAvatarChange,
  onPasswordChange,
  onModuleClick,
  loading = false,
  className,
}) => {
  const [formData, setFormData] = React.useState<Partial<UserProfile>>(profile);
  const [passwordData, setPasswordData] = React.useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSave = () => {
    onSave(formData);
    onEditToggle();
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword === passwordData.confirmPassword) {
      onPasswordChange?.(passwordData.oldPassword, passwordData.newPassword);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'instructor':
        return 'blue';
      case 'student':
        return 'green';
      default:
        return 'blue';
    }
  };

  if (loading) {
    return <ProfilePageSkeleton />;
  }

  return (
    <div className={cn('max-w-6xl mx-auto p-6 space-y-6', className)}>
      {/* Profile Header */}
      <Card className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <Avatar src={profile.avatar} alt={profile.name} size="2xl" />
            {isOwnProfile && isEditing && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <label className="cursor-pointer text-white text-xs">
                  Change
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) onAvatarChange?.(file);
                    }}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  label="Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <Input
                  label="Location"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="City, Country"
                />
                <Input
                  label="Website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://"
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {profile.name}
                  </h1>
                  <Badge color={getRoleBadgeColor(profile.role)} size="lg">
                    {profile.role}
                  </Badge>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {profile.email}
                </p>
                {(profile.location || profile.website) && (
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {profile.location && (
                      <span className="flex items-center gap-1">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {profile.location}
                      </span>
                    )}
                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        Website
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Joined {new Date(profile.joinedDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          {isOwnProfile && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={onEditToggle}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={onEditToggle}>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          {profile.role === 'student' && (
            <>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {profile.stats.modulesEnrolled || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enrolled Modules</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {profile.stats.completedModules || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {profile.stats.certificatesEarned || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Certificates</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {profile.stats.totalLearningHours || 0}h
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Learning Time</p>
              </div>
            </>
          )}
          {profile.role === 'instructor' && (
            <>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {profile.stats.modulesTeaching || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Modules Teaching</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {profile.stats.totalStudents || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Students</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Tabs Content */}
      <Tabs
        tabs={[
          {
            value: 'about',
            label: 'About',
            content: (
              <Card className="p-6">
                {isEditing ? (
                  <Textarea
                    label="Bio"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={6}
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      About
                    </h3>
                    {profile.bio ? (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        No bio added yet.
                      </p>
                    )}
                  </div>
                )}
              </Card>
            ),
          },
          {
            value: 'modules',
            label: `Modules (${enrolledModules.length})`,
            content: (
              <div className="space-y-4">
                {enrolledModules.length === 0 ? (
                  <Card className="p-8">
                    <p className="text-center text-gray-500 dark:text-gray-400">
                      No modules enrolled yet.
                    </p>
                  </Card>
                ) : (
                  enrolledModules.map((module) => (
                    <Card key={module.id} className="p-6">
                      <div className="flex items-center gap-4">
                        {module.thumbnail && (
                          <img
                            src={module.thumbnail}
                            alt={module.title}
                            className="w-32 h-20 object-cover rounded-lg shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => onModuleClick?.(module.id)}
                            className="text-left"
                          >
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 truncate">
                              {module.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              by {module.instructor}
                            </p>
                          </button>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">Progress</span>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {module.progress}%
                              </span>
                            </div>
                            <Progress value={module.progress} size="sm" />
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <Badge color={module.status === 'completed' ? 'green' : 'blue'} size="sm">
                                {module.status === 'completed' ? 'Completed' : 'In Progress'}
                              </Badge>
                              <span>Last accessed: {new Date(module.lastAccessed).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            ),
          },
          {
            value: 'activity',
            label: 'Activity',
            content: (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Activity
                </h3>
                {activityLogs.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No activity yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <div className="mt-1">
                          {log.type === 'module' && (
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                            </div>
                          )}
                          {log.type === 'exam' && (
                            <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          )}
                          {log.type === 'certificate' && (
                            <div className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                              <svg className="h-4 w-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.action}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {log.description}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ),
          },
          ...(isOwnProfile ? [{
            value: 'settings',
            label: 'Settings',
            content: (
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Account Settings
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Email"
                      type="email"
                      value={profile.email}
                      disabled
                      helperText="Contact admin to change email"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Change Password
                  </h3>
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                    />
                    <Input
                      label="New Password"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                    <Input
                      label="Confirm New Password"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      helperText={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword ? 'Passwords do not match' : undefined}
                    />
                    <Button
                      onClick={handlePasswordChange}
                      disabled={
                        !passwordData.oldPassword ||
                        !passwordData.newPassword ||
                        passwordData.newPassword !== passwordData.confirmPassword
                      }
                    >
                      Update Password
                    </Button>
                  </div>
                </div>
              </Card>
            ),
          }] : []),
        ]}
        variant="pills"
      />
    </div>
  );
};

/**
 * Profile Page Skeleton (Loading state)
 */
export const ProfilePageSkeleton: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card className="p-8">
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </Card>
    </div>
  );
};
