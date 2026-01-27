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
  foto_url?: string
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
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>(() => {
    // Recupera carrinho do localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('carrinho')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const [servicos, setServicos] = useState<Servico[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [barbeiros, setBarbeiros] = useState<Barbeiro[]>([])
  const [horarios, setHorarios] = useState<string[]>([])

  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<string>('')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [dataBase, setDataBase] = useState(new Date())

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
    console.log('🔄 useEffect disparado:', { etapa, dataSelecionada, temServico: carrinho.some(i => i.tipo === 'servico'), temPlano: carrinho.some(i => i.tipo === 'plano') })
    // Buscar horários se tem serviços OU se tem planos (para agendar primeira sessão)
    const precisaBuscarHorarios = carrinho.some(i => i.tipo === 'servico' || i.tipo === 'plano')
    if (etapa === 'agendamento' && dataSelecionada && precisaBuscarHorarios) {
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

      console.log('📦 Dados recebidos - Barbeiros:', barbeirosData)

      setServicos(Array.isArray(servicosData) ? servicosData.filter((s: Servico) => s.ativo) : [])
      setProdutos(produtosData.produtos || [])
      setPlanos(planosData.planos || [])

      // Filtra apenas barbeiros ativos
      const barbeirosAtivos = (barbeirosData.barbeiros || []).filter((b: Barbeiro) => b.ativo)
      console.log('✅ Barbeiros ativos:', barbeirosAtivos)
      setBarbeiros(barbeirosAtivos)
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
      const temPlanos = carrinho.some(i => i.tipo === 'plano')

      console.log('🔍 Buscando horários com:', { dataSelecionada, barbeiroSelecionado, servicoIds, temPlanos })

      // Se não tem serviços E não tem planos, retorna vazio
      if (!servicoIds && !temPlanos) {
        console.log('❌ Nenhum serviço ou plano no carrinho')
        setHorarios([])
        return
      }

      // Só envia barbeiro se for um ID válido (não vazio e não "Qualquer")
      // A API espera o NOME do barbeiro, não o ID
      const barbeiroNome = barbeiroSelecionado && barbeiroSelecionado !== 'Qualquer'
        ? getNomeBarbeiro(barbeiroSelecionado)
        : ''
      const barbeiroParam = barbeiroNome ? `&barbeiro=${encodeURIComponent(barbeiroNome)}` : ''

      // Se tem serviços, envia servico_ids. Se só tem planos, busca horários genéricos
      const servicoParam = servicoIds ? `&servico_ids=${servicoIds}` : ''
      const url = `${API_PROXY}/horarios?data=${dataSelecionada}${barbeiroParam}${servicoParam}`
      console.log('📡 URL da API:', url)

      const response = await fetch(url)
      console.log('📡 Response status:', response.status)

      const data = await response.json()
      console.log('📦 Dados retornados:', data)

      // Trata diferentes formatos de resposta
      let horariosArray = []

      if (Array.isArray(data)) {
        horariosArray = data
      } else if (data.horarios && Array.isArray(data.horarios)) {
        horariosArray = data.horarios
      } else if (data.data && Array.isArray(data.data.horarios)) {
        // API retorna: { success: true, data: { horarios: [...] } }
        horariosArray = data.data.horarios
      } else if (data.data && Array.isArray(data.data)) {
        // API retorna: { success: true, data: [...] }
        horariosArray = data.data
      } else if (typeof data === 'object') {
        console.log('⚠️ Formato de resposta não reconhecido:', Object.keys(data))
        console.log('⚠️ Dados completos:', data)
      }

      setHorarios(horariosArray)
      console.log('✅ Horários definidos:', horariosArray)
    } catch (err) {
      console.error('❌ Erro ao buscar horários:', err)
      setHorarios([])
    } finally {
      setLoadingHorarios(false)
    }
  }

  function toggleCarrinho(item: CarrinhoItem) {
    const existe = carrinho.find(c => c.id === item.id && c.tipo === item.tipo)
    let novoCarrinho
    if (existe) {
      novoCarrinho = carrinho.filter(c => !(c.id === item.id && c.tipo === item.tipo))
    } else {
      novoCarrinho = [...carrinho, item]
    }
    setCarrinho(novoCarrinho)
    // Salva no localStorage
    localStorage.setItem('carrinho', JSON.stringify(novoCarrinho))
  }

  function itemNoCarrinho(id: string, tipo: string) {
    return carrinho.some(c => c.id === id && c.tipo === tipo)
  }

  function calcularTotal() {
    return carrinho.reduce((total, item) => total + item.preco, 0)
  }

  function getNomeBarbeiro(id: string): string {
    if (id === 'Qualquer') return 'Qualquer Profissional'
    const barbeiro = barbeiros.find(b => b.id === id)
    return barbeiro?.nome || 'Barbeiro'
  }

  function getFotoBarbeiro(id: string): string | undefined {
    if (id === 'Qualquer') return undefined
    const barbeiro = barbeiros.find(b => b.id === id)
    return barbeiro?.foto_url || undefined
  }

  // Detecta o tipo de carrinho
  const temServicos = carrinho.some(i => i.tipo === 'servico')
  const temPlanos = carrinho.some(i => i.tipo === 'plano')
  const temProdutos = carrinho.some(i => i.tipo === 'produto')

  // APENAS produtos (sem planos/serviços) = compra sem agendamento
  const apenasCompraProdutos = carrinho.length > 0 && !temServicos && !temPlanos && temProdutos

  function avancarParaAgendamento() {
    if (carrinho.length === 0) {
      toast.error('Selecione pelo menos um item')
      return
    }

    // Se for APENAS produtos (sem planos), confirma compra direto SEM agendamento
    if (apenasCompraProdutos) {
      confirmarCompra()
      return
    }

    // Verificar se há barbeiros disponíveis antes de avançar
    if (barbeiros.length === 0) {
      toast.error('Nenhum profissional disponível no momento. Entre em contato com a barbearia.')
      return
    }

    // Se tem planos OU serviços → vai para tela de agendamento (escolhe barbeiro + data + hora)
    setEtapa('agendamento')
  }

  async function confirmarCompra() {
    if (!cliente) return

    setCriandoAgendamento(true)

    try {
      const produtoIds = carrinho.filter(i => i.tipo === 'produto').map(i => i.id)
      const planoIds = carrinho.filter(i => i.tipo === 'plano').map(i => i.id)

      const response = await fetch(`${API_PROXY}/criar-compra`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nome: cliente.nome_completo,
          telefone: cliente.telefone,
          produto_ids: produtoIds,
          plano_ids: planoIds
        })
      })

      const data = await response.json()

      if (data.success) {
        setCarrinho([])
        localStorage.removeItem('carrinho')
        toast.success('Compra realizada com sucesso! Retire na barbearia.')
        router.push('/agendamentos')
      } else {
        toast.error(data.error || 'Erro ao processar compra')
      }
    } catch (error) {
      toast.error('Erro ao processar compra')
    } finally {
      setCriandoAgendamento(false)
    }
  }

  async function confirmarAgendamento() {
    if (!cliente) return
    if (!dataSelecionada || !horarioSelecionado) {
      toast.error('Selecione data e horário')
      return
    }

    // Se tem planos mas não tem serviços, precisa de barbeiro
    if (temPlanos && !temServicos && !barbeiroSelecionado) {
      toast.error('Selecione um profissional')
      return
    }

    setCriandoAgendamento(true)

    try {
      const servicoIds = carrinho.filter(i => i.tipo === 'servico').map(i => i.id)
      const produtoIds = carrinho.filter(i => i.tipo === 'produto').map(i => i.id)
      const planoIds = carrinho.filter(i => i.tipo === 'plano').map(i => i.id)
      const [dia, mes, ano] = dataSelecionada.split('-').reverse()

      const response = await fetch(`${API_PROXY}/criar-agendamento`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nome: cliente.nome_completo,
          telefone: cliente.telefone,
          data: `${dia}-${mes}-${ano}`,
          hora: horarioSelecionado,
          servico_ids: servicoIds,
          produto_ids: produtoIds,
          plano_ids: planoIds,
          barbeiro_id: barbeiroSelecionado && barbeiroSelecionado !== 'Qualquer' ? barbeiroSelecionado : undefined
        })
      })

      const data = await response.json()

      if (data.success) {
        // Limpar carrinho após sucesso
        setCarrinho([])
        localStorage.removeItem('carrinho')

        // Mensagem personalizada baseada no que foi agendado
        if (planoIds.length > 0 && servicoIds.length === 0) {
          toast.success('Pacote adquirido! Primeira sessão agendada com sucesso!')
        } else {
          toast.success('Agendamento criado com sucesso!')
        }

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
                className={`px-6 py-3 font-medium transition-colors relative ${tabAtiva === 'servicos' ? 'text-vinci-primary dark:text-vinci-accent' : 'text-muted-foreground'}`}
              >
                SERVIÇOS ({servicos.length})
                {tabAtiva === 'servicos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vinci-primary dark:bg-vinci-accent" />}
              </button>
              <button
                onClick={() => setTabAtiva('produtos')}
                className={`px-6 py-3 font-medium transition-colors relative ${tabAtiva === 'produtos' ? 'text-vinci-primary dark:text-vinci-accent' : 'text-muted-foreground'}`}
              >
                PRODUTOS ({produtos.length})
                {tabAtiva === 'produtos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vinci-primary dark:bg-vinci-accent" />}
              </button>
              <button
                onClick={() => setTabAtiva('planos')}
                className={`px-6 py-3 font-medium transition-colors relative ${tabAtiva === 'planos' ? 'text-vinci-primary dark:text-vinci-accent' : 'text-muted-foreground'}`}
              >
                PACOTES ({planos.length})
                {tabAtiva === 'planos' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vinci-primary dark:bg-vinci-accent" />}
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
                    <button className={`px-6 py-2 rounded-lg font-semibold transition-colors ${itemNoCarrinho(s.id, 'servico') ? 'bg-vinci-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-vinci-primary/20'}`}>
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
                    <button className={`px-6 py-2 rounded-lg font-semibold transition-colors ${itemNoCarrinho(p.id, 'produto') ? 'bg-vinci-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-vinci-primary/20'}`}>
                      {itemNoCarrinho(p.id, 'produto') ? 'Selecionado' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              ))}

              {tabAtiva === 'planos' && planos.map((p) => (
                <div key={p.id} onClick={() => toggleCarrinho({ id: p.id, tipo: 'plano', nome: p.nome, preco: p.valor_total })} className={`card cursor-pointer border-2 ${itemNoCarrinho(p.id, 'plano') ? 'border-vinci-primary bg-vinci-primary/5' : 'border-blue-300'}`}>
                  <h3 className="font-bold text-lg">{p.nome}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{p.itens_inclusos}</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-lg font-bold text-vinci-gold">R$ {p.valor_total.toFixed(2)}</span>
                    <button className={`px-6 py-2 rounded-lg font-semibold transition-colors ${itemNoCarrinho(p.id, 'plano') ? 'bg-vinci-primary text-white' : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white border-2 border-vinci-primary/20'}`}>
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
                <button onClick={avancarParaAgendamento} className="w-full btn-primary mt-4" disabled={criandoAgendamento}>
                  {criandoAgendamento ? (
                    <span className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processando...
                    </span>
                  ) : apenasCompraProdutos ? (
                    'Confirmar Compra'
                  ) : temPlanos && !temServicos ? (
                    'Agendar Primeira Sessão'
                  ) : (
                    'Avançar para Agendamento'
                  )}
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

            {/* BARBEIRO - Exibir barbeiro selecionado */}
            {(temServicos || temPlanos) && barbeiroSelecionado && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                    {getFotoBarbeiro(barbeiroSelecionado) ? (
                      <img
                        src={getFotoBarbeiro(barbeiroSelecionado)}
                        alt={getNomeBarbeiro(barbeiroSelecionado)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-gray-600 dark:text-gray-300" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{getNomeBarbeiro(barbeiroSelecionado)}</h3>
                    <p className="text-sm text-gray-500">Barbeiro profissional</p>
                  </div>
                  <button
                    onClick={() => setBarbeiroSelecionado('')}
                    className="ml-auto text-sm text-vinci-primary hover:underline"
                  >
                    Trocar
                  </button>
                </div>
              </div>
            )}

            {/* Escolher Profissional */}
            {(temServicos || temPlanos) && !barbeiroSelecionado && (
              <div>
                <h3 className="font-bold text-lg mb-3">Escolher Profissional</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setBarbeiroSelecionado('Qualquer')}
                    className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-vinci-primary dark:hover:border-vinci-accent transition-all text-left"
                  >
                    <p className="font-bold text-slate-900 dark:text-white">Qualquer Profissional</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Escolher automaticamente</p>
                  </button>
                  {barbeiros.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => setBarbeiroSelecionado(b.id)}
                      className="w-full p-4 rounded-xl border-2 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-vinci-primary dark:hover:border-vinci-accent transition-all flex items-center space-x-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {b.foto_url ? (
                          <img
                            src={b.foto_url}
                            alt={b.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                        )}
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-bold text-slate-900 dark:text-white">{b.nome}</p>
                        {b.especialidade && <p className="text-sm text-gray-500 dark:text-gray-400">{b.especialidade}</p>}
                      </div>
                      <span className="text-vinci-primary dark:text-vinci-accent font-medium">Ver mais</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DATA - Calendário Horizontal */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => setDataBase(addDays(dataBase, -7))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h3 className="text-xl font-bold">{format(dataBase, 'MMMM \'de\' yyyy', { locale: ptBR })}</h3>
                <button
                  onClick={() => setDataBase(addDays(dataBase, 7))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => {
                  const dia = addDays(dataBase, i)
                  const dataStr = format(dia, 'yyyy-MM-dd')
                  const selecionado = dataSelecionada === dataStr
                  return (
                    <div key={i} className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {format(dia, 'EEE', { locale: ptBR })}
                      </p>
                      <button
                        onClick={() => setDataSelecionada(dataStr)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all mx-auto ${
                          selecionado
                            ? 'bg-vinci-dark text-white'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {format(dia, 'd')}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* HORÁRIOS DISPONÍVEIS */}
            {dataSelecionada && carrinho.some(i => i.tipo === 'servico' || i.tipo === 'plano') && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Horários disponíveis</h2>
                {loadingHorarios ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-vinci-primary" />
                  </div>
                ) : horarios.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">Nenhum horário disponível</p>
                ) : (
                  <>
                    {/* Manhã */}
                    {(() => {
                      const manha = horarios.filter(h => {
                        const hora = parseInt(h.split(':')[0])
                        return hora >= 6 && hora < 12
                      })
                      return manha.length > 0 && (
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Manhã</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{manha.length} horários</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {manha.map((h) => (
                              <button
                                key={h}
                                onClick={() => setHorarioSelecionado(h)}
                                className={`p-4 rounded-xl border-2 transition-all font-bold text-lg ${
                                  horarioSelecionado === h
                                    ? 'border-vinci-primary bg-vinci-primary text-white'
                                    : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-vinci-primary dark:hover:border-vinci-accent'
                                }`}
                              >
                                {h}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Tarde */}
                    {(() => {
                      const tarde = horarios.filter(h => {
                        const hora = parseInt(h.split(':')[0])
                        return hora >= 12 && hora < 18
                      })
                      return tarde.length > 0 && (
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tarde</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{tarde.length} horários</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {tarde.map((h) => (
                              <button
                                key={h}
                                onClick={() => setHorarioSelecionado(h)}
                                className={`p-4 rounded-xl border-2 transition-all font-bold text-lg ${
                                  horarioSelecionado === h
                                    ? 'border-vinci-primary bg-vinci-primary text-white'
                                    : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-vinci-primary dark:hover:border-vinci-accent'
                                }`}
                              >
                                {h}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })()}

                    {/* Noite */}
                    {(() => {
                      const noite = horarios.filter(h => {
                        const hora = parseInt(h.split(':')[0])
                        return hora >= 18
                      })
                      return noite.length > 0 && (
                        <div className="mb-8">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Noite</h3>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{noite.length} horários</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {noite.map((h) => (
                              <button
                                key={h}
                                onClick={() => setHorarioSelecionado(h)}
                                className={`p-4 rounded-xl border-2 transition-all font-bold text-lg ${
                                  horarioSelecionado === h
                                    ? 'border-vinci-primary bg-vinci-primary text-white'
                                    : 'border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-vinci-primary dark:hover:border-vinci-accent'
                                }`}
                              >
                                {h}
                              </button>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </>
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
