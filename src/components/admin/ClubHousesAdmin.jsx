'use client'
import { useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import * as CH from '@/lib/clubHouses'
import { shortAddress } from '@/lib/web3'

export default function ClubHousesAdmin() {
  const { addNotification, t } = useGameStore()
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState(null) // house with purchases
  const [detailLoading, setDetailLoading] = useState(false)
  const [showGift, setShowGift] = useState(false)
  const [giftWallet, setGiftWallet] = useState('')
  const [giftSqm, setGiftSqm] = useState('')
  const [giftAmount, setGiftAmount] = useState('')
  const [gifting, setGifting] = useState(false)

  // Форма создания
  const [form, setForm] = useState({
    name: '', city: '', country: '', total_price: '', total_sqm: '', description: '',
  })
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const loadHouses = useCallback(async () => {
    setLoading(true)
    const data = await CH.getClubHouses()
    setHouses(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadHouses() }, [loadHouses])

  const handleCreate = async () => {
    if (!form.name || !form.total_price || !form.total_sqm) {
      addNotification('❌ Заполните обязательные поля: Название, Стоимость, Площадь')
      return
    }
    const result = await CH.createClubHouse({
      ...form,
      image_url: imageUrl,
    })
    if (result.ok) {
      addNotification(`✅ Клубный дом "${form.name}" создан!`)
      setForm({ name: '', city: '', country: '', total_price: '', total_sqm: '', description: '' })
      setImageUrl('')
      setShowCreate(false)
      loadHouses()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const result = await CH.uploadHouseImage(file)
    setUploading(false)
    if (result.ok) {
      setImageUrl(result.url)
      addNotification('✅ Фото загружено')
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    const result = await CH.updateClubHouse(id, { status: newStatus })
    if (result.ok) {
      addNotification(`✅ Статус обновлён: ${newStatus}`)
      loadHouses()
      if (selectedHouse?.id === id) loadHouseDetail(id)
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить клубный дом? Все покупки будут удалены.')) return
    const result = await CH.deleteClubHouse(id)
    if (result.ok) {
      addNotification('✅ Клубный дом удалён')
      setSelectedHouse(null)
      loadHouses()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const loadHouseDetail = async (id) => {
    setDetailLoading(true)
    const detail = await CH.getClubHouseWithPurchases(id)
    setSelectedHouse(detail)
    setDetailLoading(false)
  }

  const handleGift = async () => {
    if (!giftWallet || !giftSqm || !selectedHouse) return
    if (!/^0x[a-fA-F0-9]{40}$/.test(giftWallet)) {
      addNotification('❌ Некорректный адрес кошелька')
      return
    }
    setGifting(true)
    const result = await CH.recordPurchase({
      house_id: selectedHouse.id,
      wallet: giftWallet.toLowerCase(),
      sqm_purchased: parseFloat(giftSqm),
      tx_hash: 'gift-' + Date.now(),
      slot_table: 0,
    })
    if (result.ok) {
      addNotification(`✅ Подарено ${giftSqm} м² → ${giftWallet.slice(0, 8)}...`)
      setGiftWallet('')
      setGiftSqm('')
      setGiftAmount('')
      setShowGift(false)
      loadHouseDetail(selectedHouse.id)
      loadHouses()
    } else {
      addNotification(`❌ ${result.error}`)
    }
    setGifting(false)
  }

  const STATUS_LABELS = {
    planning: { emoji: '📋', label: 'Планируется', color: 'text-slate-400' },
    building: { emoji: '🏗', label: 'Строится', color: 'text-blue-400' },
    completed: { emoji: '✅', label: 'Построен', color: 'text-emerald-400' },
  }

  return (
    <div className="px-3 mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-bold text-gold-400">🏘 {t('clubHouses')}</div>
        <button onClick={() => setShowCreate(!showCreate)}
          className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${showCreate ? 'bg-red-500/15 border-red-500/25 text-red-400' : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'}`}>
          {showCreate ? '✕ Отмена' : '+ Создать'}
        </button>
      </div>

      {/* ═══ Форма создания ═══ */}
      {showCreate && (
        <div className="p-3 rounded-2xl glass border-emerald-500/15 space-y-2">
          <div className="text-[11px] font-bold text-emerald-400">📝 Новый клубный дом</div>

          {[
            ['name', 'Название *', 'Клубный дом "Солнечный"', 'text'],
            ['city', 'Город', 'Bali, Ubud', 'text'],
            ['country', 'Страна', 'Indonesia', 'text'],
            ['total_price', 'Общая стоимость ($) *', '150000', 'number'],
            ['total_sqm', 'Общая площадь (м²) *', '200', 'number'],
          ].map(([field, label, placeholder, type]) => (
            <div key={field}>
              <label className="text-[9px] text-slate-500 block mb-0.5">{label}</label>
              <input type={type} value={form[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none focus:border-emerald-400/30" />
            </div>
          ))}

          <div>
            <label className="text-[9px] text-slate-500 block mb-0.5">Описание</label>
            <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Описание проекта..."
              rows={2}
              className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none focus:border-emerald-400/30 resize-none" />
          </div>

          <div>
            <label className="text-[9px] text-slate-500 block mb-0.5">Фото (Supabase Storage)</label>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" onChange={handleUploadPhoto}
                className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-[10px] file:font-bold" />
              {uploading && <span className="text-[10px] text-gold-400 animate-pulse">⏳</span>}
            </div>
            {imageUrl && (
              <div className="mt-1 flex items-center gap-2">
                <img src={imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <span className="text-[9px] text-emerald-400">✅ Загружено</span>
              </div>
            )}
          </div>

          <button onClick={handleCreate}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            🏘 Создать клубный дом
          </button>
        </div>
      )}

      {/* ═══ Список клубных домов ═══ */}
      {loading ? (
        <div className="text-center text-[11px] text-slate-500 py-4">Загрузка...</div>
      ) : houses.length === 0 ? (
        <div className="p-4 rounded-2xl glass text-center">
          <div className="text-2xl mb-1">🏗</div>
          <div className="text-[11px] text-slate-500">Нет клубных домов. Создайте первый!</div>
        </div>
      ) : (
        <div className="space-y-2">
          {houses.map(h => {
            const st = STATUS_LABELS[h.status] || STATUS_LABELS.planning
            return (
              <div key={h.id} className="p-3 rounded-2xl glass cursor-pointer hover:border-gold-400/20 transition-all"
                onClick={() => loadHouseDetail(h.id)}>
                <div className="flex items-center gap-3">
                  {h.image_url ? (
                    <img src={h.image_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">🏘</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-black text-white truncate">{h.name}</div>
                    <div className="text-[10px] text-slate-500">{h.city}{h.country ? `, ${h.country}` : ''}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gold-400 font-bold">${parseFloat(h.total_price).toLocaleString()}</span>
                      <span className="text-[9px] text-slate-500">{parseFloat(h.total_sqm)} м²</span>
                      <span className={`text-[9px] font-bold ${st.color}`}>{st.emoji} {st.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ Детали клубного дома ═══ */}
      {selectedHouse && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={() => setSelectedHouse(null)}>
          <div className="w-full max-w-[430px] max-h-[80vh] overflow-y-auto rounded-t-3xl glass p-4"
            onClick={e => e.stopPropagation()}>
            
            {detailLoading ? (
              <div className="text-center py-8 text-slate-500">⏳ Загрузка...</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-black text-gold-400">{selectedHouse.name}</h3>
                  <button onClick={() => setSelectedHouse(null)} className="text-slate-500 text-lg">✕</button>
                </div>

                {selectedHouse.image_url && (
                  <img src={selectedHouse.image_url} alt="" className="w-full h-32 rounded-xl object-cover mb-3" />
                )}

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-[10px] text-slate-500">Стоимость</div>
                    <div className="text-sm font-bold text-gold-400">${parseFloat(selectedHouse.total_price).toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-[10px] text-slate-500">Площадь</div>
                    <div className="text-sm font-bold text-white">{parseFloat(selectedHouse.total_sqm)} м²</div>
                  </div>
                </div>

                {/* Прогресс покупки м² */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-500">м² куплено</span>
                    <span className="text-emerald-400">
                      {(selectedHouse.purchased_sqm || 0).toFixed(2)} / {parseFloat(selectedHouse.total_sqm)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                      style={{ width: `${Math.min(((selectedHouse.purchased_sqm || 0) / parseFloat(selectedHouse.total_sqm || 1)) * 100, 100)}%` }} />
                  </div>
                </div>

                {selectedHouse.description && (
                  <div className="p-2 rounded-lg bg-white/5 mb-3 text-[10px] text-slate-400">
                    {selectedHouse.description}
                  </div>
                )}

                {/* Статус-контроль */}
                <div className="flex gap-1 mb-3">
                  {Object.entries(STATUS_LABELS).map(([key, val]) => (
                    <button key={key} onClick={() => handleStatusChange(selectedHouse.id, key)}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold border ${selectedHouse.status === key ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/10 text-slate-500'}`}>
                      {val.emoji} {val.label}
                    </button>
                  ))}
                </div>

                {/* Список покупателей */}
                <div className="mb-3">
                  <div className="text-[11px] font-bold text-blue-400 mb-1">
                    👥 Покупатели ({selectedHouse.purchases?.length || 0})
                  </div>
                  {(!selectedHouse.purchases || selectedHouse.purchases.length === 0) ? (
                    <div className="text-[10px] text-slate-500 text-center py-2">Нет покупок</div>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedHouse.purchases.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
                          <div>
                            <span className="text-[10px] font-bold text-white">{shortAddress(p.wallet)}</span>
                            <span className="text-[9px] text-slate-500 ml-2">{parseFloat(p.sqm_purchased).toFixed(4)} м²</span>
                            {String(p.tx_hash || '').startsWith('gift') && <span className="text-[8px] text-purple-400 ml-1">🎁</span>}
                          </div>
                          <div className="text-[8px] text-slate-600">
                            {'$'}{(parseFloat(p.sqm_purchased) * 1000).toFixed(0)} • {new Date(p.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ═══ Подарить м² ═══ */}
                <div className="mb-3">
                  <button onClick={() => setShowGift(!showGift)}
                    className={`w-full py-2 rounded-xl text-[10px] font-bold border ${showGift ? 'bg-purple-500/15 border-purple-500/25 text-purple-400' : 'bg-gold-400/10 border-gold-400/20 text-gold-400'}`}>
                    {showGift ? '✕ Отмена' : '🎁 Подарить м²'}
                  </button>
                  {showGift && (
                    <div className="mt-2 p-3 rounded-xl space-y-2" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
                      <div>
                        <label className="text-[9px] text-slate-500 block mb-0.5">Кошелёк получателя *</label>
                        <input type="text" value={giftWallet} onChange={e => setGiftWallet(e.target.value)}
                          placeholder="0x..." className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Количество м² *</label>
                          <input type="number" value={giftSqm} onChange={e => setGiftSqm(e.target.value)}
                            placeholder="0.25" step="0.05" className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Сумма $ (необязательно)</label>
                          <input type="number" value={giftAmount} onChange={e => setGiftAmount(e.target.value)}
                            placeholder="250" className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                        </div>
                      </div>
                      {/* Быстрые кнопки */}
                      <div className="flex gap-1">
                        {[{ sqm: '0.05', amt: '50' }, { sqm: '0.25', amt: '250' }, { sqm: '1.0', amt: '1000' }].map(q => (
                          <button key={q.sqm} onClick={() => { setGiftSqm(q.sqm); setGiftAmount(q.amt) }}
                            className="flex-1 py-1 rounded-lg text-[9px] font-bold bg-white/5 text-slate-400 hover:text-white border border-white/5">
                            {q.sqm} м² (${q.amt})
                          </button>
                        ))}
                      </div>
                      <button onClick={handleGift} disabled={gifting || !giftWallet || !giftSqm}
                        className="w-full py-2 rounded-xl text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25"
                        style={{ opacity: (!giftWallet || !giftSqm || gifting) ? 0.5 : 1 }}>
                        {gifting ? '⏳ Подарок...' : `🎁 Подарить ${giftSqm || '?'} м²`}
                      </button>
                    </div>
                  )}
                </div>

                <button onClick={() => handleDelete(selectedHouse.id)}
                  className="w-full py-2 rounded-xl text-[10px] font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10">
                  🗑 Удалить клубный дом
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}'use client'
import { useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import * as CH from '@/lib/clubHouses'
import { shortAddress } from '@/lib/web3'

export default function ClubHousesAdmin() {
  const { addNotification, t } = useGameStore()
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selectedHouse, setSelectedHouse] = useState(null) // house with purchases
  const [detailLoading, setDetailLoading] = useState(false)
  const [showGift, setShowGift] = useState(false)
  const [giftWallet, setGiftWallet] = useState('')
  const [giftSqm, setGiftSqm] = useState('')
  const [giftAmount, setGiftAmount] = useState('')
  const [gifting, setGifting] = useState(false)

  // Форма создания
  const [form, setForm] = useState({
    name: '', city: '', country: '', total_price: '', total_sqm: '', description: '',
  })
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const loadHouses = useCallback(async () => {
    setLoading(true)
    const data = await CH.getClubHouses()
    setHouses(data)
    setLoading(false)
  }, [])

  useEffect(() => { loadHouses() }, [loadHouses])

  const handleCreate = async () => {
    if (!form.name || !form.total_price || !form.total_sqm) {
      addNotification('❌ Заполните обязательные поля: Название, Стоимость, Площадь')
      return
    }
    const result = await CH.createClubHouse({
      ...form,
      image_url: imageUrl,
    })
    if (result.ok) {
      addNotification(`✅ Клубный дом "${form.name}" создан!`)
      setForm({ name: '', city: '', country: '', total_price: '', total_sqm: '', description: '' })
      setImageUrl('')
      setShowCreate(false)
      loadHouses()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleUploadPhoto = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const result = await CH.uploadHouseImage(file)
    setUploading(false)
    if (result.ok) {
      setImageUrl(result.url)
      addNotification('✅ Фото загружено')
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    const result = await CH.updateClubHouse(id, { status: newStatus })
    if (result.ok) {
      addNotification(`✅ Статус обновлён: ${newStatus}`)
      loadHouses()
      if (selectedHouse?.id === id) loadHouseDetail(id)
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Удалить клубный дом? Все покупки будут удалены.')) return
    const result = await CH.deleteClubHouse(id)
    if (result.ok) {
      addNotification('✅ Клубный дом удалён')
      setSelectedHouse(null)
      loadHouses()
    } else {
      addNotification(`❌ ${result.error}`)
    }
  }

  const loadHouseDetail = async (id) => {
    setDetailLoading(true)
    const detail = await CH.getClubHouseWithPurchases(id)
    setSelectedHouse(detail)
    setDetailLoading(false)
  }

  const handleGift = async () => {
    if (!giftWallet || !giftSqm || !selectedHouse) return
    if (!/^0x[a-fA-F0-9]{40}$/.test(giftWallet)) {
      addNotification('❌ Некорректный адрес кошелька')
      return
    }
    setGifting(true)
    const result = await CH.recordPurchase({
      house_id: selectedHouse.id,
      wallet: giftWallet.toLowerCase(),
      sqm_purchased: parseFloat(giftSqm),
      amount_paid: parseFloat(giftAmount) || 0,
      tx_hash: 'gift-' + Date.now(),
      payment_type: 'gift',
    })
    if (result.ok) {
      addNotification(`✅ Подарено ${giftSqm} м² → ${giftWallet.slice(0, 8)}...`)
      setGiftWallet('')
      setGiftSqm('')
      setGiftAmount('')
      setShowGift(false)
      loadHouseDetail(selectedHouse.id)
      loadHouses()
    } else {
      addNotification(`❌ ${result.error}`)
    }
    setGifting(false)
  }

  const STATUS_LABELS = {
    planning: { emoji: '📋', label: 'Планируется', color: 'text-slate-400' },
    building: { emoji: '🏗', label: 'Строится', color: 'text-blue-400' },
    completed: { emoji: '✅', label: 'Построен', color: 'text-emerald-400' },
  }

  return (
    <div className="px-3 mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-[12px] font-bold text-gold-400">🏘 {t('clubHouses')}</div>
        <button onClick={() => setShowCreate(!showCreate)}
          className={`px-3 py-1 rounded-xl text-[10px] font-bold border ${showCreate ? 'bg-red-500/15 border-red-500/25 text-red-400' : 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'}`}>
          {showCreate ? '✕ Отмена' : '+ Создать'}
        </button>
      </div>

      {/* ═══ Форма создания ═══ */}
      {showCreate && (
        <div className="p-3 rounded-2xl glass border-emerald-500/15 space-y-2">
          <div className="text-[11px] font-bold text-emerald-400">📝 Новый клубный дом</div>

          {[
            ['name', 'Название *', 'Клубный дом "Солнечный"', 'text'],
            ['city', 'Город', 'Bali, Ubud', 'text'],
            ['country', 'Страна', 'Indonesia', 'text'],
            ['total_price', 'Общая стоимость ($) *', '150000', 'number'],
            ['total_sqm', 'Общая площадь (м²) *', '200', 'number'],
          ].map(([field, label, placeholder, type]) => (
            <div key={field}>
              <label className="text-[9px] text-slate-500 block mb-0.5">{label}</label>
              <input type={type} value={form[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                placeholder={placeholder}
                className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none focus:border-emerald-400/30" />
            </div>
          ))}

          <div>
            <label className="text-[9px] text-slate-500 block mb-0.5">Описание</label>
            <textarea value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Описание проекта..."
              rows={2}
              className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none focus:border-emerald-400/30 resize-none" />
          </div>

          <div>
            <label className="text-[9px] text-slate-500 block mb-0.5">Фото (Supabase Storage)</label>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" onChange={handleUploadPhoto}
                className="text-[10px] text-slate-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-white/10 file:text-white file:text-[10px] file:font-bold" />
              {uploading && <span className="text-[10px] text-gold-400 animate-pulse">⏳</span>}
            </div>
            {imageUrl && (
              <div className="mt-1 flex items-center gap-2">
                <img src={imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <span className="text-[9px] text-emerald-400">✅ Загружено</span>
              </div>
            )}
          </div>

          <button onClick={handleCreate}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
            🏘 Создать клубный дом
          </button>
        </div>
      )}

      {/* ═══ Список клубных домов ═══ */}
      {loading ? (
        <div className="text-center text-[11px] text-slate-500 py-4">Загрузка...</div>
      ) : houses.length === 0 ? (
        <div className="p-4 rounded-2xl glass text-center">
          <div className="text-2xl mb-1">🏗</div>
          <div className="text-[11px] text-slate-500">Нет клубных домов. Создайте первый!</div>
        </div>
      ) : (
        <div className="space-y-2">
          {houses.map(h => {
            const st = STATUS_LABELS[h.status] || STATUS_LABELS.planning
            return (
              <div key={h.id} className="p-3 rounded-2xl glass cursor-pointer hover:border-gold-400/20 transition-all"
                onClick={() => loadHouseDetail(h.id)}>
                <div className="flex items-center gap-3">
                  {h.image_url ? (
                    <img src={h.image_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl flex-shrink-0">🏘</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-black text-white truncate">{h.name}</div>
                    <div className="text-[10px] text-slate-500">{h.city}{h.country ? `, ${h.country}` : ''}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gold-400 font-bold">${parseFloat(h.total_price).toLocaleString()}</span>
                      <span className="text-[9px] text-slate-500">{parseFloat(h.total_sqm)} м²</span>
                      <span className={`text-[9px] font-bold ${st.color}`}>{st.emoji} {st.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ═══ Детали клубного дома ═══ */}
      {selectedHouse && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={() => setSelectedHouse(null)}>
          <div className="w-full max-w-[430px] max-h-[80vh] overflow-y-auto rounded-t-3xl glass p-4"
            onClick={e => e.stopPropagation()}>
            
            {detailLoading ? (
              <div className="text-center py-8 text-slate-500">⏳ Загрузка...</div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-black text-gold-400">{selectedHouse.name}</h3>
                  <button onClick={() => setSelectedHouse(null)} className="text-slate-500 text-lg">✕</button>
                </div>

                {selectedHouse.image_url && (
                  <img src={selectedHouse.image_url} alt="" className="w-full h-32 rounded-xl object-cover mb-3" />
                )}

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-[10px] text-slate-500">Стоимость</div>
                    <div className="text-sm font-bold text-gold-400">${parseFloat(selectedHouse.total_price).toLocaleString()}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 text-center">
                    <div className="text-[10px] text-slate-500">Площадь</div>
                    <div className="text-sm font-bold text-white">{parseFloat(selectedHouse.total_sqm)} м²</div>
                  </div>
                </div>

                {/* Прогресс покупки м² */}
                <div className="mb-3">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-slate-500">м² куплено</span>
                    <span className="text-emerald-400">
                      {(selectedHouse.purchased_sqm || 0).toFixed(2)} / {parseFloat(selectedHouse.total_sqm)}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all"
                      style={{ width: `${Math.min(((selectedHouse.purchased_sqm || 0) / parseFloat(selectedHouse.total_sqm || 1)) * 100, 100)}%` }} />
                  </div>
                </div>

                {selectedHouse.description && (
                  <div className="p-2 rounded-lg bg-white/5 mb-3 text-[10px] text-slate-400">
                    {selectedHouse.description}
                  </div>
                )}

                {/* Статус-контроль */}
                <div className="flex gap-1 mb-3">
                  {Object.entries(STATUS_LABELS).map(([key, val]) => (
                    <button key={key} onClick={() => handleStatusChange(selectedHouse.id, key)}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold border ${selectedHouse.status === key ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/10 text-slate-500'}`}>
                      {val.emoji} {val.label}
                    </button>
                  ))}
                </div>

                {/* Список покупателей */}
                <div className="mb-3">
                  <div className="text-[11px] font-bold text-blue-400 mb-1">
                    👥 Покупатели ({selectedHouse.purchases?.length || 0})
                  </div>
                  {(!selectedHouse.purchases || selectedHouse.purchases.length === 0) ? (
                    <div className="text-[10px] text-slate-500 text-center py-2">Нет покупок</div>
                  ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {selectedHouse.purchases.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
                          <div>
                            <span className="text-[10px] font-bold text-white">{shortAddress(p.wallet)}</span>
                            <span className="text-[9px] text-slate-500 ml-2">{parseFloat(p.sqm_purchased).toFixed(2)} м²</span>
                            {p.payment_type === 'gift' && <span className="text-[8px] text-purple-400 ml-1">🎁</span>}
                          </div>
                          <div className="text-[8px] text-slate-600">
                            {p.payment_type === 'gift' ? '🎁 Подарок' : `$${parseFloat(p.amount_paid || 0)}`} • {new Date(p.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ═══ Подарить м² ═══ */}
                <div className="mb-3">
                  <button onClick={() => setShowGift(!showGift)}
                    className={`w-full py-2 rounded-xl text-[10px] font-bold border ${showGift ? 'bg-purple-500/15 border-purple-500/25 text-purple-400' : 'bg-gold-400/10 border-gold-400/20 text-gold-400'}`}>
                    {showGift ? '✕ Отмена' : '🎁 Подарить м²'}
                  </button>
                  {showGift && (
                    <div className="mt-2 p-3 rounded-xl space-y-2" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.15)' }}>
                      <div>
                        <label className="text-[9px] text-slate-500 block mb-0.5">Кошелёк получателя *</label>
                        <input type="text" value={giftWallet} onChange={e => setGiftWallet(e.target.value)}
                          placeholder="0x..." className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Количество м² *</label>
                          <input type="number" value={giftSqm} onChange={e => setGiftSqm(e.target.value)}
                            placeholder="0.25" step="0.05" className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                        </div>
                        <div>
                          <label className="text-[9px] text-slate-500 block mb-0.5">Сумма $ (необязательно)</label>
                          <input type="number" value={giftAmount} onChange={e => setGiftAmount(e.target.value)}
                            placeholder="250" className="w-full p-2 rounded-lg bg-white/5 border border-white/10 text-[10px] text-white outline-none" />
                        </div>
                      </div>
                      {/* Быстрые кнопки */}
                      <div className="flex gap-1">
                        {[{ sqm: '0.05', amt: '50' }, { sqm: '0.25', amt: '250' }, { sqm: '1.0', amt: '1000' }].map(q => (
                          <button key={q.sqm} onClick={() => { setGiftSqm(q.sqm); setGiftAmount(q.amt) }}
                            className="flex-1 py-1 rounded-lg text-[9px] font-bold bg-white/5 text-slate-400 hover:text-white border border-white/5">
                            {q.sqm} м² (${q.amt})
                          </button>
                        ))}
                      </div>
                      <button onClick={handleGift} disabled={gifting || !giftWallet || !giftSqm}
                        className="w-full py-2 rounded-xl text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/25"
                        style={{ opacity: (!giftWallet || !giftSqm || gifting) ? 0.5 : 1 }}>
                        {gifting ? '⏳ Подарок...' : `🎁 Подарить ${giftSqm || '?'} м²`}
                      </button>
                    </div>
                  )}
                </div>

                <button onClick={() => handleDelete(selectedHouse.id)}
                  className="w-full py-2 rounded-xl text-[10px] font-bold text-red-400 border border-red-500/20 hover:bg-red-500/10">
                  🗑 Удалить клубный дом
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
