'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { obterIniciais } from '@/lib/utils'
import Image from 'next/image'

interface HeaderProps {
  title?: string
  showUser?: boolean
}

export default function Header({ title, showUser = true }: HeaderProps) {
  const { cliente } = useAuth()
  const { theme, setTheme } = useTheme()

  return (
    <header className="bg-gradient-to-r from-vinci-primary to-vinci-secondary text-white px-6 pt-safe pb-6 sticky top-0 z-40 shadow-lg">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Image src="/logo.png" alt="Vince Barbearia" width={64} height={64} className="object-contain" />
            <div>
              <h1 className="text-xl font-bold">Vince Barbearia</h1>
            </div>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {showUser && cliente && (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
              {obterIniciais(cliente.nome_completo)}
            </div>
            <div>
              <p className="text-sm text-white/80">Olá,</p>
              <p className="font-semibold">{cliente.nome_completo.split(' ')[0]}</p>
            </div>
          </div>
        )}

        {title && !showUser && (
          <div className="mt-2">
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
        )}
      </div>
    </header>
  )
}
