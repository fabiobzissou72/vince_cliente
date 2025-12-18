'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { Phone, Lock, Eye, EyeOff, Loader2, MessageSquare } from 'lucide-react'
import { formatarTelefone, verificarCliente, enviarSenhaTemporaria, loginComSenhaTemporaria } from '@/lib/auth'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { setClienteLogado } = useAuth()

  const [etapa, setEtapa] = useState<'telefone' | 'senha'>('telefone')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [senhaTemporariaEnviada, setSenhaTemporariaEnviada] = useState(false)
  const [senhaTemporariaGerada, setSenhaTemporariaGerada] = useState<string>('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value.replace(/\D/g, '')
    if (valor.length <= 11) {
      setTelefone(formatarTelefone(valor))
    }
  }

  const handleVerificarTelefone = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!telefone) {
      toast.error('Digite seu telefone')
      return
    }

    setLoading(true)

    try {
      const resultado = await verificarCliente(telefone)

      if (!resultado.existe) {
        toast.error('Telefone não cadastrado. Faça seu cadastro primeiro.')
        setLoading(false)
        return
      }

      // Cliente existe
      if (resultado.temSenha) {
        // Tem senha, vai direto para o login
        setEtapa('senha')
        setSenhaTemporariaEnviada(false)
      } else {
        // Não tem senha, gera e envia temporária
        const envio = await enviarSenhaTemporaria(telefone)

        if (envio.success) {
          setEtapa('senha')
          setSenhaTemporariaEnviada(true)
          setSenhaTemporariaGerada(envio.senhaTemporaria || '')
          toast.success('Senha temporária enviada para seu WhatsApp!')
        } else {
          toast.error(envio.error || 'Erro ao enviar senha')
        }
      }
    } catch (error) {
      toast.error('Erro ao verificar telefone')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!senha) {
      toast.error('Digite sua senha')
      return
    }

    setLoading(true)

    try {
      const resultado = await loginComSenhaTemporaria(telefone, senha)

      if (resultado.success && resultado.cliente) {
        toast.success('Login realizado com sucesso!')
        setClienteLogado(resultado.cliente)
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
        <p className="text-vinci-accent">Bem-vindo de volta!</p>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white dark:bg-vinci-dark rounded-t-3xl px-6 py-8">
        {etapa === 'telefone' ? (
          // ETAPA 1: Verificar Telefone
          <form onSubmit={handleVerificarTelefone} className="space-y-6 max-w-md mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-2">Entrar</h2>
              <p className="text-muted-foreground">Digite seu telefone para continuar</p>
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
                  className="input-field pl-11 relative z-0"
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={loading || !telefone}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verificando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>

            {/* Link Cadastro */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Primeira vez aqui?{' '}
                <Link href="/cadastro" className="text-vinci-primary font-medium hover:underline">
                  Fazer cadastro
                </Link>
              </p>
            </div>
          </form>
        ) : (
          // ETAPA 2: Digite a Senha
          <form onSubmit={handleLogin} className="space-y-6 max-w-md mx-auto">
            <div>
              <button
                type="button"
                onClick={() => {
                  setEtapa('telefone')
                  setSenha('')
                  setSenhaTemporariaEnviada(false)
                }}
                className="text-vinci-primary text-sm hover:underline mb-4"
              >
                ← Voltar
              </button>
              <h2 className="text-2xl font-bold mb-2">Digite a Senha</h2>
              <p className="text-muted-foreground">{telefone}</p>
            </div>

            {/* Aviso de Senha Temporária */}
            {senhaTemporariaEnviada && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MessageSquare className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                      Senha Gerada com Sucesso!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Sua senha de acesso de 6 dígitos foi gerada. Use ela para fazer login.
                    </p>
                    {senhaTemporariaGerada && (
                      <p className="text-sm font-mono font-bold text-green-700 dark:text-green-400 mt-2 bg-green-500/10 px-3 py-2 rounded">
                        Senha: {senhaTemporariaGerada}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {senhaTemporariaEnviada ? 'Senha Temporária' : 'Senha'}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 pointer-events-none z-10">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder={senhaTemporariaEnviada ? 'Digite os 6 dígitos' : 'Digite sua senha'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="input-field pl-11 pr-11 relative z-0"
                  disabled={loading}
                  autoFocus
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

            {/* Botão Login */}
            <button
              type="submit"
              disabled={loading || !senha}
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

            {/* Reenviar Senha */}
            {senhaTemporariaEnviada && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={async () => {
                    setLoading(true)
                    const resultado = await enviarSenhaTemporaria(telefone)
                    if (resultado.success) {
                      setSenhaTemporariaGerada(resultado.senhaTemporaria || '')
                      toast.success('Nova senha gerada!')
                    } else {
                      toast.error('Erro ao gerar senha')
                    }
                    setLoading(false)
                  }}
                  disabled={loading}
                  className="text-sm text-vinci-primary hover:underline"
                >
                  Gerar nova senha
                </button>
              </div>
            )}

            {/* Link Recuperar */}
            {!senhaTemporariaEnviada && (
              <div className="text-center">
                <Link
                  href="/recuperar-senha"
                  className="text-sm text-vinci-primary hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  )
}
