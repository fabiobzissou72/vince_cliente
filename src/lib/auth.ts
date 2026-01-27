import { supabase, Cliente } from './supabase'
import bcrypt from 'bcryptjs'

export interface AuthResponse {
  success: boolean
  cliente?: Cliente
  error?: string
  precisaTrocarSenha?: boolean
  senhaTemporariaEnviada?: boolean
}

/**
 * Faz login do cliente com telefone e senha
 */
export async function loginCliente(telefone: string, senha: string): Promise<AuthResponse> {
  try {
    // Remove formatação do telefone (mantém apenas números)
    const telefoneLimpo = telefone.replace(/\D/g, '')

    // Busca cliente pelo telefone
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefone', telefoneLimpo)
      .single()

    if (error || !cliente) {
      return { success: false, error: 'Telefone não cadastrado' }
    }

    // Verifica se tem senha cadastrada
    if (!cliente.senha) {
      return { success: false, error: 'Senha não cadastrada. Por favor, faça o cadastro.' }
    }

    // Verifica senha
    const senhaCorreta = await bcrypt.compare(senha, cliente.senha)
    if (!senhaCorreta) {
      return { success: false, error: 'Senha incorreta' }
    }

    // Atualiza último acesso
    await supabase
      .from('clientes')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', cliente.id)

    // Remove senha do objeto retornado
    const { senha: _, ...clienteSemSenha } = cliente

    return { success: true, cliente: clienteSemSenha as Cliente }
  } catch (error) {
    console.error('Erro no login:', error)
    return { success: false, error: 'Erro ao fazer login. Tente novamente.' }
  }
}

/**
 * Converte estado civil do formato do app para o formato do dashboard
 */
function converterEstadoCivil(valor?: string): string | null {
  if (!valor) return null
  const mapa: Record<string, string> = {
    'solteiro': 'Solteiro(a)',
    'casado': 'Casado(a)',
    'divorciado': 'Divorciado(a)',
    'viuvo': 'Viúvo(a)'
  }
  return mapa[valor.toLowerCase()] || valor
}

/**
 * Converte como_soube do formato do app para o formato do dashboard
 */
function converterComoSoube(valor?: string): string | null {
  if (!valor) return null
  const mapa: Record<string, string> = {
    'indicacao': 'Indicação',
    'redes_sociais': 'Instagram',
    'google': 'Google',
    'passando': 'Passando na Rua',
    'outro': 'Outro'
  }
  return mapa[valor.toLowerCase()] || valor
}

/**
 * Converte data de YYYY-MM-DD para DD/MM/YYYY
 */
function converterData(data?: string): string | null {
  if (!data) return null
  const partes = data.split('-')
  if (partes.length === 3 && partes[0].length === 4) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }
  return data
}

/**
 * Cadastra novo cliente com senha
 */
export async function cadastrarCliente(dados: {
  nome_completo: string
  telefone: string
  email: string
  senha: string
  data_nascimento?: string
  profissao?: string
  estado_civil?: string
  tem_filhos?: boolean
  como_soube?: string
  gosta_conversar?: boolean
}): Promise<AuthResponse> {
  try {
    // Remove formatação do telefone
    const telefoneLimpo = dados.telefone.replace(/\D/g, '')

    // Verifica se já existe
    const { data: clienteExistente } = await supabase
      .from('clientes')
      .select('id')
      .eq('telefone', telefoneLimpo)
      .single()

    if (clienteExistente) {
      return { success: false, error: 'Telefone já cadastrado' }
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(dados.senha, 10)

    // Converte dados para o formato esperado pelo dashboard
    const estadoCivilConvertido = converterEstadoCivil(dados.estado_civil)
    const comoSoubeConvertido = converterComoSoube(dados.como_soube)
    const dataNascimentoConvertida = converterData(dados.data_nascimento)
    const temFilhosConvertido = dados.tem_filhos === undefined ? null : (dados.tem_filhos ? 'Sim' : 'Não')
    const gostaConversarConvertido = dados.gosta_conversar === undefined ? null : (dados.gosta_conversar ? 'Sim' : 'Não')

    // Cria cliente
    const { data: novoCliente, error } = await supabase
      .from('clientes')
      .insert([{
        nome_completo: dados.nome_completo,
        telefone: telefoneLimpo,
        email: dados.email,
        senha: senhaHash,
        data_nascimento: dataNascimentoConvertida,
        profissao: dados.profissao || null,
        estado_civil: estadoCivilConvertido,
        tem_filhos: temFilhosConvertido,
        como_soube: comoSoubeConvertido,
        gosta_conversar: gostaConversarConvertido,
        is_vip: false,
        data_cadastro: new Date().toISOString(),
        ultimo_acesso: new Date().toISOString()
      }])
      .select()
      .single()

    if (error || !novoCliente) {
      console.error('Erro ao criar cliente:', error)
      return { success: false, error: 'Erro ao cadastrar. Tente novamente.' }
    }

    // Remove senha do retorno
    const { senha: _, ...clienteSemSenha } = novoCliente

    return { success: true, cliente: clienteSemSenha as Cliente }
  } catch (error) {
    console.error('Erro no cadastro:', error)
    return { success: false, error: 'Erro ao cadastrar. Tente novamente.' }
  }
}

/**
 * Atualiza senha do cliente
 */
export async function atualizarSenha(clienteId: string, senhaAtual: string, novaSenha: string): Promise<AuthResponse> {
  try {
    // Busca cliente
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('senha')
      .eq('id', clienteId)
      .single()

    if (error || !cliente) {
      return { success: false, error: 'Cliente não encontrado' }
    }

    // Verifica senha atual
    const senhaCorreta = await bcrypt.compare(senhaAtual, cliente.senha || '')
    if (!senhaCorreta) {
      return { success: false, error: 'Senha atual incorreta' }
    }

    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10)

    // Atualiza
    const { error: erroUpdate } = await supabase
      .from('clientes')
      .update({ senha: novaSenhaHash })
      .eq('id', clienteId)

    if (erroUpdate) {
      return { success: false, error: 'Erro ao atualizar senha' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar senha:', error)
    return { success: false, error: 'Erro ao atualizar senha. Tente novamente.' }
  }
}

/**
 * Recupera senha por email
 */
export async function recuperarSenha(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Busca cliente pelo email
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('id, nome_completo, telefone')
      .eq('email', email)
      .single()

    if (error || !cliente) {
      return { success: false, error: 'Email não encontrado' }
    }

    // Gera nova senha temporária (6 dígitos)
    const senhaTemporaria = Math.floor(100000 + Math.random() * 900000).toString()
    const senhaHash = await bcrypt.hash(senhaTemporaria, 10)

    // Atualiza senha
    const { error: erroUpdate } = await supabase
      .from('clientes')
      .update({ senha: senhaHash })
      .eq('id', cliente.id)

    if (erroUpdate) {
      return { success: false, error: 'Erro ao recuperar senha' }
    }

    // TODO: Integrar com serviço de email para enviar senha temporária
    // Por enquanto, retorna a senha temporária (em produção, deve ser enviada por email)
    return {
      success: true,
      message: `Senha temporária gerada: ${senhaTemporaria}. Em produção, será enviada por email.`
    }
  } catch (error) {
    console.error('Erro ao recuperar senha:', error)
    return { success: false, error: 'Erro ao recuperar senha. Tente novamente.' }
  }
}

/**
 * Valida formato do telefone brasileiro
 */
export function validarTelefone(telefone: string): boolean {
  const telefoneLimpo = telefone.replace(/\D/g, '')
  return telefoneLimpo.length === 10 || telefoneLimpo.length === 11
}

/**
 * Formata telefone para exibição
 */
export function formatarTelefone(telefone: string): string {
  const limpo = telefone.replace(/\D/g, '')
  if (limpo.length === 11) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 7)}-${limpo.slice(7)}`
  }
  if (limpo.length === 10) {
    return `(${limpo.slice(0, 2)}) ${limpo.slice(2, 6)}-${limpo.slice(6)}`
  }
  return telefone
}

/**
 * Verifica se cliente existe e se tem senha cadastrada
 * Retorna informações sobre o status do cliente
 */
export async function verificarCliente(telefone: string): Promise<{
  existe: boolean
  temSenha: boolean
  cliente?: Cliente
  error?: string
}> {
  try {
    const telefoneLimpo = telefone.replace(/\D/g, '')

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefone', telefoneLimpo)
      .single()

    if (error || !cliente) {
      return { existe: false, temSenha: false, error: 'Cliente não encontrado' }
    }

    return {
      existe: true,
      temSenha: !!cliente.senha,
      cliente: cliente as Cliente
    }
  } catch (error) {
    console.error('Erro ao verificar cliente:', error)
    return { existe: false, temSenha: false, error: 'Erro ao verificar cliente' }
  }
}

/**
 * Gera e envia senha temporária via WhatsApp
 * Chama API dedicada do sistema principal
 */
export async function enviarSenhaTemporaria(telefone: string): Promise<{
  success: boolean
  senhaTemporaria?: string
  error?: string
}> {
  try {
    const telefoneLimpo = telefone.replace(/\D/g, '')

    // Chama proxy local que se comunica com a API principal
    const response = await fetch('/api/proxy/enviar-senha-temporaria', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ telefone: telefoneLimpo })
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Erro ao gerar senha temporária'
      }
    }

    return {
      success: true,
      senhaTemporaria: data.senhaTemporaria
    }
  } catch (error) {
    console.error('Erro ao enviar senha temporária:', error)
    return {
      success: false,
      error: 'Erro ao conectar com o servidor. Tente novamente.'
    }
  }
}

/**
 * Login simplificado (sem validação de expiração)
 * Usa a mesma lógica do loginCliente
 */
export async function loginComSenhaTemporaria(telefone: string, senha: string): Promise<AuthResponse> {
  try {
    const telefoneLimpo = telefone.replace(/\D/g, '')

    // Busca cliente
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('telefone', telefoneLimpo)
      .single()

    if (error || !cliente) {
      return { success: false, error: 'Telefone não cadastrado' }
    }

    if (!cliente.senha) {
      return { success: false, error: 'Senha não cadastrada' }
    }

    // Verifica senha
    const senhaCorreta = await bcrypt.compare(senha, cliente.senha)
    if (!senhaCorreta) {
      return { success: false, error: 'Senha incorreta' }
    }

    // Atualiza último acesso
    await supabase
      .from('clientes')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', cliente.id)

    // Remove senha do objeto retornado
    const { senha: _, ...clienteSemSenha } = cliente

    return {
      success: true,
      cliente: clienteSemSenha as Cliente,
      precisaTrocarSenha: false // Sempre false, não usa flag temporária
    }
  } catch (error) {
    console.error('Erro no login:', error)
    return { success: false, error: 'Erro ao fazer login' }
  }
}

/**
 * Troca senha (simplificado - apenas atualiza a senha)
 */
export async function trocarSenhaTemporaria(
  clienteId: string,
  novaSenha: string
): Promise<AuthResponse> {
  try {
    // Hash da nova senha
    const novaSenhaHash = await bcrypt.hash(novaSenha, 10)

    // Atualiza senha
    const { error } = await supabase
      .from('clientes')
      .update({ senha: novaSenhaHash })
      .eq('id', clienteId)

    if (error) {
      console.error('Erro ao trocar senha:', error)
      return { success: false, error: 'Erro ao trocar senha' }
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao trocar senha:', error)
    return { success: false, error: 'Erro ao trocar senha' }
  }
}
