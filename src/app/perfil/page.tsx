'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { User, Mail, Phone, Calendar, Briefcase, Heart, Users, MessageSquare, Lock, LogOut, Edit2, Save, X, Loader2, Download } from 'lucide-react'
import { atualizarDadosCliente } from '@/lib/agendamentos'
import { atualizarSenha } from '@/lib/auth'
import { formatarTelefone } from '@/lib/auth'
import { formatarData } from '@/lib/utils'
import { toast } from 'sonner'

export default function PerfilPage() {
  const router = useRouter()
  const { cliente, loading: authLoading, logout, atualizarCliente } = useAuth()

  const [editando, setEditando] = useState(false)
  const [alterandoSenha, setAlterandoSenha] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [podeInstalar, setPodeInstalar] = useState(false)

  // Dados editáveis
  const [dadosEditados, setDadosEditados] = useState({
    nome_completo: '',
    email: '',
    data_nascimento: '',
    profissao: '',
    estado_civil: '',
    tem_filhos: undefined as boolean | undefined,
    estilo_cabelo: '',
    tipo_bebida: '',
    gosta_conversar: undefined as boolean | undefined,
    observacoes: ''
  })

  // Alteração de senha
  const [senhas, setSenhas] = useState({
    atual: '',
    nova: '',
    confirmar: ''
  })

  useEffect(() => {
    if (!authLoading && !cliente) {
      router.push('/login')
    }
  }, [authLoading, cliente, router])

  useEffect(() => {
    // Verifica se já está instalado
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    if (isStandalone) {
      setPodeInstalar(false)
      return
    }

    // Captura evento de instalação
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setPodeInstalar(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  useEffect(() => {
    if (cliente) {
      setDadosEditados({
        nome_completo: cliente.nome_completo || '',
        email: cliente.email || '',
        data_nascimento: cliente.data_nascimento || '',
        profissao: cliente.profissao || '',
        estado_civil: cliente.estado_civil || '',
        tem_filhos: cliente.tem_filhos,
        estilo_cabelo: cliente.estilo_cabelo || '',
        tipo_bebida: cliente.tipo_bebida || '',
        gosta_conversar: cliente.gosta_conversar,
        observacoes: cliente.observacoes || ''
      })
    }
  }, [cliente])

  const handleSalvarDados = async () => {
    if (!cliente) return

    setSalvando(true)

    const resultado = await atualizarDadosCliente(cliente.id, dadosEditados)

    if (resultado.success) {
      toast.success('Dados atualizados com sucesso!')
      atualizarCliente({ ...cliente, ...dadosEditados })
      setEditando(false)
    } else {
      toast.error(resultado.error || 'Erro ao atualizar dados')
    }

    setSalvando(false)
  }

  const handleAlterarSenha = async () => {
    if (!cliente) return

    if (!senhas.atual || !senhas.nova || !senhas.confirmar) {
      toast.error('Preencha todos os campos')
      return
    }

    if (senhas.nova.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres')
      return
    }

    if (senhas.nova !== senhas.confirmar) {
      toast.error('As senhas não coincidem')
      return
    }

    setSalvando(true)

    const resultado = await atualizarSenha(cliente.id, senhas.atual, senhas.nova)

    if (resultado.success) {
      toast.success('Senha alterada com sucesso!')
      setSenhas({ atual: '', nova: '', confirmar: '' })
      setAlterandoSenha(false)
    } else {
      toast.error(resultado.error || 'Erro ao alterar senha')
    }

    setSalvando(false)
  }

  const handleLogout = () => {
    if (confirm('Deseja realmente sair?')) {
      logout()
      router.push('/login')
    }
  }

  if (authLoading || !cliente) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-vinci-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Meu Perfil" showUser={false} />

      <main className="max-w-2xl mx-auto px-6 py-6">
        {/* Header do perfil */}
        <div className="card p-6 mb-6 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-vinci-primary to-vinci-secondary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-4">
            {cliente.nome_completo.substring(0, 2).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold">{cliente.nome_completo}</h2>
          <p className="text-muted-foreground">{formatarTelefone(cliente.telefone)}</p>
          {cliente.is_vip && (
            <div className="inline-block mt-3 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
              ⭐ Cliente VIP
            </div>
          )}
        </div>

        {/* Modo edição */}
        {editando ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Editar Dados</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditando(false)}
                  className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                  disabled={salvando}
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSalvarDados}
                  disabled={salvando}
                  className="p-2 rounded-lg bg-vinci-primary text-white hover:bg-vinci-secondary transition-colors"
                >
                  {salvando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome Completo</label>
                <input
                  type="text"
                  value={dadosEditados.nome_completo}
                  onChange={(e) => setDadosEditados({ ...dadosEditados, nome_completo: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={dadosEditados.email}
                  onChange={(e) => setDadosEditados({ ...dadosEditados, email: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data de Nascimento</label>
                <input
                  type="date"
                  value={dadosEditados.data_nascimento}
                  onChange={(e) => setDadosEditados({ ...dadosEditados, data_nascimento: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profissão</label>
                <input
                  type="text"
                  value={dadosEditados.profissao}
                  onChange={(e) => setDadosEditados({ ...dadosEditados, profissao: e.target.value })}
                  className="input-field"
                  placeholder="Sua profissão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estado Civil</label>
                <select
                  value={dadosEditados.estado_civil}
                  onChange={(e) => setDadosEditados({ ...dadosEditados, estado_civil: e.target.value })}
                  className="input-field"
                >
                  <option value="">Selecione</option>
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tem filhos?</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setDadosEditados({ ...dadosEditados, tem_filhos: true })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      dadosEditados.tem_filhos === true
                        ? 'border-vinci-primary bg-vinci-primary/10'
                        : 'border-border'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setDadosEditados({ ...dadosEditados, tem_filhos: false })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      dadosEditados.tem_filhos === false
                        ? 'border-vinci-primary bg-vinci-primary/10'
                        : 'border-border'
                    }`}
                  >
                    Não
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Estilo de Cabelo</label>
                <input
                  type="text"
                  value={dadosEditados.estilo_cabelo}
                  onChange={(e) => setDadosEditados({ ...dadosEditados, estilo_cabelo: e.target.value })}
                  className="input-field"
                  placeholder="Seu estilo de corte preferido"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tipo de Bebida</label>
                <input
                  type="text"
                  value={dadosEditados.tipo_bebida}
                  onChange={(e) => setDadosEditados({ ...dadosEditados, tipo_bebida: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Café, Água, Refrigerante"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gosta de conversar durante o atendimento?</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setDadosEditados({ ...dadosEditados, gosta_conversar: true })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      dadosEditados.gosta_conversar === true
                        ? 'border-vinci-primary bg-vinci-primary/10'
                        : 'border-border'
                    }`}
                  >
                    Sim
                  </button>
                  <button
                    type="button"
                    onClick={() => setDadosEditados({ ...dadosEditados, gosta_conversar: false })}
                    className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                      dadosEditados.gosta_conversar === false
                        ? 'border-vinci-primary bg-vinci-primary/10'
                        : 'border-border'
                    }`}
                  >
                    Prefiro silêncio
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Observações</label>
                <textarea
                  value={dadosEditados.observacoes}
                  onChange={(e) => setDadosEditados({ ...dadosEditados, observacoes: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Informações adicionais"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Modo visualização */
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Informações Pessoais</h3>
              <button
                onClick={() => setEditando(true)}
                className="flex items-center space-x-2 text-vinci-primary hover:text-vinci-secondary transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">Editar</span>
              </button>
            </div>

            <div className="card p-5 space-y-4">
              {cliente.email && (
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{cliente.email}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="font-medium">{formatarTelefone(cliente.telefone)}</p>
                </div>
              </div>

              {cliente.data_nascimento && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">{formatarData(cliente.data_nascimento)}</p>
                  </div>
                </div>
              )}

              {cliente.profissao && (
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Profissão</p>
                    <p className="font-medium">{cliente.profissao}</p>
                  </div>
                </div>
              )}

              {cliente.estado_civil && (
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Estado Civil</p>
                    <p className="font-medium capitalize">{cliente.estado_civil}</p>
                  </div>
                </div>
              )}

              {cliente.tem_filhos !== undefined && (
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tem filhos</p>
                    <p className="font-medium">{cliente.tem_filhos ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
              )}

              {cliente.gosta_conversar !== undefined && (
                <div className="flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Gosta de conversar</p>
                    <p className="font-medium">{cliente.gosta_conversar ? 'Sim' : 'Prefere silêncio'}</p>
                  </div>
                </div>
              )}

              {cliente.estilo_cabelo && (
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-1">Estilo de Cabelo</p>
                  <p className="font-medium">{cliente.estilo_cabelo}</p>
                </div>
              )}

              {cliente.tipo_bebida && (
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-1">Tipo de Bebida</p>
                  <p className="font-medium">{cliente.tipo_bebida}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alterar senha */}
        {!editando && (
          <div className="mt-6">
            {alterandoSenha ? (
              <div className="card p-5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">Alterar Senha</h3>
                  <button
                    onClick={() => setAlterandoSenha(false)}
                    className="text-muted-foreground hover:text-foreground"
                    disabled={salvando}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Senha Atual</label>
                  <input
                    type="password"
                    value={senhas.atual}
                    onChange={(e) => setSenhas({ ...senhas, atual: e.target.value })}
                    className="input-field"
                    placeholder="Digite sua senha atual"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nova Senha</label>
                  <input
                    type="password"
                    value={senhas.nova}
                    onChange={(e) => setSenhas({ ...senhas, nova: e.target.value })}
                    className="input-field"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={senhas.confirmar}
                    onChange={(e) => setSenhas({ ...senhas, confirmar: e.target.value })}
                    className="input-field"
                    placeholder="Digite novamente"
                  />
                </div>

                <button
                  onClick={handleAlterarSenha}
                  disabled={salvando}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  {salvando ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Salvar Nova Senha</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAlterandoSenha(true)}
                className="card p-4 w-full flex items-center justify-between hover:shadow-lg transition-all"
              >
                <div className="flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-vinci-primary" />
                  <span className="font-medium">Alterar Senha</span>
                </div>
                <Edit2 className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Instalar App */}
        {!editando && !alterandoSenha && podeInstalar && deferredPrompt && (
          <button
            onClick={async () => {
              if (deferredPrompt) {
                deferredPrompt.prompt()
                const { outcome } = await deferredPrompt.userChoice
                if (outcome === 'accepted') {
                  toast.success('App instalado com sucesso!')
                  setPodeInstalar(false)
                }
                setDeferredPrompt(null)
              }
            }}
            className="mt-6 w-full card p-4 flex items-center justify-center space-x-3 bg-gradient-to-r from-vinci-primary to-vinci-secondary text-white hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Instalar Aplicativo</span>
          </button>
        )}

        {/* Logout */}
        {!editando && !alterandoSenha && (
          <button
            onClick={handleLogout}
            className="mt-6 w-full card p-4 flex items-center justify-center space-x-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sair da Conta</span>
          </button>
        )}

        {/* Info */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Cliente desde {formatarData(cliente.data_cadastro, 'MMMM/yyyy')}</p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
