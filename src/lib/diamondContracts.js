'use client'
/**
 * NSS Diamond Club v10.1 — Contract Service Layer
 * GemVaultV2 + MetalVault + InsuranceFund + TrustScore + UserBoost + ReferralPool + ShowcaseMarket
 * Все вызовы Diamond Club контрактов в одном месте.
 */
import { ethers } from 'ethers'
import web3 from './web3'
import ADDRESSES from '@/contracts/addresses'

// ═══════════════════════════════════════════════════
// READ PROVIDER (без кошелька)
// ═══════════════════════════════════════════════════
const READ_RPC = 'https://opbnb-mainnet-rpc.bnbchain.org'
const readProvider = new ethers.JsonRpcProvider(READ_RPC)

// ═══════════════════════════════════════════════════
// MINIMAL ABIs (для чтения — без ABI файлов)
// ═══════════════════════════════════════════════════

const GEMVAULT_ABI = [
  // Views
  'function getClubPrice(uint256 gemId) view returns (uint256)',
  'function getPriceBreakdown(uint256 gemId) view returns (uint256 market, uint256 club, uint256 insurance, uint256 marketing, uint256 supplier_, uint256 staking, uint256 clubFund_, uint256 author_)',
  'function getStakingReward(uint256 purchaseId) view returns (uint256 reward, bool ready)',
  'function getUserPurchases(address user) view returns (uint256[])',
  'function getPurchaseInfo(uint256 id) view returns (uint256 gemId, address buyer, uint8 mode, uint8 status, uint256 pricePaid, uint256 marketValue, uint16 stakingRateBP, uint64 stakingEndsAt, uint256 pendingReward)',
  'function getVaultStats() view returns (uint256 totalSales, uint256 reserve, uint256 paidOut, uint256 catCount, uint256 gemCount, uint256 purchaseCount)',
  'function gems(uint256) view returns (uint256 categoryId, string name, string certHash, uint256 marketPrice, uint256 weight, bool available, bool fractional, uint256 totalFractions, uint256 soldFractions)',
  'function categories(uint256) view returns (string name, string assetType, uint256 stakingPeriod, uint256 minInvestment, address supplier, bool active)',
  'function p2pPrices(uint256) view returns (uint256)',
  'function clubDiscountBP() view returns (uint256)',
  'function stakingReserve() view returns (uint256)',
  // Write
  'function buyGem(uint256 gemId, uint8 mode, uint256 fractions)',
  'function convertToAsset(uint256 purchaseId)',
  'function claimStaking(uint256 purchaseId, uint8 option)',
  'function restake(uint256 purchaseId)',
  'function listForP2P(uint256 purchaseId, uint256 price)',
  'function cancelP2PListing(uint256 purchaseId)',
  'function buyP2P(uint256 purchaseId)',
]

const METALVAULT_ABI = [
  'function metals(uint256) view returns (uint256 id, uint8 metalType, string name, uint256 pricePerGramUSDT, string certURI, uint256 totalSupplyGrams, uint256 soldGrams, bool active)',
  'function getUserPurchases(address user) view returns (uint256[])',
  'function getPurchaseInfo(uint256 id) view returns (tuple(uint256 id, uint256 metalId, address owner, uint8 mode, uint8 status, uint256 grams, uint256 totalPaidUSDT, uint256 marketValue, uint16 stakingRateBP, uint64 purchasedAt, uint64 stakingStartedAt, uint64 stakingEndsAt))',
  'function getStakingReward(uint256 id) view returns (uint256 reward, bool ready)',
  'function getVaultStats() view returns (uint256 totalSales, uint256 reserve, uint256 paidOut, uint256 metalCount, uint256 purchaseCount)',
  'function buyMetal(uint256 metalId, uint256 grams, uint8 mode)',
  'function convertToAsset(uint256 purchaseId)',
  'function claimStaking(uint256 purchaseId, uint8 option)',
  'function restake(uint256 purchaseId)',
]

const INSURANCE_ABI = [
  'function userBalance(address) view returns (uint256)',
  'function isFrozen(address) view returns (bool)',
  'function getFundStats() view returns (uint256 balance, uint256 deposited, uint256 paidClaims, uint256 confiscated_, uint256 withdrawn)',
  'function getBalanceBreakdown() view returns (uint256 usdtOnContract, uint256 fundBalance, uint256 usersTotal, uint256 pendingWithdrawals, uint256 accountedTotal)',
  'function getUserWithdrawals(address user) view returns (uint256[])',
  'function withdrawRequests(uint256) view returns (uint256 id, address user, uint256 amount, uint64 requestedAt, uint64 availableAt, uint8 status)',
  'function withdrawDelay() view returns (uint64)',
  'function getVerificationStatus(uint256 purchaseId) view returns (address owner_, uint64 lastVerified, uint64 nextDeadline, bool verified, uint16 missedCount, bool overdue)',
  'function requestWithdraw(uint256 amount)',
  'function executeWithdraw(uint256 requestId)',
  'function verifyAsset(uint256 purchaseId)',
  'function submitClaim(uint256 purchaseId, uint256 claimAmount, string reason, string evidenceIPFS)',
]

const TRUSTSCORE_ABI = [
  'function getScore(address user) view returns (uint16)',
  'function getTier(address user) view returns (uint8)',
  'function getUserInfo(address user) view returns (uint16 score, uint8 tier, uint64 lastActivity, bool canPurchase, bool canStake, bool canShowcase)',
]

const USERBOOST_ABI = [
  'function getStakingRate(address user) view returns (uint16)',
  'function getUserBoost(address user) view returns (uint16 currentRate, uint256 nstBurned, uint256 nextBurnRequired)',
  'function burnForBoost(uint256 amount)',
]

const REFERRALPOOL_ABI = [
  'function claimable(address) view returns (uint256)',
  'function getReferrer(address user) view returns (address)',
  'function getDirectReferrals(address user) view returns (address[])',
  'function getPoolBalance() view returns (uint256)',
  'function claim()',
]

const SHOWCASE_ABI = [
  'function getListing(uint256 id) view returns (tuple(uint256 id, address seller, address agent, uint8 assetType, string title, string description, string imageURI, string certURI, uint256 priceUSDT, uint8 status, uint64 listedAt, uint64 soldAt, address buyer))',
  'function getActiveListings() view returns (uint256[])',
  'function getMarketStats() view returns (uint256 total, uint256 sales, uint256 burned, uint256 commissions)',
  'function isAgent(address user) view returns (bool)',
  'function listOnShowcase(uint8 assetType, string title, string description, string imageURI, string certURI, uint256 priceUSDT)',
  'function confirmSale(uint256 listingId, address buyer)',
  'function cancelListing(uint256 listingId)',
  'function buyAgentLicense()',
]

// ═══════════════════════════════════════════════════
// ХЕЛПЕРЫ
// ═══════════════════════════════════════════════════

const fmt = ethers.formatEther
const fmt6 = (v) => ethers.formatUnits(v, 6)  // USDT 6 decimals
const parse = ethers.parseEther
const parse6 = (v) => ethers.parseUnits(v, 6) // USDT 6 decimals

function getDC(name, abi) {
  if (!web3.signer) throw new Error('Кошелёк не подключён')
  const addr = ADDRESSES[name]
  if (!addr || addr.startsWith('0x_')) throw new Error(`${name} не задеплоен`)
  return new ethers.Contract(addr, abi, web3.signer)
}

function getDCRead(name, abi) {
  const addr = ADDRESSES[name]
  if (!addr || addr.startsWith('0x_')) return null
  return new ethers.Contract(addr, abi, readProvider)
}

function getUSDT() {
  return new ethers.Contract(ADDRESSES.USDT, [
    'function approve(address,uint256) returns (bool)',
    'function allowance(address,address) view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
  ], web3.signer)
}

async function ensureUSDTApproval(spender, amount) {
  const usdt = getUSDT()
  const allowance = await usdt.allowance(web3.address, spender)
  if (allowance < amount) {
    const tx = await usdt.approve(spender, amount)
    await tx.wait()
  }
}

// ═══════════════════════════════════════════════════
// GemVaultV2 — Камни
// ═══════════════════════════════════════════════════

export async function getGemVaultStats() {
  const c = getDCRead('GemVaultV2', GEMVAULT_ABI)
  if (!c) return null
  try {
    const s = await c.getVaultStats()
    return {
      totalSales: fmt6(s.totalSales),
      reserve: fmt6(s.reserve),
      paidOut: fmt6(s.paidOut),
      categories: Number(s.catCount),
      gems: Number(s.gemCount),
      purchases: Number(s.purchaseCount),
    }
  } catch { return null }
}

export async function getGemsList() {
  const c = getDCRead('GemVaultV2', GEMVAULT_ABI)
  if (!c) return []
  try {
    const stats = await c.getVaultStats()
    const gemCount = Number(stats.gemCount)
    const gems = []
    for (let i = 0; i < gemCount && i < 50; i++) {
      try {
        const g = await c.gems(i)
        const clubPrice = await c.getClubPrice(i)
        gems.push({
          id: i,
          categoryId: Number(g.categoryId),
          name: g.name,
          certHash: g.certHash,
          marketPrice: fmt6(g.marketPrice),
          clubPrice: fmt6(clubPrice),
          weight: Number(g.weight),
          available: g.available,
          fractional: g.fractional,
          totalFractions: Number(g.totalFractions),
          soldFractions: Number(g.soldFractions),
        })
      } catch { break }
    }
    return gems
  } catch { return [] }
}

export async function getUserGemPurchases(address) {
  const c = getDCRead('GemVaultV2', GEMVAULT_ABI)
  if (!c) return []
  try {
    const ids = await c.getUserPurchases(address)
    const purchases = []
    for (const id of ids) {
      try {
        const p = await c.getPurchaseInfo(id)
        const reward = await c.getStakingReward(id)
        purchases.push({
          id: Number(id),
          gemId: Number(p.gemId),
          buyer: p.buyer,
          mode: Number(p.mode),        // 0=PURCHASE, 1=ASSET
          status: Number(p.status),    // 0=OWNED, 1=STAKING, 2=CLAIMED, 3=LISTED_P2P
          pricePaid: fmt6(p.pricePaid),
          marketValue: fmt6(p.marketValue),
          stakingRateBP: Number(p.stakingRateBP),
          stakingEndsAt: Number(p.stakingEndsAt),
          pendingReward: fmt6(p.pendingReward),
          rewardReady: reward.ready,
        })
      } catch {}
    }
    return purchases
  } catch { return [] }
}

export async function buyGemV2(gemId, mode = 1, fractions = 1) {
  const c = getDC('GemVaultV2', GEMVAULT_ABI)
  const cRead = getDCRead('GemVaultV2', GEMVAULT_ABI)
  const clubPrice = await cRead.getClubPrice(gemId)
  await ensureUSDTApproval(ADDRESSES.GemVaultV2, clubPrice)
  const tx = await c.buyGem(gemId, mode, fractions)
  return await tx.wait()
}

export async function convertGemToAsset(purchaseId) {
  const c = getDC('GemVaultV2', GEMVAULT_ABI)
  const tx = await c.convertToAsset(purchaseId)
  return await tx.wait()
}

export async function claimGemStaking(purchaseId, option = 0) {
  const c = getDC('GemVaultV2', GEMVAULT_ABI)
  const tx = await c.claimStaking(purchaseId, option)
  return await tx.wait()
}

export async function restakeGem(purchaseId) {
  const c = getDC('GemVaultV2', GEMVAULT_ABI)
  const tx = await c.restake(purchaseId)
  return await tx.wait()
}

export async function listGemP2P(purchaseId, priceUSDT) {
  const c = getDC('GemVaultV2', GEMVAULT_ABI)
  const tx = await c.listForP2P(purchaseId, parse6(priceUSDT))
  return await tx.wait()
}

export async function buyGemP2P(purchaseId) {
  const c = getDC('GemVaultV2', GEMVAULT_ABI)
  const cRead = getDCRead('GemVaultV2', GEMVAULT_ABI)
  const price = await cRead.p2pPrices(purchaseId)
  await ensureUSDTApproval(ADDRESSES.GemVaultV2, price)
  const tx = await c.buyP2P(purchaseId)
  return await tx.wait()
}

export async function cancelGemP2P(purchaseId) {
  const c = getDC('GemVaultV2', GEMVAULT_ABI)
  const tx = await c.cancelP2PListing(purchaseId)
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// MetalVault — Металлы
// ═══════════════════════════════════════════════════

export async function getMetalVaultStats() {
  const c = getDCRead('MetalVault', METALVAULT_ABI)
  if (!c) return null
  try {
    const s = await c.getVaultStats()
    return {
      totalSales: fmt6(s.totalSales),
      reserve: fmt6(s.reserve),
      paidOut: fmt6(s.paidOut),
      metals: Number(s.metalCount),
      purchases: Number(s.purchaseCount),
    }
  } catch { return null }
}

export async function getMetalsList() {
  const c = getDCRead('MetalVault', METALVAULT_ABI)
  if (!c) return []
  try {
    const stats = await c.getVaultStats()
    const count = Number(stats.metalCount)
    const metals = []
    for (let i = 0; i < count && i < 20; i++) {
      try {
        const m = await c.metals(i)
        metals.push({
          id: Number(m.id),
          metalType: Number(m.metalType), // 0=SILVER, 1=GOLD, 2=PLATINUM
          name: m.name,
          pricePerGram: fmt6(m.pricePerGramUSDT),
          totalSupply: Number(m.totalSupplyGrams),
          soldGrams: Number(m.soldGrams),
          active: m.active,
        })
      } catch { break }
    }
    return metals
  } catch { return [] }
}

export async function buyMetal(metalId, grams, mode = 1) {
  const c = getDC('MetalVault', METALVAULT_ABI)
  const cRead = getDCRead('MetalVault', METALVAULT_ABI)
  const metal = await cRead.metals(metalId)
  const clubPrice = (metal.pricePerGramUSDT * BigInt(grams) / 100n) * 6500n / 10000n
  await ensureUSDTApproval(ADDRESSES.MetalVault, clubPrice)
  const tx = await c.buyMetal(metalId, grams, mode)
  return await tx.wait()
}

export async function getUserMetalPurchases(address) {
  const c = getDCRead('MetalVault', METALVAULT_ABI)
  if (!c) return []
  try {
    const ids = await c.getUserPurchases(address)
    const purchases = []
    for (const id of ids) {
      try {
        const p = await c.getPurchaseInfo(id)
        const reward = await c.getStakingReward(id)
        purchases.push({
          id: Number(p.id),
          metalId: Number(p.metalId),
          owner: p.owner,
          mode: Number(p.mode),
          status: Number(p.status),
          grams: Number(p.grams),
          pricePaid: fmt6(p.totalPaidUSDT),
          marketValue: fmt6(p.marketValue),
          stakingRateBP: Number(p.stakingRateBP),
          stakingEndsAt: Number(p.stakingEndsAt),
          pendingReward: fmt6(reward.reward),
          rewardReady: reward.ready,
        })
      } catch {}
    }
    return purchases
  } catch { return [] }
}

// ═══════════════════════════════════════════════════
// InsuranceFund — Страховой фонд
// ═══════════════════════════════════════════════════

export async function getInsuranceUserBalance(address) {
  const c = getDCRead('InsuranceFund', INSURANCE_ABI)
  if (!c) return '0'
  try {
    const bal = await c.userBalance(address)
    return fmt6(bal)
  } catch { return '0' }
}

export async function getInsuranceFundStats() {
  const c = getDCRead('InsuranceFund', INSURANCE_ABI)
  if (!c) return null
  try {
    const [stats, breakdown] = await Promise.all([
      c.getFundStats(),
      c.getBalanceBreakdown(),
    ])
    return {
      fundBalance: fmt6(stats.balance),
      totalDeposited: fmt6(stats.deposited),
      totalPaidClaims: fmt6(stats.paidClaims),
      totalConfiscated: fmt6(stats.confiscated_),
      totalWithdrawn: fmt6(stats.withdrawn),
      usdtOnContract: fmt6(breakdown.usdtOnContract),
      usersTotal: fmt6(breakdown.usersTotal),
      pendingWithdrawals: fmt6(breakdown.pendingWithdrawals),
    }
  } catch { return null }
}

export async function getUserWithdrawRequests(address) {
  const c = getDCRead('InsuranceFund', INSURANCE_ABI)
  if (!c) return []
  try {
    const ids = await c.getUserWithdrawals(address)
    const requests = []
    for (const id of ids) {
      try {
        const r = await c.withdrawRequests(id)
        requests.push({
          id: Number(r.id),
          amount: fmt6(r.amount),
          requestedAt: Number(r.requestedAt),
          availableAt: Number(r.availableAt),
          status: Number(r.status), // 0=NONE, 1=PENDING, 2=APPROVED, 3=FROZEN, 4=COMPLETED
        })
      } catch {}
    }
    return requests
  } catch { return [] }
}

export async function requestWithdraw(amountUSDT) {
  const c = getDC('InsuranceFund', INSURANCE_ABI)
  const tx = await c.requestWithdraw(parse6(amountUSDT))
  return await tx.wait()
}

export async function executeWithdraw(requestId) {
  const c = getDC('InsuranceFund', INSURANCE_ABI)
  const tx = await c.executeWithdraw(requestId)
  return await tx.wait()
}

export async function isUserFrozen(address) {
  const c = getDCRead('InsuranceFund', INSURANCE_ABI)
  if (!c) return false
  try { return await c.isFrozen(address) } catch { return false }
}

// ═══════════════════════════════════════════════════
// TrustScore — Репутация
// ═══════════════════════════════════════════════════

export async function getUserTrustInfo(address) {
  const c = getDCRead('TrustScore', TRUSTSCORE_ABI)
  if (!c) return null
  try {
    const info = await c.getUserInfo(address)
    const tierNames = ['NONE', 'PROBATION', 'BRONZE', 'SILVER', 'GOLD']
    return {
      score: Number(info.score),
      tier: Number(info.tier),
      tierName: tierNames[Number(info.tier)] || 'NONE',
      canPurchase: info.canPurchase,
      canStake: info.canStake,
      canShowcase: info.canShowcase,
    }
  } catch { return null }
}

// ═══════════════════════════════════════════════════
// UserBoost — Буст ставки
// ═══════════════════════════════════════════════════

export async function getUserBoostInfo(address) {
  const c = getDCRead('UserBoost', USERBOOST_ABI)
  if (!c) return null
  try {
    const info = await c.getUserBoost(address)
    return {
      currentRate: Number(info.currentRate) / 100, // BP → %
      nstBurned: fmt(info.nstBurned),
      nextBurnRequired: fmt(info.nextBurnRequired),
    }
  } catch { return null }
}

export async function burnNSTForBoost(amount) {
  const c = getDC('UserBoost', USERBOOST_ABI)
  const tx = await c.burnForBoost(parse(amount))
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// ReferralPool — Реферальные бонусы
// ═══════════════════════════════════════════════════

export async function getReferralClaimable(address) {
  const c = getDCRead('ReferralPool', REFERRALPOOL_ABI)
  if (!c) return '0'
  try {
    const bal = await c.claimable(address)
    return fmt(bal)
  } catch { return '0' }
}

export async function claimReferralBonus() {
  const c = getDC('ReferralPool', REFERRALPOOL_ABI)
  const tx = await c.claim()
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// СВОДНАЯ ЗАГРУЗКА DIAMOND CLUB
// ═══════════════════════════════════════════════════

export async function loadDiamondClubDashboard(address) {
  const [
    insuranceBalance,
    trustInfo,
    boostInfo,
    referralClaimable,
    gemPurchases,
    metalPurchases,
    gemStats,
    metalStats,
    insuranceStats,
    frozen,
  ] = await Promise.all([
    getInsuranceUserBalance(address).catch(() => '0'),
    getUserTrustInfo(address).catch(() => null),
    getUserBoostInfo(address).catch(() => null),
    getReferralClaimable(address).catch(() => '0'),
    getUserGemPurchases(address).catch(() => []),
    getUserMetalPurchases(address).catch(() => []),
    getGemVaultStats().catch(() => null),
    getMetalVaultStats().catch(() => null),
    getInsuranceFundStats().catch(() => null),
    isUserFrozen(address).catch(() => false),
  ])

  return {
    insuranceBalance,
    trustInfo,
    boostInfo,
    referralClaimable,
    gemPurchases,
    metalPurchases,
    gemStats,
    metalStats,
    insuranceStats,
    frozen,
  }
}
