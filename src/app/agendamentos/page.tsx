'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { Calendar, Clock, Scissors, X, Loader2, AlertCircle } from 'lucide-react'
import { buscarAgendamentosCliente, cancelarAgendamento } from '@/lib/agendamentos'
import { Agendamento } from '@/lib/supabase'
import { formatarData, formatarDinheiro } from '@/lib/utils'
import { toast } from 'sonner'

export default function AgendamentosPage() {
  const router = useRouter()
  const { cliente, loading: authLoading } = useAuth()
  const [filtro, setFiltro] = useState<'proximos' | 'historico'>('proximos')
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelando, setCancelando] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !cliente) {
      router.push('/login')
    }
  }, [authLoading, cliente, router])

  useEffect(() => {
    if (cliente) {
      carregarAgendamentos()
    }
  }, [cliente, filtro])

  const carregarAgendamentos = async () => {
    if (!cliente) return

    setLoading(true)
    const dados = await buscarAgendamentosCliente(cliente.telefone, filtro)
    setAgendamentos(dados)
    setLoading(false)
  }

  const handleCancelar = async (agendamentoId: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return
    }

    setCancelando(agendamentoId)

    const resultado = await cancelarAgendamento(agendamentoId)

    if (resultado.success) {
      toast.success('Agendamento cancelado com sucesso!')
      carregarAgendamentos()
    } else {
      toast.error(resultado.error || 'Erro ao cancelar agendamento')
    }

    setCancelando(null)
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
      <Header title="Meus Agendamentos" showUser={false} />

      <main className="max-w-2xl mx-auto px-6 py-6">
        {/* Filtros */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setFiltro('proximos')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              filtro === 'proximos'
                ? 'bg-vinci-primary text-white shadow-lg'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setFiltro('historico')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              filtro === 'historico'
                ? 'bg-vinci-primary text-white shadow-lg'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Histórico
          </button>
        </div>

        {/* Lista de agendamentos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-vinci-primary" />
          </div>
        ) : agendamentos.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">
              {filtro === 'proximos' ? 'Nenhum agendamento próximo' : 'Nenhum histórico'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {filtro === 'proximos'
                ? 'Você ainda não tem agendamentos futuros'
                : 'Seu histórico de agendamentos aparecerá aqui'}
            </p>
            {filtro === 'proximos' && (
              <button
                onClick={() => router.push('/agendar')}
                className="btn-primary"
              >
                Agendar Agora
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {agendamentos.map((agendamento) => (
              <div
                key={agendamento.id}
                className="card p-5 animate-fadeIn"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-vinci-primary/10 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-vinci-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{formatarData(agendamento.data_agendamento, 'dd/MM/yyyy')}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatarData(agendamento.data_agendamento, 'EEEE')}
                      </p>
                    </div>
                  </div>

                  <div className={`badge badge-${agendamento.status}`}>
                    {agendamento.status}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Clock className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    <span className="font-medium">{agendamento.hora_inicio}</span>
                  </div>

                  {agendamento.profissional && (
                    <div className="flex items-center space-x-3 text-sm">
                      <Scissors className="w-4 h-4 text-muted-foreground" />
                      <span>{agendamento.profissional.nome}</span>
                    </div>
                  )}

                  {/* Lista de serviços */}
                  {agendamento.servicos && agendamento.servicos.length > 0 && (
                    <div className="pt-3 border-t border-border space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">Serviços</p>
                      {agendamento.servicos.map((servico, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{servico.nome}</span>
                          <span className="text-sm font-bold text-foreground">
                            {formatarDinheiro(servico.preco)}
                          </span>
                        </div>
                      ))}
                      {agendamento.valor && (
                        <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                          <span className="text-sm font-bold">Total</span>
                          <span className="text-base font-bold text-vinci-gold">
                            {formatarDinheiro(agendamento.valor)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Compras/Pacotes (quando não tem serviços mas tem observações com COMPRA) */}
                  {agendamento.observacoes && agendamento.observacoes.startsWith('COMPRA:') && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Compra</p>
                      <p className="text-sm font-medium text-vinci-primary">
                        {agendamento.observacoes.replace('COMPRA:', '').trim()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        📦 Retire na barbearia
                      </p>
                      {agendamento.valor && (
                        <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                          <span className="text-sm font-bold">Valor Total</span>
                          <span className="text-base font-bold text-vinci-gold">
                            {formatarDinheiro(agendamento.valor)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pacotes (quando tem observações com PACOTE) */}
                  {agendamento.observacoes && agendamento.observacoes.startsWith('PACOTE:') && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Pacote</p>
                      <p className="text-sm font-medium text-blue-600">
                        {agendamento.observacoes.replace('PACOTE:', '').trim()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        🎁 Pacote adquirido - Sessão agendada
                      </p>
                      {agendamento.valor && (
                        <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                          <span className="text-sm font-bold">Valor Total</span>
                          <span className="text-base font-bold text-vinci-gold">
                            {formatarDinheiro(agendamento.valor)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Outras observações */}
                  {agendamento.observacoes && !agendamento.observacoes.startsWith('COMPRA:') && !agendamento.observacoes.startsWith('PACOTE:') && (
                    <div className="pt-3 border-t border-border">
                      <p className="text-sm text-muted-foreground flex items-start space-x-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{agendamento.observacoes}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Botão cancelar (apenas para agendados/confirmados) */}
                {(agendamento.status === 'agendado' || agendamento.status === 'confirmado') && (
                  <button
                    onClick={() => handleCancelar(agendamento.id)}
                    disabled={cancelando === agendamento.id}
                    className="mt-4 w-full py-2 px-4 rounded-lg border-2 border-red-500 text-red-500 font-medium hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {cancelando === agendamento.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Cancelando...</span>
                      </>
                    ) : (
                      <>
                        <X className="w-4 h-4" />
                        <span>Cancelar Agendamento</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
