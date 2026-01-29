import { NextResponse } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vincebarbearia.vercel.app'
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/api/servicos`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar serviços' }, { status: 500 })
  }
}
