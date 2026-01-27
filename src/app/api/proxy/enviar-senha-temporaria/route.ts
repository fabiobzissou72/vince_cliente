import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vincebarbearia.vercel.app'
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { telefone } = body

    if (!telefone) {
      return NextResponse.json({ error: 'Telefone é obrigatório' }, { status: 400 })
    }

    const response = await fetch(`${API_BASE}/api/clientes/enviar-senha-temporaria`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ telefone }),
      cache: 'no-store'
    })

    const data = await response.json()

    return NextResponse.json(data, {
      status: response.ok ? 200 : response.status,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Erro ao enviar senha temporária:', error)
    return NextResponse.json({ error: 'Erro ao enviar senha temporária' }, { status: 500 })
  }
}
