'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import { LEVELS } from '@/lib/gameData'
import { useBlockchain } from '@/lib/useBlockchain'
import { useTelegram } from '@/lib/useTelegram'

export default function MineTab() {
  const { level, localNst, nst, energy, maxEnergy, taps, registered, wallet,
    evapActive, evapSeconds, doTap, tickEvap, news, t } = useGameStore()
  const { connect } = useBlockchain()
  const { haptic, isInTelegram } = useTelegram()
  const lv = LEVELS[level]
  const tapAreaRef = useRef(null)
  const [effects, setEffects] = useState([])
  const [thoughts, setThoughts] = useState([])
  const tapCountRef = useRef(0)

  const totalNst = nst + localNst

  useEffect(() => {
    if (!evapActive || registered) return
    const interval = setInterval(() => {
      const result = tickEvap()
      if (result === 'expired') {
        showThought(t('stonesEvaporated'), 'ruby', '😱')
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [evapActive, registered, tickEvap, t])

  useEffect(() => {
    const interval = setInterval(() => useGameStore.getState().regenEnergy(), 10000)
    return () => clearInterval(interval)
  }, [])

  const showThought = useCallback((text, color, icon, shape = 'thought-pill') => {
    const id = Date.now() + Math.random()
    setThoughts(prev => [...prev, { id, text, color, icon, shape }])
    setTimeout(() => setThoughts(prev => prev.filter(t => t.id !== id)), 4500)
  }, [])

  const handleTap = useCallback((e) => {
    e.preventDefault()
    const earned = doTap()
    if (earned === null) return
    
    // Вибрация в Telegram
    if (isInTelegram) haptic('light')
    
    const rect = tapAreaRef.current.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    const id = Date.now() + Math.random()
    setEffects(prev => [...prev, { id, x, y, text: `+${earned}`, type: 'number' }])
    setTimeout(() => setEffects(prev => prev.filter(e => e.id !== id)), 700)
    if (Math.random() < 0.3) {
      const gid = id + 0.1
      const gems = ['💎', '✨', '🔶', '💠']
      setEffects(prev => [...prev, { id: gid, x: x + (Math.random() * 30 - 15), y: y + (Math.random() * 30 - 15), text: gems[Math.floor(Math.random() * 4)], type: 'gem' }])
      setTimeout(() => setEffects(prev => prev.filter(e => e.id !== gid)), 500)
    }
    tapCountRef.current++
    if (tapCountRef.current >= 14 + Math.floor(Math.random() * 6)) {
      tapCountRef.current = 0
      const shapes = ['thought-pill', 'thought-cloud', 'thought-crystal', 'thought-bubble']
      const shape = shapes[Math.floor(Math.random() * shapes.length)]
      showThought(lv.thought, lv.thoughtColor, lv.thoughtIcon, shape)
    }
  }, [doTap, lv, showThought, isInTelegram, haptic])

  const evapMin = Math.floor(evapSeconds / 60)
  const evapSec = evapSeconds % 60
  const toolSrc = `/icons/tools/${['hands','shovel','sieve','cart','auto','cutting','jewelry','building','earth','house','village','resort','empire'][level]}.png`

  return (
    <div className="flex flex-col flex-1">
      <div className="mx-3 mt-2 p-3 rounded-2xl border flex items-center gap-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 flex-shrink-0 overflow-hidden" style={{ borderColor: `${lv.color}50`, background: `${lv.color}12` }}>
          <img src={toolSrc} alt="" className="w-9 h-9 object-contain" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
          <span className="hidden text-2xl">{lv.emoji}</span>
        </div>
        <div className="flex-1">
          <div className="text-sm font-black text-white">{lv.name}</div>
          <div className="text-[10px] text-slate-400">{lv.sub} • Lv.{level}</div>
        </div>
        <div className="text-right">
          <div className="text-xl font-black font-display" style={{ color: lv.color }}>{totalNst.toFixed(1)}</div>
          <div className="text-[9px] text-slate-500">NST</div>
        </div>
      </div>

      <div className="px-3 mt-2">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-slate-400">⚡ {t('energy')}</span>
          <span className="text-emerald-400 font-extrabold">{energy}/{maxEnergy}</span>
        </div>
        <div className="h-[7px] rounded-full bg-white/5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500 relative overflow-hidden" style={{ width: `${(energy / maxEnergy) * 100}%`, background: `linear-gradient(90deg, ${lv.color}, ${lv.color}cc)` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>
        </div>
      </div>

      <div className="px-3 mt-2">
        {!wallet && taps === 0 && (
          <button onClick={connect} className="w-full p-2.5 rounded-xl text-xs font-bold text-center bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15 transition-all">
            🚀 {t('connectSaveStones')}
          </button>
        )}
        {!wallet && taps > 0 && (
          <button onClick={connect} className="w-full p-2.5 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 animate-pulse">
            ⚠️ {t('stonesEvaporating')} <span className="font-display text-lg">{evapMin}:{evapSec < 10 ? '0' : ''}{evapSec}</span> 💨
          </button>
        )}
        {wallet && !registered && (
          <div className="p-2.5 rounded-xl text-[11px] font-bold text-center bg-yellow-500/8 border border-yellow-500/15 text-yellow-400">
            💳 {t('walletConnected')}
          </div>
        )}
        {wallet && registered && level === 0 && (
          <div className="p-2.5 rounded-xl text-[11px] font-bold text-center bg-emerald-500/8 border border-emerald-500/15 text-emerald-400">
            ✅ {t('registeredBuyShovel')}
          </div>
        )}
      </div>

      <div ref={tapAreaRef} onClick={handleTap} onTouchStart={handleTap}
        className="flex-1 mx-3 my-2 rounded-2xl relative overflow-hidden flex items-center justify-center cursor-pointer select-none min-h-[240px] border border-white/5 transition-all duration-700"
        style={{ background: `radial-gradient(circle at 50% 60%, var(--lv-bg), #10101e)`, boxShadow: `inset 0 0 50px var(--lv-glow)` }}>
        <div className="relative z-10 active:animate-shake select-none transition-transform w-[100px] h-[100px] flex items-center justify-center">
          <img src={toolSrc} alt={lv.name} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }} />
          <span className="text-6xl hidden">{lv.emoji}</span>
        </div>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-[11px]" style={{ color: 'var(--muted)' }}>
          ⛏ {t('tapHint')} • +{lv.nstPerTap} {t('nstPerTap')}
        </div>
        {effects.map(ef => (
          <div key={ef.id} className={`absolute pointer-events-none z-20 ${ef.type === 'number' ? 'animate-tap-up font-black text-base' : 'animate-gem-burst text-lg'}`}
            style={{ left: ef.x, top: ef.y, color: ef.type === 'number' ? 'var(--gold)' : undefined, textShadow: ef.type === 'number' ? '0 0 8px rgba(255,184,0,0.4)' : 'none' }}>
            {ef.text}
          </div>
        ))}
        {thoughts.map(th => (
          <div key={th.id} className={`absolute z-30 px-3 py-2 text-xs font-bold max-w-[85%] pointer-events-none flex items-center gap-2 animate-thought thought-${th.color} ${th.shape}`} style={{ left: '8%', top: '30%' }}>
            <span className="text-xl flex-shrink-0">{th.icon}</span>
            <span className="leading-snug">{th.text}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-1.5 px-3 pb-2">
        <StatCard value={taps} label={t('taps')} color="text-gold-400" />
        <StatCard value={useGameStore.getState().cgt.toFixed(1)} label="CGT" color="text-emerald-400" />
        <StatCard value={parseFloat(useGameStore.getState().usdt || 0).toFixed(0)} label="USDT" color="text-blue-400" />
      </div>

      <div className="px-3 py-1.5 border-t border-white/5 overflow-hidden">
        <div className="flex gap-6 animate-[nscroll_20s_linear_infinite] whitespace-nowrap">
          {[...news, ...news].map((n, i) => (
            <span key={i} className="text-[10px] text-slate-500">📢 <span className="text-gold-400">{n}</span></span>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ value, label, color }) {
  return (
    <div className="glass rounded-xl p-2 text-center">
      <div className={`text-lg font-black font-display ${color}`}>{value}</div>
      <div className="text-[9px] text-slate-500">{label}</div>
    </div>
  )
}
