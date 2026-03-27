/**
 * verifyAdmin — серверная проверка подписи кошелька + admin-статус
 * 
 * Клиент подписывает сообщение: `admin:${timestamp}`
 * Сервер проверяет:
 * 1. Подпись валидна (ethers.verifyMessage)
 * 2. timestamp не старше 5 минут (replay protection)
 * 3. Кошелёк есть в таблице admin_wallets
 */
import { ethers } from 'ethers'
import supabaseAdmin from './supabaseAdmin'

const MAX_SIGNATURE_AGE_MS = 5 * 60 * 1000 // 5 минут

/**
 * Верифицировать запрос от админа
 * @param {Request} request — HTTP request
 * @returns {{ ok: boolean, wallet?: string, error?: string }}
 */
export async function verifyAdmin(request) {
  if (!supabaseAdmin) {
    return { ok: false, error: 'Supabase admin не настроен (SUPABASE_SERVICE_ROLE_KEY)' }
  }

  // Извлекаем заголовки
  const wallet = request.headers.get('x-wallet')
  const signature = request.headers.get('x-signature')
  const timestamp = request.headers.get('x-timestamp')

  if (!wallet || !signature || !timestamp) {
    return { ok: false, error: 'Отсутствуют заголовки аутентификации (x-wallet, x-signature, x-timestamp)' }
  }

  // 1. Проверка возраста подписи (replay protection)
  const ts = parseInt(timestamp, 10)
  if (isNaN(ts) || Date.now() - ts > MAX_SIGNATURE_AGE_MS) {
    return { ok: false, error: 'Подпись истекла (>5 мин). Повторите операцию.' }
  }

  // 2. Верификация подписи
  const message = `admin:${timestamp}`
  let recovered
  try {
    recovered = ethers.verifyMessage(message, signature)
  } catch {
    return { ok: false, error: 'Невалидная подпись' }
  }

  if (recovered.toLowerCase() !== wallet.toLowerCase()) {
    return { ok: false, error: 'Подпись не совпадает с кошельком' }
  }

  // 3. Проверка admin-статуса в БД
  const { data, error } = await supabaseAdmin
    .from('admin_wallets')
    .select('wallet, role')
    .eq('wallet', wallet.toLowerCase())
    .single()

  if (error || !data) {
    return { ok: false, error: 'Кошелёк не является администратором' }
  }

  return { ok: true, wallet: wallet.toLowerCase(), role: data.role }
}

/**
 * Стандартный JSON-ответ с ошибкой
 */
export function errorResponse(message, status = 403) {
  return Response.json({ ok: false, error: message }, { status })
}
