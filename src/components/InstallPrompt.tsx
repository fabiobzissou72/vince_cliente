'use client'

import { useEffect, useState } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Verifica se já foi instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Verifica se o usuário já recusou antes (NUNCA mais aparece)
    const jaRecusou = localStorage.getItem('pwa_install_dismissed')
    if (jaRecusou === 'true') {
      return
    }

    // Captura o evento beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // Mostra o prompt após 3 segundos
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Mostra o prompt nativo
    deferredPrompt.prompt()

    // Aguarda a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA instalado')
    }

    // Limpa o prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Salva que o usuário recusou (nunca mais aparece automaticamente)
    localStorage.setItem('pwa_install_dismissed', 'true')
  }

  if (!showPrompt || !deferredPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 z-50 px-4 animate-slideIn">
      <div className="max-w-md mx-auto bg-gradient-to-r from-vinci-primary to-vinci-secondary text-white rounded-xl shadow-2xl p-4">
        <div className="flex items-start space-x-4">
          {/* Ícone */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>

          {/* Conteúdo */}
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">Instalar Aplicativo</h3>
            <p className="text-white/90 text-sm mb-3">
              Instale o app na tela inicial para acesso rápido e experiência completa!
            </p>

            {/* Botões */}
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="flex-1 bg-white text-vinci-primary font-medium py-2 px-4 rounded-lg hover:bg-white/90 transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Instalar</span>
              </button>
              <button
                onClick={handleDismiss}
                className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
