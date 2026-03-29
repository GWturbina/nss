'use client'
import useGameStore from '@/lib/store'
import { LEVELS } from '@/lib/gameData'
import { useState, useEffect, useCallback } from 'react'
import * as C from '@/lib/contracts'
import { shortAddress } from '@/lib/web3'
import HouseBuildVisualization from '@/components/game/HouseBuildVisualization'
import BusinessHistory from '@/components/game/BusinessHistory'

// ═════════════════════════════════════════════════════════
// STAKING PAGE — Бизнес Недвижимости (RealEstateMatrix)
// ═════════════════════════════════════════════════════════
export function StakingTab() {
  const { wallet, tables, pendingWithdrawal, totalSqm, level, registered, addNotification, setTxPending, txPending, t } = useGameStore()
  const [showGuide, setShowGuide] = useState(false)
  const [expandedTable, setExpandedTable] = useState(null)

  // Клубные дома
  const [forClubHouse, setForClubHouse] = useState(false)
  const [selectedHouseId, setSelectedHouseId] = useState(null)
  const [clubHouses, setClubHouses] = useState([])

  useEffect(() => {
    import('@/lib/clubHouses').then(CH => {
      CH.getClubHouses().then(h => setClubHouses(h.filter(x => x.status !== 'completed')))
    }).catch(() => {})
  }, [])

  const TABLES = [
    { id: 0, name: t('smallBusiness'), price: 50, sqm: 0.05, color: '#10b981', minLevel: 1, gwPack: 'Start' },
    { id: 1, name: t('mediumBusiness'), price: 250, sqm: 0.25, color: '#8b5cf6', minLevel: 3, gwPack: 'Basic' },
    { id: 2, name: t('largeBusiness'), price: 1000, sqm: 1.0, color: '#f59e0b', minLevel: 4, gwPack: 'Premium' },
  ]

  const handleBuy = async (table) => {
    if (!wallet) { addNotification(`❌ ${t('connectWalletFirst')}`); return }
    if (level < table.minLevel) { addNotification(`❌ ${t('needLevel')} ${table.minLevel}+`); return }
    if (forClubHouse && !selectedHouseId) { addNotification('❌ Выберите клубный дом'); return }
    setTxPending(true)
    const result = await C.safeCall(() => C.buySlot(table.id))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('buySlot')} ${table.name}!`)
      // Запись покупки в Supabase для клубного дома
      if (forClubHouse && selectedHouseId) {
        try {
          const CH = await import('@/lib/clubHouses')
          await CH.recordPurchase({
            house_id: selectedHouseId,
            wallet,
            sqm_purchased: table.sqm,
            tx_hash: result.data?.hash || '',
            slot_table: table.id,
          })
          addNotification(`🏘 +${table.sqm} м² для клубного дома!`)
        } catch {}
      }
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  // Сумма к выводу ТОЛЬКО из pendingWithdrawals контракта (единственный источник правды)
  const effectivePending = pendingWithdrawal || '0'

  const handleWithdraw = async () => {
    if (!wallet) return
    setTxPending(true)
    const result = await C.safeCall(() => C.withdrawFromMatrix())
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('withdrawn')} ${effectivePending} USDT!`)
      useGameStore.getState().updatePending('0')
      const zeroed = (useGameStore.getState().tables || []).map(t => t ? { ...t, pending: '0.00' } : t)
      useGameStore.setState({ tables: zeroed })
      setTimeout(async () => {
        const [fresh, freshTables] = await Promise.all([
          C.getMyPendingWithdrawal(wallet).catch(() => null),
          C.getUserAllTables(wallet).catch(() => null),
        ])
        if (fresh !== null) useGameStore.getState().updatePending((Number(fresh) / 1e18).toFixed(2))
        if (freshTables) useGameStore.getState().updateTables(freshTables)
      }, 3000)
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
            <div className="text-xl font-black text-gold-400">{effectivePending} USDT</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-500">{t('sqm')}</div>
            <div className="text-lg font-bold text-emerald-400">{totalSqm.toFixed(2)}</div>
          </div>
        </div>
        {parseFloat(effectivePending) > 0 && (
          <button onClick={handleWithdraw} disabled={txPending}
            className="mt-2 w-full py-2 rounded-xl text-xs font-bold gold-btn">
            {txPending ? `⏳ ${t('withdrawing')}` : `💸 Вывести ${effectivePending} USDT`}
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
                    <>
                      {/* Чекбокс клубного дома */}
                      {clubHouses.length > 0 && (
                        <div className="mb-2 p-2 rounded-lg bg-white/5" onClick={e => e.stopPropagation()}>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={forClubHouse}
                              onChange={e => { setForClubHouse(e.target.checked); if (!e.target.checked) setSelectedHouseId(null) }}
                              className="w-4 h-4 rounded accent-gold-400" />
                            <span className="text-[10px] font-bold text-slate-300">🏘 {t('forClubHouse')}</span>
                          </label>
                          {forClubHouse && (
                            <select value={selectedHouseId || ''} onChange={e => setSelectedHouseId(e.target.value || null)}
                              className="mt-1 w-full p-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none">
                              <option value="">{t('selectClubHouse')}</option>
                              {clubHouses.map(h => (
                                <option key={h.id} value={h.id}>{h.name} — {h.city}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); handleBuy(table) }} disabled={txPending}
                        className="w-full py-2.5 rounded-xl text-xs font-bold gold-btn">
                        {txPending ? `⏳...` : `🛒 ${t('buySlotFor')} $${table.price}`}
                      </button>
                    </>
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

      {/* ═══ Детали бизнесов + История ═══ */}
      {wallet && <BusinessHistory />}

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

      {/* ═══ Визуализация стройки ═══ */}
      <div className="mx-3 mt-2 p-2 rounded-2xl glass">
        <HouseBuildVisualization
          totalSqm={totalSqm}
          targetSqm={housePrice > 0 ? housePrice / 1000 : 100}
          houseStatus={houseStatus}
        />
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
  const [fromToken, setFromToken] = useState('CHT')
  const [toToken, setToToken] = useState('USDT')
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState(null)

  const tokens = [
    { id: 'CHT', name: 'CHT', balance: nst, color: '#ffd700', icon: '💎' },
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
        <p className="text-[11px] text-slate-500">{t('exchangeSwap')} CHT ↔ CGT ↔ USDT</p>
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
