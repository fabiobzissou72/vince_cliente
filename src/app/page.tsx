'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'

export default function HomePage() {
  const router = useRouter()
  const { cliente, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (cliente) {
        // Se já está logado, redireciona para o dashboard
        router.push('/dashboard')
      } else {
        // Se não está logado, redireciona para login
        router.push('/login')
      }
    }
  }, [cliente, loading, router])

  // Tela de splash enquanto carrega
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-vinci-dark via-vinci-primary to-vinci-secondary">
      <div className="text-center space-y-6 animate-fadeIn">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse opacity-50">
            <Image src="/logo.png" alt="Vince Barbearia" width={120} height={120} className="mx-auto object-contain" />
          </div>
          <Image src="/logo.png" alt="Vince Barbearia" width={120} height={120} className="mx-auto object-contain relative z-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Vince</h1>
          <p className="text-vinci-accent text-lg">Barbearia</p>
        </div>

        <div className="flex items-center justify-center space-x-2 text-white/80">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      </div>

      <div className="absolute bottom-8 text-center text-white/60 text-xs">
        <p>© 2024 Vince Barbearia</p>
      </div>
    </div>
  )
}
