'use client'
import { useState, useEffect } from 'react'
import useGameStore from '@/lib/store'
import { shortAddress } from '@/lib/web3'
import * as C from '@/lib/contracts'

// ═════════════════════════════════════════════════════════
// LINKS PAGE — CardGift ссылки
// ═════════════════════════════════════════════════════════
export function LinksTab() {
  const { wallet, registered, t } = useGameStore()
  const [links, setLinks] = useState([])
  const [copied, setCopied] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('gems')

  useEffect(() => {
    if (wallet) {
      const base = typeof window !== 'undefined' ? window.location.origin : ''
      const ref = wallet.slice(2, 10)
      setLinks([
        { id: 1, type: 'gems', name: t('gemsAndTapper'), url: `${base}/invite?ref=${ref}&t=gems`, clicks: 0 },
        { id: 2, type: 'house', name: t('houseZeroPercent'), url: `${base}/invite?ref=${ref}&t=house`, clicks: 0 },
        { id: 3, type: 'money', name: `15 ${t('incomeSources')}`, url: `${base}/invite?ref=${ref}&t=money`, clicks: 0 },
      ])
    }
  }, [wallet, t])

  const copyLink = (id) => {
    const link = links.find(l => l.id === id)
    if (!link) return
    navigator.clipboard.writeText(link.url)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const addLink = () => {
    if (!newName.trim()) return
    const base = typeof window !== 'undefined' ? window.location.origin : ''
    const ref = wallet?.slice(2, 10) || '0'
    const id = Date.now()
    setLinks(prev => [...prev, { id, type: newType, name: newName.trim(), url: `${base}/invite?ref=${ref}&t=${newType}`, clicks: 0 }])
    setNewName('')
    setShowCreate(false)
  }

  const removeLink = (id) => {
    if (id <= 3) return
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  const templateLabels = {
    gems: { emoji: '💎', label: t('gems') },
    house: { emoji: '🏠', label: t('house') },
    money: { emoji: '💰', label: t('incomeLabel') },
  }

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">✂️ {t('myLinks')}</h2>
        <p className="text-[11px] text-slate-500">{t('linksDesc')}</p>
      </div>

      {!wallet ? (
        <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center">
          <div className="text-3xl mb-2">🔐</div>
          <div className="text-sm font-bold text-slate-300">{t('connectWallet')}</div>
        </div>
      ) : (
        <>
          <div className="px-3 mt-2 space-y-2">
            {links.map(link => (
              <div key={link.id} className="p-3 rounded-2xl glass">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{templateLabels[link.type]?.emoji || '🔗'}</span>
                  <div className="flex-1">
                    <div className="text-[12px] font-bold text-white">{link.name}</div>
                    <div className="text-[9px] text-slate-500">{templateLabels[link.type]?.label} • {link.clicks} {t('clicks')}</div>
                  </div>
                  {link.id > 3 && (
                    <button onClick={() => removeLink(link.id)} className="text-[10px] text-red-400/60 hover:text-red-400">✕</button>
                  )}
                </div>
                <div className="p-2 rounded-xl bg-white/5 text-[9px] text-slate-400 break-all mb-2">{link.url}</div>
                <div className="flex gap-1.5">
                  <button onClick={() => copyLink(link.id)}
                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold ${copied === link.id ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-gold-400/10 text-gold-400 border border-gold-400/20'}`}>
                    {copied === link.id ? `✅ ${t('copied')}` : `📋 ${t('copy')}`}
                  </button>
                  <a href={`https://t.me/share/url?url=${encodeURIComponent(link.url)}`} target="_blank" rel="noopener"
                    className="py-1.5 px-3 rounded-xl text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">📱 TG</a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(link.url)}`} target="_blank" rel="noopener"
                    className="py-1.5 px-3 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">💬 WA</a>
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 mt-2">
            {!showCreate ? (
              <button onClick={() => setShowCreate(true)}
                className="w-full py-2.5 rounded-xl text-[11px] font-bold border border-dashed border-gold-400/20 text-gold-400/60 hover:border-gold-400/40 hover:text-gold-400">
                + {t('createNewLink')}
              </button>
            ) : (
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-gold-400 mb-2">✨ {t('newLink')}</div>
                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('linkName')}
                  className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none mb-2" />
                <div className="flex gap-1 mb-2">
                  {Object.entries(templateLabels).map(([k, v]) => (
                    <button key={k} onClick={() => setNewType(k)}
                      className={`flex-1 py-1.5 rounded-xl text-[10px] font-bold border ${newType === k ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
                      {v.emoji} {v.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <button onClick={addLink} className="flex-1 py-2 rounded-xl text-[11px] font-bold gold-btn">✅ {t('create')}</button>
                  <button onClick={() => setShowCreate(false)} className="py-2 px-4 rounded-xl text-[11px] font-bold text-slate-500 border border-white/8">✕</button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// VAULT PAGE — SafeVault + БлагоДАРЮ + P2P
// ═════════════════════════════════════════════════════════
export function VaultTab() {
  const { wallet, charityBalance, canGive, pendingWithdrawal, addNotification, setTxPending, txPending, t } = useGameStore()
  const [activeSection, setActiveSection] = useState('vault')
  const [giftAddress, setGiftAddress] = useState('')

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

  const handleGift = async () => {
    if (!wallet || !giftAddress) return
    if (!/^0x[a-fA-F0-9]{40}$/.test(giftAddress)) {
      addNotification(`❌ ${t('invalidAddress')}`); return
    }
    setTxPending(true)
    const result = await C.safeCall(() => C.giveGift(giftAddress))
    setTxPending(false)
    if (result.ok) {
      addNotification(`❤️ ${t('giftSent')}`)
      setGiftAddress('')
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const sections = [
    { id: 'vault', icon: '💰', label: t('vault') },
    { id: 'charity', icon: '❤️', label: t('charity') },
    { id: 'p2p', icon: '🔄', label: t('p2p') },
  ]

  const incomeSources = [
    t('spilloverMatrix'), t('sponsorBonus'), t('quarterlyPaymentsSource'),
    t('gemStakingSource'), t('referralProgram'), t('cgtDividends'),
    t('aiCreditsSponsor'), t('rotationFund')
  ]

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">🔐 {t('vault')}</h2>
      </div>

      <div className="flex gap-1 px-3 mt-1">
        {sections.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold border ${activeSection === s.id ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {!wallet ? (
        <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center">
          <div className="text-3xl mb-2">🔐</div>
          <div className="text-sm font-bold text-slate-300">{t('connectWallet')}</div>
        </div>
      ) : (
        <>
          {activeSection === 'vault' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-gold-400 mb-2">💰 {t('availableToWithdraw')}</div>
                <div className="text-center">
                  <div className="text-3xl font-black text-gold-400">{pendingWithdrawal}</div>
                  <div className="text-[10px] text-slate-500">USDT</div>
                </div>
                {parseFloat(pendingWithdrawal) > 0 && (
                  <button onClick={handleWithdraw} disabled={txPending}
                    className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold gold-btn">
                    {txPending ? `⏳ ${t('withdrawing')}` : `💸 ${t('withdrawToWallet')}`}
                  </button>
                )}
              </div>

              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-emerald-400 mb-2">📊 {t('incomeSourcesTitle')}</div>
                <div className="space-y-1.5 text-[11px]">
                  {incomeSources.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 py-1 border-b border-white/5">
                      <span className="text-emerald-400">●</span>
                      <span className="text-slate-300">{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'charity' && (
            <div className="px-3 mt-2 space-y-2">
              <div className="p-3 rounded-2xl glass border-pink-500/15">
                <div className="text-[12px] font-bold text-pink-400 mb-2">❤️ {t('charityTitle')}</div>
                <div className="text-[11px] text-slate-300 mb-3 leading-relaxed">{t('charityDesc')}</div>

                <div className="p-2 rounded-xl bg-white/5 text-center mb-2">
                  <div className="text-lg font-black text-pink-400">{parseFloat(charityBalance).toFixed(2)}</div>
                  <div className="text-[9px] text-slate-500">{t('availableInFund')}</div>
                </div>

                <input value={giftAddress} onChange={e => setGiftAddress(e.target.value)}
                  placeholder={t('recipientAddress')}
                  className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none mb-2" />

                <button onClick={handleGift} disabled={txPending || !giftAddress || !canGive}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20"
                  style={{ opacity: (!canGive || !giftAddress || txPending) ? 0.5 : 1 }}>
                  {txPending ? '⏳...' : !canGive ? `🔒 ${t('conditionsNotMet')}` : `🎁 ${t('giftSlot')}`}
                </button>
                {!canGive && (
                  <div className="mt-1 text-[9px] text-slate-500 text-center">{t('needActiveShare')}</div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'p2p' && <P2PSection />}
        </>
      )}
    </div>
  )
}

// P2P торговля CGT
function P2PSection() {
  const { wallet, cgt, addNotification, setTxPending, txPending, t } = useGameStore()
  const [sellAmount, setSellAmount] = useState('')
  const [sellPrice, setSellPrice] = useState('')
  const [cgtInfo, setCgtInfo] = useState(null)

  useEffect(() => {
    C.getCGTInfo().then(setCgtInfo).catch(() => {})
  }, [])

  const handleCreateOrder = async () => {
    if (!sellAmount || !sellPrice) return
    setTxPending(true)
    const result = await C.safeCall(() => C.createSellOrder(sellAmount, sellPrice))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ ${t('orderCreated')}`)
      setSellAmount('')
      setSellPrice('')
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  return (
    <div className="px-3 mt-2 space-y-2">
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-purple-400 mb-2">🔄 {t('p2pTrading')}</div>

        {cgtInfo && (
          <div className="grid grid-cols-3 gap-2 mb-3 text-center">
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[11px] font-black text-gold-400">${parseFloat(cgtInfo.price).toFixed(4)}</div>
              <div className="text-[9px] text-slate-500">{t('price')}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[11px] font-black text-emerald-400">{parseFloat(cgtInfo.supply).toFixed(0)}</div>
              <div className="text-[9px] text-slate-500">{t('supply')}</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[11px] font-black text-purple-400">${parseFloat(cgtInfo.capitalization).toFixed(0)}</div>
              <div className="text-[9px] text-slate-500">{t('cap')}</div>
            </div>
          </div>
        )}

        <div className="text-[10px] text-slate-500 mb-1">{t('myBalance')}: {cgt.toFixed(2)} CGT</div>

        <div className="space-y-2">
          <input type="number" value={sellAmount} onChange={e => setSellAmount(e.target.value)}
            placeholder={t('cgtAmount')}
            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
          <input type="number" value={sellPrice} onChange={e => setSellPrice(e.target.value)}
            placeholder={t('pricePerCGT')}
            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
        </div>

        <button onClick={handleCreateOrder} disabled={txPending || !sellAmount || !sellPrice}
          className="mt-2 w-full py-2.5 rounded-xl text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20"
          style={{ opacity: (!sellAmount || !sellPrice || txPending) ? 0.5 : 1 }}>
          {txPending ? '⏳...' : `📤 ${t('createSellOrder')}`}
        </button>
      </div>

      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-blue-400 mb-2">📖 {t('howP2PWorks')}</div>
        <div className="space-y-1 text-[11px] text-slate-300">
          <p>1. {t('p2pStep1')}</p>
          <p>2. {t('p2pStep2')}</p>
          <p>3. {t('p2pStep3')}</p>
          <p className="text-emerald-400 font-bold">{t('p2pSecure')}</p>
        </div>
      </div>
    </div>
  )
}

// Экспорт TeamsAdmin для AdminPanel
export function TeamsAdmin() {
  const { t } = useGameStore()
  const [searchAddr, setSearchAddr] = useState('')
  const [contestData, setContestData] = useState({
    weeklyPrize: '500',
    monthlyPrize: '2000',
    weeklyActive: true,
    monthlyActive: true,
  })

  return (
    <div className="space-y-3">
      {/* Управление соревнованиями */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-purple-400 mb-2">⚔️ {t('contests')}</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
            <div>
              <div className="text-[11px] font-bold text-white">{t('weeklyContest')}</div>
              <div className="text-[9px] text-slate-500">{t('weeklyContestDesc')}</div>
            </div>
            <div className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-all ${contestData.weeklyActive ? 'bg-emerald-500' : 'bg-white/15'}`}
              onClick={() => setContestData(p => ({ ...p, weeklyActive: !p.weeklyActive }))}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${contestData.weeklyActive ? 'translate-x-5' : ''}`} />
            </div>
          </div>
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/5">
            <div>
              <div className="text-[11px] font-bold text-white">{t('monthlyContest')}</div>
              <div className="text-[9px] text-slate-500">{t('monthlyContestDesc')}</div>
            </div>
            <div className={`w-10 h-5 rounded-full flex items-center px-0.5 cursor-pointer transition-all ${contestData.monthlyActive ? 'bg-emerald-500' : 'bg-white/15'}`}
              onClick={() => setContestData(p => ({ ...p, monthlyActive: !p.monthlyActive }))}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${contestData.monthlyActive ? 'translate-x-5' : ''}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Поиск пользователя */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-gold-400 mb-2">🔍 {t('searchUser')}</div>
        <input value={searchAddr} onChange={e => setSearchAddr(e.target.value)}
          placeholder="0x... адрес кошелька"
          className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none mb-2" />
        <button className="w-full py-2 rounded-xl text-[11px] font-bold gold-btn">
          🔍 {t('search')}
        </button>
      </div>

      {/* Статистика команд */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-emerald-400 mb-2">📊 {t('teamStats')}</div>
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-black text-gold-400">0</div>
            <div className="text-[9px] text-slate-500">{t('totalUsers')}</div>
          </div>
          <div className="p-2 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-black text-emerald-400">0</div>
            <div className="text-[9px] text-slate-500">{t('activeThisWeek')}</div>
          </div>
          <div className="p-2 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-black text-purple-400">0</div>
            <div className="text-[9px] text-slate-500">{t('newThisMonth')}</div>
          </div>
          <div className="p-2 rounded-xl bg-white/5 text-center">
            <div className="text-lg font-black text-blue-400">9</div>
            <div className="text-[9px] text-slate-500">{t('partnerLines')}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
