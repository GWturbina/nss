'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import { LEVELS } from '@/lib/gameData'
import { useBlockchain } from '@/lib/useBlockchain'
import { useTelegram } from '@/lib/useTelegram'
import * as C from '@/lib/contracts'

export default function MineTab() {
  const { level, localNst, nst, energy, maxEnergy, taps, registered, wallet,
    evapActive, evapSeconds, doTap, tickEvap, news, setTab, addNotification,
    setTxPending, txPending, setLevel, t } = useGameStore()
  const { connect } = useBlockchain()
  const { haptic, isInTelegram } = useTelegram()
  const lv = LEVELS[level]
  const nextLv = LEVELS[level + 1] || null
  const tapAreaRef = useRef(null)
  const [effects, setEffects] = useState([])
  const [thoughts, setThoughts] = useState([])
  const tapCountRef = useRef(0)
  const [buyingLevel, setBuyingLevel] = useState(false)
  const [showRegModal, setShowRegModal] = useState(false)
  const [sponsorInput, setSponsorInput] = useState('')
  const [registering, setRegistering] = useState(false)

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

  // Открыть модал регистрации если НЕ зарегистрирован в GlobalWay, иначе купить уровень
  const handleBuyNextLevel = () => {
    if (!wallet || !nextLv) return
    if (!registered) {
      // Пробуем взять реф. код из localStorage (Telegram startParam)
      const savedRef = typeof window !== 'undefined' ? localStorage.getItem('nss_ref') || '' : ''
      setSponsorInput(savedRef)
      setShowRegModal(true)
      return
    }
    // Уже зарегистрирован в GlobalWay — просто покупаем уровень
    doBuyLevel()
  }

  // Регистрация в NSS+GlobalWay с проверкой sponsorId
  const handleRegisterAndBuy = async () => {
    const sid = parseInt(sponsorInput)
    if (!sid || sid <= 0) {
      addNotification('❌ Введи корректный ID спонсора (число > 0)')
      return
    }
    setRegistering(true)
    setTxPending(true)
    try {
      addNotification(`⏳ Регистрация со спонсором #${sid}...`)
      // register() → NSSPlatform → вызывает bridge.registerUser → MatrixRegistry → GlobalWay
      await C.register(sid)
      useGameStore.getState().updateRegistration(true, sid)
      addNotification('✅ Регистрация успешна!')
      setShowRegModal(false)
      // Небольшая пауза для подтверждения блока, затем покупаем уровень
      await new Promise(r => setTimeout(r, 1500))
      await doBuyLevel()
    } catch (err) {
      const msg = err?.reason || err?.shortMessage || err?.message || 'Ошибка'
      // Понятные сообщения для частых ошибок
      if (msg.includes('Already registered')) {
        addNotification('ℹ️ Ты уже зарегистрирован! Покупаем уровень...')
        useGameStore.getState().updateRegistration(true, sid)
        setShowRegModal(false)
        await doBuyLevel()
      } else if (msg.includes('Sponsor not found') || msg.includes('Invalid sponsor')) {
        addNotification(`❌ Спонсор #${sid} не найден в GlobalWay. Уточни ID.`)
      } else {
        addNotification(`❌ ${msg.slice(0, 100)}`)
      }
    }
    setTxPending(false)
    setRegistering(false)
  }

  const doBuyLevel = async () => {
    if (!nextLv) return
    setBuyingLevel(true)
    setTxPending(true)
    try {
      addNotification(`⏳ ${t('buyingLevel')} ${nextLv.name}...`)
      await C.buyLevel(nextLv.id)
      // Обновляем уровень локально и через блокчейн
      setLevel(nextLv.id)
      // Рефреш через 2 сек чтобы GlobalWay подтвердил
      setTimeout(async () => {
        const newLevel = await C.getUserLevel(wallet).catch(() => 0)
        if (newLevel > 0) useGameStore.getState().setLevel(newLevel)
      }, 2000)
      addNotification(`✅ ${nextLv.name} ${t('levelActivated')}`)
    } catch (err) {
      const msg = err?.reason || err?.shortMessage || err?.message || t('error')
      if (msg.includes('Not registered')) {
        addNotification('❌ Требуется регистрация в GlobalWay')
        setShowRegModal(true)
      } else {
        addNotification(`❌ ${msg.slice(0, 80)}`)
      }
    }
    setTxPending(false)
    setBuyingLevel(false)
  }

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

      <div className="px-3 mt-2 space-y-1.5">
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
        {wallet && !registered && !showRegModal && (
          <button onClick={handleBuyNextLevel}
            className="w-full p-2.5 rounded-xl text-[11px] font-bold text-center bg-yellow-500/8 border border-yellow-500/25 text-yellow-400 hover:bg-yellow-500/12 transition-all">
            🆔 Зарегистрироваться в NSS и начать
          </button>
        )}

        {/* Модал регистрации */}
        {showRegModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pb-6 px-3" style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setShowRegModal(false)}>
            <div className="w-full max-w-[400px] rounded-3xl p-5 space-y-4"
              style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,215,0,0.25)' }}
              onClick={e => e.stopPropagation()}>
              <div className="text-center">
                <div className="text-2xl mb-1">🆔</div>
                <div className="text-sm font-black text-white">Регистрация в NSS</div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Введи ID спонсора (odixId из GlobalWay). Это тот кто тебя пригласил.
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 mb-1 block">ID спонсора (число):</label>
                <input
                  type="number"
                  value={sponsorInput}
                  onChange={e => setSponsorInput(e.target.value)}
                  placeholder="Например: 12345"
                  className="w-full p-3 rounded-xl text-sm text-white outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,215,0,0.2)' }}
                  autoFocus
                />
                {sponsorInput && parseInt(sponsorInput) <= 0 && (
                  <div className="text-[10px] text-red-400 mt-1">❌ ID должен быть больше 0</div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowRegModal(false)}
                  className="flex-1 py-3 rounded-2xl text-[11px] font-bold text-slate-400 border border-white/10">
                  Отмена
                </button>
                <button onClick={handleRegisterAndBuy}
                  disabled={registering || !sponsorInput || parseInt(sponsorInput) <= 0}
                  className="flex-1 py-3 rounded-2xl text-[11px] font-black gold-btn"
                  style={{ opacity: (!sponsorInput || parseInt(sponsorInput) <= 0 || registering) ? 0.5 : 1 }}>
                  {registering ? '⏳ Регистрация...' : '✅ Зарегистрироваться'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ КНОПКА ПОКУПКИ СЛЕДУЮЩЕГО РАНГА ═══ */}
        {wallet && nextLv && (
          <button onClick={handleBuyNextLevel} disabled={buyingLevel || txPending}
            className="w-full p-3 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] border-2 flex items-center justify-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${nextLv.color}20, ${nextLv.color}08)`,
              borderColor: `${nextLv.color}50`,
              color: nextLv.color,
              opacity: (buyingLevel || txPending) ? 0.6 : 1,
            }}>
            {buyingLevel ? (
              <span>⏳ {t('buying')}</span>
            ) : (
              <>
                <span className="text-lg">{nextLv.emoji}</span>
                <span>{t('buy')} {nextLv.name}</span>
                <span className="text-[11px] opacity-75">({nextLv.price})</span>
              </>
            )}
          </button>
        )}
        {wallet && !nextLv && level === 12 && (
          <div className="p-2.5 rounded-xl text-[11px] font-bold text-center bg-gold-400/10 border border-gold-400/25 text-gold-400">
            👑 {t('maxLevelReached')}
          </div>
        )}
      </div>

      {nextLv && (
        <div className="px-3 mt-1.5">
          <div className="flex items-center justify-between text-[9px] mb-0.5">
            <span className="text-slate-500">{lv.emoji} Lv.{level} (+{lv.nstPerTap})</span>
            <span style={{ color: nextLv.color }} className="font-bold">{nextLv.emoji} {nextLv.name} (+{nextLv.nstPerTap})</span>
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: '100%', background: `linear-gradient(90deg, ${lv.color}, ${nextLv.color}40)` }} />
          </div>
        </div>
      )}

      <div ref={tapAreaRef} onClick={handleTap} onTouchStart={handleTap}
        className="flex-1 mx-3 my-2 rounded-2xl relative overflow-hidden flex items-center justify-center cursor-pointer select-none min-h-[200px] border border-white/5 transition-all duration-700"
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
