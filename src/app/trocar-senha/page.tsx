'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { trocarSenhaTemporaria } from '@/lib/auth'
import { toast } from 'sonner'

export default function TrocarSenhaPage() {
  const router = useRouter()
  const { cliente } = useAuth()

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!cliente) {
      router.push('/login')
    }
  }, [cliente, router])

  const validarSenha = (): boolean => {
    if (novaSenha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return false
    }

    if (novaSenha !== confirmarSenha) {
      toast.error('As senhas não coincidem')
      return false
    }

    return true
  }

  const handleTrocarSenha = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarSenha() || !cliente) return

    setLoading(true)

    try {
      const resultado = await trocarSenhaTemporaria(cliente.id, novaSenha)

      if (resultado.success) {
        toast.success('Senha alterada com sucesso!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        toast.error(resultado.error || 'Erro ao trocar senha')
      }
    } catch (error) {
      toast.error('Erro ao trocar senha')
    } finally {
      setLoading(false)
    }
  }

  if (!cliente) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-vinci-primary to-vinci-secondary text-white px-6 py-8">
        <h1 className="text-2xl font-bold mb-2">Trocar Senha</h1>
        <p className="text-white/80">Por segurança, crie uma nova senha</p>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 px-6 py-8">
        {/* Aviso */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                Senha Temporária Detectada
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                Por questões de segurança, você precisa criar uma senha definitiva para continuar usando o aplicativo.
              </p>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleTrocarSenha} className="space-y-6">
          {/* Nova Senha */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Nova Senha
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="input-field pl-12 pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <CheckCircle className="w-5 h-5 text-muted-foreground" />
              </div>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Digite a senha novamente"
                className="input-field pl-12"
                required
              />
            </div>
          </div>

          {/* Requisitos de Senha */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">Requisitos da senha:</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${novaSenha.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Mínimo de 6 caracteres</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className={`w-1.5 h-1.5 rounded-full ${novaSenha === confirmarSenha && novaSenha.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Senhas coincidem</span>
              </li>
            </ul>
          </div>

          {/* Botão de Submit */}
          <button
            type="submit"
            disabled={loading || novaSenha.length < 6 || novaSenha !== confirmarSenha}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Alterando...' : 'Confirmar Nova Senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
