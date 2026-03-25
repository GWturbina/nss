'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { LEVELS } from './gameData'
import { translations } from '@/locales'

const useGameStore = create(
  persist(
    (set, get) => ({
  // ═══════════════════════════════════════════════════
  // LANGUAGE
  // ═══════════════════════════════════════════════════
  lang: 'ru',
  setLang: (lang) => set({ lang }),
  t: (key) => {
    const { lang } = get()
    return translations[lang]?.[key] || translations['en']?.[key] || key
  },

  // ═══════════════════════════════════════════════════
  // WALLET STATE
  // ═══════════════════════════════════════════════════
  wallet: null,
  chainId: null,
  walletType: null,
  isConnecting: false,
  registered: false,
  sponsorId: null,       // odixId пользователя из GlobalWay

  // ═══════════════════════════════════════════════════
  // БАЛАНСЫ (из блокчейна)
  // ═══════════════════════════════════════════════════
  bnb: 0,
  usdt: 0,
  cgt: 0,
  nst: 0,
  gwt: 0,

  // ═══════════════════════════════════════════════════
  // GAME STATE (тапалка — локальная)
  // ═══════════════════════════════════════════════════
  level: 0,
  energy: 200,
  maxEnergy: 200,
  taps: 0,
  localNst: 0,          // Локальные NST от тапов (не блокчейн)

  // ═══════════════════════════════════════════════════
  // БИЗНЕСЫ (из RealEstateMatrix)
  // ═══════════════════════════════════════════════════
  tables: [
    { slots: 0, earned: '0', pending: '0', reinvests: 0 },
    { slots: 0, earned: '0', pending: '0', reinvests: 0 },
    { slots: 0, earned: '0', pending: '0', reinvests: 0 },
  ],
  pendingWithdrawal: '0',
  totalSqm: 0,

  // ═══════════════════════════════════════════════════
  // ДОМ (из HousingFund)
  // ═══════════════════════════════════════════════════
  houseStatus: 'none',
  housePrice: 0,
  houseDeposit: 0,
  houseLoan: 0,
  houseRepaid: 0,

  // ═══════════════════════════════════════════════════
  // БлагоДАРЮ
  // ═══════════════════════════════════════════════════
  charityBalance: '0',
  canGive: false,
  giftsGiven: 0,

  // ═══════════════════════════════════════════════════
  // UI STATE
  // ═══════════════════════════════════════════════════
  dayMode: false,
  activeTab: 'mine',
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  txPending: false,
  lastError: null,

  // Admin
  ownerWallet: null,
  isAdmin: false,
  
  // Курс BNB (из SwapHelper)
  bnbPrice: 0,
  setBnbPrice: (price) => set({ bnbPrice: price }),

  // Evaporation (нерегистрированные)
  evapSeconds: 1800,
  evapActive: false,

  // News/Quests (из админки)
  news: ['Добро пожаловать в NSS!', 'Халвинг при 100K пользователей'],
  quests: [
    { name: 'Сделай 100 тапов', reward: '50 NST', done: false },
    { name: 'Пригласи друга', reward: '100 NST', done: false },
  ],

  // ═══════════════════════════════════════════════════
  // WALLET ACTIONS
  // ═══════════════════════════════════════════════════
  setWallet: (data) => set((s) => ({
    wallet: data.address,
    chainId: data.chainId,
    walletType: data.walletType,
    // Кошелёк подключен → испарение СТОП (даже до регистрации — токены не теряются)
    evapActive: false,
    // Сразу проверяем isAdmin если ownerWallet уже сохранён из localStorage
    isAdmin: s.ownerWallet 
      ? data.address.toLowerCase() === s.ownerWallet.toLowerCase()
      : false,
  })),

  // *** КЛЮЧЕВОЕ ИЗМЕНЕНИЕ ***
  // clearWallet НЕ сбрасывает localNst и taps — они принадлежат УСТРОЙСТВУ, не кошельку
  // Блокчейн-данные обнуляем, т.к. следующий кошелёк может быть другим
  clearWallet: () => set((s) => ({
    // Кошелёк
    wallet: null, chainId: null, walletType: null,
    registered: false, sponsorId: null,
    // Блокчейн-балансы — обнуляем (загрузятся при подключении нового кошелька)
    bnb: 0, usdt: 0, cgt: 0, nst: 0, gwt: 0,
    // Уровень → 0 (загружается из блокчейна каждый раз)
    level: 0,
    // *** localNst и taps — НЕ ТРОГАЕМ ***
    // localNst: сохраняем — это труд пользователя, он не должен пропасть
    // taps: сохраняем — статистика тапов
    // Испарение отключаем (включится только при первом тапе без кошелька)
    evapActive: false,
    evapSeconds: 1800,
    // Бизнесы → чистим
    tables: [
      { slots: 0, earned: '0', pending: '0', reinvests: 0, sqm: 0 },
      { slots: 0, earned: '0', pending: '0', reinvests: 0, sqm: 0 },
      { slots: 0, earned: '0', pending: '0', reinvests: 0, sqm: 0 },
    ],
    totalSqm: 0,
    pendingWithdrawal: '0',
    // Дом
    houseStatus: 'none', housePrice: 0, houseDeposit: 0, houseLoan: 0, houseRepaid: 0,
    // Благодарю
    charityBalance: '0', canGive: false,
  })),
  setConnecting: (v) => set({ isConnecting: v }),

  // ═══════════════════════════════════════════════════
  // BLOCKCHAIN SYNC
  // ═══════════════════════════════════════════════════
  updateBalances: (balances) => set({
    bnb: parseFloat(balances.bnb) || 0,
    usdt: parseFloat(balances.usdt) || 0,
    cgt: parseFloat(balances.cgt) || 0,
    nst: parseFloat(balances.nst) || 0,
  }),
  updateRegistration: (isReg, id) => set({ registered: isReg, sponsorId: id }),
  updateTables: (data) => {
    // sqmPerSlot для каждого стола ($50=0.05м², $250=0.25м², $1000=1м²)
    const SQM_PER_SLOT = [0.05, 0.25, 1.0]

    const tables = data.map((t, idx) => {
      if (!t) return { slots: 0, earned: '0', pending: '0', reinvests: 0, sqm: 0 }
      // getUserTableInfo возвращает: totalEarned, totalPaidOut, pending, slotsCount, sqmOwned
      const slotsCount = Number(t.slotsCount ?? t[3] ?? 0)
      // sqmOwned из контракта; если 0 — считаем по слотам (fallback)
      const sqmFromContract = Number(t.sqmOwned ?? t[4] ?? 0) / 1e18
      const sqmOwned = sqmFromContract > 0 ? sqmFromContract : slotsCount * SQM_PER_SLOT[idx]
      const pendingVal = (Number(t.pending ?? t[2] ?? 0) / 1e18).toFixed(2)
      return {
        slots: slotsCount,
        earned: (Number(t.totalEarned ?? t[0] ?? 0) / 1e18).toFixed(2),
        pending: pendingVal,
        reinvests: Number(t._reinvests ?? 0),
        sqm: sqmOwned,
      }
    })
    const totalSqm = tables.reduce((s, t) => s + t.sqm, 0)
    set({ tables, totalSqm })
  },
  updatePending: (amount) => set({ pendingWithdrawal: amount }),
  updateCharity: (balance, canGive) => set({ charityBalance: balance, canGive }),
  updateHouse: (info) => {
    if (!info || info.status === 0) {
      set({ houseStatus: 'none' })
    } else {
      const statusMap = ['none', 'applied', 'building', 'club_owned', 'personal']
      set({
        houseStatus: statusMap[Number(info.status)] || 'none',
        housePrice: Number(info.housePrice) / 1e18,
        houseDeposit: Number(info.ownerDeposit) / 1e18,
        houseLoan: Number(info.clubLoan) / 1e18,
        houseRepaid: Number(info.totalRepaid) / 1e18,
      })
    }
  },
  setOwnerWallet: (addr) => {
    const w = get().wallet
    set({
      ownerWallet: addr,
      isAdmin: w && addr && w.toLowerCase() === addr.toLowerCase(),
    })
  },

  // ═══════════════════════════════════════════════════
  // TX STATE
  // ═══════════════════════════════════════════════════
  setLoading: (v) => set({ isLoading: v }),
  setTxPending: (v) => set({ txPending: v }),
  setError: (err) => set({ lastError: err }),
  clearError: () => set({ lastError: null }),

  // ═══════════════════════════════════════════════════
  // GAME ACTIONS (тапалка — локальная)
  // ═══════════════════════════════════════════════════
  setTab: (tab) => set({ activeTab: tab }),
  toggleDayMode: () => set(s => ({ dayMode: !s.dayMode })),

  doTap: () => {
    const { energy, level, localNst, taps, registered, wallet, evapActive } = get()
    if (energy <= 0) return null
    const lv = LEVELS[level]
    const earned = lv.nstPerTap
    set({
      localNst: +(localNst + earned).toFixed(2),
      energy: energy - 1,
      taps: taps + 1,
    })
    // Испарение включается ТОЛЬКО если нет кошелька И нет регистрации И первый тап
    if (!registered && !wallet && !evapActive && taps === 0) set({ evapActive: true })
    return earned
  },

  regenEnergy: () => {
    const { energy, maxEnergy } = get()
    if (energy < maxEnergy) set({ energy: Math.min(energy + 1, maxEnergy) })
  },

  tickEvap: () => {
    const { evapSeconds, evapActive, registered, wallet } = get()
    // Испарение НЕ работает если: зарегистрирован ИЛИ кошелёк подключен
    if (!evapActive || registered || wallet) return null
    if (evapSeconds <= 1) {
      set({ localNst: 0, evapActive: false, evapSeconds: 1800 })
      return 'expired'
    }
    set({ evapSeconds: evapSeconds - 1 })
    return null
  },
  evaporate: () => set({ localNst: 0, evapActive: false, evapSeconds: 1800 }),

  // ═══════════════════════════════════════════════════
  // UI ACTIONS
  // ═══════════════════════════════════════════════════
  addNotification: (text) => set(s => ({
    notifications: [{ id: Date.now(), text, read: false, time: new Date().toLocaleString() }, ...s.notifications],
    unreadCount: s.unreadCount + 1,
  })),
  markAllRead: () => set(s => ({
    notifications: s.notifications.map(n => ({ ...n, read: true })),
    unreadCount: 0,
  })),

  // Admin content
  addNews: (text) => set(s => ({ news: [...s.news, text] })),
  removeNews: (i) => set(s => ({ news: s.news.filter((_, idx) => idx !== i) })),
  addQuest: (quest) => set(s => ({ quests: [...s.quests, quest] })),
  removeQuest: (i) => set(s => ({ quests: s.quests.filter((_, idx) => idx !== i) })),
  setLevel: (lv) => set({ level: lv }),
}),
    {
      name: 'nss-storage-v5',   // v5: сохраняем wallet+registered — токены больше не испаряются
      partialize: (state) => ({
        lang: state.lang,
        ownerWallet: state.ownerWallet,
        // *** КЛЮЧЕВОЕ: сохраняем wallet и registered ***
        // Без этого при перезагрузке registered=false → испарение включается → токены пропадают
        wallet: state.wallet,
        registered: state.registered,
        sponsorId: state.sponsorId,
        // Тапалка — сохраняем
        localNst: state.localNst,
        taps: state.taps,
      }),
      version: 5,
      // *** КЛЮЧЕВОЕ: миграция СОХРАНЯЕТ данные ***
      // Раньше было migrate: () => ({}) — всё стиралось при смене версии
      migrate: (persisted, version) => {
        // Из v4 → v5: просто добавились новые поля, старые данные сохраняем
        return {
          ...persisted,
          // Если wallet/registered не было в v4 — ставим дефолты
          wallet: persisted.wallet ?? null,
          registered: persisted.registered ?? false,
          sponsorId: persisted.sponsorId ?? null,
        }
      },
    }
  )
)

export default useGameStore
