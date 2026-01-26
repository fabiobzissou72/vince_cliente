'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function NotificationBadge() {
  const { cliente } = useAuth()
  const [naoLidas, setNaoLidas] = useState(0)

  useEffect(() => {
    if (cliente) {
      carregarNaoLidas()
      // Atualizar a cada 30 segundos
      const interval = setInterval(carregarNaoLidas, 30000)
      return () => clearInterval(interval)
    }
  }, [cliente])

  const carregarNaoLidas = async () => {
    if (!cliente) return

    try {
      const response = await fetch(`/api/notificacoes?cliente_id=${cliente.id}`)
      const result = await response.json()

      if (result.success) {
        setNaoLidas(result.data.nao_lidas)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações não lidas:', error)
    }
  }

  return (
    <Link href="/notificacoes" className="relative p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
      <Bell className="w-6 h-6 text-slate-600 dark:text-slate-300" />
      {naoLidas > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {naoLidas > 9 ? '9+' : naoLidas}
        </span>
      )}
    </Link>
  )
}
