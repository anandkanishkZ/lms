import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/src/features/common/components/Providers'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart School Management System',
  description: 'Complete school management platform for students, teachers, and administrators',
  keywords: ['school', 'management', 'education', 'learning', 'student', 'teacher', 'admin'],
  authors: [{ name: 'Smart School Team' }],
  creator: 'Smart School Team',
  publisher: 'Smart School',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
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