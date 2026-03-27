'use client'
/**
 * teamContracts.js v3 — 9 линий реальных партнёров из GlobalWay
 */
import { ethers } from 'ethers'
import readProvider from './readProvider'
import ADDRESSES from '@/contracts/addresses'
import GlobalWayABI from '@/contracts/abi/GlobalWay.json'
import GlobalWayStatsABI from '@/contracts/abi/GlobalWayStats.json'
import MatrixRegistryABI from '@/contracts/abi/MatrixRegistry.json'
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
// 9 ЛИНИЙ ПАРТНЁРОВ
// ═══════════════════════════════════════════════════

/**
 * Получить прямых рефералов адреса (1 линия)
 */
export async function getDirectReferrals(address) {
  try {
    const gw = getGW()
    const refs = await gw.getDirectReferrals(address)
    return [...refs]
  } catch { return [] }
}

/**
 * Получить детали одного партнёра
 */
export async function getPartnerDetails(address) {
  try {
    const [regInfo, fullStats] = await Promise.all([
      getRegistry().getUserInfo(address).catch(() => null),
      getStats().getUserFullStats(address).catch(() => null),
    ])
    return {
      address,
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
    return { address, userId: 0, sponsorId: 0, personalInvites: 0, maxLevel: 0, matrixRank: 0, quarterlyActive: false, partnerEarnings: '0', matrixEarnings: '0' }
  }
}

/**
 * Загрузить одну линию — массив адресов с деталями
 * @param {string[]} addresses — адреса для этой линии
 * @returns {Promise<{address, userId, maxLevel, matrixRank, ...}[]>}
 */
export async function loadLineDetails(addresses) {
  if (!addresses || addresses.length === 0) return []
  // Загружаем по 10 штук параллельно чтобы не перегрузить RPC
  const results = []
  const batchSize = 10
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize)
    const details = await Promise.all(batch.map(addr => getPartnerDetails(addr)))
    results.push(...details)
  }
  return results
}

/**
 * Загрузить адреса для следующей линии (рефералы всех людей из предыдущей линии)
 * @param {string[]} lineAddresses — адреса людей из предыдущей линии
 * @returns {Promise<string[]>} — адреса следующей линии
 */
export async function getNextLineAddresses(lineAddresses) {
  if (!lineAddresses || lineAddresses.length === 0) return []
  const gw = getGW()
  const allRefs = []
  const batchSize = 10
  for (let i = 0; i < lineAddresses.length; i += batchSize) {
    const batch = lineAddresses.slice(i, i + batchSize)
    const results = await Promise.all(
      batch.map(addr => gw.getDirectReferrals(addr).then(r => [...r]).catch(() => []))
    )
    results.forEach(refs => allRefs.push(...refs))
  }
  return allRefs
}

// ═══════════════════════════════════════════════════
// МАРКЕТИНГ + СТАТИСТИКА (без изменений)
// ═══════════════════════════════════════════════════

export async function getUserFullStats(address) {
  try {
    const s = await getStats().getUserFullStats(address)
    return { isRegistered: s.isRegistered, sponsor: s.sponsor, maxLevel: Number(s.maxLevel), quarterlyActive: s.quarterlyActive, partnerEarnings: fmt(s.partnerEarnings), matrixEarnings: fmt(s.matrixEarnings), pensionBalance: fmt(s.pensionBalance), leaderBalance: fmt(s.leaderBalance), totalPending: fmt(s.totalPendingBalance), frozenAutoUpgrade: fmt(s.frozenForAutoUpgrade), matrixRank: Number(s.matrixRank), leaderRank: Number(s.leaderRank) }
  } catch { return null }
}

export async function getUserGWBalances(address) {
  try {
    const b = await getStats().getUserBalances(address)
    return { partnerFromSponsor: fmt(b.partnerFromSponsor), partnerFromUpline: fmt(b.partnerFromUpline), matrixEarnings: fmt(b.matrixEarnings), matrixFrozen: fmt(b.matrixFrozen), pensionBalance: fmt(b.pensionBalance), leaderBalance: fmt(b.leaderBalance), totalBalance: fmt(b.totalBalance) }
  } catch { return null }
}

export async function getMarketingPercents() {
  try { const c = getMarketing(); const p = await c.getAllLevelPercents(); return p.map(v => Number(v)/100) } catch { return [10,7,5,3,2,1,1,0.5,0.5] }
}

export async function getRequiredLevels() {
  try { const c = getMarketing(); const l = await c.getAllRequiredGWLevels(); return l.map(v => Number(v)) } catch { return [1,2,3,4,5,6,7,8,9] }
}

export async function getUserMarketingStats(address) {
  try { const c = getMarketing(); const [total, byLine] = await c.getUserMarketingStats(address); return { totalEarned: fmt(total), earnedByLine: byLine.map(v => fmt(v)) } } catch { return { totalEarned: '0', earnedByLine: Array(9).fill('0') } }
}

export async function getMatrixUserStats(address) {
  try { const c = getMatrixPay(); const [total, autoUpgraded, frozen] = await c.getUserEarnings(address); const rank = await c.getUserRank(address).catch(()=>0); return { totalEarned: fmt(total), autoUpgraded: fmt(autoUpgraded), frozen: fmt(frozen), rank: Number(rank) } } catch { return { totalEarned: '0', autoUpgraded: '0', frozen: '0', rank: 0 } }
}

export const RANK_NAMES = { 0:'Без ранга', 1:'Silver', 2:'Gold', 3:'Platinum', 4:'Diamond', 5:'Crown' }
export const RANK_COLORS = { 0:'#94a3b8', 1:'#c0c0c0', 2:'#ffd700', 3:'#a855f7', 4:'#60a5fa', 5:'#f59e0b' }
export const RANK_EMOJIS = { 0:'⚪', 1:'🥈', 2:'🥇', 3:'💎', 4:'💠', 5:'👑' }
