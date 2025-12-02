'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Switch } from '@/src/components/ui/switch';
import { Label } from '@/src/components/ui/label';
import { Input } from '@/src/components/ui/input';
import { noticeApi, NotificationPreferences } from '@/services/notice-api.service';
import { toast } from 'sonner';
import { Bell, Mail, Smartphone, Moon, Save, Loader2 } from 'lucide-react';

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const data = await noticeApi.getNotificationPreferences();
      setPreferences(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (field: keyof NotificationPreferences) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [field]: !preferences[field] });
    setHasChanges(true);
  };

  const handleTimeChange = (field: 'quietHoursStart' | 'quietHoursEnd', value: string) => {
    if (!preferences) return;
    setPreferences({ ...preferences, [field]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      await noticeApi.updateNotificationPreferences(preferences);
      toast.success('Preferences saved successfully');
      setHasChanges(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Unable to load preferences</p>
            <Button onClick={fetchPreferences} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notification Preferences</h1>
          <p className="text-gray-500 mt-1">
            Customize how you receive notices and announcements
          </p>
        </div>
        {hasChanges && (
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      {/* Delivery Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Delivery Methods
          </CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" />
                <Label htmlFor="inApp" className="text-base font-medium">
                  In-App Notifications
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                Receive notifications in the application
              </p>
            </div>
            <Switch
              id="inApp"
              checked={preferences.inAppEnabled}
              onCheckedChange={() => handleToggle('inAppEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-green-500" />
                <Label htmlFor="email" className="text-base font-medium">
                  Email Notifications
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="email"
              checked={preferences.emailEnabled}
              onCheckedChange={() => handleToggle('emailEnabled')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-500" />
                <Label htmlFor="push" className="text-base font-medium">
                  Push Notifications
                </Label>
              </div>
              <p className="text-sm text-gray-500">
                Receive push notifications on your device
              </p>
            </div>
            <Switch
              id="push"
              checked={preferences.pushEnabled}
              onCheckedChange={() => handleToggle('pushEnabled')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>
            Choose which types of notices you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="exam" className="text-base font-medium">
                📝 Exam Notifications
              </Label>
              <p className="text-sm text-gray-500">
                Exam schedules, results, and updates
              </p>
            </div>
            <Switch
              id="exam"
              checked={preferences.examNotifications}
              onCheckedChange={() => handleToggle('examNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="event" className="text-base font-medium">
                🎉 Event Notifications
              </Label>
              <p className="text-sm text-gray-500">
                School events, activities, and programs
              </p>
            </div>
            <Switch
              id="event"
              checked={preferences.eventNotifications}
              onCheckedChange={() => handleToggle('eventNotifications')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="general" className="text-base font-medium">
                📢 General Announcements
              </Label>
              <p className="text-sm text-gray-500">
                General notices and announcements
              </p>
            </div>
            <Switch
              id="general"
              checked={preferences.generalNotifications}
              onCheckedChange={() => handleToggle('generalNotifications')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Priority Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Settings</CardTitle>
          <CardDescription>
            Receive only urgent notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="urgent" className="text-base font-medium">
                🔴 Urgent Only Mode
              </Label>
              <p className="text-sm text-gray-500">
                Only receive notifications marked as urgent
              </p>
            </div>
            <Switch
              id="urgent"
              checked={preferences.urgentOnly}
              onCheckedChange={() => handleToggle('urgentOnly')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Moon className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set a time range when you don&apos;t want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="quietEnabled" className="text-base font-medium">
                Enable Quiet Hours
              </Label>
              <p className="text-sm text-gray-500">
                Pause notifications during specified hours
              </p>
            </div>
            <Switch
              id="quietEnabled"
              checked={preferences.quietHoursEnabled}
              onCheckedChange={() => handleToggle('quietHoursEnabled')}
            />
          </div>

          {preferences.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quietStart">Start Time</Label>
                <Input
                  id="quietStart"
                  type="time"
                  value={preferences.quietHoursStart || '22:00'}
                  onChange={(e) => handleTimeChange('quietHoursStart', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quietEnd">End Time</Label>
                <Input
                  id="quietEnd"
                  type="time"
                  value={preferences.quietHoursEnd || '08:00'}
                  onChange={(e) => handleTimeChange('quietHoursEnd', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button (Bottom) */}
      {hasChanges && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                You have unsaved changes to your notification preferences
              </p>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
