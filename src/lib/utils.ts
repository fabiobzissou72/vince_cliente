import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Formata data para exibição
 */
export function formatarData(data: string | Date, formato: string = 'dd/MM/yyyy'): string {
  try {
    const dataObj = typeof data === 'string' ? parseISO(data) : data
    return format(dataObj, formato, { locale: ptBR })
  } catch {
    return 'Data inválida'
  }
}

/**
 * Formata valor monetário
 */
export function formatarDinheiro(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

/**
 * Formata duração em minutos para texto
 */
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) {
    return `${minutos}min`
  }
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`
}

/**
 * Obtém iniciais do nome
 */
export function obterIniciais(nome: string): string {
  const partes = nome.trim().split(' ')
  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase()
  }
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

/**
 * Valida email
 */
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Formata CPF
 */
export function formatarCPF(cpf: string): string {
  const limpo = cpf.replace(/\D/g, '')
  if (limpo.length !== 11) return cpf
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Remove acentos de uma string
 */
export function removerAcentos(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
