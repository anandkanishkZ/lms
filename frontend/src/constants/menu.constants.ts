import {
  Home,
  Users,
  BookOpen,
  GraduationCap,
  Calendar,
  FileText,
  Award,
  BarChart3,
  MessageSquare,
  Bell,
  CreditCard,
  Shield,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Cloud,
  Mail,
  Phone,
  HelpCircle,
  Settings,
  LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/src/config/routes.config';

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const ADMIN_MENU_ITEMS: MenuItem[] = [
  { icon: Home, label: 'Dashboard', href: ROUTES.admin.dashboard },
  { icon: Users, label: 'Users', href: ROUTES.admin.users },
  { icon: BookOpen, label: 'Modules', href: ROUTES.admin.courses },
  { icon: GraduationCap, label: 'Live Classes', href: ROUTES.admin.classes },
  { icon: Calendar, label: 'Schedule', href: ROUTES.admin.schedule },
  { icon: FileText, label: 'Assignments', href: ROUTES.admin.assignments },
  { icon: Award, label: 'Certificates', href: ROUTES.admin.certificates },
  { icon: BarChart3, label: 'Analytics', href: ROUTES.admin.analytics },
  { icon: MessageSquare, label: 'Messages', href: ROUTES.admin.messages },
  { icon: Bell, label: 'Notifications', href: ROUTES.admin.notifications },
  { icon: CreditCard, label: 'Billing', href: ROUTES.admin.billing },
  { icon: Shield, label: 'Security', href: ROUTES.admin.security },
  { icon: Database, label: 'Backup', href: ROUTES.admin.backup },
  { icon: Globe, label: 'Integration', href: ROUTES.admin.integration },
  { icon: Smartphone, label: 'Mobile App', href: ROUTES.admin.mobile },
  { icon: Monitor, label: 'System Monitor', href: ROUTES.admin.monitor },
  { icon: Cloud, label: 'Cloud Storage', href: ROUTES.admin.storage },
  { icon: Mail, label: 'Email Templates', href: ROUTES.admin.email },
  { icon: Phone, label: 'Support', href: ROUTES.admin.support },
  { icon: HelpCircle, label: 'Help Center', href: ROUTES.admin.help },
  { icon: Settings, label: 'Settings', href: ROUTES.admin.settings },
];
