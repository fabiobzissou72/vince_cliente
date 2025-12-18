'use client'

import Link from 'next/link'
import { Smartphone, Share, MoreVertical, Download, CheckCircle, ArrowLeft } from 'lucide-react'

export default function InstalarPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-r from-vinci-primary to-vinci-secondary text-white px-6 py-8">
        <Link
          href="/login"
          className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </Link>

        <h1 className="text-2xl font-bold mb-2">Instalar Aplicativo</h1>
        <p className="text-white/80">Siga as instruções para instalar o app no seu dispositivo</p>
      </div>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Android - Chrome */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Android (Chrome)</h2>
              <p className="text-sm text-muted-foreground">Navegador Google Chrome</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-vinci-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">Abra o menu do navegador</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <MoreVertical className="w-4 h-4" />
                  <span>Toque nos três pontos no canto superior direito</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-vinci-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">Selecione &quot;Instalar aplicativo&quot; ou &quot;Adicionar à tela inicial&quot;</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span>Pode aparecer como &quot;Adicionar ao ecrã principal&quot;</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-vinci-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">Confirme a instalação</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <span>Toque em &quot;Instalar&quot; ou &quot;Adicionar&quot;</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Pronto! O ícone do app aparecerá na sua tela inicial
              </p>
            </div>
          </div>
        </div>

        {/* iOS - Safari */}
        <div className="card p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">iPhone (Safari)</h2>
              <p className="text-sm text-muted-foreground">Navegador Safari (obrigatório)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-vinci-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                1
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">Abra o menu de compartilhamento</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Share className="w-4 h-4" />
                  <span>Toque no ícone de compartilhar (quadrado com seta para cima)</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-vinci-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                2
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">Role para baixo e encontre</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Download className="w-4 h-4" />
                  <span>&quot;Adicionar à Tela de Início&quot; ou &quot;Add to Home Screen&quot;</span>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-vinci-primary text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                3
              </div>
              <div className="flex-1">
                <p className="font-medium mb-2">Confirme o nome e toque em &quot;Adicionar&quot;</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4" />
                  <span>O app será adicionado à tela inicial</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                <strong>Importante:</strong> No iPhone, é necessário usar o navegador Safari. Outros navegadores não suportam instalação de PWA.
              </p>
            </div>

            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                Pronto! O ícone do app aparecerá na sua tela inicial
              </p>
            </div>
          </div>
        </div>

        {/* Vantagens */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Vantagens do App Instalado</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Acesso rápido</p>
                <p className="text-sm text-muted-foreground">Ícone direto na tela inicial do celular</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Modo tela cheia</p>
                <p className="text-sm text-muted-foreground">Experiência como app nativo, sem barras do navegador</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Notificações</p>
                <p className="text-sm text-muted-foreground">Receba lembretes de agendamentos</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Funciona offline</p>
                <p className="text-sm text-muted-foreground">Algumas funcionalidades disponíveis sem internet</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Sem necessidade da loja</p>
                <p className="text-sm text-muted-foreground">Não ocupa espaço da App Store ou Google Play</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dúvidas */}
        <div className="card p-6 bg-vinci-primary/5 border-vinci-primary/20">
          <h3 className="font-bold mb-2">Precisa de ajuda?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Se tiver dificuldades para instalar o aplicativo, entre em contato conosco pelo WhatsApp que te ajudaremos!
          </p>
          <Link
            href="/login"
            className="btn-primary inline-block"
          >
            Voltar para o Login
          </Link>
        </div>
      </main>
    </div>
  )
}
