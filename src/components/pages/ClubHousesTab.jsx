'use client'
/**
 * ClubHousesTab — Вкладка «Клубные дома»
 * 
 * Показывает:
 * - Список всех клубных домов из Supabase
 * - Для каждого: ClubHouseCard с визуализацией до/после и прогрессом
 * - Личный прогресс (MyHouseProgress) вверху
 */
import { useState, useEffect } from 'react'
import useGameStore from '@/lib/store'
import { getClubHouses } from '@/lib/clubHouses'
import ClubHouseCard from '@/components/game/ClubHouseCard'
import MyHouseProgress from '@/components/game/MyHouseProgress'

export default function ClubHousesTab() {
  const { wallet, t } = useGameStore()
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState('my') // 'my' | 'club'

  useEffect(() => {
    loadHouses()
  }, [])

  const loadHouses = async () => {
    setLoading(true)
    const data = await getClubHouses()
    setHouses(data)
    setLoading(false)
  }

  return (
    <div className="px-3 py-4 space-y-3">
      <h2 className="text-lg font-black" style={{ color: 'var(--gold, #ffd700)' }}>🏠 Дома</h2>

      {/* Переключатель: Мой дом / Клубные дома */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <button onClick={() => setActiveView('my')}
          className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all ${activeView === 'my' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
          🏠 Мой дом
        </button>
        <button onClick={() => setActiveView('club')}
          className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all ${activeView === 'club' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
          🏘 Клубные дома {houses.length > 0 && `(${houses.length})`}
        </button>
      </div>

      {/* ═══ МОЙ ДОМ ═══ */}
      {activeView === 'my' && (
        <MyHouseProgress />
      )}

      {/* ═══ КЛУБНЫЕ ДОМА ═══ */}
      {activeView === 'club' && (
        <>
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-[12px]">⏳ Загрузка клубных домов...</div>
          ) : houses.length === 0 ? (
            <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-4xl mb-2">🏗</div>
              <div className="text-[13px] font-bold text-white mb-1">Скоро здесь появятся клубные дома!</div>
              <div className="text-[11px] text-slate-400">
                Администратор добавит клубные дома для совместной покупки.<br />
                Экономия до 40% по сравнению с рынком.
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {houses.map(house => (
                <ClubHouseCard
                  key={house.id}
                  house={house}
                  onUpdate={loadHouses}
                />
              ))}
            </div>
          )}

          <button onClick={loadHouses} disabled={loading}
            className="w-full py-2 rounded-xl text-[11px] font-bold text-slate-400 border border-white/8">
            {loading ? '⏳...' : '🔄 Обновить'}
          </button>
        </>
      )}
    </div>
  )
}
