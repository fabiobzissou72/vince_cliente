import { apiGet, apiPost, API_CONFIG } from './api-config'

export interface Plano {
  id: string
  nome: string
  descricao?: string
  valor_original?: number
  valor_total: number
  quantidade_servicos: number
  validade_dias: number
  ativo: boolean
  servicos_inclusos?: string[]
  economia?: number
}

/**
 * Lista todos os planos ativos
 */
export async function buscarPlanos(): Promise<Plano[]> {
  try {
    const response = await apiGet<{ success: boolean; total: number; planos: Plano[] }>(
      API_CONFIG.ENDPOINTS.PLANOS_LISTAR,
      { ativo: 'true' }
    )
    return response.planos || []
  } catch (error) {
    console.error('Erro ao buscar planos:', error)
    return []
  }
}

/**
 * Busca plano por ID
 */
export async function buscarPlanoPorId(id: string): Promise<Plano | null> {
  try {
    const planos = await buscarPlanos()
    return planos.find(p => p.id === id) || null
  } catch (error) {
    console.error('Erro ao buscar plano:', error)
    return null
  }
}

/**
 * Calcula economia do plano
 */
export function calcularEconomia(plano: Plano): number {
  if (!plano.valor_original) return 0
  return plano.valor_original - plano.valor_total
}
