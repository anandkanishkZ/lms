'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Sample data
const enrollmentData = [
  { month: 'Jan', students: 1120, teachers: 78 },
  { month: 'Feb', students: 1180, teachers: 82 },
  { month: 'Mar', students: 1234, teachers: 89 },
  { month: 'Apr', students: 1289, teachers: 94 },
  { month: 'May', students: 1345, teachers: 98 },
  { month: 'Jun', students: 1234, teachers: 89 },
];

const courseData = [
  { category: 'Programming', count: 24, color: '#3b82f6' },
  { category: 'Design', count: 18, color: '#8b5cf6' },
  { category: 'Business', count: 14, color: '#10b981' },
  { category: 'Marketing', count: 12, color: '#f59e0b' },
  { category: 'Others', count: 8, color: '#ef4444' },
];

const activityData = [
  { time: '00:00', active: 12 },
  { time: '04:00', active: 8 },
  { time: '08:00', active: 145 },
  { time: '12:00', active: 234 },
  { time: '16:00', active: 189 },
  { time: '20:00', active: 167 },
];

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-lg ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      {children}
    </motion.div>
  );
}

export function EnrollmentChart() {
  return (
    <ChartCard title="Student & Teacher Growth">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={enrollmentData}>
          <defs>
            <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#111827',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }} 
          />
          <Area
            type="monotone"
            dataKey="students"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorStudents)"
          />
          <Area
            type="monotone"
            dataKey="teachers"
            stroke="#8b5cf6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTeachers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function CourseDistributionChart() {
  return (
    <ChartCard title="Module Distribution">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={courseData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="count"
          >
            {courseData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#111827',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }} 
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 grid grid-cols-2 gap-2">
        {courseData.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-700">{item.category}</span>
            <span className="text-sm text-gray-500">({item.count})</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function ActivityChart() {
  return (
    <ChartCard title="Daily Active Users">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={activityData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              color: '#111827',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
            }} 
          />
          <Bar dataKey="active" fill="#10b981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}