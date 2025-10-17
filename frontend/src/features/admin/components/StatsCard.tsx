'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'indigo';
  description?: string;
}

const colorVariants = {
  blue: {
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    light: 'bg-blue-100',
  },
  green: {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    light: 'bg-green-100',
  },
  purple: {
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    light: 'bg-purple-100',
  },
  orange: {
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    light: 'bg-orange-100',
  },
  red: {
    gradient: 'from-red-500 to-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    light: 'bg-red-100',
  },
  indigo: {
    gradient: 'from-indigo-500 to-indigo-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    light: 'bg-indigo-100',
  },
};

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color,
  description,
}: StatsCardProps) {
  const colors = colorVariants[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl bg-white border ${colors.border} p-6 hover:shadow-xl hover:shadow-${color}-500/10 transition-all duration-300 shadow-lg`}
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} rounded-full blur-3xl`}></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r ${colors.gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          change.type === 'increase' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        {description && (
          <p className="text-gray-500 text-xs">{description}</p>
        )}
      </div>

      {/* Trend Line Visualization */}
      <div className="mt-4 h-1 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(Math.abs(change.value) * 2, 100)}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full bg-gradient-to-r ${colors.gradient} rounded-full`}
        />
      </div>
    </motion.div>
  );
}