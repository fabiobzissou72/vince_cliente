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
    const agendamentos = await buscarAgendamentosCliente(cliente.telefone, 'proximos')
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
            <Link href="/agendar" className="inline-block px-6 py-3 bg-white text-vinci-primary font-semibold rounded-lg border-2 border-white hover:bg-white/90 transition-colors">
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
              className="card bg-white dark:bg-slate-800 hover:shadow-lg transition-all active:scale-95 text-center p-6 border border-vinci-primary/20"
            >
              <Calendar className="w-10 h-10 mx-auto mb-3 text-vinci-primary dark:text-vinci-accent" />
              <p className="font-medium text-slate-900 dark:text-white">Novo Agendamento</p>
            </Link>

            <Link
              href="/agendamentos"
              className="card bg-white dark:bg-slate-800 hover:shadow-lg transition-all active:scale-95 text-center p-6 border border-vinci-primary/20"
            >
              <Clock className="w-10 h-10 mx-auto mb-3 text-vinci-primary dark:text-vinci-accent" />
              <p className="font-medium text-slate-900 dark:text-white">Meus Horários</p>
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
          <h3 className="font-bold mb-3 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-vinci-primary dark:text-vinci-accent" />
            Horário de Funcionamento
          </h3>
          <div className="text-sm text-muted-foreground space-y-1 mb-4">
            <p>Segunda a Sexta: 09:00 - 20:00</p>
            <p>Sábado: 09:00 - 18:00</p>
            <p>Domingo: Fechado</p>
          </div>

          <div className="mt-3 pt-3 border-t border-vinci-primary/20">
            <h3 className="font-bold mb-2 flex items-center text-slate-900 dark:text-white">
              <svg className="w-5 h-5 mr-2 text-vinci-primary dark:text-vinci-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Endereço
            </h3>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=Rua+9+c/+Rua+t-53,+2323,+Setor+Marista,+Goiânia"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-vinci-primary dark:text-white hover:underline flex items-start"
            >
              <span>Rua 9 c/ Rua t-53, 2323, Setor Marista, Goiânia</span>
              <svg className="w-4 h-4 ml-1 flex-shrink-0 mt-0.5 text-vinci-primary dark:text-vinci-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
