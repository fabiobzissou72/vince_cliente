'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, User, Clock } from 'lucide-react'

export default function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Início', icon: Home },
    { href: '/agendar', label: 'Agendar', icon: Calendar },
    { href: '/agendamentos', label: 'Horários', icon: Clock },
    { href: '/perfil', label: 'Perfil', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-vinci-dark border-t border-border z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-2xl mx-auto px-2">
        {links.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-vinci-primary dark:text-vinci-accent'
                  : 'text-slate-600 dark:text-slate-300 hover:text-vinci-primary dark:hover:text-vinci-accent'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className={`text-xs ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {link.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
