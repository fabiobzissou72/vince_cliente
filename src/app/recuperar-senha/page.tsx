'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2, CheckCircle } from 'lucide-react'
import { recuperarSenha } from '@/lib/auth'
import { validarEmail } from '@/lib/utils'
import { toast } from 'sonner'

export default function RecuperarSenhaPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !validarEmail(email)) {
      toast.error('Digite um email válido')
      return
    }

    setLoading(true)

    try {
      const resultado = await recuperarSenha(email)

      if (resultado.success) {
        setEnviado(true)
        toast.success(resultado.message || 'Instruções enviadas para seu email!')
      } else {
        toast.error(resultado.error || 'Erro ao recuperar senha')
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (enviado) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-vinci-dark via-vinci-primary to-vinci-secondary">
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center space-y-6 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 backdrop-blur-sm mb-4">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-white">Email Enviado!</h1>
              <p className="text-vinci-accent text-lg">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </p>
            </div>

            <div className="pt-8">
              <Link
                href="/login"
                className="btn-primary inline-block px-8"
              >
                Voltar para Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-vinci-dark via-vinci-primary to-vinci-secondary">
      {/* Header */}
      <div className="flex-shrink-0 pt-8 pb-6 px-6">
        <Link
          href="/login"
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </Link>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Recuperar Senha</h1>
          <p className="text-vinci-accent">Digite seu email para receber as instruções</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white dark:bg-vinci-dark rounded-t-3xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Enviaremos um email com instruções para redefinir sua senha.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email cadastrado</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-11"
                disabled={loading}
                autoFocus
              />
            </div>
          </div>

          {/* Botão enviar */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Mail className="w-5 h-5" />
                <span>Enviar Instruções</span>
              </>
            )}
          </button>

          {/* Info adicional */}
          <div className="pt-4 border-t border-border">
            <div className="bg-vinci-primary/10 border border-vinci-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Dica:</strong> Caso não receba o email em alguns minutos, verifique sua caixa de spam ou entre em contato conosco.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
