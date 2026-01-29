import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vincebarbearia.vercel.app'
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const telefone = searchParams.get('telefone')

    if (!telefone) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 })
    }

    const response = await fetch(`${API_BASE}/api/clientes/meus-agendamentos?telefone=${telefone}`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    const data = await response.json()

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error)
    return NextResponse.json({ error: 'Erro ao buscar agendamentos' }, { status: 500 })
  }
}
