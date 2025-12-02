'use client';

import { useState, useEffect } from 'react';
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
import { 
  dashboardApiService, 
  EnrollmentGrowthData, 
  CourseDistribution, 
  ActivityChartData 
} from '@/src/services/dashboard-api.service';

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
  const [data, setData] = useState<EnrollmentGrowthData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await dashboardApiService.getEnrollmentGrowth();
      setData(result);
    } catch (error) {
      console.error('Error fetching enrollment data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ChartCard title="Student & Teacher Growth">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Student & Teacher Growth">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
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
  const [data, setData] = useState<CourseDistribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await dashboardApiService.getCourseDistribution();
      setData(result);
    } catch (error) {
      console.error('Error fetching course distribution:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ChartCard title="Course Distribution">
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </ChartCard>
    );
  }

  if (data.length === 0) {
    return (
      <ChartCard title="Course Distribution">
        <div className="h-[300px] flex items-center justify-center">
          <p className="text-gray-500">No course data available</p>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Course Distribution">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
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
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-700">{item.name}</span>
            <span className="text-sm text-gray-500">({item.value})</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function ActivityChart() {
  const [data, setData] = useState<ActivityChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const result = await dashboardApiService.getActivityChart();
      setData(result);
    } catch (error) {
      console.error('Error fetching activity chart:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ChartCard title="Daily Activity (Last 30 Days)">
        <div className="h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Daily Activity (Last 30 Days)">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
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
          <Bar dataKey="enrollments" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Enrollments" />
          <Bar dataKey="classes" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Classes" />
          <Bar dataKey="exams" fill="#10b981" radius={[4, 4, 0, 0]} name="Exams" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
