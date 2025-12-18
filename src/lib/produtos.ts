import { apiGet, apiPost, API_CONFIG } from './api-config'

export interface Produto {
  id: string
  nome: string
  descricao?: string
  preco: number
  estoque: number
  ativo: boolean
  foto_url?: string
  categoria?: string
}

/**
 * Lista todos os produtos ativos
 */
export async function buscarProdutos(): Promise<Produto[]> {
  try {
    const response = await apiGet<{ success: boolean; total: number; produtos: Produto[] }>(
      API_CONFIG.ENDPOINTS.PRODUTOS_LISTAR,
      { ativo: 'true' }
    )
    return response.produtos || []
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }
}

/**
 * Busca produto por ID
 */
export async function buscarProdutoPorId(id: string): Promise<Produto | null> {
  try {
    const produtos = await buscarProdutos()
    return produtos.find(p => p.id === id) || null
  } catch (error) {
    console.error('Erro ao buscar produto:', error)
    return null
  }
}
