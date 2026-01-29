'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'sonner'
import InstallPrompt from '@/components/InstallPrompt'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        {children}
        <Toaster position="top-center" richColors />
        <InstallPrompt />
      </AuthProvider>
    </ThemeProvider>
  )
}
