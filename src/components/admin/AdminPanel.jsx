'use client'
import { useState, useEffect } from 'react'
import useGameStore from '@/lib/store'
import { LEVELS } from '@/lib/gameData'
import web3, { shortAddress } from '@/lib/web3'
import { TeamsAdmin } from '@/components/pages/ExtraPages'
import * as C from '@/lib/contracts'

const FALLBACK_OWNER = '0x7bcd1753868895971e12448412cb3216d47884c8'

export default function AdminPanel() {
  const {
    wallet, news, quests, addNews, removeNews, addQuest, removeQuest,
    setLevel, setOwnerWallet, addNotification, setTxPending, txPending,
  } = useGameStore()
  const [activeSection, setActiveSection] = useState('overview')
  const [txResult, setTxResult] = useState(null)
  const [contractOwner, setContractOwner] = useState(FALLBACK_OWNER)

  // Form states
  const [newsText, setNewsText] = useState('')
  const [qName, setQName] = useState('')
  const [qReward, setQReward] = useState('')
  const [withdrawContract, setWithdrawContract] = useState('RealEstateMatrix')
  const [selectedTable, setSelectedTable] = useState('0')
  const [newTablePrice, setNewTablePrice] = useState('')
  const [newAuthorized, setNewAuthorized] = useState('')
  const [authContract, setAuthContract] = useState('RealEstateMatrix')

  // Blockchain data
  const [pauseStates, setPauseStates] = useState({})
  const [contractBalances, setContractBalances] = useState({})
  const [health, setHealth] = useState(null)

  // Load owner from contract
  useEffect(() => {
    async function loadOwner() {
      try {
        const owner = await C.getOwner('RealEstateMatrix')
        if (owner) { setContractOwner(owner); setOwnerWallet(owner) }
      } catch {}
    }
    if (web3.isConnected) loadOwner()
  }, [web3.isConnected, setOwnerWallet])

  const isOwner = wallet && contractOwner && wallet.toLowerCase() === contractOwner.toLowerCase()

  if (!isOwner) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass p-6 text-center rounded-2xl max-w-[300px]">
          <div className="text-3xl mb-2">🔐</div>
          <div className="text-sm font-bold text-slate-300">Доступ запрещён</div>
          <div className="text-[11px] text-slate-500 mt-1">Подключите кошелёк владельца контрактов</div>
          {wallet && <div className="text-[9px] text-red-400 mt-2">Ваш: {shortAddress(wallet)}</div>}
        </div>
      </div>
    )
  }

  const showTx = (msg, success = true) => {
    setTxResult({ msg, success })
    setTimeout(() => setTxResult(null), 5000)
  }

  const exec = async (fn, successMsg) => {
    setTxPending(true)
    const result = await C.safeCall(fn)
    setTxPending(false)
    if (result.ok) {
      showTx(successMsg || '✅ Готово!')
      addNotification(successMsg || '✅ Готово!')
    } else {
      showTx(`❌ ${result.error}`, false)
    }
  }

  // Load blockchain data
  const loadData = async () => {
    const contracts = ['RealEstateMatrix', 'CGTToken', 'NSTToken', 'GemVault', 'HousingFund', 'CharityFund']
    const states = {}
    for (const name of contracts) {
      states[name] = await C.isPaused(name).catch(() => null)
    }
    setPauseStates(states)

    const h = await C.getContractHealth()
    setHealth(h)
  }

  useEffect(() => { if (isOwner) loadData() }, [isOwner])

  const SECTIONS = [
    { id: 'overview', icon: '📊', label: 'Обзор' },
    { id: 'init', icon: '🚀', label: 'Активация' },
    { id: 'gift', icon: '🎁', label: 'Подарки' },
    { id: 'teamlinks', icon: '🤝', label: 'Команды' },
    { id: 'contracts', icon: '📜', label: 'Контракты' },
    { id: 'withdraw', icon: '💰', label: 'Вывод' },
    { id: 'matrix', icon: '🏔', label: 'Бизнесы' },
    { id: 'auth', icon: '🔑', label: 'Авторизация' },
    { id: 'content', icon: '📢', label: 'Контент' },
    { id: 'test', icon: '🎮', label: 'Тест' },
  ]

  // State for table initialization
  const [initTable, setInitTable] = useState('0')
  const [founders, setFounders] = useState(['', '', '', '', '', '', ''])
  const [tablesInit, setTablesInit] = useState({ table0: null, table1: null, table2: null })

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
        <h2 className="text-lg font-black text-gold-400">⚙️ Админ-панель</h2>
        <p className="text-[11px] text-slate-500">Владелец: {shortAddress(wallet)}</p>
      </div>

      {txResult && (
        <div className={`mx-3 mt-1 p-2 rounded-xl text-[11px] font-bold text-center ${txResult.success ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-red-500/15 text-red-400 border border-red-500/25'}`}>
          {txResult.msg}
        </div>
      )}

      {txPending && (
        <div className="mx-3 mt-1 p-2 rounded-xl bg-gold-400/10 border border-gold-400/20 text-[11px] font-bold text-gold-400 text-center animate-pulse">
          ⏳ Транзакция...
        </div>
      )}

      {/* Nav */}
      <div className="flex flex-wrap gap-1 px-3 mt-2">
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${activeSection === s.id ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      <div className="px-3 mt-3 space-y-3">
        {/* ═══ OVERVIEW ═══ */}
        {activeSection === 'overview' && (
          <>
            {health && (
              <div className="p-3 rounded-2xl glass">
                <div className="text-[12px] font-bold text-emerald-400 mb-2">🏥 Здоровье RealEstateMatrix</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-sm font-black text-gold-400">{parseFloat(health.balance).toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500">Баланс USDT</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-sm font-black text-emerald-400">{parseFloat(health.surplus).toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500">Излишек</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-sm font-black text-orange-400">{parseFloat(health.owedWithdrawals).toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500">К выводу</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-sm font-black text-pink-400">{parseFloat(health.owedCharity).toFixed(2)}</div>
                    <div className="text-[9px] text-slate-500">Благо</div>
                  </div>
                </div>
              </div>
            )}

            <div className="p-3 rounded-2xl glass">
              <div className="text-[12px] font-bold text-gold-400 mb-2">⏸ Статус контрактов</div>
              <div className="space-y-1">
                {Object.entries(pauseStates).map(([name, paused]) => (
                  <div key={name} className="flex items-center justify-between py-1 border-b border-white/5">
                    <span className="text-[11px] text-slate-300">{name}</span>
                    <span className={`text-[10px] font-bold ${paused ? 'text-red-400' : 'text-emerald-400'}`}>
                      {paused === null ? '—' : paused ? '⏸ Paused' : '✅ Active'}
                    </span>
                  </div>
                ))}
              </div>
              <button onClick={loadData} className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold border border-white/8 text-slate-500">
                🔄 Обновить
              </button>
            </div>
          </>
        )}

        {/* ═══ TEAMS ═══ */}
        {activeSection === 'teamlinks' && <TeamsAdmin />}

        {/* ═══ GIFT SLOTS ═══ */}
        {activeSection === 'gift' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl glass border-pink-400/20">
              <div className="text-[12px] font-bold text-pink-400 mb-3">🎁 Бесплатная выдача мест (для блогеров)</div>
              
              <div className="p-2 rounded-lg bg-white/5 text-[9px] text-slate-400 mb-3">
                Выдаёт места БЕЗ оплаты. Получатель должен быть зарегистрирован в GlobalWay.
                <br/>Порядок: сначала $50, потом $250, потом $1000.
              </div>

              {/* Address input */}
              <div className="mb-3">
                <label className="text-[10px] text-slate-400 mb-1 block">Адрес получателя:</label>
                <input
                  value={giftAddress}
                  onChange={e => setGiftAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none"
                />
              </div>

              {/* Checkboxes for tables */}
              <div className="mb-3">
                <label className="text-[10px] text-slate-400 mb-2 block">Какие места выдать:</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftT50}
                      onChange={e => setGiftT50(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-[11px] text-white">🏠 Малый Бизнес ($50)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftT250}
                      onChange={e => setGiftT250(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-[11px] text-white">🏢 Средний Бизнес ($250)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-white/5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={giftT1000}
                      onChange={e => setGiftT1000(e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-[11px] text-white">🏰 Большой Бизнес ($1000)</span>
                  </label>
                </div>
              </div>

              {/* Quick select buttons */}
              <div className="flex gap-1 mb-3">
                <button onClick={() => { setGiftT50(true); setGiftT250(false); setGiftT1000(false) }}
                  className="flex-1 py-1.5 rounded-lg text-[9px] font-bold border border-white/10 text-slate-400">
                  Только $50
                </button>
                <button onClick={() => { setGiftT50(true); setGiftT250(true); setGiftT1000(false) }}
                  className="flex-1 py-1.5 rounded-lg text-[9px] font-bold border border-white/10 text-slate-400">
                  $50 + $250
                </button>
                <button onClick={() => { setGiftT50(true); setGiftT250(true); setGiftT1000(true) }}
                  className="flex-1 py-1.5 rounded-lg text-[9px] font-bold border border-white/10 text-slate-400">
                  Все три
                </button>
              </div>

              {/* Gift button */}
              <button
                onClick={async () => {
                  if (!giftAddress.startsWith('0x') || giftAddress.length !== 42) {
                    showTx('❌ Введите корректный адрес', false)
                    return
                  }
                  if (!giftT50 && !giftT250 && !giftT1000) {
                    showTx('❌ Выберите хотя бы одно место', false)
                    return
                  }
                  const tables = []
                  if (giftT50) tables.push('$50')
                  if (giftT250) tables.push('$250')
                  if (giftT1000) tables.push('$1000')
                  await exec(
                    () => C.initializeFounderSlots(giftT50 ? 0 : giftT250 ? 1 : 2, [giftAddress, giftAddress, giftAddress, giftAddress, giftAddress, giftAddress, giftAddress]),
                    `✅ Выдано: ${tables.join(' + ')} → ${giftAddress.slice(0,8)}...`
                  )
                  setGiftAddress('')
                }}
                disabled={txPending}
                className="w-full py-2.5 rounded-xl text-[11px] font-bold bg-pink-500/15 text-pink-400 border border-pink-500/30">
                {txPending ? '⏳ Выдача...' : '🎁 Выдать места бесплатно'}
              </button>
            </div>
          </div>
        )}

        {/* ═══ INITIALIZATION ═══ */}
        {activeSection === 'init' && (
          <div className="space-y-3">
            <div className="p-3 rounded-2xl glass border-gold-400/20">
              <div className="text-[12px] font-bold text-gold-400 mb-3">🚀 Активация Бизнесов (Столов)</div>
              
              {/* Status */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { id: 0, name: 'Малый', price: '$50' },
                  { id: 1, name: 'Средний', price: '$250' },
                  { id: 2, name: 'Большой', price: '$1000' },
                ].map(t => (
                  <div key={t.id} className={`p-2 rounded-xl text-center border ${tablesInit[`table${t.id}`] ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-orange-500/30 bg-orange-500/10'}`}>
                    <div className="text-[10px] font-bold text-white">{t.name}</div>
                    <div className="text-[9px] text-slate-400">{t.price}</div>
                    <div className={`text-[10px] font-bold mt-1 ${tablesInit[`table${t.id}`] ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {tablesInit[`table${t.id}`] === null ? '...' : tablesInit[`table${t.id}`] ? '✅ Активен' : '⏳ Не активен'}
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={loadTablesInit} className="w-full mb-4 py-1.5 rounded-lg text-[10px] font-bold border border-white/10 text-slate-400">
                🔄 Обновить статус
              </button>

              {/* Selector */}
              <div className="mb-3">
                <label className="text-[10px] text-slate-400 mb-1 block">Выберите стол для активации:</label>
                <select value={initTable} onChange={e => setInitTable(e.target.value)}
                  className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white">
                  <option value="0">🏠 Малый Бизнес ($50)</option>
                  <option value="1">🏢 Средний Бизнес ($250)</option>
                  <option value="2">🏰 Большой Бизнес ($1000)</option>
                </select>
              </div>

              {/* 7 Founders inputs */}
              <div className="mb-3">
                <label className="text-[10px] text-slate-400 mb-1 block">7 адресов основателей:</label>
                <div className="space-y-1">
                  {founders.map((addr, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500 w-4">{i + 1}.</span>
                      <input
                        value={addr}
                        onChange={e => {
                          const newFounders = [...founders]
                          newFounders[i] = e.target.value
                          setFounders(newFounders)
                        }}
                        placeholder={`Адрес ${i + 1} (0x...)`}
                        className="flex-1 p-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fill with owner button */}
              <button 
                onClick={() => setFounders(Array(7).fill(wallet))}
                className="w-full mb-2 py-1.5 rounded-lg text-[10px] font-bold border border-white/10 text-slate-400">
                📋 Заполнить своим адресом (все 7)
              </button>

              {/* Initialize button */}
              <button
                onClick={async () => {
                  const validFounders = founders.filter(f => f.startsWith('0x') && f.length === 42)
                  if (validFounders.length !== 7) {
                    showTx('❌ Нужно 7 валидных адресов (0x...)', false)
                    return
                  }
                  await exec(
                    () => C.initializeFounderSlots(parseInt(initTable), founders),
                    `✅ Стол ${initTable} активирован!`
                  )
                  loadTablesInit()
                }}
                disabled={txPending}
                className="w-full py-2.5 rounded-xl text-[11px] font-bold bg-gold-400/15 text-gold-400 border border-gold-400/30">
                {txPending ? '⏳ Активация...' : `🚀 Активировать Стол ${['Малый $50', 'Средний $250', 'Большой $1000'][initTable]}`}
              </button>

              <div className="mt-3 p-2 rounded-lg bg-white/5 text-[9px] text-slate-500">
                ⚠️ После активации стол начнёт работать. 7 основателей получат первые места в матрице.
                Обычно все 7 мест отдают одному кошельку (себе).
              </div>
            </div>
          </div>
        )}

        {/* ═══ CONTRACTS ═══ */}
        {activeSection === 'contracts' && (
          <div className="space-y-2">
            {['RealEstateMatrix', 'CGTToken', 'NSTToken', 'GemVault', 'HousingFund', 'CharityFund'].map(name => (
              <div key={name} className="p-3 rounded-2xl glass">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold text-white">{name}</span>
                  <span className={`text-[10px] font-bold ${pauseStates[name] ? 'text-red-400' : 'text-emerald-400'}`}>
                    {pauseStates[name] ? '⏸' : '✅'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => exec(() => C.pauseContract(name), `⏸ ${name} paused`)}
                    disabled={txPending}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                    ⏸ Pause
                  </button>
                  <button onClick={() => exec(() => C.unpauseContract(name), `✅ ${name} unpaused`)}
                    disabled={txPending}
                    className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ▶ Unpause
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ EMERGENCY WITHDRAW ═══ */}
        {activeSection === 'withdraw' && (
          <div className="space-y-2">
            <div className="p-3 rounded-2xl glass border-red-500/15">
              <div className="text-[12px] font-bold text-red-400 mb-2">⚠️ Emergency Withdraw</div>
              <div className="text-[10px] text-slate-400 mb-2">Выводит ТОЛЬКО излишек (сверх обязательств). Безопасно для пользователей.</div>
              <select value={withdrawContract} onChange={e => setWithdrawContract(e.target.value)}
                className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white mb-2">
                <option value="RealEstateMatrix">RealEstateMatrix</option>
                <option value="MatrixPaymentsV2">MatrixPaymentsV2</option>
              </select>
              <button onClick={() => exec(() => C.emergencyWithdraw(withdrawContract), `💰 Излишек выведен из ${withdrawContract}`)}
                disabled={txPending}
                className="w-full py-2 rounded-xl text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                {txPending ? '⏳...' : '💰 Emergency Withdraw (только излишек)'}
              </button>
            </div>

            <div className="p-3 rounded-2xl glass border-purple-500/15">
              <div className="text-[12px] font-bold text-purple-400 mb-2">🔄 Flush CGT</div>
              <div className="text-[10px] text-slate-400 mb-2">Отправить накопленные 2% CGT на капитализацию</div>
              <button onClick={() => exec(() => C.flushReinvestCGT(), '✅ CGT flushed')}
                disabled={txPending}
                className="w-full py-2 rounded-xl text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {txPending ? '⏳...' : '🔄 Flush reinvest CGT'}
              </button>
            </div>
          </div>
        )}

        {/* ═══ AUTHORIZATION ═══ */}
        {activeSection === 'auth' && (
          <div className="p-3 rounded-2xl glass">
            <div className="text-[12px] font-bold text-gold-400 mb-2">🔑 Авторизация вызовов</div>
            <select value={authContract} onChange={e => setAuthContract(e.target.value)}
              className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white mb-2">
              {['RealEstateMatrix', 'CGTToken', 'GemVault', 'HousingFund', 'CharityFund', 'MatrixPaymentsV2', 'NSSPlatform'].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <input value={newAuthorized} onChange={e => setNewAuthorized(e.target.value)}
              placeholder="Адрес (0x...)"
              className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white mb-2" />
            <div className="flex gap-1.5">
              <button onClick={() => exec(() => C.setAuthorizedCaller(authContract, newAuthorized, true), `✅ Authorized in ${authContract}`)}
                disabled={txPending}
                className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ✅ Authorize
              </button>
              <button onClick={() => exec(() => C.setAuthorizedCaller(authContract, newAuthorized, false), `❌ Revoked in ${authContract}`)}
                disabled={txPending}
                className="flex-1 py-2 rounded-xl text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                ❌ Revoke
              </button>
            </div>
          </div>
        )}

        {/* ═══ CONTENT ═══ */}
        {activeSection === 'content' && (
          <div className="space-y-2">
            <div className="p-3 rounded-2xl glass">
              <div className="text-[12px] font-bold text-gold-400 mb-2">📢 Новости</div>
              {news.map((n, i) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b border-white/5">
                  <span className="flex-1 text-[11px] text-slate-300">{n}</span>
                  <button onClick={() => removeNews(i)} className="text-red-400/60 text-[10px]">✕</button>
                </div>
              ))}
              <div className="flex gap-1 mt-2">
                <input value={newsText} onChange={e => setNewsText(e.target.value)}
                  placeholder="Новая новость..."
                  className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white outline-none" />
                <button onClick={() => { if (newsText.trim()) { addNews(newsText.trim()); setNewsText('') } }}
                  className="px-3 py-2 rounded-lg text-[10px] font-bold gold-btn">+</button>
              </div>
            </div>

            <div className="p-3 rounded-2xl glass">
              <div className="text-[12px] font-bold text-purple-400 mb-2">🎯 Задания</div>
              {quests.map((q, i) => (
                <div key={i} className="flex items-center gap-2 py-1 border-b border-white/5">
                  <span className="flex-1 text-[11px] text-slate-300">{q.name} <span className="text-emerald-400">({q.reward})</span></span>
                  <button onClick={() => removeQuest(i)} className="text-red-400/60 text-[10px]">✕</button>
                </div>
              ))}
              <div className="flex gap-1 mt-2">
                <input value={qName} onChange={e => setQName(e.target.value)} placeholder="Задание..."
                  className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white outline-none" />
                <input value={qReward} onChange={e => setQReward(e.target.value)} placeholder="Награда"
                  className="w-20 p-2 rounded-lg bg-white/5 border border-white/10 text-[11px] text-white outline-none" />
                <button onClick={() => { if (qName.trim()) { addQuest({ name: qName.trim(), reward: qReward || '?', done: false }); setQName(''); setQReward('') } }}
                  className="px-3 py-2 rounded-lg text-[10px] font-bold gold-btn">+</button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ TEST ═══ */}
        {activeSection === 'test' && (
          <div className="p-3 rounded-2xl glass">
            <div className="text-[12px] font-bold text-gold-400 mb-2">🎮 Тест-режим</div>
            <div className="text-[10px] text-slate-500 mb-2">Переключить уровень (только UI, не блокчейн)</div>
            <div className="grid grid-cols-4 gap-1">
              {LEVELS.slice(0, 12).map((lv, i) => (
                <button key={i} onClick={() => setLevel(i)}
                  className="py-1.5 rounded-lg text-[9px] font-bold border border-white/8 text-slate-400 hover:border-gold-400/30 hover:text-gold-400">
                  {lv.emoji} {i}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ═══ MATRIX ═══ */}
        {activeSection === 'matrix' && (
          <div className="p-3 rounded-2xl glass">
            <div className="text-[12px] font-bold text-gold-400 mb-2">🏔 Статистика бизнесов</div>
            <div className="text-[10px] text-slate-400">
              Загрузка из контракта... Используйте обзор для просмотра здоровья контракта.
            </div>
            <button onClick={loadData} className="mt-2 w-full py-1.5 rounded-lg text-[10px] font-bold border border-white/8 text-slate-500">
              🔄 Обновить данные
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
