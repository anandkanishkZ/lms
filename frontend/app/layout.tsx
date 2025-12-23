import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/src/features/common/components/Providers'
import { PWAInstaller } from '@/src/components/PWAInstaller'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Free Education in Nepal - LMS',
  description: 'Complete Learning Management System for Free Education in Nepal - SEE Exam Preparation for students in Siraha district',
  keywords: ['nepal', 'education', 'free education', 'SEE exam', 'learning', 'student', 'teacher', 'siraha', 'lms'],
  authors: [{ name: 'Free Education in Nepal' }],
  creator: 'Free Education in Nepal',
  publisher: 'Free Education in Nepal',
  applicationName: 'Nepal LMS',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nepal LMS',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#059669' },
    { media: '(prefers-color-scheme: dark)', color: '#047857' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ne" suppressHydrationWarning>
      <body className={inter.className}>
        <PWAInstaller />
        <Providers>
          {children}
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            className="mt-16"
          />
          <Toaster richColors position="top-right" />
        </Providers>
      </body>
    </html>
  )
}