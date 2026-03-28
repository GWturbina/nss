'use client'
/**
 * Tap Service — серверный тапинг через Supabase RPC
 * 
 * Метр Квадратный использует отдельные функции:
 *   cht_do_tap / cht_get_tap_state / cht_tap_state
 * Чтобы НЕ конфликтовать с Diamond Club (do_tap / get_tap_state / tap_state)
 * 
 * Защита от фарма:
 * - Энергия и баланс хранятся на сервере (Supabase)
 * - Регенерация по серверному времени (нельзя перемотать часы)
 * - RPC функция cht_do_tap() с SECURITY DEFINER (обходит RLS)
 * - Rate limit: 1 тап в 200ms
 * - Клиент не может напрямую менять energy/localNst
 */
import supabase from './supabase'

/**
 * Сделать тап (серверный)
 * @param {string} wallet — 0x адрес
 * @param {number} level — текущий уровень (0-12)
 * @returns {{ ok, earned, energy, local_nst, taps, error }}
 */
export async function serverTap(wallet, level) {
  if (!supabase || !wallet) return { ok: false, error: 'Not connected' }

  try {
    const { data, error } = await supabase.rpc('cht_do_tap', {
      p_wallet: wallet.toLowerCase(),
      p_level: level,
    })

    if (error) {
      console.error('serverTap error:', error)
      return { ok: false, error: error.message }
    }

    return data  // { ok, earned, energy, local_nst, taps } или { ok: false, error }
  } catch (err) {
    console.error('serverTap exception:', err)
    return { ok: false, error: err.message }
  }
}

/**
 * Получить состояние тапалки (с серверной регенерацией)
 * @param {string} wallet — 0x адрес
 * @returns {{ energy, max_energy, local_nst, taps, level }}
 */
export async function getTapState(wallet) {
  if (!supabase || !wallet) {
    return { energy: 200, max_energy: 200, local_nst: 0, taps: 0, level: 0 }
  }

  try {
    const { data, error } = await supabase.rpc('cht_get_tap_state', {
      p_wallet: wallet.toLowerCase(),
    })

    if (error) {
      console.error('getTapState error:', error)
      return { energy: 200, max_energy: 200, local_nst: 0, taps: 0, level: 0 }
    }

    return data
  } catch (err) {
    console.error('getTapState exception:', err)
    return { energy: 200, max_energy: 200, local_nst: 0, taps: 0, level: 0 }
  }
}

/**
 * Запросить бонус за уровень
 */
export async function claimLevelBonus(wallet, level) {
  if (!supabase || !wallet) return { ok: false, error: 'Not connected' }

  try {
    const { data, error } = await supabase.rpc('claim_level_bonus', {
      p_wallet: wallet.toLowerCase(),
      p_level: level,
    })

    if (error) return { ok: false, error: error.message }
    return data
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

/**
 * Получить бонусы пользователя
 */
export async function getUserBonuses(wallet) {
  if (!supabase || !wallet) {
    return { total_nst: 0, total_cgt: 0, total_gwt: 0, claimed_levels: [] }
  }

  try {
    const { data, error } = await supabase.rpc('get_user_bonuses', {
      p_wallet: wallet.toLowerCase(),
    })

    if (error) return { total_nst: 0, total_cgt: 0, total_gwt: 0, claimed_levels: [] }
    return data
  } catch {
    return { total_nst: 0, total_cgt: 0, total_gwt: 0, claimed_levels: [] }
  }
}

export function isSupabaseAvailable() {
  return !!supabase
}
