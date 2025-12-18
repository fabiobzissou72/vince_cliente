import { apiGet, apiPost, apiDelete, API_CONFIG } from './api-config'
import { Profissional, Servico, Agendamento, Cliente } from './supabase'

/**
 * Busca todos os barbeiros/profissionais ativos
 */
export async function buscarBarbeiros(): Promise<Profissional[]> {
  try {
    const response = await apiGet<{ barbeiros: Profissional[] }>(
      API_CONFIG.ENDPOINTS.BARBEIROS_LISTAR,
      { ativo: 'true' }
    )
    return response.barbeiros || []
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error)
    return []
  }
}

/**
 * Busca todos os serviços ativos
 */
export async function buscarServicos(): Promise<Servico[]> {
  try {
    const response = await apiGet<Servico[]>(API_CONFIG.ENDPOINTS.SERVICOS_LISTAR)
    return Array.isArray(response) ? response.filter(s => s.ativo) : []
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return []
  }
}

/**
 * Busca horários disponíveis para agendamento
 * @param data Data no formato YYYY-MM-DD
 * @param barbeiroId ID do barbeiro (opcional)
 * @param servicoIds IDs dos serviços separados por vírgula
 */
export async function buscarHorariosDisponiveis(
  data: string,
  barbeiroId?: string,
  servicoIds?: string
): Promise<string[]> {
  try {
    const params: Record<string, string> = { data }

    if (barbeiroId) {
      params.barbeiro = barbeiroId
    }

    if (servicoIds) {
      params.servico_ids = servicoIds
    }

    const response = await apiGet<{ horarios: string[] }>(
      API_CONFIG.ENDPOINTS.AGENDAMENTOS_HORARIOS_DISPONIVEIS,
      params
    )

    return response.horarios || []
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error)
    return []
  }
}

/**
 * Cria um novo agendamento
 */
export async function criarAgendamento(dados: {
  cliente_nome: string
  telefone: string
  data: string // DD-MM-YYYY
  hora: string // HH:MM
  servico_ids: string // IDs separados por vírgula
  barbeiro_id?: string
  observacoes?: string
  produto_ids?: string
  plano_id?: string
}): Promise<{ success: boolean; agendamento?: any; error?: string }> {
  try {
    const response = await apiPost<{ success: boolean; agendamento: any; message?: string }>(
      API_CONFIG.ENDPOINTS.AGENDAMENTOS_CRIAR,
      dados
    )

    if (response.success) {
      return { success: true, agendamento: response.agendamento }
    } else {
      return { success: false, error: response.message || 'Erro ao criar agendamento' }
    }
  } catch (error: any) {
    console.error('Erro ao criar agendamento:', error)
    return { success: false, error: error.message || 'Erro ao criar agendamento' }
  }
}

/**
 * Busca agendamentos do cliente por telefone
 */
export async function buscarAgendamentosCliente(telefone: string): Promise<Agendamento[]> {
  try {
    const response = await apiGet<{ agendamentos: Agendamento[] }>(
      API_CONFIG.ENDPOINTS.CLIENTES_MEUS_AGENDAMENTOS,
      { telefone }
    )

    return response.agendamentos || []
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return []
  }
}

/**
 * Cancela um agendamento
 */
export async function cancelarAgendamento(
  agendamentoId: string,
  motivo?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiDelete<{ success: boolean; message?: string }>(
      API_CONFIG.ENDPOINTS.AGENDAMENTOS_CANCELAR,
      {
        agendamento_id: agendamentoId,
        motivo: motivo || 'Cancelado pelo cliente',
        cancelado_por: 'cliente'
      }
    )

    if (response.success) {
      return { success: true }
    } else {
      return { success: false, error: response.message || 'Erro ao cancelar' }
    }
  } catch (error: any) {
    console.error('Erro ao cancelar agendamento:', error)
    return { success: false, error: error.message || 'Erro ao cancelar agendamento' }
  }
}

/**
 * Reagenda um agendamento existente
 */
export async function reagendarAgendamento(
  agendamentoId: string,
  novaData: string,
  novaHora: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiPost<{ success: boolean; message?: string }>(
      API_CONFIG.ENDPOINTS.AGENDAMENTOS_REAGENDAR,
      {
        agendamento_id: agendamentoId,
        nova_data: novaData,
        nova_hora: novaHora
      }
    )

    if (response.success) {
      return { success: true }
    } else {
      return { success: false, error: response.message || 'Erro ao reagendar' }
    }
  } catch (error: any) {
    console.error('Erro ao reagendar:', error)
    return { success: false, error: error.message || 'Erro ao reagendar' }
  }
}

/**
 * Confirma comparecimento do cliente
 */
export async function confirmarComparecimento(
  agendamentoId: string,
  confirmado: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiPost<{ success: boolean; message?: string }>(
      API_CONFIG.ENDPOINTS.AGENDAMENTOS_CONFIRMAR,
      {
        agendamento_id: agendamentoId,
        confirmado
      }
    )

    if (response.success) {
      return { success: true }
    } else {
      return { success: false, error: response.message }
    }
  } catch (error: any) {
    console.error('Erro ao confirmar comparecimento:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Busca histórico completo do cliente
 */
export async function buscarHistoricoCliente(telefone: string): Promise<any> {
  try {
    const response = await apiGet<any>(
      API_CONFIG.ENDPOINTS.CLIENTES_HISTORICO,
      { telefone }
    )

    return response
  } catch (error) {
    console.error('Erro ao buscar histórico:', error)
    return null
  }
}

/**
 * Atualiza dados do cliente
 */
export async function atualizarDadosCliente(
  clienteId: string,
  dados: Partial<Cliente>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiPost<{ success: boolean; message?: string }>(
      API_CONFIG.ENDPOINTS.CLIENTES_ATUALIZAR,
      {
        cliente_id: clienteId,
        ...dados
      }
    )

    if (response.success) {
      return { success: true }
    } else {
      return { success: false, error: response.message || 'Erro ao atualizar dados' }
    }
  } catch (error: any) {
    console.error('Erro ao atualizar dados:', error)
    return { success: false, error: error.message || 'Erro ao atualizar dados' }
  }
}
