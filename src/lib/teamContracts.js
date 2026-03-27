'use client'
/**
 * teamContracts.js — чтение реальных данных команды из GlobalWay экосистемы
 * 
 * GlobalWay:       getDirectReferrals, getUserInfo, getUserMaxLevel
 * MatrixRegistry:  getUserInfo (userId, sponsorId, personalInvites, directReferrals)
 * GlobalWayStats:  getUserFullStats, getUserReferralsPaginated, getUserEarningsByLevel, getUserRanksInfo
 * CardGiftMarketing: проценты линий, заработок по линиям
 */
import { ethers } from 'ethers'
import readProvider from './readProvider'
import ADDRESSES from '@/contracts/addresses'

import GlobalWayABI from '@/contracts/abi/GlobalWay.json'
import MatrixRegistryABI from '@/contracts/abi/MatrixRegistry.json'
import GlobalWayStatsABI from '@/contracts/abi/GlobalWayStats.json'
import CardGiftMarketingABI from '@/contracts/abi/CardGiftMarketing.json'
import MatrixPaymentsABI from '@/contracts/abi/MatrixPaymentsV2.json'

const fmt = ethers.formatEther

const getABI = (file) => file.abi || file

function getGW() { return new ethers.Contract(ADDRESSES.GlobalWay, getABI(GlobalWayABI), readProvider) }
function getRegistry() { return new ethers.Contract(ADDRESSES.MatrixRegistry, getABI(MatrixRegistryABI), readProvider) }
function getStats() { return new ethers.Contract(ADDRESSES.GlobalWayStats, getABI(GlobalWayStatsABI), readProvider) }
function getMarketing() { return new ethers.Contract(ADDRESSES.CardGiftMarketing, getABI(CardGiftMarketingABI), readProvider) }
function getMatrixPay() { return new ethers.Contract(ADDRESSES.MatrixPaymentsV2, getABI(MatrixPaymentsABI), readProvider) }

// ═══════════════════════════════════════════════════
// ПАРТНЁРЫ — реальные данные из контрактов
// ═══════════════════════════════════════════════════

/**
 * Получить список прямых партнёров (1 линия) с деталями
 * @returns {{ referrals: {address, userId, sponsorId, maxLevel, rank, partnerEarnings, matrixEarnings}[], total: number }}
 */
export async function getDirectPartners(userAddress, offset = 0, limit = 20) {
  try {
    const stats = getStats()
    const [referrals, total, hasMore] = await stats.getUserReferralsPaginated(userAddress, offset, limit)
    
    // Для каждого реферала загружаем детали
    const details = await Promise.all(
      referrals.map(async (addr) => {
        try {
          const [regInfo, fullStats] = await Promise.all([
            getRegistry().getUserInfo(addr).catch(() => null),
            stats.getUserFullStats(addr).catch(() => null),
          ])
          return {
            address: addr,
            userId: regInfo ? Number(regInfo.userId) : 0,
            sponsorId: regInfo ? Number(regInfo.sponsorId) : 0,
            personalInvites: regInfo ? Number(regInfo.personalInvites) : 0,
            maxLevel: fullStats ? Number(fullStats.maxLevel) : 0,
            matrixRank: fullStats ? Number(fullStats.matrixRank) : 0,
            quarterlyActive: fullStats ? fullStats.quarterlyActive : false,
            partnerEarnings: fullStats ? fmt(fullStats.partnerEarnings) : '0',
            matrixEarnings: fullStats ? fmt(fullStats.matrixEarnings) : '0',
          }
        } catch {
          return { address: addr, userId: 0, sponsorId: 0, personalInvites: 0, maxLevel: 0, matrixRank: 0, quarterlyActive: false, partnerEarnings: '0', matrixEarnings: '0' }
        }
      })
    )

    return { referrals: details, total: Number(total), hasMore }
  } catch (err) {
    console.error('getDirectPartners error:', err)
    return { referrals: [], total: 0, hasMore: false }
  }
}

/**
 * Структура пользователя (кол-во рефералов, активные уровни)
 */
export async function getUserStructure(address) {
  try {
    const stats = getStats()
    const [directReferrals, activeLevels, levelStatus] = await stats.getUserStructureStats(address)
    return {
      directReferrals: Number(directReferrals),
      activeLevels: Number(activeLevels),
      levelStatus: [...levelStatus], // bool[12]
    }
  } catch { return { directReferrals: 0, activeLevels: 0, levelStatus: Array(12).fill(false) } }
}

/**
 * Полная статистика пользователя из GlobalWayStats
 */
export async function getUserFullStats(address) {
  try {
    const stats = getStats()
    const s = await stats.getUserFullStats(address)
    return {
      isRegistered: s.isRegistered,
      sponsor: s.sponsor,
      maxLevel: Number(s.maxLevel),
      quarterlyActive: s.quarterlyActive,
      partnerEarnings: fmt(s.partnerEarnings),
      matrixEarnings: fmt(s.matrixEarnings),
      pensionBalance: fmt(s.pensionBalance),
      leaderBalance: fmt(s.leaderBalance),
      totalPending: fmt(s.totalPendingBalance),
      frozenAutoUpgrade: fmt(s.frozenForAutoUpgrade),
      matrixRank: Number(s.matrixRank),
      leaderRank: Number(s.leaderRank),
    }
  } catch { return null }
}

/**
 * Заработок по 12 уровням (партнёрка + матрица)
 */
export async function getEarningsByLevel(address) {
  try {
    const stats = getStats()
    const [partnerEarnings, matrixEarnings] = await stats.getUserEarningsByLevel(address)
    return {
      partner: partnerEarnings.map(v => fmt(v)),
      matrix: matrixEarnings.map(v => fmt(v)),
    }
  } catch { return { partner: Array(12).fill('0'), matrix: Array(12).fill('0') } }
}

/**
 * Ранги пользователя
 */
export async function getUserRanks(address) {
  try {
    const stats = getStats()
    const r = await stats.getUserRanksInfo(address)
    return {
      matrixRank: Number(r.matrixRank),
      matrixRankName: r.matrixRankName,
      leaderRank: Number(r.leaderRank),
    }
  } catch { return { matrixRank: 0, matrixRankName: '', leaderRank: 0 } }
}

/**
 * Баланс пользователя из GW Stats
 */
export async function getUserGWBalances(address) {
  try {
    const stats = getStats()
    const b = await stats.getUserBalances(address)
    return {
      partnerFromSponsor: fmt(b.partnerFromSponsor),
      partnerFromUpline: fmt(b.partnerFromUpline),
      matrixEarnings: fmt(b.matrixEarnings),
      matrixFrozen: fmt(b.matrixFrozen),
      pensionBalance: fmt(b.pensionBalance),
      leaderBalance: fmt(b.leaderBalance),
      totalBalance: fmt(b.totalBalance),
    }
  } catch { return null }
}

// ═══════════════════════════════════════════════════
// МАРКЕТИНГ (CardGiftMarketing) — 9 линий
// ═══════════════════════════════════════════════════

export async function getMarketingPercents() {
  try {
    const c = getMarketing()
    const percents = await c.getAllLevelPercents()
    return percents.map(p => Number(p) / 100)
  } catch { return [10, 7, 5, 3, 2, 1, 1, 0.5, 0.5] }
}

export async function getRequiredLevels() {
  try {
    const c = getMarketing()
    const levels = await c.getAllRequiredGWLevels()
    return levels.map(l => Number(l))
  } catch { return [1, 2, 3, 4, 5, 6, 7, 8, 9] }
}

export async function getUserMarketingStats(address) {
  try {
    const c = getMarketing()
    const [total, byLine] = await c.getUserMarketingStats(address)
    return { totalEarned: fmt(total), earnedByLine: byLine.map(v => fmt(v)) }
  } catch { return { totalEarned: '0', earnedByLine: Array(9).fill('0') } }
}

// ═══════════════════════════════════════════════════
// МАТРИЧНЫЕ ПЛАТЕЖИ
// ═══════════════════════════════════════════════════

export async function getMatrixUserStats(address) {
  try {
    const c = getMatrixPay()
    const [total, autoUpgraded, frozen] = await c.getUserEarnings(address)
    const rank = await c.getUserRank(address).catch(() => 0)
    const rankName = await c.getRankName(Number(rank)).catch(() => '')
    return { totalEarned: fmt(total), autoUpgraded: fmt(autoUpgraded), frozen: fmt(frozen), rank: Number(rank), rankName }
  } catch { return { totalEarned: '0', autoUpgraded: '0', frozen: '0', rank: 0, rankName: '' } }
}

// ═══════════════════════════════════════════════════
// ГЛОБАЛЬНАЯ СТАТИСТИКА
// ═══════════════════════════════════════════════════

export async function getGlobalStats() {
  try {
    const stats = getStats()
    const s = await stats.getGlobalStats()
    return {
      totalUsers: Number(s.totalUsers),
      totalVolume: fmt(s.totalVolume),
      partnerDistributed: fmt(s.partnerDistributed),
      matrixDistributed: fmt(s.matrixDistributed),
    }
  } catch { return null }
}

// ═══════════════════════════════════════════════════
// РАНГИ — константы
// ═══════════════════════════════════════════════════
export const RANK_NAMES = { 0: 'Без ранга', 1: 'Silver', 2: 'Gold', 3: 'Platinum', 4: 'Diamond', 5: 'Crown' }
export const RANK_COLORS = { 0: '#94a3b8', 1: '#c0c0c0', 2: '#ffd700', 3: '#a855f7', 4: '#60a5fa', 5: '#f59e0b' }
export const RANK_EMOJIS = { 0: '⚪', 1: '🥈', 2: '🥇', 3: '💎', 4: '💠', 5: '👑' }
