'use client'
/**
 * CHTExchange — Contract Service
 * Ордерная биржа CHT ↔ USDT
 * Создание/отмена/исполнение ордеров, комиссии, статистика
 */
import { ethers } from 'ethers'
import web3 from './web3'
import ADDRESSES from '@/contracts/addresses'
import ExchangeABIFile from '@/contracts/abi/CHTExchange.json'
import NSTTokenABIFile from '@/contracts/abi/NSTToken.json'

const ExchangeABI = ExchangeABIFile.abi || ExchangeABIFile
const NSTTokenABI = NSTTokenABIFile.abi || NSTTokenABIFile

import readProvider from './readProvider'

const fmt = ethers.formatEther
const parse = ethers.parseEther

// ═══════════════════════════════════════════════════
// READ
// ═══════════════════════════════════════════════════

function getReadContract() {
  return new ethers.Contract(ADDRESSES.CHTExchange, ExchangeABI, readProvider)
}

function getWriteContract() {
  if (!web3.signer) throw new Error('Кошелёк не подключён')
  return new ethers.Contract(ADDRESSES.CHTExchange, ExchangeABI, web3.signer)
}

/** Константы контракта */
export async function getExchangeConstants() {
  const c = getReadContract()
  const [minOrderCHT, minPriceUSDT, orderExpiry, tradeFeeBP] = await Promise.all([
    c.MIN_ORDER_CHT(),
    c.MIN_PRICE_USDT(),
    c.ORDER_EXPIRY(),
    c.TRADE_FEE_BP(),
  ])
  return {
    minOrderCHT: fmt(minOrderCHT),
    minPriceUSDT: fmt(minPriceUSDT),
    orderExpiry: Number(orderExpiry),           // секунды
    tradeFeeBP: Number(tradeFeeBP),             // 200 = 2%
  }
}

/** Best Bid / Best Ask */
export async function getBestPrices() {
  const c = getReadContract()
  try {
    const [bestBid, bestAsk] = await c.getBestPrices()
    return {
      bestBid: bestBid > 0n ? fmt(bestBid) : null,
      bestAsk: bestAsk > 0n ? fmt(bestAsk) : null,
    }
  } catch {
    return { bestBid: null, bestAsk: null }
  }
}

/** Статистика биржи */
export async function getExchangeStats() {
  const c = getReadContract()
  try {
    const stats = await c.getExchangeStats()
    return {
      totalTrades: Number(stats.totalTrades_),
      totalVolumeCHT: fmt(stats.totalVolumeCHT_),
      totalVolumeUSDT: fmt(stats.totalVolumeUSDT_),
      totalFees: fmt(stats.totalFees_),
      lockedCHT: fmt(stats.lockedCHT_),
      lockedUSDT: fmt(stats.lockedUSDT_),
    }
  } catch {
    return null
  }
}

/** Активные sell-ордера */
export async function getActiveSellOrders() {
  const c = getReadContract()
  try {
    const orders = await c.getActiveSellOrders()
    return orders.map(parseOrder)
  } catch { return [] }
}

/** Активные buy-ордера */
export async function getActiveBuyOrders() {
  const c = getReadContract()
  try {
    const orders = await c.getActiveBuyOrders()
    return orders.map(parseOrder)
  } catch { return [] }
}

/** Ордера пользователя */
export async function getUserOrders(address) {
  const c = getReadContract()
  try {
    const orders = await c.getUserOrders(address)
    return orders.map(parseOrder)
  } catch { return [] }
}

/** Парсинг ордера из контракта */
function parseOrder(o) {
  return {
    id: Number(o.id),
    orderType: Number(o.orderType),   // 0=SELL, 1=BUY
    maker: o.maker,
    chtAmount: fmt(o.chtAmount),
    chtFilled: fmt(o.chtFilled),
    pricePerCHT: fmt(o.pricePerCHT),
    createdAt: Number(o.createdAt),
    active: o.active,
    // Вычисленные
    remaining: fmt(o.chtAmount - o.chtFilled),
    totalUSDT: fmt((o.chtAmount - o.chtFilled) * o.pricePerCHT / (10n ** 18n)),
  }
}

// ═══════════════════════════════════════════════════
// WRITE
// ═══════════════════════════════════════════════════

/** Approve CHT → CHTExchange (для продажи) */
export async function approveCHTForExchange(amount) {
  const nst = new ethers.Contract(ADDRESSES.NSTToken, NSTTokenABI, web3.signer)
  const tx = await nst.approve(ADDRESSES.CHTExchange, parse(amount))
  return await tx.wait()
}

/** Approve USDT → CHTExchange (для покупки) */
export async function approveUSDTForExchange(amount) {
  const usdt = new ethers.Contract(ADDRESSES.USDT, [
    'function approve(address,uint256) returns (bool)',
    'function allowance(address,address) view returns (uint256)',
  ], web3.signer)
  const tx = await usdt.approve(ADDRESSES.CHTExchange, parse(amount))
  return await tx.wait()
}

/** Проверить allowance CHT → CHTExchange */
export async function getCHTAllowance(address) {
  const nst = new ethers.Contract(ADDRESSES.NSTToken, NSTTokenABI, readProvider)
  const allowance = await nst.allowance(address, ADDRESSES.CHTExchange)
  return fmt(allowance)
}

/** Проверить allowance USDT → CHTExchange */
export async function getUSDTAllowance(address) {
  const usdt = new ethers.Contract(ADDRESSES.USDT, [
    'function allowance(address,address) view returns (uint256)',
  ], readProvider)
  const allowance = await usdt.allowance(address, ADDRESSES.CHTExchange)
  return fmt(allowance)
}

/** Создать sell-ордер */
export async function createSellOrder(chtAmount, pricePerCHT) {
  const c = getWriteContract()
  const tx = await c.createSellOrder(parse(chtAmount), parse(pricePerCHT))
  return await tx.wait()
}

/** Создать buy-ордер */
export async function createBuyOrder(chtAmount, pricePerCHT) {
  const c = getWriteContract()
  const tx = await c.createBuyOrder(parse(chtAmount), parse(pricePerCHT))
  return await tx.wait()
}

/** Исполнить sell-ордер (купить CHT) */
export async function fillSellOrder(orderId, chtAmount) {
  const c = getWriteContract()
  const tx = await c.fillSellOrder(orderId, parse(chtAmount))
  return await tx.wait()
}

/** Исполнить buy-ордер (продать CHT) */
export async function fillBuyOrder(orderId, chtAmount) {
  const c = getWriteContract()
  const tx = await c.fillBuyOrder(orderId, parse(chtAmount))
  return await tx.wait()
}

/** Отменить свой ордер */
export async function cancelOrder(orderId) {
  const c = getWriteContract()
  const tx = await c.cancelOrder(orderId)
  return await tx.wait()
}

/** Отменить просроченный ордер (может кто угодно) */
export async function cancelExpiredOrder(orderId) {
  const c = getWriteContract()
  const tx = await c.cancelExpiredOrder(orderId)
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// ХЕЛПЕРЫ
// ═══════════════════════════════════════════════════

/** Рассчитать итого USDT для покупки с учётом комиссии */
export function calcBuyTotal(chtAmount, pricePerCHT, feeBP = 200) {
  const subtotal = parseFloat(chtAmount) * parseFloat(pricePerCHT)
  const fee = subtotal * feeBP / 10000
  return { subtotal: subtotal.toFixed(4), fee: fee.toFixed(4), total: (subtotal + fee).toFixed(4) }
}

/** Рассчитать итого USDT при продаже с учётом комиссии */
export function calcSellTotal(chtAmount, pricePerCHT, feeBP = 200) {
  const subtotal = parseFloat(chtAmount) * parseFloat(pricePerCHT)
  const fee = subtotal * feeBP / 10000
  return { subtotal: subtotal.toFixed(4), fee: fee.toFixed(4), total: (subtotal - fee).toFixed(4) }
}

/** Истёк ли ордер */
export function isOrderExpired(createdAt, expirySeconds) {
  const now = Math.floor(Date.now() / 1000)
  return now > createdAt + expirySeconds
}

/** Сколько осталось до истечения */
export function timeUntilExpiry(createdAt, expirySeconds) {
  const now = Math.floor(Date.now() / 1000)
  const diff = (createdAt + expirySeconds) - now
  if (diff <= 0) return 'Истёк'
  const hours = Math.floor(diff / 3600)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}д ${hours % 24}ч`
  const mins = Math.floor((diff % 3600) / 60)
  return `${hours}ч ${mins}м`
}
