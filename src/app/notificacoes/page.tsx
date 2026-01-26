'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { Bell, CheckCircle, Calendar, Clock, Scissors, Loader2, X } from 'lucide-react'

interface Notificacao {
  id: string
  tipo: 'lembrete_24h' | 'lembrete_2h' | 'followup_3d' | 'followup_21d'
  titulo: string
  mensagem: string
  data: string
  hora: string
  barbeiro: string
  agendamento_id: string
  lida: boolean
}

export default function NotificacoesPage() {
  const router = useRouter()
  const { cliente, loading: authLoading } = useAuth()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !cliente) {
      router.push('/login')
    }
  }, [authLoading, cliente, router])

  useEffect(() => {
    if (cliente) {
      carregarNotificacoes()
    }
  }, [cliente])

  const carregarNotificacoes = async () => {
    if (!cliente) return

    setLoading(true)
    try {
      const response = await fetch(`/api/notificacoes?cliente_id=${cliente.id}`)
      const result = await response.json()

      if (result.success) {
        setNotificacoes(result.data.notificacoes)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLida = async (notificacaoId: string) => {
    if (!cliente) return

    try {
      await fetch('/api/notificacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: cliente.id,
          notificacao_id: notificacaoId
        })
      })

      // Atualizar estado local
      setNotificacoes(prev =>
        prev.map(n =>
          n.id === notificacaoId ? { ...n, lida: true } : n
        )
      )
    } catch (error) {
      console.error('Erro ao marcar como lida:', error)
    }
  }

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'lembrete_24h':
        return <Calendar className="w-6 h-6" />
      case 'lembrete_2h':
        return <Clock className="w-6 h-6" />
      case 'followup_3d':
        return <CheckCircle className="w-6 h-6" />
      case 'followup_21d':
        return <Scissors className="w-6 h-6" />
      default:
        return <Bell className="w-6 h-6" />
    }
  }

  const getCor = (tipo: string) => {
    switch (tipo) {
      case 'lembrete_24h':
        return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
      case 'lembrete_2h':
        return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
      case 'followup_3d':
        return 'text-green-500 bg-green-50 dark:bg-green-900/20'
      case 'followup_21d':
        return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
      default:
        return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  if (authLoading || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vinci-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header
        showUser
        title="Notificações"
        action={
          notificacoes.length > 0 && (
            <button
              onClick={() => {
                notificacoes.filter(n => !n.lida).forEach(n => marcarComoLida(n.id))
              }}
              className="text-sm text-vinci-primary"
            >
              Marcar todas como lidas
            </button>
          )
        }
      />

      <main className="max-w-2xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-vinci-primary" />
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Você não tem notificações no momento
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notificacoes.map((notificacao) => (
              <div
                key={notificacao.id}
                className={`card p-4 transition-all ${
                  !notificacao.lida
                    ? 'border-l-4 border-l-vinci-primary bg-vinci-primary/5'
                    : 'opacity-70'
                }`}
                onClick={() => !notificacao.lida && marcarComoLida(notificacao.id)}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-full ${getCor(notificacao.tipo)}`}>
                    {getIcone(notificacao.tipo)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {notificacao.titulo}
                      </h4>
                      {!notificacao.lida && (
                        <span className="w-2 h-2 bg-vinci-primary rounded-full flex-shrink-0 mt-2" />
                      )}
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 mb-2">
                      {notificacao.mensagem}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        {notificacao.data} às {notificacao.hora}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {notificacao.barbeiro}
                      </span>
                    </div>
                  </div>

                  {!notificacao.lida && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        marcarComoLida(notificacao.id)
                      }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
