import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://vincebarbearia.vercel.app'
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const data = searchParams.get('data')
    const barbeiro = searchParams.get('barbeiro')
    const servico_ids = searchParams.get('servico_ids')

    if (!data) {
      return NextResponse.json({ error: 'Data é obrigatória' }, { status: 400 })
    }

    let url = `${API_BASE}/api/agendamentos/horarios-disponiveis?data=${data}`
    if (barbeiro) url += `&barbeiro=${barbeiro}`
    if (servico_ids) url += `&servico_ids=${servico_ids}`

    console.log('🔍 Buscando horários:', url)

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    })

    const responseData = await response.json()
    console.log('📦 Horários retornados:', responseData)

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('❌ Erro ao buscar horários:', error)
    return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 })
  }
}
