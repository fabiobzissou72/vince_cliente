import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vincebarbearia.vercel.app'
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE}/api/agendamentos/cancelar`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao cancelar agendamento' }, { status: 500 })
  }
}
