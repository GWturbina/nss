'use client'
/**
 * Club Houses Service — Supabase CRUD
 * 
 * Таблицы Supabase:
 * 
 * club_houses:
 *   id (uuid PK), name, city, country, total_price (numeric),
 *   total_sqm (numeric), image_url, description, status (text: 'planning','building','completed'),
 *   created_at (timestamptz)
 *
 * club_house_purchases:
 *   id (uuid PK), house_id (FK → club_houses.id), wallet (text),
 *   sqm_purchased (numeric), tx_hash (text), slot_table (int2),
 *   created_at (timestamptz)
 *
 * SQL для создания таблиц (выполнить в Supabase SQL Editor):
 *
 * CREATE TABLE IF NOT EXISTS club_houses (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   name text NOT NULL,
 *   city text NOT NULL DEFAULT '',
 *   country text NOT NULL DEFAULT '',
 *   total_price numeric NOT NULL DEFAULT 0,
 *   total_sqm numeric NOT NULL DEFAULT 0,
 *   image_url text DEFAULT '',
 *   description text DEFAULT '',
 *   status text NOT NULL DEFAULT 'planning',
 *   created_at timestamptz DEFAULT now()
 * );
 *
 * CREATE TABLE IF NOT EXISTS club_house_purchases (
 *   id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
 *   house_id uuid REFERENCES club_houses(id) ON DELETE CASCADE,
 *   wallet text NOT NULL,
 *   sqm_purchased numeric NOT NULL DEFAULT 0,
 *   tx_hash text DEFAULT '',
 *   slot_table smallint NOT NULL DEFAULT 0,
 *   created_at timestamptz DEFAULT now()
 * );
 *
 * -- RLS (read all, write only admin via service role or RPC)
 * ALTER TABLE club_houses ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "club_houses_read" ON club_houses FOR SELECT USING (true);
 * CREATE POLICY "club_houses_write" ON club_houses FOR ALL USING (true);
 *
 * ALTER TABLE club_house_purchases ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "purchases_read" ON club_house_purchases FOR SELECT USING (true);
 * CREATE POLICY "purchases_write" ON club_house_purchases FOR ALL USING (true);
 */
import supabase from './supabase'

// ═══════════════════════════════════════════════════
// CLUB HOUSES — CRUD
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

/** Создать клубный дом (админ) */
export async function createClubHouse({ name, city, country, total_price, total_sqm, image_url, description }) {
  if (!supabase) return { ok: false, error: 'Supabase не подключён' }
  const { data, error } = await supabase
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
  if (error) return { ok: false, error: error.message }
  return { ok: true, data }
}

/** Обновить клубный дом (админ) */
export async function updateClubHouse(id, updates) {
  if (!supabase) return { ok: false, error: 'Supabase не подключён' }
  const { data, error } = await supabase
    .from('club_houses')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) return { ok: false, error: error.message }
  return { ok: true, data }
}

/** Удалить клубный дом (админ) */
export async function deleteClubHouse(id) {
  if (!supabase) return { ok: false, error: 'Supabase не подключён' }
  const { error } = await supabase.from('club_houses').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

// ═══════════════════════════════════════════════════
// PURCHASES
// ═══════════════════════════════════════════════════

/** Записать покупку м² для клубного дома */
export async function recordPurchase({ house_id, wallet, sqm_purchased, tx_hash, slot_table }) {
  if (!supabase) return { ok: false, error: 'Supabase не подключён' }
  const { data, error } = await supabase
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
  if (error) return { ok: false, error: error.message }
  return { ok: true, data }
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
