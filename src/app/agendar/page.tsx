'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import {
  Calendar as CalendarIcon, Clock, Scissors, User, ShoppingCart, Package, CheckCircle, Loader2, X
} from 'lucide-react'
import { buscarBarbeiros, buscarServicos, buscarHorariosDisponiveis, criarAgendamento } from '@/lib/agendamentos'
import { buscarProdutos, Produto } from '@/lib/produtos'
import { buscarPlanos, Plano } from '@/lib/planos'
import { Profissional, Servico } from '@/lib/supabase'
import { formatarDinheiro, formatarDuracao } from '@/lib/utils'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type TabType = 'servicos' | 'produtos' | 'planos'

interface CarrinhoItem {
  id: string
  tipo: 'servico' | 'produto' | 'plano'
  nome: string
  preco: number
  duracao?: number
  descricao?: string
}

export default function NovoAgendarPage() {
  const router = useRouter()
  const { cliente, loading: authLoading } = useAuth()

  // Estados principais
  const [tabAtiva, setTabAtiva] = useState<TabType>('servicos')
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([])

  // Dados
  const [barbeiros, setBarbeiros] = useState<Profissional[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [horarios, setHorarios] = useState<string[]>([])

  // Seleções
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState<string>('')
  const [dataSelecionada, setDataSelecionada] = useState('')
  const [horarioSelecionado, setHorarioSelecionado] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Estados de carregamento
  const [loadingDados, setLoadingDados] = useState(true)
  const [loadingHorarios, setLoadingHorarios] = useState(false)
  const [criandoAgendamento, setCriandoAgendamento] = useState(false)

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!authLoading && !cliente) {
      router.push('/login')
    }
  }, [authLoading, cliente, router])

  // Carrega dados iniciais
  useEffect(() => {
    async function carregarDados() {
      setLoadingDados(true)
      const [barbeirosData, servicosData, produtosData, planosData] = await Promise.all([
        buscarBarbeiros(),
        buscarServicos(),
        buscarProdutos(),
        buscarPlanos()
      ])

      setBarbeiros(barbeirosData)
      setServicos(servicosData)
      setProdutos(produtosData)
      setPlanos(planosData)

      // Define data inicial como hoje
      setDataSelecionada(format(new Date(), 'yyyy-MM-dd'))

      setLoadingDados(false)
    }

    carregarDados()
  }, [])

  // Busca horários quando seleciona data ou muda carrinho
  useEffect(() => {
    if (dataSelecionada && carrinho.length > 0) {
      buscarHorarios()
    } else {
      setHorarios([])
    }
  }, [dataSelecionada, carrinho, barbeiroSelecionado])

  async function buscarHorarios() {
    setLoadingHorarios(true)

    // IDs dos serviços no carrinho
    const servicoIds = carrinho
      .filter(item => item.tipo === 'servico')
      .map(item => item.id)
      .join(',')

    if (!servicoIds) {
      setHorarios([])
      setLoadingHorarios(false)
      return
    }

    const horariosData = await buscarHorariosDisponiveis(
      dataSelecionada,
      barbeiroSelecionado || undefined,
      servicoIds
    )

    setHorarios(horariosData)
    setLoadingHorarios(false)
  }

  // Adiciona/Remove item do carrinho
  function toggleCarrinho(item: CarrinhoItem) {
    const existe = carrinho.find(c => c.id === item.id && c.tipo === item.tipo)

    if (existe) {
      setCarrinho(carrinho.filter(c => !(c.id === item.id && c.tipo === item.tipo)))
    } else {
      setCarrinho([...carrinho, item])
    }
  }

  function itemNoCarrinho(id: string, tipo: string): boolean {
    return carrinho.some(c => c.id === id && c.tipo === tipo)
  }

  // Calcula total do carrinho
  function calcularTotal(): number {
    return carrinho.reduce((total, item) => total + item.preco, 0)
  }

  // Calcula duração total
  function calcularDuracaoTotal(): number {
    return carrinho.reduce((total, item) => total + (item.duracao || 0), 0)
  }

  // Gera dias do calendário
  function gerarDias() {
    const dias = []
    for (let i = 0; i < 14; i++) {
      dias.push(addDays(new Date(), i))
    }
    return dias
  }

  // Criar agendamento
  async function handleCriarAgendamento() {
    if (!cliente) {
      toast.error('Você precisa estar logado')
      return
    }

    if (carrinho.length === 0) {
      toast.error('Selecione pelo menos um serviço')
      return
    }

    if (!dataSelecionada) {
      toast.error('Selecione uma data')
      return
    }

    if (!horarioSelecionado) {
      toast.error('Selecione um horário')
      return
    }

    setCriandoAgendamento(true)

    try {
      // Prepara IDs
      const servicoIds = carrinho
        .filter(item => item.tipo === 'servico')
        .map(item => item.id)
        .join(',')

      const produtoIds = carrinho
        .filter(item => item.tipo === 'produto')
        .map(item => item.id)
        .join(',')

      const planoId = carrinho.find(item => item.tipo === 'plano')?.id

      // Converte data de YYYY-MM-DD para DD-MM-YYYY
      const [ano, mes, dia] = dataSelecionada.split('-')
      const dataFormatada = `${dia}-${mes}-${ano}`

      const resultado = await criarAgendamento({
        cliente_nome: cliente.nome_completo,
        telefone: cliente.telefone,
        data: dataFormatada,
        hora: horarioSelecionado,
        servico_ids: servicoIds,
        barbeiro_id: barbeiroSelecionado || undefined,
        produto_ids: produtoIds || undefined,
        plano_id: planoId,
        observacoes: observacoes || undefined
      })

      if (resultado.success) {
        toast.success('Agendamento criado com sucesso!')
        router.push('/agendamentos')
      } else {
        toast.error(resultado.error || 'Erro ao criar agendamento')
      }
    } catch (error) {
      console.error('Erro ao criar agendamento:', error)
      toast.error('Erro ao criar agendamento')
    } finally {
      setCriandoAgendamento(false)
    }
  }

  if (authLoading || loadingDados) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vinci-primary" />
      </div>
    )
  }

  if (!cliente) return null

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Novo Agendamento" showUser={false} />

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* TABS */}
        <div className="flex space-x-2 border-b border-border">
          <button
            onClick={() => setTabAtiva('servicos')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              tabAtiva === 'servicos'
                ? 'text-vinci-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            SERVIÇOS
            {tabAtiva === 'servicos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vinci-primary" />
            )}
          </button>
          <button
            onClick={() => setTabAtiva('produtos')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              tabAtiva === 'produtos'
                ? 'text-vinci-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            PRODUTOS
            {tabAtiva === 'produtos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vinci-primary" />
            )}
          </button>
          <button
            onClick={() => setTabAtiva('planos')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              tabAtiva === 'planos'
                ? 'text-vinci-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            PACOTES
            {tabAtiva === 'planos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vinci-primary" />
            )}
          </button>
        </div>

        {/* CONTEÚDO DAS TABS */}
        <div className="space-y-4">
          {tabAtiva === 'servicos' && (
            <div className="space-y-3">
              {servicos.map((servico) => (
                <div
                  key={servico.id}
                  onClick={() => toggleCarrinho({
                    id: servico.id,
                    tipo: 'servico',
                    nome: servico.nome,
                    preco: servico.preco,
                    duracao: servico.duracao_minutos,
                    descricao: servico.descricao
                  })}
                  className={`card cursor-pointer transition-all ${
                    itemNoCarrinho(servico.id, 'servico')
                      ? 'border-vinci-primary bg-vinci-primary/5'
                      : 'hover:border-vinci-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{servico.nome}</h3>
                      {servico.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{servico.descricao}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-lg font-bold text-vinci-gold">
                          {formatarDinheiro(servico.preco)}
                        </span>
                        <span className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-1" />
                          {formatarDuracao(servico.duracao_minutos)}
                        </span>
                      </div>
                    </div>
                    <button
                      className={`btn-secondary px-6 ${
                        itemNoCarrinho(servico.id, 'servico') ? 'bg-vinci-primary text-white' : ''
                      }`}
                    >
                      {itemNoCarrinho(servico.id, 'servico') ? 'Selecionado' : 'Selecionar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tabAtiva === 'produtos' && (
            <div className="space-y-3">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  onClick={() => toggleCarrinho({
                    id: produto.id,
                    tipo: 'produto',
                    nome: produto.nome,
                    preco: produto.preco,
                    descricao: produto.descricao
                  })}
                  className={`card cursor-pointer transition-all ${
                    itemNoCarrinho(produto.id, 'produto')
                      ? 'border-vinci-primary bg-vinci-primary/5'
                      : 'hover:border-vinci-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{produto.nome}</h3>
                      {produto.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{produto.descricao}</p>
                      )}
                      <span className="text-lg font-bold text-vinci-gold mt-2 inline-block">
                        {formatarDinheiro(produto.preco)}
                      </span>
                    </div>
                    <button
                      className={`btn-secondary px-6 ${
                        itemNoCarrinho(produto.id, 'produto') ? 'bg-vinci-primary text-white' : ''
                      }`}
                    >
                      {itemNoCarrinho(produto.id, 'produto') ? 'Selecionado' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tabAtiva === 'planos' && (
            <div className="space-y-3">
              {planos.map((plano) => (
                <div
                  key={plano.id}
                  onClick={() => toggleCarrinho({
                    id: plano.id,
                    tipo: 'plano',
                    nome: plano.nome,
                    preco: plano.valor_total,
                    descricao: plano.descricao
                  })}
                  className={`card cursor-pointer transition-all ${
                    itemNoCarrinho(plano.id, 'plano')
                      ? 'border-vinci-primary bg-vinci-primary/5'
                      : 'hover:border-vinci-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{plano.nome}</h3>
                      {plano.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{plano.descricao}</p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-lg font-bold text-vinci-gold">
                          {formatarDinheiro(plano.valor_total)}
                        </span>
                        {plano.valor_original && plano.valor_original > plano.valor_total && (
                          <span className="text-sm text-muted-foreground line-through">
                            {formatarDinheiro(plano.valor_original)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className={`btn-secondary px-6 ${
                        itemNoCarrinho(plano.id, 'plano') ? 'bg-vinci-primary text-white' : ''
                      }`}
                    >
                      {itemNoCarrinho(plano.id, 'plano') ? 'Selecionado' : 'Assinar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CARRINHO */}
        {carrinho.length > 0 && (
          <div className="card bg-vinci-primary/5 border-vinci-primary">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <ShoppingCart className="w-5 h-5 mr-2" />
              Carrinho ({carrinho.length})
            </h3>
            <div className="space-y-2 mb-4">
              {carrinho.map((item, index) => (
                <div key={`${item.tipo}-${item.id}-${index}`} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{item.nome}</p>
                    {item.duracao && (
                      <p className="text-sm text-muted-foreground">{formatarDuracao(item.duracao)}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-vinci-gold">{formatarDinheiro(item.preco)}</span>
                    <button
                      onClick={() => toggleCarrinho(item)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl text-vinci-gold">{formatarDinheiro(calcularTotal())}</span>
            </div>
            {calcularDuracaoTotal() > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Duração total: {formatarDuracao(calcularDuracaoTotal())}
              </p>
            )}
          </div>
        )}

        {/* SELEÇÃO DE BARBEIRO */}
        {carrinho.some(item => item.tipo === 'servico') && (
          <div>
            <h3 className="font-bold text-lg mb-3">Escolher Profissional (Opcional)</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBarbeiroSelecionado('')}
                className={`card text-left ${
                  !barbeiroSelecionado ? 'border-vinci-primary bg-vinci-primary/5' : ''
                }`}
              >
                <p className="font-medium">Qualquer Profissional</p>
                <p className="text-sm text-muted-foreground mt-1">Sistema escolhe o próximo disponível</p>
              </button>
              {barbeiros.map((barbeiro) => (
                <button
                  key={barbeiro.id}
                  onClick={() => setBarbeiroSelecionado(barbeiro.id)}
                  className={`card text-left ${
                    barbeiroSelecionado === barbeiro.id ? 'border-vinci-primary bg-vinci-primary/5' : ''
                  }`}
                >
                  <p className="font-medium">{barbeiro.nome}</p>
                  {barbeiro.especialidade && (
                    <p className="text-sm text-muted-foreground mt-1">{barbeiro.especialidade}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CALENDÁRIO */}
        {carrinho.length > 0 && (
          <div>
            <h3 className="font-bold text-lg mb-3">Escolher Data</h3>
            <div className="flex overflow-x-auto space-x-3 pb-2">
              {gerarDias().map((dia) => {
                const dataStr = format(dia, 'yyyy-MM-dd')
                const selecionada = dataSelecionada === dataStr

                return (
                  <button
                    key={dataStr}
                    onClick={() => setDataSelecionada(dataStr)}
                    className={`flex-shrink-0 card text-center w-24 ${
                      selecionada ? 'border-vinci-primary bg-vinci-primary/5' : ''
                    }`}
                  >
                    <p className="text-sm text-muted-foreground">
                      {format(dia, 'EEE', { locale: ptBR })}
                    </p>
                    <p className="text-2xl font-bold my-1">
                      {format(dia, 'dd')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(dia, 'MMM', { locale: ptBR })}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* HORÁRIOS */}
        {dataSelecionada && carrinho.some(item => item.tipo === 'servico') && (
          <div>
            <h3 className="font-bold text-lg mb-3">Escolher Horário</h3>
            {loadingHorarios ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-vinci-primary" />
              </div>
            ) : horarios.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum horário disponível para esta data
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {horarios.map((horario) => (
                  <button
                    key={horario}
                    onClick={() => setHorarioSelecionado(horario)}
                    className={`card text-center font-medium ${
                      horarioSelecionado === horario
                        ? 'border-vinci-primary bg-vinci-primary text-white'
                        : ''
                    }`}
                  >
                    {horario}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* OBSERVAÇÕES */}
        {carrinho.length > 0 && (
          <div>
            <label className="block font-bold text-lg mb-3">
              Observações (Opcional)
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Alguma preferência ou observação?"
              className="input-field min-h-[100px] resize-none"
              rows={3}
            />
          </div>
        )}

        {/* BOTÃO CONFIRMAR */}
        {carrinho.length > 0 && dataSelecionada && horarioSelecionado && (
          <button
            onClick={handleCriarAgendamento}
            disabled={criandoAgendamento}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50"
          >
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
      </main>

      <BottomNav />
    </div>
  )
}
