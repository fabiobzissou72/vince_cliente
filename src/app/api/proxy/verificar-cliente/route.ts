import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vincebarbearia.vercel.app'
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { cliente_id } = body

    if (!cliente_id) {
      return NextResponse.json({ existe: false })
    }

    const response = await fetch(`${API_BASE}/api/clientes/verificar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ cliente_id })
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao verificar cliente:', error)
    return NextResponse.json({ existe: false, error: 'Erro ao verificar' })
  }
}
