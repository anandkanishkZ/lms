'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  GraduationCap, 
  BookOpen, 
  Shield, 
  Menu,
  X,
  LogIn,
  UserCircle
} from 'lucide-react'

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900">
      {/* Navigation Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-600 rounded-xl p-2">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Free Education in Nepal
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">सिराहा, नेपाल</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {/* Login Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setLoginDropdownOpen(!loginDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                >
                  <LogIn className="h-4 w-4" />
                  <span>लगइन</span>
                </button>
                
                {loginDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <Link
                      href="/student/login"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setLoginDropdownOpen(false)}
                    >
                      <UserCircle className="h-5 w-5 text-emerald-600" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">विद्यार्थी</div>
                        <div className="text-xs text-gray-500">Student Login</div>
                      </div>
                    </Link>
                    <Link
                      href="/teacher/login"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setLoginDropdownOpen(false)}
                    >
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">शिक्षक</div>
                        <div className="text-xs text-gray-500">Teacher Login</div>
                      </div>
                    </Link>
                    <Link
                      href="/admin/login"
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setLoginDropdownOpen(false)}
                    >
                      <Shield className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">प्रशासक</div>
                        <div className="text-xs text-gray-500">Admin Login</div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-3">
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <p className="px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">लगइन गर्नुहोस्</p>
                  <Link
                    href="/student/login"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCircle className="h-5 w-5 text-emerald-600" />
                    <span>विद्यार्थी / Student</span>
                  </Link>
                  <Link
                    href="/teacher/login"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <span>शिक्षक / Teacher</span>
                  </Link>
                  <Link
                    href="/admin/login"
                    className="flex items-center space-x-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Shield className="h-5 w-5 text-purple-600" />
                    <span>प्रशासक / Admin</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 rounded-full blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-white dark:bg-gray-800 rounded-full p-6 shadow-2xl">
                <GraduationCap className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            <span className="block mb-2">Free Education in Nepal</span>
            <span className="block text-emerald-600 dark:text-emerald-400">
              निशुल्क शिक्षा अभियान
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-12">
            सिराहा जिल्लाका विद्यार्थीहरूलाई गुणस्तरीय शिक्षा प्रदान गर्दै
          </p>

          {/* Login Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            {/* Student Login */}
            <Link
              href="/student/login"
              className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-emerald-100 dark:bg-emerald-900/40 rounded-full p-6 mb-4 group-hover:scale-110 transition-transform">
                  <UserCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  विद्यार्थी
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Student Login
                </p>
                <div className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium group-hover:bg-emerald-700 transition-colors">
                  लगइन गर्नुहोस्
                </div>
              </div>
            </Link>

            {/* Teacher Login */}
            <Link
              href="/teacher/login"
              className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-blue-100 dark:bg-blue-900/40 rounded-full p-6 mb-4 group-hover:scale-110 transition-transform">
                  <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  शिक्षक
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Teacher Login
                </p>
                <div className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium group-hover:bg-blue-700 transition-colors">
                  लगइन गर्नुहोस्
                </div>
              </div>
            </Link>

            {/* Admin Login */}
            <Link
              href="/admin/login"
              className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 transform hover:scale-105 transition-all duration-300"
            >
              <div className="flex flex-col items-center text-center">
                <div className="bg-purple-100 dark:bg-purple-900/40 rounded-full p-6 mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  प्रशासक
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Admin Login
                </p>
                <div className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium group-hover:bg-purple-700 transition-colors">
                  लगइन गर्नुहोस्
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
