'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { Calendar as CalendarIcon, Clock, Loader2, X, CheckCircle } from 'lucide-react'
import { formatarDinheiro, formatarDuracao } from '@/lib/utils'
import { toast } from 'sonner'
import { format, addDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Usando API Routes locais para evitar CORS
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

export default function AgendarPage() {
  const router = useRouter()
  const { cliente, loading: authLoading } = useAuth()

  const [tabAtiva, setTabAtiva] = useState<TabType>('servicos')
  const [servicos, setServicos] = useState<Servico[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !cliente) {
      router.push('/login')
    }
  }, [authLoading, cliente, router])

  useEffect(() => {
    carregarDados()
  }, [])

  async function carregarDados() {
    try {
      setLoading(true)
      setError(null)

      console.log('🔥 Buscando dados da API...')

      // SERVIÇOS (via proxy local - sem CORS)
      const servicosRes = await fetch(`${API_PROXY}/servicos`)
      console.log('📡 Serviços Response:', servicosRes.status)
      const servicosData = await servicosRes.json()
      console.log('✅ Serviços Data:', servicosData)
      setServicos(Array.isArray(servicosData) ? servicosData.filter((s: Servico) => s.ativo) : [])

      // PRODUTOS (via proxy local - sem CORS)
      const produtosRes = await fetch(`${API_PROXY}/produtos`)
      console.log('📡 Produtos Response:', produtosRes.status)
      const produtosData = await produtosRes.json()
      console.log('✅ Produtos Data:', produtosData)
      setProdutos(produtosData.produtos || [])

      // PLANOS (via proxy local - sem CORS)
      const planosRes = await fetch(`${API_PROXY}/planos`)
      console.log('📡 Planos Response:', planosRes.status)
      const planosData = await planosRes.json()
      console.log('✅ Planos Data:', planosData)
      setPlanos(planosData.planos || [])

      console.log('🎉 DADOS CARREGADOS:', {
        servicos: servicosData?.length || 0,
        produtos: produtosData?.produtos?.length || 0,
        planos: planosData?.planos?.length || 0
      })

    } catch (err: any) {
      console.error('❌ ERRO AO CARREGAR:', err)
      setError(err.message)
      toast.error('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-vinci-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!cliente) return null

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Agendar Serviço" showUser={false} />

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
            SERVIÇOS ({servicos.length})
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
            PRODUTOS ({produtos.length})
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
            PACOTES ({planos.length})
            {tabAtiva === 'planos' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vinci-primary" />
            )}
          </button>
        </div>

        {/* ERRO */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={carregarDados}
              className="mt-3 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* CONTEÚDO */}
        <div className="space-y-4">
          {/* SERVIÇOS */}
          {tabAtiva === 'servicos' && (
            <div className="space-y-3">
              {servicos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum serviço disponível
                </p>
              ) : (
                servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="card hover:border-vinci-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{servico.nome}</h3>
                        {servico.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">{servico.descricao}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-lg font-bold text-vinci-gold">
                            R$ {servico.preco.toFixed(2)}
                          </span>
                          <span className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-1" />
                            {servico.duracao_minutos} min
                          </span>
                        </div>
                      </div>
                      <button className="btn-secondary px-6">
                        Selecionar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PRODUTOS */}
          {tabAtiva === 'produtos' && (
            <div className="space-y-3">
              {produtos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum produto disponível
                </p>
              ) : (
                produtos.map((produto) => (
                  <div
                    key={produto.id}
                    className="card hover:border-vinci-primary/50 transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-lg">{produto.nome}</h3>
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                            {produto.estoque} em estoque
                          </span>
                        </div>
                        {produto.descricao && (
                          <p className="text-sm text-muted-foreground mt-1">{produto.descricao}</p>
                        )}
                        <span className="text-lg font-bold text-vinci-gold mt-2 inline-block">
                          R$ {produto.preco.toFixed(2)}
                        </span>
                      </div>
                      <button className="btn-secondary px-6 ml-4">
                        Adicionar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* PLANOS */}
          {tabAtiva === 'planos' && (
            <div className="space-y-3">
              {planos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhum pacote disponível
                </p>
              ) : (
                planos.map((plano) => (
                  <div
                    key={plano.id}
                    className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-300 dark:border-blue-600 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                        {plano.nome}
                      </h3>
                      <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded">
                        PACOTE
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      {plano.itens_inclusos}
                    </p>
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Validade:</span>
                        <span className="font-semibold">{plano.validade_dias} dias</span>
                      </div>
                    </div>
                    <div className="border-t border-blue-300 dark:border-blue-600 pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 line-through">
                          De R$ {plano.valor_original.toFixed(2)}
                        </span>
                        <span className="text-xs text-green-600 dark:text-green-400 font-bold">
                          ECONOMIZE R$ {plano.economia.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          R$ {plano.valor_total.toFixed(2)}
                        </span>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                          Assinar
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
