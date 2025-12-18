import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

const API_BASE = 'https://vincibarbearia.vercel.app'
const API_TOKEN = 'vinci_j7mNuInUyCKojb6HH79jOMHH8zwb03hBwSONDhodZbOtRMbGMchazIO1zW7Ea7uv'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const data = searchParams.get('data')
    const barbeiro = searchParams.get('barbeiro')
    const servico_ids = searchParams.get('servico_ids')

    let url = `${API_BASE}/api/agendamentos/horarios-disponiveis?data=${data}`
    if (barbeiro) url += `&barbeiro=${barbeiro}`
    if (servico_ids) url += `&servico_ids=${servico_ids}`

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    const responseData = await response.json()
    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 })
  }
}
