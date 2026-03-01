'use client'
/**
 * GemConfigurator.jsx — Конфигуратор бриллиантов Diamond Club
 * 
 * Заменяет простой каталог камней на профессиональный конфигуратор
 * с фильтрами (форма, чистота, цвет, караты, сертификат).
 * 
 * Интеграция: вставляется в DiamondClubPage как замена GemsSection
 */
import { useState, useEffect, useMemo, useCallback } from 'react'
import useGameStore from '@/lib/store'
import {
  SHAPES, CLARITIES, WHITE_COLORS, FANCY_COLORS, FANCY_INTENSITIES, CERTIFICATES,
  CARAT_RANGE, calcWhitePrice, calcFancyPrice, formatUSD, gemSpecString
} from '@/lib/gemCatalog'
import { buyGemV2, ensureUSDTApproval } from '@/lib/diamondContracts'
import { safeCall } from '@/lib/contracts'

// ═══════════════════════════════════════════════════
// SVG ОГРАНКИ (inline, лёгкие)
// ═══════════════════════════════════════════════════

const ShapeSVG = ({ shape, size = 40, active = false }) => {
  const color = active ? '#ffd700' : 'rgba(255,255,255,0.3)'
  const sw = active ? 1.5 : 1
  const common = { stroke: color, strokeWidth: sw, fill: 'none' }
  const s = size
  const c = s / 2

  const shapes = {
    round: <circle cx={c} cy={c} r={c * 0.75} {...common} />,
    princess: <rect x={s * 0.15} y={s * 0.15} width={s * 0.7} height={s * 0.7} {...common} />,
    cushion: <rect x={s * 0.12} y={s * 0.12} width={s * 0.76} height={s * 0.76} rx={s * 0.18} {...common} />,
    oval: <ellipse cx={c} cy={c} rx={c * 0.55} ry={c * 0.78} {...common} />,
    emerald: <rect x={s * 0.18} y={s * 0.1} width={s * 0.64} height={s * 0.8} rx={s * 0.06} {...common} />,
    radiant: (
      <>
        <rect x={s * 0.15} y={s * 0.15} width={s * 0.7} height={s * 0.7} {...common} />
        <line x1={s * 0.15} y1={c} x2={s * 0.85} y2={c} {...common} strokeWidth={0.5} />
        <line x1={c} y1={s * 0.15} x2={c} y2={s * 0.85} {...common} strokeWidth={0.5} />
      </>
    ),
    marquise: <ellipse cx={c} cy={c} rx={c * 0.4} ry={c * 0.85} {...common} />,
    pear: (
      <path d={`M ${c} ${s * 0.08} 
        Q ${s * 0.85} ${s * 0.35} ${s * 0.75} ${s * 0.65} 
        Q ${s * 0.6} ${s * 0.92} ${c} ${s * 0.92} 
        Q ${s * 0.4} ${s * 0.92} ${s * 0.25} ${s * 0.65} 
        Q ${s * 0.15} ${s * 0.35} ${c} ${s * 0.08} Z`}
        {...common} />
    ),
    heart: (
      <path d={`M ${c} ${s * 0.9} 
        L ${s * 0.12} ${s * 0.42} 
        Q ${s * 0.05} ${s * 0.15} ${s * 0.28} ${s * 0.15} 
        Q ${c} ${s * 0.15} ${c} ${s * 0.35} 
        Q ${c} ${s * 0.15} ${s * 0.72} ${s * 0.15} 
        Q ${s * 0.95} ${s * 0.15} ${s * 0.88} ${s * 0.42} Z`}
        {...common} />
    ),
    asscher: (
      <>
        <rect x={s * 0.15} y={s * 0.15} width={s * 0.7} height={s * 0.7} {...common} />
        <rect x={s * 0.28} y={s * 0.28} width={s * 0.44} height={s * 0.44} {...common} strokeWidth={0.5} />
      </>
    ),
    trillion: (
      <polygon points={`${c},${s * 0.1} ${s * 0.88},${s * 0.85} ${s * 0.12},${s * 0.85}`} {...common} />
    ),
  }

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      {shapes[shape] || shapes.round}
      {active && (
        <circle cx={c} cy={c} r={c * 0.85} stroke="#ffd700" strokeWidth={0.3} fill="none" opacity={0.3}>
          <animate attributeName="r" values={`${c * 0.8};${c * 0.88};${c * 0.8}`} dur="2s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  )
}

// ═══════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════

export default function GemConfigurator() {
  const { wallet, t, addNotification, setTxPending, txPending } = useGameStore()

  // Конфигурация
  const [gemType, setGemType] = useState('white') // white | fancy
  const [shape, setShape] = useState('round')
  const [clarity, setClarity] = useState('VS1')
  const [color, setColor] = useState('G')           // для белых
  const [fancyColor, setFancyColor] = useState('fancy_yellow')
  const [intensity, setIntensity] = useState('fancy')
  const [carats, setCarats] = useState(1.0)
  const [cert, setCert] = useState('GIA')
  const [fractions, setFractions] = useState(1)       // доли
  const [totalFractions, setTotalFractions] = useState(10)

  // Расчёт цены
  const price = useMemo(() => {
    if (gemType === 'white') {
      return calcWhitePrice(shape, clarity, color, carats, cert)
    } else {
      return calcFancyPrice(shape, fancyColor, intensity, clarity, carats, cert)
    }
  }, [gemType, shape, clarity, color, fancyColor, intensity, carats, cert])

  // Цена за долю
  const fractionPrice = useMemo(() => {
    if (!price) return 0
    return Math.round(price.clubPrice * fractions / totalFractions)
  }, [price, fractions, totalFractions])

  // Покупка
  const handleBuy = async (buyFractions = false) => {
    if (!wallet) {
      addNotification('❌ ' + t('connectWallet'))
      return
    }
    if (!price) {
      addNotification('❌ ' + t('gcSelectAll'))
      return
    }

    const finalPrice = buyFractions ? fractionPrice : price.clubPrice
    const spec = gemSpecString({
      type: gemType,
      shape, clarity,
      color: gemType === 'white' ? color : undefined,
      fancyColor: gemType === 'fancy' ? fancyColor : undefined,
      intensity: gemType === 'fancy' ? intensity : undefined,
      carats, cert
    })

    setTxPending(true)
    const result = await safeCall(async () => {
      // TODO: Сопоставить с реальным gemId из контракта
      // Сейчас заглушка — реальный gemId будет назначен админом
      addNotification(`📋 ${t('gcOrderCreated')}: ${spec} — ${formatUSD(finalPrice)}`)
      return { ok: true }
    })
    setTxPending(false)

    if (result.ok) {
      addNotification(`✅ 💎 ${t('gcOrderSuccess')}`)
    }
  }

  return (
    <div className="px-3 mt-2 space-y-2">

      {/* ═══ ТИП БРИЛЛИАНТА ═══ */}
      <div className="flex gap-1 p-1 rounded-2xl bg-white/5">
        <button onClick={() => setGemType('white')}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
            gemType === 'white'
              ? 'bg-gradient-to-r from-white/15 to-white/5 text-white border border-white/20 shadow-lg shadow-white/5'
              : 'text-slate-500'
          }`}>
          ◇ {t('gcWhiteDiamond')}
        </button>
        <button onClick={() => setGemType('fancy')}
          className={`flex-1 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
            gemType === 'fancy'
              ? 'bg-gradient-to-r from-amber-500/15 to-pink-500/15 text-amber-300 border border-amber-500/20 shadow-lg shadow-amber-500/5'
              : 'text-slate-500'
          }`}>
          🌈 {t('gcFancyDiamond')}
        </button>
      </div>

      {/* ═══ ФОРМА ОГРАНКИ ═══ */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
          {t('gcShape')}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {SHAPES.map(s => (
            <button key={s.id} onClick={() => setShape(s.id)}
              className={`flex flex-col items-center py-2 rounded-xl transition-all ${
                shape === s.id
                  ? 'bg-gold-400/10 border border-gold-400/25 shadow-lg shadow-gold-400/5'
                  : 'bg-white/3 border border-transparent hover:bg-white/5'
              }`}>
              <ShapeSVG shape={s.id} size={32} active={shape === s.id} />
              <span className={`text-[8px] mt-1 font-bold ${
                shape === s.id ? 'text-gold-400' : 'text-slate-500'
              }`}>
                {t(`shape_${s.id}`) || s.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ ЧИСТОТА ═══ */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
          {t('gcClarity')}
        </div>
        <div className="flex gap-1">
          {CLARITIES.map(c => (
            <button key={c.id} onClick={() => setClarity(c.id)}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                clarity === c.id
                  ? 'bg-gold-400/12 border border-gold-400/25 text-gold-400'
                  : 'bg-white/3 border border-transparent text-slate-500 hover:bg-white/5'
              }`}>
              {c.id}
            </button>
          ))}
        </div>
        {/* Подсказка по выбранной чистоте */}
        <div className="mt-1.5 text-[9px] text-slate-500 text-center">
          {CLARITIES.find(c => c.id === clarity)?.descRu}
        </div>
      </div>

      {/* ═══ ЦВЕТ (БЕЛЫЕ) ═══ */}
      {gemType === 'white' && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
            {t('gcColor')}
          </div>
          <div className="flex gap-1">
            {WHITE_COLORS.map(c => {
              // Градиент от белого к слегка жёлтому
              const warmth = (c.tier - 1) * 12
              const bg = `rgb(${255 - warmth * 0.2}, ${255 - warmth * 0.5}, ${255 - warmth * 1.5})`
              return (
                <button key={c.id} onClick={() => setColor(c.id)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${
                    color === c.id
                      ? 'border border-gold-400/30 shadow-lg shadow-gold-400/5'
                      : 'border border-transparent hover:bg-white/5'
                  }`}>
                  <div className="w-4 h-4 rounded-full border border-white/15" style={{ background: bg }} />
                  <span className={`text-[10px] font-bold ${
                    color === c.id ? 'text-gold-400' : 'text-slate-500'
                  }`}>{c.id}</span>
                </button>
              )
            })}
          </div>
          <div className="mt-1.5 text-[9px] text-slate-500 text-center">
            {WHITE_COLORS.find(c => c.id === color)?.descRu}
          </div>
        </div>
      )}

      {/* ═══ ЦВЕТ (ФАНТАЗИЙНЫЕ) ═══ */}
      {gemType === 'fancy' && (
        <>
          <div className="p-3 rounded-2xl glass">
            <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
              {t('gcFancyColor')}
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {FANCY_COLORS.map(fc => (
                <button key={fc.id} onClick={() => setFancyColor(fc.id)}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-xl transition-all ${
                    fancyColor === fc.id
                      ? 'border border-white/20 shadow-lg'
                      : 'border border-transparent hover:bg-white/5'
                  }`}
                  style={fancyColor === fc.id ? { 
                    background: `${fc.hex}15`,
                    boxShadow: `0 4px 15px ${fc.hex}20`
                  } : {}}>
                  <div className="w-5 h-5 rounded-full border border-white/15"
                    style={{ background: fc.hex, boxShadow: `0 0 8px ${fc.hex}50` }} />
                  <span className={`text-[8px] font-bold ${
                    fancyColor === fc.id ? 'text-white' : 'text-slate-500'
                  }`}>{fc.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Интенсивность */}
          <div className="p-3 rounded-2xl glass">
            <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
              {t('gcIntensity')}
            </div>
            <div className="flex gap-1">
              {FANCY_INTENSITIES.map(fi => {
                const fc = FANCY_COLORS.find(c => c.id === fancyColor)
                const opacity = fi.id === 'faint' ? 0.3 : fi.id === 'light' ? 0.5 : fi.id === 'fancy' ? 0.7 : fi.id === 'deep' ? 0.95 : 1
                return (
                  <button key={fi.id} onClick={() => setIntensity(fi.id)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[8px] font-bold transition-all ${
                      intensity === fi.id
                        ? 'border border-white/20'
                        : 'border border-transparent hover:bg-white/5'
                    }`}
                    style={intensity === fi.id ? { background: `${fc?.hex || '#fff'}15` } : {}}>
                    <div className="w-3.5 h-3.5 rounded-full border border-white/10"
                      style={{ background: fc?.hex || '#fff', opacity }} />
                    <span className={intensity === fi.id ? 'text-white' : 'text-slate-500'}>
                      {fi.name}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* ═══ КАРАТЫ (СЛАЙДЕР) ═══ */}
      <div className="p-3 rounded-2xl glass">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {t('gcCarats')}
          </div>
          <div className="text-[14px] font-black text-gold-400">
            {carats.toFixed(2)} ct
          </div>
        </div>
        <input
          type="range"
          min={CARAT_RANGE.min}
          max={CARAT_RANGE.max}
          step={CARAT_RANGE.step}
          value={carats}
          onChange={e => setCarats(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #ffd700 ${(carats - CARAT_RANGE.min) / (CARAT_RANGE.max - CARAT_RANGE.min) * 100}%, rgba(255,255,255,0.08) 0%)`,
          }}
        />
        <div className="flex justify-between mt-1 text-[9px] text-slate-600">
          <span>{CARAT_RANGE.min} ct</span>
          <span>{CARAT_RANGE.max} ct</span>
        </div>
        {/* Быстрый выбор */}
        <div className="flex gap-1 mt-2">
          {[0.5, 1.0, 1.5, 2.0, 3.0, 5.0].map(v => (
            <button key={v} onClick={() => setCarats(v)}
              className={`flex-1 py-1 rounded-lg text-[9px] font-bold transition-all ${
                Math.abs(carats - v) < 0.05
                  ? 'bg-gold-400/12 text-gold-400 border border-gold-400/20'
                  : 'bg-white/3 text-slate-500 border border-transparent'
              }`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ СЕРТИФИКАТ ═══ */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
          {t('gcCertificate')}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {CERTIFICATES.map(c => (
            <button key={c.id} onClick={() => setCert(c.id)}
              className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${
                cert === c.id
                  ? 'bg-gold-400/10 border border-gold-400/20'
                  : 'bg-white/3 border border-transparent hover:bg-white/5'
              }`}>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                cert === c.id ? 'bg-gold-400/20 text-gold-400' : 'bg-white/5 text-slate-500'
              }`}>
                {c.id === 'none' ? '—' : '✓'}
              </div>
              <div>
                <div className={`text-[10px] font-bold ${cert === c.id ? 'text-gold-400' : 'text-slate-400'}`}>
                  {c.id === 'none' ? (t('gcNoCert') || 'Без серт.') : c.id}
                </div>
                {c.id !== 'none' && (
                  <div className="text-[8px] text-slate-600">{c.desc}</div>
                )}
              </div>
              {c.multiplier > 1 && (
                <div className="ml-auto text-[8px] font-bold text-emerald-400">
                  +{Math.round((c.multiplier - 1) * 100)}%
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ ЦЕНА + ПОКУПКА ═══ */}
      {price && (
        <div className="p-3 rounded-2xl border border-gold-400/20" 
          style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.05), rgba(255,215,0,0.02))' }}>
          
          {/* Итоговая конфигурация */}
          <div className="flex items-center gap-2 mb-3">
            <ShapeSVG shape={shape} size={36} active={true} />
            <div className="flex-1">
              <div className="text-[11px] font-bold text-white">
                {gemType === 'white'
                  ? `${t(`shape_${shape}`) || SHAPES.find(s => s.id === shape)?.name} ${color} ${clarity}`
                  : `${FANCY_COLORS.find(c => c.id === fancyColor)?.name} ${FANCY_INTENSITIES.find(i => i.id === intensity)?.name}`
                }
              </div>
              <div className="text-[9px] text-slate-500">
                {carats} ct • {cert === 'none' ? (t('gcNoCert') || 'Без серт.') : cert}
              </div>
            </div>
          </div>

          {/* Цены */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2 rounded-xl bg-white/5">
              <div className="text-[8px] text-slate-500 mb-0.5">{t('gcMarketPrice')}</div>
              <div className="text-[13px] font-black text-slate-400 line-through">
                {formatUSD(price.marketPrice)}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-gold-400/8 border border-gold-400/15">
              <div className="text-[8px] text-gold-400/70 mb-0.5">{t('gcClubPrice')} (-{Math.round(price.discount * 100)}%)</div>
              <div className="text-[15px] font-black text-gold-400">
                {formatUSD(price.clubPrice)}
              </div>
            </div>
          </div>

          <div className="text-[9px] text-slate-500 text-center mb-3">
            {formatUSD(price.perCarat)} / {t('gcPerCarat')}
          </div>

          {/* Покупка целиком */}
          <button onClick={() => handleBuy(false)} disabled={txPending || !wallet}
            className="w-full py-3 rounded-xl text-[12px] font-bold gold-btn mb-1.5"
            style={{ opacity: (txPending || !wallet) ? 0.5 : 1 }}>
            {txPending ? '⏳...' : `💎 ${t('gcBuyFull')} — ${formatUSD(price.clubPrice)}`}
          </button>

          {/* Покупка долями */}
          <div className="flex gap-1.5 items-center">
            <div className="flex items-center gap-1 flex-1 p-2 rounded-xl bg-white/5">
              <input type="number" min={1} max={totalFractions - 1} value={fractions}
                onChange={e => setFractions(Math.min(totalFractions - 1, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-12 bg-transparent text-white text-[11px] font-bold outline-none text-center" />
              <span className="text-[9px] text-slate-500">/</span>
              <input type="number" min={2} max={100} value={totalFractions}
                onChange={e => setTotalFractions(Math.max(2, parseInt(e.target.value) || 10))}
                className="w-12 bg-transparent text-white text-[11px] font-bold outline-none text-center" />
              <span className="text-[8px] text-slate-500">{t('gcFractions')}</span>
            </div>
            <button onClick={() => handleBuy(true)} disabled={txPending || !wallet}
              className="py-2 px-3 rounded-xl text-[10px] font-bold border border-purple-500/25 bg-purple-500/10 text-purple-400"
              style={{ opacity: (txPending || !wallet) ? 0.5 : 1 }}>
              {formatUSD(fractionPrice)}
            </button>
          </div>
        </div>
      )}

      {/* Инфо */}
      <div className="p-2.5 rounded-2xl bg-white/3">
        <div className="text-[9px] text-slate-500 text-center leading-relaxed">
          {t('gcDisclaimer')}
        </div>
      </div>
    </div>
  )
}
