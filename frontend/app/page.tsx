'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Shield, 
  ChevronRight,
  Sparkles,
  Award,
  Target
} from 'lucide-react'

export default function HomePage() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)

  const userRoles = [
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage the entire platform, users, and system settings',
      icon: Shield,
      color: 'from-purple-500 to-purple-700',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
      hoverColor: 'hover:shadow-purple-500/50',
      iconBg: 'bg-purple-100 dark:bg-purple-900/40',
      href: '/admin/login',
      features: ['User Management', 'System Configuration', 'Analytics & Reports', 'Full Access Control']
    },
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Create courses, manage content, and track student progress',
      icon: BookOpen,
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      hoverColor: 'hover:shadow-blue-500/50',
      iconBg: 'bg-blue-100 dark:bg-blue-900/40',
      href: '/teacher/login',
      features: ['Content Management', 'Student Progress', 'Grade & Feedback', 'Live Classes']
    },
    {
      id: 'student',
      title: 'Student',
      description: 'Access courses, track progress, and enhance your learning',
      icon: GraduationCap,
      color: 'from-green-500 to-green-700',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      hoverColor: 'hover:shadow-green-500/50',
      iconBg: 'bg-green-100 dark:bg-green-900/40',
      href: '/student/login',
      features: ['Course Access', 'Progress Tracking', 'Assignments & Quizzes', 'Certificates']
    }
  ]

  const stats = [
    { label: 'Active Students', value: '2,500+', icon: Users },
    { label: 'Expert Teachers', value: '150+', icon: Award },
    { label: 'Courses Available', value: '100+', icon: Target },
    { label: 'Success Rate', value: '95%', icon: Sparkles }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500 blur-3xl animate-pulse" />
          <div className="absolute top-60 -left-40 h-80 w-80 rounded-full bg-blue-500 blur-3xl animate-pulse delay-1000" />
          <div className="absolute bottom-20 right-20 h-60 w-60 rounded-full bg-green-500 blur-3xl animate-pulse delay-2000" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16 animate-in">
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-50 animate-pulse" />
                <div className="relative bg-white dark:bg-gray-800 rounded-full p-4 shadow-xl">
                  <GraduationCap className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
              <span className="block">Smart School</span>
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Empowering education through innovative technology. 
              Choose your role and experience seamless learning management.
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <stat.icon className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Login Cards */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-10">
              Select Your Portal
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {userRoles.map((role, index) => {
                const Icon = role.icon
                const isHovered = hoveredCard === role.id

                return (
                  <Link
                    key={role.id}
                    href={role.href}
                    onMouseEnter={() => setHoveredCard(role.id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    className="group"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <div
                      className={`
                        relative overflow-hidden rounded-3xl border-2 ${role.borderColor}
                        ${role.bgColor} backdrop-blur-sm
                        transform transition-all duration-500 ease-out
                        hover:scale-105 hover:-translate-y-2 hover:shadow-2xl ${role.hoverColor}
                        cursor-pointer
                      `}
                    >
                      {/* Animated gradient overlay */}
                      <div className={`
                        absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 
                        group-hover:opacity-10 transition-opacity duration-500
                      `} />

                      <div className="relative p-8">
                        {/* Icon */}
                        <div className={`
                          inline-flex items-center justify-center mb-6
                          h-16 w-16 rounded-2xl ${role.iconBg}
                          transform transition-transform duration-500
                          group-hover:rotate-12 group-hover:scale-110
                        `}>
                          <Icon className={`h-8 w-8 bg-gradient-to-br ${role.color} bg-clip-text text-transparent`} 
                                strokeWidth={2.5} />
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {role.title}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-300 mb-6 min-h-[3rem]">
                          {role.description}
                        </p>

                        {/* Features */}
                        <ul className="space-y-2 mb-6">
                          {role.features.map((feature, idx) => (
                            <li 
                              key={idx} 
                              className="flex items-center text-sm text-gray-600 dark:text-gray-400"
                              style={{ 
                                opacity: isHovered ? 1 : 0.7,
                                transform: isHovered ? 'translateX(4px)' : 'translateX(0)',
                                transition: `all 0.3s ease-out ${idx * 50}ms`
                              }}
                            >
                              <div className={`h-1.5 w-1.5 rounded-full bg-gradient-to-r ${role.color} mr-2`} />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        {/* CTA Button */}
                        <div className={`
                          flex items-center justify-between px-4 py-3 rounded-xl
                          bg-gradient-to-r ${role.color}
                          text-white font-semibold
                          transform transition-all duration-300
                          group-hover:shadow-lg
                        `}>
                          <span>Login as {role.title}</span>
                          <ChevronRight className={`
                            h-5 w-5 transform transition-transform duration-300
                            ${isHovered ? 'translate-x-1' : ''}
                          `} />
                        </div>
                      </div>

                      {/* Corner decoration */}
                      <div className={`
                        absolute -top-6 -right-6 h-20 w-20 rounded-full
                        bg-gradient-to-br ${role.color} opacity-20 blur-2xl
                        group-hover:opacity-30 transition-opacity duration-500
                      `} />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20 text-center max-w-4xl mx-auto">
            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl p-10 shadow-2xl border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Our Platform?
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Experience cutting-edge educational technology designed for the modern learning environment
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Modern Interface</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Intuitive design for seamless navigation</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Goal Tracking</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Monitor progress in real-time</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Achievements</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Earn certificates and rewards</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-20 text-center text-gray-600 dark:text-gray-400">
            <p className="text-sm">
              © 2025 Smart School Management System. All rights reserved.
            </p>
            <p className="text-xs mt-2">
              Empowering education through technology
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}