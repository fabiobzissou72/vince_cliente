'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { Clock, Loader2, X, CheckCircle, ShoppingCart, User } from 'lucide-react'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const API_PROXY = '/api/proxy'

type TabType = 'servicos' | 'produtos' | 'planos'

interface Servico {
  id: string
  nome: string
  descricao?: string
  preco: number
  duracao_minutos: number
  categoria: string
  ativo: boolean
}

interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
  estoque: number
  ativo: boolean
}

interface Plano {
  id: string
  nome: string
  itens_inclusos: string
  valor_total: number
  valor_original: number
  economia: number
  validade_dias: number
  ativo: boolean
}

interface Barbeiro {
  id: string
  nome: string
  especialidade?: string
  ativo: boolean
}

interface CarrinhoItem {
  id: string
  tipo: 'servico' | 'produto' | 'plano'
  nome: string
  preco: number
  duracao?: number
}

export default function AgendarPage() {
  const router = useRouter()
  const { cliente, loading: authLoading } = useAuth()

  const [etapa, setEtapa] = useState<'selecao' | 'agendamento'>('selecao')
  const [tabAtiva, setTabAtiva] = useState<TabType>('servicos')
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])

  const [servicos, setServicos] = useState<Servico[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([])
  const [horarios, setHorarios] = useState<string[]>([])

  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<string>('')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horarioSelecionado, setHorarioSelecionado] = useState('')

  const [loading, setLoading] = useState(true)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [criandoAgendamento, setCriandoAgendamento] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !cliente) {
      router.push('/login')
    }
  }, [authLoading, cliente, router])

  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    console.log('🔄 useEffect disparado:', { etapa, dataSelecionada, temServico: carrinho.some(i => i.tipo === 'servico') })
    if (etapa === 'agendamento' && dataSelecionada && carrinho.some(i => i.tipo === 'servico')) {
      console.log('✅ Vai buscar horários')
      buscarHorarios()
    } else {
      console.log('❌ Não vai buscar horários')
    }
  }, [dataSelecionada, barbeiroSelecionado, etapa, carrinho])

  async function carregarDados() {
    try {
      setLoading(true)
      setError(null)

      const [servicosRes, produtosRes, planosRes, barbeirosRes] = await Promise.all([
        fetch(`${API_PROXY}/servicos`),
        fetch(`${API_PROXY}/produtos`),
        fetch(`${API_PROXY}/planos`),
        fetch(`${API_PROXY}/barbeiros`)
      ])

      const [servicosData, produtosData, planosData, barbeirosData] = await Promise.all([
        servicosRes.json(),
        produtosRes.json(),
        planosRes.json(),
        barbeirosRes.json()
      ])

      setServicos(Array.isArray(servicosData) ? servicosData.filter((s: Servico) => s.ativo) : [])
      setProdutos(produtosData.produtos || [])
      setPlanos(planosData.planos || [])
      setBarbeiros(barbeirosData.barbeiros || [])
      setDataSelecionada(format(new Date(), 'yyyy-MM-dd'))
    } catch (err: any) {
      setError(err.message)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  async function buscarHorarios() {
    try {
      setLoadingHorarios(true)
      const servicoIds = carrinho.filter(i => i.tipo === 'servico').map(i => i.id).join(',')

      console.log('🔍 Buscando horários com:', { dataSelecionada, barbeiroSelecionado, servicoIds })

      if (!servicoIds) {
        console.log('❌ Nenhum serviço no carrinho')
        setHorarios([])
        return
      }

      const url = `${API_PROXY}/horarios?data=${dataSelecionada}${barbeiroSelecionado ? `&barbeiro=${barbeiroSelecionado}` : ''}&servico_ids=${servicoIds}`
      console.log('📡 URL da API:', url)

      const response = await fetch(url)
      console.log('📡 Response status:', response.status)

      const data = await response.json()
      console.log('📦 Dados retornados:', data)

      setHorarios(data.horarios || data || [])
      console.log('✅ Horários definidos:', data.horarios || data || [])
    } catch (err) {
      console.error('❌ Erro ao buscar horários:', err)
      setHorarios([])
    } finally {
      setLoadingHorarios(false)
    }
  }

  function toggleCarrinho(item: CarrinhoItem) {
    const existe = carrinho.find(c => c.id === item.id && c.tipo === item.tipo)
    if (existe) {
      setCarrinho(carrinho.filter(c => !(c.id === item.id && c.tipo === item.tipo)))
    } else {
      setCarrinho([...carrinho, item])
    }
  }

  function itemNoCarrinho(id: string, tipo: string) {
    return carrinho.some(c => c.id === id && c.tipo === tipo)
  }

  function calcularTotal() {
    return carrinho.reduce((total, item) => total + item.preco, 0)
  }

  function avancarParaAgendamento() {
    if (carrinho.length === 0) {
      toast.error('Selecione pelo menos um item')
      return
    }
    setEtapa('agendamento')
  }

  async function confirmarAgendamento() {
    if (!cliente) return
    if (!dataSelecionada || !horarioSelecionado) {
      toast.error('Selecione data e horário')
      return
    }

    setCriandoAgendamento(true)

    try {
      const servicoIds = carrinho.filter(i => i.tipo === 'servico').map(i => i.id)
      const [dia, mes, ano] = dataSelecionada.split('-').reverse()

      const response = await fetch(`${API_PROXY}/criar-agendamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nome: cliente.nome_completo,
          telefone: cliente.telefone,
          data: `${dia}-${mes}-${ano}`,
          hora: horarioSelecionado,
          servico_ids: servicoIds
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Agendamento criado com sucesso!')
        router.push('/agendamentos')
      } else {
        toast.error(data.error || 'Erro ao criar agendamento')
      }
    } catch (error) {
      toast.error('Erro ao criar agendamento')
    } finally {
      setCriandoAgendamento(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vinci-primary" />
      </div>
    )
  }

  if (!cliente) return null

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Agendar Serviço" showUser={false} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ETAPA 1: SELEÇÃO */}
        {etapa === 'selecao' && (
          <>
            {/* TABS */}
            <div className="flex space-x-2 border-b border-border">
              <button
                onClick={() => setTabAtiva('servicos')}
                className={`px-6 py-3 font-medium transition-colors relative ${tabAtiva === 'servicos' ? 'text-vinci-primary' : 'text-muted-foreground'}`}
              >
                SERVIÇOS ({servicos.length})
                {tabAtiva === 'servicos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vinci-primary" />}
              </button>
              <button
                onClick={() => setTabAtiva('produtos')}
                className={`px-6 py-3 font-medium transition-colors relative ${tabAtiva === 'produtos' ? 'text-vinci-primary' : 'text-muted-foreground'}`}
              >
                PRODUTOS ({produtos.length})
                {tabAtiva === 'produtos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vinci-primary" />}
              </button>
              <button
                onClick={() => setTabAtiva('planos')}
                className={`px-6 py-3 font-medium transition-colors relative ${tabAtiva === 'planos' ? 'text-vinci-primary' : 'text-muted-foreground'}`}
              >
                PACOTES ({planos.length})
                {tabAtiva === 'planos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vinci-primary" />}
              </button>
            </div>

            {/* LISTA */}
            <div className="space-y-3">
              {tabAtiva === 'servicos' && servicos.map((s) => (
                <div key={s.id} onClick={() => toggleCarrinho({ id: s.id, tipo: 'servico', nome: s.nome, preco: s.preco, duracao: s.duracao_minutos })} className={`card cursor-pointer ${itemNoCarrinho(s.id, 'servico') ? 'border-vinci-primary bg-vinci-primary/5' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{s.nome}</h3>
                      {s.descricao && <p className="text-sm text-muted-foreground mt-1">{s.descricao}</p>}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-lg font-bold text-vinci-gold">R$ {s.preco.toFixed(2)}</span>
                        <span className="flex items-center text-sm text-muted-foreground"><Clock className="w-4 h-4 mr-1" />{s.duracao_minutos} min</span>
                      </div>
                    </div>
                    <button className={`btn-secondary px-6 ${itemNoCarrinho(s.id, 'servico') ? 'bg-vinci-primary text-white' : ''}`}>
                      {itemNoCarrinho(s.id, 'servico') ? 'Selecionado' : 'Selecionar'}
                    </button>
                  </div>
                </div>
              ))}

              {tabAtiva === 'produtos' && produtos.map((p) => (
                <div key={p.id} onClick={() => toggleCarrinho({ id: p.id, tipo: 'produto', nome: p.nome, preco: p.preco })} className={`card cursor-pointer ${itemNoCarrinho(p.id, 'produto') ? 'border-vinci-primary bg-vinci-primary/5' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{p.nome}</h3>
                      {p.descricao && <p className="text-sm text-muted-foreground mt-1">{p.descricao}</p>}
                      <span className="text-lg font-bold text-vinci-gold mt-2 inline-block">R$ {p.preco.toFixed(2)}</span>
                    </div>
                    <button className={`btn-secondary px-6 ${itemNoCarrinho(p.id, 'produto') ? 'bg-vinci-primary text-white' : ''}`}>
                      {itemNoCarrinho(p.id, 'produto') ? 'Selecionado' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              ))}

              {tabAtiva === 'planos' && planos.map((p) => (
                <div key={p.id} onClick={() => toggleCarrinho({ id: p.id, tipo: 'plano', nome: p.nome, preco: p.valor_total })} className={`card cursor-pointer border-2 ${itemNoCarrinho(p.id, 'plano') ? 'border-vinci-primary bg-vinci-primary/5' : 'border-blue-300'}`}>
                  <h3 className="font-bold text-xl">{p.nome}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.itens_inclusos}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-2xl font-bold text-blue-600">R$ {p.valor_total.toFixed(2)}</span>
                    <button className={`btn-secondary px-6 ${itemNoCarrinho(p.id, 'plano') ? 'bg-vinci-primary text-white' : ''}`}>
                      {itemNoCarrinho(p.id, 'plano') ? 'Selecionado' : 'Assinar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* CARRINHO */}
            {carrinho.length > 0 && (
              <div className="card bg-vinci-primary/5 border-vinci-primary">
                <h3 className="font-bold text-lg mb-4 flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Carrinho ({carrinho.length})
                </h3>
                {carrinho.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center mb-2">
                    <span>{item.nome}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-vinci-gold">R$ {item.preco.toFixed(2)}</span>
                      <button onClick={() => toggleCarrinho(item)} className="text-red-500"><X className="w-5 h-5" /></button>
                    </div>
                  </div>
                ))}
                <div className="pt-4 border-t border-border flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-vinci-gold">R$ {calcularTotal().toFixed(2)}</span>
                </div>
                <button onClick={avancarParaAgendamento} className="w-full btn-primary mt-4">
                  Avançar para Agendamento
                </button>
              </div>
            )}
          </>
        )}

        {/* ETAPA 2: AGENDAMENTO */}
        {etapa === 'agendamento' && (
          <>
            <button onClick={() => setEtapa('selecao')} className="text-vinci-primary hover:underline mb-4">
              ← Voltar para seleção
            </button>

            {/* BARBEIRO */}
            {carrinho.some(i => i.tipo === 'servico') && (
              <div>
                <h3 className="font-bold text-lg mb-3">Escolher Profissional (Opcional)</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Clicou em qualquer profissional')
                      setBarbeiroSelecionado('')
                    }}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${!barbeiroSelecionado ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg' : 'border-gray-300 bg-white dark:bg-gray-800 hover:border-blue-400'}`}
                  >
                    <p className={`font-bold ${!barbeiroSelecionado ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                      {!barbeiroSelecionado && <CheckCircle className="w-5 h-5 inline mr-2" />}
                      Qualquer Profissional
                    </p>
                  </button>
                  {barbeiros.map((b) => (
                    <button
                      key={b.id}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Clicou em barbeiro:', b.nome)
                        setBarbeiroSelecionado(b.nome)
                      }}
                      className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${barbeiroSelecionado === b.nome ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg' : 'border-gray-300 bg-white dark:bg-gray-800 hover:border-blue-400'}`}
                    >
                      <p className={`font-bold ${barbeiroSelecionado === b.nome ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {barbeiroSelecionado === b.nome && <CheckCircle className="w-5 h-5 inline mr-2" />}
                        {b.nome}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DATA */}
            <div>
              <h3 className="font-bold text-lg mb-3">Escolher Data</h3>
              <div className="flex overflow-x-auto space-x-3 pb-2">
                {Array.from({ length: 14 }).map((_, i) => {
                  const dia = addDays(new Date(), i)
                  const dataStr = format(dia, 'yyyy-MM-dd')
                  const selecionado = dataSelecionada === dataStr
                  return (
                    <button
                      key={i}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        console.log('Clicou na data:', dataStr)
                        setDataSelecionada(dataStr)
                      }}
                      className={`flex-shrink-0 p-4 rounded-lg text-center w-24 border-2 transition-all cursor-pointer ${selecionado ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg scale-110' : 'border-gray-300 bg-white dark:bg-gray-800 hover:border-blue-400'}`}
                    >
                      <p className={`text-sm font-medium ${selecionado ? 'text-blue-600' : 'text-gray-500'}`}>
                        {format(dia, 'EEE', { locale: ptBR })}
                      </p>
                      <p className={`text-3xl font-bold my-2 ${selecionado ? 'text-blue-600' : 'text-gray-900 dark:text-white'}`}>
                        {format(dia, 'dd')}
                      </p>
                      <p className={`text-xs font-medium ${selecionado ? 'text-blue-600' : 'text-gray-500'}`}>
                        {format(dia, 'MMM', { locale: ptBR })}
                      </p>
                      {selecionado && (
                        <CheckCircle className="w-5 h-5 mx-auto mt-2 text-blue-600" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* HORÁRIO */}
            {dataSelecionada && carrinho.some(i => i.tipo === 'servico') && (
              <div>
                <h3 className="font-bold text-lg mb-3">Escolher Horário</h3>
                {loadingHorarios ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-vinci-primary" />
                  </div>
                ) : horarios.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum horário disponível</p>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {horarios.map((h) => {
                      const selecionado = horarioSelecionado === h
                      return (
                        <button
                          key={h}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            console.log('Clicou no horário:', h)
                            setHorarioSelecionado(h)
                          }}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${selecionado ? 'border-blue-600 bg-blue-600 text-white shadow-lg scale-105' : 'border-gray-300 bg-white dark:bg-gray-800 text-gray-900 dark:text-white hover:border-blue-400'}`}
                        >
                          <span className="text-lg font-bold">{h}</span>
                          {selecionado && (
                            <CheckCircle className="w-5 h-5 inline ml-2" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* CONFIRMAR */}
            {dataSelecionada && horarioSelecionado && (
              <button onClick={confirmarAgendamento} disabled={criandoAgendamento} className="w-full btn-primary py-4 text-lg">
                {criandoAgendamento ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Confirmando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Confirmar Agendamento
                  </span>
                )}
              </button>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
