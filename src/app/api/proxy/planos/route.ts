import { NextResponse } from 'next/server'

const API_BASE = 'https://vincibarbearia.vercel.app'
const API_TOKEN = 'vinci_j7mNuInUyCKojb6HH79jOMHH8zwb03hBwSONDhodZbOtRMbGMchazIO1zW7Ea7uv'

export async function GET() {
  try {
    const response = await fetch(`${API_BASE}/api/planos/listar?ativo=true`, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar planos' }, { status: 500 })
  }
}
