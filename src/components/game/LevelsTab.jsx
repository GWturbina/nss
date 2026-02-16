'use client'
import { useState } from 'react'
import useGameStore from '@/lib/store'
import { LEVELS } from '@/lib/gameData'
import * as C from '@/lib/contracts'

export default function LevelsTab() {
  const { level, wallet, registered, setTab, addNotification, setTxPending, setLevel, t } = useGameStore()
  const [buying, setBuying] = useState(false)
  const [expandedLv, setExpandedLv] = useState(null)

  const handleBuy = async (lv) => {
    if (!wallet) { addNotification(`❌ ${t('connectWalletFirst')}`); return }
    setBuying(true)
    setTxPending(true)
    try {
      if (!registered) {
        addNotification(`⏳ ${t('registeringNSS')}`)
        await C.register(0)
        useGameStore.getState().updateRegistration(true, null)
      }
      addNotification(`⏳ ${t('buyingLevel')} ${lv.name}...`)
      await C.buyLevel(lv.id)
      setLevel(lv.id)
      addNotification(`✅ ${lv.name} ${t('levelActivated')}`)
    } catch (err) {
      const msg = err?.reason || err?.shortMessage || err?.message || t('error')
      addNotification(`❌ ${msg.slice(0, 80)}`)
    }
    setTxPending(false)
    setBuying(false)
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">🗺 {t('levelMap')}</h2>
        <p className="text-[11px] text-slate-500">{t('levelMapDesc')}</p>
      </div>

      <div className="px-3 mt-1 space-y-2">
        {LEVELS.map((lv, i) => {
          const isActive = level === i
          const isLocked = i > level + 1
          const isNext = i === level + 1
          const isOwned = i <= level
          const isExpanded = expandedLv === i

          return (
            <div key={i} onClick={() => !isLocked && setExpandedLv(isExpanded ? null : i)}
              className={`rounded-2xl border transition-all overflow-hidden ${isLocked ? 'opacity-40' : 'cursor-pointer'}`}
              style={{
                background: isActive ? `${lv.color}15` : 'var(--bg-card)',
                borderColor: isActive ? `${lv.color}40` : isNext ? `${lv.color}25` : 'var(--border)',
              }}>
              <div className="p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border flex-shrink-0"
                  style={{ borderColor: `${lv.color}40`, background: `${lv.color}15` }}>
                  {lv.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black" style={{ color: isOwned ? lv.color : 'var(--text)' }}>{lv.name}</span>
                    {isOwned && <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1.5 rounded-full font-bold">✓</span>}
                    {isActive && <span className="text-[9px] bg-gold-400/15 text-gold-400 px-1.5 rounded-full font-bold">⛏</span>}
                  </div>
                  <div className="text-[10px] text-slate-500">{lv.sub} • +{lv.nstPerTap} {t('nstPerTap')}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  {i === 0 ? (
                    <div className="text-[11px] font-bold text-slate-500">{t('free')}</div>
                  ) : (
                    <div className="text-[11px] font-bold" style={{ color: lv.color }}>{lv.price}</div>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 border-t" style={{ borderColor: `${lv.color}15` }}>
                  <div className="pt-2 text-[11px] text-slate-300 leading-relaxed">{lv.desc}</div>
                  <div className="mt-2 flex gap-2 text-[10px]">
                    <div className="flex-1 p-2 rounded-lg bg-white/5 text-center">
                      <div className="font-bold text-gold-400">{lv.team}</div>
                      <div className="text-slate-500">{t('partners')}</div>
                    </div>
                    <div className="flex-1 p-2 rounded-lg bg-white/5 text-center">
                      <div className="font-bold text-emerald-400">+{lv.nstBonus}</div>
                      <div className="text-slate-500">{t('nstBonus')}</div>
                    </div>
                    <div className="flex-1 p-2 rounded-lg bg-white/5 text-center">
                      <div className="font-bold text-purple-400">+{lv.cgtBonus}</div>
                      <div className="text-slate-500">{t('cgtBonus')}</div>
                    </div>
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400">💰 {t('income')}: {lv.earn}</div>

                  {isNext && (
                    <button onClick={(e) => { e.stopPropagation(); handleBuy(lv) }}
                      disabled={buying || isLocked}
                      className="mt-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all gold-btn"
                      style={{ opacity: buying ? 0.6 : 1 }}>
                      {buying ? `⏳ ${t('buying')}` : `🛒 ${t('buy')} ${lv.name} ${t('forPrice')} ${lv.price}`}
                    </button>
                  )}
                  {isOwned && !isActive && (
                    <div className="mt-2 text-center text-[10px] text-emerald-400 font-bold">✅ {t('passed')}</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
