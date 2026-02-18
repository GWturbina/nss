'use client'
import useGameStore from '@/lib/store'
import { GEMS, LEVELS } from '@/lib/gameData'
import { useState, useEffect, useCallback } from 'react'
import * as C from '@/lib/contracts'
import { shortAddress } from '@/lib/web3'

// ═════════════════════════════════════════════════════════
// GEMS PAGE — Магазин камней (GemVault)
// ═════════════════════════════════════════════════════════
export function GemsTab() {
  const { wallet, addNotification, setTxPending, txPending, t } = useGameStore()
  const [selectedGem, setSelectedGem] = useState(null)
  const [nstBurn, setNstBurn] = useState(0)
  const [filter, setFilter] = useState('all')
  const [showCalc, setShowCalc] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const [calcMonths, setCalcMonths] = useState(6)
  const [buyDone, setBuyDone] = useState(null)
  const [myGems, setMyGems] = useState([])

  useEffect(() => {
    if (!wallet) return
    C.getGemPurchases(wallet).then(setMyGems).catch(() => {})
  }, [wallet])

  const GemSVG = ({ type, size = 44 }) => {
    const palette = {
      agate: { c: ['#8B6914','#D4A843','#F5DEB3'], g: '#D4A843' },
      citrine: { c: ['#CC8400','#FFB347','#FFE4A0'], g: '#FFB347' },
      garnet: { c: ['#8B0000','#DC143C','#FF6B6B'], g: '#DC143C' },
      topaz: { c: ['#0077B6','#00B4D8','#90E0EF'], g: '#00B4D8' },
      peridot: { c: ['#2E8B57','#50C878','#98FB98'], g: '#50C878' },
      amethyst: { c: ['#6A0DAD','#9B59B6','#D7BDE2'], g: '#9B59B6' },
      aquamarine: { c: ['#008B8B','#48D1CC','#AFEEEE'], g: '#48D1CC' },
      ruby: { c: ['#8B0000','#DC2626','#FCA5A5'], g: '#DC2626' },
      sapphire: { c: ['#1A237E','#2563EB','#93C5FD'], g: '#2563EB' },
      emerald: { c: ['#004D25','#10B981','#6EE7B7'], g: '#10B981' },
      tanzanite: { c: ['#2C0066','#6366F1','#A5B4FC'], g: '#6366F1' },
    }
    const p = palette[type] || palette.ruby
    return (
      <svg width={size} height={size} viewBox="0 0 80 80">
        <defs>
          <linearGradient id={`g-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.c[2]} /><stop offset="50%" stopColor={p.c[1]} /><stop offset="100%" stopColor={p.c[0]} />
          </linearGradient>
        </defs>
        <ellipse cx="40" cy="72" rx="18" ry="3.5" fill={p.g} opacity="0.12" />
        <polygon points="40,6 63,28 56,68 24,68 17,28" fill={`url(#g-${type})`} stroke={p.c[2]} strokeWidth="1" />
        <polygon points="40,6 50,24 40,19 30,24" fill={p.c[2]} opacity="0.5" />
        <polygon points="50,24 63,28 55,42 40,32" fill={p.c[1]} opacity="0.25" />
        <polygon points="27,27 40,19 37,34" fill="white" opacity="0.2" />
        <circle cx="31" cy="21" r="1.8" fill="white" opacity="0.45" />
      </svg>
    )
  }

  const nstBonusPercent = Math.min(Math.floor(nstBurn / 1000), 10)
  const totalDiscount = 30 + nstBonusPercent
  const BNB_RATE = 580

  const calcPrice = (gem) => {
    const finalPrice = gem.price * (1 - totalDiscount / 100)
    return { usd: Math.round(finalPrice), bnb: (finalPrice / BNB_RATE).toFixed(4), discount: totalDiscount, savings: Math.round(gem.price - finalPrice) }
  }

  const calcStaking = (gem) => {
    const price = calcPrice(gem)
    const monthlyRate = gem.stakingAPR / 100 / 12
    let total = price.usd
    for (let i = 0; i < calcMonths; i++) total += price.usd * monthlyRate
    const profit = total - price.usd
    return { invested: price.usd, total: Math.round(total), profit: Math.round(profit), monthlyIncome: Math.round(price.usd * monthlyRate) }
  }

  const handleBuy = async (gem) => {
    if (!wallet) { addNotification(`❌ ${t('connectWalletFirst')}`); return }
    setTxPending(true)
    const result = await C.safeCall(() => C.buyGem(gem.id, gem.categoryId || 0))
    setTxPending(false)
    if (result.ok) {
      setBuyDone(`✅ ${gem.name} ${t('gemBought')}`)
      setSelectedGem(null)
      addNotification(`💎 ${t('buyGem')}: ${gem.name}`)
      setTimeout(() => setBuyDone(null), 5000)
      C.getGemPurchases(wallet).then(setMyGems).catch(() => {})
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleClaim = async (purchaseId) => {
    if (!wallet) return
    setTxPending(true)
    const result = await C.safeCall(() => C.claimGem(purchaseId, false))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('gemClaimed')}`)
      C.getGemPurchases(wallet).then(setMyGems).catch(() => {})
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const filtered = GEMS.filter(g => filter === 'all' || g.category === filter)
  const categories = [
    { id: 'all', label: t('all'), count: GEMS.length },
    { id: 'budget', label: `💰 ${t('from50')}`, count: GEMS.filter(g=>g.category==='budget').length },
    { id: 'mid', label: `💎 ${t('mid')}`, count: GEMS.filter(g=>g.category==='mid').length },
    { id: 'premium', label: `👑 ${t('premium')}`, count: GEMS.filter(g=>g.category==='premium').length },
  ]

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">💎 {t('gemShop')}</h2>
        <p className="text-[11px] text-slate-500">{totalDiscount}% {t('discount')} {t('fromMarket')} • {t('bnbPayment')} • {t('staking')}</p>
      </div>

      {buyDone && (
        <div className="mx-3 mt-1 p-2 rounded-xl text-[12px] font-bold text-center bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          {buyDone}
        </div>
      )}

      {myGems.length > 0 && (
        <div className="mx-3 mt-2 p-3 rounded-2xl glass border-purple-500/15">
          <div className="text-[12px] font-bold text-purple-400 mb-2">🏆 {t('myGems')} ({myGems.length})</div>
          <div className="space-y-1">
            {myGems.slice(0, 3).map(g => (
              <div key={g.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                <div>
                  <span className="text-[11px] font-bold text-white">#{g.id}</span>
                  <span className="text-[10px] text-slate-500 ml-2">${g.price}</span>
                </div>
                {!g.claimed ? (
                  <button onClick={() => handleClaim(g.id)} disabled={txPending}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    {t('claim')}
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-500">✅ {t('claimed')}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-1 px-3 mt-2 overflow-x-auto scrollbar-hide">
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilter(c.id)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap border ${filter === c.id ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
            {c.label} ({c.count})
          </button>
        ))}
      </div>

      <div className="px-3 mt-2 grid grid-cols-2 gap-2">
        {filtered.map(gem => {
          const price = calcPrice(gem)
          return (
            <div key={gem.id} onClick={() => setSelectedGem(gem)}
              className="p-3 rounded-2xl glass cursor-pointer hover:border-gold-400/30 transition-all">
              <div className="flex justify-center mb-2">
                <GemSVG type={gem.type} size={50} />
              </div>
              <div className="text-center">
                <div className="text-[11px] font-black text-white">{gem.name}</div>
                <div className="text-[10px] text-slate-500 line-through">${gem.price}</div>
                <div className="text-[12px] font-bold text-gold-400">${price.usd}</div>
                <div className="text-[9px] text-emerald-400">{gem.stakingAPR}% {t('stakingAPR')}</div>
              </div>
            </div>
          )
        })}
      </div>

      {selectedGem && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedGem(null)}>
          <div className="w-full max-w-sm p-4 rounded-2xl glass" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center mb-3">
              <GemSVG type={selectedGem.type} size={80} />
            </div>
            <h3 className="text-lg font-black text-center text-white mb-1">{selectedGem.name}</h3>
            <p className="text-[11px] text-slate-400 text-center mb-3">{selectedGem.desc}</p>
            
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2 rounded-lg bg-white/5 text-center">
                <div className="text-[10px] text-slate-500">{t('price')}</div>
                <div className="text-sm font-bold text-gold-400">${calcPrice(selectedGem).usd}</div>
              </div>
              <div className="p-2 rounded-lg bg-white/5 text-center">
                <div className="text-[10px] text-slate-500">{t('staking')}</div>
                <div className="text-sm font-bold text-emerald-400">{selectedGem.stakingAPR}%</div>
              </div>
            </div>

            <button onClick={() => handleBuy(selectedGem)} disabled={txPending}
              className="w-full py-3 rounded-xl text-sm font-bold gold-btn">
              {txPending ? `⏳ ${t('loading')}` : `💎 ${t('buyGem')} — ${calcPrice(selectedGem).bnb} BNB`}
            </button>
            <button onClick={() => setSelectedGem(null)} className="w-full mt-2 py-2 text-[11px] text-slate-500">
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// STAKING PAGE — Бизнес Недвижимости (RealEstateMatrix)
// ═════════════════════════════════════════════════════════
export function StakingTab() {
  const { wallet, tables, pendingWithdrawal, totalSqm, level, registered, addNotification, setTxPending, txPending, t } = useGameStore()
  const [showGuide, setShowGuide] = useState(false)
  const [expandedTable, setExpandedTable] = useState(null)

  const TABLES = [
    { id: 0, name: t('smallBusiness'), price: 50, sqm: 0.05, color: '#10b981', minLevel: 1, gwPack: 'Start' },
    { id: 1, name: t('mediumBusiness'), price: 250, sqm: 0.25, color: '#8b5cf6', minLevel: 3, gwPack: 'Basic' },
    { id: 2, name: t('largeBusiness'), price: 1000, sqm: 1.0, color: '#f59e0b', minLevel: 4, gwPack: 'Premium' },
  ]

  const handleBuy = async (table) => {
    if (!wallet) { addNotification(`❌ ${t('connectWalletFirst')}`); return }
    if (level < table.minLevel) { addNotification(`❌ ${t('needLevel')} ${table.minLevel}+`); return }
    setTxPending(true)
    const result = await C.safeCall(() => C.buySlot(table.id))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('buySlot')} ${table.name}!`)
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleWithdraw = async () => {
    if (!wallet) return
    setTxPending(true)
    const result = await C.safeCall(() => C.withdrawFromMatrix())
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('withdrawn')} ${pendingWithdrawal} USDT!`)
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">🏔 {t('realEstateBusiness')}</h2>
        <p className="text-[11px] text-slate-500">{t('businessDesc')}</p>
      </div>

      <div className="mx-3 mt-2 p-3 rounded-2xl glass">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[10px] text-slate-500">{t('toWithdraw')}</div>
            <div className="text-xl font-black text-gold-400">{pendingWithdrawal} USDT</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500">{t('sqm')}</div>
            <div className="text-lg font-bold text-emerald-400">{totalSqm.toFixed(2)}</div>
          </div>
        </div>
        {parseFloat(pendingWithdrawal) > 0 && (
          <button onClick={handleWithdraw} disabled={txPending}
            className="mt-2 w-full py-2 rounded-xl text-xs font-bold gold-btn">
            {txPending ? `⏳ ${t('withdrawing')}` : `💸 ${t('withdraw')}`}
          </button>
        )}
      </div>

      <div className="px-3 mt-2 space-y-2">
        {TABLES.map((table, i) => {
          const data = tables[i] || { slots: 0, earned: '0', pending: '0', reinvests: 0 }
          const isExpanded = expandedTable === i
          const canBuy = level >= table.minLevel

          return (
            <div key={i} onClick={() => setExpandedTable(isExpanded ? null : i)}
              className="p-3 rounded-2xl glass cursor-pointer transition-all"
              style={{ borderColor: canBuy ? `${table.color}30` : 'transparent' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg border"
                  style={{ borderColor: `${table.color}40`, background: `${table.color}15` }}>
                  {['🏪', '🏢', '🏰'][i]}
                </div>
                <div className="flex-1">
                  <div className="text-[12px] font-black" style={{ color: table.color }}>{table.name}</div>
                  <div className="text-[10px] text-slate-500">${table.price} • {table.sqm} {t('sqm')}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-bold text-white">{data.slots} {t('slots')}</div>
                  <div className="text-[9px] text-slate-500">{data.reinvests} {t('reinvests')}</div>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <div className="text-[11px] font-bold text-emerald-400">{data.earned}</div>
                      <div className="text-[9px] text-slate-500">{t('earned')} USDT</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <div className="text-[11px] font-bold text-gold-400">{data.pending}</div>
                      <div className="text-[9px] text-slate-500">{t('toWithdraw')}</div>
                    </div>
                  </div>
                  
                  {canBuy ? (
                    <button onClick={(e) => { e.stopPropagation(); handleBuy(table) }} disabled={txPending}
                      className="w-full py-2.5 rounded-xl text-xs font-bold gold-btn">
                      {txPending ? `⏳...` : `🛒 ${t('buySlotFor')} $${table.price}`}
                    </button>
                  ) : (
                    <div className="text-center text-[10px] text-slate-500 py-2">
                      🔒 {t('needLevel')} {table.minLevel}+ ({table.gwPack} {t('globalwayPackage')})
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={() => setShowGuide(!showGuide)}
        className={`mx-3 mt-2 w-[calc(100%-24px)] py-2 rounded-xl text-[11px] font-bold border ${showGuide ? 'bg-blue-500/15 border-blue-500/25 text-blue-400' : 'border-white/8 text-slate-500'}`}>
        📖 {t('howItWorks')}
      </button>

      {showGuide && (
        <div className="mx-3 mt-2 p-3 rounded-2xl glass border-blue-500/15">
          <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
            <p><b className="text-white">1.</b> {t('step1')}</p>
            <p><b className="text-white">2.</b> {t('step2')}</p>
            <p><b className="text-white">3.</b> {t('step3')}</p>
            <p><b className="text-white">4.</b> {t('step4')}</p>
            <p className="text-emerald-400 font-bold">💰 {t('quarterlyPayments')} — {t('passiveIncome')}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// HOME PAGE — Мой Дом (HousingFund)
// ═════════════════════════════════════════════════════════
export function HomeTab() {
  const { wallet, houseStatus, housePrice, houseDeposit, houseLoan, houseRepaid, totalSqm, addNotification, setTxPending, txPending, t } = useGameStore()
  const [price, setPrice] = useState('')
  const [location, setLocation] = useState('')
  const [country, setCountry] = useState('')
  const [showGuide, setShowGuide] = useState(false)

  const handleApply = async () => {
    if (!wallet || !price || !location || !country) return
    setTxPending(true)
    const result = await C.safeCall(() => C.applyForHouse(price, location, country))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('applyForHouse')}!`)
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const repaidPercent = houseLoan > 0 ? Math.round((houseRepaid / houseLoan) * 100) : 0

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">🏠 {t('myHome')}</h2>
        <p className="text-[11px] text-slate-500">{t('homeDesc')}</p>
      </div>

      {houseStatus !== 'none' && (
        <div className="mx-3 mt-2 p-3 rounded-2xl glass border-emerald-500/15">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[10px] text-slate-500">{t('housePrice')}</div>
              <div className="text-sm font-bold text-white">${housePrice.toLocaleString()}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[10px] text-slate-500">{t('deposit35')}</div>
              <div className="text-sm font-bold text-emerald-400">${houseDeposit.toLocaleString()}</div>
            </div>
          </div>
          <div className="mt-2">
            <div className="flex justify-between text-[10px] mb-1">
              <span className="text-slate-500">{t('clubLoan')}</span>
              <span className="text-purple-400">${houseLoan.toLocaleString()}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-500" style={{ width: `${repaidPercent}%` }} />
            </div>
            <div className="text-[9px] text-slate-500 mt-0.5">{repaidPercent}% — ${houseRepaid.toLocaleString()} / ${houseLoan.toLocaleString()}</div>
          </div>
          <div className="mt-2 text-center text-[11px] font-bold" style={{ color: houseStatus === 'personal' ? '#10b981' : '#a855f7' }}>
            {t('status')}: {({ applied: `📝 ${t('statusApplied')}`, building: `🏗 ${t('statusBuilding')}`, club_owned: `🏠 ${t('statusClubOwned')}`, personal: `🎉 ${t('statusPersonal')}` })[houseStatus]}
          </div>
        </div>
      )}

      {houseStatus === 'none' && (
        <div className="mx-3 mt-2 p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-gold-400 mb-2">📝 {t('applyForHouse')}</div>
          <div className="space-y-2">
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">{t('housePriceLabel')}</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="50000"
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-400/30" />
              {price && <div className="text-[9px] text-slate-500 mt-0.5">35% {t('depositLabel')}: ${(parseFloat(price) * 0.35).toFixed(0)} • {t('loanLabel')} 65%: ${(parseFloat(price) * 0.65).toFixed(0)}</div>}
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">{t('cityLocation')}</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Bali, Ubud"
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-400/30" />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 mb-1 block">{t('country')}</label>
              <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Indonesia"
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-400/30" />
            </div>
          </div>
          <button onClick={handleApply} disabled={txPending || !price || !location || !country}
            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold gold-btn"
            style={{ opacity: (!price || !location || !country || txPending) ? 0.5 : 1 }}>
            {txPending ? '⏳...' : `🏠 ${t('submitApplication')}`}
          </button>
        </div>
      )}

      <button onClick={() => setShowGuide(!showGuide)}
        className={`mx-3 mt-2 w-[calc(100%-24px)] py-2 rounded-xl text-[11px] font-bold border ${showGuide ? 'bg-blue-500/15 border-blue-500/25 text-blue-400' : 'border-white/8 text-slate-500'}`}>
        📖 {t('howItWorks')}
      </button>

      {showGuide && (
        <div className="mx-3 mt-2 p-3 rounded-2xl glass border-blue-500/15">
          <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
            <p><b className="text-white">1.</b> {t('howHomeWorks1')}</p>
            <p><b className="text-white">2.</b> {t('howHomeWorks2')}</p>
            <p><b className="text-white">3.</b> {t('howHomeWorks3')}</p>
            <p><b className="text-white">4.</b> {t('howHomeWorks4')}</p>
            <p><b className="text-white">5.</b> {t('howHomeWorks5')}</p>
          </div>
        </div>
      )}

      {houseStatus === 'none' && (
        <div className="mx-3 mt-3 p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-emerald-400 mb-2">📊 {t('progressToHome')}</div>
          <div className="text-center">
            <div className="text-2xl font-black text-gold-400">{totalSqm.toFixed(2)} {t('sqm')}</div>
            <div className="text-[10px] text-slate-500">{t('boughtViaBusiness')}</div>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 text-center">
            {t('buySharesAccumulate')}
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// EXCHANGE PAGE — Обмен (SwapHelper)
// ═════════════════════════════════════════════════════════
export function ExchangeTab() {
  const { wallet, nst, cgt, bnb, usdt, addNotification, setTxPending, txPending, t } = useGameStore()
  const [fromToken, setFromToken] = useState('NST')
  const [toToken, setToToken] = useState('USDT')
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState(null)

  const tokens = [
    { id: 'NST', name: 'NST', balance: nst, color: '#ffd700', icon: '💎' },
    { id: 'CGT', name: 'CGT', balance: cgt, color: '#10b981', icon: '◆' },
    { id: 'USDT', name: 'USDT', balance: parseFloat(usdt), color: '#22c55e', icon: '💵' },
    { id: 'BNB', name: 'BNB', balance: bnb, color: '#f0b90b', icon: '🔶' },
  ]

  const handleSwap = async () => {
    if (!wallet || !amount) return
    addNotification(`⏳ ${t('transactionPending')}`)
    setTxPending(true)
    let result
    if (fromToken === 'BNB' && toToken === 'USDT') {
      result = await C.safeCall(() => C.swapBNBtoUSDT(amount))
    } else if (fromToken === 'USDT' && toToken === 'BNB') {
      result = await C.safeCall(() => C.swapUSDTtoBNB(amount))
    } else {
      setTxPending(false)
      addNotification(`❌ ${t('unsupportedPair')} ${fromToken}→${toToken}`)
      return
    }
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('transactionSuccess')}`)
      setAmount('')
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  // Получаем реальную котировку
  useEffect(() => {
    if (!amount || !parseFloat(amount)) { setRate(null); return }
    const fetchQuote = async () => {
      try {
        if (fromToken === 'BNB' && toToken === 'USDT') {
          const q = await C.quoteBNBtoUSDT(amount)
          if (q) setRate(`≈ ${parseFloat(q.usdtOut).toFixed(4)} USDT`)
        } else if (fromToken === 'USDT' && toToken === 'BNB') {
          const q = await C.quoteUSDTtoBNB(amount)
          if (q) setRate(`≈ ${parseFloat(q.bnbOut).toFixed(6)} BNB`)
        } else {
          setRate(null)
        }
      } catch { setRate(null) }
    }
    const timer = setTimeout(fetchQuote, 500)
    return () => clearTimeout(timer)
  }, [amount, fromToken, toToken])

  const fromTokenData = tokens.find(t => t.id === fromToken)
  const toTokenData = tokens.find(t => t.id === toToken)

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">💱 {t('exchangeTitle')}</h2>
        <p className="text-[11px] text-slate-500">{t('exchangeSwap')} NST ↔ CGT ↔ USDT</p>
      </div>

      <div className="mx-3 mt-2 p-3 rounded-2xl glass">
        {/* From */}
        <div className="mb-3">
          <div className="text-[10px] text-slate-500 mb-1">{t('exchangeFrom')}</div>
          <div className="flex gap-2">
            {tokens.map(tk => (
              <button key={tk.id} onClick={() => setFromToken(tk.id)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold border ${fromToken === tk.id ? 'border-gold-400/40 text-gold-400' : 'border-white/10 text-slate-500'}`}>
                {tk.icon} {tk.id}
              </button>
            ))}
          </div>
          <div className="text-[9px] text-slate-500 mt-1">{t('balance')}: {fromTokenData?.balance.toFixed(4)}</div>
        </div>

        {/* Amount */}
        <div className="mb-3">
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder={t('amount')}
            className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-lg text-white font-bold text-center outline-none focus:border-gold-400/30" />
        </div>

        {/* Swap arrow */}
        <div className="flex justify-center mb-3">
          <button onClick={() => { setFromToken(toToken); setToToken(fromToken) }}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-lg hover:bg-white/10 transition-all">
            ⇅
          </button>
        </div>

        {/* To */}
        <div className="mb-3">
          <div className="text-[10px] text-slate-500 mb-1">{t('exchangeTo')}</div>
          <div className="flex gap-2">
            {tokens.filter(tk => tk.id !== fromToken).map(tk => (
              <button key={tk.id} onClick={() => setToToken(tk.id)}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold border ${toToken === tk.id ? 'border-emerald-400/40 text-emerald-400' : 'border-white/10 text-slate-500'}`}>
                {tk.icon} {tk.id}
              </button>
            ))}
          </div>
          <div className="text-[9px] text-slate-500 mt-1">{t('balance')}: {toTokenData?.balance.toFixed(4)}</div>
        </div>

        {/* Rate */}
        {amount && rate && (
          <div className="p-2 rounded-lg bg-white/5 text-center text-[11px] text-slate-400 mb-3">
            {amount} {fromToken} {rate}
          </div>
        )}

        {/* Swap button */}
        <button onClick={handleSwap} disabled={txPending || !amount || !wallet}
          className="w-full py-3 rounded-xl text-sm font-bold gold-btn"
          style={{ opacity: (!amount || txPending) ? 0.5 : 1 }}>
          {txPending ? `⏳ ${t('loading')}` : `💱 ${t('exchangeSwap')}`}
        </button>
      </div>

      {!wallet && (
        <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center">
          <div className="text-3xl mb-2">🔐</div>
          <div className="text-sm font-bold text-slate-300">{t('connectWallet')}</div>
        </div>
      )}
    </div>
  )
}

// TeamTab moved to TeamPage.jsx
