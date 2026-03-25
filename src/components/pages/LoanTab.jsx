'use client'
import { useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import * as Loan from '@/lib/loanContracts'
import { safeCall } from '@/lib/contracts'

export default function LoanTab() {
  const { wallet, addNotification, setTxPending, txPending, t } = useGameStore()
  const [userInfo, setUserInfo] = useState(null)
  const [constants, setConstants] = useState(null)
  const [allowance, setAllowance] = useState('0')
  const [burnAmount, setBurnAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  const loadData = useCallback(async () => {
    if (!wallet) { setLoading(false); return }
    setLoading(true)
    try {
      const [info, consts, allow, st] = await Promise.all([
        Loan.getUserInfo(wallet).catch(() => null),
        Loan.getContractConstants().catch(() => null),
        Loan.getAllowance(wallet).catch(() => '0'),
        Loan.getStats().catch(() => null),
      ])
      setUserInfo(info)
      setConstants(consts)
      setAllowance(allow)
      setStats(st)
    } catch {}
    setLoading(false)
  }, [wallet])

  useEffect(() => { loadData() }, [loadData])

  const handleApprove = async () => {
    if (!wallet) return
    setTxPending(true)
    const result = await safeCall(() => Loan.approveForLoan('999999999'))
    setTxPending(false)
    if (result.ok) {
      addNotification('✅ CHT одобрены для снижения порога')
      setAllowance('999999999')
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleBurn = async () => {
    if (!wallet || !burnAmount) return
    setTxPending(true)
    const result = await safeCall(() => Loan.burnForThreshold(burnAmount))
    setTxPending(false)
    if (result.ok) {
      addNotification(`🔥 Сожжено ${burnAmount} CHT для снижения порога!`)
      setBurnAmount('')
      loadData()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleMonthlyBurn = async () => {
    if (!wallet) return
    setTxPending(true)
    const result = await safeCall(() => Loan.monthlyBurn())
    setTxPending(false)
    if (result.ok) {
      addNotification('✅ Ежемесячное сжигание выполнено!')
      loadData()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const phase = userInfo?.phase ?? 0
  const needsApproval = parseFloat(allowance) < parseFloat(burnAmount || '5000')
  const overdue = userInfo && constants ? Loan.isOverdue(userInfo.lastBurnTime, constants.monthDuration) : false
  const daysLeft = userInfo && constants ? Loan.daysUntilNextBurn(userInfo.lastBurnTime, constants.monthDuration) : 0

  // Прогресс снижения: сколько CHT сожжено из 50 000
  const maxBurn = constants ? parseFloat(constants.maxThresholdBurn) : 50000
  const committed = userInfo ? parseFloat(userInfo.totalCommitted) : 0
  const burnProgress = maxBurn > 0 ? Math.min((committed / maxBurn) * 100, 100) : 0

  if (!wallet) {
    return (
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-3 pt-3 pb-1">
          <h2 className="text-lg font-black text-gold-400">🏗 Снижение порога</h2>
        </div>
        <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center">
          <div className="text-3xl mb-2">🔐</div>
          <div className="text-sm font-bold text-slate-300">{t('connectWallet')}</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="px-3 pt-3 pb-1">
          <h2 className="text-lg font-black text-gold-400">🏗 Снижение порога</h2>
        </div>
        <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center">
          <div className="text-lg animate-pulse">⏳ Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">🏗 Снижение порога займа</h2>
        <p className="text-[11px] text-slate-500">Сжигай CHT — получи больше от клуба</p>
      </div>

      {/* ═══ БЛОК 1 — Текущий статус ═══ */}
      <div className="mx-3 mt-2 p-3 rounded-2xl glass">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 rounded-lg bg-white/5 text-center">
            <div className="text-[10px] text-slate-500">Текущий порог</div>
            <div className="text-lg font-black text-gold-400">
              {userInfo ? Loan.thresholdPercent(userInfo.thresholdBP) : '45.0'}%
            </div>
          </div>
          <div className="p-2 rounded-lg bg-white/5 text-center">
            <div className="text-[10px] text-slate-500">Снижено на</div>
            <div className="text-lg font-black text-emerald-400">
              {userInfo ? Loan.reductionPercent(userInfo.reductionBP) : '0.0'}%
            </div>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-slate-500">CHT на снижение</span>
            <span className="text-gold-400">{committed.toFixed(0)} / {maxBurn.toFixed(0)}</span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 via-gold-400 to-emerald-500 transition-all"
              style={{ width: `${burnProgress}%` }} />
          </div>
          <div className="flex justify-between text-[9px] text-slate-600 mt-0.5">
            <span>🔥 Сожжено: {userInfo ? parseFloat(userInfo.totalBurned).toFixed(0) : '0'}</span>
            <span>🧊 Заморожено: {userInfo ? parseFloat(userInfo.totalFrozen).toFixed(0) : '0'}</span>
          </div>
        </div>

        <div className="p-2 rounded-lg bg-white/5 text-center">
          <div className="text-[10px] text-slate-500">Фаза</div>
          <div className="text-[12px] font-bold" style={{ color: phase === 3 ? '#10b981' : phase === 2 ? '#a855f7' : '#ffd700' }}>
            {Loan.PHASE_NAMES[phase] || 'Неизвестно'}
          </div>
        </div>
      </div>

      {/* ═══ БЛОК 2 — Снижение порога (phase 0 или 1) ═══ */}
      {(phase === 0 || phase === 1) && (
        <div className="mx-3 mt-2 p-3 rounded-2xl glass border-orange-500/15">
          <div className="text-[12px] font-bold text-orange-400 mb-2">🔥 Сжечь CHT для снижения порога</div>
          
          <div className="text-[10px] text-slate-400 mb-2">
            5 000 CHT = 1% снижения. 50% сжигается, 50% замораживается до погашения.
          </div>

          <input
            type="number"
            value={burnAmount}
            onChange={e => setBurnAmount(e.target.value)}
            placeholder="Количество CHT"
            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white font-bold text-center outline-none focus:border-orange-400/30 mb-2"
          />

          {/* Быстрые кнопки */}
          <div className="flex gap-1 mb-2">
            {['5000', '10000', '25000', '50000'].map(v => (
              <button key={v} onClick={() => setBurnAmount(v)}
                className="flex-1 py-1.5 rounded-lg text-[9px] font-bold border border-white/10 text-slate-400 hover:border-orange-400/30 hover:text-orange-400">
                {parseInt(v).toLocaleString()}
              </button>
            ))}
          </div>

          {burnAmount && (
            <div className="p-2 rounded-lg bg-white/5 mb-2 text-[10px] text-slate-400 text-center">
              ≈ {(parseFloat(burnAmount || 0) / 5000).toFixed(1)}% снижения •
              🔥 {(parseFloat(burnAmount || 0) * 0.5).toFixed(0)} сожжено •
              🧊 {(parseFloat(burnAmount || 0) * 0.5).toFixed(0)} заморожено
            </div>
          )}

          {needsApproval ? (
            <button onClick={handleApprove} disabled={txPending}
              className="w-full py-2.5 rounded-xl text-xs font-bold border border-orange-500/30 text-orange-400 bg-orange-500/10">
              {txPending ? '⏳...' : '🔓 Одобрить CHT'}
            </button>
          ) : (
            <button onClick={handleBurn} disabled={txPending || !burnAmount || parseFloat(burnAmount) <= 0}
              className="w-full py-2.5 rounded-xl text-xs font-bold gold-btn"
              style={{ opacity: (!burnAmount || txPending) ? 0.5 : 1 }}>
              {txPending ? '⏳...' : `🔥 Сжечь ${burnAmount || '0'} CHT`}
            </button>
          )}
        </div>
      )}

      {/* ═══ БЛОК 3 — Погашение (phase 2) ═══ */}
      {phase === 2 && (
        <div className="mx-3 mt-2 p-3 rounded-2xl glass border-purple-500/15">
          <div className="text-[12px] font-bold text-purple-400 mb-2">💳 Погашение займа</div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded-lg bg-white/5 text-center">
              <div className="text-[10px] text-slate-500">Сумма займа</div>
              <div className="text-sm font-bold text-white">${userInfo ? parseFloat(userInfo.loanAmount).toFixed(0) : '0'}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 text-center">
              <div className="text-[10px] text-slate-500">Платежей сделано</div>
              <div className="text-sm font-bold text-purple-400">{userInfo?.monthlyBurnsDone || 0}</div>
            </div>
          </div>

          {/* Таймер */}
          <div className={`p-2 rounded-lg text-center mb-3 ${overdue ? 'bg-red-500/10 border border-red-500/20' : 'bg-white/5'}`}>
            {overdue ? (
              <>
                <div className="text-[11px] font-bold text-red-400">⚠️ ПРОСРОЧЕНО!</div>
                <div className="text-[10px] text-red-300">
                  Пропущено: {userInfo?.missedMonths || 0} мес. • Штраф +1% от остатка займа
                </div>
              </>
            ) : (
              <>
                <div className="text-[10px] text-slate-500">До следующего сжигания</div>
                <div className="text-sm font-bold text-emerald-400">{daysLeft} дн.</div>
              </>
            )}
          </div>

          <div className="text-[10px] text-slate-400 mb-2 text-center">
            Ежемесячно: {constants ? parseFloat(constants.monthlyBurnAmount).toFixed(0) : '5 000'} CHT
            (50% сжигается, 50% замораживается)
          </div>

          <div className="p-2 rounded-lg bg-white/5 mb-2">
            <div className="text-[10px] text-slate-500">Заморожено при погашении</div>
            <div className="text-[12px] font-bold text-blue-400">{userInfo ? parseFloat(userInfo.monthlyBurnsFrozen).toFixed(0) : '0'} CHT</div>
          </div>

          {needsApproval ? (
            <button onClick={handleApprove} disabled={txPending}
              className="w-full py-2.5 rounded-xl text-xs font-bold border border-purple-500/30 text-purple-400 bg-purple-500/10">
              {txPending ? '⏳...' : '🔓 Одобрить CHT'}
            </button>
          ) : (
            <button onClick={handleMonthlyBurn} disabled={txPending}
              className="w-full py-2.5 rounded-xl text-xs font-bold gold-btn"
              style={{ opacity: txPending ? 0.5 : 1 }}>
              {txPending ? '⏳...' : `🔥 Ежемесячное сжигание (${constants ? parseFloat(constants.monthlyBurnAmount).toFixed(0) : '5000'} CHT)`}
            </button>
          )}
        </div>
      )}

      {/* ═══ БЛОК 4 — Завершено (phase 3) ═══ */}
      {phase === 3 && (
        <div className="mx-3 mt-2 p-3 rounded-2xl glass border-emerald-500/15">
          <div className="text-center">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-lg font-black text-emerald-400 mb-1">Займ полностью погашен!</div>
            <div className="text-[11px] text-slate-400 mb-3">
              Все замороженные CHT возвращены на ваш кошелёк
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-center">
              <div className="text-[10px] text-emerald-300">Возвращено CHT</div>
              <div className="text-xl font-black text-emerald-400">
                {userInfo ? parseFloat(userInfo.frozenReturned).toFixed(0) : '0'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ БЛОК 5 — Глобальная статистика ═══ */}
      {stats && (
        <div className="mx-3 mt-2 p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-blue-400 mb-2">📊 Статистика системы</div>
          <div className="grid grid-cols-3 gap-2">
            {[
              [stats.totalUsers, 'Участников'],
              [parseFloat(stats.totalBurned).toFixed(0), 'Сожжено CHT'],
              [parseFloat(stats.totalFrozen).toFixed(0), 'Заморожено CHT'],
              [parseFloat(stats.totalReturned).toFixed(0), 'Возвращено CHT'],
              [parseFloat(stats.totalPenalties).toFixed(0), 'Штрафов $'],
              [stats.completedUsers, 'Завершили'],
            ].map(([val, label], i) => (
              <div key={i} className="p-1.5 rounded-lg bg-white/5 text-center">
                <div className="text-[11px] font-bold text-white">{val}</div>
                <div className="text-[8px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Инструкция ═══ */}
      <div className="mx-3 mt-2 p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-slate-400 mb-2">📖 Как это работает</div>
        <div className="space-y-1.5 text-[10px] text-slate-400 leading-relaxed">
          <p><b className="text-white">1.</b> Стандартный порог — 45%. Ты вносишь 45%, клуб добавляет 55%.</p>
          <p><b className="text-white">2.</b> Сжигая CHT, снижаешь порог до 35%. Клуб добавит до 65%!</p>
          <p><b className="text-white">3.</b> 5 000 CHT = 1% снижения. Половина сжигается, половина замораживается.</p>
          <p><b className="text-white">4.</b> После получения займа — ежемесячно сжигаешь 5 000 CHT.</p>
          <p><b className="text-white">5.</b> После полного погашения — замороженные CHT возвращаются!</p>
          <p className="text-red-400"><b>⚠️</b> Пропуск платежа = +1% штрафа от остатка займа.</p>
        </div>
      </div>
    </div>
  )
}
