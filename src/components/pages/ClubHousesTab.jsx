'use client'
import { useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import * as C from '@/lib/contracts'
import * as Team from '@/lib/teamContracts'
import { shortAddress } from '@/lib/web3'
import { ethers } from 'ethers'

// ═══ Секция "Мой дом" — реальный прогресс из контрактов ═══
function MyHomeSection({ wallet, totalSqm }) {
  const [earnings, setEarnings] = useState(null)
  const [threshold, setThreshold] = useState(45) // процент порога (35-45%)
  const [housePrice, setHousePrice] = useState(120000) // стоимость дома по умолчанию
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!wallet) return
    setLoading(true)
    Team.getUserFullStats(wallet).then(stats => {
      if (stats) setEarnings(stats)
    }).catch(() => {})
    // Порог из LoanThresholdManager
    C.safeRead('LoanThresholdManager', 'getUserLoanPercent', [wallet]).then(pct => {
      if (pct) setThreshold(100 - Number(pct)) // loanPercent=55 → deposit=45, loanPercent=65 → deposit=35
    }).catch(() => {})
    setLoading(false)
  }, [wallet])

  const partnerEarned = parseFloat(earnings?.partnerEarnings || 0)
  const matrixEarned = parseFloat(earnings?.matrixEarnings || 0)
  const totalEarned = partnerEarned + matrixEarned
  const depositNeeded = housePrice * (threshold / 100)
  const loanAmount = housePrice - depositNeeded
  const progressPercent = depositNeeded > 0 ? Math.min((totalEarned / depositNeeded) * 100, 100) : 0
  const remaining = Math.max(depositNeeded - totalEarned, 0)

  return (
    <div className="px-3 mt-3 space-y-3">
      {/* Заголовок с порогом */}
      <div className="p-4 rounded-2xl glass">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[13px] font-black text-white">🏠 Мой дом</div>
          <div className="px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316' }}>
            Порог: {threshold}%
          </div>
        </div>

        {/* Заработано всего */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-slate-500">Заработано</span>
            <span className="text-gold-400 font-bold">${totalEarned.toFixed(2)} из ${depositNeeded.toLocaleString()}</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000" style={{ 
              width: `${progressPercent}%`, 
              background: progressPercent >= 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #ffd700, #f59e0b)' 
            }} />
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5 text-right">{progressPercent.toFixed(1)}%</div>
        </div>

        {/* Депозит и Займ */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[9px] text-slate-500">Твой депозит ({threshold}%)</div>
            <div className="text-[15px] font-black text-gold-400">${depositNeeded.toLocaleString()}</div>
          </div>
          <div className="p-2.5 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-[9px] text-slate-500">Займ от клуба ({100 - threshold}%)</div>
            <div className="text-[15px] font-black text-emerald-400">${loanAmount.toLocaleString()}</div>
          </div>
        </div>

        {/* Осталось заработать */}
        <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,215,0,0.04)', border: '1px solid rgba(255,215,0,0.1)' }}>
          <div className="text-[9px] text-slate-500">Осталось заработать:</div>
          <div className="text-xl font-black" style={{ color: remaining > 0 ? '#ffd700' : '#10b981' }}>
            {remaining > 0 ? `$${remaining.toFixed(2)}` : '✅ Готово!'}
          </div>
          <div className="text-[9px] text-slate-500 mt-0.5">через 3 бизнеса (${totalEarned.toFixed(2)} уже заработано)</div>
        </div>
      </div>

      {/* Детали заработка */}
      {earnings && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[11px] font-bold text-blue-400 mb-2">💰 Детали заработка</div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-lg bg-white/5 text-center">
              <div className="text-[12px] font-black text-emerald-400">${partnerEarned.toFixed(2)}</div>
              <div className="text-[8px] text-slate-500">Партнёрка</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5 text-center">
              <div className="text-[12px] font-black text-blue-400">${matrixEarned.toFixed(2)}</div>
              <div className="text-[8px] text-slate-500">Матричные</div>
            </div>
          </div>
        </div>
      )}

      {/* Стоимость дома — редактируемая */}
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

      {/* Как получить дом */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[11px] font-bold text-emerald-400 mb-2">📋 Как получить свой дом</div>
        <div className="space-y-2 text-[10px] text-slate-300">
          <div className="flex gap-2"><span className="text-gold-400 font-bold">1.</span><span>Покупай доли в бизнесе — зарабатывай деньги</span></div>
          <div className="flex gap-2"><span className="text-gold-400 font-bold">2.</span><span>Сжигай CHT — снижай порог с 45% до 35%</span></div>
          <div className="flex gap-2"><span className="text-gold-400 font-bold">3.</span><span>Заработай {threshold}% от стоимости дома</span></div>
          <div className="flex gap-2"><span className="text-gold-400 font-bold">4.</span><span>Клуб добавляет {100-threshold}% под 0% годовых</span></div>
          <div className="flex gap-2"><span className="text-gold-400 font-bold">5.</span><span>Получи ключи от собственного дома!</span></div>
        </div>
      </div>

      {!wallet && (
        <div className="p-4 rounded-2xl glass text-center">
          <div className="text-2xl mb-2">🔐</div>
          <div className="text-[11px] text-slate-400">Подключите кошелёк чтобы увидеть свой прогресс</div>
        </div>
      )}
    </div>
  )
}

export default function ClubHousesTab() {
  const { wallet, totalSqm, level, registered, addNotification, setTxPending, txPending, t } = useGameStore()
  const [tab, setTab] = useState('clubs') // 'my' | 'clubs'
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedHouse, setExpandedHouse] = useState(null)
  const [buyingSlot, setBuyingSlot] = useState(null) // 'houseId-tableId'

  const loadHouses = useCallback(async () => {
    setLoading(true)
    try {
      const CH = await import('@/lib/clubHouses')
      const data = await CH.getClubHouses()
      // Для каждого дома загружаем покупки
      const withPurchases = await Promise.all((data || []).map(async h => {
        const detail = await CH.getClubHouseWithPurchases(h.id).catch(() => null)
        return { ...h, purchased_sqm: detail?.purchased_sqm || 0, buyers: detail?.purchases?.length || 0 }
      }))
      setHouses(withPurchases)
    } catch { setHouses([]) }
    setLoading(false)
  }, [])

  useEffect(() => { loadHouses() }, [loadHouses])

  const TABLES = [
    { id: 0, price: 50, sqm: 0.05, color: '#3498DB', minLevel: 1 },
    { id: 1, price: 250, sqm: 0.25, color: '#F39C12', minLevel: 3 },
    { id: 2, price: 1000, sqm: 1.0, color: '#e74c3c', minLevel: 4 },
  ]

  const handleBuy = async (house, table) => {
    if (!wallet) { addNotification('❌ Подключите кошелёк'); return }
    if (!registered) { addNotification('❌ Сначала зарегистрируйтесь в GlobalWay'); return }
    if (level < table.minLevel) { addNotification(`❌ Нужен уровень ${table.minLevel}+`); return }

    const key = `${house.id}-${table.id}`
    setBuyingSlot(key)
    setTxPending(true)
    try {
      addNotification(`⏳ Покупка ${table.sqm} м² за $${table.price}...`)
      const result = await C.safeCall(() => C.buySlot(table.id))
      if (result.ok) {
        addNotification(`✅ Куплено ${table.sqm} м² в "${house.name}"!`)
        // Записываем покупку в Supabase для учёта по дому
        try {
          const CH = await import('@/lib/clubHouses')
          await CH.recordPurchase({
            house_id: house.id,
            wallet,
            sqm_purchased: table.sqm,
            amount_paid: table.price,
            tx_hash: result.tx?.hash || '',
            payment_type: 'usdt',
          })
        } catch (e) { console.error('Record purchase error:', e) }
        loadHouses()
      } else {
        addNotification(`❌ ${result.error || 'Ошибка покупки'}`)
      }
    } catch (err) {
      addNotification(`❌ ${err?.message?.slice(0, 80) || 'Ошибка'}`)
    }
    setTxPending(false)
    setBuyingSlot(null)
  }

  const STATUS = {
    planning: { emoji: '📋', label: 'Планируется', color: '#f59e0b' },
    active: { emoji: '🏗', label: 'Идёт строительство', color: '#3b82f6' },
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
        <button onClick={() => setTab('my')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border ${tab === 'my' ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
          🏠 Мой дом
        </button>
        <button onClick={() => setTab('clubs')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border ${tab === 'clubs' ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
          🏘 Клубные дома
        </button>
      </div>

      {/* ═══ МОЙ ДОМ ═══ */}
      {tab === 'my' && (
        <MyHomeSection wallet={wallet} totalSqm={totalSqm} />
      )}

      {/* ═══ КЛУБНЫЕ ДОМА ═══ */}
      {tab === 'clubs' && (
        <div className="px-3 mt-3 space-y-3">
          {loading && (
            <div className="text-center py-8 text-[11px] text-slate-500 animate-pulse">⏳ Загрузка клубных домов...</div>
          )}

          {!loading && houses.length === 0 && (
            <div className="p-6 rounded-2xl glass text-center">
              <div className="text-3xl mb-2">🏗</div>
              <div className="text-[13px] font-black text-white mb-1">Скоро здесь появятся клубные дома!</div>
              <div className="text-[10px] text-slate-500">Администратор добавит клубные дома для совместной покупки.</div>
            </div>
          )}

          {houses.map(house => {
            const st = STATUS[house.status] || STATUS.planning
            const price = parseFloat(house.total_price) || 0
            const sqm = parseFloat(house.total_sqm) || 0
            const pricePerSqm = sqm > 0 ? Math.round(price / sqm) : 0
            const isExpanded = expandedHouse === house.id
            const imgSrc = house.image_url || '/images/houses/house-modern.jpg'

            return (
              <div key={house.id} className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,215,0,0.15)' }}>
                {/* Фото дома */}
                <div className="relative h-48 overflow-hidden">
                  <img src={imgSrc} alt={house.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,31,0.95) 0%, rgba(10,10,31,0.3) 50%, transparent 100%)' }} />
                  {/* Статус бейдж */}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[9px] font-bold flex items-center gap-1"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', color: st.color }}>
                    {st.emoji} {st.label}
                  </div>
                  {/* Цена */}
                  <div className="absolute bottom-3 left-3">
                    <div className="text-xl font-black text-gold-400">${price.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400">{sqm} м² • ${pricePerSqm}/м²</div>
                  </div>
                </div>

                {/* Информация */}
                <div className="p-4" style={{ background: 'rgba(15,15,35,0.95)' }}>
                  <div className="text-[14px] font-black text-white mb-1">{house.name}</div>
                  {(house.city || house.country) && (
                    <div className="text-[11px] text-slate-400 mb-3">
                      📍 {house.city}{house.country ? `, ${house.country}` : ''}
                    </div>
                  )}

                  {/* Прогресс */}
                  <div className="mb-3">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-500">Собрано м² ({house.buyers || 0} чел.)</span>
                      <span className="text-emerald-400 font-bold">{(house.purchased_sqm || 0).toFixed(2)} / {sqm} м²</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: `${Math.min(((house.purchased_sqm || 0) / (sqm || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>

                  {/* 3 кнопки покупки */}
                  <div className="space-y-2">
                    {TABLES.map(table => {
                      const key = `${house.id}-${table.id}`
                      const isBuying = buyingSlot === key
                      const canBuy = wallet && registered && level >= table.minLevel && !txPending
                      return (
                        <button key={table.id}
                          onClick={() => handleBuy(house, table)}
                          disabled={!canBuy || isBuying}
                          className="w-full p-3 rounded-xl text-left flex items-center justify-between transition-all active:scale-[0.98]"
                          style={{ background: `${table.color}12`, border: `1px solid ${table.color}30`, opacity: canBuy ? 1 : 0.5 }}>
                          <div>
                            <div className="text-[13px] font-black text-white">
                              {isBuying ? '⏳ Покупка...' : `Купить за $${table.price}`}
                            </div>
                            <div className="text-[10px] text-slate-400">→ {table.sqm} м²{level < table.minLevel ? ` • нужен Lv.${table.minLevel}` : ''}</div>
                          </div>
                          <div className="text-[11px] font-bold" style={{ color: table.color }}>
                            {table.sqm} м²
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Описание — раскрывается */}
                  {house.description && (
                    <div className="mt-3">
                      <button onClick={() => setExpandedHouse(isExpanded ? null : house.id)}
                        className="text-[10px] text-slate-500 hover:text-white transition-all">
                        {isExpanded ? '▲ Скрыть описание' : '▼ Подробнее о доме'}
                      </button>
                      {isExpanded && (
                        <div className="mt-2 p-3 rounded-xl text-[10px] text-slate-400 leading-relaxed whitespace-pre-line"
                          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {house.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Обновить */}
          <button onClick={loadHouses} className="w-full py-2.5 rounded-xl text-[11px] font-bold text-slate-500 border border-white/8 hover:text-white transition-all">
            🔄 Обновить
          </button>
        </div>
      )}
    </div>
  )
}
