'use client'
/**
 * Tap Service — серверный тапинг через Supabase RPC
 * 
 * Защита от фарма:
 * - Энергия и баланс хранятся на сервере (Supabase)
 * - Регенерация по серверному времени (нельзя перемотать часы)
 * - RPC функция do_tap() с SECURITY DEFINER (обходит RLS)
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
    const { data, error } = await supabase.rpc('do_tap', {
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
    const { data, error } = await supabase.rpc('get_tap_state', {
      p_wallet: wallet.toLowerCase(),
    })

    if (error) {
      console.error('getTapState error:', error)
      return { energy: 200, max_energy: 200, local_nst: 0, taps: 0, level: 0 }
    }

    return data
  } catch {
    return { energy: 200, max_energy: 200, local_nst: 0, taps: 0, level: 0 }
  }
}

/**
 * Начислить бонус за покупку уровня
 * @param {string} wallet
 * @param {number} level — купленный уровень (1-12)
 * @param {string} txHash — хэш транзакции
 * @returns {{ ok, nst_bonus, cgt_bonus, gwt_bonus, error }}
 */
export async function claimLevelBonus(wallet, level, txHash) {
  if (!supabase || !wallet) return { ok: false, error: 'Not connected' }

  try {
    const { data, error } = await supabase.rpc('claim_level_bonus', {
      p_wallet: wallet.toLowerCase(),
      p_level: level,
      p_tx_hash: txHash || '',
    })

    if (error) {
      console.error('claimLevelBonus error:', error)
      return { ok: false, error: error.message }
    }

    return data
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

/**
 * Получить статистику бонусов пользователя
 * @param {string} wallet
 * @returns {{ total_nst, total_cgt, total_gwt, claimed_levels }}
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

/**
 * Проверка доступен ли Supabase
 */
export function isSupabaseAvailable() {
  return !!supabase
}
