'use client'
import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import useGameStore from '@/lib/store'
import * as C from '@/lib/contracts'
import readProvider from '@/lib/readProvider'
import ADDRESSES from '@/contracts/addresses'
import RealEstateMatrixABI from '@/contracts/abi/RealEstateMatrix.json'

const fmt = (v) => { try { return parseFloat(ethers.formatEther(v)).toFixed(2) } catch { return '0.00' } }

const STEP_NAMES = [
  'Ожидание', 'Вход', 'Первая выплата', 'Реинвест', 'Вторая выплата',
  'Накопление', 'Третья выплата', 'Финальная выплата', 'Цикл завершён'
]

const TABLE_INFO = [
  { name: 'Малый Бизнес', price: 50, emoji: '💼', color: '#3498DB' },
  { name: 'Средний Бизнес', price: 250, emoji: '🏭', color: '#F39C12' },
  { name: 'Большой Бизнес', price: 1000, emoji: '🏙', color: '#e74c3c' },
]

export default function BusinessHistory() {
  const { wallet } = useGameStore()
  const [tables, setTables] = useState([null, null, null])
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [expandedTable, setExpandedTable] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!wallet) return
    loadData()
  }, [wallet])

  const loadData = async () => {
    if (!wallet) return
    setLoading(true)
    try {
      const data = await C.getUserAllTables(wallet)
      setTables(data || [null, null, null])
    } catch {}
    setLoading(false)
  }

  const loadHistory = async () => {
    if (!wallet || history.length > 0) { setShowHistory(true); return }
    setLoadingHistory(true)
    try {
      const abi = RealEstateMatrixABI.abi || RealEstateMatrixABI
      const contract = new ethers.Contract(ADDRESSES.RealEstateMatrix, abi, readProvider)
      const currentBlock = await readProvider.getBlockNumber()
      const fromBlock = Math.max(0, currentBlock - 5000000) // ~2 months on opBNB

      // Read events in parallel
      const [purchases, spillovers, sponsors, reinvests, withdrawals] = await Promise.all([
        contract.queryFilter(contract.filters.SlotPurchased(wallet), fromBlock).catch(() => []),
        contract.queryFilter(contract.filters.SpilloverPaid(wallet), fromBlock).catch(() => []),
        contract.queryFilter(contract.filters.SponsorPaid(wallet), fromBlock).catch(() => []),
        contract.queryFilter(contract.filters.ReinvestCreated(wallet), fromBlock).catch(() => []),
        contract.queryFilter(contract.filters.Withdrawal(wallet), fromBlock).catch(() => []),
      ])

      const events = []

      purchases.forEach(e => {
        events.push({
          type: 'purchase', emoji: '🛒', label: `Купил долю — ${TABLE_INFO[Number(e.args.table)]?.name || `Стол ${e.args.table}`}`,
          amount: `-$${fmt(e.args.price)}`, color: '#3b82f6',
          block: e.blockNumber, hash: e.transactionHash,
        })
      })

      spillovers.forEach(e => {
        events.push({
          type: 'income', emoji: '💰', label: `Доход (spillover Lv.${Number(e.args.level)})`,
          amount: `+$${fmt(e.args.amount)}`, color: '#10b981',
          block: e.blockNumber, hash: e.transactionHash,
        })
      })

      sponsors.forEach(e => {
        events.push({
          type: 'sponsor', emoji: '👥', label: 'Спонсорский бонус 10%',
          amount: `+$${fmt(e.args.amount)}`, color: '#f59e0b',
          block: e.blockNumber, hash: e.transactionHash,
        })
      })

      reinvests.forEach(e => {
        events.push({
          type: 'reinvest', emoji: '♻️', label: `Реинвест — ${TABLE_INFO[Number(e.args.table)]?.name || ''}`,
          amount: `$${fmt(e.args.amount)}`, color: '#a855f7',
          block: e.blockNumber, hash: e.transactionHash,
        })
      })

      withdrawals.forEach(e => {
        events.push({
          type: 'withdrawal', emoji: '💸', label: 'Вывод USDT',
          amount: `-$${fmt(e.args.amount)}`, color: '#ef4444',
          block: e.blockNumber, hash: e.transactionHash,
        })
      })

      // Sort by block (newest first)
      events.sort((a, b) => b.block - a.block)
      setHistory(events)
    } catch (err) {
      console.error('loadHistory:', err)
    }
    setLoadingHistory(false)
    setShowHistory(true)
  }

  if (!wallet) return null

  return (
    <div className="px-3 mt-2 space-y-2">
      {/* 3 бизнеса — детальные карточки */}
      <div className="text-[12px] font-bold text-gold-400 mb-1">📊 Мои бизнесы</div>

      {loading && <div className="text-center py-4 text-[11px] text-slate-500 animate-pulse">⏳ Загрузка...</div>}

      {TABLE_INFO.map((info, i) => {
        const t = tables[i]
        if (!t) return (
          <div key={i} className="p-3 rounded-2xl glass" style={{ opacity: 0.5 }}>
            <div className="flex items-center gap-2">
              <span className="text-xl">{info.emoji}</span>
              <div className="text-[11px] text-slate-500">{info.name} — не активен</div>
            </div>
          </div>
        )

        const totalEarned = fmt(t.totalEarned)
        const pendingBal = fmt(t.pendingBalance)
        const progress = fmt(t.phaseProgress)
        const slots = Number(t.slotsCount || 0)
        const paidSlots = Number(t.paidSlotsCount || 0)
        const reinvests = slots - paidSlots
        const step = Number(t.currentStep || 0)
        const totalInvested = paidSlots * info.price
        const roi = totalInvested > 0 ? ((parseFloat(totalEarned) / totalInvested) * 100).toFixed(0) : 0
        const isExpanded = expandedTable === i

        return (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${info.color}30` }}>
            <button onClick={() => setExpandedTable(isExpanded ? null : i)}
              className="w-full p-3 text-left flex items-center gap-3" style={{ background: `${info.color}08` }}>
              <span className="text-xl">{info.emoji}</span>
              <div className="flex-1">
                <div className="text-[12px] font-black" style={{ color: info.color }}>{info.name}</div>
                <div className="text-[9px] text-slate-500">{slots} долей • {reinvests} реинвестов</div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-black text-emerald-400">${totalEarned}</div>
                <div className="text-[9px] text-slate-500">заработано</div>
              </div>
              <span className="text-slate-500 text-[10px]">{isExpanded ? '▲' : '▼'}</span>
            </button>

            {isExpanded && (
              <div className="px-3 pb-3 space-y-2" style={{ background: `${info.color}04` }}>
                {/* Статистика */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-[12px] font-black text-emerald-400">${totalEarned}</div>
                    <div className="text-[8px] text-slate-500">Всего заработано</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-[12px] font-black text-gold-400">${pendingBal}</div>
                    <div className="text-[8px] text-slate-500">К выводу</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-[12px] font-black text-white">${totalInvested}</div>
                    <div className="text-[8px] text-slate-500">Вложено ({paidSlots} долей)</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-[12px] font-black" style={{ color: info.color }}>{roi}%</div>
                    <div className="text-[8px] text-slate-500">ROI</div>
                  </div>
                </div>

                {/* Текущий шаг */}
                <div className="p-2 rounded-lg bg-white/5">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-500">Текущий шаг:</span>
                    <span className="font-bold" style={{ color: info.color }}>{STEP_NAMES[step] || `Шаг ${step}`}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Прогресс фазы:</span>
                    <span className="text-white font-bold">${progress}</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Реинвестов:</span>
                    <span className="text-purple-400 font-bold">{reinvests}</span>
                  </div>
                  {t.waitingForChoice && (
                    <div className="mt-1 p-1.5 rounded-lg text-[9px] text-orange-400 font-bold bg-orange-500/5">
                      ⚠️ Ожидается выбор: продолжить или забрать
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Кнопка истории */}
      <button onClick={loadHistory} disabled={loadingHistory}
        className={`w-full py-2.5 rounded-xl text-[11px] font-bold border ${showHistory ? 'bg-blue-500/15 border-blue-500/25 text-blue-400' : 'border-white/8 text-slate-500'}`}>
        {loadingHistory ? '⏳ Загрузка из блокчейна...' : showHistory ? '▲ Скрыть историю' : '📜 История транзакций'}
      </button>

      {/* История транзакций */}
      {showHistory && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[11px] font-bold text-blue-400 mb-2">📜 Последние транзакции</div>

          {history.length === 0 && !loadingHistory && (
            <div className="text-center py-3 text-[10px] text-slate-500">Транзакций пока нет</div>
          )}

          <div className="space-y-1 max-h-[300px] overflow-y-auto">
            {history.map((ev, idx) => (
              <div key={idx} className="flex items-center gap-2 py-1.5 border-b border-white/5">
                <span className="text-sm">{ev.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold text-white truncate">{ev.label}</div>
                  <div className="text-[8px] text-slate-600 font-mono truncate">{ev.hash?.slice(0, 16)}...</div>
                </div>
                <div className="text-[11px] font-bold text-right" style={{ color: ev.color }}>{ev.amount}</div>
              </div>
            ))}
          </div>

          {history.length > 0 && (
            <div className="mt-2 text-center">
              <a href={`https://opbnb.bscscan.com/address/${wallet}`} target="_blank" rel="noopener"
                className="text-[9px] text-blue-400 hover:underline">
                Посмотреть все транзакции на BSCScan →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Обновить */}
      <button onClick={loadData} className="w-full py-2 rounded-xl text-[10px] font-bold text-slate-500 border border-white/5">
        🔄 Обновить
      </button>
    </div>
  )
}
