'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Cliente } from '@/lib/supabase'
import { loginCliente, cadastrarCliente, AuthResponse } from '@/lib/auth'

interface AuthContextType {
  cliente: Cliente | null
  loading: boolean
  login: (telefone: string, senha: string) => Promise<AuthResponse>
  cadastrar: (dados: any) => Promise<AuthResponse>
  logout: () => void
  atualizarCliente: (cliente: Cliente) => void
  setClienteLogado: (cliente: Cliente) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [loading, setLoading] = useState(true)

  // Função para verificar se cliente ainda existe no banco
  const verificarClienteExiste = async (clienteId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/proxy/verificar-cliente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente_id: clienteId })
      })
      const data = await response.json()
      return data.existe === true
    } catch (error) {
      console.error('Erro ao verificar cliente:', error)
      return true // Em caso de erro de rede, mantém logado
    }
  }

  // Carrega cliente do localStorage ao montar
  useEffect(() => {
    const carregarCliente = () => {
      const clienteSalvo = localStorage.getItem('vinci_cliente')
      if (clienteSalvo) {
        try {
          const clienteData = JSON.parse(clienteSalvo)
          setCliente(clienteData)
        } catch (error) {
          console.error('Erro ao carregar cliente:', error)
          localStorage.removeItem('vinci_cliente')
        }
      }
      setLoading(false)
    }

    carregarCliente()
  }, [])

  // Verificação periódica a cada 10 minutos
  useEffect(() => {
    if (!cliente) return

    const intervalo = setInterval(async () => {
      const existe = await verificarClienteExiste(cliente.id)
      if (!existe) {
        console.log('Cliente removido do banco - logout automático')
        setCliente(null)
        localStorage.removeItem('vinci_cliente')
      }
    }, 10 * 60 * 1000) // 10 minutos

    return () => clearInterval(intervalo)
  }, [cliente])

  // Salva cliente no localStorage quando muda
  useEffect(() => {
    if (cliente) {
      localStorage.setItem('vinci_cliente', JSON.stringify(cliente))
    } else {
      localStorage.removeItem('vinci_cliente')
    }
  }, [cliente])

  const login = async (telefone: string, senha: string): Promise<AuthResponse> => {
    const resultado = await loginCliente(telefone, senha)
    if (resultado.success && resultado.cliente) {
      setCliente(resultado.cliente)
    }
    return resultado
  }

  const cadastrar = async (dados: any): Promise<AuthResponse> => {
    const resultado = await cadastrarCliente(dados)
    if (resultado.success && resultado.cliente) {
      setCliente(resultado.cliente)
    }
    return resultado
  }

  const logout = () => {
    setCliente(null)
    localStorage.removeItem('vinci_cliente')
  }

  const atualizarCliente = (clienteAtualizado: Cliente) => {
    setCliente(clienteAtualizado)
  }

  const setClienteLogado = (clienteLogado: Cliente) => {
    setCliente(clienteLogado)
  }

  return (
    <AuthContext.Provider value={{ cliente, loading, login, cadastrar, logout, atualizarCliente, setClienteLogado }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
