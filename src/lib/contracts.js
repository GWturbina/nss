'use client'
/**
 * NSS v2.3 — Contract Service Layer
 * Все вызовы контрактов в одном месте. Компоненты импортируют отсюда.
 */
import { ethers } from 'ethers'
import web3 from './web3'
import ADDRESSES from '@/contracts/addresses'

// ABI импорты
import RealEstateMatrixABI from '@/contracts/abi/RealEstateMatrix.json'
import CGTTokenABI from '@/contracts/abi/CGTToken.json'
import NSTTokenABI from '@/contracts/abi/NSTToken.json'
import GemVaultABI from '@/contracts/abi/GemVault.json'
import HousingFundABI from '@/contracts/abi/HousingFund.json'
import CharityFundABI from '@/contracts/abi/CharityFund.json'
import MatrixPaymentsABI from '@/contracts/abi/MatrixPaymentsV2.json'
import NSSPlatformABI from '@/contracts/abi/NSSPlatform.json'
import SwapHelperABI from '@/contracts/abi/SwapHelper.json'
import AICreditsABI from '@/contracts/abi/AICredits.json'
import CardGiftMarketingABI from '@/contracts/abi/CardGiftMarketing.json'
import SafeVaultABI from '@/contracts/abi/SafeVault.json'

const ABIS = {
  RealEstateMatrix: RealEstateMatrixABI,
  CGTToken: CGTTokenABI,
  NSTToken: NSTTokenABI,
  GemVault: GemVaultABI,
  HousingFund: HousingFundABI,
  CharityFund: CharityFundABI,
  MatrixPaymentsV2: MatrixPaymentsABI,
  NSSPlatform: NSSPlatformABI,
  SwapHelper: SwapHelperABI,
  AICredits: AICreditsABI,
  CardGiftMarketing: CardGiftMarketingABI,
  SafeVault: SafeVaultABI,
}

// ═══════════════════════════════════════════════════
// ХЕЛПЕРЫ
// ═══════════════════════════════════════════════════

function getContract(name) {
  if (!web3.signer) throw new Error('Кошелёк не подключён')
  const addr = ADDRESSES[name]
  if (!addr || addr.startsWith('0x_')) throw new Error(`Контракт ${name} не задеплоен`)
  return new ethers.Contract(addr, ABIS[name], web3.signer)
}

function getReadContract(name) {
  if (!web3.provider) throw new Error('Провайдер не инициализирован')
  const addr = ADDRESSES[name]
  if (!addr || addr.startsWith('0x_')) return null
  return new ethers.Contract(addr, ABIS[name], web3.provider)
}

function getUSDT() {
  return new ethers.Contract(ADDRESSES.USDT, [
    'function approve(address,uint256) returns (bool)',
    'function allowance(address,address) view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
  ], web3.signer)
}

async function ensureApproval(spender, amount) {
  const usdt = getUSDT()
  const allowance = await usdt.allowance(web3.address, spender)
  if (allowance < amount) {
    const tx = await usdt.approve(spender, amount)
    await tx.wait()
  }
}

/** Безопасный вызов с человекопонятной ошибкой */
export async function safeCall(fn) {
  try {
    return { ok: true, data: await fn() }
  } catch (err) {
    const msg = err?.reason || err?.shortMessage || err?.message || 'Неизвестная ошибка'
    if (msg.includes('user rejected')) return { ok: false, error: 'Транзакция отклонена' }
    if (msg.includes('insufficient funds')) return { ok: false, error: 'Недостаточно средств (BNB на газ)' }
    if (msg.includes('UNPREDICTABLE_GAS')) return { ok: false, error: 'Ошибка газа — проверьте баланс BNB' }
    const reason = msg.match(/reason="([^"]+)"/)?.[1] || msg.match(/reverted: (.+)/)?.[1]
    if (reason) return { ok: false, error: `Контракт: ${reason}` }
    console.error('Contract error:', err)
    return { ok: false, error: msg.slice(0, 120) }
  }
}

const fmt = ethers.formatEther
const parse = ethers.parseEther

// ═══════════════════════════════════════════════════
// USDT / BNB БАЛАНСЫ
// ═══════════════════════════════════════════════════

export async function getBalances(address) {
  const provider = web3.provider
  if (!provider || !address) return { bnb: '0', usdt: '0', cgt: '0', nst: '0' }

  const [bnbRaw, usdtRaw, cgtRaw, nstRaw] = await Promise.all([
    provider.getBalance(address),
    getReadContract('CGTToken') ? Promise.resolve(0n) : Promise.resolve(0n),
    safeRead('CGTToken', 'balanceOf', [address]),
    safeRead('NSTToken', 'balanceOf', [address]),
  ])

  // USDT balance
  let usdtBal = 0n
  try {
    const usdt = new ethers.Contract(ADDRESSES.USDT, ['function balanceOf(address) view returns (uint256)'], provider)
    usdtBal = await usdt.balanceOf(address)
  } catch {}

  return {
    bnb: fmt(bnbRaw),
    usdt: fmt(usdtBal),
    cgt: cgtRaw ? fmt(cgtRaw) : '0',
    nst: nstRaw ? fmt(nstRaw) : '0',
  }
}

async function safeRead(contractName, method, args = []) {
  try {
    const c = getReadContract(contractName)
    if (!c) return null
    return await c[method](...args)
  } catch { return null }
}

// ═══════════════════════════════════════════════════
// РЕГИСТРАЦИЯ / УРОВНИ (NSSPlatform + GlobalWay)
// ═══════════════════════════════════════════════════

export async function register(sponsorId = 0) {
  const nss = getContract('NSSPlatform')
  const tx = await nss.register(sponsorId)
  return await tx.wait()
}

export async function buyLevel(level) {
  const nss = getContract('NSSPlatform')
  // Получаем цену уровня из bridge
  const bridgeAddr = await nss.bridge()
  const bridge = new ethers.Contract(bridgeAddr, [
    'function getLevelPrice(uint8) view returns (uint256)'
  ], web3.provider)
  const price = await bridge.getLevelPrice(level)
  const tx = await nss.buyLevel(level, { value: price })
  return await tx.wait()
}

export async function getUserNSSInfo(address) {
  return await safeRead('NSSPlatform', 'getUserNSSInfo', [address])
}

export async function isRegistered(address) {
  const result = await safeRead('NSSPlatform', 'isUserRegistered', [address])
  return result === true
}

// ═══════════════════════════════════════════════════
// МАТРИЦА (RealEstateMatrix) — Три Бизнеса
// ═══════════════════════════════════════════════════

export async function buySlot(tableId) {
  const matrix = getContract('RealEstateMatrix')
  const config = await matrix.tables(tableId)
  const price = config.entryPrice

  // Approve USDT
  await ensureApproval(ADDRESSES.RealEstateMatrix, price)

  const tx = await matrix.buySlot(tableId)
  return await tx.wait()
}

export async function getUserTableInfo(address, tableId) {
  return await safeRead('RealEstateMatrix', 'getUserTableInfo', [address, tableId])
}

export async function getUserAllTables(address) {
  const results = await Promise.all([
    getUserTableInfo(address, 0),
    getUserTableInfo(address, 1),
    getUserTableInfo(address, 2),
  ])
  return results
}

export async function getMyPendingWithdrawal(address) {
  return await safeRead('RealEstateMatrix', 'pendingWithdrawals', [address])
}

export async function withdrawFromMatrix() {
  const matrix = getContract('RealEstateMatrix')
  const tx = await matrix.withdraw()
  return await tx.wait()
}

export async function withdrawAmountFromMatrix(amount) {
  const matrix = getContract('RealEstateMatrix')
  const tx = await matrix.withdrawAmount(amount)
  return await tx.wait()
}

export async function chooseContinueReinvest(continueChoice) {
  const matrix = getContract('RealEstateMatrix')
  const tx = await matrix.chooseContinueReinvest(continueChoice)
  return await tx.wait()
}

export async function getMatrixStats() {
  const c = getReadContract('RealEstateMatrix')
  if (!c) return null
  const [totalSlots, totalVolume, totalCharity, totalRotation] = await c.getStats()
  return {
    totalSlots: Number(totalSlots),
    totalVolume: fmt(totalVolume),
    totalCharity: fmt(totalCharity),
    totalRotation: fmt(totalRotation),
  }
}

export async function getContractHealth() {
  const c = getReadContract('RealEstateMatrix')
  if (!c) return null
  try {
    const [balance, owedW, owedC, owedCGT, surplus] = await c.getContractHealth()
    return { balance: fmt(balance), owedWithdrawals: fmt(owedW), owedCharity: fmt(owedC), owedCGT: fmt(owedCGT), surplus: fmt(surplus) }
  } catch { return null }
}

// ═══════════════════════════════════════════════════
// КАМНИ (GemVault)
// ═══════════════════════════════════════════════════

export async function buyGem(gemId, categoryId) {
  const gv = getContract('GemVault')
  const price = await gv.getClubPrice(gemId)
  const tx = await gv.buyGem(gemId, categoryId, { value: price })
  return await tx.wait()
}

export async function claimGem(purchaseId, takePhysical = false) {
  const gv = getContract('GemVault')
  const tx = await gv.claimGem(purchaseId, takePhysical)
  return await tx.wait()
}

export async function getGemPurchases(address) {
  const gv = getReadContract('GemVault')
  if (!gv) return []
  try {
    const ids = await gv.userPurchases(address)
    const purchases = await Promise.all(ids.map(id => gv.purchases(id)))
    return purchases.map((p, i) => ({
      id: Number(ids[i]),
      gemId: Number(p.gemId),
      price: fmt(p.pricePaid),
      stakingEnds: Number(p.stakingEndsAt),
      claimed: p.claimed,
      listedP2P: p.listedForP2P,
    }))
  } catch { return [] }
}

export async function getGemClubPrice(gemId) {
  return await safeRead('GemVault', 'getClubPrice', [gemId])
}

export async function getStakingHealth() {
  const gv = getReadContract('GemVault')
  if (!gv) return null
  try {
    const [reserve, deposited, paidOut] = await gv.getStakingReserveInfo()
    return { reserve: fmt(reserve), deposited: fmt(deposited), paidOut: fmt(paidOut) }
  } catch { return null }
}

// ═══════════════════════════════════════════════════
// ДОМ (HousingFund)
// ═══════════════════════════════════════════════════

export async function canApplyForHouse(address, housePrice) {
  return await safeRead('HousingFund', 'canApplyForHouse', [address, housePrice])
}

export async function applyForHouse(housePrice, location, country) {
  const hf = getContract('HousingFund')
  const deposit = (BigInt(housePrice) * 35n) / 100n
  await ensureApproval(ADDRESSES.HousingFund, deposit)
  const tx = await hf.applyForHouse(housePrice, location, country)
  return await tx.wait()
}

export async function getHouseInfo(address) {
  return await safeRead('HousingFund', 'applications', [address])
}

// ═══════════════════════════════════════════════════
// БлагоДАРЮ (CharityFund + RealEstateMatrix)
// ═══════════════════════════════════════════════════

export async function canGiveGift(address) {
  return await safeRead('RealEstateMatrix', 'canUserGiveGift', [address])
}

export async function giveGift(recipientAddress) {
  const cf = getContract('CharityFund')
  const tx = await cf.giveGift(recipientAddress)
  return await tx.wait()
}

export async function getCharityBalance(address) {
  return await safeRead('RealEstateMatrix', 'userCharityBalance', [address])
}

// ═══════════════════════════════════════════════════
// ОБМЕН (SwapHelper)
// ═══════════════════════════════════════════════════

export async function swapBNBtoUSDT(bnbAmount, minUSDTOut = 0n) {
  const swap = getContract('SwapHelper')
  const tx = await swap.swapBNBtoUSDT(minUSDTOut, { value: parse(bnbAmount) })
  return await tx.wait()
}

export async function swapUSDTtoBNB(usdtAmount, minBNBOut = 0n) {
  const swap = getContract('SwapHelper')
  const amount = parse(usdtAmount)
  await ensureApproval(ADDRESSES.SwapHelper, amount)
  const tx = await swap.swapUSDTtoBNB(amount, minBNBOut)
  return await tx.wait()
}

export async function quoteBNBtoUSDT(bnbAmount) {
  const c = getReadContract('SwapHelper')
  if (!c) return null
  const [usdtAmount, fee] = await c.quoteBNBtoUSDT(parse(bnbAmount))
  return { usdtOut: fmt(usdtAmount), fee: fmt(fee) }
}

export async function quoteUSDTtoBNB(usdtAmount) {
  const c = getReadContract('SwapHelper')
  if (!c) return null
  const [bnbAmount, fee] = await c.quoteUSDTtoBNB(parse(usdtAmount))
  return { bnbOut: fmt(bnbAmount), fee: fmt(fee) }
}

// ═══════════════════════════════════════════════════
// CGT ТОКЕН
// ═══════════════════════════════════════════════════

export async function buyCGT(bnbAmount) {
  const cgt = getContract('CGTToken')
  const tx = await cgt.buyTokens({ value: parse(bnbAmount) })
  return await tx.wait()
}

export async function getCGTPrice() {
  return await safeRead('CGTToken', 'getCurrentPrice', [])
}

export async function getCGTInfo() {
  const c = getReadContract('CGTToken')
  if (!c) return null
  try {
    const [price, cap, supply] = await Promise.all([
      c.getCurrentPrice(),
      c.realCapitalization(),
      c.circulatingSupply(),
    ])
    return { price: fmt(price), capitalization: fmt(cap), supply: fmt(supply) }
  } catch { return null }
}

// P2P Ордера CGT
export async function createSellOrder(tokenAmount, pricePerToken) {
  const cgt = getContract('CGTToken')
  const tx = await cgt.createSellOrder(parse(tokenAmount), parse(pricePerToken))
  return await tx.wait()
}

export async function buyFromOrder(orderId, maxPrice, totalBNB) {
  const cgt = getContract('CGTToken')
  const tx = await cgt.buyFromOrder(orderId, parse(maxPrice), { value: parse(totalBNB) })
  return await tx.wait()
}

export async function cancelOrder(orderId) {
  const cgt = getContract('CGTToken')
  const tx = await cgt.cancelOrder(orderId)
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// AI CREDITS
// ═══════════════════════════════════════════════════

export async function buyAICredits(packageId) {
  const ai = getContract('AICredits')
  const pkg = await ai.packages(packageId)
  const tx = await ai.buyCredits(packageId, { value: pkg.priceBNB })
  return await tx.wait()
}

export async function getAIBalance(address) {
  return await safeRead('AICredits', 'getUserCredits', [address])
}

// ═══════════════════════════════════════════════════
// МАТРИЧНЫЕ ПЛАТЕЖИ (MatrixPaymentsV2)
// ═══════════════════════════════════════════════════

export async function getMyMatrixEarnings(address) {
  const c = getReadContract('MatrixPaymentsV2')
  if (!c) return null
  try {
    const [total, autoUpgrade, earned] = await Promise.all([
      c.totalEarnedFromMatrix(address),
      c.autoUpgrades(address),
      c.totalDistributed(),
    ])
    return {
      totalEarned: fmt(total),
      frozen: fmt(autoUpgrade.frozenAmount),
      targetLevel: Number(autoUpgrade.targetLevel),
      isActive: autoUpgrade.isActive,
      totalDistributed: fmt(earned),
    }
  } catch { return null }
}

// ═══════════════════════════════════════════════════
// ADMIN ФУНКЦИИ
// ═══════════════════════════════════════════════════

export async function pauseContract(name) {
  const c = getContract(name)
  const tx = await c.pause()
  return await tx.wait()
}

export async function unpauseContract(name) {
  const c = getContract(name)
  const tx = await c.unpause()
  return await tx.wait()
}

export async function setAuthorizedCaller(contractName, callerAddr, auth) {
  const c = getContract(contractName)
  const tx = await c.setAuthorizedCaller(callerAddr, auth)
  return await tx.wait()
}

export async function emergencyWithdraw(contractName) {
  const c = getContract(contractName)
  const tx = await c.emergencyWithdraw()
  return await tx.wait()
}

export async function getOwner(contractName) {
  return await safeRead(contractName, 'owner', [])
}

export async function isPaused(contractName) {
  return await safeRead(contractName, 'paused', [])
}

export async function flushReinvestCGT() {
  const c = getContract('RealEstateMatrix')
  const tx = await c.flushReinvestCGT()
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ СТОЛОВ (БИЗНЕСОВ)
// ═══════════════════════════════════════════════════

/**
 * Бесплатная выдача мест (только owner)
 * @param beneficiary Адрес получателя
 * @param t50 Выдать $50
 * @param t250 Выдать $250
 * @param t1000 Выдать $1000
 */
export async function giftSlotsFree(beneficiary, t50, t250, t1000) {
  const matrix = getContract('RealEstateMatrix')
  const tx = await matrix.giftSlotsFree(beneficiary, t50, t250, t1000)
  return await tx.wait()
}

/**
 * Инициализация стола с 7 основателями
 * @param {number} tableId - 0 (Малый $50), 1 (Средний $250), 2 (Большой $1000)
 * @param {string[]} founders - Массив из 7 адресов основателей
 */
export async function initializeFounderSlots(tableId, founders) {
  if (founders.length !== 7) throw new Error('Нужно ровно 7 адресов основателей')
  const matrix = getContract('RealEstateMatrix')
  const tx = await matrix.initializeFounderSlots(tableId, founders)
  return await tx.wait()
}

/**
 * Проверить инициализирован ли стол
 */
export async function isTableInitialized(tableId) {
  return await safeRead('RealEstateMatrix', 'founderInitialized', [tableId])
}

/**
 * Получить статус всех столов
 */
export async function getTablesInitStatus() {
  const [t0, t1, t2] = await Promise.all([
    isTableInitialized(0),
    isTableInitialized(1),
    isTableInitialized(2),
  ])
  return { table0: t0, table1: t1, table2: t2 }
}

/**
 * Бесплатная выдача мест блогеру/рефоводу (только owner)
 * @param {string} beneficiary - Адрес получателя
 * @param {boolean} t50 - Выдать место $50
 * @param {boolean} t250 - Выдать место $250
 * @param {boolean} t1000 - Выдать место $1000
 */
export async function giftSlotsFree(beneficiary, t50, t250, t1000) {
  const matrix = getContract('RealEstateMatrix')
  const tx = await matrix.giftSlotsFree(beneficiary, t50, t250, t1000)
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// СВОДНАЯ ЗАГРУЗКА ДАННЫХ
// ═══════════════════════════════════════════════════

/** Загружает все данные для dashboard одним вызовом */
export async function loadUserDashboard(address) {
  const [balances, nssInfo, tables, pending, charityBal, houseInfo] = await Promise.all([
    getBalances(address),
    getUserNSSInfo(address).catch(() => null),
    getUserAllTables(address).catch(() => [null, null, null]),
    getMyPendingWithdrawal(address).catch(() => 0n),
    getCharityBalance(address).catch(() => 0n),
    getHouseInfo(address).catch(() => null),
  ])

  return {
    balances,
    nssInfo,
    tables,
    pendingWithdrawal: pending ? fmt(pending) : '0',
    charityBalance: charityBal ? fmt(charityBal) : '0',
    houseInfo,
  }
}
