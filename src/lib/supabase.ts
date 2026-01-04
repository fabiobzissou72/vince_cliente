import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Types
export interface Cliente {
  id: string
  nome_completo: string
  telefone: string
  email?: string
  senha?: string
  data_nascimento?: string
  profissao?: string
  estado_civil?: string
  tem_filhos?: boolean
  profissional_preferido?: string
  observacoes?: string
  is_vip: boolean
  como_soube?: string
  gosta_conversar?: boolean
  estilo_cabelo?: string
  tipo_bebida?: string
  data_cadastro: string
  ultimo_acesso?: string
}

export interface Profissional {
  id: string
  nome: string
  especialidade?: string
  foto_url?: string
  ativo: boolean
  ordem_exibicao?: number
}

export interface Servico {
  id: string
  nome: string
  descricao?: string
  preco: number
  duracao_minutos: number
  ativo: boolean
}

export interface Agendamento {
  id: string
  cliente_id: string
  profissional_id: string
  servico_id: string
  data_agendamento: string
  hora_inicio: string
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado'
  observacoes?: string
  valor?: number
  nome_cliente?: string
  telefone?: string
  Barbeiro?: string
  data_criacao?: string
  updated_at?: string
  google_calendar_event_id?: string
  compareceu?: boolean
  checkin_at?: string
  cliente?: Cliente
  profissional?: Profissional
  profissionais?: Profissional
  servico?: Servico
  servicos?: Servico[]
}

export interface Plano {
  id: string
  nome: string
  descricao?: string
  valor: number
  quantidade_cortes: number
  validade_dias: number
  ativo: boolean
}
