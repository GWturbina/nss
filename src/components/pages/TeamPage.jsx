'use client'
import { useState, useEffect, useRef } from 'react'
import useGameStore from '@/lib/store'
import { shortAddress } from '@/lib/web3'
import { LEVELS } from '@/lib/gameData'
import * as C from '@/lib/contracts'
import * as Team from '@/lib/teamContracts'

const AVATARS = ['👨‍💼','👩‍💻','🧔','👩‍🔬','👨‍🚀','👩‍🎨','🧑‍🔧','👩‍🏫','👨‍🌾','👩‍⚕️','🦸‍♂️','🦸‍♀️','🧙‍♂️','🧙‍♀️','🥷','🤴','👸']

const BUSINESSES = [
  { id:0, name:'Малый Бизнес', price:50, emoji:'💼', color:'#3498DB', totalIncome:204, totalWithPartner:504,
    steps:['Покупаете долю за $50 — деньги начинают работать в малом бизнесе','Бизнес генерирует доход — первые $50 возвращаются вам на руки + 10% с каждой доли Лично приглашённого партнёра','$50 остаются в работе — реинвестируются, продолжают приносить доход + 10% от каждого реинвеста партнёра','Следующая выплата $100 — сразу на руки','Система накапливает долю для входа в Средний Бизнес ($250)','Последняя выплата от работы доли $54 — сразу на руки','Цикл повторяется БЕСКОНЕЧНО — доход на руки + рост к следующему уровню'],
    footer:'Хотите больше? Купите 2-ю, 3-ю долю — каждая работает отдельно и приносит свой доход!' },
  { id:1, name:'Средний Бизнес', price:250, emoji:'🏭', color:'#F39C12', totalIncome:1220, totalWithPartner:2520,
    steps:['Покупаете долю за $250 — деньги начинают работать в среднем бизнесе','Бизнес генерирует доход — первые $250 возвращаются вам на руки + 10% с каждой доли Лично Приглашённого партнёра','$250 остаются в работе — реинвестируются, продолжают приносить доход','Следующая выплата $500 — сразу на руки','Система накапливает долю для входа в Большой Бизнес ($1000)','Последняя выплата от работы доли $470 — сразу на руки','Реинвестиция $50 на первый стол (Малый Бизнес)','Цикл повторяется БЕСКОНЕЧНО — доход на руки + рост к следующему уровню'],
    footer:'Два бизнеса работают одновременно — и подпитывают друг друга. Циклы бесконечны!' },
  { id:2, name:'Большой Бизнес', price:1000, emoji:'🏙', color:'#e74c3c', totalIncome:11200, totalWithPartner:12800,
    steps:['Покупаете долю за $1000 — деньги начинают работать в Большом Бизнесе','Бизнес генерирует доход — первые $1000 возвращаются вам на руки + 10% с каждой доли Лично Приглашённого партнёра','$1000 обязательный реинвест — продолжают приносить доход (второй и последующие на выбор)','Следующая выплата $1000 — сразу на руки','Система накапливает долю для входа в Средний Бизнес ($250)','Очередная выплата от работы доли $1000 — сразу на руки','Реинвестиция $50 в (Малый Бизнес) после каждых $1000 на руки','Цикл повторяется БЕСКОНЕЧНО — доход на руки + рост к следующему уровню'],
    footer:'$50 → $250 → $1000 — три бизнеса, три источника дохода, один вход!' },
]

export default function TeamTab() {
  const { wallet, sponsorId, level, taps, localNst, nst, tables, t } = useGameStore()
  const [section, setSection] = useState('profile')
  const [copied, setCopied] = useState(false)
  const [nickname, setNickname] = useState('')
  const [avatar, setAvatar] = useState('👨‍💼')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [editingNick, setEditingNick] = useState(false)
  const [tempNick, setTempNick] = useState('')
  const fileInputRef = useRef(null)

  // Контракт-данные
  const [percents, setPercents] = useState([])
  const [requiredLevels, setRequiredLevels] = useState([])
  const [marketingStats, setMarketingStats] = useState(null)
  const [gwFullStats, setGwFullStats] = useState(null)
  const [gwBalances, setGwBalances] = useState(null)
  const [partners, setPartners] = useState(null)
  const [partnersTotal, setPartnersTotal] = useState(0)
  const [loadingPartners, setLoadingPartners] = useState(false)
  const [expandedLine, setExpandedLine] = useState(null)
  const [expandedBiz, setExpandedBiz] = useState(null)
  const [expandedPartner, setExpandedPartner] = useState(null)

  useEffect(() => { if (typeof window !== 'undefined') { setNickname(localStorage.getItem('nss_nickname')||''); setAvatar(localStorage.getItem('nss_avatar')||'👨‍💼') } }, [])
  useEffect(() => { Team.getMarketingPercents().then(setPercents).catch(()=>{}); Team.getRequiredLevels().then(setRequiredLevels).catch(()=>{}) }, [])

  useEffect(() => {
    if (!wallet) return
    Team.getUserMarketingStats(wallet).then(setMarketingStats).catch(()=>{})
    Team.getUserFullStats(wallet).then(setGwFullStats).catch(()=>{})
    Team.getUserGWBalances(wallet).then(setGwBalances).catch(()=>{})
    loadPartners()
  }, [wallet])

  const loadPartners = async () => {
    if (!wallet) return
    setLoadingPartners(true)
    const data = await Team.getDirectPartners(wallet, 0, 50)
    setPartners(data.referrals)
    setPartnersTotal(data.total)
    setLoadingPartners(false)
  }

  const lv = LEVELS[level]||LEVELS[0]
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
  const copyLink = () => { if(navigator.clipboard) navigator.clipboard.writeText(referralLink); else{const ta=document.createElement('textarea');ta.value=referralLink;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta)} setCopied(true);setTimeout(()=>setCopied(false),2000) }
  const handlePhotoUpload = (e) => { const file=e.target.files?.[0]; if(!file||!file.type.startsWith('image/'))return; const reader=new FileReader(); reader.onload=(ev)=>{const img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');const size=200;canvas.width=size;canvas.height=size;const ctx=canvas.getContext('2d');const min=Math.min(img.width,img.height);ctx.beginPath();ctx.arc(size/2,size/2,size/2,0,Math.PI*2);ctx.clip();ctx.drawImage(img,(img.width-min)/2,(img.height-min)/2,min,min,0,0,size,size);const b64=canvas.toDataURL('image/jpeg',0.85);setAvatar(b64);localStorage.setItem('nss_avatar',b64);setShowAvatarPicker(false)};img.src=ev.target.result};reader.readAsDataURL(file);e.target.value='' }
  const saveNickname = () => { if(tempNick.trim()){setNickname(tempNick.trim());localStorage.setItem('nss_nickname',tempNick.trim())} setEditingNick(false) }
  const selectAvatar = (av) => { setAvatar(av);localStorage.setItem('nss_avatar',av);setShowAvatarPicker(false) }

  const rankNum = gwFullStats?.matrixRank || 0
  const rankName = Team.RANK_NAMES[rankNum] || 'Без ранга'
  const rankColor = Team.RANK_COLORS[rankNum] || '#94a3b8'
  const rankEmoji = Team.RANK_EMOJIS[rankNum] || '⚪'
  const totalMarketing = parseFloat(marketingStats?.totalEarned||0)
  const bizEarned = tables.map(tb => parseFloat(tb.earned||0))

  const sections = [
    { id:'profile', icon:'👤', label:'Профиль' },
    { id:'business', icon:'💼', label:'Бизнес' },
    { id:'contest', icon:'⚔️', label:'Турниры' },
  ]
  const now=new Date();const endOfWeek=new Date(now);endOfWeek.setDate(endOfWeek.getDate()+(7-endOfWeek.getDay()));endOfWeek.setHours(23,59,59)
  const daysLeft=Math.ceil((endOfWeek-now)/(1000*60*60*24))

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      <div className="px-3 pt-3 pb-1"><h2 className="text-lg font-black text-gold-400">👥 Команда</h2></div>
      <div className="flex gap-1 px-3 mt-1">
        {sections.map(s => (<button key={s.id} onClick={()=>setSection(s.id)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold border ${section===s.id?'bg-gold-400/15 border-gold-400/30 text-gold-400':'border-white/8 text-slate-500'}`}>{s.icon} {s.label}</button>))}
      </div>

      {/* ═══ ПРОФИЛЬ ═══ */}
      {section === 'profile' && (
        <div className="px-3 mt-2 space-y-2">
          {/* Аватар + ник */}
          <div className="p-4 rounded-2xl glass text-center">
            <div className="relative inline-block mb-2">
              <div onClick={()=>setShowAvatarPicker(!showAvatarPicker)} className="w-20 h-20 rounded-full flex items-center justify-center cursor-pointer overflow-hidden" style={{border:`3px solid ${lv.color}60`,background:`${lv.color}15`}}>
                {isCustomPhoto?<img src={avatar} alt="" className="w-full h-full object-cover"/>:<span className="text-4xl">{avatar}</span>}
              </div>
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-sm border-2" style={{background:`${lv.color}30`,borderColor:lv.color,color:lv.color}}>{level}</div>
              <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] bg-white/10 border border-white/20 cursor-pointer" onClick={(e)=>{e.stopPropagation();fileInputRef.current?.click()}}>📷</div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
            {showAvatarPicker&&(<div className="p-3 rounded-xl bg-white/5 mb-3"><button onClick={()=>fileInputRef.current?.click()} className="w-full py-2 rounded-xl text-[11px] font-bold mb-2 bg-blue-500/15 text-blue-400 border border-blue-500/25">📷 Загрузить фото</button><div className="grid grid-cols-6 gap-2 mt-2">{AVATARS.map((av,i)=>(<button key={i} onClick={()=>selectAvatar(av)} className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${avatar===av?'bg-gold-400/20 border border-gold-400/40':'hover:bg-white/10'}`}>{av}</button>))}</div></div>)}
            {editingNick?(<div className="flex gap-2 justify-center mb-2"><input value={tempNick} onChange={e=>setTempNick(e.target.value)} placeholder="Введите ник" maxLength={20} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 text-sm text-white text-center outline-none w-40"/><button onClick={saveNickname} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-bold">✓</button></div>):(<div onClick={()=>{setTempNick(nickname);setEditingNick(true)}} className="cursor-pointer mb-1"><div className="text-lg font-black text-white">{nickname||'Задать ник'}</div><div className="text-[9px] text-slate-500">нажми чтобы изменить</div></div>)}
            <div className="text-[10px] text-slate-500">{wallet?shortAddress(wallet):'Не подключён'}{sponsorId?` • ID: ${sponsorId}`:''}</div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full" style={{background:`${rankColor}15`,border:`1px solid ${rankColor}30`}}><span>{rankEmoji}</span><span className="text-[11px] font-bold" style={{color:rankColor}}>{rankName}</span></div>
          </div>

          {/* Ссылка */}
          <div className="p-3 rounded-2xl glass">
            <div className="text-[12px] font-bold text-gold-400 mb-2">🔗 Реферальная ссылка</div>
            {!wallet?(<div className="text-center py-3"><div className="text-2xl mb-1">🔐</div><div className="text-[11px] text-slate-400">Подключите кошелёк</div></div>):!referralLink?(<div className="text-center py-3"><div className="text-2xl mb-1">⛏</div><div className="text-[11px] text-slate-400">Купи первый уровень — получишь ID</div></div>):(<><div className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] text-slate-300 break-all">{referralLink}</div><button onClick={copyLink} className={`w-full mt-2 py-2 rounded-xl text-[11px] font-bold ${copied?'bg-emerald-500/15 text-emerald-400':'gold-btn'}`}>{copied?'✅ Скопировано':'📋 Копировать'}</button><div className="flex gap-1.5 mt-1.5"><a href={shareLinks.tg} target="_blank" rel="noopener" className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center bg-blue-500/10 text-blue-400 border border-blue-500/20">📱 TG</a><a href={shareLinks.wa} target="_blank" rel="noopener" className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">💬 WA</a><a href={shareLinks.vb} target="_blank" rel="noopener" className="flex-1 py-2 rounded-xl text-[10px] font-bold text-center bg-purple-500/10 text-purple-400 border border-purple-500/20">📞 VB</a></div></>)}
          </div>

          {/* ═══ МОИ ПАРТНЁРЫ (из GlobalWay) ═══ */}
          <div className="p-3 rounded-2xl glass">
            <div className="flex justify-between items-center mb-2">
              <div className="text-[12px] font-bold text-blue-400">👥 Мои партнёры ({partnersTotal})</div>
              <button onClick={loadPartners} disabled={loadingPartners} className="text-[9px] text-slate-500 hover:text-white">{loadingPartners?'⏳':'🔄'}</button>
            </div>

            {loadingPartners && !partners && (<div className="text-center py-4 text-[11px] text-slate-500 animate-pulse">⏳ Загрузка из GlobalWay...</div>)}

            {partners && partners.length === 0 && (<div className="text-center py-4"><div className="text-2xl mb-1">👥</div><div className="text-[11px] text-slate-500">Пока нет партнёров. Отправьте реферальную ссылку!</div></div>)}

            {partners && partners.length > 0 && (
              <div className="space-y-1">
                {partners.map((p, i) => {
                  const isExp = expandedPartner === i
                  const pRank = Team.RANK_EMOJIS[p.matrixRank] || '⚪'
                  const pLv = LEVELS[p.maxLevel] || LEVELS[0]
                  return (
                    <div key={i}>
                      <button onClick={()=>setExpandedPartner(isExp?null:i)} className="w-full flex items-center gap-2 py-2 border-b border-white/5 text-left">
                        <span className="text-[10px] font-bold text-gold-400 w-5">{i+1}</span>
                        <span className="text-sm">{pLv.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-white truncate">{shortAddress(p.address)}</div>
                          <div className="text-[8px] text-slate-500">ID: {p.userId||'—'} • Lv.{p.maxLevel} {pRank}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-bold" style={{color:p.quarterlyActive?'#10b981':'#94a3b8'}}>{p.quarterlyActive?'✅':'⏸'}</div>
                        </div>
                      </button>
                      {isExp && (
                        <div className="py-2 px-2 ml-5 mb-1 rounded-lg text-[10px]" style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}>
                          <div className="grid grid-cols-2 gap-1">
                            <div className="flex justify-between"><span className="text-slate-500">ID:</span><span className="text-white font-bold">{p.userId||'—'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Спонсор:</span><span className="text-white">{p.sponsorId||'—'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Уровень GW:</span><span className="text-gold-400 font-bold">{p.maxLevel}/12</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Ранг:</span><span style={{color:Team.RANK_COLORS[p.matrixRank]||'#94a3b8'}}>{Team.RANK_NAMES[p.matrixRank]||'—'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Партнёры:</span><span className="text-white">{p.personalInvites}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Quarterly:</span><span className={p.quarterlyActive?'text-emerald-400':'text-red-400'}>{p.quarterlyActive?'Активен':'Нет'}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Партнёрка:</span><span className="text-emerald-400">${parseFloat(p.partnerEarnings).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">Матричные:</span><span className="text-blue-400">${parseFloat(p.matrixEarnings).toFixed(2)}</span></div>
                          </div>
                          <div className="mt-1 text-[8px] text-slate-600 font-mono break-all">{p.address}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* 9 линий партнёрки */}
          <div className="p-3 rounded-2xl glass">
            <div className="flex justify-between items-center mb-2"><div className="text-[12px] font-bold text-emerald-400">📊 9 линий партнёрки</div>{marketingStats&&<div className="text-[11px] font-black text-emerald-400">${totalMarketing.toFixed(2)}</div>}</div>
            <div className="space-y-1">
              {(percents.length>0?percents:[10,7,5,3,2,1,1,0.5,0.5]).map((pct,i)=>{const earned=marketingStats?.earnedByLine?.[i]?parseFloat(marketingStats.earnedByLine[i]):0;const reqLevel=requiredLevels[i]||(i+1);const isUnlocked=level>=reqLevel;const isExp=expandedLine===i;return(<div key={i}><button onClick={()=>setExpandedLine(isExp?null:i)} className="w-full flex items-center gap-2 py-1.5 border-b border-white/5 text-left"><span className="text-[11px] font-black w-5" style={{color:isUnlocked?'#ffd700':'#4a5568'}}>{i+1}</span><div className="flex-1 h-1.5 rounded-full bg-white/5"><div className="h-full rounded-full" style={{width:`${Math.max(pct*10,3)}%`,background:isUnlocked?'linear-gradient(90deg,#10b981,#059669)':'#374151'}}/></div><span className="text-[10px] font-bold w-10 text-right" style={{color:isUnlocked?'#10b981':'#4a5568'}}>{pct}%</span><span className="text-[10px] font-bold w-14 text-right" style={{color:earned>0?'#ffd700':'#4a5568'}}>{earned>0?`$${earned.toFixed(2)}`:'—'}</span></button>{isExp&&(<div className="py-2 px-2 ml-5 mb-1 rounded-lg text-[10px]" style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)'}}><div className="flex justify-between mb-1"><span className="text-slate-500">Процент:</span><span className="text-emerald-400 font-bold">{pct}%</span></div><div className="flex justify-between mb-1"><span className="text-slate-500">Мин. уровень GW:</span><span className={isUnlocked?'text-emerald-400':'text-red-400'}>{reqLevel} {isUnlocked?'✅':'🔒'}</span></div><div className="flex justify-between"><span className="text-slate-500">Заработано:</span><span className="text-gold-400 font-bold">${earned.toFixed(4)}</span></div>{!isUnlocked&&<div className="mt-1 p-1.5 rounded-lg text-[9px] text-orange-400 bg-orange-500/5">🔒 Нужен уровень {reqLevel} в GlobalWay</div>}</div>)}</div>)})}
            </div>
          </div>

          {/* GW баланс */}
          {gwBalances && (
            <div className="p-3 rounded-2xl glass">
              <div className="text-[11px] font-bold text-gold-400 mb-2">💰 Баланс GlobalWay</div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="p-2 rounded-lg bg-white/5 text-center"><div className="font-black text-emerald-400">${parseFloat(gwBalances.partnerFromSponsor).toFixed(2)}</div><div className="text-[8px] text-slate-500">От спонсора</div></div>
                <div className="p-2 rounded-lg bg-white/5 text-center"><div className="font-black text-emerald-400">${parseFloat(gwBalances.partnerFromUpline).toFixed(2)}</div><div className="text-[8px] text-slate-500">От аплайн</div></div>
                <div className="p-2 rounded-lg bg-white/5 text-center"><div className="font-black text-blue-400">${parseFloat(gwBalances.matrixEarnings).toFixed(2)}</div><div className="text-[8px] text-slate-500">Матричные</div></div>
                <div className="p-2 rounded-lg bg-white/5 text-center"><div className="font-black text-purple-400">${parseFloat(gwBalances.pensionBalance).toFixed(2)}</div><div className="text-[8px] text-slate-500">Пенсия</div></div>
              </div>
              <div className="mt-2 p-2 rounded-lg text-center" style={{background:'rgba(255,215,0,0.06)'}}><span className="text-[12px] font-black text-gold-400">${parseFloat(gwBalances.totalBalance).toFixed(2)}</span><span className="text-[9px] text-slate-500 ml-2">Итого</span></div>
            </div>
          )}
        </div>
      )}

      {/* ═══ БИЗНЕС ═══ */}
      {section === 'business' && (
        <div className="px-3 mt-2 space-y-3">
          <div className="text-center text-[11px] text-slate-400 mb-1">Общая очередь • Одни усилия — множество реинвестов и доход</div>
          {BUSINESSES.map((biz,idx)=>{const isOpen=expandedBiz===idx;const earned=bizEarned[idx]||0;const slots=tables[idx]?.slots||0;const reinvests=tables[idx]?.reinvests||0;return(<div key={biz.id} className="rounded-2xl overflow-hidden" style={{border:`1px solid ${biz.color}30`}}><button onClick={()=>setExpandedBiz(isOpen?null:idx)} className="w-full p-4 text-left flex items-center gap-3" style={{background:`${biz.color}10`}}><span className="text-3xl">{biz.emoji}</span><div className="flex-1"><div className="text-[14px] font-black text-white">{biz.name}</div><div className="text-[12px] font-bold" style={{color:biz.color}}>${biz.price} за долю</div></div><div className="text-right">{earned>0&&<div className="text-[13px] font-black text-emerald-400">${earned.toFixed(2)}</div>}{slots>0&&<div className="text-[9px] text-slate-500">{slots} долей • {reinvests} реинв.</div>}</div><span className="text-slate-500 text-[11px]">{isOpen?'▲':'▼'}</span></button>{isOpen&&(<div className="px-4 pb-4"><div className="grid grid-cols-3 gap-2 my-3"><div className="p-2 rounded-xl text-center" style={{background:`${biz.color}20`}}><div className="text-[16px] font-black" style={{color:biz.color}}>${biz.price}</div><div className="text-[8px] text-slate-400">за одну долю<br/>можно несколько!</div></div><div className="p-2 rounded-xl text-center" style={{background:`${biz.color}15`}}><div className="text-[14px] font-black" style={{color:biz.color}}>${biz.totalIncome.toLocaleString()}</div><div className="text-[8px] text-slate-400">+10% с реинвеста<br/>Л.П. = чистый доход</div></div><div className="p-2 rounded-xl text-center" style={{background:`${biz.color}10`}}><div className="text-[14px] font-black" style={{color:biz.color}}>${biz.totalWithPartner.toLocaleString()}</div><div className="text-[8px] text-slate-400">+10% с реинвеста<br/>Л.П. = общий доход</div></div></div><div className="space-y-0">{biz.steps.map((step,si)=>(<div key={si} className="flex gap-2 py-2" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}><div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black flex-shrink-0" style={{background:si%2===0?`${biz.color}20`:'rgba(255,255,255,0.03)',color:si%2===0?biz.color:'#94a3b8'}}>{si+1}</div><div className="text-[11px] text-slate-300 leading-relaxed">{step}</div></div>))}</div><div className="mt-3 p-2.5 rounded-xl text-center text-[10px] font-bold" style={{background:'rgba(255,215,0,0.06)',color:'#ffd700',border:'1px solid rgba(255,215,0,0.15)'}}>{biz.footer}</div>{slots>0&&(<div className="mt-2 p-2 rounded-xl bg-white/3 flex justify-between text-[10px]"><span className="text-slate-500">Долей: <b className="text-white">{slots}</b></span><span className="text-slate-500">Реинвестов: <b className="text-white">{reinvests}</b></span><span className="text-emerald-400 font-bold">${earned.toFixed(2)}</span></div>)}</div>)}</div>)})}
        </div>
      )}

      {/* ═══ ТУРНИРЫ ═══ */}
      {section === 'contest' && (
        <div className="px-3 mt-2 space-y-2">
          <div className="p-3 rounded-2xl glass border-purple-500/15"><div className="flex items-center justify-between mb-2"><div className="text-[12px] font-bold text-purple-400">⚔️ Еженедельный турнир</div><div className="text-[10px] text-slate-500">{daysLeft} дн.</div></div><div className="text-[11px] text-slate-300 mb-3">Набери больше всех CHT за неделю — получи приз!</div><div className="space-y-1.5">{[{place:'🥇',prize:'500 CHT + 50 CGT'},{place:'🥈',prize:'300 CHT + 30 CGT'},{place:'🥉',prize:'150 CHT + 15 CGT'}].map((p,i)=>(<div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/5"><span className="text-lg">{p.place}</span><div className="flex-1 text-[11px] text-white font-bold">Место {i+1}</div><div className="text-[10px] font-bold text-purple-400">{p.prize}</div></div>))}</div></div>
          <div className="p-3 rounded-2xl glass border-emerald-500/15"><div className="text-[12px] font-bold text-emerald-400 mb-2">🏆 Ежемесячный турнир</div><div className="text-[11px] text-slate-300 mb-3">Три номинации — три победителя!</div><div className="space-y-1.5">{[{place:'🥇',prize:'2000 CHT + 200 CGT',c:'Больше всех рефералов'},{place:'🥈',prize:'1000 CHT + 100 CGT',c:'Больше всех тапов'},{place:'🥉',prize:'500 CHT + 50 CGT',c:'Больше всех м² куплено'}].map((p,i)=>(<div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-white/5"><span className="text-lg">{p.place}</span><div className="flex-1 text-[11px] font-bold text-white">{p.c}</div><div className="text-[10px] font-bold text-emerald-400">{p.prize}</div></div>))}</div></div>
          <div className="p-3 rounded-2xl glass"><div className="text-[12px] font-bold text-gold-400 mb-2">📋 Правила</div><div className="space-y-1.5 text-[11px] text-slate-300"><p>1. Участвуют только зарегистрированные</p><p>2. Результаты раз в сутки</p><p>3. Призы автоматически</p><p>4. Накрутка = дисквалификация</p></div></div>
        </div>
      )}
    </div>
  )
}
