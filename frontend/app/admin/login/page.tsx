'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { showSuccessToast, showErrorToast } from '@/src/utils/toast.util';
import { Eye, EyeOff, Lock, User, AlertCircle } from 'lucide-react';
import { adminApiService } from '@/src/features/admin';
import { ROUTES } from '@/src/config/routes.config';
import { DEMO_CREDENTIALS } from '@/src/constants/demo.constants';
import { useAppSelector } from '@/src/store/hooks';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const fillDemoCredentials = () => {
    setValue('email', DEMO_CREDENTIALS.admin.email);
    setValue('password', DEMO_CREDENTIALS.admin.password);
    showSuccessToast('Demo credentials filled!');
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      console.log('🔐 Login attempt:', { email: data.email });
      
      const response = await adminApiService.login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe || false,
      });

      console.log('🔐 Login response:', response);

      if (response.success && response.data) {
        console.log('✅ Login successful, tokens:', {
          hasAccessToken: !!response.data.accessToken,
          hasRefreshToken: !!response.data.refreshToken,
          hasUser: !!response.data.user
        });
        
        showSuccessToast('Login successful!');
        
        console.log('✅ Redirecting to dashboard...');
        router.push(ROUTES.admin.dashboard);
      } else {
        console.error('❌ Login failed:', response.message);
        showErrorToast(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      showErrorToast(error?.message || 'Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-gray-900 flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-black/20"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-slate-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-blue-200/80">Sign in to access the admin dashboard</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-300 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email.message}
                </motion.p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-300 flex items-center"
                >
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password.message}
                </motion.p>
              )}
            </div>

            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-blue-200">Demo Credentials:</h4>
                <motion.button
                  type="button"
                  onClick={fillDemoCredentials}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-medium rounded-md transition-colors duration-200 border border-blue-500/50"
                >
                  Fill Demo
                </motion.button>
              </div>
              <p className="text-xs text-blue-300">
                Email: <span className="font-mono bg-blue-900/50 px-1 rounded">{DEMO_CREDENTIALS.admin.email}</span><br />
                Password: <span className="font-mono bg-blue-900/50 px-1 rounded">{DEMO_CREDENTIALS.admin.password}</span>
              </p>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 to-slate-600 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:from-blue-600 hover:to-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-blue-200/60">
              Secure admin access for LMS management
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
