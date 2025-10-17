import { LoginForm } from '@/src/features/auth/components/LoginForm'

export default function HomePage() {
  // For now, redirect to login page
  // Later, we'll check authentication and redirect accordingly
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container flex min-h-screen items-center justify-center py-12">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Smart School Management
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sign in to access your dashboard
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}