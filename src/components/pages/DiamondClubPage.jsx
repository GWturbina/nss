'use client'
/**
 * NSS Diamond Club v10.2 — Инвестиционный клуб
 * GemVaultV2 + DiamondP2P + InsuranceFund + TrustScore + UserBoost + ShowcaseMarket
 * MetalVault отключён. P2P через DiamondP2P.
 * Интегрирован в существующий NSS фронтенд как таб "diamond"
 */
import { useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import * as DC from '@/lib/diamondContracts'
import { safeCall } from '@/lib/contracts'
import { shortAddress } from '@/lib/web3'
import GemConfigurator from '@/components/pages/GemConfigurator'
import DeliverySection from '@/components/pages/DeliverySection'

// ═════════════════════════════════════════════════════════
// MAIN: DiamondClubTab с sub-навигацией
// ═════════════════════════════════════════════════════════
export default function DiamondClubTab() {
  const { wallet, t } = useGameStore()
  const [section, setSection] = useState('dashboard')

  const sections = [
    { id: 'dashboard', icon: '📊', label: t('dcDashboard') },
    { id: 'gems',      icon: '💎', label: t('dcGems') },
    { id: 'metals',    icon: '🥇', label: t('dcMetals') },
    { id: 'showcase',  icon: '🏪', label: t('dcShowcase') || 'Витрина' },
    { id: 'p2p',       icon: '🤝', label: 'P2P' },
    { id: 'insurance', icon: '🛡️', label: t('dcInsurance') },
    { id: 'boost',     icon: '🚀', label: t('dcBoost') },
    { id: 'delivery',  icon: '📦', label: t('dcDelivery') },
  ]

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Заголовок */}
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">♦️ {t('dcTitle')}</h2>
        <p className="text-[11px] text-slate-500">{t('dcSubtitle')}</p>
      </div>

      {/* Sub-навигация */}
      <div className="grid grid-cols-4 gap-1 px-3 mt-1">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
              section === s.id
                ? 'bg-gold-400/15 border-gold-400/30 text-gold-400'
                : 'border-white/8 text-slate-500'
            }`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Подключи кошелёк */}
      {!wallet ? (
        <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center">
          <div className="text-3xl mb-2">🔐</div>
          <div className="text-sm font-bold text-slate-300">{t('connectWallet')}</div>
          <div className="text-[11px] text-slate-500 mt-1">{t('dcConnectHint')}</div>
        </div>
      ) : (
        <>
          {section === 'dashboard' && <DashboardSection />}
          {section === 'gems' && <GemConfigurator />}
          {section === 'metals' && <MetalsSection />}
          {section === 'showcase' && <ShowcaseSection />}
          {section === 'p2p' && <P2PSection />}
          {section === 'insurance' && <InsuranceSection />}
          {section === 'boost' && <BoostSection />}
          {section === 'delivery' && <DeliverySection />}
        </>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// DASHBOARD — Обзор
// ═════════════════════════════════════════════════════════
function DashboardSection() {
  const { wallet, t } = useGameStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!wallet) return
    setLoading(true)
    DC.loadDiamondClubDashboard(wallet).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [wallet])

  if (loading) return <Loading />
  if (!data) return <ErrorCard text={t('dcLoadError')} />

  const TIER_COLORS = { NONE: 'text-slate-500', PROBATION: 'text-red-400', BRONZE: 'text-orange-400', SILVER: 'text-slate-300', GOLD: 'text-gold-400' }
  const STATUS_LABELS = ['OWNED', 'STAKING', 'CLAIMED', 'P2P', 'RESTAKED']

  const stakingGems = data.gemPurchases.filter(p => p.status === 1)
  const totalStaking = stakingGems.length
  const totalInvested = data.gemPurchases.reduce((s, p) => s + parseFloat(p.pricePaid), 0)

  return (
    <div className="px-3 mt-2 space-y-2">
      {/* Frozen warning */}
      {data.frozen && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
          <div className="text-lg">🚫</div>
          <div className="text-[12px] font-bold text-red-400">{t('dcFrozen')}</div>
          <div className="text-[10px] text-red-300/70">{t('dcFrozenDesc')}</div>
        </div>
      )}

      {/* Баланс + Trust */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl glass">
          <div className="text-[10px] text-slate-500">{t('dcBalance')} (USDT)</div>
          <div className="text-xl font-black text-gold-400">${parseFloat(data.insuranceBalance).toFixed(2)}</div>
          <div className="text-[9px] text-slate-500">{t('dcVia48h')}</div>
        </div>
        <div className="p-3 rounded-2xl glass">
          <div className="text-[10px] text-slate-500">{t('dcTrustScore')}</div>
          <div className={`text-xl font-black ${TIER_COLORS[data.trustInfo?.tierName] || 'text-slate-500'}`}>
            {data.trustInfo?.score || 0}
          </div>
          <div className={`text-[9px] font-bold ${TIER_COLORS[data.trustInfo?.tierName] || 'text-slate-500'}`}>
            {data.trustInfo?.tierName || 'NONE'}
          </div>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label={t('dcInvested')} value={`$${totalInvested.toFixed(0)}`} color="text-gold-400" />
        <StatCard label={t('dcStaking')} value={totalStaking} color="text-emerald-400" />
        <StatCard label={t('dcStakingRate')} value={`${data.boostInfo?.currentRate || 50}%`} color="text-purple-400" />
      </div>

      {/* Активные стейкинги */}
      {stakingGems.length > 0 && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-gold-400 mb-2">💎 {t('dcActiveGemStaking')} ({stakingGems.length})</div>
          <div className="space-y-1.5">
            {stakingGems.slice(0, 3).map(p => (
              <StakingRow key={p.id} purchase={p} type="gem" t={t} />
            ))}
            {stakingGems.length > 3 && (
              <div className="text-[9px] text-slate-500 text-center">+{stakingGems.length - 3} {t('dcMore')}</div>
            )}
          </div>
        </div>
      )}

      {/* Реферальные бонусы */}
      {parseFloat(data.referralClaimable) > 0 && (
        <div className="p-3 rounded-2xl glass border-emerald-500/15">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-bold text-emerald-400">🎁 {t('dcReferralBonus')}</div>
              <div className="text-lg font-black text-emerald-400">{parseFloat(data.referralClaimable).toFixed(2)} NST</div>
            </div>
            <ClaimReferralButton t={t} />
          </div>
        </div>
      )}

      {/* Глобальная статистика */}
      {data.gemStats && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-blue-400 mb-2">📈 {t('dcGlobalStats')}</div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[11px] font-black text-gold-400">${parseFloat(data.gemStats.totalSales).toFixed(0)}</div>
              <div className="text-[9px] text-slate-500">{t('dcGemSales')}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[11px] font-black text-emerald-400">${parseFloat(data.gemStats.reserve).toFixed(0)}</div>
              <div className="text-[9px] text-slate-500">{t('dcReserve')}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[11px] font-black text-blue-400">{data.gemStats.purchases}</div>
              <div className="text-[9px] text-slate-500">{t('dcTotalPurchases')}</div>
            </div>
            {data.p2pStats && (
              <div className="p-2 rounded-lg bg-white/5">
                <div className="text-[11px] font-black text-purple-400">{data.p2pStats.trades}</div>
                <div className="text-[9px] text-slate-500">P2P {t('dcTrades') || 'сделок'}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// GEMS — Покупка камней
// ═════════════════════════════════════════════════════════
function GemsSection() {
  const { wallet, addNotification, setTxPending, txPending, t } = useGameStore()
  const [gems, setGems] = useState([])
  const [myPurchases, setMyPurchases] = useState([])
  const [selected, setSelected] = useState(null)
  const [buyMode, setBuyMode] = useState(1) // 0=PURCHASE, 1=ASSET
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const [g, p] = await Promise.all([
      DC.getGemsList().catch(() => []),
      wallet ? DC.getUserGemPurchases(wallet).catch(() => []) : [],
    ])
    setGems(g)
    setMyPurchases(p)
    setLoading(false)
  }, [wallet])

  useEffect(() => { reload() }, [reload])

  const handleBuy = async (gem) => {
    if (!wallet) return
    setTxPending(true)
    const result = await safeCall(() => DC.buyGemV2(gem.id, buyMode))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ 💎 ${gem.name} — ${t('dcGemBought')}!`)
      setSelected(null)
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleClaim = async (purchaseId, option) => {
    setTxPending(true)
    const result = await safeCall(() => DC.claimGemStaking(purchaseId, option))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('dcStakingClaimed')}!`)
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleRestake = async (purchaseId) => {
    setTxPending(true)
    const result = await safeCall(() => DC.restakeGem(purchaseId))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('dcRestaked')}!`)
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleConvert = async (purchaseId) => {
    setTxPending(true)
    const result = await safeCall(() => DC.convertGemToAsset(purchaseId))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('dcConverted')}!`)
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  if (loading) return <Loading />

  const STATUS_EMOJI = { 0: '📦', 1: '⏳', 2: '✅', 3: '🏪', 4: '🔄' }
  const STATUS_TEXT = { 0: t('dcOwned'), 1: t('dcStakingActive'), 2: t('dcClaimed'), 3: t('dcListedP2P'), 4: t('dcRestaked') }

  return (
    <div className="px-3 mt-2 space-y-2">
      {/* Мои покупки */}
      {myPurchases.length > 0 && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-purple-400 mb-2">🏆 {t('dcMyGems')} ({myPurchases.length})</div>
          <div className="space-y-1.5">
            {myPurchases.map(p => (
              <div key={p.id} className="p-2 rounded-xl bg-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-white">{STATUS_EMOJI[p.status]} #{p.id}</span>
                    <span className="text-[10px] text-slate-500 ml-2">${parseFloat(p.pricePaid).toFixed(2)}</span>
                    <span className="text-[9px] text-slate-600 ml-1">({STATUS_TEXT[p.status]})</span>
                  </div>
                  <div className="flex gap-1">
                    {/* OWNED → Convert */}
                    {p.status === 0 && (
                      <button onClick={() => handleConvert(p.id)} disabled={txPending}
                        className="px-2 py-1 rounded-lg text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                        ⏳ {t('dcConvert')}
                      </button>
                    )}
                    {/* STAKING + ready → Claim options */}
                    {p.status === 1 && p.rewardReady && (
                      <div className="flex gap-1">
                        <button onClick={() => handleClaim(p.id, 0)} disabled={txPending}
                          className="px-2 py-1 rounded-lg text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          💰 {t('dcTakeProfit')}
                        </button>
                        <button onClick={() => handleClaim(p.id, 2)} disabled={txPending}
                          className="px-2 py-1 rounded-lg text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                          📦 {t('dcTakePhysical')}
                        </button>
                      </div>
                    )}
                    {/* STAKING not ready → countdown */}
                    {p.status === 1 && !p.rewardReady && (
                      <div className="text-[9px] text-slate-500">
                        ⏳ {t('dcEndsAt')} {new Date(p.stakingEndsAt * 1000).toLocaleDateString()}
                      </div>
                    )}
                    {/* CLAIMED → Restake */}
                    {p.status === 2 && (
                      <button onClick={() => handleRestake(p.id)} disabled={txPending}
                        className="px-2 py-1 rounded-lg text-[9px] font-bold bg-gold-400/15 text-gold-400 border border-gold-400/20">
                        🔄 {t('dcRestake')}
                      </button>
                    )}
                  </div>
                </div>
                {p.status === 1 && (
                  <div className="mt-1 text-[9px] text-emerald-400">
                    {t('dcPendingReward')}: ${parseFloat(p.pendingReward).toFixed(2)} ({p.stakingRateBP / 100}%)
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Каталог камней */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-gold-400 mb-2">💎 {t('dcGemCatalog')}</div>

        {/* Режим покупки */}
        <div className="flex gap-1 mb-2">
          <button onClick={() => setBuyMode(0)}
            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border ${buyMode === 0 ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'border-white/8 text-slate-500'}`}>
            📦 {t('dcModePurchase')}
          </button>
          <button onClick={() => setBuyMode(1)}
            className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border ${buyMode === 1 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'border-white/8 text-slate-500'}`}>
            ⏳ {t('dcModeAsset')}
          </button>
        </div>

        {gems.length === 0 ? (
          <div className="text-[11px] text-slate-500 text-center py-4">{t('dcNoGems')}</div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gems.filter(g => g.available).map(gem => (
              <div key={gem.id} onClick={() => setSelected(gem)}
                className="p-3 rounded-xl bg-white/5 cursor-pointer hover:bg-white/8 transition-all border border-transparent hover:border-gold-400/20">
                <div className="text-center">
                  <div className="text-2xl mb-1">💎</div>
                  <div className="text-[11px] font-bold text-white truncate">{gem.name}</div>
                  <div className="text-[10px] text-slate-500 line-through">${parseFloat(gem.marketPrice).toFixed(0)}</div>
                  <div className="text-[12px] font-black text-gold-400">${parseFloat(gem.clubPrice).toFixed(0)}</div>
                  <div className="text-[9px] text-emerald-400">-35% {t('dcClubDiscount')}</div>
                  {gem.fractional && (
                    <div className="text-[8px] text-purple-400 mt-0.5">
                      {gem.totalFractions - gem.soldFractions}/{gem.totalFractions} {t('dcFractions')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модалка покупки */}
      {selected && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm p-4 rounded-2xl glass" onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card, #1e1e3a)' }}>
            <div className="text-center mb-3">
              <div className="text-4xl mb-2">💎</div>
              <div className="text-lg font-black text-white">{selected.name}</div>
              <div className="text-[11px] text-slate-500">{t('dcCertificate')}: {selected.certHash ? selected.certHash.slice(0, 12) + '...' : '—'}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="p-2 rounded-xl bg-white/5 text-center">
                <div className="text-[10px] text-slate-500">{t('dcMarketPrice')}</div>
                <div className="text-[12px] font-bold text-slate-400 line-through">${parseFloat(selected.marketPrice).toFixed(0)}</div>
              </div>
              <div className="p-2 rounded-xl bg-white/5 text-center">
                <div className="text-[10px] text-slate-500">{t('dcClubPrice')}</div>
                <div className="text-[14px] font-black text-gold-400">${parseFloat(selected.clubPrice).toFixed(2)}</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-white/5 mb-3">
              <div className="text-[10px] text-slate-500 mb-1">{t('dcBuyMode')}:</div>
              <div className="flex gap-1">
                <button onClick={() => setBuyMode(0)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border ${buyMode === 0 ? 'bg-blue-500/15 border-blue-500/30 text-blue-400' : 'border-white/8 text-slate-500'}`}>
                  📦 {t('dcModePurchase')}
                </button>
                <button onClick={() => setBuyMode(1)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border ${buyMode === 1 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'border-white/8 text-slate-500'}`}>
                  ⏳ {t('dcModeAsset')}
                </button>
              </div>
              <div className="text-[9px] text-slate-500 mt-1">
                {buyMode === 0 ? t('dcPurchaseDesc') : t('dcAssetDesc')}
              </div>
            </div>

            <button onClick={() => handleBuy(selected)} disabled={txPending}
              className="w-full py-3 rounded-xl text-sm font-bold gold-btn"
              style={{ opacity: txPending ? 0.5 : 1 }}>
              {txPending ? `⏳ ${t('loading')}` : `💎 ${t('dcBuyFor')} $${parseFloat(selected.clubPrice).toFixed(2)}`}
            </button>

            <button onClick={() => setSelected(null)}
              className="w-full mt-2 py-2 rounded-xl text-[11px] font-bold text-slate-500 border border-white/8">
              {t('dcCancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// METALS — Драгоценные металлы (временно отключены)
// ═════════════════════════════════════════════════════════
function MetalsSection() {
  const { t } = useGameStore()
  return (
    <div className="px-3 mt-2 space-y-2">
      <div className="p-6 rounded-2xl glass text-center">
        <div className="text-4xl mb-3">🥇</div>
        <div className="text-lg font-black text-gold-400">{t('dcMetals') || 'Драгоценные металлы'}</div>
        <div className="text-[12px] text-slate-400 mt-2">{t('dcComingSoon') || 'Скоро'}</div>
        <div className="text-[11px] text-slate-500 mt-3 max-w-xs mx-auto">
          {t('dcMetalsComingDesc') || 'Раздел драгоценных металлов (золото, серебро, платина) находится в разработке и будет доступен в ближайшем обновлении.'}
        </div>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-400/10 border border-gold-400/20">
          <span className="text-[11px] font-bold text-gold-400">🔔 {t('dcStayTuned') || 'Следите за обновлениями'}</span>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// INSURANCE — Страховой фонд + вывод
// ═════════════════════════════════════════════════════════
function InsuranceSection() {
  const { wallet, addNotification, setTxPending, txPending, t } = useGameStore()
  const [balance, setBalance] = useState('0')
  const [requests, setRequests] = useState([])
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    const [bal, reqs] = await Promise.all([
      DC.getInsuranceUserBalance(wallet).catch(() => '0'),
      DC.getUserWithdrawRequests(wallet).catch(() => []),
    ])
    setBalance(bal)
    setRequests(reqs)
    setLoading(false)
  }, [wallet])

  useEffect(() => { reload() }, [reload])

  const handleRequestWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return
    setTxPending(true)
    const result = await safeCall(() => DC.requestWithdraw(withdrawAmount))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('dcWithdrawRequested')} $${withdrawAmount}`)
      setWithdrawAmount('')
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleExecuteWithdraw = async (requestId) => {
    setTxPending(true)
    const result = await safeCall(() => DC.executeWithdraw(requestId))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('dcWithdrawCompleted')}!`)
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  if (loading) return <Loading />

  const now = Math.floor(Date.now() / 1000)
  const STATUS_LABELS = { 1: t('dcPending'), 3: t('dcFrozenStatus'), 4: t('dcCompleted') }

  return (
    <div className="px-3 mt-2 space-y-2">
      {/* Баланс */}
      <div className="p-4 rounded-2xl glass text-center">
        <div className="text-[10px] text-slate-500">{t('dcInsuranceBalance')}</div>
        <div className="text-2xl font-black text-gold-400">${parseFloat(balance).toFixed(2)}</div>
        <div className="text-[9px] text-slate-500">{t('dcWithdrawDelay')}</div>
      </div>

      {/* Запрос вывода */}
      {parseFloat(balance) > 0 && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-emerald-400 mb-2">💸 {t('dcRequestWithdraw')}</div>
          <div className="flex gap-2">
            <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="USDT" max={balance}
              className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none text-center" />
            <button onClick={() => setWithdrawAmount(parseFloat(balance).toFixed(2))}
              className="px-3 py-2 rounded-xl text-[10px] font-bold text-gold-400 border border-gold-400/20">
              MAX
            </button>
          </div>
          <button onClick={handleRequestWithdraw} disabled={txPending || !withdrawAmount}
            className="mt-2 w-full py-2.5 rounded-xl text-xs font-bold gold-btn"
            style={{ opacity: (!withdrawAmount || txPending) ? 0.5 : 1 }}>
            {txPending ? `⏳ ${t('loading')}` : `💸 ${t('dcWithdraw')}`}
          </button>
        </div>
      )}

      {/* Запросы на вывод */}
      {requests.length > 0 && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-blue-400 mb-2">📋 {t('dcWithdrawHistory')}</div>
          <div className="space-y-1.5">
            {requests.filter(r => r.status >= 1).map(req => {
              const isReady = req.status === 1 && now >= req.availableAt
              const timeLeft = req.availableAt - now
              const hoursLeft = Math.max(0, Math.ceil(timeLeft / 3600))

              return (
                <div key={req.id} className="p-2 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-white">${parseFloat(req.amount).toFixed(2)}</span>
                      <span className="text-[9px] text-slate-500 ml-2">{STATUS_LABELS[req.status] || '—'}</span>
                    </div>
                    {req.status === 1 && (
                      isReady ? (
                        <button onClick={() => handleExecuteWithdraw(req.id)} disabled={txPending}
                          className="px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          ✅ {t('dcExecute')}
                        </button>
                      ) : (
                        <span className="text-[9px] text-gold-400">⏳ {hoursLeft}h</span>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Как работает */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-blue-400 mb-2">📖 {t('dcHowInsuranceWorks')}</div>
        <div className="space-y-1 text-[11px] text-slate-300">
          <p>1. {t('dcInsStep1')}</p>
          <p>2. {t('dcInsStep2')}</p>
          <p>3. {t('dcInsStep3')}</p>
          <p>4. {t('dcInsStep4')}</p>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// SHOWCASE — Витрина (ShowcaseMarket)
// ═════════════════════════════════════════════════════════
function ShowcaseSection() {
  const { wallet, addNotification, setTxPending, txPending, t } = useGameStore()
  const [listings, setListings] = useState([])
  const [stats, setStats] = useState(null)
  const [isAgent, setIsAgent] = useState(false)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    const [l, s, agent] = await Promise.all([
      DC.getShowcaseListings().catch(() => []),
      DC.getShowcaseStats().catch(() => null),
      DC.checkIsAgent(wallet).catch(() => false),
    ])
    setListings(l)
    setStats(s)
    setIsAgent(agent)
    setLoading(false)
  }, [wallet])

  useEffect(() => { reload() }, [reload])

  const handleBuyLicense = async () => {
    setTxPending(true)
    const result = await safeCall(() => DC.buyAgentLicense())
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ 🏪 ${t('dcAgentLicenseBought') || 'Лицензия агента получена'}!`)
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleCancel = async (listingId) => {
    setTxPending(true)
    const result = await safeCall(() => DC.cancelShowcaseListing(listingId))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('dcListingCancelled') || 'Листинг отменён'}`)
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  if (loading) return <Loading />

  const ASSET_TYPES = ['💎 Камень', '🥇 Металл', '💍 Ювелирка', '🏠 Другое']

  return (
    <div className="px-3 mt-2 space-y-2">
      {/* Статистика витрины */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <StatCard label={t('dcTotal') || 'Всего'} value={stats.total} color="text-blue-400" />
          <StatCard label={t('dcSales') || 'Продаж'} value={stats.sales} color="text-emerald-400" />
          <StatCard label={t('dcCommissions') || 'Комиссии'} value={`$${parseFloat(stats.commissions).toFixed(0)}`} color="text-gold-400" />
        </div>
      )}

      {/* Статус агента */}
      <div className="p-3 rounded-2xl glass">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-bold text-purple-400">🏪 {t('dcAgentStatus') || 'Статус агента'}</div>
            <div className={`text-[11px] font-bold ${isAgent ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isAgent ? `✅ ${t('dcAgentActive') || 'Активен'}` : `❌ ${t('dcNotAgent') || 'Нет лицензии'}`}
            </div>
          </div>
          {!isAgent && (
            <button onClick={handleBuyLicense} disabled={txPending}
              className="px-3 py-2 rounded-xl text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
              {txPending ? '⏳' : `🏪 ${t('dcBuyLicense') || 'Купить лицензию'}`}
            </button>
          )}
        </div>
      </div>

      {/* Активные листинги */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-gold-400 mb-2">📋 {t('dcActiveListings') || 'Активные объявления'} ({listings.length})</div>
        {listings.length === 0 ? (
          <div className="text-[11px] text-slate-500 text-center py-4">{t('dcNoListings') || 'Нет активных объявлений'}</div>
        ) : (
          <div className="space-y-1.5">
            {listings.map(l => (
              <div key={l.id} className="p-2.5 rounded-xl bg-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-white">{l.title || `#${l.id}`}</div>
                    <div className="text-[9px] text-slate-500">
                      {ASSET_TYPES[l.assetType] || '📦'} • {shortAddress(l.seller)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[12px] font-black text-gold-400">${parseFloat(l.price).toFixed(2)}</div>
                    {l.seller.toLowerCase() === wallet?.toLowerCase() && (
                      <button onClick={() => handleCancel(l.id)} disabled={txPending}
                        className="mt-1 px-2 py-0.5 rounded-lg text-[8px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                        ✕ {t('cancel') || 'Отмена'}
                      </button>
                    )}
                  </div>
                </div>
                {l.description && (
                  <div className="text-[9px] text-slate-400 mt-1 line-clamp-2">{l.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// P2P — DiamondP2P торговля
// ═════════════════════════════════════════════════════════
function P2PSection() {
  const { wallet, addNotification, setTxPending, txPending, t } = useGameStore()
  const [listings, setListings] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const [l, s] = await Promise.all([
      DC.getP2PListings().catch(() => []),
      DC.getP2PStats().catch(() => null),
    ])
    setListings(l)
    setStats(s)
    setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const handleBuy = async (listing) => {
    setTxPending(true)
    const result = await safeCall(() => DC.buyFromP2P(listing.id))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ 🤝 P2P ${t('dcGemBought') || 'Покупка совершена'}!`)
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleCancel = async (listing) => {
    setTxPending(true)
    const result = await safeCall(() => DC.cancelP2PListing(listing.id))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('dcP2PCancelled') || 'Листинг отменён'}`)
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="px-3 mt-2 space-y-2">
      {/* P2P статистика */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <StatCard label={t('dcTrades') || 'Сделок'} value={stats.trades} color="text-blue-400" />
          <StatCard label={t('dcVolume') || 'Оборот'} value={`$${parseFloat(stats.volume).toFixed(0)}`} color="text-emerald-400" />
          <StatCard label={t('dcCommissions') || 'Комиссии'} value={`$${parseFloat(stats.commissions).toFixed(0)}`} color="text-gold-400" />
        </div>
      )}

      {/* Активные P2P листинги */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-gold-400 mb-2">🤝 P2P {t('dcMarket') || 'Рынок'} ({listings.length})</div>
        {listings.length === 0 ? (
          <div className="text-[11px] text-slate-500 text-center py-4">{t('dcNoP2PListings') || 'Нет активных P2P предложений'}</div>
        ) : (
          <div className="space-y-1.5">
            {listings.map(l => {
              const isMine = l.seller.toLowerCase() === wallet?.toLowerCase()
              return (
                <div key={l.id} className="p-2.5 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-white">#{l.purchaseId}</span>
                      <span className="text-[9px] text-slate-500 ml-2">{shortAddress(l.seller)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black text-gold-400">${parseFloat(l.price).toFixed(2)}</span>
                      {isMine ? (
                        <button onClick={() => handleCancel(l)} disabled={txPending}
                          className="px-2 py-1 rounded-lg text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                          ✕ {t('cancel') || 'Отмена'}
                        </button>
                      ) : (
                        <button onClick={() => handleBuy(l)} disabled={txPending}
                          className="px-2 py-1 rounded-lg text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          {txPending ? '⏳' : `💰 ${t('buy') || 'Купить'}`}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Как выставить на P2P */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-blue-400 mb-2">📖 {t('dcHowP2P') || 'Как продать на P2P'}</div>
        <div className="space-y-1 text-[11px] text-slate-300">
          <p>1. {t('dcP2PStep1') || 'Купите камень или актив через GemVault'}</p>
          <p>2. {t('dcP2PStep2') || 'Перейдите в раздел "Мои покупки" → кнопка P2P'}</p>
          <p>3. {t('dcP2PStep3') || 'Укажите цену в USDT и подтвердите листинг'}</p>
          <p>4. {t('dcP2PStep4') || 'Покупатель оплачивает через DiamondP2P контракт'}</p>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// BOOST — Увеличение ставки стейкинга
// ═════════════════════════════════════════════════════════
function BoostSection() {
  const { wallet, nst, addNotification, setTxPending, txPending, t } = useGameStore()
  const [boostInfo, setBoostInfo] = useState(null)
  const [trustInfo, setTrustInfo] = useState(null)
  const [burnAmount, setBurnAmount] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    const [boost, trust] = await Promise.all([
      DC.getUserBoostInfo(wallet).catch(() => null),
      DC.getUserTrustInfo(wallet).catch(() => null),
    ])
    setBoostInfo(boost)
    setTrustInfo(trust)
    setLoading(false)
  }, [wallet])

  useEffect(() => { reload() }, [reload])

  const handleBurn = async () => {
    if (!burnAmount || parseFloat(burnAmount) <= 0) return
    setTxPending(true)
    const result = await safeCall(() => DC.burnNSTForBoost(burnAmount))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ 🔥 ${burnAmount} NST ${t('dcBurned')}!`)
      setBurnAmount('')
      reload()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  if (loading) return <Loading />

  const TIER_COLORS = { NONE: 'text-slate-500', PROBATION: 'text-red-400', BRONZE: 'text-orange-400', SILVER: 'text-slate-300', GOLD: 'text-gold-400' }

  return (
    <div className="px-3 mt-2 space-y-2">
      {/* Текущая ставка */}
      <div className="p-4 rounded-2xl glass text-center">
        <div className="text-[10px] text-slate-500">{t('dcCurrentRate')}</div>
        <div className="text-3xl font-black text-emerald-400">{boostInfo?.currentRate || 50}%</div>
        <div className="text-[9px] text-slate-500">{t('dcAnnualReturn')}</div>
      </div>

      {/* TrustScore */}
      {trustInfo && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-blue-400 mb-2">🛡️ {t('dcTrustScore')}</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/5">
              <div className={`text-lg font-black ${TIER_COLORS[trustInfo.tierName]}`}>{trustInfo.score}</div>
              <div className="text-[9px] text-slate-500">{t('dcScore')}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <div className={`text-[12px] font-bold ${TIER_COLORS[trustInfo.tierName]}`}>{trustInfo.tierName}</div>
              <div className="text-[9px] text-slate-500">{t('dcTier')}</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <div className="text-[12px] font-bold text-emerald-400">{trustInfo.canPurchase ? '✅' : '❌'}</div>
              <div className="text-[9px] text-slate-500">{t('dcCanBuy')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Burn NST */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-orange-400 mb-2">🔥 {t('dcBurnNST')}</div>
        <div className="text-[11px] text-slate-400 mb-2">{t('dcBurnDesc')}</div>

        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="p-2 rounded-lg bg-white/5">
            <div className="text-[11px] font-bold text-orange-400">{parseFloat(boostInfo?.nstBurned || 0).toFixed(0)}</div>
            <div className="text-[8px] text-slate-500">{t('dcBurned')}</div>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <div className="text-[11px] font-bold text-gold-400">{nst.toFixed(0)}</div>
            <div className="text-[8px] text-slate-500">{t('dcMyNST')}</div>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <div className="text-[11px] font-bold text-purple-400">{parseFloat(boostInfo?.nextBurnRequired || 0).toFixed(0)}</div>
            <div className="text-[8px] text-slate-500">{t('dcNextBoost')}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <input type="number" value={burnAmount} onChange={e => setBurnAmount(e.target.value)}
            placeholder="NST"
            className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none text-center" />
          <button onClick={handleBurn} disabled={txPending || !burnAmount}
            className="px-4 py-2 rounded-xl text-[11px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/20"
            style={{ opacity: (!burnAmount || txPending) ? 0.5 : 1 }}>
            {txPending ? '⏳' : `🔥 ${t('dcBurn')}`}
          </button>
        </div>

        {/* Таблица уровней */}
        <div className="mt-3 text-[9px] text-slate-500">
          <div className="grid grid-cols-3 gap-1">
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">0 NST</b><br/>50%</div>
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">10K NST</b><br/>55%</div>
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">30K NST</b><br/>60%</div>
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">50K NST</b><br/>65%</div>
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">80K NST</b><br/>70%</div>
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-gold-400">100K NST</b><br/>75%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═════════════════════════════════════════════════════════

function Loading() {
  return <div className="flex items-center justify-center py-12"><div className="text-2xl animate-spin">💎</div></div>
}

function ErrorCard({ text }) {
  return <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center text-red-400 text-[12px]">❌ {text}</div>
}

function StatCard({ label, value, color }) {
  return (
    <div className="p-2 rounded-2xl glass text-center">
      <div className={`text-lg font-black ${color}`}>{value}</div>
      <div className="text-[9px] text-slate-500">{label}</div>
    </div>
  )
}

function StakingRow({ purchase, type, t }) {
  const daysLeft = Math.max(0, Math.ceil((purchase.stakingEndsAt - Date.now() / 1000) / 86400))
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
      <div>
        <span className="text-[11px] font-bold text-white">#{purchase.id}</span>
        <span className="text-[10px] text-slate-500 ml-2">${parseFloat(purchase.pricePaid).toFixed(0)}</span>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold text-emerald-400">+${parseFloat(purchase.pendingReward).toFixed(2)}</div>
        <div className="text-[8px] text-slate-500">{daysLeft > 0 ? `${daysLeft} ${t('dcDays')}` : `✅ ${t('dcReady')}`}</div>
      </div>
    </div>
  )
}

function ClaimReferralButton({ t }) {
  const { setTxPending, txPending, addNotification } = useGameStore()
  const handleClaim = async () => {
    setTxPending(true)
    const result = await safeCall(() => DC.claimReferralBonus())
    setTxPending(false)
    if (result.ok) addNotification(`✅ ${t('dcReferralClaimed')}!`)
    else addNotification(`❌ ${result.error}`)
  }
  return (
    <button onClick={handleClaim} disabled={txPending}
      className="px-3 py-2 rounded-xl text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
      {txPending ? '⏳' : `🎁 ${t('claim')}`}
    </button>
  )
}
