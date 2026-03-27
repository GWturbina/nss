'use client'
/**
 * teamContracts.js — чтение реальных данных команды/партнёрки
 * 
 * CardGiftMarketing: проценты линий, заработок по линиям, превью распределения
 * MatrixPaymentsV2: заработок по уровням матрицы, ранг
 */
import { ethers } from 'ethers'
import readProvider from './readProvider'
import ADDRESSES from '@/contracts/addresses'
import CardGiftMarketingABI from '@/contracts/abi/CardGiftMarketing.json'
import MatrixPaymentsABI from '@/contracts/abi/MatrixPaymentsV2.json'

const fmt = ethers.formatEther

const MarketingABI = CardGiftMarketingABI.abi || CardGiftMarketingABI
const MatrixPayABI = MatrixPaymentsABI.abi || MatrixPaymentsABI

function getMarketing() {
  return new ethers.Contract(ADDRESSES.CardGiftMarketing, MarketingABI, readProvider)
}

function getMatrixPay() {
  return new ethers.Contract(ADDRESSES.MatrixPaymentsV2, MatrixPayABI, readProvider)
}

// ═══════════════════════════════════════════════════
// МАРКЕТИНГ (CardGiftMarketing) — 9 линий партнёрки
// ═══════════════════════════════════════════════════

/**
 * Реальные проценты 9 линий из контракта
 * Возвращает массив [1000, 700, 500, ...] (в BP, /100 = проценты)
 */
export async function getMarketingPercents() {
  try {
    const c = getMarketing()
    const percents = await c.getAllLevelPercents()
    return percents.map(p => Number(p) / 100) // BP → проценты: 1000 → 10%
  } catch {
    return [10, 7, 5, 3, 2, 1, 1, 0.5, 0.5] // fallback
  }
}

/**
 * Требуемые уровни GlobalWay для каждой линии
 * Возвращает массив [1, 2, 3, ...] — минимальный GW level для получения с этой линии
 */
export async function getRequiredLevels() {
  try {
    const c = getMarketing()
    const levels = await c.getAllRequiredGWLevels()
    return levels.map(l => Number(l))
  } catch {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9] // fallback
  }
}

/**
 * Статистика маркетинга пользователя
 * @returns {{ totalEarned: string, earnedByLine: string[] }}
 */
export async function getUserMarketingStats(address) {
  try {
    const c = getMarketing()
    const [total, byLine] = await c.getUserMarketingStats(address)
    return {
      totalEarned: fmt(total),
      earnedByLine: byLine.map(v => fmt(v)),
    }
  } catch {
    return { totalEarned: '0', earnedByLine: Array(9).fill('0') }
  }
}

/**
 * Глобальная статистика маркетинга
 */
export async function getMarketingGlobalStats() {
  try {
    const c = getMarketing()
    const [totalDistributed, totalEvents] = await c.getStats()
    return { totalDistributed: fmt(totalDistributed), totalEvents: Number(totalEvents) }
  } catch {
    return { totalDistributed: '0', totalEvents: 0 }
  }
}

// ═══════════════════════════════════════════════════
// МАТРИЧНЫЕ ПЛАТЕЖИ (MatrixPaymentsV2) — 12 уровней
// ═══════════════════════════════════════════════════

/**
 * Заработок по 12 уровням матрицы
 * @returns {string[]} — массив из 12 значений в USDT
 */
export async function getMatrixEarningsByLevel(address) {
  try {
    const c = getMatrixPay()
    const earnings = await c.getUserEarningsByLevel(address)
    return earnings.map(v => fmt(v))
  } catch {
    return Array(12).fill('0')
  }
}

/**
 * Общий заработок + автоапгрейд + ранг
 */
export async function getMatrixUserStats(address) {
  try {
    const c = getMatrixPay()
    const [total, autoUpgraded, frozen] = await c.getUserEarnings(address)
    const rank = await c.getUserRank(address).catch(() => 0)
    const rankName = await c.getRankName(Number(rank)).catch(() => '')
    return {
      totalEarned: fmt(total),
      autoUpgraded: fmt(autoUpgraded),
      frozen: fmt(frozen),
      rank: Number(rank),
      rankName,
    }
  } catch {
    return { totalEarned: '0', autoUpgraded: '0', frozen: '0', rank: 0, rankName: '' }
  }
}

/**
 * Глобальная статистика матрицы
 */
export async function getMatrixGlobalStats() {
  try {
    const c = getMatrixPay()
    const [totalDist, totalCharity, totalDev, totalFrozen, totalAutoUp] = await c.getContractStats()
    return {
      totalDistributed: fmt(totalDist),
      totalCharity: fmt(totalCharity),
      totalDevelopment: fmt(totalDev),
      totalFrozen: fmt(totalFrozen),
      totalAutoUpgraded: fmt(totalAutoUp),
    }
  } catch {
    return null
  }
}

// ═══════════════════════════════════════════════════
// РАНГИ
// ═══════════════════════════════════════════════════
export const RANK_NAMES = {
  0: 'Без ранга',
  1: 'Silver',
  2: 'Gold',
  3: 'Platinum',
  4: 'Diamond',
  5: 'Crown',
}

export const RANK_COLORS = {
  0: '#94a3b8',
  1: '#c0c0c0',
  2: '#ffd700',
  3: '#a855f7',
  4: '#60a5fa',
  5: '#f59e0b',
}

export const RANK_EMOJIS = {
  0: '⚪',
  1: '🥈',
  2: '🥇',
  3: '💎',
  4: '💠',
  5: '👑',
}
