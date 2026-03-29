'use client'
import { useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import * as C from '@/lib/contracts'
import { shortAddress } from '@/lib/web3'
import { ethers } from 'ethers'
import HouseProgress from '@/components/game/HouseProgress'

export default function ClubHousesTab() {
  const { wallet, totalSqm, level, registered, addNotification, setTxPending, txPending } = useGameStore()

  // Бизнес-заработок
  const [bizEarnings, setBizEarnings] = useState([0, 0, 0])
  const [pending, setPending] = useState(0)
  const [threshold, setThreshold] = useState(45)
  const [housePrice, setHousePrice] = useState(120000)

  // Заявка
  const [application, setApplication] = useState(null)
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applyCity, setApplyCity] = useState('')
  const [applyCountry, setApplyCountry] = useState('')
  const [applyPrice, setApplyPrice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Клубные дома
  const [houses, setHouses] = useState([])
  const [loadingHouses, setLoadingHouses] = useState(true)
  const [expandedHouse, setExpandedHouse] = useState(null)
  const [buyingSlot, setBuyingSlot] = useState(null)

  // Показать/скрыть секции
  const [showClubHouses, setShowClubHouses] = useState(false)

  const TABLES = [
    { id: 0, price: 50, sqm: 0.05, color: '#3498DB', minLevel: 1 },
    { id: 1, price: 250, sqm: 0.25, color: '#F39C12', minLevel: 3 },
    { id: 2, price: 1000, sqm: 1.0, color: '#e74c3c', minLevel: 4 },
  ]

  useEffect(() => {
    if (!wallet) return

    C.getUserAllTables(wallet).then(tables => {
      if (tables) {
        setBizEarnings(tables.map(t => {
          if (!t) return 0
          try { return parseFloat(ethers.formatEther(t.totalEarned || 0)) } catch { return 0 }
        }))
      }
    }).catch(() => {})

    C.getWithdrawableAmount(wallet).then(amt => {
      if (amt) setPending(parseFloat(ethers.formatEther(amt)))
    }).catch(() => {})

    loadApplication()
    setThreshold(45)
  }, [wallet])

  useEffect(() => { loadHouses() }, [])

  const loadHouses = async () => {
    setLoadingHouses(true)
    try {
      const CH = await import('@/lib/clubHouses')
      const data = await CH.getClubHouses()
      const withPurchases = await Promise.all((data || []).map(async h => {
        const detail = await CH.getClubHouseWithPurchases(h.id).catch(() => null)
        return { ...h, purchased_sqm: detail?.purchased_sqm || 0, buyers: detail?.purchases?.length || 0 }
      }))
      setHouses(withPurchases)
    } catch { setHouses([]) }
    setLoadingHouses(false)
  }

  const loadApplication = async () => {
    try {
      const supabase = (await import('@/lib/supabase')).default
      if (!supabase || !wallet) return
      const { data } = await supabase.from('house_applications').select('*')
        .eq('wallet', wallet.toLowerCase()).order('created_at', { ascending: false }).limit(1).single()
      if (data) { setApplication(data); setHousePrice(parseFloat(data.house_price) || 120000) }
    } catch {}
  }

  const handleApply = async () => {
    if (!applyPrice || parseFloat(applyPrice) <= 0) { addNotification('❌ Укажите стоимость'); return }
    setSubmitting(true)
    try {
      const supabase = (await import('@/lib/supabase')).default
      if (!supabase) { addNotification('❌ Supabase не подключён'); setSubmitting(false); return }
      const { data, error } = await supabase.from('house_applications').insert({
        wallet: wallet.toLowerCase(), house_price: parseFloat(applyPrice),
        city: applyCity || null, country: applyCountry || null, threshold, status: 'pending',
      }).select().single()
      if (error) { addNotification(`❌ ${error.message}`); setSubmitting(false); return }
      setApplication(data); setHousePrice(parseFloat(applyPrice)); setShowApplyForm(false)
      addNotification('✅ Заявка на дом подана!')
    } catch (e) { addNotification(`❌ ${e.message}`) }
    setSubmitting(false)
  }

  const handleBuyHouse = async (house, table) => {
    if (!wallet) { addNotification('❌ Подключите кошелёк'); return }
    if (!registered) { addNotification('❌ Сначала зарегистрируйтесь'); return }
    if (level < table.minLevel) { addNotification(`❌ Нужен уровень ${table.minLevel}+`); return }
    setBuyingSlot(`${house.id}-${table.id}`); setTxPending(true)
    try {
      const result = await C.safeCall(() => C.buySlot(table.id))
      if (result.ok) {
        addNotification(`✅ Куплено ${table.sqm} м² в "${house.name}"!`)
        try { const CH = await import('@/lib/clubHouses'); await CH.recordPurchase({ house_id: house.id, wallet, sqm_purchased: table.sqm, amount_paid: table.price, tx_hash: result.tx?.hash || '', payment_type: 'usdt' }) } catch {}
        loadHouses()
      } else { addNotification(`❌ ${result.error || 'Ошибка'}`) }
    } catch (err) { addNotification(`❌ ${err?.message?.slice(0, 80) || 'Ошибка'}`) }
    setTxPending(false); setBuyingSlot(null)
  }

  const bizTotal = bizEarnings.reduce((s, v) => s + v, 0)
  const depositNeeded = housePrice * (threshold / 100)
  const loanAmount = housePrice - depositNeeded
  const progressPercent = depositNeeded > 0 ? Math.min((bizTotal / depositNeeded) * 100, 100) : 0
  const remaining = Math.max(depositNeeded - bizTotal, 0)

  const STATUS = {
    planning: { emoji: '📋', label: 'Планируется', color: '#f59e0b' },
    active: { emoji: '🏗', label: 'Строится', color: '#3b82f6' },
    building: { emoji: '🏗', label: 'Строится', color: '#3b82f6' },
    completed: { emoji: '✅', label: 'Построен', color: '#10b981' },
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">🏠 Дома</h2>
      </div>

      {/* Табы */}
      <div className="flex gap-1 px-3 mt-1">
        <button onClick={() => setShowClubHouses(false)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border ${!showClubHouses ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
          🏠 Мой дом
        </button>
        <button onClick={() => setShowClubHouses(true)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border ${showClubHouses ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
          🏘 Клубные дома ({houses.length})
        </button>
      </div>

      {/* ═══ МОЙ ДОМ ═══ */}
      {!showClubHouses && (
        <>
      {/* ═══ ВИЗУАЛИЗАЦИЯ ДОМА ═══ */}
      <div className="px-3 mt-2">
        <HouseProgress percent={progressPercent} />
      </div>

      {/* ═══ ПРОГРЕСС ЗАРАБОТКА ═══ */}
      <div className="px-3 mt-3">
        <div className="p-4 rounded-2xl glass">
          <div className="flex justify-between items-center mb-3">
            <div className="text-[13px] font-black text-white">🏠 Мой дом</div>
            <div className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
              Порог: {threshold}%
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-500">Заработано (USDT)</span>
              <span className="text-gold-400 font-bold">${bizTotal.toFixed(2)} из ${depositNeeded.toLocaleString()}</span>
            </div>
            <div className="h-3 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-1000" style={{
                width: `${progressPercent}%`,
                background: progressPercent >= 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ffd700, #f59e0b)'
              }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[9px] text-slate-500">Депозит ({threshold}%)</div>
              <div className="text-[15px] font-black text-gold-400">${depositNeeded.toLocaleString()}</div>
            </div>
            <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-[9px] text-slate-500">Займ ({100-threshold}%)</div>
              <div className="text-[15px] font-black text-emerald-400">${loanAmount.toLocaleString()}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)' }}>
            <div className="text-[9px] text-slate-500">Осталось заработать:</div>
            <div className="text-xl font-black" style={{ color: remaining > 0 ? '#ffd700' : '#10b981' }}>
              {remaining > 0 ? `$${remaining.toFixed(2)}` : '✅ Готово!'}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ ЗАРАБОТОК ПО БИЗНЕСАМ ═══ */}
      <div className="px-3 mt-2">
        <div className="p-3 rounded-2xl glass">
          <div className="text-[11px] font-bold text-blue-400 mb-2">💰 Заработок по бизнесам</div>
          <div className="grid grid-cols-3 gap-2">
            {['Малый $50', 'Средний $250', 'Большой $1000'].map((name, i) => (
              <div key={i} className="p-2 rounded-lg text-center" style={{ background: `${TABLES[i].color}10`, border: `1px solid ${TABLES[i].color}25` }}>
                <div className="text-[13px] font-black" style={{ color: TABLES[i].color }}>${bizEarnings[i].toFixed(2)}</div>
                <div className="text-[8px] text-slate-500">{name}</div>
              </div>
            ))}
          </div>
          {pending > 0 && (
            <div className="mt-2 p-2 rounded-lg bg-emerald-500/5 text-center">
              <div className="text-[10px] text-emerald-400 font-bold">💳 К выводу: ${pending.toFixed(2)} USDT</div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ ЗАЯВКА НА ДОМ ═══ */}
      <div className="px-3 mt-2">
        {application ? (
          <div className="p-3 rounded-2xl glass" style={{ border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[12px] font-bold text-emerald-400">✅ Заявка подана</div>
              <div className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{
                background: application.status === 'approved' ? 'rgba(16,185,129,0.15)' : 'rgba(255,215,0,0.1)',
                color: application.status === 'approved' ? '#10b981' : '#ffd700',
              }}>
                {application.status === 'approved' ? '✅ Одобрена' : '⏳ На рассмотрении'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px]">
              <div><span className="text-slate-500">Стоимость:</span> <span className="text-white font-bold">${parseFloat(application.house_price).toLocaleString()}</span></div>
              <div><span className="text-slate-500">Порог:</span> <span className="text-orange-400 font-bold">{application.threshold || 45}%</span></div>
              {application.city && <div><span className="text-slate-500">Город:</span> <span className="text-white">{application.city}</span></div>}
              {application.country && <div><span className="text-slate-500">Страна:</span> <span className="text-white">{application.country}</span></div>}
            </div>
          </div>
        ) : wallet ? (
          <div className="p-3 rounded-2xl glass">
            {!showApplyForm ? (
              <button onClick={() => { setShowApplyForm(true); setApplyPrice(String(housePrice)) }}
                className="w-full py-3 rounded-xl text-[12px] font-bold gold-btn">📝 Подать заявку на дом</button>
            ) : (
              <div className="space-y-2">
                <div className="text-[12px] font-bold text-gold-400 mb-1">📝 Заявка на дом</div>
                <div>
                  <label className="text-[9px] text-slate-500 block mb-0.5">Стоимость ($) *</label>
                  <input type="number" value={applyPrice} onChange={e => setApplyPrice(e.target.value)} placeholder="120000"
                    className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="text-[9px] text-slate-500 block mb-0.5">Город</label><input value={applyCity} onChange={e => setApplyCity(e.target.value)} placeholder="Свалява" className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none" /></div>
                  <div><label className="text-[9px] text-slate-500 block mb-0.5">Страна</label><input value={applyCountry} onChange={e => setApplyCountry(e.target.value)} placeholder="Украина" className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none" /></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowApplyForm(false)} className="flex-1 py-2 rounded-xl text-[10px] font-bold text-slate-500 border border-white/10">Отмена</button>
                  <button onClick={handleApply} disabled={submitting || !applyPrice} className="flex-1 py-2 rounded-xl text-[10px] font-bold gold-btn" style={{ opacity: (!applyPrice || submitting) ? 0.5 : 1 }}>
                    {submitting ? '⏳...' : '✅ Подать'}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* ═══ СТОИМОСТЬ ДОМА ═══ */}
      <div className="px-3 mt-2">
        <div className="p-3 rounded-2xl glass">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-500">⚙️ Стоимость дома:</span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-white">$</span>
              <input type="number" value={housePrice} onChange={e => setHousePrice(parseInt(e.target.value) || 0)}
                className="w-24 p-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white text-right outline-none" />
            </div>
          </div>
          <div className="flex gap-1 mt-2">
            {[80000, 120000, 180000, 250000].map(p => (
              <button key={p} onClick={() => setHousePrice(p)}
                className={`flex-1 py-1 rounded-lg text-[8px] font-bold border ${housePrice === p ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/5 text-slate-500'}`}>
                ${(p/1000)}k
              </button>
            ))}
          </div>
        </div>
      </div>
        </>
      )}

      {/* ═══ КЛУБНЫЕ ДОМА ═══ */}
      {showClubHouses && (
        <div className="px-3 mt-3 space-y-3">
          {loadingHouses && <div className="text-center py-4 text-[11px] text-slate-500 animate-pulse">⏳ Загрузка...</div>}

          {!loadingHouses && houses.length === 0 && (
            <div className="p-4 rounded-2xl glass text-center">
              <div className="text-2xl mb-1">🏗</div>
              <div className="text-[11px] text-slate-500">Клубные дома скоро появятся</div>
            </div>
          )}

          {houses.map(house => {
            const st = STATUS[house.status] || STATUS.planning
            const price = parseFloat(house.total_price) || 0
            const sqm = parseFloat(house.total_sqm) || 0
            const pricePerSqm = sqm > 0 ? Math.round(price / sqm) : 0
            const imgSrc = house.image_url || '/images/houses/house-modern.jpg'
            const isExpanded = expandedHouse === house.id

            return (
              <div key={house.id} className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,215,0,0.15)' }}>
                <div className="relative h-48 overflow-hidden">
                  <img src={imgSrc} alt={house.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,31,0.95) 0%, rgba(10,10,31,0.3) 50%, transparent 100%)' }} />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1" style={{ background: 'rgba(0,0,0,0.6)', color: st.color }}>{st.emoji} {st.label}</div>
                  <div className="absolute bottom-3 left-3">
                    <div className="text-xl font-black text-gold-400">${price.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">{sqm} м² • ${pricePerSqm}/м²</div>
                  </div>
                </div>

                <div className="p-4" style={{ background: 'rgba(15,15,35,0.95)' }}>
                  <div className="text-[14px] font-black text-white mb-1">{house.name}</div>
                  {(house.city || house.country) && <div className="text-[11px] text-slate-400 mb-3">📍 {house.city}{house.country ? `, ${house.country}` : ''}</div>}

                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500">Собрано ({house.buyers || 0} чел.)</span>
                      <span className="text-emerald-400 font-bold">{(house.purchased_sqm || 0).toFixed(2)} / {sqm} м²</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: `${Math.min(((house.purchased_sqm || 0) / (sqm || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {TABLES.map(table => {
                      const key = `${house.id}-${table.id}`
                      const isBuying = buyingSlot === key
                      const canBuy = wallet && registered && level >= table.minLevel && !txPending
                      return (
                        <button key={table.id} onClick={() => handleBuyHouse(house, table)} disabled={!canBuy || isBuying}
                          className="w-full p-3 rounded-xl text-left flex items-center justify-between active:scale-[0.98]"
                          style={{ background: `${table.color}12`, border: `1px solid ${table.color}30`, opacity: canBuy ? 1 : 0.5 }}>
                          <div>
                            <div className="text-[13px] font-black text-white">{isBuying ? '⏳...' : `Купить за $${table.price}`}</div>
                            <div className="text-[10px] text-slate-400">→ {table.sqm} м²</div>
                          </div>
                          <div className="text-[11px] font-bold" style={{ color: table.color }}>{table.sqm} м²</div>
                        </button>
                      )
                    })}
                  </div>

                  {house.description && (
                    <div className="mt-3">
                      <button onClick={() => setExpandedHouse(isExpanded ? null : house.id)} className="text-[10px] text-slate-500">{isExpanded ? '▲ Скрыть' : '▼ Подробнее'}</button>
                      {isExpanded && <div className="mt-2 p-3 rounded-xl text-[10px] text-slate-400 leading-relaxed whitespace-pre-line" style={{ background: 'rgba(255,255,255,0.03)' }}>{house.description}</div>}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
