'use client'
import { useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import { shortAddress } from '@/lib/web3'

export default function ClubHousesTab() {
  const { wallet, totalSqm, t } = useGameStore()
  const [tab, setTab] = useState('clubs') // 'my' | 'clubs'
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedHouse, setExpandedHouse] = useState(null)

  const loadHouses = useCallback(async () => {
    setLoading(true)
    try {
      const CH = await import('@/lib/clubHouses')
      const data = await CH.getClubHouses()
      setHouses(data || [])
    } catch { setHouses([]) }
    setLoading(false)
  }, [])

  useEffect(() => { loadHouses() }, [loadHouses])

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
        <div className="px-3 mt-3 space-y-3">
          <div className="p-4 rounded-2xl glass text-center">
            <div className="text-3xl mb-2">🏠</div>
            <div className="text-[13px] font-black text-white mb-1">Мой прогресс</div>
            <div className="text-2xl font-black text-gold-400">{totalSqm.toFixed(2)} м²</div>
            <div className="text-[10px] text-slate-500 mt-1">Накоплено через бизнес-систему</div>
          </div>

          <div className="p-3 rounded-2xl glass">
            <div className="text-[11px] font-bold text-emerald-400 mb-2">📋 Как получить свой дом</div>
            <div className="space-y-2 text-[10px] text-slate-300">
              <div className="flex gap-2"><span className="text-gold-400 font-bold">1.</span><span>Покупай доли в бизнесе — копи метры квадратные</span></div>
              <div className="flex gap-2"><span className="text-gold-400 font-bold">2.</span><span>Сжигай CHT — снижай порог займа с 45% до 35%</span></div>
              <div className="flex gap-2"><span className="text-gold-400 font-bold">3.</span><span>Накопи 35% от стоимости дома</span></div>
              <div className="flex gap-2"><span className="text-gold-400 font-bold">4.</span><span>Клуб добавляет 65% под 0% годовых</span></div>
              <div className="flex gap-2"><span className="text-gold-400 font-bold">5.</span><span>Получи ключи от собственного дома!</span></div>
            </div>
          </div>
        </div>
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
                      <span className="text-slate-500">Собрано м²</span>
                      <span className="text-emerald-400 font-bold">0 / {sqm} м²</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: '0%' }} />
                    </div>
                  </div>

                  {/* 3 кнопки покупки */}
                  <div className="space-y-2">
                    {[
                      { price: 50, sqm: 0.05, color: '#3498DB' },
                      { price: 250, sqm: 0.25, color: '#F39C12' },
                      { price: 1000, sqm: 1.0, color: '#e74c3c' },
                    ].map(slot => (
                      <button key={slot.price}
                        className="w-full p-3 rounded-xl text-left flex items-center justify-between transition-all active:scale-[0.98]"
                        style={{ background: `${slot.color}12`, border: `1px solid ${slot.color}30` }}>
                        <div>
                          <div className="text-[13px] font-black text-white">Купить за ${slot.price}</div>
                          <div className="text-[10px] text-slate-400">→ {slot.sqm} м²</div>
                        </div>
                        <div className="text-[11px] font-bold" style={{ color: slot.color }}>
                          {slot.sqm} м²
                        </div>
                      </button>
                    ))}
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
