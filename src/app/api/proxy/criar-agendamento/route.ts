import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

const API_BASE = 'https://vincibarbearia.vercel.app'
const API_TOKEN = 'vinci_j7mNuInUyCKojb6HH79jOMHH8zwb03hBwSONDhodZbOtRMbGMchazIO1zW7Ea7uv'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE}/api/agendamentos/criar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar agendamento' }, { status: 500 })
  }
}
