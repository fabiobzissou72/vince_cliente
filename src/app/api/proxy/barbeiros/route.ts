import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vincibarbearia.vercel.app'
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || 'vinci_j7mNuInUyCKojb6HH79jOMHH8zwb03hBwSONDhodZbOtRMbGMchazIO1zW7Ea7uv'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/api/barbeiros/listar?ativo=true`, {
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
    console.error('Erro ao buscar barbeiros:', error)
    return NextResponse.json({ error: 'Erro ao buscar barbeiros' }, { status: 500 })
  }
}
