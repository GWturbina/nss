'use client'
/**
 * MyHouseProgress — Личная визуализация накопления на свой дом
 * 
 * Показывает:
 * - Сколько заработано (из RealEstateMatrix — totalEarned по 3 столам)
 * - Сколько нужно (35% от целевой стоимости дома)
 * - Прогресс-бар + анимированная SVG стройка
 * - Сколько осталось заработать
 * 
 * 35% — базовый порог из LoanThresholdManager
 * Если пользователь сжигал CHT — порог может быть ниже (до 35%)
 */
import { useState, useEffect } from 'react'
import useGameStore from '@/lib/store'
import * as Loan from '@/lib/loanContracts'
import HouseBuildVisualization from './HouseBuildVisualization'

const HOUSE_PRESETS = [
  { price: 30000, label: 'Студия 25м²', emoji: '🏢' },
  { price: 50000, label: 'Однушка 40м²', emoji: '🏠' },
  { price: 80000, label: 'Двушка 60м²', emoji: '🏡' },
  { price: 120000, label: 'Дом 80м²', emoji: '🏘' },
  { price: 200000, label: 'Дом 120м²', emoji: '🏰' },
]

export default function MyHouseProgress() {
  const { wallet, tables, totalSqm, houseStatus, bnbPrice, t } = useGameStore()
  const [targetPrice, setTargetPrice] = useState(80000)
  const [thresholdBP, setThresholdBP] = useState(3500) // 35% по умолчанию
  const [loanInfo, setLoanInfo] = useState(null)
  const [showPresets, setShowPresets] = useState(false)
  const [customPrice, setCustomPrice] = useState('')

  // Загрузка порога из LoanThresholdManager
  useEffect(() => {
    if (!wallet) return
    Loan.getUserInfo(wallet).then(info => {
      if (info) {
        setLoanInfo(info)
        setThresholdBP(info.thresholdBP || 3500)
      }
    }).catch(() => {})
    Loan.getUserThreshold(wallet).then(bp => {
      if (bp > 0) setThresholdBP(bp)
    }).catch(() => {})
  }, [wallet])

  // Заработано из 3 столов (суммарно)
  const totalEarned = tables.reduce((sum, tb) => sum + parseFloat(tb.earned || 0), 0)

  // Порог в %
  const thresholdPct = thresholdBP / 100 // 35.0
  const depositNeeded = targetPrice * (thresholdPct / 100) // 35% от цены
  const clubLoan = targetPrice - depositNeeded // 65% займ от клуба

  // Прогресс
  const progress = depositNeeded > 0 ? Math.min(totalEarned / depositNeeded, 1) : 0
  const remaining = Math.max(depositNeeded - totalEarned, 0)
  const progressPct = (progress * 100).toFixed(1)

  // Сколько снижено порога через CHT
  const reductionPct = loanInfo ? (loanInfo.reductionBP / 100).toFixed(1) : '0'
  const burnedCHT = loanInfo ? parseFloat(loanInfo.totalBurned).toFixed(0) : '0'

  return (
    <div className="space-y-3">

      {/* ═══ ВИЗУАЛИЗАЦИЯ СТРОЙКИ ═══ */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <HouseBuildVisualization
          totalSqm={totalEarned}
          targetSqm={depositNeeded}
          houseStatus={houseStatus}
        />
      </div>

      {/* ═══ ПРОГРЕСС ДЕПОЗИТА ═══ */}
      <div className="p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-black text-white">🏠 Мой дом</div>
          <div className="text-[10px] px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(255,215,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.2)' }}>
            Порог: {thresholdPct}%
          </div>
        </div>

        {/* Прогресс-бар */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-slate-400">Заработано</span>
            <span className="text-white font-bold">${totalEarned.toFixed(2)} из ${depositNeeded.toFixed(0)}</span>
          </div>
          <div className="h-4 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-1000 relative"
              style={{
                width: `${Math.max(progress * 100, 2)}%`,
                background: progress >= 1
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : progress >= 0.5
                    ? 'linear-gradient(90deg, #3b82f6, #10b981)'
                    : 'linear-gradient(90deg, #f59e0b, #3b82f6)',
              }}>
              {progress > 0.1 && (
                <span className="absolute right-2 top-0 h-full flex items-center text-[9px] font-bold text-white">
                  {progressPct}%
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Детали */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div className="text-[10px] text-slate-400">Твой депозит ({thresholdPct}%)</div>
            <div className="text-[15px] font-black text-blue-400">${depositNeeded.toLocaleString()}</div>
          </div>
          <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="text-[10px] text-slate-400">Займ от клуба ({(100 - thresholdPct).toFixed(0)}%)</div>
            <div className="text-[15px] font-black text-emerald-400">${clubLoan.toLocaleString()}</div>
          </div>
        </div>

        {/* Осталось */}
        {progress < 1 ? (
          <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)' }}>
            <div className="text-[11px] text-slate-400">Осталось заработать:</div>
            <div className="text-xl font-black text-orange-400">${remaining.toFixed(2)}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              через 3 бизнеса (${totalEarned.toFixed(2)} уже заработано)
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <div className="text-2xl mb-1">🎉</div>
            <div className="text-[13px] font-black text-emerald-400">Депозит накоплен!</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Можно подать заявку на дом стоимостью ${targetPrice.toLocaleString()}
            </div>
          </div>
        )}

        {/* Снижение порога CHT */}
        {loanInfo && parseFloat(loanInfo.totalBurned) > 0 && (
          <div className="mt-2 p-2 rounded-lg text-[10px] text-slate-400" style={{ background: 'rgba(168,85,247,0.05)' }}>
            🔥 Сожжено {burnedCHT} CHT → порог снижен на {reductionPct}%
          </div>
        )}
      </div>

      {/* ═══ ВЫБОР СТОИМОСТИ ДОМА ═══ */}
      <div className="p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => setShowPresets(!showPresets)}
          className="w-full flex items-center justify-between text-[12px]">
          <span className="text-slate-400">🏷 Стоимость дома: <b className="text-white">${targetPrice.toLocaleString()}</b></span>
          <span className="text-slate-500">{showPresets ? '▲' : '▼'}</span>
        </button>

        {showPresets && (
          <div className="mt-3 space-y-1.5">
            {HOUSE_PRESETS.map((p) => (
              <button key={p.price} onClick={() => { setTargetPrice(p.price); setShowPresets(false) }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all ${targetPrice === p.price ? 'border-yellow-500/30' : 'border-white/5'}`}
                style={{ background: targetPrice === p.price ? 'rgba(255,215,0,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${targetPrice === p.price ? 'rgba(255,215,0,0.25)' : 'rgba(255,255,255,0.05)'}` }}>
                <span className="text-lg">{p.emoji}</span>
                <div className="flex-1">
                  <div className="text-[11px] text-white font-bold">{p.label}</div>
                  <div className="text-[10px] text-slate-500">${p.price.toLocaleString()}</div>
                </div>
                <div className="text-[10px] text-slate-400">
                  депозит ${(p.price * thresholdPct / 100).toLocaleString()}
                </div>
              </button>
            ))}

            {/* Ручной ввод */}
            <div className="flex gap-2 mt-2">
              <input type="number" value={customPrice}
                onChange={e => setCustomPrice(e.target.value)}
                placeholder="Своя цена ($)"
                className="flex-1 p-2 rounded-xl text-[11px] text-white outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
              <button onClick={() => {
                const v = parseInt(customPrice)
                if (v > 0) { setTargetPrice(v); setShowPresets(false); setCustomPrice('') }
              }}
                className="px-4 rounded-xl text-[11px] font-bold"
                style={{ background: 'rgba(255,215,0,0.1)', color: '#ffd700', border: '1px solid rgba(255,215,0,0.2)' }}>
                ОК
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
