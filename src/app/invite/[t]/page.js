'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useParams } from 'next/navigation'

const TEMPLATES = {
  house: { emoji: '🏠', title: 'Свой дом под 0%!', sub: 'Заработай 35% — клуб добавит 65%.', color: '#f59e0b', ogImage: 'invite-house.jpg' },
  build: { emoji: '🏗', title: 'Строй дом — зарабатывай!', sub: 'Бесплатный старт. Тапай и копи на метры.', color: '#a855f7', ogImage: 'invite-build.jpg' },
  money: { emoji: '💰', title: '15 источников дохода!', sub: 'Недвижимость, инвестиции, AI — всё в одном.', color: '#10b981', ogImage: 'invite-money.jpg' },
}

const FEATURES = [
  { emoji: '⛏', title: 'Бесплатный старт', desc: 'Тапай руками — зарабатывай CHT токены' },
  { emoji: '📐', title: 'Метры квадратные', desc: 'Покупай м² от $50 — копи на свой дом' },
  { emoji: '🏔', title: '3 бизнеса', desc: 'От $50. Деньги работают в клубной системе' },
  { emoji: '🏠', title: 'Свой дом под 0%', desc: 'Заработай 35% — клуб добавит 65%!' },
  { emoji: '🏗', title: 'Клубные дома', desc: 'Совместное строительство — экономия до 40%' },
  { emoji: '👥', title: 'Партнёрская программа', desc: 'До 10% пожизненно от приглашённых' },
]

function InviteContent() {
  const searchParams = useSearchParams()
  const params = useParams()
  const rawRef = searchParams.get('ref') || '0'
  const ref = /^\d+$/.test(rawRef) ? parseInt(rawRef, 10) : 0
  const t = params.t || 'house'
  const tpl = TEMPLATES[t] || TEMPLATES.house

  const [registered, setRegistered] = useState(false)
  const [showExitPopup, setShowExitPopup] = useState(false)

  useEffect(() => {
    let triggered = false
    const handleMouseLeave = (e) => {
      if (e.clientY <= 5 && !triggered && !registered) {
        triggered = true
        setShowExitPopup(true)
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)

    const handleBack = () => {
      if (!registered) setShowExitPopup(true)
    }
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handleBack)

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('popstate', handleBack)
    }
  }, [registered])

  const handleRegister = () => {
    if (ref > 0) {
      localStorage.setItem('nss_ref', String(ref))
    }
    setRegistered(true)
    setShowExitPopup(false)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0a20 0%, #1a1040 50%, #0a0a20 100%)' }}>
      <div className="max-w-[430px] mx-auto px-4 py-6">
        <div className="flex justify-center mb-4">
          <img src="/icons/logo.png" alt="Club House" className="w-16 h-16 rounded-2xl" onError={e => { e.target.style.display='none' }} />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-white mb-1">
            <span className="mr-2">{tpl.emoji}</span>{tpl.title}
          </h1>
          <p className="text-sm text-slate-400">{tpl.sub}</p>
        </div>

        <div className="p-3 rounded-2xl mb-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[12px] text-slate-400">Тебя пригласил участник</div>
          <div className="text-lg font-black" style={{ color: tpl.color }}>ID: {ref}</div>
        </div>

        <div className="flex justify-center gap-3 mb-2">
          <span className="text-4xl">📐</span>
          <span className="text-4xl">🏗</span>
          <span className="text-4xl">🏠</span>
        </div>
        <h2 className="text-center text-lg font-black text-white mb-0.5">Метр Квадратный — Club House</h2>
        <p className="text-center text-[12px] text-slate-500 mb-4">Тапай • Копи метры • Строй дом</p>

        <div className="space-y-2 mb-6">
          {FEATURES.map((f, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-xl mt-0.5">{f.emoji}</span>
              <div>
                <div className="text-[13px] font-bold text-white">{f.title}</div>
                <div className="text-[11px] text-slate-400">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {!registered ? (
          <button onClick={handleRegister} className="w-full py-4 rounded-2xl text-lg font-black mb-4" style={{ background: 'linear-gradient(135deg, #ffd700, #f5a623)', color: '#000' }}>
            🎁 Присоединиться — БЕСПЛАТНО
          </button>
        ) : (
          <div className="p-4 rounded-2xl mb-4" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="text-center mb-3">
              <div className="text-[13px] text-emerald-400 font-bold">✅ Реферал сохранён!</div>
              <div className="text-sm font-black text-white mt-1">Спонсор ID: #{ref}</div>
              <div className="text-[11px] text-slate-400 mt-1">Подключи кошелёк в приложении — регистрация пройдёт автоматически с этим спонсором</div>
              <a href="/" className="block w-full py-3 rounded-2xl text-center text-sm font-black mt-3" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>
                🚀 Войти в приложение
              </a>
            </div>
          </div>
        )}

        <div className="text-center text-[10px] text-slate-600 mt-4">
          Метр Квадратный — Club House • Powered by GlobalWay
        </div>
      </div>

      {showExitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="max-w-[380px] w-full p-5 rounded-3xl" style={{ background: 'linear-gradient(180deg, #1a1040, #0a0a20)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <div className="text-center">
              <div className="text-4xl mb-2">⏳</div>
              <h3 className="text-xl font-black text-white mb-1">Не спеши уходить!</h3>
              <p className="text-[12px] text-slate-400 mb-4">Ты в одном шаге от вступления в клуб</p>
              <div className="space-y-2 mb-4 text-left">
                <div className="flex items-center gap-2 text-[12px]"><span className="text-emerald-400">✓</span><span className="text-slate-300">Бесплатная регистрация</span></div>
                <div className="flex items-center gap-2 text-[12px]"><span className="text-emerald-400">✓</span><span className="text-slate-300">Свой дом под 0% годовых</span></div>
                <div className="flex items-center gap-2 text-[12px]"><span className="text-emerald-400">✓</span><span className="text-slate-300">3 бизнеса от $50</span></div>
                <div className="flex items-center gap-2 text-[12px]"><span className="text-emerald-400">✓</span><span className="text-slate-300">CHT токены — тапай бесплатно</span></div>
              </div>
              <button onClick={handleRegister} className="w-full py-3 rounded-2xl text-base font-black mb-2" style={{ background: 'linear-gradient(135deg, #ffd700, #f5a623)', color: '#000' }}>
                🎁 Присоединиться
              </button>
              <button onClick={() => setShowExitPopup(false)} className="text-[11px] text-slate-500 hover:text-slate-400">
                Нет, спасибо
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function InvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a20' }}><div className="text-white">Loading...</div></div>}>
      <InviteContent />
    </Suspense>
  )
}
