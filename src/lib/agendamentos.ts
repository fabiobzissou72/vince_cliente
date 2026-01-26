import { apiGet, apiPost, apiDelete, API_CONFIG } from './api-config'
import { Profissional, Servico, Agendamento, Cliente } from './supabase'

function normalizarDataAgendamento(data?: string | null): string | null {
  if (!data) return null

  if (data.includes('/')) {
    const [dia, mes, ano] = data.split('/')
    if (dia && mes && ano) {
      return `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
    }
  }

  if (data.includes('T')) {
    return data.split('T')[0]
  }

  return data
}

function mapServicosHistorico(ag: any): Servico[] {
  if (Array.isArray(ag.agendamento_servicos)) {
    const servicos = ag.agendamento_servicos.map((as: any) => {
      const servico = as.servicos || as
      if (!servico) return null

      return {
        id: servico.id || as.id || '',
        nome: servico.nome,
        descricao: servico.descricao,
        preco: Number(servico.valor ?? servico.preco ?? as.valor ?? as.preco ?? 0),
        duracao_minutos: Number(servico.duracao_minutos ?? as.duracao_minutos ?? 0),
        ativo: servico.ativo ?? true
      } as Servico
    })

    return servicos.filter(Boolean) as Servico[]
  }

  return Array.isArray(ag.servicos) ? ag.servicos : []
}

function mapAgendamentoHistorico(ag: any): Agendamento {
  const dataAgendamento = normalizarDataAgendamento(ag.data_agendamento || ag.data)
  const servicos = mapServicosHistorico(ag)
  const profissional = ag.profissional || ag.profissionais || (ag.barbeiro ? { nome: ag.barbeiro } : null)

  // Calcular valor total se não vier da API
  let valorTotal = ag.valor || ag.valor_total || null
  if (!valorTotal && servicos && servicos.length > 0) {
    valorTotal = servicos.reduce((sum, s) => sum + (s.preco || 0), 0)
  }

  return {
    id: ag.id,
    data_agendamento: dataAgendamento || ag.data_agendamento,
    hora_inicio: ag.hora_inicio,
    status: ag.status,
    profissional,
    servico: servicos && servicos[0] ? servicos[0] : null,
    servicos,
    observacoes: ag.observacoes ?? null,
    valor: valorTotal
  } as Agendamento
}

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
 * Busca agendamentos do cliente por telefone ou ID
 */
export async function buscarAgendamentosCliente(
  telefoneOrId: string,
  filtro?: 'proximos' | 'historico'
): Promise<Agendamento[]> {
  try {
    if (filtro === 'historico') {
      return await buscarHistoricoCliente(telefoneOrId)
    }

    // Usa proxy local para evitar CORS
    const response = await fetch(`/api/proxy/meus-agendamentos?telefone=${telefoneOrId}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Erro ao buscar agendamentos')
    }

    const data = await response.json() as any

    // A API retorna em data.agendamentos_futuros
    let agendamentosRaw = data.agendamentos_futuros || data.agendamentos || []

    console.log('📦 Dados recebidos da API:', data)
    console.log('📋 Agendamentos raw:', agendamentosRaw)

    // Mapeia para o formato esperado
    let agendamentos = agendamentosRaw.map((ag: any) => {
      // Mapeia do formato da API: data (DD/MM/YYYY) → data_agendamento (YYYY-MM-DD)
      let dataAgendamento = ag.data_agendamento
      if (!dataAgendamento && ag.data) {
        const [dia, mes, ano] = ag.data.split('/')
        dataAgendamento = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`
      }

      return {
        id: ag.id,
        data_agendamento: dataAgendamento,
        hora_inicio: ag.hora_inicio,
        status: ag.status,
        profissional: ag.barbeiro ? { nome: ag.barbeiro } : (ag.profissional || ag.profissionais || null),
        servico: ag.servicos && ag.servicos[0] ? ag.servicos[0] : null,
        servicos: ag.servicos || [],
        observacoes: ag.observacoes || null,
        valor: ag.valor_total || ag.valor || null
      }
    })

    console.log('🔄 Agendamentos mapeados:', agendamentos)

    // A API já retorna apenas agendamentos futuros, então:
    // - "proximos" = todos (já são futuros)
    // - "historico" = vazio (API não retorna histórico)
    if (filtro === 'proximos') {
      // Não filtra, retorna todos (API já filtrou)
      return agendamentos
    } else if (filtro === 'historico') {
      // API de meus-agendamentos não retorna histórico
      // Retorna vazio ou poderia chamar outra API
      return []
    }

    return agendamentos
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
    // Usa proxy local para evitar CORS
    const response = await fetch('/api/proxy/cancelar-agendamento', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agendamento_id: agendamentoId,
        motivo: motivo || 'Cancelado pelo cliente',
        cancelado_por: 'cliente'
      })
    })

    const data = await response.json()

    if (data.success) {
      return { success: true }
    } else {
      return { success: false, error: data.message || 'Erro ao cancelar' }
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
export async function buscarHistoricoCliente(telefone: string): Promise<Agendamento[]> {
  try {
    console.log('🔍 Buscando histórico para telefone:', telefone)

    const response = await fetch(`/api/proxy/clientes-historico?telefone=${telefone}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    })

    console.log('📡 Status da resposta:', response.status)

    if (!response.ok) {
      throw new Error('Erro ao buscar historico')
    }

    const data = await response.json() as any
    console.log('📦 Dados completos recebidos:', data)

    const agendamentosRaw = data?.agendamentos || []
    console.log('📋 Total de agendamentos no histórico:', agendamentosRaw.length)
    console.log('📋 Agendamentos raw:', agendamentosRaw)

    const agendamentosMapeados = agendamentosRaw.map(mapAgendamentoHistorico)
    console.log('✅ Agendamentos mapeados:', agendamentosMapeados)

    return agendamentosMapeados
  } catch (error) {
    console.error('❌ Erro ao buscar histórico:', error)
    return []
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
