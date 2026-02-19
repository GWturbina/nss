'use client'
import { useState, useEffect } from 'react'
import useGameStore from '@/lib/store'
import * as C from '@/lib/contracts'
import ADDRESSES from '@/contracts/addresses'
import { TeamsAdmin } from '@/components/pages/ExtraPages'
import { GEMS as GEMS_DEFAULT, METALS as METALS_DEFAULT, GEM_ECONOMICS as GEM_ECON_DEFAULT, METAL_ECONOMICS as METAL_ECON_DEFAULT } from '@/lib/gameData'

export default function AdminPanel() {
  const { wallet, isAdmin, ownerWallet, addNotification, setTxPending, txPending, 
    news, quests, addNews, removeNews, addQuest, removeQuest, setLevel, t } = useGameStore()

  const [activeSection, setActiveSection] = useState('overview')
  const [newNews, setNewNews] = useState('')
  const [newQuest, setNewQuest] = useState({ name: '', reward: '' })
  const [authAddress, setAuthAddress] = useState('')
  const [contractStats, setContractStats] = useState(null)
  const [isPaused, setIsPaused] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)

  const isOwner = isAdmin || (wallet && ownerWallet && wallet.toLowerCase() === ownerWallet.toLowerCase())

  const SECTIONS = [
    { id: 'overview', icon: '📊', label: t('overview') },
    { id: 'init', icon: '🚀', label: t('activation') },
    { id: 'gift', icon: '🎁', label: t('gifts') },
    { id: 'teamlinks', icon: '🤝', label: t('teams') },
    { id: 'contracts', icon: '📜', label: t('contracts') },
    { id: 'withdraw', icon: '💰', label: t('withdrawAdmin') },
    { id: 'funds', icon: '🏦', label: 'Фонды' },
    { id: 'matrix', icon: '🏔', label: t('business') },
    { id: 'auth', icon: '🔑', label: t('authorization') },
    { id: 'content', icon: '📢', label: t('content') },
    { id: 'gems', icon: '💎', label: 'Камни' },
    { id: 'metals', icon: '🥇', label: 'Металлы' },
    { id: 'test', icon: '🎮', label: t('test') },
  ]

  // State for table initialization
  const [initTable, setInitTable] = useState('0')
  const [founders, setFounders] = useState(['', '', '', '', '', '', ''])
  const [tablesInit, setTablesInit] = useState({ table0: null, table1: null, table2: null })

  // State for funds panel
  const [fundsData, setFundsData] = useState(null)   // { clubFund, authorFund, ... + balances }
  const [fundsLoading, setFundsLoading] = useState(false)
  const [withdrawingFund, setWithdrawingFund] = useState(null)  // имя фонда который сейчас выводим

  // State for gems/metals editing
  const [gems, setGems] = useState(GEMS_DEFAULT)
  const [metals, setMetals] = useState(METALS_DEFAULT)
  const [gemEcon, setGemEcon] = useState(GEM_ECON_DEFAULT)
  const [metalEcon, setMetalEcon] = useState(METAL_ECON_DEFAULT)
  const [editingItem, setEditingItem] = useState(null)   // {type:'gem'|'metal', idx, data}
  const [gemTab, setGemTab] = useState('list')           // 'list' | 'economics'
  const [metalTab, setMetalTab] = useState('list')

  // State for gift slots
  const [giftAddress, setGiftAddress] = useState('')
  const [giftT50, setGiftT50] = useState(true)
  const [giftT250, setGiftT250] = useState(false)
  const [giftT1000, setGiftT1000] = useState(false)

  // Load tables init status
  const loadTablesInit = async () => {
    try {
      const status = await C.getTablesInitStatus()
      setTablesInit(status)
    } catch {}
  }

  useEffect(() => { if (isOwner) loadTablesInit() }, [isOwner])

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">⚙️ {t('adminPanel')}</h2>
        <p className="text-[10px] text-slate-500">{t('owner')}: {ownerWallet ? `${ownerWallet.slice(0, 8)}...` : '?'}</p>
      </div>

      {!isOwner && (
        <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center">
          <div className="text-3xl mb-2">🔐</div>
          <div className="text-sm font-bold text-red-400">{t('accessDenied')}</div>
          <div className="text-[11px] text-slate-500 mt-1">{t('connectOwnerWallet')}</div>
          <div className="text-[10px] text-slate-600 mt-2">{t('yourWallet')}: {wallet ? `${wallet.slice(0, 10)}...` : '—'}</div>
        </div>
      )}

      {isOwner && (
        <>
          {/* Section tabs */}
          <div className="flex flex-wrap gap-1 px-3 mt-1">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`px-2 py-1.5 rounded-xl text-[9px] font-bold border transition-all ${
                  activeSection === s.id 
                    ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' 
                    : 'border-white/8 text-slate-500 hover:border-white/15'
                }`}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeSection === 'overview' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-emerald-400 mb-2">📊 {t('contractHealth')}</div>
                {contractStats ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <div className="text-sm font-black text-gold-400">{contractStats.balance}</div>
                      <div className="text-[9px] text-slate-500">{t('usdtBalance')}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <div className="text-sm font-black text-emerald-400">{contractStats.surplus}</div>
                      <div className="text-[9px] text-slate-500">{t('surplus')}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <div className="text-sm font-black text-purple-400">{contractStats.owedWithdrawals}</div>
                      <div className="text-[9px] text-slate-500">{t('toWithdrawAdmin')}</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 text-center">
                      <div className="text-sm font-black text-pink-400">{contractStats.owedCharity}</div>
                      <div className="text-[9px] text-slate-500">{t('charityAdmin')}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-500 text-[11px]">{t('loadingFromContract')}</div>
                )}
                <button onClick={async () => {
                  setLoadingStats(true)
                  try { const stats = await C.getContractHealth(); setContractStats(stats) } catch {}
                  setLoadingStats(false)
                }} disabled={loadingStats}
                  className="mt-2 w-full py-2 rounded-xl text-[10px] font-bold border border-white/10 text-slate-400 hover:text-white">
                  {loadingStats ? '⏳...' : `🔄 ${t('refreshData')}`}
                </button>
              </div>

              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-blue-400 mb-2">🔧 {t('contractStatus')}</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-slate-400">RealEstateMatrix</span>
                  <span className={`text-[10px] font-bold ${isPaused ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isPaused ? `⏸ ${t('paused')}` : `✅ ${t('active')}`}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={async () => {
                    setTxPending(true)
                    const r = await C.safeCall(() => C.pauseContract('RealEstateMatrix'))
                    setTxPending(false)
                    if (r.ok) { setIsPaused(true); addNotification(`⏸ ${t('paused')}`) }
                  }} disabled={txPending || isPaused}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20"
                    style={{ opacity: isPaused ? 0.4 : 1 }}>
                    ⏸ {t('pause')}
                  </button>
                  <button onClick={async () => {
                    setTxPending(true)
                    const r = await C.safeCall(() => C.unpauseContract('RealEstateMatrix'))
                    setTxPending(false)
                    if (r.ok) { setIsPaused(false); addNotification(`▶️ ${t('active')}`) }
                  }} disabled={txPending || !isPaused}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    style={{ opacity: !isPaused ? 0.4 : 1 }}>
                    ▶️ {t('unpause')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activation (init) */}
          {activeSection === 'init' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-gold-400 mb-2">🚀 {t('tableActivation')}</div>
                
                <div className="mb-3">
                  <div className="text-[10px] text-slate-500 mb-1">{t('tableStatus')}:</div>
                  <div className="flex gap-2">
                    {[
                      { id: 0, name: `$50 (${t('small')})`, status: tablesInit.table0 },
                      { id: 1, name: `$250 (${t('medium')})`, status: tablesInit.table1 },
                      { id: 2, name: `$1000 (${t('large')})`, status: tablesInit.table2 },
                    ].map(tb => (
                      <div key={tb.id} className={`flex-1 p-2 rounded-lg text-center text-[10px] ${tb.status ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/5 text-slate-500'}`}>
                        {tb.name}
                        <div className="text-[9px] mt-0.5">{tb.status ? `✅ ${t('activated')}` : `❌ ${t('notActivated')}`}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={loadTablesInit} className="mt-1 text-[9px] text-slate-500 hover:text-white">🔄 {t('refreshStatus')}</button>
                </div>

                <div className="mb-2">
                  <label className="text-[10px] text-slate-500 mb-1 block">{t('selectTable')}:</label>
                  <div className="flex gap-1">
                    {['0', '1', '2'].map(id => (
                      <button key={id} onClick={() => setInitTable(id)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border ${initTable === id ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
                        {['$50', '$250', '$1000'][parseInt(id)]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-2">
                  <label className="text-[10px] text-slate-500 mb-1 block">{t('founderAddresses')}:</label>
                  {founders.map((f, i) => (
                    <input key={i} value={f} onChange={e => {
                      const newF = [...founders]
                      newF[i] = e.target.value
                      setFounders(newF)
                    }}
                      placeholder={`${t('address')} ${i + 1} (0x...)`}
                      className="w-full p-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none mb-1" />
                  ))}
                  <button onClick={() => setFounders(founders.map(() => wallet))}
                    className="text-[9px] text-gold-400 hover:underline">
                    📋 {t('fillWithYourAddress')}
                  </button>
                </div>

                <button onClick={async () => {
                  const valid = founders.filter(f => /^0x[a-fA-F0-9]{40}$/.test(f))
                  if (valid.length !== 7) {
                    addNotification(`❌ ${t('need7Addresses')}`); return
                  }
                  setTxPending(true)
                  const result = await C.safeCall(() => C.initializeFounderSlots(parseInt(initTable), founders))
                  setTxPending(false)
                  if (result.ok) {
                    addNotification(`✅ ${['$50', '$250', '$1000'][parseInt(initTable)]} ${t('tableActivated')}`)
                    loadTablesInit()
                  } else {
                    addNotification(`❌ ${result.error}`)
                  }
                }} disabled={txPending}
                  className="w-full py-2.5 rounded-xl text-xs font-bold gold-btn">
                  {txPending ? `⏳ ${t('activating')}` : `🚀 ${t('activate')} ${['$50', '$250', '$1000'][parseInt(initTable)]}`}
                </button>

                <div className="mt-2 text-[9px] text-slate-500">
                  ℹ️ {t('afterActivation')}
                </div>
              </div>
            </div>
          )}

          {/* Gift slots */}
          {activeSection === 'gift' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-pink-400 mb-2">🎁 {t('giftFreeSlots')}</div>
                <div className="text-[10px] text-slate-400 mb-3">{t('giftDesc')}</div>

                <div className="mb-2">
                  <label className="text-[10px] text-slate-500 mb-1 block">{t('recipientAddress')}:</label>
                  <input value={giftAddress} onChange={e => setGiftAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none" />
                </div>

                <div className="mb-3">
                  <label className="text-[10px] text-slate-500 mb-1 block">{t('selectSlots')}:</label>
                  <div className="flex gap-2">
                    {[
                      { key: 'giftT50', label: '$50', checked: giftT50, set: setGiftT50 },
                      { key: 'giftT250', label: '$250', checked: giftT250, set: setGiftT250 },
                      { key: 'giftT1000', label: '$1000', checked: giftT1000, set: setGiftT1000 },
                    ].map(item => (
                      <label key={item.key} className="flex-1 flex items-center justify-center gap-1 p-2 rounded-lg bg-white/5 cursor-pointer">
                        <input type="checkbox" checked={item.checked} onChange={e => item.set(e.target.checked)}
                          className="w-4 h-4 accent-gold-400" />
                        <span className="text-[11px] text-white font-bold">{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button onClick={async () => {
                  if (!giftAddress.startsWith('0x') || giftAddress.length !== 42) {
                    addNotification(`❌ ${t('invalidAddress')}`); return
                  }
                  if (!giftT50 && !giftT250 && !giftT1000) {
                    addNotification(`❌ ${t('selectAtLeastOne')}`); return
                  }
                  const tables = []
                  if (giftT50) tables.push('$50')
                  if (giftT250) tables.push('$250')
                  if (giftT1000) tables.push('$1000')
                  setTxPending(true)
                  // v2.4: giftSlotsFree — один вызов с чекбоксами
                  const result = await C.safeCall(() => C.giftSlot(giftAddress, giftT50, giftT250, giftT1000))
                  setTxPending(false)
                  if (result.ok) {
                    addNotification(`✅ ${t('gifted')}: ${tables.join(' + ')} → ${giftAddress.slice(0,8)}...`)
                    setGiftAddress('')
                  } else {
                    addNotification(`❌ ${result.error}`)
                  }
                }} disabled={txPending || !giftAddress}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-pink-500/10 text-pink-400 border border-pink-500/25"
                  style={{ opacity: (!giftAddress || txPending) ? 0.5 : 1 }}>
                  {txPending ? '⏳...' : `🎁 ${t('sendGift')}`}
                </button>
              </div>
            </div>
          )}

          {/* Teams */}
          {activeSection === 'teamlinks' && (
            <div className="px-3 mt-2">
              <TeamsAdmin />
            </div>
          )}

          {/* Withdraw */}
          {activeSection === 'withdraw' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-gold-400 mb-2">💰 {t('emergencyWithdraw')}</div>
                <div className="text-[10px] text-slate-400 mb-3">{t('emergencyWithdrawDesc')}</div>
                <button onClick={async () => {
                  setTxPending(true)
                  const r = await C.safeCall(() => C.emergencyWithdraw('RealEstateMatrix'))
                  setTxPending(false)
                  if (r.ok) addNotification(`✅ ${t('withdrawn')}!`)
                  else addNotification(`❌ ${r.error}`)
                }} disabled={txPending}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/25">
                  {txPending ? '⏳...' : `⚠️ ${t('emergencyWithdraw')}`}
                </button>
              </div>

              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-emerald-400 mb-2">🔄 {t('flushCGT')}</div>
                <div className="text-[10px] text-slate-400 mb-3">{t('flushCGTDesc')}</div>
                <button onClick={async () => {
                  setTxPending(true)
                  const r = await C.safeCall(() => C.flushReinvestCGT())
                  setTxPending(false)
                  if (r.ok) addNotification('✅ CGT flushed!')
                  else addNotification(`❌ ${r.error}`)
                }} disabled={txPending}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  {txPending ? '⏳...' : `🔄 ${t('flushCGT')}`}
                </button>
              </div>
            </div>
          )}

          {/* Authorization */}
          {activeSection === 'auth' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-purple-400 mb-2">🔑 {t('authorizeCalls')}</div>
                <input value={authAddress} onChange={e => setAuthAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none mb-2" />
                <div className="flex gap-1">
                  <button onClick={async () => {
                    if (!authAddress) return
                    setTxPending(true)
                    const r = await C.safeCall(() => C.setAuthorizedCaller('RealEstateMatrix', authAddress, true))
                    setTxPending(false)
                    if (r.ok) addNotification(`✅ ${t('authorize')}!`)
                    else addNotification(`❌ ${r.error}`)
                  }} disabled={txPending}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ✅ {t('authorize')}
                  </button>
                  <button onClick={async () => {
                    if (!authAddress) return
                    setTxPending(true)
                    const r = await C.safeCall(() => C.setAuthorizedCaller('RealEstateMatrix', authAddress, false))
                    setTxPending(false)
                    if (r.ok) addNotification(`✅ ${t('revoke')}!`)
                    else addNotification(`❌ ${r.error}`)
                  }} disabled={txPending}
                    className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                    ❌ {t('revoke')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {activeSection === 'content' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-blue-400 mb-2">📰 {t('news')}</div>
                <div className="space-y-1 mb-2">
                  {news.map((n, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-[10px]">
                      <span className="text-slate-300">{n}</span>
                      <button onClick={() => removeNews(i)} className="text-red-400">✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input value={newNews} onChange={e => setNewNews(e.target.value)}
                    placeholder={t('newNews')}
                    className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                  <button onClick={() => { if (newNews.trim()) { addNews(newNews.trim()); setNewNews('') } }}
                    className="px-3 py-2 rounded-lg text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">+</button>
                </div>
              </div>

              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-emerald-400 mb-2">🎯 {t('quests')}</div>
                <div className="space-y-1 mb-2">
                  {quests.map((q, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-[10px]">
                      <span className="text-slate-300">{q.name} — <span className="text-gold-400">{q.reward}</span></span>
                      <button onClick={() => removeQuest(i)} className="text-red-400">✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-1">
                  <input value={newQuest.name} onChange={e => setNewQuest({ ...newQuest, name: e.target.value })}
                    placeholder={t('questName')}
                    className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                  <input value={newQuest.reward} onChange={e => setNewQuest({ ...newQuest, reward: e.target.value })}
                    placeholder={t('reward')}
                    className="w-20 p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                  <button onClick={() => { if (newQuest.name && newQuest.reward) { addQuest(newQuest); setNewQuest({ name: '', reward: '' }) } }}
                    className="px-3 py-2 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">+</button>
                </div>
              </div>
            </div>
          )}

          {/* Test */}
          {activeSection === 'test' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-purple-400 mb-2">🎮 {t('testMode')}</div>
                <div className="text-[10px] text-slate-400 mb-2">{t('switchLevel')}</div>
                <div className="flex flex-wrap gap-1">
                  {[0,1,2,3,4,5,6,7,8,9,10,11,12].map(lv => (
                    <button key={lv} onClick={() => setLevel(lv)}
                      className="w-8 h-8 rounded-lg text-[10px] font-bold bg-white/5 text-slate-400 hover:bg-purple-500/15 hover:text-purple-400">
                      {lv}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Matrix stats */}
          {activeSection === 'matrix' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-gold-400 mb-2">🏔 {t('businessStats')}</div>
                <div className="text-[11px] text-slate-400">{t('loadingFromContract')}</div>
              </div>
            </div>
          )}

          {/* Contracts */}
          {activeSection === 'contracts' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-blue-400 mb-2">📜 {t('contracts')}</div>
                <div className="space-y-1 text-[9px]">
                  {[
                    ['RealEstateMatrix', ADDRESSES.RealEstateMatrix],
                    ['CGTToken', ADDRESSES.CGTToken],
                    ['NSTToken', ADDRESSES.NSTToken],
                    ['CharityFund', ADDRESSES.CharityFund],
                    ['HousingFund', ADDRESSES.HousingFund],
                    ['NSSPlatform', ADDRESSES.NSSPlatform],
                    ['MatrixPaymentsV2', ADDRESSES.MatrixPaymentsV2],
                    ['GemVault', ADDRESSES.GemVault],
                    ['SwapHelper', ADDRESSES.SwapHelper],
                    ['SafeVault', ADDRESSES.SafeVault],
                    ['AICredits', ADDRESSES.AICredits],
                    ['CardGiftMarketing', ADDRESSES.CardGiftMarketing],
                    ['P2PEscrow', ADDRESSES.P2PEscrow],
                  ].map(([name, addr]) => (
                    <div key={name} className="flex justify-between p-1.5 rounded bg-white/5">
                      <span className="text-slate-400">{name}</span>
                      <span className="text-emerald-400 font-mono">{addr.slice(0, 10)}...</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* FUNDS PANEL                                 */}
          {/* ═══════════════════════════════════════════ */}
          {activeSection === 'funds' && (
            <div className="px-3 mt-2 space-y-2">

              {/* Общий баланс внутри матрицы */}
              <div className="p-3 rounded-2xl glass border border-gold-400/15">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-[12px] font-black text-gold-400">🏦 Балансы фондов</div>
                  <button
                    onClick={async () => {
                      setFundsLoading(true)
                      try {
                        const addrs = await C.getFundAddresses()
                        if (!addrs) { addNotification('❌ Ошибка загрузки адресов'); return }
                        const [total, clubBal, authorBal, charityBal, rotationBal, housingBal] = await Promise.all([
                          C.getTotalPendingWithdrawals(),
                          C.getFundBalance(addrs.clubFund),
                          C.getFundBalance(addrs.authorFund),
                          C.getFundBalance(addrs.charityFund),
                          C.getFundBalance(addrs.rotationFund),
                          C.getFundBalance(addrs.housingFund),
                        ])
                        setFundsData({
                          total,
                          funds: [
                            { key: 'club',     name: 'ClubFund',      emoji: '🎯', addr: addrs.clubFund,     bal: clubBal },
                            { key: 'author',   name: 'AuthorFund',    emoji: '✍️',  addr: addrs.authorFund,   bal: authorBal },
                            { key: 'charity',  name: 'CharityFund',   emoji: '🤲', addr: addrs.charityFund,  bal: charityBal },
                            { key: 'rotation', name: 'RotationFund',  emoji: '🔄', addr: addrs.rotationFund, bal: rotationBal },
                            { key: 'housing',  name: 'HousingFund',   emoji: '🏠', addr: addrs.housingFund,  bal: housingBal },
                          ]
                        })
                        addNotification('✅ Балансы загружены')
                      } catch (e) {
                        addNotification('❌ ' + (e?.message || 'Ошибка').slice(0, 60))
                      }
                      setFundsLoading(false)
                    }}
                    disabled={fundsLoading}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-gold-400/10 border border-gold-400/20 text-gold-400 disabled:opacity-50"
                  >
                    {fundsLoading ? '⏳ Загрузка...' : '🔄 Обновить'}
                  </button>
                </div>

                {!fundsData && !fundsLoading && (
                  <div className="text-[10px] text-slate-500 text-center py-4">
                    Нажми "Обновить" чтобы загрузить балансы
                  </div>
                )}

                {fundsLoading && (
                  <div className="text-[10px] text-slate-400 text-center py-4 animate-pulse">
                    ⏳ Читаем контракт...
                  </div>
                )}

                {fundsData && (
                  <>
                    {/* Итого внутри матрицы */}
                    <div className="flex justify-between items-center p-2 rounded-xl mb-3"
                      style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
                      <span className="text-[11px] text-slate-400">Всего внутри RealEstateMatrix:</span>
                      <span className="text-[14px] font-black text-gold-400">${fundsData.total} USDT</span>
                    </div>

                    {/* Карточки фондов */}
                    <div className="space-y-2">
                      {fundsData.funds.map(fund => (
                        <div key={fund.key} className="p-3 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{fund.emoji}</span>
                              <div>
                                <div className="text-[11px] font-bold text-white">{fund.name}</div>
                                <div className="text-[9px] text-slate-600 font-mono">
                                  {fund.addr ? fund.addr.slice(0, 10) + '...' + fund.addr.slice(-6) : '—'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-[15px] font-black ${parseFloat(fund.bal) > 0 ? 'text-emerald-400' : 'text-slate-600'}`}>
                                ${fund.bal}
                              </div>
                              <div className="text-[9px] text-slate-600">USDT</div>
                            </div>
                          </div>

                          {/* Кнопка вывода — только если баланс > 0 */}
                          {parseFloat(fund.bal) > 0 && (
                            <div className="space-y-1">
                              <div className="text-[9px] text-yellow-400/70 bg-yellow-400/5 rounded-lg p-1.5 text-center">
                                ⚠️ Вывод возможен только с кошелька владельца этого адреса
                              </div>
                              {wallet && fund.addr &&
                               wallet.toLowerCase() === fund.addr.toLowerCase() ? (
                                <button
                                  onClick={async () => {
                                    setWithdrawingFund(fund.key)
                                    setTxPending(true)
                                    try {
                                      addNotification(`⏳ Вывод ${fund.name}...`)
                                      await C.withdrawFund()
                                      addNotification(`✅ ${fund.name}: $${fund.bal} выведено!`)
                                      // Обновляем баланс этого фонда
                                      const newBal = await C.getFundBalance(fund.addr)
                                      setFundsData(prev => ({
                                        ...prev,
                                        funds: prev.funds.map(f =>
                                          f.key === fund.key ? { ...f, bal: newBal } : f
                                        )
                                      }))
                                    } catch (e) {
                                      const msg = e?.reason || e?.shortMessage || e?.message || 'Ошибка'
                                      addNotification(`❌ ${msg.slice(0, 80)}`)
                                    }
                                    setTxPending(false)
                                    setWithdrawingFund(null)
                                  }}
                                  disabled={txPending || withdrawingFund === fund.key}
                                  className="w-full py-2 rounded-xl text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 disabled:opacity-50"
                                >
                                  {withdrawingFund === fund.key ? '⏳ Вывод...' : `💸 Вывести $${fund.bal}`}
                                </button>
                              ) : (
                                <div className="text-[9px] text-slate-600 text-center py-1">
                                  Подключи кошелёк <span className="font-mono text-slate-500">{fund.addr?.slice(0, 8)}...</span> для вывода
                                </div>
                              )}
                            </div>
                          )}

                          {parseFloat(fund.bal) === 0 && (
                            <div className="text-[9px] text-slate-700 text-center">нет средств для вывода</div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Ссылка на bscscan */}
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <a href="https://opbnb.bscscan.com/address/0xCA10A6971C9Dcbda4e8AdFC6328977261B8B82Fe#readContract"
                        target="_blank" rel="noopener noreferrer"
                        className="block text-center text-[10px] text-blue-400 underline">
                        🔍 Открыть контракт на opBNB BscScan →
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* GEMS ADMIN                                  */}
          {/* ═══════════════════════════════════════════ */}
          {activeSection === 'gems' && (
            <div className="px-3 mt-2 space-y-2">
              {/* Sub-tabs */}
              <div className="flex gap-1">
                {[['list','💎 Список камней'],['economics','📊 Проценты / Скидки']].map(([id,label]) => (
                  <button key={id} onClick={() => setGemTab(id)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${gemTab===id ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {gemTab === 'list' && (
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-500 px-1">
                    PNG файлы → <span className="text-gold-400 font-mono">public/images/gems/</span>
                  </div>

                  {/* Форма редактирования */}
                  {editingItem?.type === 'gem' && (
                    <div className="p-3 rounded-2xl glass border-gold-400/20 space-y-2">
                      <div className="text-[11px] font-bold text-gold-400">✏️ Редактирование: {editingItem.data.name}</div>

                      {[
                        ['name','Название','text'],
                        ['price','Цена ($)','number'],
                        ['supplierCost','Закупка ($)','number'],
                        ['carat','Карат','text'],
                        ['origin','Происхождение','text'],
                        ['grade','Сорт','text'],
                        ['stakingAPR','Стейкинг APR (%)','number'],
                        ['img','PNG файл (имя)','text'],
                        ['desc','Описание','text'],
                      ].map(([field, label, type]) => (
                        <div key={field}>
                          <label className="text-[9px] text-slate-500 block mb-0.5">{label}</label>
                          <input type={type} value={editingItem.data[field] || ''}
                            onChange={e => setEditingItem(prev => ({
                              ...prev, data: { ...prev.data, [field]: type==='number' ? Number(e.target.value) : e.target.value }
                            }))}
                            className="w-full p-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                        </div>
                      ))}

                      <div className="flex items-center gap-2">
                        <label className="text-[9px] text-slate-500">Активен:</label>
                        <button onClick={() => setEditingItem(prev => ({...prev, data:{...prev.data, active:!prev.data.active}}))}
                          className={`px-2 py-1 rounded text-[9px] font-bold ${editingItem.data.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {editingItem.data.active ? '✅ Вкл' : '❌ Выкл'}
                        </button>
                      </div>

                      <div className="flex gap-1 pt-1">
                        <button onClick={() => {
                          const updated = [...gems]
                          updated[editingItem.idx] = editingItem.data
                          setGems(updated)
                          setEditingItem(null)
                          addNotification(`✅ ${editingItem.data.name} обновлён`)
                        }} className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          💾 Сохранить
                        </button>
                        <button onClick={() => setEditingItem(null)}
                          className="flex-1 py-2 rounded-xl text-[10px] font-bold border border-white/10 text-slate-500">
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Список камней */}
                  {gems.map((gem, idx) => (
                    <div key={gem.id} className="flex items-center gap-2 p-2 rounded-xl glass">
                      {/* PNG превью или заглушка */}
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 overflow-hidden"
                        style={{ background: gem.active ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={`/images/gems/${gem.img}`} alt={gem.name}
                          className="w-full h-full object-cover"
                          onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
                        <span className="hidden text-lg">💎</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">{gem.name}</div>
                        <div className="text-[9px] text-slate-500">${gem.price} • {gem.stakingAPR}% APR • {gem.img}</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${gem.active ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                          {gem.active ? '✅' : '❌'}
                        </span>
                        <button onClick={() => setEditingItem({ type:'gem', idx, data:{...gem} })}
                          className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          ✏️
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="text-[9px] text-slate-600 text-center pt-1">
                    ℹ️ Изменения применяются локально. Для сохранения между сессиями — обнови gameData.js
                  </div>
                </div>
              )}

              {gemTab === 'economics' && (
                <div className="p-3 rounded-2xl glass space-y-3">
                  <div className="text-[11px] font-bold text-gold-400">📊 Распределение при покупке камня</div>

                  {[
                    ['supplierCut',    'Закупка камня (%)',         'Сколько % идёт поставщику'],
                    ['sponsorCut',     'Спонсору / маркетинг (%)',  'Реферальная программа'],
                    ['stakingFund',    'Фонд стейкинга (%)',        'Из него платится APR владельцам'],
                    ['platformCut',    'Платформа (%)',             'Операционные расходы'],
                  ].map(([key, label, hint]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-0.5">
                        <label className="text-[10px] text-slate-400">{label}</label>
                        <span className="text-[10px] font-bold text-gold-400">{gemEcon[key]/100}%</span>
                      </div>
                      <div className="text-[9px] text-slate-600 mb-1">{hint}</div>
                      <input type="range" min={0} max={10000} step={100}
                        value={gemEcon[key]}
                        onChange={e => setGemEcon(prev => ({...prev, [key]: Number(e.target.value)}))}
                        className="w-full accent-yellow-400" />
                    </div>
                  ))}

                  {/* Итоговая сумма */}
                  {(() => {
                    const total = (gemEcon.supplierCut + gemEcon.sponsorCut + gemEcon.stakingFund + gemEcon.platformCut) / 100
                    const ok = total === 100
                    return (
                      <div className={`p-2 rounded-lg text-center text-[11px] font-bold ${ok ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        Итого: {total}% {ok ? '✅ Сумма = 100%' : '❌ Должно быть 100%!'}
                      </div>
                    )
                  })()}

                  <div className="border-t border-white/8 pt-3">
                    <div className="text-[11px] font-bold text-purple-400 mb-2">🎁 Клубные скидки</div>
                    {[
                      ['baseDiscountBP',  'Базовая скидка (%)',           'Скидка для всех зарегистрированных'],
                      ['maxNstBonusBP',   'Макс. бонус NST (%)',          'Доп. скидка за наличие NST'],
                      ['nstPerPercent',   '1% = сколько NST нужно',       'Например: 1000 NST = +1% скидки'],
                      ['stakingLockMonths','Заморозка стейкинга (мес)',   'Срок блокировки при стейкинге'],
                    ].map(([key, label, hint]) => (
                      <div key={key} className="mb-3">
                        <div className="flex justify-between mb-0.5">
                          <label className="text-[10px] text-slate-400">{label}</label>
                          <span className="text-[10px] font-bold text-purple-400">
                            {key === 'nstPerPercent' || key === 'stakingLockMonths' ? gemEcon[key] : gemEcon[key]/100+'%'}
                          </span>
                        </div>
                        <div className="text-[9px] text-slate-600 mb-1">{hint}</div>
                        <input type="number" value={gemEcon[key]}
                          onChange={e => setGemEcon(prev => ({...prev, [key]: Number(e.target.value)}))}
                          className="w-full p-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* METALS ADMIN                                */}
          {/* ═══════════════════════════════════════════ */}
          {activeSection === 'metals' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="flex gap-1">
                {[['list','🥇 Список металлов'],['economics','📊 Спреды / Проценты']].map(([id,label]) => (
                  <button key={id} onClick={() => setMetalTab(id)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${metalTab===id ? 'bg-yellow-400/15 border-yellow-400/30 text-yellow-400' : 'border-white/8 text-slate-500'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {metalTab === 'list' && (
                <div className="space-y-1.5">
                  <div className="text-[10px] text-slate-500 px-1">
                    PNG файлы → <span className="text-yellow-400 font-mono">public/images/metals/</span>
                  </div>

                  {/* Форма редактирования металла */}
                  {editingItem?.type === 'metal' && (
                    <div className="p-3 rounded-2xl glass border-yellow-400/20 space-y-2">
                      <div className="text-[11px] font-bold text-yellow-400">✏️ {editingItem.data.name}</div>
                      {[
                        ['name','Название','text'],
                        ['price','Цена ($/ед)','number'],
                        ['unit','Единица (1г, 50г...)','text'],
                        ['purity','Проба','text'],
                        ['stakingAPR','APR % (0 = нет)','number'],
                        ['img','PNG файл (имя)','text'],
                        ['desc','Описание','text'],
                      ].map(([field, label, type]) => (
                        <div key={field}>
                          <label className="text-[9px] text-slate-500 block mb-0.5">{label}</label>
                          <input type={type} value={editingItem.data[field] || ''}
                            onChange={e => setEditingItem(prev => ({
                              ...prev, data: { ...prev.data, [field]: type==='number' ? Number(e.target.value) : e.target.value }
                            }))}
                            className="w-full p-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <label className="text-[9px] text-slate-500">Категория:</label>
                        {['gold','silver','scrap'].map(cat => (
                          <button key={cat} onClick={() => setEditingItem(prev => ({...prev, data:{...prev.data, category:cat}}))}
                            className={`px-2 py-1 rounded text-[9px] font-bold border ${editingItem.data.category===cat ? 'border-yellow-400/40 text-yellow-400 bg-yellow-400/10' : 'border-white/10 text-slate-500'}`}>
                            {{'gold':'🥇 Золото','silver':'🥈 Серебро','scrap':'🔩 Лом'}[cat]}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[9px] text-slate-500">Активен:</label>
                        <button onClick={() => setEditingItem(prev => ({...prev, data:{...prev.data, active:!prev.data.active}}))}
                          className={`px-2 py-1 rounded text-[9px] font-bold ${editingItem.data.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {editingItem.data.active ? '✅ Вкл' : '❌ Выкл'}
                        </button>
                      </div>
                      <div className="flex gap-1 pt-1">
                        <button onClick={() => {
                          const updated = [...metals]
                          updated[editingItem.idx] = editingItem.data
                          setMetals(updated)
                          setEditingItem(null)
                          addNotification(`✅ ${editingItem.data.name} обновлён`)
                        }} className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          💾 Сохранить
                        </button>
                        <button onClick={() => setEditingItem(null)}
                          className="flex-1 py-2 rounded-xl text-[10px] font-bold border border-white/10 text-slate-500">
                          Отмена
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Группировка по категориям */}
                  {['gold','silver','scrap'].map(cat => {
                    const catMetals = metals.filter(m => m.category === cat)
                    if (!catMetals.length) return null
                    const catLabels = { gold:'🥇 Золото', silver:'🥈 Серебро', scrap:'🔩 Лом / Скупка' }
                    return (
                      <div key={cat}>
                        <div className="text-[10px] font-bold text-slate-400 px-1 mt-2 mb-1">{catLabels[cat]}</div>
                        {catMetals.map(metal => {
                          const idx = metals.indexOf(metal)
                          return (
                            <div key={metal.id} className="flex items-center gap-2 p-2 rounded-xl glass mb-1">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 overflow-hidden"
                                style={{ background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.15)' }}>
                                <img src={`/images/metals/${metal.img}`} alt={metal.name}
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
                                <span className="hidden">🥇</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-bold text-white truncate">{metal.name}</div>
                                <div className="text-[9px] text-slate-500">${metal.price}/{metal.unit} • {metal.purity} • {metal.img}</div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${metal.active ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                                  {metal.active ? '✅' : '❌'}
                                </span>
                                <button onClick={() => setEditingItem({ type:'metal', idx, data:{...metal} })}
                                  className="text-[10px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  ✏️
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}

                  <div className="text-[9px] text-slate-600 text-center pt-1">
                    ℹ️ Металлы — будущий раздел. Покупка через P2PEscrow контракт (уже в системе)
                  </div>
                </div>
              )}

              {metalTab === 'economics' && (
                <div className="p-3 rounded-2xl glass space-y-3">
                  <div className="text-[11px] font-bold text-yellow-400">📊 Спреды и комиссии металлов</div>
                  {[
                    ['buyupSpread', 'Наценка при продаже нам (%)', 'Мы продаём клиенту с наценкой'],
                    ['sellSpread',  'Скидка при скупке лома (%)', 'Мы покупаем лом с дисконтом к рынку'],
                    ['sponsorCut',  'Спонсору (%)',                'Реферальная программа'],
                    ['platformCut', 'Платформа (%)',               'Операционные расходы'],
                    ['stakingFund', 'Фонд хранения (%)',           'Страховой фонд хранилища'],
                  ].map(([key, label, hint]) => (
                    <div key={key}>
                      <div className="flex justify-between mb-0.5">
                        <label className="text-[10px] text-slate-400">{label}</label>
                        <span className="text-[10px] font-bold text-yellow-400">{metalEcon[key]/100}%</span>
                      </div>
                      <div className="text-[9px] text-slate-600 mb-1">{hint}</div>
                      <input type="range" min={0} max={5000} step={50}
                        value={metalEcon[key]}
                        onChange={e => setMetalEcon(prev => ({...prev, [key]: Number(e.target.value)}))}
                        className="w-full accent-yellow-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
