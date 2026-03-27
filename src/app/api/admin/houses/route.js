/**
 * API: /api/admin/houses
 * CRUD для клубных домов — только для верифицированных администраторов
 * 
 * GET    — список домов (публичный)
 * POST   — создать дом (admin)
 * PUT    — обновить дом (admin)
 * DELETE — удалить дом (admin)
 */
import { verifyAdmin, errorResponse } from '@/lib/verifyAdmin'
import supabaseAdmin from '@/lib/supabaseAdmin'
import supabase from '@/lib/supabase'

// ═══ GET — публичный, читает через anon ═══
export async function GET(request) {
  const client = supabaseAdmin || supabase
  if (!client) return errorResponse('Supabase не настроен', 500)

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (id) {
    // Конкретный дом с покупками
    const [houseRes, purchasesRes] = await Promise.all([
      client.from('club_houses').select('*').eq('id', id).single(),
      client.from('club_house_purchases').select('*').eq('house_id', id).order('created_at', { ascending: false }),
    ])
    if (houseRes.error) return errorResponse('Дом не найден', 404)
    const purchased_sqm = (purchasesRes.data || []).reduce((s, p) => s + parseFloat(p.sqm_purchased || 0), 0)
    return Response.json({ ok: true, data: { ...houseRes.data, purchases: purchasesRes.data || [], purchased_sqm } })
  }

  const { data, error } = await client
    .from('club_houses')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return errorResponse(error.message, 500)
  return Response.json({ ok: true, data: data || [] })
}

// ═══ POST — создать дом (admin only) ═══
export async function POST(request) {
  const auth = await verifyAdmin(request)
  if (!auth.ok) return errorResponse(auth.error)

  if (!supabaseAdmin) return errorResponse('Service role не настроен', 500)

  const body = await request.json()
  const { name, city, country, total_price, total_sqm, image_url, description } = body

  if (!name || !total_price || !total_sqm) {
    return errorResponse('Обязательные поля: name, total_price, total_sqm', 400)
  }

  const { data, error } = await supabaseAdmin
    .from('club_houses')
    .insert({
      name,
      city: city || '',
      country: country || '',
      total_price: parseFloat(total_price) || 0,
      total_sqm: parseFloat(total_sqm) || 0,
      image_url: image_url || '',
      description: description || '',
      status: 'planning',
    })
    .select()
    .single()

  if (error) return errorResponse(error.message, 500)
  return Response.json({ ok: true, data })
}

// ═══ PUT — обновить дом (admin only) ═══
export async function PUT(request) {
  const auth = await verifyAdmin(request)
  if (!auth.ok) return errorResponse(auth.error)

  if (!supabaseAdmin) return errorResponse('Service role не настроен', 500)

  const body = await request.json()
  const { id, ...updates } = body

  if (!id) return errorResponse('Не указан id дома', 400)

  // Санитизация — разрешаем только известные поля
  const allowed = ['name', 'city', 'country', 'total_price', 'total_sqm', 'image_url', 'description', 'status']
  const sanitized = {}
  for (const key of allowed) {
    if (updates[key] !== undefined) sanitized[key] = updates[key]
  }

  const { data, error } = await supabaseAdmin
    .from('club_houses')
    .update(sanitized)
    .eq('id', id)
    .select()
    .single()

  if (error) return errorResponse(error.message, 500)
  return Response.json({ ok: true, data })
}

// ═══ DELETE — удалить дом (admin only) ═══
export async function DELETE(request) {
  const auth = await verifyAdmin(request)
  if (!auth.ok) return errorResponse(auth.error)

  if (!supabaseAdmin) return errorResponse('Service role не настроен', 500)

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return errorResponse('Не указан id дома', 400)

  const { error } = await supabaseAdmin.from('club_houses').delete().eq('id', id)
  if (error) return errorResponse(error.message, 500)
  return Response.json({ ok: true })
}
