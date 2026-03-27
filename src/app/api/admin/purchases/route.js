/**
 * API: /api/admin/purchases
 * Запись покупок м² — с верификацией tx_hash на блокчейне
 * 
 * POST — записать покупку (admin или система)
 * GET  — получить покупки пользователя (публичный)
 */
import { verifyAdmin, errorResponse } from '@/lib/verifyAdmin'
import supabaseAdmin from '@/lib/supabaseAdmin'
import supabase from '@/lib/supabase'
import { ethers } from 'ethers'

const READ_RPC = 'https://opbnb-mainnet-rpc.bnbchain.org'

// ═══ GET — покупки пользователя (публичный) ═══
export async function GET(request) {
  const client = supabaseAdmin || supabase
  if (!client) return errorResponse('Supabase не настроен', 500)

  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get('wallet')

  if (!wallet) return errorResponse('Укажите wallet', 400)

  const { data, error } = await client
    .from('club_house_purchases')
    .select('*, club_houses(name, city)')
    .eq('wallet', wallet.toLowerCase())
    .order('created_at', { ascending: false })

  if (error) return errorResponse(error.message, 500)
  return Response.json({ ok: true, data: data || [] })
}

// ═══ POST — записать покупку (admin only + tx verification) ═══
export async function POST(request) {
  const auth = await verifyAdmin(request)
  if (!auth.ok) return errorResponse(auth.error)

  if (!supabaseAdmin) return errorResponse('Service role не настроен', 500)

  const body = await request.json()
  const { house_id, wallet, sqm_purchased, tx_hash, slot_table } = body

  if (!house_id || !wallet || !sqm_purchased) {
    return errorResponse('Обязательные поля: house_id, wallet, sqm_purchased', 400)
  }

  // ═══ Верификация транзакции на блокчейне ═══
  if (tx_hash) {
    try {
      // Проверяем, не записана ли уже эта транзакция
      const { data: existing } = await supabaseAdmin
        .from('verified_transactions')
        .select('tx_hash')
        .eq('tx_hash', tx_hash)
        .single()

      if (existing) {
        return errorResponse('Эта транзакция уже использована', 409)
      }

      // Проверяем транзакцию на блокчейне
      const provider = new ethers.JsonRpcProvider(READ_RPC)
      const receipt = await provider.getTransactionReceipt(tx_hash)

      if (!receipt) {
        return errorResponse('Транзакция не найдена на блокчейне', 404)
      }
      if (receipt.status !== 1) {
        return errorResponse('Транзакция не подтверждена (status !== 1)', 400)
      }

      // Записываем верифицированную транзакцию
      await supabaseAdmin.from('verified_transactions').insert({
        tx_hash,
        wallet: wallet.toLowerCase(),
        action: 'house_purchase',
        block_number: receipt.blockNumber,
        details: { house_id, sqm_purchased, slot_table },
      })
    } catch (err) {
      return errorResponse(`Ошибка проверки транзакции: ${err.message}`, 500)
    }
  }

  // ═══ Запись покупки ═══
  const { data, error } = await supabaseAdmin
    .from('club_house_purchases')
    .insert({
      house_id,
      wallet: wallet.toLowerCase(),
      sqm_purchased: parseFloat(sqm_purchased) || 0,
      tx_hash: tx_hash || '',
      slot_table: slot_table ?? 0,
    })
    .select()
    .single()

  if (error) return errorResponse(error.message, 500)
  return Response.json({ ok: true, data })
}
