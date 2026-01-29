'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, User, Phone, Mail, Lock, Eye, EyeOff, Calendar, Briefcase, Heart, Users, MessageSquare, HelpCircle, Loader2 } from 'lucide-react'
import { formatarTelefone } from '@/lib/auth'
import { validarEmail } from '@/lib/utils'
import { toast } from 'sonner'

export default function CadastroPage() {
  const router = useRouter()
  const { cadastrar } = useAuth()

  const [etapa, setEtapa] = useState(1)
  const [loading, setLoading] = useState(false)
  const [mostrarSenha, setMostrarSenha] = useState(false)

  // Dados do formulário
  const [dados, setDados] = useState({
    nome_completo: '',
    telefone: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    data_nascimento: '',
    profissao: '',
    estado_civil: '',
    tem_filhos: undefined as boolean | undefined,
    como_soube: '',
    gosta_conversar: undefined as boolean | undefined,
  })

  const handleTelefoneChange = (valor: string) => {
    const limpo = valor.replace(/\D/g, '')
    if (limpo.length <= 11) {
      setDados({ ...dados, telefone: formatarTelefone(limpo) })
    }
  }

  const validarEtapa1 = () => {
    if (!dados.nome_completo.trim()) {
      toast.error('Preencha seu nome completo')
      return false
    }
    if (!dados.telefone || dados.telefone.replace(/\D/g, '').length < 10) {
      toast.error('Telefone inválido')
      return false
    }
    if (!dados.email || !validarEmail(dados.email)) {
      toast.error('Email inválido')
      return false
    }
    if (!dados.senha || dados.senha.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres')
      return false
    }
    if (dados.senha !== dados.confirmarSenha) {
      toast.error('As senhas não coincidem')
      return false
    }
    return true
  }

  const handleProximaEtapa = () => {
    if (etapa === 1 && validarEtapa1()) {
      setEtapa(2)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setLoading(true)

    try {
      const { confirmarSenha, ...dadosCadastro } = dados
      const resultado = await cadastrar(dadosCadastro)

      if (resultado.success) {
        toast.success('Cadastro realizado com sucesso!')
        router.push('/dashboard')
      } else {
        toast.error(resultado.error || 'Erro ao fazer cadastro')
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
      <div className="flex-shrink-0 pt-8 pb-6 px-6">
        <button
          onClick={() => etapa === 1 ? router.push('/login') : setEtapa(1)}
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Criar Conta</h1>
          <p className="text-vinci-accent">Etapa {etapa} de 2</p>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${(etapa / 2) * 100}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 bg-white dark:bg-vinci-dark rounded-t-3xl px-6 py-8 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto">
          {etapa === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold mb-1">Dados principais</h2>
                <p className="text-sm text-muted-foreground">Informações para acesso</p>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={dados.nome_completo}
                    onChange={(e) => setDados({ ...dados, nome_completo: e.target.value })}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium mb-2">Telefone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="(11) 98765-4321"
                    value={dados.telefone}
                    onChange={(e) => handleTelefoneChange(e.target.value)}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={dados.email}
                    onChange={(e) => setDados({ ...dados, email: e.target.value })}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label className="block text-sm font-medium mb-2">Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={dados.senha}
                    onChange={(e) => setDados({ ...dados, senha: e.target.value })}
                    className="input-field pl-12 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {mostrarSenha ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmar Senha */}
              <div>
                <label className="block text-sm font-medium mb-2">Confirmar Senha *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    placeholder="Digite a senha novamente"
                    value={dados.confirmarSenha}
                    onChange={(e) => setDados({ ...dados, confirmarSenha: e.target.value })}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleProximaEtapa}
                className="btn-primary w-full"
              >
                Continuar
              </button>
            </div>
          )}

          {etapa === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold mb-1">Informações adicionais</h2>
                <p className="text-sm text-muted-foreground">Para personalizar seu atendimento (opcional)</p>
              </div>

              {/* Data Nascimento */}
              <div>
                <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="date"
                    value={dados.data_nascimento}
                    onChange={(e) => setDados({ ...dados, data_nascimento: e.target.value })}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              {/* Profissão */}
              <div>
                <label className="block text-sm font-medium mb-2">Profissão</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Sua profissão"
                    value={dados.profissao}
                    onChange={(e) => setDados({ ...dados, profissao: e.target.value })}
                    className="input-field pl-12"
                  />
                </div>
              </div>

              {/* Estado Civil */}
              <div>
                <label className="block text-sm font-medium mb-2">Estado Civil</label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={dados.estado_civil}
                    onChange={(e) => setDados({ ...dados, estado_civil: e.target.value })}
                    className="input-field pl-12"
                  >
                    <option value="">Selecione</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>
              </div>

              {/* Tem Filhos */}
              <div>
                <label className="block text-sm font-medium mb-2">Tem filhos?</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setDados({ ...dados, tem_filhos: true })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      dados.tem_filhos === true
                        ? 'border-vinci-primary bg-vinci-primary/10 text-vinci-primary'
                        : 'border-border hover:border-vinci-primary/50'
                    }`}
                  >
                    <Users className="w-5 h-5 mx-auto mb-1" />
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setDados({ ...dados, tem_filhos: false })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      dados.tem_filhos === false
                        ? 'border-vinci-primary bg-vinci-primary/10 text-vinci-primary'
                        : 'border-border hover:border-vinci-primary/50'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>

              {/* Como Soube */}
              <div>
                <label className="block text-sm font-medium mb-2">Como conheceu a Vince?</label>
                <div className="relative">
                  <HelpCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <select
                    value={dados.como_soube}
                    onChange={(e) => setDados({ ...dados, como_soube: e.target.value })}
                    className="input-field pl-12"
                  >
                    <option value="">Selecione</option>
                    <option value="indicacao">Indicação de amigos</option>
                    <option value="redes_sociais">Redes sociais</option>
                    <option value="google">Google</option>
                    <option value="passando">Passando pela rua</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              {/* Gosta de Conversar */}
              <div>
                <label className="block text-sm font-medium mb-2">Gosta de conversar durante o atendimento?</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setDados({ ...dados, gosta_conversar: true })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      dados.gosta_conversar === true
                        ? 'border-vinci-primary bg-vinci-primary/10 text-vinci-primary'
                        : 'border-border hover:border-vinci-primary/50'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5 mx-auto mb-1" />
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setDados({ ...dados, gosta_conversar: false })}
                    className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                      dados.gosta_conversar === false
                        ? 'border-vinci-primary bg-vinci-primary/10 text-vinci-primary'
                        : 'border-border hover:border-vinci-primary/50'
                    }`}
                  >
                    Prefiro silêncio
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <span>Criar Conta</span>
                )}
              </button>
            </div>
          )}

          {/* Link para login */}
          <div className="text-center pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-vinci-primary hover:text-vinci-secondary transition-colors font-medium">
                Entrar
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
