'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Scissors, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { formatarTelefone } from '@/lib/auth'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '')
    if (valor.length <= 11) {
      setTelefone(formatarTelefone(valor))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!telefone || !senha) {
      toast.error('Preencha todos os campos')
      return
    }

    setLoading(true)

    try {
      const resultado = await login(telefone, senha)

      if (resultado.success) {
        toast.success('Login realizado com sucesso!')
        router.push('/dashboard')
      } else {
        toast.error(resultado.error || 'Erro ao fazer login')
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-vinci-dark via-vinci-primary to-vinci-secondary">
      {/* Header */}
      <div className="flex-shrink-0 pt-12 pb-8 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm mb-4">
          <Scissors className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Vinci Barbearia</h1>
        <p className="text-vinci-accent">Bem-vindo de volta!</p>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white dark:bg-vinci-dark rounded-t-3xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div>
            <h2 className="text-2xl font-bold mb-2">Entrar</h2>
            <p className="text-muted-foreground">Acesse sua conta com seu telefone e senha</p>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="tel"
                placeholder="(11) 98765-4321"
                value={telefone}
                onChange={handleTelefoneChange}
                className="input-field pl-11"
                disabled={loading}
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field pl-11 pr-11"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
              >
                {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Esqueci senha */}
          <div className="text-right">
            <Link
              href="/recuperar-senha"
              className="text-sm text-vinci-primary hover:text-vinci-secondary transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Botão entrar */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>

          {/* Cadastrar */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">
              Ainda não tem uma conta?
            </p>
            <Link
              href="/cadastro"
              className="btn-secondary w-full inline-block text-center"
            >
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
