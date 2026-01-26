import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const dynamic = 'force-dynamic'

/**
 * GET /api/notificacoes
 *
 * Busca notificações do cliente logado
 *
 * Query params:
 * - cliente_id: UUID do cliente (obrigatório)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cliente_id = searchParams.get('cliente_id')

    if (!cliente_id) {
      return NextResponse.json({
        success: false,
        message: 'cliente_id é obrigatório'
      }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Buscar agendamentos futuros do cliente (para lembretes 24h e 2h)
    const hoje = new Date()
    const offsetBrasil = 3 * 60 * 60 * 1000
    const agoraBR = new Date(hoje.getTime() - offsetBrasil)

    // Amanhã para lembrete 24h
    const amanha = new Date(agoraBR)
    amanha.setDate(amanha.getDate() + 1)
    const diaAmanha = String(amanha.getDate()).padStart(2, '0')
    const mesAmanha = String(amanha.getMonth() + 1).padStart(2, '0')
    const anoAmanha = amanha.getFullYear()
    const dataAmanhaBR = `${diaAmanha}/${mesAmanha}/${anoAmanha}`

    // Hoje para lembrete 2h
    const diaHoje = String(agoraBR.getDate()).padStart(2, '0')
    const mesHoje = String(agoraBR.getMonth() + 1).padStart(2, '0')
    const anoHoje = agoraBR.getFullYear()
    const dataHojeBR = `${diaHoje}/${mesHoje}/${anoHoje}`

    // Buscar agendamentos de amanhã (lembrete 24h)
    const { data: agendamentosAmanha } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('cliente_id', cliente_id)
      .eq('data_agendamento', dataAmanhaBR)
      .in('status', ['agendado', 'confirmado'])
      .order('hora_inicio')

    // Buscar agendamentos de hoje (lembrete 2h)
    const { data: agendamentosHoje } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('cliente_id', cliente_id)
      .eq('data_agendamento', dataHojeBR)
      .in('status', ['agendado', 'confirmado'])
      .order('hora_inicio')

    // Buscar agendamentos concluídos para follow-ups
    const tresDiasAtras = new Date(agoraBR)
    tresDiasAtras.setDate(tresDiasAtras.getDate() - 3)
    const dia3d = String(tresDiasAtras.getDate()).padStart(2, '0')
    const mes3d = String(tresDiasAtras.getMonth() + 1).padStart(2, '0')
    const ano3d = tresDiasAtras.getFullYear()
    const data3dBR = `${dia3d}/${mes3d}/${ano3d}`

    const vinteUmDiasAtras = new Date(agoraBR)
    vinteUmDiasAtras.setDate(vinteUmDiasAtras.getDate() - 21)
    const dia21d = String(vinteUmDiasAtras.getDate()).padStart(2, '0')
    const mes21d = String(vinteUmDiasAtras.getMonth() + 1).padStart(2, '0')
    const ano21d = vinteUmDiasAtras.getFullYear()
    const data21dBR = `${dia21d}/${mes21d}/${ano21d}`

    const { data: agendamentosFollowup } = await supabase
      .from('agendamentos')
      .select('*')
      .eq('cliente_id', cliente_id)
      .in('data_agendamento', [data3dBR, data21dBR])
      .eq('status', 'concluido')
      .eq('compareceu', true)
      .order('data_agendamento', { ascending: false })

    // Buscar notificações já visualizadas
    const { data: notificacoesLidas } = await supabase
      .from('notificacoes_clientes')
      .select('notificacao_id')
      .eq('cliente_id', cliente_id)

    const notificacoesLidasSet = new Set(notificacoesLidas?.map(n => n.notificacao_id) || [])

    // Montar notificações
    const notificacoes = []

    // Lembretes 24h
    agendamentosAmanha?.forEach(ag => {
      notificacoes.push({
        id: `24h-${ag.id}`,
        tipo: 'lembrete_24h',
        titulo: '📅 Amanhã é seu corte!',
        mensagem: `Você tem um agendamento amanhã às ${ag.hora_inicio} com ${ag.Barbeiro}`,
        data: ag.data_agendamento,
        hora: ag.hora_inicio,
        barbeiro: ag.Barbeiro,
        agendamento_id: ag.id,
        lida: notificacoesLidasSet.has(`24h-${ag.id}`)
      })
    })

    // Lembretes 2h
    const horaAtual = agoraBR.getHours()
    const minutoAtual = agoraBR.getMinutes()

    agendamentosHoje?.forEach(ag => {
      const [horaAg, minAg] = ag.hora_inicio.split(':').map(Number)
      const minutosAte = (horaAg * 60 + minAg) - (horaAtual * 60 + minutoAtual)

      if (minutosAte >= 120 && minutosAte <= 130) {
        notificacoes.push({
          id: `2h-${ag.id}`,
          tipo: 'lembrete_2h',
          titulo: '⏰ Falta 2 horas!',
          mensagem: `Seu agendamento às ${ag.hora_inicio} com ${ag.Barbeiro} é em 2 horas`,
          data: ag.data_agendamento,
          hora: ag.hora_inicio,
          barbeiro: ag.Barbeiro,
          agendamento_id: ag.id,
          lida: notificacoesLidasSet.has(`2h-${ag.id}`)
        })
      }
    })

    // Follow-ups
    agendamentosFollowup?.forEach(ag => {
      const dataAg = new Date(ag.data_agendamento.split('/').reverse().join('-'))
      const diffDias = Math.floor((agoraBR.getTime() - dataAg.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDias === 3) {
        notificacoes.push({
          id: `f3d-${ag.id}`,
          tipo: 'followup_3d',
          titulo: '⭐ Como foi seu atendimento?',
          mensagem: `Gostaríamos de saber sua opinião sobre o atendimento com ${ag.Barbeiro} há 3 dias`,
          data: ag.data_agendamento,
          hora: ag.hora_inicio,
          barbeiro: ag.Barbeiro,
          agendamento_id: ag.id,
          lida: notificacoesLidasSet.has(`f3d-${ag.id}`)
        })
      } else if (diffDias === 21) {
        notificacoes.push({
          id: `f21d-${ag.id}`,
          tipo: 'followup_21d',
          titulo: '🔄 Hora de reagendar!',
          mensagem: `Já faz 21 dias desde seu último corte com ${ag.Barbeiro}. Que tal marcar outro?`,
          data: ag.data_agendamento,
          hora: ag.hora_inicio,
          barbeiro: ag.Barbeiro,
          agendamento_id: ag.id,
          lida: notificacoesLidasSet.has(`f21d-${ag.id}`)
        })
      }
    })

    // Ordenar por data/hora (mais recentes primeiro)
    notificacoes.sort((a, b) => {
      if (a.lida !== b.lida) return a.lida ? 1 : -1
      return 0
    })

    return NextResponse.json({
      success: true,
      data: {
        total: notificacoes.length,
        nao_lidas: notificacoes.filter(n => !n.lida).length,
        notificacoes: notificacoes
      }
    })

  } catch (error) {
    console.error('[API NOTIFICAÇÕES] Erro:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao buscar notificações',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

/**
 * POST /api/notificacoes
 *
 * Marcar notificação como lida
 *
 * Body: {
 *   cliente_id: string,
 *   notificacao_id: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cliente_id, notificacao_id } = body

    if (!cliente_id || !notificacao_id) {
      return NextResponse.json({
        success: false,
        message: 'cliente_id e notificacao_id são obrigatórios'
      }, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificar se já está marcada como lida
    const { data: existente } = await supabase
      .from('notificacoes_clientes')
      .select('*')
      .eq('cliente_id', cliente_id)
      .eq('notificacao_id', notificacao_id)
      .single()

    if (existente) {
      return NextResponse.json({
        success: true,
        message: 'Notificação já marcada como lida'
      })
    }

    // Marcar como lida
    await supabase
      .from('notificacoes_clientes')
      .insert({
        cliente_id,
        notificacao_id,
        lida_em: new Date().toISOString()
      })

    return NextResponse.json({
      success: true,
      message: 'Notificação marcada como lida'
    })

  } catch (error) {
    console.error('[API NOTIFICAÇÕES] Erro ao marcar como lida:', error)
    return NextResponse.json({
      success: false,
      message: 'Erro ao marcar notificação como lida',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
