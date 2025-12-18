import { supabase, Agendamento, Profissional, Servico } from './supabase'

/**
 * Busca todos os profissionais ativos
 */
export async function buscarBarbeiros(): Promise<Profissional[]> {
  try {
    const { data, error } = await supabase
      .from('profissionais')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar profissionais:', error)
    return []
  }
}

/**
 * Busca todos os serviços ativos
 */
export async function buscarServicos(): Promise<Servico[]> {
  try {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .eq('ativo', true)
      .order('nome', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Erro ao buscar serviços:', error)
    return []
  }
}

/**
 * Busca horários disponíveis para uma data e profissional
 */
export async function buscarHorariosDisponiveis(
  profissionalId: string,
  data: string
): Promise<string[]> {
  try {
    // Busca agendamentos existentes para aquele profissional naquela data
    const { data: agendamentosExistentes, error } = await supabase
      .from('agendamentos')
      .select('hora_inicio, hora_fim')
      .eq('profissional_id', profissionalId)
      .eq('data_agendamento', data)
      .in('status', ['pendente', 'confirmado'])

    if (error) throw error

    // Gera horários disponíveis (9h às 19h, intervalo de 30min)
    const horarios: string[] = []
    for (let h = 9; h < 19; h++) {
      for (let m = 0; m < 60; m += 30) {
        const horario = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`

        // Verifica se o horário está livre
        const ocupado = agendamentosExistentes?.some(ag => {
          return ag.hora_inicio === horario
        })

        if (!ocupado) {
          horarios.push(horario)
        }
      }
    }

    return horarios
  } catch (error) {
    console.error('Erro ao buscar horários:', error)
    return []
  }
}

/**
 * Cria um novo agendamento
 */
export async function criarAgendamento(dados: {
  cliente_id: string
  profissional_id: string
  servico_id: string
  data_agendamento: string
  hora_inicio: string
  observacoes?: string
  nome_cliente?: string
  telefone?: string
}): Promise<{ success: boolean; agendamento?: Agendamento; error?: string }> {
  try {
    // Busca dados do serviço para calcular hora_fim
    const { data: servico } = await supabase
      .from('servicos')
      .select('duracao_minutos')
      .eq('id', dados.servico_id)
      .single()

    let hora_fim = dados.hora_inicio
    if (servico) {
      const [h, m] = dados.hora_inicio.split(':').map(Number)
      const totalMinutos = h * 60 + m + servico.duracao_minutos
      const fimH = Math.floor(totalMinutos / 60)
      const fimM = totalMinutos % 60
      hora_fim = `${fimH.toString().padStart(2, '0')}:${fimM.toString().padStart(2, '0')}`
    }

    const { data: agendamento, error } = await supabase
      .from('agendamentos')
      .insert([{
        cliente_id: dados.cliente_id,
        profissional_id: dados.profissional_id,
        servico_id: dados.servico_id,
        data_agendamento: dados.data_agendamento,
        hora_inicio: dados.hora_inicio,
        observacoes: dados.observacoes,
        nome_cliente: dados.nome_cliente,
        telefone: dados.telefone,
        status: 'agendado'
      }])
      .select(`
        *,
        profissionais(*),
        servicos(*)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar agendamento:', error)
      return { success: false, error: 'Erro ao criar agendamento' }
    }

    return { success: true, agendamento }
  } catch (error) {
    console.error('Erro ao criar agendamento:', error)
    return { success: false, error: 'Erro ao criar agendamento' }
  }
}

/**
 * Busca agendamentos do cliente
 */
export async function buscarAgendamentosCliente(
  clienteId: string,
  filtro?: 'proximos' | 'historico'
): Promise<Agendamento[]> {
  try {
    let query = supabase
      .from('agendamentos')
      .select(`
        *,
        profissionais(*),
        servicos(*)
      `)
      .eq('cliente_id', clienteId)

    // Filtros
    if (filtro === 'proximos') {
      const hoje = new Date().toISOString().split('T')[0]
      query = query
        .gte('data_agendamento', hoje)
        .in('status', ['agendado', 'confirmado'])
        .order('data_agendamento', { ascending: true })
        .order('hora_inicio', { ascending: true })
    } else if (filtro === 'historico') {
      const hoje = new Date().toISOString().split('T')[0]
      query = query
        .or(`data_agendamento.lt.${hoje},status.in.(concluido,cancelado)`)
        .order('data_agendamento', { ascending: false })
        .order('hora_inicio', { ascending: false })
    } else {
      query = query
        .order('data_agendamento', { ascending: false })
        .order('hora_inicio', { ascending: false })
    }

    const { data, error } = await query

    if (error) throw error

    // Mapeia os dados para o formato esperado
    return (data || []).map(ag => ({
      ...ag,
      profissional: ag.profissionais,
      servico: ag.servicos
    }))
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return []
  }
}

/**
 * Cancela um agendamento
 */
export async function cancelarAgendamento(
  agendamentoId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('agendamentos')
      .update({ status: 'cancelado' })
      .eq('id', agendamentoId)

    if (error) {
      console.error('Erro ao cancelar agendamento:', error)
      return { success: false, error: 'Erro ao cancelar agendamento' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao cancelar agendamento:', error)
    return { success: false, error: 'Erro ao cancelar agendamento' }
  }
}

/**
 * Atualiza dados do cliente
 */
export async function atualizarDadosCliente(
  clienteId: string,
  dados: {
    nome_completo?: string
    email?: string
    data_nascimento?: string
    profissao?: string
    estado_civil?: string
    tem_filhos?: boolean
    estilo_preferido?: string
    bebida_preferida?: string
    gosta_conversar?: boolean
    observacoes?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('clientes')
      .update(dados)
      .eq('id', clienteId)

    if (error) {
      console.error('Erro ao atualizar dados:', error)
      return { success: false, error: 'Erro ao atualizar dados' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar dados:', error)
    return { success: false, error: 'Erro ao atualizar dados' }
  }
}
