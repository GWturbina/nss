'use client'
/**
 * LoanThresholdManager — Contract Service
 * Снижение порога займа через сжигание CHT
 * Ежемесячное погашение, штрафы, завершение
 */
import { ethers } from 'ethers'
import web3 from './web3'
import ADDRESSES from '@/contracts/addresses'
import LoanABIFile from '@/contracts/abi/LoanThresholdManager.json'
import NSTTokenABIFile from '@/contracts/abi/NSTToken.json'

const LoanABI = LoanABIFile.abi || LoanABIFile
const NSTTokenABI = NSTTokenABIFile.abi || NSTTokenABIFile

import readProvider from './readProvider'

const fmt = ethers.formatEther
const parse = ethers.parseEther

// ═══════════════════════════════════════════════════
// READ — через прямой RPC (без кошелька)
// ═══════════════════════════════════════════════════

function getReadContract() {
  return new ethers.Contract(ADDRESSES.LoanThresholdManager, LoanABI, readProvider)
}

function getWriteContract() {
  if (!web3.signer) throw new Error('Кошелёк не подключён')
  return new ethers.Contract(ADDRESSES.LoanThresholdManager, LoanABI, web3.signer)
}

/** Все константы контракта за один вызов */
export async function getContractConstants() {
  const c = getReadContract()
  const [
    baseThresholdBP, minThresholdBP, maxReductionBP,
    burnPerPercent, maxThresholdBurn, minBurnAmount,
    burnShareBP, freezeShareBP,
    monthlyBurnAmount, monthDuration, penaltyBP
  ] = await Promise.all([
    c.BASE_THRESHOLD_BP(),
    c.MIN_THRESHOLD_BP(),
    c.MAX_REDUCTION_BP(),
    c.BURN_PER_PERCENT(),
    c.MAX_THRESHOLD_BURN(),
    c.MIN_BURN_AMOUNT(),
    c.BURN_SHARE_BP(),
    c.FREEZE_SHARE_BP(),
    c.MONTHLY_BURN_AMOUNT(),
    c.MONTH_DURATION(),
    c.PENALTY_BP(),
  ])
  return {
    baseThresholdBP: Number(baseThresholdBP),       // 4500 = 45%
    minThresholdBP: Number(minThresholdBP),          // 3500 = 35%
    maxReductionBP: Number(maxReductionBP),          // 1000 = 10%
    burnPerPercent: fmt(burnPerPercent),              // 5000 CHT = 1%
    maxThresholdBurn: fmt(maxThresholdBurn),          // 50000 CHT = 10%
    minBurnAmount: fmt(minBurnAmount),                // min per tx
    burnShareBP: Number(burnShareBP),                 // 5000 = 50% сжигается
    freezeShareBP: Number(freezeShareBP),             // 5000 = 50% замораживается
    monthlyBurnAmount: fmt(monthlyBurnAmount),        // 5000 CHT/мес
    monthDuration: Number(monthDuration),             // секунды
    penaltyBP: Number(penaltyBP),                     // 100 = 1%
  }
}

/** Информация о пользователе */
export async function getUserInfo(address) {
  const c = getReadContract()
  const info = await c.getUserInfo(address)
  return {
    totalCommitted: fmt(info.totalCommitted),
    totalBurned: fmt(info.totalBurned),
    totalFrozen: fmt(info.totalFrozen),
    reductionBP: Number(info.reductionBP),
    thresholdBP: Number(info.thresholdBP),
    phase: Number(info.phase),                 // 0=IDLE, 1=REDUCING, 2=REPAYING, 3=COMPLETED
    loanAmount: fmt(info.loanAmount),
    monthlyBurnsDone: Number(info.monthlyBurnsDone),
    monthlyBurnsFrozen: fmt(info.monthlyBurnsFrozen),
    lastBurnTime: Number(info.lastBurnTime),
    missedMonths: Number(info.missedMonths),
    frozenReturned: fmt(info.frozenReturned),
  }
}

/** Текущий порог пользователя (в BP) */
export async function getUserThreshold(address) {
  const c = getReadContract()
  const bp = await c.getUserThreshold(address)
  return Number(bp)
}

/** Процент по займу пользователя (0%) */
export async function getUserLoanPercent(address) {
  const c = getReadContract()
  const bp = await c.getUserLoanPercent(address)
  return Number(bp)
}

/** Глобальная статистика */
export async function getStats() {
  const c = getReadContract()
  const stats = await c.getStats()
  return {
    totalUsers: Number(stats.totalUsers_),
    totalBurned: fmt(stats.totalBurned_),
    totalFrozen: fmt(stats.totalFrozen_),
    totalReturned: fmt(stats.totalReturned_),
    totalPenalties: fmt(stats.totalPenalties_),
    completedUsers: Number(stats.completedUsers_),
  }
}

// ═══════════════════════════════════════════════════
// WRITE — через кошелёк пользователя
// ═══════════════════════════════════════════════════

/** Approve CHT (NSTToken) → LoanThresholdManager */
export async function approveForLoan(amount) {
  const nst = new ethers.Contract(ADDRESSES.NSTToken, NSTTokenABI, web3.signer)
  const tx = await nst.approve(ADDRESSES.LoanThresholdManager, parse(amount))
  return await tx.wait()
}

/** Проверить allowance CHT → LoanThresholdManager */
export async function getAllowance(address) {
  const nst = new ethers.Contract(ADDRESSES.NSTToken, NSTTokenABI, readProvider)
  const allowance = await nst.allowance(address, ADDRESSES.LoanThresholdManager)
  return fmt(allowance)
}

/** Сжечь CHT для снижения порога */
export async function burnForThreshold(amount) {
  const c = getWriteContract()
  const tx = await c.burnForThreshold(parse(amount))
  return await tx.wait()
}

/** Ежемесячное сжигание (погашение) */
export async function monthlyBurn() {
  const c = getWriteContract()
  const tx = await c.monthlyBurn()
  return await tx.wait()
}

// ═══════════════════════════════════════════════════
// ХЕЛПЕРЫ
// ═══════════════════════════════════════════════════

/** Фазы на русском */
export const PHASE_NAMES = {
  0: 'Готов к снижению',
  1: 'Снижение порога',
  2: 'Погашение займа',
  3: 'Завершено',
}

/** Сколько % снижено */
export function reductionPercent(reductionBP) {
  return (reductionBP / 100).toFixed(1)
}

/** Текущий порог в % */
export function thresholdPercent(thresholdBP) {
  return (thresholdBP / 100).toFixed(1)
}

/** Сколько дней до следующего сжигания */
export function daysUntilNextBurn(lastBurnTime, monthDuration) {
  if (!lastBurnTime) return 0
  const nextBurn = lastBurnTime + monthDuration
  const now = Math.floor(Date.now() / 1000)
  const diff = nextBurn - now
  return diff > 0 ? Math.ceil(diff / 86400) : 0
}

/** Просрочен ли платёж */
export function isOverdue(lastBurnTime, monthDuration) {
  if (!lastBurnTime) return false
  const nextBurn = lastBurnTime + monthDuration
  const now = Math.floor(Date.now() / 1000)
  return now > nextBurn
}
