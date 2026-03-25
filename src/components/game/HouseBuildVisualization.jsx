'use client'
/**
 * HouseBuildVisualization — SVG анимация стройки дома
 * Прогресс: фундамент → стены → крыша → отделка → готов
 * Привязан к totalSqm и house status
 */

export default function HouseBuildVisualization({ totalSqm = 0, targetSqm = 100, houseStatus = 'none' }) {
  // Прогресс 0..1
  const progress = targetSqm > 0 ? Math.min(totalSqm / targetSqm, 1) : 0
  
  // Фаза стройки
  const phase = houseStatus === 'personal' ? 4
    : houseStatus === 'club_owned' ? 3
    : progress >= 0.8 ? 3    // отделка
    : progress >= 0.5 ? 2    // крыша
    : progress >= 0.2 ? 1    // стены
    : 0                       // фундамент

  const phaseNames = ['Фундамент', 'Стены', 'Крыша', 'Отделка', '🔑 Готов!']
  const phaseColors = ['#94a3b8', '#f59e0b', '#3b82f6', '#a855f7', '#10b981']

  return (
    <div className="w-full">
      <svg viewBox="0 0 300 200" className="w-full" style={{ maxHeight: 180 }}>
        {/* Небо */}
        <defs>
          <linearGradient id="sky" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={phase >= 4 ? '#1e3a5f' : '#0f172a'} />
            <stop offset="100%" stopColor={phase >= 4 ? '#1e40af' : '#1e293b'} />
          </linearGradient>
          <linearGradient id="ground" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#365314" />
            <stop offset="100%" stopColor="#1a2e05" />
          </linearGradient>
        </defs>
        
        <rect width="300" height="200" fill="url(#sky)" />
        
        {/* Звёзды (если не готов) */}
        {phase < 4 && [
          [30, 20], [80, 35], [150, 15], [220, 30], [270, 25], [45, 50], [190, 45],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={0.8} fill="white" opacity={0.4 + (i % 3) * 0.2}>
            <animate attributeName="opacity" values={`${0.3 + i * 0.05};0.8;${0.3 + i * 0.05}`} dur={`${2 + i * 0.5}s`} repeatCount="indefinite" />
          </circle>
        ))}
        
        {/* Солнце (если готов) */}
        {phase >= 4 && (
          <g>
            <circle cx="250" cy="40" r="18" fill="#fbbf24" opacity="0.9">
              <animate attributeName="r" values="17;19;17" dur="3s" repeatCount="indefinite" />
            </circle>
            <circle cx="250" cy="40" r="24" fill="#fbbf24" opacity="0.15" />
          </g>
        )}
        
        {/* Земля */}
        <rect x="0" y="155" width="300" height="45" fill="url(#ground)" />
        
        {/* ═══ ФУНДАМЕНТ (всегда показывается если progress > 0) ═══ */}
        {progress > 0 && (
          <g>
            <rect x="70" y="145" width="160" height="12" rx="1" fill="#78716c" opacity={Math.min(progress * 5, 1)}>
              {progress < 0.2 && (
                <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze" />
              )}
            </rect>
            <rect x="73" y="147" width="154" height="8" rx="1" fill="#a8a29e" opacity={0.3} />
          </g>
        )}
        
        {/* ═══ СТЕНЫ (phase >= 1) ═══ */}
        {phase >= 1 && (
          <g>
            {/* Левая стена */}
            <rect x="75" y="95" width="65" height="50" fill="#d97706" opacity={phase >= 1 ? 0.9 : 0}>
              <animate attributeName="height" values="0;50" dur="0.6s" fill="freeze" />
              <animate attributeName="y" values="145;95" dur="0.6s" fill="freeze" />
            </rect>
            {/* Правая стена */}
            <rect x="160" y="95" width="65" height="50" fill="#d97706" opacity={phase >= 1 ? 0.9 : 0}>
              <animate attributeName="height" values="0;50" dur="0.6s" fill="freeze" />
              <animate attributeName="y" values="145;95" dur="0.6s" fill="freeze" />
            </rect>
            {/* Стена середина */}
            <rect x="140" y="95" width="20" height="50" fill="#b45309" opacity={0.8} />
            
            {/* Окна */}
            {phase >= 2 && (
              <g>
                <rect x="88" y="108" width="18" height="18" rx="1" fill="#60a5fa" opacity="0.7" />
                <rect x="88" y="108" width="18" height="18" rx="1" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                <line x1="97" y1="108" x2="97" y2="126" stroke="#fbbf24" strokeWidth="0.5" opacity="0.5" />
                <line x1="88" y1="117" x2="106" y2="117" stroke="#fbbf24" strokeWidth="0.5" opacity="0.5" />
                
                <rect x="194" y="108" width="18" height="18" rx="1" fill="#60a5fa" opacity="0.7" />
                <rect x="194" y="108" width="18" height="18" rx="1" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.5" />
                <line x1="203" y1="108" x2="203" y2="126" stroke="#fbbf24" strokeWidth="0.5" opacity="0.5" />
                <line x1="194" y1="117" x2="212" y2="117" stroke="#fbbf24" strokeWidth="0.5" opacity="0.5" />
              </g>
            )}
            
            {/* Дверь */}
            <rect x="141" y="118" width="18" height="27" rx="1" fill="#7c2d12" />
            <circle cx="156" cy="132" r="1.2" fill="#fbbf24" />
          </g>
        )}
        
        {/* ═══ КРЫША (phase >= 2) ═══ */}
        {phase >= 2 && (
          <g>
            <polygon points="150,55 65,95 235,95" fill="#dc2626" opacity="0.9">
              <animate attributeName="points" values="150,95 65,95 235,95;150,55 65,95 235,95" dur="0.5s" fill="freeze" />
            </polygon>
            <polygon points="150,60 70,95 230,95" fill="#ef4444" opacity="0.4" />
            {/* Дымоход */}
            <rect x="185" y="60" width="12" height="25" rx="1" fill="#78716c" />
            {phase >= 4 && (
              <g opacity="0.5">
                <ellipse cx="191" cy="52" rx="5" ry="3" fill="#94a3b8">
                  <animate attributeName="cy" values="52;42;32" dur="3s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.5;0.2;0" dur="3s" repeatCount="indefinite" />
                </ellipse>
              </g>
            )}
          </g>
        )}
        
        {/* ═══ ОТДЕЛКА (phase >= 3) ═══ */}
        {phase >= 3 && (
          <g>
            {/* Забор */}
            {[40, 48, 56, 244, 252, 260].map((x, i) => (
              <g key={i}>
                <rect x={x} y="140" width="4" height="15" fill="#a16207" opacity="0.7" />
                <polygon points={`${x},140 ${x+2},136 ${x+4},140`} fill="#a16207" opacity="0.7" />
              </g>
            ))}
            <rect x="40" y="148" width="24" height="2" fill="#a16207" opacity="0.5" />
            <rect x="244" y="148" width="24" height="2" fill="#a16207" opacity="0.5" />
            
            {/* Кусты */}
            <ellipse cx="55" cy="153" rx="12" ry="6" fill="#166534" opacity="0.7" />
            <ellipse cx="245" cy="153" rx="12" ry="6" fill="#166534" opacity="0.7" />
          </g>
        )}
        
        {/* ═══ ГОТОВО — свет в окнах ═══ */}
        {phase >= 4 && (
          <g>
            <rect x="88" y="108" width="18" height="18" fill="#fbbf24" opacity="0.4">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="2s" repeatCount="indefinite" />
            </rect>
            <rect x="194" y="108" width="18" height="18" fill="#fbbf24" opacity="0.4">
              <animate attributeName="opacity" values="0.4;0.6;0.4" dur="2.5s" repeatCount="indefinite" />
            </rect>
          </g>
        )}
        
        {/* ═══ Кран (если идёт стройка) ═══ */}
        {phase > 0 && phase < 4 && (
          <g opacity="0.4">
            <rect x="25" y="40" width="3" height="115" fill="#fbbf24" />
            <rect x="25" y="42" width="60" height="2" fill="#fbbf24" />
            <line x1="85" y1="44" x2="85" y2="90" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2" />
            <rect x="82" y="88" width="6" height="4" fill="#94a3b8" />
          </g>
        )}
        
        {/* Прогресс-текст */}
        <text x="150" y="185" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" opacity="0.6">
          {phaseNames[phase]} • {(progress * 100).toFixed(0)}%
        </text>
      </svg>
      
      {/* Прогресс-бар под SVG */}
      <div className="mt-1 mx-2">
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${phaseColors[Math.min(phase, 3)]}, ${phaseColors[Math.min(phase + 1, 4)]})` }} />
        </div>
      </div>
    </div>
  )
}
