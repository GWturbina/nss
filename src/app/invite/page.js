'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const TEMPLATES = {
  gems: { emoji: '💎', title: 'Ищи камни — зарабатывай!', sub: 'Бесплатный старт. Тапай и добывай.', color: '#a855f7', ogImage: 'invite-gems.jpg' },
  house: { emoji: '🏠', title: 'Свой дом под 0%!', sub: 'Заработай 35% — клуб добавит 65%.', color: '#f59e0b', ogImage: 'invite-house.jpg' },
  money: { emoji: '💰', title: '15 источников дохода!', sub: 'Камни, инвестиции, AI — всё в одном.', color: '#10b981', ogImage: 'invite-money.jpg' },
}

const FEATURES = [
  { emoji: '⛏', title: 'Бесплатный старт', desc: 'Тапай руками — зарабатывай NST токены' },
  { emoji: '💎', title: 'Реальные камни', desc: 'Рубины, сапфиры, изумруды со скидкой до 40%' },
  { emoji: '🏔', title: '3 инвест-проекта', desc: 'От $50. Деньги работают в клубной системе' },
  { emoji: '🏠', title: 'Свой дом под 0%', desc: 'Заработай 35% — клуб добавит 65%!' },
  { emoji: '🤖', title: 'AI-помощник', desc: 'Генерация картинок и озвучка для бизнеса' },
  { emoji: '👥', title: '9 уровней партнёрки', desc: 'До 10% ПОЖИЗНЕННО от приглашённых' },
]

export default function InvitePage() {
  const searchParams = useSearchParams()
  const ref = searchParams.get('ref') || '0'
  const t = searchParams.get('t') || 'gems'
  const tpl = TEMPLATES[t] || TEMPLATES.gems

  const [registered, setRegistered] = useState(false)
  const [myRef, setMyRef] = useState('')
  const [showExitPopup, setShowExitPopup] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selTemplate, setSelTemplate] = useState('gems')

  // Exit-intent: мышь уходит вверх
  useEffect(() => {
    let triggered = false
    const handleMouseLeave = (e) => {
      if (e.clientY <= 5 && !triggered && !registered) {
        triggered = true
        setShowExitPopup(true)
      }
    }
    document.addEventListener('mouseleave', handleMouseLeave)

    // Мобильный: кнопка назад
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
    const tempId = 'NSS' + Math.floor(Math.random() * 900000 + 100000)
    setMyRef(tempId)
    setRegistered(true)
    setShowExitPopup(false)
  }

  const myLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite?ref=${myRef}&t=${selTemplate}`

  const shareText = `💎 NSS — Искатели Камней! Бесплатный старт, реальные камни со скидкой 40%, свой дом под 0%! Присоединяйся: ${myLink}`

  const copyLink = () => {
    navigator.clipboard.writeText(myLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareLinks = {
    tg: `https://t.me/share/url?url=${encodeURIComponent(myLink)}&text=${encodeURIComponent(shareText)}`,
    wa: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    vb: `viber://forward?text=${encodeURIComponent(shareText)}`,
    fb: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(myLink)}`,
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0a0a20 0%, #1a1040 50%, #0a0a20 100%)' }}>
      <div className="max-w-[430px] mx-auto px-4 py-6">

        {/* Логотип */}
        <div className="flex justify-center mb-4">
          <img src="/icons/logo.png" alt="NSS" className="w-16 h-16 rounded-2xl" 
            onError={e => { e.target.style.display='none' }} />
        </div>

        {/* Заголовок */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-black text-white mb-1">
            <span className="mr-2">{tpl.emoji}</span>{tpl.title}
          </h1>
          <p className="text-sm text-slate-400">{tpl.sub}</p>
        </div>

        {/* Пригласивший */}
        <div className="p-3 rounded-2xl mb-4 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="text-[12px] text-slate-400">Тебя пригласил участник</div>
          <div className="text-lg font-black" style={{ color: tpl.color }}>ID: {ref}</div>
        </div>

        {/* Иконки */}
        <div className="flex justify-center gap-3 mb-2">
          <span className="text-4xl">💎</span>
          <span className="text-4xl">⛏</span>
          <span className="text-4xl">🏠</span>
        </div>
        <h2 className="text-center text-lg font-black text-white mb-0.5">NSS — Искатели Камней</h2>
        <p className="text-center text-[12px] text-slate-500 mb-4">Тапай • Зарабатывай • Строй дом</p>

        {/* Фичи */}
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

        {/* Кнопка регистрации */}
        {!registered ? (
          <button onClick={handleRegister}
            className="w-full py-4 rounded-2xl text-lg font-black mb-4"
            style={{ background: 'linear-gradient(135deg, #ffd700, #f5a623)', color: '#000' }}>
            🎁 Получить подарок — БЕСПЛАТНО
          </button>
        ) : (
          /* Блок шеринга после регистрации */
          <div className="p-4 rounded-2xl mb-4" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
            <div className="text-center mb-3">
              <div className="text-[13px] text-emerald-400 font-bold">✅ Ты в системе!</div>
              <div className="text-lg font-black text-white">Твой ID: {myRef}</div>
              <div className="text-[11px] text-slate-400">Теперь приглашай друзей — получай 10% пожизненно</div>
              <a href="/" className="block w-full py-3 rounded-2xl text-center text-sm font-black mt-3"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}>
              🚀 Войти в кабинет
            </a>
            </div>

            {/* Выбор шаблона */}
            <div className="text-[11px] text-slate-400 mb-1">Стиль приглашения:</div>
            <div className="flex gap-1 mb-3">
              {Object.entries(TEMPLATES).map(([key, val]) => (
                <button key={key} onClick={() => setSelTemplate(key)}
                  className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border ${
                    selTemplate === key ? 'border-gold-400/30 bg-gold-400/10 text-gold-400' : 'border-white/8 text-slate-500'
                  }`}>
                  {val.emoji} {key === 'gems' ? 'Камни' : key === 'house' ? 'Дом' : 'Доход'}
                </button>
              ))}
            </div>

            {/* Ссылка */}
            <div className="p-2 rounded-xl mb-3 text-center break-all text-[11px] font-mono"
              style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', color: '#ffd700' }}>
              {myLink}
            </div>

            {/* Кнопки */}
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button onClick={copyLink}
                className="py-2 rounded-xl text-[12px] font-bold"
                style={{ background: 'rgba(255,255,255,0.06)', color: copied ? '#10b981' : '#fff', border: '1px solid rgba(255,255,255,0.1)' }}>
                {copied ? '✅ Скопировано!' : '📋 Копировать'}
              </button>
              <button onClick={() => navigator.share?.({ text: shareText, url: myLink })}
                className="py-2 rounded-xl text-[12px] font-bold"
                style={{ background: 'linear-gradient(135deg, #ffd700, #f5a623)', color: '#000' }}>
                📤 Поделиться
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <a href={shareLinks.tg} target="_blank" rel="noopener" className="py-2 rounded-xl text-center text-[11px] font-bold bg-[#229ED9]/15 text-[#229ED9] border border-[#229ED9]/20">✈️ TG</a>
              <a href={shareLinks.wa} target="_blank" rel="noopener" className="py-2 rounded-xl text-center text-[11px] font-bold bg-[#25D366]/15 text-[#25D366] border border-[#25D366]/20">💬 WA</a>
              <a href={shareLinks.vb} target="_blank" rel="noopener" className="py-2 rounded-xl text-center text-[11px] font-bold bg-[#7360F2]/15 text-[#7360F2] border border-[#7360F2]/20">📱 Vb</a>
              <a href={shareLinks.fb} target="_blank" rel="noopener" className="py-2 rounded-xl text-center text-[11px] font-bold bg-[#1877F2]/15 text-[#1877F2] border border-[#1877F2]/20">📘 FB</a>
            </div>
          </div>
        )}

        {/* Футер */}
        <div className="text-center text-[10px] text-slate-600 mt-4">
          NSS — Искатели Природных Камней • Powered by GlobalWay
        </div>
      </div>

      {/* EXIT-INTENT POPUP */}
      {showExitPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div className="max-w-[380px] w-full p-5 rounded-3xl" style={{ background: 'linear-gradient(180deg, #1a1040, #0a0a20)', border: '1px solid rgba(255,215,0,0.2)' }}>
            <div className="text-center">
              <div className="text-4xl mb-2">⏳</div>
              <h3 className="text-xl font-black text-white mb-1">Не спеши уходить!</h3>
              <p className="text-[12px] text-slate-400 mb-4">Ты в одном шаге от бесплатного старта</p>

              <div className="space-y-2 mb-4 text-left">
                <div className="flex items-center gap-2 text-[12px]"><span className="text-emerald-400">✓</span><span className="text-slate-300">Бесплатная регистрация</span></div>
                <div className="flex items-center gap-2 text-[12px]"><span className="text-emerald-400">✓</span><span className="text-slate-300">21 день тестового периода</span></div>
                <div className="flex items-center gap-2 text-[12px]"><span className="text-emerald-400">✓</span><span className="text-slate-300">Камни со скидкой до 40%</span></div>
                <div className="flex items-center gap-2 text-[12px]"><span className="text-emerald-400">✓</span><span className="text-slate-300">Свой дом под 0% годовых</span></div>
              </div>

              <button onClick={handleRegister}
                className="w-full py-3 rounded-2xl text-base font-black mb-2"
                style={{ background: 'linear-gradient(135deg, #ffd700, #f5a623)', color: '#000' }}>
                🎁 Получить подарок
              </button>
              <button onClick={() => setShowExitPopup(false)}
                className="text-[11px] text-slate-500 hover:text-slate-400">
                Нет, спасибо
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
