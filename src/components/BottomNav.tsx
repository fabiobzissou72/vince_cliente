'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, User, Clock, Bell } from 'lucide-react'
import NotificationBadge from './NotificationBadge'

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-vinci-dark border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        <NavItem href="/dashboard" label="Início" icon={Home} pathname={pathname} />
        <NavItem href="/agendar" label="Agendar" icon={Calendar} pathname={pathname} />
        <Link
          href="/notificacoes"
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
            pathname === '/notificacoes'
              ? 'text-vinci-primary dark:text-vinci-accent'
              : 'text-slate-600 dark:text-slate-300 hover:text-vinci-primary dark:hover:text-vinci-accent'
          }`}
        >
          <div className="relative mb-1">
            <Bell className={`w-6 h-6 ${pathname === '/notificacoes' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <NotificationBadgeMobile />
          </div>
          <span className={`text-xs ${pathname === '/notificacoes' ? 'font-semibold' : 'font-normal'}`}>
            Notificações
          </span>
        </Link>
        <NavItem href="/agendamentos" label="Horários" icon={Clock} pathname={pathname} />
        <NavItem href="/perfil" label="Perfil" icon={User} pathname={pathname} />
      </div>
    </nav>
  )
}

function NavItem({ href, label, icon: Icon, pathname }: { href: string, label: string, icon: any, pathname: string }) {
  const isActive = pathname === href

  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
        isActive
          ? 'text-vinci-primary dark:text-vinci-accent'
          : 'text-slate-600 dark:text-slate-300 hover:text-vinci-primary dark:hover:text-vinci-accent'
      }`}
    >
      <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
      <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
        {label}
      </span>
    </Link>
  )
}

function NotificationBadgeMobile() {
  const [naoLidas, setNaoLidas] = useState(0)

  useEffect(() => {
    const cliente = JSON.parse(localStorage.getItem('cliente') || '{}')
    if (cliente?.id) {
      carregarNaoLidas(cliente.id)
      const interval = setInterval(() => carregarNaoLidas(cliente.id), 30000)
      return () => clearInterval(interval)
    }
  }, [])

  const carregarNaoLidas = async (clienteId: string) => {
    try {
      const response = await fetch(`/api/notificacoes?cliente_id=${clienteId}`)
      const result = await response.json()
      if (result.success) {
        setNaoLidas(result.data.nao_lidas)
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error)
    }
  }

  if (naoLidas === 0) return null

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
      {naoLidas > 9 ? '9+' : naoLidas}
    </span>
  )
}
