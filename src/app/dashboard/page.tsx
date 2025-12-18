'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { Calendar, Clock, Scissors, TrendingUp, Loader2, ChevronRight } from 'lucide-react'
import { buscarAgendamentosCliente } from '@/lib/agendamentos'
import { Agendamento } from '@/lib/supabase'
import { formatarData, formatarDinheiro } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const { cliente, loading: authLoading } = useAuth()
  const [proximosAgendamentos, setProximosAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !cliente) {
      router.push('/login')
    }
  }, [authLoading, cliente, router])

  useEffect(() => {
    if (cliente) {
      carregarProximosAgendamentos()
    }
  }, [cliente])

  const carregarProximosAgendamentos = async () => {
    if (!cliente) return

    setLoading(true)
    const agendamentos = await buscarAgendamentosCliente(cliente.id, 'proximos')
    setProximosAgendamentos(agendamentos.slice(0, 3)) // Mostra apenas os 3 próximos
    setLoading(false)
  }

  if (authLoading || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vinci-primary" />
      </div>
    )
  }

  const proximoAgendamento = proximosAgendamentos[0]

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header showUser />

      <main className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Próximo agendamento em destaque */}
        {proximoAgendamento ? (
          <div className="card bg-gradient-to-br from-vinci-primary to-vinci-secondary text-white p-6 animate-fadeIn">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm mb-1">Próximo agendamento</p>
                <h3 className="text-xl font-bold">
                  {formatarData(proximoAgendamento.data_agendamento, 'EEEE, dd/MM')}
                </h3>
              </div>
              <div className={`badge ${proximoAgendamento.status === 'confirmado' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                {proximoAgendamento.status}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-white/80" />
                <span className="font-medium">{proximoAgendamento.hora_inicio}</span>
              </div>

              {proximoAgendamento.profissional && (
                <div className="flex items-center space-x-3">
                  <Scissors className="w-5 h-5 text-white/80" />
                  <span>{proximoAgendamento.profissional.nome}</span>
                </div>
              )}

              {proximoAgendamento.servico && (
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-white/80" />
                  <span>
                    {proximoAgendamento.servico.nome} - {formatarDinheiro(proximoAgendamento.servico.preco)}
                  </span>
                </div>
              )}
            </div>

            <Link
              href="/agendamentos"
              className="mt-4 inline-flex items-center text-sm font-medium hover:underline"
            >
              Ver detalhes
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ) : (
          <div className="card bg-gradient-to-br from-vinci-primary to-vinci-secondary text-white p-6 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-80" />
            <h3 className="text-lg font-bold mb-2">Nenhum agendamento</h3>
            <p className="text-white/80 mb-4">Que tal agendar um horário?</p>
            <Link href="/agendar" className="btn-secondary inline-block bg-white text-vinci-primary border-white hover:bg-white/90">
              Agendar agora
            </Link>
          </div>
        )}

        {/* Ações rápidas */}
        <div>
          <h2 className="text-lg font-bold mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/agendar"
              className="card hover:shadow-lg transition-all active:scale-95 text-center p-6"
            >
              <Calendar className="w-10 h-10 mx-auto mb-3 text-vinci-primary" />
              <p className="font-medium">Novo Agendamento</p>
            </Link>

            <Link
              href="/agendamentos"
              className="card hover:shadow-lg transition-all active:scale-95 text-center p-6"
            >
              <Clock className="w-10 h-10 mx-auto mb-3 text-vinci-primary" />
              <p className="font-medium">Meus Horários</p>
            </Link>
          </div>
        </div>

        {/* Lista de próximos agendamentos */}
        {proximosAgendamentos.length > 1 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Próximos Agendamentos</h2>
              <Link href="/agendamentos" className="text-sm text-vinci-primary hover:text-vinci-secondary">
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {proximosAgendamentos.slice(1).map((agendamento) => (
                <div key={agendamento.id} className="card p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{formatarData(agendamento.data_agendamento, 'dd/MM/yyyy')}</p>
                    <p className="text-sm text-muted-foreground">{agendamento.hora_inicio}</p>
                    {agendamento.profissional && (
                      <p className="text-sm text-muted-foreground">{agendamento.profissional.nome}</p>
                    )}
                  </div>
                  <div className={`badge badge-${agendamento.status}`}>
                    {agendamento.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Informações úteis */}
        <div className="card bg-vinci-primary/5 border-vinci-primary/20 p-4">
          <h3 className="font-bold mb-2 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-vinci-primary" />
            Horário de Funcionamento
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Segunda a Sexta: 09:00 - 20:00</p>
            <p>Sábado: 09:00 - 18:00</p>
            <p>Domingo: Fechado</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
