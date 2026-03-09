'use client'
/**
 * DCT Diamond Club v3.2 — Contract Service Layer
 * ═══════════════════════════════════════════════════
 * DCTToken + DCTBridge + FractionalGem + GemShowcase
 * DCTExchange + GemFractionDEX + DCTHeritage
 *
 * Все вызовы DCT контрактов в одном месте.
 * Deployed: 09.03.2026 on opBNB Mainnet
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
// MINIMAL ABIs
// ═══════════════════════════════════════════════════

const DCTTOKEN_ABI = [
  // Views
  'function getCurrentPrice() view returns (uint256)',
  'function usdtToDCT(uint256 usdtAmount) view returns (uint256)',
  'function dctToUSDT(uint256 dctAmount) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function freeBalance(address user) view returns (uint256)',
  'function lockedBalance(address user) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
  'function totalBackingValue() view returns (uint256)',
  'function getTokenInfo() view returns (uint256 price, uint256 supply, uint256 backing, bool paused_, uint64 pauseExpires, uint64 lastOwnerActive, bool emergencyAvailable)',
  'function getUserInfo(address user) view returns (uint256 total, uint256 locked, uint256 free, uint256 valueUSDT, uint64 lastActive, bool canEmergency)',
  'function isPaused() view returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function INITIAL_PRICE() view returns (uint256)',
  // Write
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function burn(uint256 amount)',
]

const DCTBRIDGE_ABI = [
  // Views
  'function gemClaimed(uint256) view returns (bool)',
  'function gemMintedAmount(uint256) view returns (uint256)',
  'function gemClaimOwner(uint256) view returns (address)',
  'function metalClaimed(uint256) view returns (bool)',
  'function metalMintedAmount(uint256) view returns (uint256)',
  'function getClaimableGems(address user) view returns (uint256[] purchaseIds, uint256[] marketValues, uint256[] estimatedDCT)',
  'function getClaimableMetals(address user) view returns (uint256[] purchaseIds, uint256[] marketValues, uint256[] estimatedDCT)',
  'function BACKING_RATE_BP() view returns (uint16)',
  // Write
  'function claimGemDCT(uint256 purchaseId) returns (uint256)',
  'function claimAllGemDCT() returns (uint256 totalMinted)',
  'function claimAllMetalDCT() returns (uint256 totalMinted)',
  'function processGemWithdrawal(uint256 purchaseId)',
  'function processMetalWithdrawal(uint256 purchaseId)',
]

const FRACTIONALGEM_ABI = [
  // Views — прайс-лист
  'function getClubPrice(uint256 caratX100, bool cert) view returns (uint256)',
  'function getWholesalePrice(uint256 caratX100, bool cert) view returns (uint256)',
  'function getMarketPrice(uint256 caratX100, bool cert) view returns (uint256)',
  'function getPriceInfo(uint256 c, bool cert) view returns (uint256 cost, uint256 club, uint256 ws, uint256 mkt)',
  'function getRegisteredCarats() view returns (uint256[])',
  // Views — лоты
  'function getLotCount() view returns (uint256)',
  'function getLotInfo(uint256 id) view returns (tuple(uint256 lotId, uint256 gemId, uint16 caratX100, string name, string imageURI, bool certified, uint8 certLab, string certNumber, uint256 totalFractions, uint256 soldFractions, uint256 fractionPriceDCT, uint16 stakingAPR, uint256 stakingDays, uint8 status, uint64 createdAt, uint64 fundraisingEndedAt, uint8 cyclesCompleted, uint256 jewelryCost, uint256 jewelryFunded) l, uint256 sr, uint256 tv)',
  'function getUserLotInfo(uint256 id, address u) view returns (uint256 fr, uint256 cl, bool v, uint256 pct)',
  'function getLotCostPrice(uint256 id) view returns (uint256)',
  'function getLotOriginator(uint256 id) view returns (address)',
  'function getLotCyclesCompleted(uint256 id) view returns (uint8)',
  'function getLotStatus(uint256 id) view returns (uint8)',
  'function getClaimableStaking(uint256 lotId, address user) view returns (uint256)',
  'function holderFractions(uint256, address) view returns (uint256)',
  'function stakingReserveUSDT(uint256) view returns (uint256)',
  'function lotCount() view returns (uint256)',
  'function directPurchaseCount() view returns (uint256)',
  'function directPurchaseBuyer(uint256) view returns (address)',
  'function directPurchaseLot(uint256) view returns (uint256)',
  'function directPurchaseDeliveryRequested(uint256) view returns (bool)',
  'function jewelryInvestment(uint256, address) view returns (uint256)',
  'function MAX_CYCLES() view returns (uint8)',
  'function VERSION() view returns (string)',
  // ERC-1155 views
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  // Write — покупка
  'function buyWholeGem(uint256 lotId)',
  'function buyFractions(uint256 lotId, uint256 amount)',
  'function requestDelivery(uint256 purchaseId)',
  // Write — стейкинг
  'function claimStaking(uint256 lotId)',
  // Write — продажа лота
  'function voteForSale(uint256 lotId)',
  'function claimSaleProceeds(uint256 lotId)',
  // Write — ювелирка
  'function requestJewelryProduction(uint256 lotId, uint256 jewelryCost, uint8 mode)',
  'function fundJewelryProduction(uint256 lotId, uint256 amountUSDT)',
  // ERC-1155 write
  'function setApprovalForAll(address operator, bool approved)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
]

const GEMSHOWCASE_ABI = [
  // Views
  'function showcaseListings(uint256 id) view returns (uint256 lotId, uint256 salePrice, address seller, bool active, bool sold)',
  'function showcaseCount() view returns (uint256)',
  'function getActiveListings() view returns (tuple(uint256 lotId, uint256 salePrice, address seller, bool active, bool sold)[])',
  'function CYCLE_SELLER_BP() view returns (uint16)',
  'function CYCLE_SPONSOR_BP() view returns (uint16)',
  // Write
  'function createShowcaseListing(uint256 lotId, uint256 salePrice)',
  'function buyFromShowcase(uint256 id)',
  'function cancelShowcaseListing(uint256 id)',
  'function takeForSale(uint256 id)',
  'function returnFromSale(uint256 id)',
]

const DCTEXCHANGE_ABI = [
  // Views
  'function orders(uint256 id) view returns (uint256 orderId, uint8 orderType, address maker, uint256 dctAmount, uint256 dctFilled, uint256 pricePerDCT, uint8 status, uint64 createdAt)',
  'function getActiveSellOrders() view returns (tuple(uint256 orderId, uint8 orderType, address maker, uint256 dctAmount, uint256 dctFilled, uint256 pricePerDCT, uint8 status, uint64 createdAt)[])',
  'function getActiveBuyOrders() view returns (tuple(uint256 orderId, uint8 orderType, address maker, uint256 dctAmount, uint256 dctFilled, uint256 pricePerDCT, uint8 status, uint64 createdAt)[])',
  'function getBestPrices() view returns (uint256 bestBid, uint256 bestAsk)',
  'function getExchangeStats() view returns (uint256 volumeDCT, uint256 volumeUSDT, uint256 burnedDCT, uint256 trades, uint256 activeBuys, uint256 activeSells, uint256 backingPrice)',
  'function orderCount() view returns (uint256)',
  'function totalVolumeDCT() view returns (uint256)',
  'function totalVolumeUSDT() view returns (uint256)',
  'function totalBurnedDCT() view returns (uint256)',
  'function totalTrades() view returns (uint256)',
  'function TRADE_FEE_BP() view returns (uint16)',
  // Write
  'function createSellOrder(uint256 dctAmount, uint256 pricePerDCT) returns (uint256)',
  'function fillSellOrder(uint256 orderId, uint256 dctAmount)',
  'function createBuyOrder(uint256 dctAmount, uint256 pricePerDCT) returns (uint256)',
  'function fillBuyOrder(uint256 orderId, uint256 dctAmount)',
  'function cancelOrder(uint256 orderId)',
]

const GEMFRACTIONDEX_ABI = [
  // Views
  'function sellOrders(uint256 id) view returns (uint256 orderId, uint256 lotId, address seller, uint256 fractions, uint256 pricePerFractionDCT, bool active, uint64 createdAt)',
  'function getActiveSellOrders(uint256 lotId) view returns (tuple(uint256 orderId, uint256 lotId, address seller, uint256 fractions, uint256 pricePerFractionDCT, bool active, uint64 createdAt)[])',
  'function getOrder(uint256 id) view returns (tuple(uint256 orderId, uint256 lotId, address seller, uint256 fractions, uint256 pricePerFractionDCT, bool active, uint64 createdAt))',
  'function orderCount() view returns (uint256)',
  'function TRADE_FEE_BP() view returns (uint16)',
  'function MIN_ORDER_PRICE() view returns (uint256)',
  // Write
  'function createSellOrder(uint256 lotId, uint256 fractions, uint256 priceDCT)',
  'function fillSellOrder(uint256 orderId, uint256 fractions)',
  'function cancelSellOrder(uint256 orderId)',
]

const DCTHERITAGE_ABI = [
  // Views
  'function getHeritage(address user) view returns (bool active, bool executed, uint64 lastActivity, uint64 inactivityPeriod, uint64 canExecuteAt, bool canExecuteNow, uint8 heirCount)',
  'function getHeirs(address user) view returns (address[] wallets, uint16[] shares, string[] labels)',
  'function checkApprovals(address user) view returns (bool dctApproved, bool fractionsApproved)',
  'function estimateHeirShare(address owner, address heir) view returns (uint256 dctAmount, uint256 fractionsTotal)',
  'function MIN_INACTIVITY() view returns (uint64)',
  'function MAX_HEIRS() view returns (uint8)',
  // Write
  'function configureHeritage(address[] wallets, uint16[] sharesBP, string[] labels, uint256 inactivityDays)',
  'function cancelHeritage()',
  'function ping()',
  'function executeHeritage(address originalOwner)',
]

// ═══════════════════════════════════════════════════
// ХЕЛПЕРЫ
// ═══════════════════════════════════════════════════

const fmt   = ethers.formatEther           // 18 decimals (DCT, NST, BNB)
const fmt6  = (v) => ethers.formatUnits(v, 6)  // USDT 6 decimals
const parse  = ethers.parseEther
const parse6 = (v) => ethers.parseUnits(v, 6)

function getDCT(name, abi) {
  if (!web3.signer) throw new Error('Кошелёк не подключён')
  const addr = ADDRESSES[name]
  if (!addr || addr.startsWith('0x_')) throw new Error(`${name} не задеплоен`)
  return new ethers.Contract(addr, abi, web3.signer)
}

function getDCTRead(name, abi) {
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

function getDCTToken() {
  return new ethers.Contract(ADDRESSES.DCTToken, DCTTOKEN_ABI, web3.signer)
}

function getDCTTokenRead() {
  return new ethers.Contract(ADDRESSES.DCTToken, DCTTOKEN_ABI, readProvider)
}

async function ensureUSDTApproval(spender, amount) {
  const usdt = getUSDT()
  const allowance = await usdt.allowance(web3.address, spender)
  if (allowance < amount) {
    const tx = await usdt.approve(spender, amount)
    await tx.wait()
  }
}

async function ensureDCTApproval(spender, amount) {
  const dct = getDCTToken()
  const dctRead = getDCTTokenRead()
  const allowance = await dctRead.allowance(web3.address, spender)
  if (allowance < amount) {
    const tx = await dct.approve(spender, amount)
    await tx.wait()
  }
}

async function ensureFractionApproval(operator) {
  const fg = getDCT('FractionalGem', FRACTIONALGEM_ABI)
  const fgRead = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  const approved = await fgRead.isApprovedForAll(web3.address, operator)
  if (!approved) {
    const tx = await fg.setApprovalForAll(operator, true)
    await tx.wait()
  }
}

// ═══════════════════════════════════════════════════
// 1. DCTToken — Токен DCT
// ═══════════════════════════════════════════════════

export async function getDCTTokenInfo() {
  const c = getDCTTokenRead()
  try {
    const info = await c.getTokenInfo()
    return {
      price: fmt(info.price),
      supply: fmt(info.supply),
      backing: fmt6(info.backing),
      paused: info.paused_,
      pauseExpires: Number(info.pauseExpires),
      lastOwnerActive: Number(info.lastOwnerActive),
      emergencyAvailable: info.emergencyAvailable,
    }
  } catch { return null }
}

export async function getDCTUserInfo(address) {
  const c = getDCTTokenRead()
  try {
    const info = await c.getUserInfo(address)
    return {
      total: fmt(info.total),
      locked: fmt(info.locked),
      free: fmt(info.free),
      valueUSDT: fmt6(info.valueUSDT),
      lastActive: Number(info.lastActive),
      canEmergency: info.canEmergency,
    }
  } catch { return null }
}

export async function getDCTPrice() {
  const c = getDCTTokenRead()
  try {
    const price = await c.getCurrentPrice()
    return fmt(price)
  } catch { return '0' }
}

export async function convertUsdtToDCT(usdtAmount) {
  const c = getDCTTokenRead()
  try {
    const dct = await c.usdtToDCT(parse6(usdtAmount))
    return fmt(dct)
  } catch { return '0' }
}

export async function convertDCTToUsdt(dctAmount) {
  const c = getDCTTokenRead()
  try {
    const usdt = await c.dctToUSDT(parse(dctAmount))
    return fmt6(usdt)
  } catch { return '0' }
}

export async function transferDCT(to, amount) {
  const c = getDCTToken()
  const tx = await c.transfer(to, parse(amount))
  return await tx.wait()
}

export async function burnDCT(amount) {
  const c = getDCTToken()
  const tx = await c.burn(parse(amount))
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// 2. DCTBridge — Мост GemVault → DCT
// ═══════════════════════════════════════════════════

export async function getClaimableGems(address) {
  const c = getDCTRead('DCTBridge', DCTBRIDGE_ABI)
  if (!c) return { purchaseIds: [], marketValues: [], estimatedDCT: [] }
  try {
    const result = await c.getClaimableGems(address)
    return {
      purchaseIds: result.purchaseIds.map(Number),
      marketValues: result.marketValues.map(fmt6),
      estimatedDCT: result.estimatedDCT.map(fmt),
    }
  } catch { return { purchaseIds: [], marketValues: [], estimatedDCT: [] } }
}

export async function getClaimableMetals(address) {
  const c = getDCTRead('DCTBridge', DCTBRIDGE_ABI)
  if (!c) return { purchaseIds: [], marketValues: [], estimatedDCT: [] }
  try {
    const result = await c.getClaimableMetals(address)
    return {
      purchaseIds: result.purchaseIds.map(Number),
      marketValues: result.marketValues.map(fmt6),
      estimatedDCT: result.estimatedDCT.map(fmt),
    }
  } catch { return { purchaseIds: [], marketValues: [], estimatedDCT: [] } }
}

export async function isGemClaimed(purchaseId) {
  const c = getDCTRead('DCTBridge', DCTBRIDGE_ABI)
  if (!c) return false
  try { return await c.gemClaimed(purchaseId) } catch { return false }
}

export async function claimGemDCT(purchaseId) {
  const c = getDCT('DCTBridge', DCTBRIDGE_ABI)
  const tx = await c.claimGemDCT(purchaseId)
  return await tx.wait()
}

export async function claimAllGemDCT() {
  const c = getDCT('DCTBridge', DCTBRIDGE_ABI)
  const tx = await c.claimAllGemDCT()
  return await tx.wait()
}

export async function claimAllMetalDCT() {
  const c = getDCT('DCTBridge', DCTBRIDGE_ABI)
  const tx = await c.claimAllMetalDCT()
  return await tx.wait()
}

export async function processGemWithdrawal(purchaseId) {
  const c = getDCT('DCTBridge', DCTBRIDGE_ABI)
  const tx = await c.processGemWithdrawal(purchaseId)
  return await tx.wait()
}

export async function getBridgeBackingRate() {
  const c = getDCTRead('DCTBridge', DCTBRIDGE_ABI)
  if (!c) return 0
  try {
    const bp = await c.BACKING_RATE_BP()
    return Number(bp)
  } catch { return 0 }
}

// ═══════════════════════════════════════════════════
// 3. FractionalGem — Дробные камни (ERC-1155)
// ═══════════════════════════════════════════════════

// --- Прайс-лист ---

export async function getRegisteredCarats() {
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  if (!c) return []
  try {
    const carats = await c.getRegisteredCarats()
    return carats.map(Number)
  } catch { return [] }
}

export async function getGemPriceInfo(caratX100, certified = false) {
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  if (!c) return null
  try {
    const info = await c.getPriceInfo(caratX100, certified)
    return {
      cost: fmt6(info.cost),
      club: fmt6(info.club),
      wholesale: fmt6(info.ws),
      market: fmt6(info.mkt),
    }
  } catch { return null }
}

export async function getGemPriceTable() {
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  if (!c) return []
  try {
    const carats = await c.getRegisteredCarats()
    const table = []
    for (const carat of carats) {
      const [noCert, withCert] = await Promise.all([
        c.getPriceInfo(carat, false),
        c.getPriceInfo(carat, true),
      ])
      table.push({
        caratX100: Number(carat),
        carat: Number(carat) / 100,
        noCert: {
          cost: fmt6(noCert.cost),
          club: fmt6(noCert.club),
          wholesale: fmt6(noCert.ws),
          market: fmt6(noCert.mkt),
        },
        withCert: {
          cost: fmt6(withCert.cost),
          club: fmt6(withCert.club),
          wholesale: fmt6(withCert.ws),
          market: fmt6(withCert.mkt),
        },
      })
    }
    return table
  } catch { return [] }
}

// --- Лоты ---

export async function getFractionalLotCount() {
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  if (!c) return 0
  try {
    const count = await c.getLotCount()
    return Number(count)
  } catch { return 0 }
}

export async function getFractionalLot(lotId) {
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  if (!c) return null
  try {
    const { l, sr, tv } = await c.getLotInfo(lotId)
    // Статусы: 0=CREATED, 1=FUNDRAISING, 2=FUNDED, 3=JEWELRY, 4=FOR_SALE, 5=SOLD, 6=CANCELLED
    const statusNames = ['CREATED', 'FUNDRAISING', 'FUNDED', 'JEWELRY', 'FOR_SALE', 'SOLD', 'CANCELLED']
    const certLabNames = ['NONE', 'GIA', 'AGS', 'IGI', 'HRD', 'GCAL']
    return {
      lotId: Number(l.lotId),
      gemId: Number(l.gemId),
      caratX100: Number(l.caratX100),
      carat: Number(l.caratX100) / 100,
      name: l.name,
      imageURI: l.imageURI,
      certified: l.certified,
      certLab: certLabNames[Number(l.certLab)] || 'UNKNOWN',
      certNumber: l.certNumber,
      totalFractions: Number(l.totalFractions),
      soldFractions: Number(l.soldFractions),
      fractionPriceDCT: fmt(l.fractionPriceDCT),
      stakingAPR: Number(l.stakingAPR) / 100, // BP → %
      stakingDays: Number(l.stakingDays),
      status: Number(l.status),
      statusName: statusNames[Number(l.status)] || 'UNKNOWN',
      createdAt: Number(l.createdAt),
      fundraisingEndedAt: Number(l.fundraisingEndedAt),
      cyclesCompleted: Number(l.cyclesCompleted),
      jewelryCost: fmt6(l.jewelryCost),
      jewelryFunded: fmt6(l.jewelryFunded),
      stakingReserve: fmt6(sr),
      totalValue: fmt6(tv),
    }
  } catch { return null }
}

export async function getAllFractionalLots() {
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  if (!c) return []
  try {
    const count = Number(await c.getLotCount())
    const lots = []
    for (let i = 0; i < count && i < 100; i++) {
      const lot = await getFractionalLot(i)
      if (lot) lots.push(lot)
    }
    return lots
  } catch { return [] }
}

export async function getUserLotInfo(lotId, address) {
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  if (!c) return null
  try {
    const info = await c.getUserLotInfo(lotId, address)
    return {
      fractions: Number(info.fr),
      claimable: fmt6(info.cl),
      voted: info.v,
      ownershipPct: Number(info.pct) / 100, // BP → %
    }
  } catch { return null }
}

export async function getUserFractionBalance(lotId, address) {
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  if (!c) return 0
  try {
    const bal = await c.balanceOf(address, lotId)
    return Number(bal)
  } catch { return 0 }
}

export async function getClaimableStaking(lotId, address) {
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  if (!c) return '0'
  try {
    const amt = await c.getClaimableStaking(lotId, address)
    return fmt6(amt)
  } catch { return '0' }
}

// --- Покупка ---

export async function buyWholeGem(lotId) {
  // Оплата DCT — нужен approve DCT на FractionalGem
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  const lotInfo = await c.getLotInfo(lotId)
  const totalPrice = lotInfo.l.fractionPriceDCT * BigInt(lotInfo.l.totalFractions)
  await ensureDCTApproval(ADDRESSES.FractionalGem, totalPrice)
  const cw = getDCT('FractionalGem', FRACTIONALGEM_ABI)
  const tx = await cw.buyWholeGem(lotId)
  return await tx.wait()
}

export async function buyFractions(lotId, amount) {
  const c = getDCTRead('FractionalGem', FRACTIONALGEM_ABI)
  const lotInfo = await c.getLotInfo(lotId)
  const totalPrice = lotInfo.l.fractionPriceDCT * BigInt(amount)
  await ensureDCTApproval(ADDRESSES.FractionalGem, totalPrice)
  const cw = getDCT('FractionalGem', FRACTIONALGEM_ABI)
  const tx = await cw.buyFractions(lotId, amount)
  return await tx.wait()
}

export async function requestGemDelivery(purchaseId) {
  const c = getDCT('FractionalGem', FRACTIONALGEM_ABI)
  const tx = await c.requestDelivery(purchaseId)
  return await tx.wait()
}

// --- Стейкинг ---

export async function claimFractionalStaking(lotId) {
  const c = getDCT('FractionalGem', FRACTIONALGEM_ABI)
  const tx = await c.claimStaking(lotId)
  return await tx.wait()
}

// --- Голосование и продажа лота ---

export async function voteForLotSale(lotId) {
  const c = getDCT('FractionalGem', FRACTIONALGEM_ABI)
  const tx = await c.voteForSale(lotId)
  return await tx.wait()
}

export async function claimLotSaleProceeds(lotId) {
  const c = getDCT('FractionalGem', FRACTIONALGEM_ABI)
  const tx = await c.claimSaleProceeds(lotId)
  return await tx.wait()
}

// --- Ювелирка ---

export async function fundJewelryProduction(lotId, amountUSDT) {
  await ensureUSDTApproval(ADDRESSES.FractionalGem, parse6(amountUSDT))
  const c = getDCT('FractionalGem', FRACTIONALGEM_ABI)
  const tx = await c.fundJewelryProduction(lotId, parse6(amountUSDT))
  return await tx.wait()
}

// --- Трансфер фракций ---

export async function transferFractions(to, lotId, amount) {
  const c = getDCT('FractionalGem', FRACTIONALGEM_ABI)
  const tx = await c.safeTransferFrom(web3.address, to, lotId, amount, '0x')
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// 4. GemShowcase — Витрина продажи лотов
// ═══════════════════════════════════════════════════

export async function getGemShowcaseListings() {
  const c = getDCTRead('GemShowcase', GEMSHOWCASE_ABI)
  if (!c) return []
  try {
    const listings = await c.getActiveListings()
    return listings.map((l, i) => ({
      id: i, // индекс в массиве
      lotId: Number(l.lotId),
      salePrice: fmt6(l.salePrice),
      seller: l.seller,
      active: l.active,
      sold: l.sold,
    }))
  } catch { return [] }
}

export async function getGemShowcaseCount() {
  const c = getDCTRead('GemShowcase', GEMSHOWCASE_ABI)
  if (!c) return 0
  try {
    const count = await c.showcaseCount()
    return Number(count)
  } catch { return 0 }
}

export async function getGemShowcaseListing(id) {
  const c = getDCTRead('GemShowcase', GEMSHOWCASE_ABI)
  if (!c) return null
  try {
    const l = await c.showcaseListings(id)
    return {
      lotId: Number(l.lotId),
      salePrice: fmt6(l.salePrice),
      seller: l.seller,
      active: l.active,
      sold: l.sold,
    }
  } catch { return null }
}

export async function createGemShowcaseListing(lotId, salePriceUSDT) {
  const c = getDCT('GemShowcase', GEMSHOWCASE_ABI)
  const tx = await c.createShowcaseListing(lotId, parse6(salePriceUSDT))
  return await tx.wait()
}

export async function buyFromGemShowcase(listingId) {
  // Оплата USDT
  const c = getDCTRead('GemShowcase', GEMSHOWCASE_ABI)
  const listing = await c.showcaseListings(listingId)
  await ensureUSDTApproval(ADDRESSES.GemShowcase, listing.salePrice)
  const cw = getDCT('GemShowcase', GEMSHOWCASE_ABI)
  const tx = await cw.buyFromShowcase(listingId)
  return await tx.wait()
}

export async function cancelGemShowcaseListing(listingId) {
  const c = getDCT('GemShowcase', GEMSHOWCASE_ABI)
  const tx = await c.cancelShowcaseListing(listingId)
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// 5. DCTExchange — Биржа DCT/USDT
// ═══════════════════════════════════════════════════

export async function getExchangeStats() {
  const c = getDCTRead('DCTExchange', DCTEXCHANGE_ABI)
  if (!c) return null
  try {
    const s = await c.getExchangeStats()
    return {
      volumeDCT: fmt(s.volumeDCT),
      volumeUSDT: fmt6(s.volumeUSDT),
      burnedDCT: fmt(s.burnedDCT),
      trades: Number(s.trades),
      activeBuys: Number(s.activeBuys),
      activeSells: Number(s.activeSells),
      backingPrice: fmt(s.backingPrice),
    }
  } catch { return null }
}

export async function getExchangeBestPrices() {
  const c = getDCTRead('DCTExchange', DCTEXCHANGE_ABI)
  if (!c) return null
  try {
    const { bestBid, bestAsk } = await c.getBestPrices()
    return {
      bestBid: fmt(bestBid),
      bestAsk: fmt(bestAsk),
    }
  } catch { return null }
}

export async function getActiveSellOrders() {
  const c = getDCTRead('DCTExchange', DCTEXCHANGE_ABI)
  if (!c) return []
  try {
    const orders = await c.getActiveSellOrders()
    return orders.map(o => ({
      orderId: Number(o.orderId),
      maker: o.maker,
      dctAmount: fmt(o.dctAmount),
      dctFilled: fmt(o.dctFilled),
      pricePerDCT: fmt(o.pricePerDCT),
      createdAt: Number(o.createdAt),
    }))
  } catch { return [] }
}

export async function getActiveBuyOrders() {
  const c = getDCTRead('DCTExchange', DCTEXCHANGE_ABI)
  if (!c) return []
  try {
    const orders = await c.getActiveBuyOrders()
    return orders.map(o => ({
      orderId: Number(o.orderId),
      maker: o.maker,
      dctAmount: fmt(o.dctAmount),
      dctFilled: fmt(o.dctFilled),
      pricePerDCT: fmt(o.pricePerDCT),
      createdAt: Number(o.createdAt),
    }))
  } catch { return [] }
}

export async function createSellOrderDCT(dctAmount, pricePerDCT) {
  // Approve DCT на DCTExchange
  const amount = parse(dctAmount)
  await ensureDCTApproval(ADDRESSES.DCTExchange, amount)
  const c = getDCT('DCTExchange', DCTEXCHANGE_ABI)
  const tx = await c.createSellOrder(amount, parse(pricePerDCT))
  return await tx.wait()
}

export async function fillSellOrderDCT(orderId, dctAmount) {
  // Покупаем DCT за USDT — нужно рассчитать USDT
  const cRead = getDCTRead('DCTExchange', DCTEXCHANGE_ABI)
  const order = await cRead.orders(orderId)
  const usdtNeeded = (parse(dctAmount) * order.pricePerDCT) / parse('1')
  await ensureUSDTApproval(ADDRESSES.DCTExchange, usdtNeeded)
  const c = getDCT('DCTExchange', DCTEXCHANGE_ABI)
  const tx = await c.fillSellOrder(orderId, parse(dctAmount))
  return await tx.wait()
}

export async function createBuyOrderDCT(dctAmount, pricePerDCT) {
  // Approve USDT на DCTExchange
  const usdtNeeded = (parse(dctAmount) * parse(pricePerDCT)) / parse('1')
  // Конвертируем в 6 decimals для USDT
  const usdtAmount6 = ethers.parseUnits(ethers.formatEther(usdtNeeded), 6)
  await ensureUSDTApproval(ADDRESSES.DCTExchange, usdtAmount6)
  const c = getDCT('DCTExchange', DCTEXCHANGE_ABI)
  const tx = await c.createBuyOrder(parse(dctAmount), parse(pricePerDCT))
  return await tx.wait()
}

export async function fillBuyOrderDCT(orderId, dctAmount) {
  // Продаём DCT — approve DCT
  await ensureDCTApproval(ADDRESSES.DCTExchange, parse(dctAmount))
  const c = getDCT('DCTExchange', DCTEXCHANGE_ABI)
  const tx = await c.fillBuyOrder(orderId, parse(dctAmount))
  return await tx.wait()
}

export async function cancelExchangeOrder(orderId) {
  const c = getDCT('DCTExchange', DCTEXCHANGE_ABI)
  const tx = await c.cancelOrder(orderId)
  return await tx.wait()
}

export async function getExchangeTradeFee() {
  const c = getDCTRead('DCTExchange', DCTEXCHANGE_ABI)
  if (!c) return 0
  try {
    const bp = await c.TRADE_FEE_BP()
    return Number(bp) / 100 // BP → %
  } catch { return 0 }
}

// ═══════════════════════════════════════════════════
// 6. GemFractionDEX — DEX для фракций камней
// ═══════════════════════════════════════════════════

export async function getFractionDEXOrders(lotId) {
  const c = getDCTRead('GemFractionDEX', GEMFRACTIONDEX_ABI)
  if (!c) return []
  try {
    const orders = await c.getActiveSellOrders(lotId)
    return orders.map(o => ({
      orderId: Number(o.orderId),
      lotId: Number(o.lotId),
      seller: o.seller,
      fractions: Number(o.fractions),
      pricePerFractionDCT: fmt(o.pricePerFractionDCT),
      active: o.active,
      createdAt: Number(o.createdAt),
    }))
  } catch { return [] }
}

export async function getFractionDEXOrder(orderId) {
  const c = getDCTRead('GemFractionDEX', GEMFRACTIONDEX_ABI)
  if (!c) return null
  try {
    const o = await c.getOrder(orderId)
    return {
      orderId: Number(o.orderId),
      lotId: Number(o.lotId),
      seller: o.seller,
      fractions: Number(o.fractions),
      pricePerFractionDCT: fmt(o.pricePerFractionDCT),
      active: o.active,
      createdAt: Number(o.createdAt),
    }
  } catch { return null }
}

export async function createFractionSellOrder(lotId, fractions, priceDCT) {
  // Approve ERC-1155 фракций на GemFractionDEX
  await ensureFractionApproval(ADDRESSES.GemFractionDEX)
  const c = getDCT('GemFractionDEX', GEMFRACTIONDEX_ABI)
  const tx = await c.createSellOrder(lotId, fractions, parse(priceDCT))
  return await tx.wait()
}

export async function fillFractionSellOrder(orderId, fractions) {
  // Покупаем фракции за DCT — считаем стоимость
  const cRead = getDCTRead('GemFractionDEX', GEMFRACTIONDEX_ABI)
  const order = await cRead.getOrder(orderId)
  const totalDCT = order.pricePerFractionDCT * BigInt(fractions)
  await ensureDCTApproval(ADDRESSES.GemFractionDEX, totalDCT)
  const c = getDCT('GemFractionDEX', GEMFRACTIONDEX_ABI)
  const tx = await c.fillSellOrder(orderId, fractions)
  return await tx.wait()
}

export async function cancelFractionSellOrder(orderId) {
  const c = getDCT('GemFractionDEX', GEMFRACTIONDEX_ABI)
  const tx = await c.cancelSellOrder(orderId)
  return await tx.wait()
}

export async function getFractionDEXTradeFee() {
  const c = getDCTRead('GemFractionDEX', GEMFRACTIONDEX_ABI)
  if (!c) return 0
  try {
    const bp = await c.TRADE_FEE_BP()
    return Number(bp) / 100
  } catch { return 0 }
}

// ═══════════════════════════════════════════════════
// 7. DCTHeritage — Наследование
// ═══════════════════════════════════════════════════

export async function getHeritageInfo(address) {
  const c = getDCTRead('DCTHeritage', DCTHERITAGE_ABI)
  if (!c) return null
  try {
    const h = await c.getHeritage(address)
    return {
      active: h.active,
      executed: h.executed,
      lastActivity: Number(h.lastActivity),
      inactivityPeriod: Number(h.inactivityPeriod),
      inactivityDays: Number(h.inactivityPeriod) / 86400,
      canExecuteAt: Number(h.canExecuteAt),
      canExecuteNow: h.canExecuteNow,
      heirCount: Number(h.heirCount),
    }
  } catch { return null }
}

export async function getHeirs(address) {
  const c = getDCTRead('DCTHeritage', DCTHERITAGE_ABI)
  if (!c) return []
  try {
    const { wallets, shares, labels } = await c.getHeirs(address)
    return wallets.map((w, i) => ({
      wallet: w,
      shareBP: Number(shares[i]),
      sharePct: Number(shares[i]) / 100,
      label: labels[i],
    }))
  } catch { return [] }
}

export async function checkHeritageApprovals(address) {
  const c = getDCTRead('DCTHeritage', DCTHERITAGE_ABI)
  if (!c) return { dctApproved: false, fractionsApproved: false }
  try {
    const { dctApproved, fractionsApproved } = await c.checkApprovals(address)
    return { dctApproved, fractionsApproved }
  } catch { return { dctApproved: false, fractionsApproved: false } }
}

export async function estimateHeirShare(ownerAddress, heirAddress) {
  const c = getDCTRead('DCTHeritage', DCTHERITAGE_ABI)
  if (!c) return null
  try {
    const { dctAmount, fractionsTotal } = await c.estimateHeirShare(ownerAddress, heirAddress)
    return {
      dctAmount: fmt(dctAmount),
      fractionsTotal: Number(fractionsTotal),
    }
  } catch { return null }
}

export async function configureHeritage(wallets, sharesBP, labels, inactivityDays) {
  // Нужен approve DCT и ERC-1155 фракций на DCTHeritage
  const dct = getDCTToken()
  const dctRead = getDCTTokenRead()
  const balance = await dctRead.balanceOf(web3.address)
  if (balance > 0n) {
    await ensureDCTApproval(ADDRESSES.DCTHeritage, balance)
  }
  await ensureFractionApproval(ADDRESSES.DCTHeritage)
  const c = getDCT('DCTHeritage', DCTHERITAGE_ABI)
  const tx = await c.configureHeritage(wallets, sharesBP, labels, inactivityDays)
  return await tx.wait()
}

export async function cancelHeritage() {
  const c = getDCT('DCTHeritage', DCTHERITAGE_ABI)
  const tx = await c.cancelHeritage()
  return await tx.wait()
}

export async function pingHeritage() {
  const c = getDCT('DCTHeritage', DCTHERITAGE_ABI)
  const tx = await c.ping()
  return await tx.wait()
}

export async function executeHeritage(ownerAddress) {
  const c = getDCT('DCTHeritage', DCTHERITAGE_ABI)
  const tx = await c.executeHeritage(ownerAddress)
  return await tx.wait()
}

export async function getHeritageConstants() {
  const c = getDCTRead('DCTHeritage', DCTHERITAGE_ABI)
  if (!c) return null
  try {
    const [minInactivity, maxHeirs] = await Promise.all([
      c.MIN_INACTIVITY(),
      c.MAX_HEIRS(),
    ])
    return {
      minInactivityDays: Number(minInactivity) / 86400,
      maxHeirs: Number(maxHeirs),
    }
  } catch { return null }
}

// ═══════════════════════════════════════════════════
// СВОДНАЯ ЗАГРУЗКА DCT DASHBOARD
// ═══════════════════════════════════════════════════

export async function loadDCTDashboard(address) {
  const [
    tokenInfo,
    userInfo,
    claimableGems,
    claimableMetals,
    exchangeStats,
    bestPrices,
    heritageInfo,
    heritageApprovals,
  ] = await Promise.all([
    getDCTTokenInfo().catch(() => null),
    getDCTUserInfo(address).catch(() => null),
    getClaimableGems(address).catch(() => ({ purchaseIds: [], marketValues: [], estimatedDCT: [] })),
    getClaimableMetals(address).catch(() => ({ purchaseIds: [], marketValues: [], estimatedDCT: [] })),
    getExchangeStats().catch(() => null),
    getExchangeBestPrices().catch(() => null),
    getHeritageInfo(address).catch(() => null),
    checkHeritageApprovals(address).catch(() => ({ dctApproved: false, fractionsApproved: false })),
  ])

  return {
    tokenInfo,
    userInfo,
    claimableGems,
    claimableMetals,
    exchangeStats,
    bestPrices,
    heritageInfo,
    heritageApprovals,
  }
}
