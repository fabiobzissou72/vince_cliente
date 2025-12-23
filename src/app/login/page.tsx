'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { formatarTelefone, loginCliente } from '@/lib/auth'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { setClienteLogado } = useAuth()

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!telefone) {
      toast.error('Digite seu telefone')
      return
    }

    if (!senha) {
      toast.error('Digite sua senha')
      return
    }

    setLoading(true)

    try {
      const resultado = await loginCliente(telefone, senha)

      if (resultado.success && resultado.cliente) {
        toast.success('Login realizado com sucesso!')
        setClienteLogado(resultado.cliente)
        router.push('/dashboard')
      } else {
        toast.error(resultado.error || 'Telefone ou senha incorretos')
      }
    } catch (error) {
      toast.error('Erro ao fazer login. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-vinci-dark via-vinci-primary to-vinci-secondary">
      {/* Header */}
      <div className="flex-shrink-0 pt-12 pb-8 text-center">
        <div className="flex justify-center mb-4">
          <Image
            src="/logo.png"
            alt="Vince Barbearia"
            width={120}
            height={120}
            priority
            className="object-contain"
          />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Vince Barbearia</h1>
        <p className="text-white">Bem-vindo de volta!</p>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white dark:bg-vinci-dark rounded-t-3xl px-6 py-8">
        <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
          <div>
            <h2 className="text-2xl font-bold mb-2">Entrar</h2>
            <p className="text-muted-foreground">Digite seu telefone e senha</p>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium mb-2">Telefone</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 pointer-events-none z-10">
                <Phone className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type="tel"
                placeholder="(11) 98765-4321"
                value={telefone}
                onChange={handleTelefoneChange}
                className="input-field !pl-12 relative z-0"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-sm font-medium mb-2">Senha</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 pointer-events-none z-10">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="input-field !pl-12 !pr-12 relative z-0"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10"
                disabled={loading}
              >
                {mostrarSenha ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading || !telefone || !senha}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>

          {/* Link Esqueci Senha */}
          <div className="text-center">
            <Link
              href="/recuperar-senha"
              className="text-sm text-vinci-primary dark:text-vinci-accent font-medium hover:underline"
            >
              Esqueci minha senha
            </Link>
          </div>

          {/* Link Cadastro */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground dark:text-gray-300">
              Primeira vez aqui?{' '}
              <Link href="/cadastro" className="text-vinci-primary dark:text-vinci-accent font-medium hover:underline">
                Fazer cadastro
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
