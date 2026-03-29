'use client'
import { useState } from 'react'

/**
 * HouseProgress — визуализация прогресса к дому
 * Серый дом → цветной снизу вверх по мере заработка
 * По нажатию — показать в полном цвете
 * 
 * @param {number} percent — 0-100 прогресс заработка
 * @param {string} imageSrc — путь к фото дома
 */
export default function HouseProgress({ percent = 0, imageSrc = '/images/houses/house-visualization.png' }) {
  const [showFull, setShowFull] = useState(false)

  const clampedPercent = Math.min(Math.max(percent, 0), 100)
  // Инвертируем — серый сверху, цветной снизу
  const grayPercent = 100 - clampedPercent

  return (
    <div className="relative w-full rounded-2xl overflow-hidden cursor-pointer select-none"
      onClick={() => setShowFull(!showFull)}
      style={{ aspectRatio: '16/10' }}>

      {/* Цветное фото (всегда на заднем плане) */}
      <img src={imageSrc} alt="Мой дом"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => { e.target.src = '/images/houses/house-modern.jpg' }} />

      {/* Серый оверлей — уходит снизу вверх */}
      {!showFull && (
        <div className="absolute inset-0 transition-all duration-1000 ease-out"
          style={{
            background: `linear-gradient(to bottom, 
              rgba(30,30,50,0.95) 0%, 
              rgba(30,30,50,0.95) ${grayPercent - 5}%, 
              rgba(30,30,50,0.0) ${grayPercent + 10}%, 
              transparent 100%)`,
            backdropFilter: clampedPercent < 100 ? 'none' : undefined,
          }}>
          {/* Серый фильтр на верхнюю часть */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(to bottom, 
              transparent 0%, 
              transparent ${grayPercent - 5}%, 
              transparent 100%)`,
            filter: 'grayscale(100%)',
            mixBlendMode: 'saturation',
          }} />
        </div>
      )}

      {/* Серый фильтр через clip-path */}
      {!showFull && clampedPercent < 100 && (
        <div className="absolute inset-0 transition-all duration-1000"
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%) brightness(0.6)',
            clipPath: `inset(0 0 ${clampedPercent}% 0)`,
          }} />
      )}

      {/* Процент прогресса */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
        <span className="text-[12px] font-black" style={{ color: clampedPercent >= 100 ? '#10b981' : '#ffd700' }}>
          {clampedPercent >= 100 ? '✅ Готово!' : `${clampedPercent.toFixed(1)}% к дому`}
        </span>
      </div>

      {/* Подсказка */}
      {showFull && (
        <div className="absolute top-3 right-3 z-10 px-2 py-1 rounded-full text-[9px] font-bold"
          style={{ background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
          Нажми чтобы вернуть
        </div>
      )}

      {/* Линия прогресса внизу */}
      <div className="absolute bottom-0 left-0 right-0 h-1 z-10" style={{ background: 'rgba(0,0,0,0.3)' }}>
        <div className="h-full transition-all duration-1000" style={{
          width: `${clampedPercent}%`,
          background: clampedPercent >= 100 ? '#10b981' : 'linear-gradient(90deg, #ffd700, #f59e0b)',
        }} />
      </div>
    </div>
  )
}
