'use client'
import { useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import * as Ex from '@/lib/exchangeContracts'
import { safeCall } from '@/lib/contracts'
import { shortAddress } from '@/lib/web3'

export default function CHTExchangeTab() {
  const { wallet, addNotification, setTxPending, txPending, t } = useGameStore()
  const [sellOrders, setSellOrders] = useState([])
  const [buyOrders, setBuyOrders] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [bestPrices, setBestPrices] = useState({ bestBid: null, bestAsk: null })
  const [stats, setStats] = useState(null)
  const [constants, setConstants] = useState(null)
  const [loading, setLoading] = useState(true)

  // Модалки
  const [showSellModal, setShowSellModal] = useState(false)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [fillModal, setFillModal] = useState(null) // { order, side }

  // Формы
  const [sellAmount, setSellAmount] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [buyAmount, setBuyAmount] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [fillAmount, setFillAmount] = useState('')

  // Секция
  const [section, setSection] = useState('book') // 'book' | 'my'

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [sells, buys, prices, st, consts] = await Promise.all([
        Ex.getActiveSellOrders().catch(() => []),
        Ex.getActiveBuyOrders().catch(() => []),
        Ex.getBestPrices().catch(() => ({ bestBid: null, bestAsk: null })),
        Ex.getExchangeStats().catch(() => null),
        Ex.getExchangeConstants().catch(() => null),
      ])
      setSellOrders(sells.filter(o => o.active).sort((a, b) => parseFloat(a.pricePerCHT) - parseFloat(b.pricePerCHT)))
      setBuyOrders(buys.filter(o => o.active).sort((a, b) => parseFloat(b.pricePerCHT) - parseFloat(a.pricePerCHT)))
      setBestPrices(prices)
      setStats(st)
      setConstants(consts)

      if (wallet) {
        const my = await Ex.getUserOrders(wallet).catch(() => [])
        setMyOrders(my.filter(o => o.active))
      }
    } catch {}
    setLoading(false)
  }, [wallet])

  useEffect(() => { loadData() }, [loadData])

  // ═══ Создание sell-ордера ═══
  const handleCreateSell = async () => {
    if (!wallet || !sellAmount || !sellPrice) return
    setTxPending(true)
    // Проверяем allowance CHT
    const allow = await Ex.getCHTAllowance(wallet).catch(() => '0')
    if (parseFloat(allow) < parseFloat(sellAmount)) {
      addNotification('🔓 Одобряем CHT...')
      const apRes = await safeCall(() => Ex.approveCHTForExchange(sellAmount))
      if (!apRes.ok) { setTxPending(false); addNotification(`❌ ${apRes.error}`); return }
    }
    const result = await safeCall(() => Ex.createSellOrder(sellAmount, sellPrice))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ Sell-ордер создан: ${sellAmount} CHT по ${sellPrice} USDT`)
      setShowSellModal(false); setSellAmount(''); setSellPrice('')
      loadData()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  // ═══ Создание buy-ордера ═══
  const handleCreateBuy = async () => {
    if (!wallet || !buyAmount || !buyPrice) return
    const feeBP = constants?.tradeFeeBP || 200
    const total = Ex.calcBuyTotal(buyAmount, buyPrice, feeBP)
    setTxPending(true)
    // Проверяем allowance USDT
    const allow = await Ex.getUSDTAllowance(wallet).catch(() => '0')
    if (parseFloat(allow) < parseFloat(total.total)) {
      addNotification('🔓 Одобряем USDT...')
      const apRes = await safeCall(() => Ex.approveUSDTForExchange(total.total))
      if (!apRes.ok) { setTxPending(false); addNotification(`❌ ${apRes.error}`); return }
    }
    const result = await safeCall(() => Ex.createBuyOrder(buyAmount, buyPrice))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ Buy-ордер создан: ${buyAmount} CHT по ${buyPrice} USDT`)
      setShowBuyModal(false); setBuyAmount(''); setBuyPrice('')
      loadData()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  // ═══ Исполнение ордера ═══
  const handleFill = async () => {
    if (!fillModal || !fillAmount) return
    const { order, side } = fillModal
    setTxPending(true)
    if (side === 'sell') {
      // Покупаем у sell-ордера → нужен USDT approve
      const feeBP = constants?.tradeFeeBP || 200
      const total = Ex.calcBuyTotal(fillAmount, order.pricePerCHT, feeBP)
      const allow = await Ex.getUSDTAllowance(wallet).catch(() => '0')
      if (parseFloat(allow) < parseFloat(total.total)) {
        addNotification('🔓 Одобряем USDT...')
        const apRes = await safeCall(() => Ex.approveUSDTForExchange(total.total))
        if (!apRes.ok) { setTxPending(false); addNotification(`❌ ${apRes.error}`); return }
      }
      const result = await safeCall(() => Ex.fillSellOrder(order.id, fillAmount))
      setTxPending(false)
      if (result.ok) {
        addNotification(`✅ Куплено ${fillAmount} CHT!`)
        setFillModal(null); setFillAmount(''); loadData()
      } else { addNotification(`❌ ${result.error}`) }
    } else {
      // Продаём в buy-ордер → нужен CHT approve
      const allow = await Ex.getCHTAllowance(wallet).catch(() => '0')
      if (parseFloat(allow) < parseFloat(fillAmount)) {
        addNotification('🔓 Одобряем CHT...')
        const apRes = await safeCall(() => Ex.approveCHTForExchange(fillAmount))
        if (!apRes.ok) { setTxPending(false); addNotification(`❌ ${apRes.error}`); return }
      }
      const result = await safeCall(() => Ex.fillBuyOrder(order.id, fillAmount))
      setTxPending(false)
      if (result.ok) {
        addNotification(`✅ Продано ${fillAmount} CHT!`)
        setFillModal(null); setFillAmount(''); loadData()
      } else { addNotification(`❌ ${result.error}`) }
    }
  }

  // ═══ Отмена ордера ═══
  const handleCancel = async (orderId) => {
    setTxPending(true)
    const result = await safeCall(() => Ex.cancelOrder(orderId))
    setTxPending(false)
    if (result.ok) {
      addNotification('✅ Ордер отменён')
      loadData()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const feeBP = constants?.tradeFeeBP || 200

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">📊 Биржа CHT</h2>
        <p className="text-[11px] text-slate-500">Ордерная книга CHT ↔ USDT • Комиссия {(feeBP/100).toFixed(0)}%</p>
      </div>

      {/* ═══ Обзор рынка ═══ */}
      <div className="mx-3 mt-2 p-3 rounded-2xl glass">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="p-2 rounded-lg bg-white/5 text-center">
            <div className="text-[10px] text-slate-500">Best Bid (покупка)</div>
            <div className="text-sm font-black text-emerald-400">
              {bestPrices.bestBid ? `$${parseFloat(bestPrices.bestBid).toFixed(4)}` : '—'}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-white/5 text-center">
            <div className="text-[10px] text-slate-500">Best Ask (продажа)</div>
            <div className="text-sm font-black text-red-400">
              {bestPrices.bestAsk ? `$${parseFloat(bestPrices.bestAsk).toFixed(4)}` : '—'}
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-4 gap-1">
            {[
              [stats.totalTrades, 'Сделок'],
              [parseFloat(stats.totalVolumeCHT).toFixed(0), 'CHT об.'],
              [parseFloat(stats.totalVolumeUSDT).toFixed(0), 'USDT об.'],
              [parseFloat(stats.totalFees).toFixed(2), 'Комис.'],
            ].map(([val, label], i) => (
              <div key={i} className="p-1 rounded-lg bg-white/5 text-center">
                <div className="text-[10px] font-bold text-white">{val}</div>
                <div className="text-[7px] text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Кнопки создания ордеров ═══ */}
      {wallet && (
        <div className="mx-3 mt-2 flex gap-2">
          <button onClick={() => setShowSellModal(true)} disabled={txPending}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-red-500/30 text-red-400 bg-red-500/8 hover:bg-red-500/15">
            📤 Продать CHT
          </button>
          <button onClick={() => setShowBuyModal(true)} disabled={txPending}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/30 text-emerald-400 bg-emerald-500/8 hover:bg-emerald-500/15">
            📥 Купить CHT
          </button>
        </div>
      )}

      {/* ═══ Секции: Книга / Мои ═══ */}
      <div className="flex gap-1 px-3 mt-2">
        {[
          { id: 'book', label: '📖 Ордерная книга' },
          { id: 'my', label: `📋 Мои (${myOrders.length})` },
        ].map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border ${section === s.id ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* ═══ Ордерная книга ═══ */}
      {section === 'book' && (
        <div className="mx-3 mt-2 space-y-2">
          {/* SELL-ордера (Asks) */}
          <div className="p-3 rounded-2xl glass border-red-500/10">
            <div className="text-[11px] font-bold text-red-400 mb-2">📤 Продажа CHT ({sellOrders.length})</div>
            {loading ? (
              <div className="text-center text-[11px] text-slate-500 py-2">Загрузка...</div>
            ) : sellOrders.length === 0 ? (
              <div className="text-center text-[11px] text-slate-500 py-2">Нет активных sell-ордеров</div>
            ) : (
              <div className="space-y-1">
                {sellOrders.slice(0, 10).map(o => (
                  <div key={o.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-red-400">${parseFloat(o.pricePerCHT).toFixed(4)}</span>
                        <span className="text-[10px] text-slate-500">{parseFloat(o.remaining).toFixed(0)} CHT</span>
                      </div>
                      <div className="text-[8px] text-slate-600">{shortAddress(o.maker)}</div>
                    </div>
                    {wallet && wallet.toLowerCase() !== o.maker.toLowerCase() && (
                      <button onClick={() => { setFillModal({ order: o, side: 'sell' }); setFillAmount(o.remaining) }}
                        disabled={txPending}
                        className="px-2 py-1 rounded-lg text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        Купить
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* BUY-ордера (Bids) */}
          <div className="p-3 rounded-2xl glass border-emerald-500/10">
            <div className="text-[11px] font-bold text-emerald-400 mb-2">📥 Покупка CHT ({buyOrders.length})</div>
            {loading ? (
              <div className="text-center text-[11px] text-slate-500 py-2">Загрузка...</div>
            ) : buyOrders.length === 0 ? (
              <div className="text-center text-[11px] text-slate-500 py-2">Нет активных buy-ордеров</div>
            ) : (
              <div className="space-y-1">
                {buyOrders.slice(0, 10).map(o => (
                  <div key={o.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-emerald-400">${parseFloat(o.pricePerCHT).toFixed(4)}</span>
                        <span className="text-[10px] text-slate-500">{parseFloat(o.remaining).toFixed(0)} CHT</span>
                      </div>
                      <div className="text-[8px] text-slate-600">{shortAddress(o.maker)}</div>
                    </div>
                    {wallet && wallet.toLowerCase() !== o.maker.toLowerCase() && (
                      <button onClick={() => { setFillModal({ order: o, side: 'buy' }); setFillAmount(o.remaining) }}
                        disabled={txPending}
                        className="px-2 py-1 rounded-lg text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                        Продать
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Мои ордера ═══ */}
      {section === 'my' && (
        <div className="mx-3 mt-2 p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-gold-400 mb-2">📋 Мои активные ордера</div>
          {!wallet ? (
            <div className="text-center text-[11px] text-slate-500 py-4">Подключите кошелёк</div>
          ) : myOrders.length === 0 ? (
            <div className="text-center text-[11px] text-slate-500 py-4">Нет активных ордеров</div>
          ) : (
            <div className="space-y-1.5">
              {myOrders.map(o => {
                const isSell = o.orderType === 0
                const expiry = constants ? Ex.timeUntilExpiry(o.createdAt, constants.orderExpiry) : '?'
                return (
                  <div key={o.id} className="p-2 rounded-lg bg-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${isSell ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                          {isSell ? 'SELL' : 'BUY'}
                        </span>
                        <span className="text-[11px] font-bold text-white">#{o.id}</span>
                      </div>
                      <span className="text-[8px] text-slate-500">⏰ {expiry}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400">{parseFloat(o.remaining).toFixed(0)} CHT × ${parseFloat(o.pricePerCHT).toFixed(4)}</span>
                        <span className="text-[10px] text-gold-400 ml-2">≈ ${parseFloat(o.totalUSDT).toFixed(2)}</span>
                      </div>
                      <button onClick={() => handleCancel(o.id)} disabled={txPending}
                        className="px-2 py-1 rounded-lg text-[9px] font-bold border border-red-500/20 text-red-400 hover:bg-red-500/10">
                        ✕ Отмена
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {!wallet && (
        <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center">
          <div className="text-3xl mb-2">🔐</div>
          <div className="text-sm font-bold text-slate-300">{t('connectWallet')}</div>
        </div>
      )}

      {/* ═══ МОДАЛКА: Продать CHT ═══ */}
      {showSellModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowSellModal(false)}>
          <div className="w-full max-w-sm p-4 rounded-2xl glass" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-black text-red-400 mb-3">📤 Продать CHT</h3>
            <div className="space-y-2 mb-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Количество CHT</label>
                <input type="number" value={sellAmount} onChange={e => setSellAmount(e.target.value)} placeholder="1000"
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-red-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Цена за 1 CHT (USDT)</label>
                <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)} placeholder="0.05" step="0.001"
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-red-400/30" />
              </div>
              {sellAmount && sellPrice && (
                <div className="p-2 rounded-lg bg-white/5 text-[10px] text-slate-400 text-center">
                  {(() => { const c = Ex.calcSellTotal(sellAmount, sellPrice, feeBP); return `Итого: ${c.subtotal} USDT • Комиссия: ${c.fee} • Получите: ${c.total} USDT` })()}
                </div>
              )}
            </div>
            <button onClick={handleCreateSell} disabled={txPending || !sellAmount || !sellPrice}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/25"
              style={{ opacity: (!sellAmount || !sellPrice || txPending) ? 0.5 : 1 }}>
              {txPending ? '⏳...' : '📤 Создать sell-ордер'}
            </button>
            <button onClick={() => setShowSellModal(false)} className="w-full mt-2 py-2 text-[11px] text-slate-500">Отмена</button>
          </div>
        </div>
      )}

      {/* ═══ МОДАЛКА: Купить CHT ═══ */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowBuyModal(false)}>
          <div className="w-full max-w-sm p-4 rounded-2xl glass" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-black text-emerald-400 mb-3">📥 Купить CHT</h3>
            <div className="space-y-2 mb-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Количество CHT</label>
                <input type="number" value={buyAmount} onChange={e => setBuyAmount(e.target.value)} placeholder="1000"
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-emerald-400/30" />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-0.5">Цена за 1 CHT (USDT)</label>
                <input type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)} placeholder="0.05" step="0.001"
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-emerald-400/30" />
              </div>
              {buyAmount && buyPrice && (
                <div className="p-2 rounded-lg bg-white/5 text-[10px] text-slate-400 text-center">
                  {(() => { const c = Ex.calcBuyTotal(buyAmount, buyPrice, feeBP); return `Всего: ${c.subtotal} USDT • Комиссия: ${c.fee} • Итого: ${c.total} USDT` })()}
                </div>
              )}
            </div>
            <button onClick={handleCreateBuy} disabled={txPending || !buyAmount || !buyPrice}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
              style={{ opacity: (!buyAmount || !buyPrice || txPending) ? 0.5 : 1 }}>
              {txPending ? '⏳...' : '📥 Создать buy-ордер'}
            </button>
            <button onClick={() => setShowBuyModal(false)} className="w-full mt-2 py-2 text-[11px] text-slate-500">Отмена</button>
          </div>
        </div>
      )}

      {/* ═══ МОДАЛКА: Исполнить ордер ═══ */}
      {fillModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setFillModal(null)}>
          <div className="w-full max-w-sm p-4 rounded-2xl glass" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-black text-gold-400 mb-3">
              {fillModal.side === 'sell' ? '📥 Купить CHT' : '📤 Продать CHT'}
            </h3>
            <div className="p-2 rounded-lg bg-white/5 mb-3">
              <div className="text-[10px] text-slate-500">Цена за 1 CHT</div>
              <div className="text-sm font-bold text-gold-400">${parseFloat(fillModal.order.pricePerCHT).toFixed(4)}</div>
              <div className="text-[9px] text-slate-500">Доступно: {parseFloat(fillModal.order.remaining).toFixed(0)} CHT</div>
            </div>
            <div className="mb-3">
              <label className="text-[10px] text-slate-500 block mb-0.5">Количество CHT</label>
              <input type="number" value={fillAmount} onChange={e => setFillAmount(e.target.value)}
                max={fillModal.order.remaining}
                className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none focus:border-gold-400/30" />
            </div>
            {fillAmount && (
              <div className="p-2 rounded-lg bg-white/5 mb-3 text-[10px] text-slate-400 text-center">
                {(() => {
                  const calc = fillModal.side === 'sell'
                    ? Ex.calcBuyTotal(fillAmount, fillModal.order.pricePerCHT, feeBP)
                    : Ex.calcSellTotal(fillAmount, fillModal.order.pricePerCHT, feeBP)
                  return fillModal.side === 'sell'
                    ? `Итого: ${calc.total} USDT (вкл. комиссию ${calc.fee})`
                    : `Получите: ${calc.total} USDT (комиссия ${calc.fee})`
                })()}
              </div>
            )}
            <button onClick={handleFill} disabled={txPending || !fillAmount}
              className="w-full py-2.5 rounded-xl text-xs font-bold gold-btn"
              style={{ opacity: (!fillAmount || txPending) ? 0.5 : 1 }}>
              {txPending ? '⏳...' : fillModal.side === 'sell' ? '📥 Купить' : '📤 Продать'}
            </button>
            <button onClick={() => setFillModal(null)} className="w-full mt-2 py-2 text-[11px] text-slate-500">Отмена</button>
          </div>
        </div>
      )}
    </div>
  )
}
