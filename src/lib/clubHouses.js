'use client'
/**
 * Club Houses Service — v2 SECURE
 * 
 * READ:   Напрямую через Supabase anon (RLS разрешает SELECT всем)
 * WRITE:  Через серверные API routes с верификацией подписи кошелька
 * 
 * Изменения v2:
 * - createClubHouse, updateClubHouse, deleteClubHouse → через /api/admin/houses
 * - recordPurchase → через /api/admin/purchases (с верификацией tx_hash)
 * - uploadHouseImage — по-прежнему через Supabase Storage (добавить RLS на bucket!)
 * - Все write-операции требуют подпись кошелька (signAdminRequest)
 */
import supabase from './supabase'
import web3 from './web3'

// ═══════════════════════════════════════════════════
// ПОДПИСЬ ADMIN-ЗАПРОСОВ
// ═══════════════════════════════════════════════════

/**
 * Подписать admin-запрос кошельком
 * Возвращает заголовки для API route
 */
async function signAdminHeaders() {
  if (!web3.signer) throw new Error('Кошелёк не подключён')
  const timestamp = String(Date.now())
  const message = `admin:${timestamp}`
  const signature = await web3.signer.signMessage(message)
  return {
    'Content-Type': 'application/json',
    'x-wallet': web3.address,
    'x-signature': signature,
    'x-timestamp': timestamp,
  }
}

/**
 * Выполнить admin-запрос через API route
 */
async function adminFetch(url, options = {}) {
  try {
    const headers = await signAdminHeaders()
    const res = await fetch(url, { ...options, headers: { ...headers, ...(options.headers || {}) } })
    const data = await res.json()
    if (!data.ok) return { ok: false, error: data.error || 'Ошибка сервера' }
    return data
  } catch (err) {
    if (err.message?.includes('user rejected')) return { ok: false, error: 'Подпись отклонена' }
    return { ok: false, error: err.message || 'Ошибка сети' }
  }
}

// ═══════════════════════════════════════════════════
// CLUB HOUSES — READ (через Supabase anon — безопасно)
// ═══════════════════════════════════════════════════

/** Получить все клубные дома */
export async function getClubHouses() {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('club_houses')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) { console.error('getClubHouses:', error); return [] }
  return data || []
}

/** Получить один клубный дом с покупками */
export async function getClubHouseWithPurchases(houseId) {
  if (!supabase) return null
  const [houseRes, purchasesRes] = await Promise.all([
    supabase.from('club_houses').select('*').eq('id', houseId).single(),
    supabase.from('club_house_purchases').select('*').eq('house_id', houseId).order('created_at', { ascending: false }),
  ])
  if (houseRes.error) return null
  return {
    ...houseRes.data,
    purchases: purchasesRes.data || [],
    purchased_sqm: (purchasesRes.data || []).reduce((s, p) => s + parseFloat(p.sqm_purchased || 0), 0),
  }
}

/** Получить покупки пользователя */
export async function getUserPurchases(wallet) {
  if (!supabase || !wallet) return []
  const { data, error } = await supabase
    .from('club_house_purchases')
    .select('*, club_houses(name, city)')
    .eq('wallet', wallet.toLowerCase())
    .order('created_at', { ascending: false })
  if (error) return []
  return data || []
}

// ═══════════════════════════════════════════════════
// CLUB HOUSES — WRITE (через secure API routes)
// ═══════════════════════════════════════════════════

/** Создать клубный дом (admin) */
export async function createClubHouse({ name, city, country, total_price, total_sqm, image_url, description }) {
  return adminFetch('/api/admin/houses', {
    method: 'POST',
    body: JSON.stringify({ name, city, country, total_price, total_sqm, image_url, description }),
  })
}

/** Обновить клубный дом (admin) */
export async function updateClubHouse(id, updates) {
  return adminFetch('/api/admin/houses', {
    method: 'PUT',
    body: JSON.stringify({ id, ...updates }),
  })
}

/** Удалить клубный дом (admin) */
export async function deleteClubHouse(id) {
  return adminFetch(`/api/admin/houses?id=${id}`, {
    method: 'DELETE',
  })
}

// ═══════════════════════════════════════════════════
// PURCHASES — WRITE (через secure API route)
// ═══════════════════════════════════════════════════

/** Записать покупку м² для клубного дома (admin, с верификацией tx_hash) */
export async function recordPurchase({ house_id, wallet, sqm_purchased, tx_hash, slot_table }) {
  return adminFetch('/api/admin/purchases', {
    method: 'POST',
    body: JSON.stringify({ house_id, wallet, sqm_purchased, tx_hash, slot_table }),
  })
}

// ═══════════════════════════════════════════════════
// UPLOAD — Supabase Storage (пока через anon)
// TODO: добавить RLS на bucket 'images' — только авторизованные загрузки
// ═══════════════════════════════════════════════════

/** Загрузить фото в Supabase Storage */
export async function uploadHouseImage(file) {
  if (!supabase) return { ok: false, error: 'Supabase не подключён' }
  const ext = file.name.split('.').pop()
  const path = `club-houses/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) return { ok: false, error: error.message }
  const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(path)
  return { ok: true, url: publicUrl }
}
