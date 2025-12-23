'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Loader2, CheckCircle } from 'lucide-react'
import { enviarSenhaTemporaria, formatarTelefone } from '@/lib/auth'
import { toast } from 'sonner'

export default function RecuperarSenhaPage() {
  const router = useRouter()
  const [telefone, setTelefone] = useState('')
  const [loading, setLoading] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '')
    if (valor.length <= 11) {
      setTelefone(formatarTelefone(valor))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!telefone || telefone.replace(/\D/g, '').length < 10) {
      toast.error('Digite um telefone válido')
      return
    }

    setLoading(true)

    try {
      const resultado = await enviarSenhaTemporaria(telefone)

      if (resultado.success) {
        setEnviado(true)
        toast.success('Senha temporária enviada para seu WhatsApp!')
      } else {
        toast.error(resultado.error || 'Erro ao enviar senha temporária')
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
              <h1 className="text-3xl font-bold text-white">Senha Enviada!</h1>
              <p className="text-vinci-accent text-lg">
                Uma senha temporária foi enviada para seu WhatsApp. Use-a para fazer login e depois altere sua senha.
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
          <p className="text-vinci-accent">Digite seu telefone para receber uma senha temporária</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white dark:bg-vinci-dark rounded-t-3xl px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          <div className="space-y-2">
            <p className="text-muted-foreground">
              Enviaremos uma senha temporária via WhatsApp para você fazer login.
            </p>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium mb-2">Telefone cadastrado</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <input
                type="tel"
                placeholder="(11) 98765-4321"
                value={telefone}
                onChange={handleTelefoneChange}
                className="w-full pl-12 pr-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-vinci-primary focus:border-transparent transition-all duration-200"
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
                <Phone className="w-5 h-5" />
                <span>Enviar Senha Temporária</span>
              </>
            )}
          </button>

          {/* Info adicional */}
          <div className="pt-4 border-t border-border">
            <div className="bg-vinci-primary/10 border border-vinci-primary/20 rounded-lg p-4">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Dica:</strong> A senha temporária será enviada via WhatsApp. Após fazer login, altere sua senha em Perfil.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
