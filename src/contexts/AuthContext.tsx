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

  // Carrega cliente do localStorage ao montar
  useEffect(() => {
    const clienteSalvo = localStorage.getItem('vinci_cliente')
    if (clienteSalvo) {
      try {
        setCliente(JSON.parse(clienteSalvo))
      } catch (error) {
        console.error('Erro ao carregar cliente:', error)
        localStorage.removeItem('vinci_cliente')
      }
    }
    setLoading(false)
  }, [])

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
