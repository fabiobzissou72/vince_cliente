'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { ArrowRight, Calendar as CalendarIcon, Clock, Scissors, User, MessageSquare, Loader2, CheckCircle } from 'lucide-react'
import { buscarBarbeiros, buscarServicos, buscarHorariosDisponiveis, criarAgendamento } from '@/lib/agendamentos'
import { Barbeiro, Servico } from '@/lib/supabase'
import { formatarData, formatarDinheiro, formatarDuracao } from '@/lib/utils'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AgendarPage() {
  const router = useRouter()
  const { cliente, loading: authLoading } = useAuth()

  const [etapa, setEtapa] = useState(1)
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [horarios, setHorarios] = useState<string[]>([])

  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<string>('')
  const [servicoSelecionado, setServicoSelecionado] = useState<string>('')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [criando, setCriando] = useState(false)
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    if (!authLoading && !cliente) {
      router.push('/login')
    }
  }, [authLoading, cliente, router])

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    if (barbeiroSelecionado && dataSelecionada) {
      carregarHorarios()
    }
  }, [barbeiroSelecionado, dataSelecionada])

  const carregarDados = async () => {
    setLoading(true)
    const [barbeirosData, servicosData] = await Promise.all([
      buscarBarbeiros(),
      buscarServicos()
    ])
    setBarbeiros(barbeirosData)
    setServicos(servicosData)
    setLoading(false)
  }

  const carregarHorarios = async () => {
    if (!barbeiroSelecionado || !dataSelecionada) return

    setLoadingHorarios(true)
    setHorarioSelecionado('')
    const horariosData = await buscarHorariosDisponiveis(barbeiroSelecionado, dataSelecionada)
    setHorarios(horariosData)
    setLoadingHorarios(false)
  }

  const handleProximaEtapa = () => {
    if (etapa === 1 && !barbeiroSelecionado) {
      toast.error('Selecione um barbeiro')
      return
    }
    if (etapa === 2 && !servicoSelecionado) {
      toast.error('Selecione um serviço')
      return
    }
    if (etapa === 3 && !dataSelecionada) {
      toast.error('Selecione uma data')
      return
    }
    if (etapa === 3 && !horarioSelecionado) {
      toast.error('Selecione um horário')
      return
    }

    if (etapa < 4) {
      setEtapa(etapa + 1)
    }
  }

  const handleFinalizar = async () => {
    if (!cliente) return

    setCriando(true)

    const resultado = await criarAgendamento({
      cliente_id: cliente.id,
      profissional_id: barbeiroSelecionado,
      servico_id: servicoSelecionado,
      data_agendamento: dataSelecionada,
      hora_inicio: horarioSelecionado,
      observacoes: observacoes || undefined,
      nome_cliente: cliente.nome_completo,
      telefone: cliente.telefone
    })

    if (resultado.success) {
      setSucesso(true)
      toast.success('Agendamento criado com sucesso!')
      setTimeout(() => {
        router.push('/agendamentos')
      }, 2000)
    } else {
      toast.error(resultado.error || 'Erro ao criar agendamento')
    }

    setCriando(false)
  }

  // Gera próximos 30 dias
  const proximosDias = Array.from({ length: 30 }, (_, i) => {
    const data = addDays(new Date(), i)
    return {
      valor: format(data, 'yyyy-MM-dd'),
      label: format(data, 'dd/MM'),
      diaSemana: format(data, 'EEE', { locale: ptBR }),
      completo: format(data, 'EEEE, dd/MM/yyyy', { locale: ptBR })
    }
  })

  if (authLoading || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vinci-primary" />
      </div>
    )
  }

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-vinci-dark via-vinci-primary to-vinci-secondary px-6">
        <div className="text-center space-y-6 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 backdrop-blur-sm mb-4">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Agendamento Confirmado!</h1>
          <p className="text-vinci-accent text-lg">Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Novo Agendamento" showUser={false} />

      <main className="max-w-2xl mx-auto px-6 py-6">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`flex-1 h-2 rounded-full mx-1 transition-all ${
                  num <= etapa ? 'bg-vinci-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground text-center">Etapa {etapa} de 4</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-vinci-primary" />
          </div>
        ) : (
          <div className="space-y-6 animate-fadeIn">
            {/* Etapa 1: Selecionar Barbeiro */}
            {etapa === 1 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center">
                    <User className="w-6 h-6 mr-2 text-vinci-primary" />
                    Escolha o Barbeiro
                  </h2>
                  <p className="text-muted-foreground">Selecione seu barbeiro preferido</p>
                </div>

                <div className="space-y-3">
                  {barbeiros.map((barbeiro) => (
                    <button
                      key={barbeiro.id}
                      onClick={() => setBarbeiroSelecionado(barbeiro.id)}
                      className={`w-full card p-4 flex items-center space-x-4 transition-all ${
                        barbeiroSelecionado === barbeiro.id
                          ? 'border-2 border-vinci-primary bg-vinci-primary/5'
                          : 'hover:border-vinci-primary/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-vinci-primary/10 flex items-center justify-center flex-shrink-0">
                        <Scissors className="w-6 h-6 text-vinci-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold">{barbeiro.nome}</p>
                        {barbeiro.especialidade && (
                          <p className="text-sm text-muted-foreground">{barbeiro.especialidade}</p>
                        )}
                      </div>
                      {barbeiroSelecionado === barbeiro.id && (
                        <CheckCircle className="w-6 h-6 text-vinci-primary flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Etapa 2: Selecionar Serviço */}
            {etapa === 2 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center">
                    <Scissors className="w-6 h-6 mr-2 text-vinci-primary" />
                    Escolha o Serviço
                  </h2>
                  <p className="text-muted-foreground">Qual serviço deseja realizar?</p>
                </div>

                <div className="space-y-3">
                  {servicos.map((servico) => (
                    <button
                      key={servico.id}
                      onClick={() => setServicoSelecionado(servico.id)}
                      className={`w-full card p-4 transition-all ${
                        servicoSelecionado === servico.id
                          ? 'border-2 border-vinci-primary bg-vinci-primary/5'
                          : 'hover:border-vinci-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-bold text-left">{servico.nome}</p>
                          {servico.descricao && (
                            <p className="text-sm text-muted-foreground text-left mt-1">
                              {servico.descricao}
                            </p>
                          )}
                        </div>
                        {servicoSelecionado === servico.id && (
                          <CheckCircle className="w-6 h-6 text-vinci-primary flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-sm text-muted-foreground">
                          {formatarDuracao(servico.duracao_minutos)}
                        </span>
                        <span className="text-lg font-bold text-vinci-primary">
                          {formatarDinheiro(servico.preco)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Etapa 3: Selecionar Data e Horário */}
            {etapa === 3 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2 flex items-center">
                    <CalendarIcon className="w-6 h-6 mr-2 text-vinci-primary" />
                    Data e Horário
                  </h2>
                  <p className="text-muted-foreground">Escolha quando deseja ser atendido</p>
                </div>

                {/* Seletor de data */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-3">Selecione a Data</label>
                  <div className="grid grid-cols-4 gap-2">
                    {proximosDias.slice(0, 14).map((dia) => (
                      <button
                        key={dia.valor}
                        onClick={() => setDataSelecionada(dia.valor)}
                        className={`p-3 rounded-lg border-2 text-center transition-all ${
                          dataSelecionada === dia.valor
                            ? 'border-vinci-primary bg-vinci-primary/10 text-vinci-primary font-bold'
                            : 'border-border hover:border-vinci-primary/50'
                        }`}
                      >
                        <p className="text-xs text-muted-foreground mb-1">{dia.diaSemana}</p>
                        <p className="font-medium">{dia.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seletor de horário */}
                {dataSelecionada && (
                  <div>
                    <label className="block text-sm font-medium mb-3">
                      Horários Disponíveis
                      {loadingHorarios && (
                        <span className="ml-2 text-vinci-primary">
                          <Loader2 className="w-4 h-4 inline animate-spin" />
                        </span>
                      )}
                    </label>

                    {loadingHorarios ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-vinci-primary" />
                      </div>
                    ) : horarios.length === 0 ? (
                      <div className="card p-6 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                        <p className="text-muted-foreground">Nenhum horário disponível nesta data</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {horarios.map((horario) => (
                          <button
                            key={horario}
                            onClick={() => setHorarioSelecionado(horario)}
                            className={`p-3 rounded-lg border-2 font-medium transition-all ${
                              horarioSelecionado === horario
                                ? 'border-vinci-primary bg-vinci-primary/10 text-vinci-primary'
                                : 'border-border hover:border-vinci-primary/50'
                            }`}
                          >
                            {horario}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Etapa 4: Confirmação e Observações */}
            {etapa === 4 && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">Confirmar Agendamento</h2>
                  <p className="text-muted-foreground">Revise os detalhes e confirme</p>
                </div>

                {/* Resumo */}
                <div className="card p-5 mb-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-vinci-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Barbeiro</p>
                        <p className="font-medium">
                          {barbeiros.find(b => b.id === barbeiroSelecionado)?.nome}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Scissors className="w-5 h-5 text-vinci-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Serviço</p>
                        <p className="font-medium">
                          {servicos.find(s => s.id === servicoSelecionado)?.nome}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="w-5 h-5 text-vinci-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Data</p>
                        <p className="font-medium">
                          {proximosDias.find(d => d.valor === dataSelecionada)?.completo}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-vinci-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Horário</p>
                        <p className="font-medium">{horarioSelecionado}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Observações (opcional)
                  </label>
                  <textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Alguma observação especial? Ex: corte específico, preferências..."
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>
              </div>
            )}

            {/* Botões de navegação */}
            <div className="flex space-x-3 pt-4">
              {etapa > 1 && (
                <button
                  onClick={() => setEtapa(etapa - 1)}
                  className="btn-secondary flex-1"
                  disabled={criando}
                >
                  Voltar
                </button>
              )}

              {etapa < 4 ? (
                <button
                  onClick={handleProximaEtapa}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleFinalizar}
                  disabled={criando}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {criando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Confirmando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Confirmar Agendamento</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
