import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vincibarbearia.vercel.app'
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || 'vinci_j7mNuInUyCKojb6HH79jOMHH8zwb03hBwSONDhodZbOtRMbGMchazIO1zW7Ea7uv'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const telefone = searchParams.get('telefone')

    if (!telefone) {
      return NextResponse.json({ error: 'Telefone obrigatorio' }, { status: 400 })
    }

    const response = await fetch(`${API_BASE}/api/clientes/historico?telefone=${telefone}`, {
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
    console.error('Erro ao buscar historico:', error)
    return NextResponse.json({ error: 'Erro ao buscar historico' }, { status: 500 })
  }
}
