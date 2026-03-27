'use client'
import { useState, useEffect, useRef } from 'react'
import useGameStore from '@/lib/store'
import { shortAddress } from '@/lib/web3'
import { LEVELS } from '@/lib/gameData'
import * as C from '@/lib/contracts'
import * as Team from '@/lib/teamContracts'

const AVATARS = ['👨‍💼','👩‍💻','🧔','👩‍🔬','👨‍🚀','👩‍🎨','🧑‍🔧','👩‍🏫','👨‍🌾','👩‍⚕️','🦸‍♂️','🦸‍♀️','🧙‍♂️','🧙‍♀️','🥷','🤴','👸']

export default function TeamTab() {
  const { wallet, registered, sponsorId, level, taps, localNst, nst, addNotification, t } = useGameStore()
  const [section, setSection] = useState('team')
  const [copied, setCopied] = useState(false)

  // Профиль
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('👨‍💼')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [editingNick, setEditingNick] = useState(false)
  const [tempNick, setTempNick] = useState('')
  const fileInputRef = useRef(null)

  // Реальные данные из контрактов
  const [percents, setPercents] = useState([10, 7, 5, 3, 2, 1, 1, 0.5, 0.5])
  const [requiredLevels, setRequiredLevels] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9])
  const [marketingStats, setMarketingStats] = useState(null)
  const [matrixStats, setMatrixStats] = useState(null)
  const [matrixByLevel, setMatrixByLevel] = useState(null)
  const [gwStatus, setGwStatus] = useState(null)
  const [loadingData, setLoadingData] = useState(false)
  const [expandedLine, setExpandedLine] = useState(null)

  // Загрузка профиля
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setNickname(localStorage.getItem('nss_nickname') || '')
      setAvatar(localStorage.getItem('nss_avatar') || '👨‍💼')
    }
  }, [])

  // Загрузка реальных данных из контрактов
  useEffect(() => {
    Team.getMarketingPercents().then(setPercents).catch(() => {})
    Team.getRequiredLevels().then(setRequiredLevels).catch(() => {})
  }, [])

  useEffect(() => {
    if (!wallet) return
    setLoadingData(true)
    Promise.all([
      Team.getUserMarketingStats(wallet),
      Team.getMatrixUserStats(wallet),
      Team.getMatrixEarningsByLevel(wallet),
      C.getGWUserStatus(wallet),
    ]).then(([mkt, matrix, byLevel, gw]) => {
      setMarketingStats(mkt)
      setMatrixStats(matrix)
      setMatrixByLevel(byLevel)
      setGwStatus(gw)
    }).catch(() => {}).finally(() => setLoadingData(false))
  }, [wallet])

  const lv = LEVELS[level] || LEVELS[0]
  const totalNst = nst + localNst
  const isCustomPhoto = avatar.startsWith('data:')

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const referralLink = sponsorId ? `${baseUrl}/invite/house?ref=${sponsorId}` : ''
  const shareText = '🏠 Свой дом под 0%! Тапай — копи метры — строй дом. Бесплатный старт!'
  const viberText = 'Свой дом под 0%! Тапай, копи метры, строй дом. Бесплатный старт!'

  const shareLinks = {
    tg: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`,
    wa: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${referralLink}`)}`,
    vb: `viber://forward?text=${encodeURIComponent(`${viberText}\n${referralLink}`)}`,
  }

  const copyLink = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(referralLink)
    else { const ta = document.createElement('textarea'); ta.value = referralLink; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta) }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Фото
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = 200; canvas.width = size; canvas.height = size
        const ctx = canvas.getContext('2d')
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2, sy = (img.height - min) / 2
        ctx.beginPath(); ctx.arc(size/2, size/2, size/2, 0, Math.PI*2); ctx.clip()
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        const base64 = canvas.toDataURL('image/jpeg', 0.85)
        setAvatar(base64); localStorage.setItem('nss_avatar', base64)
        setShowAvatarPicker(false)
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file); e.target.value = ''
  }

  const saveNickname = () => {
    if (tempNick.trim()) { setNickname(tempNick.trim()); localStorage.setItem('nss_nickname', tempNick.trim()) }
    setEditingNick(false)
  }
  const selectAvatar = (av) => { setAvatar(av); localStorage.setItem('nss_avatar', av); setShowAvatarPicker(false) }

  const sections = [
    { id: 'profile', icon: '👤', label: 'Профиль' },
    { id: 'team', icon: '👥', label: 'Команда' },
    { id: 'matrix', icon: '📊', label: 'Матрица' },
  ]

  // Ранг
  const rankNum = matrixStats?.rank || gwStatus?.rank || 0
  const rankName = Team.RANK_NAMES[rankNum] || 'Без ранга'
  const rankColor = Team.RANK_COLORS[rankNum] || '#94a3b8'
  const rankEmoji = Team.RANK_EMOJIS[rankNum] || '⚪'

  // Общий маркетинговый заработок
  const totalMarketing = parseFloat(marketingStats?.totalEarned || 0)
  const totalMatrix = parseFloat(matrixStats?.totalEarned || 0)

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1">
        <h2 className="text-lg font-black text-gold-400">👥 Команда</h2>
      </div>

      {/* Табы */}
      <div className="flex gap-1 px-3 mt-1">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-bold border ${section === s.id ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'}`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* ═══ ПРОФИЛЬ ═══ */}
      {section === 'profile' && (
        <div className="px-3 mt-2 space-y-2">
          <div className="p-4 rounded-2xl glass text-center">
            {/* Аватарка */}
            <div className="relative inline-block mb-2">
              <div onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
                style={{ border: `3px solid ${lv.color}60`, background: `${lv.color}15` }}>
                {isCustomPhoto ? <img src={avatar} alt="" className="w-full h-full object-cover" /> : <span className="text-4xl">{avatar}</span>}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2"
                style={{ background: `${lv.color}30`, borderColor: lv.color, color: lv.color }}>{level}</div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] bg-white/10 border border-white/20 cursor-pointer"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>📷</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

            {showAvatarPicker && (
              <div className="p-3 rounded-xl bg-white/5 mb-3">
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 rounded-xl text-[11px] font-bold mb-2 bg-blue-500/15 text-blue-400 border border-blue-500/25">📷 Загрузить фото</button>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {AVATARS.map((av, i) => (
                    <button key={i} onClick={() => selectAvatar(av)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${avatar === av ? 'bg-gold-400/20 border border-gold-400/40' : 'hover:bg-white/10'}`}>{av}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Никнейм */}
            {editingNick ? (
              <div className="flex gap-2 justify-center mb-2">
                <input value={tempNick} onChange={e => setTempNick(e.target.value)} placeholder="Введите ник" maxLength={20}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-sm text-white text-center outline-none w-40" />
                <button onClick={saveNickname} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold">✓</button>
              </div>
            ) : (
              <div onClick={() => { setTempNick(nickname); setEditingNick(true) }} className="cursor-pointer mb-1">
                <div className="text-lg font-black text-white">{nickname || 'Задать ник'}</div>
                <div className="text-[9px] text-slate-500">нажми чтобы изменить</div>
              </div>
            )}

            <div className="text-[10px] text-slate-500">
              {wallet ? shortAddress(wallet) : 'Не подключён'}
              {sponsorId ? ` • ID: ${sponsorId}` : ''}
            </div>

            {/* Ранг */}
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{ background: `${rankColor}15`, border: `1px solid ${rankColor}30` }}>
              <span>{rankEmoji}</span>
              <span className="text-[11px] font-bold" style={{ color: rankColor }}>{rankName}</span>
            </div>
          </div>

          {/* Статистика */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 rounded-2xl glass text-center">
              <div className="text-sm font-black" style={{ color: lv.color }}>{lv.emoji}</div>
              <div className="text-[10px] font-bold text-white">Lv.{level}</div>
            </div>
            <div className="p-2 rounded-2xl glass text-center">
              <div className="text-sm font-black text-gold-400">{totalNst.toFixed(0)}</div>
              <div className="text-[9px] text-slate-500">CHT</div>
            </div>
            <div className="p-2 rounded-2xl glass text-center">
              <div className="text-sm font-black text-emerald-400">${totalMarketing.toFixed(2)}</div>
              <div className="text-[9px] text-slate-500">Маркетинг</div>
            </div>
            <div className="p-2 rounded-2xl glass text-center">
              <div className="text-sm font-black text-blue-400">${totalMatrix.toFixed(2)}</div>
              <div className="text-[9px] text-slate-500">Матрица</div>
            </div>
          </div>

          {/* GW Статус */}
          {gwStatus && (
            <div className="p-3 rounded-2xl glass">
              <div className="text-[11px] font-bold text-gold-400 mb-2">🌐 GlobalWay</div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="flex justify-between"><span className="text-slate-500">ID:</span><span className="text-white font-bold">{gwStatus.odixId || '—'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Пакет:</span><span className="text-white font-bold">{gwStatus.maxPackage}/12</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Ранг:</span><span style={{ color: rankColor }} className="font-bold">{rankEmoji} {rankName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Quarterly:</span><span className={gwStatus.quarterlyActive ? 'text-emerald-400' : 'text-red-400'}>{gwStatus.quarterlyActive ? '✅ Активен' : '❌ Нет'}</span></div>
                <div className="flex justify-between col-span-2"><span className="text-slate-500">Спонсор:</span><span className="text-white font-mono text-[9px]">{gwStatus.sponsor ? shortAddress(gwStatus.sponsor) : '—'}</span></div>
              </div>
              {/* Активные уровни */}
              <div className="mt-2 flex gap-0.5 flex-wrap">
                {gwStatus.activeLevels?.map((active, i) => (
                  <div key={i} className={`w-6 h-6 rounded flex items-center justify-center text-[8px] font-bold ${active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/3 text-slate-600 border border-white/5'}`}>
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ КОМАНДА — 9 ЛИНИЙ ПАРТНЁРКИ ═══ */}
      {section === 'team' && (
        <div className="px-3 mt-2 space-y-2">
          {/* Реферальная ссылка */}
          <div className="p-3 rounded-2xl glass">
            <div className="text-[12px] font-bold text-gold-400 mb-2">🔗 Реферальная ссылка</div>
            {!wallet ? (
              <div className="text-center py-3">
                <div className="text-2xl mb-1">🔐</div>
                <div className="text-[11px] text-slate-400">Подключите кошелёк</div>
              </div>
            ) : !referralLink ? (
              <div className="text-center py-3">
                <div className="text-2xl mb-1">⛏</div>
                <div className="text-[11px] text-slate-400">Купи первый уровень — получишь ID</div>
              </div>
            ) : (<>
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-300 break-all">{referralLink}</div>
              <div className="text-[10px] text-slate-500 mt-1">ID: {sponsorId}</div>
              <button onClick={copyLink} className={`w-full mt-2 py-2 rounded-xl text-[11px] font-bold ${copied ? 'bg-emerald-500/15 text-emerald-400' : 'gold-btn'}`}>
                {copied ? '✅ Скопировано' : '📋 Копировать'}
              </button>
              <div className="flex gap-1.5 mt-1.5">
                <a href={shareLinks.tg} target="_blank" rel="noopener" className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center bg-blue-500/10 text-blue-400 border border-blue-500/20">📱 Telegram</a>
                <a href={shareLinks.wa} target="_blank" rel="noopener" className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">💬 WhatsApp</a>
                <a href={shareLinks.vb} target="_blank" rel="noopener" className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center bg-purple-500/10 text-purple-400 border border-purple-500/20">📞 Viber</a>
              </div>
            </>)}
          </div>

          {/* Общий заработок с партнёрки */}
          {marketingStats && (
            <div className="p-3 rounded-2xl glass">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[12px] font-bold text-emerald-400">💰 Заработок с партнёрки</div>
                <div className="text-[14px] font-black text-emerald-400">${totalMarketing.toFixed(2)}</div>
              </div>
            </div>
          )}

          {/* 9 линий — РЕАЛЬНЫЕ проценты из контракта */}
          <div className="p-3 rounded-2xl glass">
            <div className="text-[12px] font-bold text-gold-400 mb-3">📊 9 линий партнёрки</div>

            {loadingData && !marketingStats && (
              <div className="text-center py-4 text-slate-500 text-[11px] animate-pulse">⏳ Загрузка из контракта...</div>
            )}

            <div className="space-y-1">
              {percents.map((pct, i) => {
                const earned = marketingStats?.earnedByLine?.[i] ? parseFloat(marketingStats.earnedByLine[i]) : 0
                const reqLevel = requiredLevels[i] || (i + 1)
                const isUnlocked = level >= reqLevel
                const isExpanded = expandedLine === i

                return (
                  <div key={i}>
                    <button onClick={() => setExpandedLine(isExpanded ? null : i)}
                      className="w-full flex items-center gap-2 py-2 border-b border-white/5 text-left">
                      <span className="text-[11px] font-black w-6" style={{ color: isUnlocked ? '#ffd700' : '#4a5568' }}>{i + 1}</span>
                      <div className="flex-1 h-2 rounded-full bg-white/5">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${Math.max(pct * 10, 3)}%`,
                          background: isUnlocked ? 'linear-gradient(90deg, #10b981, #059669)' : '#374151',
                        }} />
                      </div>
                      <span className="text-[11px] font-bold w-12 text-right" style={{ color: isUnlocked ? '#10b981' : '#4a5568' }}>{pct}%</span>
                      <span className="text-[10px] font-bold w-16 text-right" style={{ color: earned > 0 ? '#ffd700' : '#4a5568' }}>
                        {earned > 0 ? `$${earned.toFixed(2)}` : '—'}
                      </span>
                      <span className="text-[9px] text-slate-600">{isExpanded ? '▲' : '▼'}</span>
                    </button>

                    {/* Развёрнутая информация */}
                    {isExpanded && (
                      <div className="py-2 px-2 ml-6 mb-1 rounded-lg text-[10px]" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-500">Процент с покупок:</span>
                          <span className="text-emerald-400 font-bold">{pct}%</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-500">Мин. уровень GW:</span>
                          <span className={isUnlocked ? 'text-emerald-400' : 'text-red-400'}>{reqLevel} {isUnlocked ? '✅' : '🔒'}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-500">Заработано:</span>
                          <span className="text-gold-400 font-bold">${earned.toFixed(4)}</span>
                        </div>
                        {!isUnlocked && (
                          <div className="mt-1 p-1.5 rounded-lg text-[9px] text-orange-400" style={{ background: 'rgba(249,115,22,0.06)' }}>
                            🔒 Для получения с линии {i + 1} нужен уровень {reqLevel} в GlobalWay
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="mt-3 p-2 rounded-xl text-[10px] text-slate-500 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
              Суммарно до {percents.reduce((s, p) => s + p, 0).toFixed(1)}% с каждой покупки по всем 9 линиям
            </div>
          </div>
        </div>
      )}

      {/* ═══ МАТРИЦА — 12 уровней ═══ */}
      {section === 'matrix' && (
        <div className="px-3 mt-2 space-y-2">
          {/* Общая статистика */}
          {matrixStats && (
            <div className="p-3 rounded-2xl glass">
              <div className="text-[12px] font-bold text-blue-400 mb-2">📊 Матричные платежи</div>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-white/5 text-center">
                  <div className="text-[13px] font-black text-emerald-400">${parseFloat(matrixStats.totalEarned).toFixed(2)}</div>
                  <div className="text-[9px] text-slate-500">Заработано</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 text-center">
                  <div className="text-[13px] font-black text-purple-400">${parseFloat(matrixStats.autoUpgraded).toFixed(2)}</div>
                  <div className="text-[9px] text-slate-500">Автоапгрейд</div>
                </div>
                <div className="p-2 rounded-xl bg-white/5 text-center">
                  <div className="text-[13px] font-black text-blue-400">${parseFloat(matrixStats.frozen).toFixed(2)}</div>
                  <div className="text-[9px] text-slate-500">Заморожено</div>
                </div>
              </div>
            </div>
          )}

          {/* 12 уровней матрицы */}
          <div className="p-3 rounded-2xl glass">
            <div className="text-[12px] font-bold text-gold-400 mb-2">🏔 Заработок по 12 уровням</div>

            {loadingData && !matrixByLevel && (
              <div className="text-center py-4 text-slate-500 text-[11px] animate-pulse">⏳ Загрузка...</div>
            )}

            {matrixByLevel && (
              <div className="space-y-1">
                {matrixByLevel.map((earned, i) => {
                  const val = parseFloat(earned)
                  const isActive = gwStatus?.activeLevels?.[i] === true
                  const lvData = LEVELS[i + 1]
                  return (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/5">
                      <span className="text-[10px] font-bold w-5" style={{ color: isActive ? '#ffd700' : '#4a5568' }}>{i + 1}</span>
                      <span className="text-sm">{lvData?.emoji || '📦'}</span>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold" style={{ color: isActive ? '#fff' : '#4a5568' }}>
                          {lvData?.name || `Уровень ${i + 1}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[11px] font-bold" style={{ color: val > 0 ? '#10b981' : '#4a5568' }}>
                          {val > 0 ? `$${val.toFixed(2)}` : '—'}
                        </div>
                      </div>
                      <span className="text-[9px]">{isActive ? '✅' : '🔒'}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {!wallet && (
              <div className="text-center py-4 text-slate-500 text-[11px]">🔐 Подключите кошелёк</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
