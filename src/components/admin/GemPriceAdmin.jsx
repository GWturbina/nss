'use client'
/**
 * GemPriceAdmin.jsx — Панель администратора для управления ценами бриллиантов
 * 
 * Добавляется в существующий AdminPanel.jsx как новая вкладка
 * или используется отдельно
 * 
 * Функции:
 *   - Редактирование матрицы цен белых бриллиантов (7×9)
 *   - Редактирование базовых цен цветных бриллиантов
 *   - Редактирование множителей форм огранки
 *   - Сброс к дефолтным значениям
 *   - Экспорт/импорт JSON (для бэкапа или переноса на другой браузер)
 */
import { useState, useEffect } from 'react'
import useGameStore from '@/lib/store'
import {
  CLARITIES, WHITE_COLORS, FANCY_COLORS, SHAPES,
  getWhitePriceMatrix, getFancyBasePrices, getShapeMultipliers,
  saveWhitePriceMatrix, saveFancyBasePrices, saveShapeMultipliers,
  resetAllPrices, formatUSD
} from '@/lib/gemCatalog'

export default function GemPriceAdmin() {
  const { t, addNotification } = useGameStore()
  const [tab, setTab] = useState('white') // white | fancy | shapes | export
  const [whiteMatrix, setWhiteMatrix] = useState({})
  const [fancyPrices, setFancyPrices] = useState({})
  const [shapeMults, setShapeMults] = useState({})
  const [unsaved, setUnsaved] = useState(false)

  // Загрузка данных
  useEffect(() => {
    setWhiteMatrix(getWhitePriceMatrix())
    setFancyPrices(getFancyBasePrices())
    setShapeMults(getShapeMultipliers())
  }, [])

  // ═══ БЕЛЫЕ: обновление ячейки ═══
  const updateWhiteCell = (clarity, colorIdx, value) => {
    const num = parseInt(value) || 0
    const updated = { ...whiteMatrix }
    updated[clarity] = [...(updated[clarity] || [])]
    updated[clarity][colorIdx] = num
    setWhiteMatrix(updated)
    setUnsaved(true)
  }

  // ═══ ЦВЕТНЫЕ: обновление цены ═══
  const updateFancyPrice = (colorId, value) => {
    const num = parseInt(value) || 0
    setFancyPrices(prev => ({ ...prev, [colorId]: num }))
    setUnsaved(true)
  }

  // ═══ ФОРМЫ: обновление множителя ═══
  const updateShapeMult = (shapeId, value) => {
    const num = parseFloat(value) || 0
    setShapeMults(prev => ({ ...prev, [shapeId]: num }))
    setUnsaved(true)
  }

  // ═══ СОХРАНИТЬ ═══
  const handleSave = () => {
    saveWhitePriceMatrix(whiteMatrix)
    saveFancyBasePrices(fancyPrices)
    saveShapeMultipliers(shapeMults)
    setUnsaved(false)
    addNotification('✅ 💰 Цены сохранены')
  }

  // ═══ СБРОС ═══
  const handleReset = () => {
    if (!confirm('Сбросить все цены к дефолтным?')) return
    resetAllPrices()
    setWhiteMatrix(getWhitePriceMatrix())
    setFancyPrices(getFancyBasePrices())
    setShapeMults(getShapeMultipliers())
    setUnsaved(false)
    addNotification('🔄 Цены сброшены к дефолтным')
  }

  // ═══ ЭКСПОРТ ═══
  const handleExport = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      whitePrices: whiteMatrix,
      fancyPrices: fancyPrices,
      shapeMultipliers: shapeMults,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diamond-prices-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    addNotification('📥 Цены экспортированы')
  }

  // ═══ ИМПОРТ ═══
  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.whitePrices) setWhiteMatrix(data.whitePrices)
        if (data.fancyPrices) setFancyPrices(data.fancyPrices)
        if (data.shapeMultipliers) setShapeMults(data.shapeMultipliers)
        setUnsaved(true)
        addNotification('📤 Цены импортированы (не забудь сохранить)')
      } catch (err) {
        addNotification('❌ Ошибка импорта: ' + err.message)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="px-3 mt-2 space-y-2">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="text-[14px] font-black text-gold-400">💰 Управление ценами</div>
        <div className="flex gap-1">
          {unsaved && (
            <button onClick={handleSave}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 animate-pulse">
              💾 Сохранить
            </button>
          )}
          <button onClick={handleReset}
            className="px-3 py-1.5 rounded-xl text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
            🔄
          </button>
        </div>
      </div>

      {/* Табы */}
      <div className="flex gap-1 p-1 rounded-xl bg-white/5">
        {[
          { id: 'white', label: '◇ Белые' },
          { id: 'fancy', label: '🌈 Цветные' },
          { id: 'shapes', label: '✂️ Формы' },
          { id: 'export', label: '📦 Бэкап' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-1.5 rounded-lg text-[9px] font-bold transition-all ${
              tab === t.id ? 'bg-gold-400/12 text-gold-400' : 'text-slate-500'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ МАТРИЦА БЕЛЫХ БРИЛЛИАНТОВ ═══ */}
      {tab === 'white' && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[10px] font-bold text-slate-400 mb-2">
            Цена за 1 карат (USD), Round, без сертификата
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-center" style={{ minWidth: '500px' }}>
              <thead>
                <tr>
                  <th className="text-[8px] text-slate-500 p-1 sticky left-0 bg-[#0d1520] z-10"></th>
                  {WHITE_COLORS.map(c => (
                    <th key={c.id} className="text-[9px] font-bold text-white/70 p-1">{c.id}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CLARITIES.map(cl => (
                  <tr key={cl.id}>
                    <td className="text-[9px] font-bold text-gold-400 p-1 sticky left-0 bg-[#0d1520] z-10">{cl.id}</td>
                    {WHITE_COLORS.map((c, idx) => (
                      <td key={c.id} className="p-0.5">
                        <input
                          type="number"
                          value={whiteMatrix[cl.id]?.[idx] || ''}
                          onChange={e => updateWhiteCell(cl.id, idx, e.target.value)}
                          className="w-full p-1 rounded-lg bg-white/5 border border-white/8 text-[9px] text-white text-center outline-none focus:border-gold-400/30 transition-colors"
                          style={{ minWidth: '48px' }}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-2 text-[8px] text-slate-600">
            💡 Эти цены умножаются на коэффициент формы, сертификата и каратности
          </div>
        </div>
      )}

      {/* ═══ ЦВЕТНЫЕ БРИЛЛИАНТЫ ═══ */}
      {tab === 'fancy' && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[10px] font-bold text-slate-400 mb-2">
            Базовая цена за 1 карат (USD), Light intensity, VS1
          </div>
          <div className="space-y-1.5">
            {FANCY_COLORS.map(fc => (
              <div key={fc.id} className="flex items-center gap-2 p-2 rounded-xl bg-white/3">
                <div className="w-5 h-5 rounded-full border border-white/15"
                  style={{ background: fc.hex }} />
                <span className="text-[10px] font-bold text-white flex-1">{fc.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-slate-500">$</span>
                  <input
                    type="number"
                    value={fancyPrices[fc.id] || ''}
                    onChange={e => updateFancyPrice(fc.id, e.target.value)}
                    className="w-20 p-1.5 rounded-lg bg-white/5 border border-white/8 text-[11px] text-white text-right outline-none focus:border-gold-400/30"
                  />
                  <span className="text-[8px] text-slate-500">/ct</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-[8px] text-slate-600">
            💡 Цена умножается на интенсивность: Faint ×0.7, Fancy ×1.8, Intense ×3.0, Vivid ×5.0
          </div>
        </div>
      )}

      {/* ═══ МНОЖИТЕЛИ ФОРМ ═══ */}
      {tab === 'shapes' && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[10px] font-bold text-slate-400 mb-2">
            Коэффициент цены по форме (Round = 1.00)
          </div>
          <div className="space-y-1.5">
            {SHAPES.map(s => (
              <div key={s.id} className="flex items-center gap-2 p-2 rounded-xl bg-white/3">
                <span className="text-lg w-8 text-center">{s.emoji}</span>
                <span className="text-[10px] font-bold text-white flex-1">{s.name}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[8px] text-slate-500">×</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    max="2.0"
                    value={shapeMults[s.id] ?? ''}
                    onChange={e => updateShapeMult(s.id, e.target.value)}
                    className="w-16 p-1.5 rounded-lg bg-white/5 border border-white/8 text-[11px] text-white text-center outline-none focus:border-gold-400/30"
                  />
                </div>
                {shapeMults[s.id] !== undefined && (
                  <span className="text-[8px] text-slate-500 w-16 text-right">
                    {Math.round(shapeMults[s.id] * 100)}% от Round
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ ЭКСПОРТ/ИМПОРТ ═══ */}
      {tab === 'export' && (
        <div className="p-3 rounded-2xl glass space-y-3">
          <div className="text-[10px] font-bold text-slate-400">
            Бэкап и восстановление цен
          </div>

          <button onClick={handleExport}
            className="w-full py-3 rounded-xl text-[11px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            📥 Экспорт цен в JSON
          </button>

          <div>
            <label className="w-full py-3 rounded-xl text-[11px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center cursor-pointer">
              📤 Импорт цен из JSON
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          <div className="text-[9px] text-slate-500 leading-relaxed">
            💡 Экспортируйте цены перед обновлением. Импорт загружает цены но не сохраняет их автоматически — нажмите «Сохранить» после проверки.
          </div>
        </div>
      )}
    </div>
  )
}
