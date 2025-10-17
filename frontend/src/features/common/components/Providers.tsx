'use client'

import { ReactNode } from 'react'
import { ReactQueryProvider } from '@/src/lib/react-query'
import { ReduxProvider } from '@/src/store/ReduxProvider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReduxProvider>
      <ReactQueryProvider>
        {children}
      </ReactQueryProvider>
    </ReduxProvider>
  )
}
