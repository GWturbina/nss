/**
 * DiamondShapes.jsx — Реалистичные SVG огранки (face-up view)
 * Каждая форма с table, crown facets, star facets, girdle
 */

export function ShapeSVG({ shape, size = 48, active = false }) {
  const c = active ? '#ffd700' : 'rgba(255,255,255,0.35)'
  const c2 = active ? 'rgba(255,215,0,0.5)' : 'rgba(255,255,255,0.15)'
  const w = active ? 1.0 : 0.7
  const w2 = active ? 0.5 : 0.35

  const shapes = {

    // ═══ ROUND BRILLIANT — 57 facets style ═══
    round: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Girdle outline */}
        <circle cx="50" cy="50" r="46" stroke={c} strokeWidth={w} fill="none" />
        {/* Table (octagonal) */}
        <polygon points="38,30 62,30 72,40 72,60 62,70 38,70 28,60 28,40" stroke={c} strokeWidth={w} fill="none" />
        {/* Star facets — table to bezel */}
        <line x1="50" y1="30" x2="50" y2="4" stroke={c2} strokeWidth={w2} />
        <line x1="72" y1="40" x2="93" y2="20" stroke={c2} strokeWidth={w2} />
        <line x1="72" y1="60" x2="93" y2="80" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="70" x2="50" y2="96" stroke={c2} strokeWidth={w2} />
        <line x1="28" y1="60" x2="7" y2="80" stroke={c2} strokeWidth={w2} />
        <line x1="28" y1="40" x2="7" y2="20" stroke={c2} strokeWidth={w2} />
        <line x1="62" y1="30" x2="80" y2="8" stroke={c2} strokeWidth={w2} />
        <line x1="38" y1="30" x2="20" y2="8" stroke={c2} strokeWidth={w2} />
        <line x1="62" y1="70" x2="80" y2="92" stroke={c2} strokeWidth={w2} />
        <line x1="38" y1="70" x2="20" y2="92" stroke={c2} strokeWidth={w2} />
        {/* Bezel/kite facets — girdle to table vertices */}
        <line x1="50" y1="4" x2="38" y2="30" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="4" x2="62" y2="30" stroke={c} strokeWidth={w2} />
        <line x1="93" y1="20" x2="72" y2="40" stroke={c} strokeWidth={w2} />
        <line x1="93" y1="20" x2="62" y2="30" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="50" x2="72" y2="40" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="50" x2="72" y2="60" stroke={c} strokeWidth={w2} />
        <line x1="93" y1="80" x2="72" y2="60" stroke={c} strokeWidth={w2} />
        <line x1="93" y1="80" x2="62" y2="70" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="96" x2="62" y2="70" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="96" x2="38" y2="70" stroke={c} strokeWidth={w2} />
        <line x1="7" y1="80" x2="38" y2="70" stroke={c} strokeWidth={w2} />
        <line x1="7" y1="80" x2="28" y2="60" stroke={c} strokeWidth={w2} />
        <line x1="4" y1="50" x2="28" y2="60" stroke={c} strokeWidth={w2} />
        <line x1="4" y1="50" x2="28" y2="40" stroke={c} strokeWidth={w2} />
        <line x1="7" y1="20" x2="28" y2="40" stroke={c} strokeWidth={w2} />
        <line x1="7" y1="20" x2="38" y2="30" stroke={c} strokeWidth={w2} />
        {/* Upper girdle points */}
        <line x1="80" y1="8" x2="72" y2="40" stroke={c2} strokeWidth={w2} />
        <line x1="20" y1="8" x2="28" y2="40" stroke={c2} strokeWidth={w2} />
        <line x1="80" y1="92" x2="72" y2="60" stroke={c2} strokeWidth={w2} />
        <line x1="20" y1="92" x2="28" y2="60" stroke={c2} strokeWidth={w2} />
      </svg>
    ),

    // ═══ PRINCESS — chevron facets ═══
    princess: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <rect x="5" y="5" width="90" height="90" stroke={c} strokeWidth={w} fill="none" />
        {/* Table */}
        <rect x="25" y="25" width="50" height="50" stroke={c} strokeWidth={w} fill="none" />
        {/* Corner to table — crown */}
        <line x1="5" y1="5" x2="25" y2="25" stroke={c} strokeWidth={w2} />
        <line x1="95" y1="5" x2="75" y2="25" stroke={c} strokeWidth={w2} />
        <line x1="95" y1="95" x2="75" y2="75" stroke={c} strokeWidth={w2} />
        <line x1="5" y1="95" x2="25" y2="75" stroke={c} strokeWidth={w2} />
        {/* Chevron V-patterns */}
        <line x1="5" y1="5" x2="50" y2="25" stroke={c2} strokeWidth={w2} />
        <line x1="95" y1="5" x2="50" y2="25" stroke={c2} strokeWidth={w2} />
        <line x1="5" y1="95" x2="50" y2="75" stroke={c2} strokeWidth={w2} />
        <line x1="95" y1="95" x2="50" y2="75" stroke={c2} strokeWidth={w2} />
        <line x1="5" y1="5" x2="25" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="5" y1="95" x2="25" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="95" y1="5" x2="75" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="95" y1="95" x2="75" y2="50" stroke={c2} strokeWidth={w2} />
        {/* Mid-edge to table */}
        <line x1="50" y1="5" x2="50" y2="25" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="95" x2="50" y2="75" stroke={c2} strokeWidth={w2} />
        <line x1="5" y1="50" x2="25" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="95" y1="50" x2="75" y2="50" stroke={c2} strokeWidth={w2} />
      </svg>
    ),

    // ═══ CUSHION — rounded square with facets ═══
    cushion: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <rect x="6" y="6" width="88" height="88" rx="20" ry="20" stroke={c} strokeWidth={w} fill="none" />
        <rect x="26" y="26" width="48" height="48" rx="4" stroke={c} strokeWidth={w} fill="none" />
        <line x1="12" y1="12" x2="26" y2="26" stroke={c} strokeWidth={w2} />
        <line x1="88" y1="12" x2="74" y2="26" stroke={c} strokeWidth={w2} />
        <line x1="88" y1="88" x2="74" y2="74" stroke={c} strokeWidth={w2} />
        <line x1="12" y1="88" x2="26" y2="74" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="6" x2="50" y2="26" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="94" x2="50" y2="74" stroke={c2} strokeWidth={w2} />
        <line x1="6" y1="50" x2="26" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="94" y1="50" x2="74" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="12" y1="12" x2="50" y2="26" stroke={c2} strokeWidth={w2} />
        <line x1="88" y1="12" x2="50" y2="26" stroke={c2} strokeWidth={w2} />
        <line x1="12" y1="88" x2="50" y2="74" stroke={c2} strokeWidth={w2} />
        <line x1="88" y1="88" x2="50" y2="74" stroke={c2} strokeWidth={w2} />
        <line x1="12" y1="12" x2="26" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="12" y1="88" x2="26" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="88" y1="12" x2="74" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="88" y1="88" x2="74" y2="50" stroke={c2} strokeWidth={w2} />
      </svg>
    ),

    // ═══ OVAL — brilliant with ellipse ═══
    oval: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <ellipse cx="50" cy="50" rx="32" ry="46" stroke={c} strokeWidth={w} fill="none" />
        <ellipse cx="50" cy="50" rx="16" ry="22" stroke={c} strokeWidth={w} fill="none" />
        {/* Top/bottom */}
        <line x1="50" y1="4" x2="42" y2="28" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="4" x2="58" y2="28" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="96" x2="42" y2="72" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="96" x2="58" y2="72" stroke={c} strokeWidth={w2} />
        {/* Sides */}
        <line x1="18" y1="50" x2="34" y2="42" stroke={c} strokeWidth={w2} />
        <line x1="18" y1="50" x2="34" y2="58" stroke={c} strokeWidth={w2} />
        <line x1="82" y1="50" x2="66" y2="42" stroke={c} strokeWidth={w2} />
        <line x1="82" y1="50" x2="66" y2="58" stroke={c} strokeWidth={w2} />
        {/* Diagonals */}
        <line x1="26" y1="18" x2="42" y2="28" stroke={c2} strokeWidth={w2} />
        <line x1="26" y1="18" x2="34" y2="42" stroke={c2} strokeWidth={w2} />
        <line x1="74" y1="18" x2="58" y2="28" stroke={c2} strokeWidth={w2} />
        <line x1="74" y1="18" x2="66" y2="42" stroke={c2} strokeWidth={w2} />
        <line x1="26" y1="82" x2="42" y2="72" stroke={c2} strokeWidth={w2} />
        <line x1="26" y1="82" x2="34" y2="58" stroke={c2} strokeWidth={w2} />
        <line x1="74" y1="82" x2="58" y2="72" stroke={c2} strokeWidth={w2} />
        <line x1="74" y1="82" x2="66" y2="58" stroke={c2} strokeWidth={w2} />
        {/* Star facets */}
        <line x1="50" y1="4" x2="50" y2="28" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="96" x2="50" y2="72" stroke={c2} strokeWidth={w2} />
      </svg>
    ),

    // ═══ EMERALD — step cut ═══
    emerald: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Outer — cut corners */}
        <polygon points="18,4 82,4 96,18 96,82 82,96 18,96 4,82 4,18" stroke={c} strokeWidth={w} fill="none" />
        {/* Step 1 */}
        <polygon points="24,14 76,14 86,24 86,76 76,86 24,86 14,76 14,24" stroke={c2} strokeWidth={w2} fill="none" />
        {/* Step 2 */}
        <polygon points="30,24 70,24 76,30 76,70 70,76 30,76 24,70 24,30" stroke={c2} strokeWidth={w2} fill="none" />
        {/* Table */}
        <polygon points="36,32 64,32 68,36 68,64 64,68 36,68 32,64 32,36" stroke={c} strokeWidth={w} fill="none" />
        {/* Corner lines */}
        <line x1="18" y1="4" x2="36" y2="32" stroke={c} strokeWidth={w2} />
        <line x1="82" y1="4" x2="64" y2="32" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="18" x2="68" y2="36" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="82" x2="68" y2="64" stroke={c} strokeWidth={w2} />
        <line x1="82" y1="96" x2="64" y2="68" stroke={c} strokeWidth={w2} />
        <line x1="18" y1="96" x2="36" y2="68" stroke={c} strokeWidth={w2} />
        <line x1="4" y1="82" x2="32" y2="64" stroke={c} strokeWidth={w2} />
        <line x1="4" y1="18" x2="32" y2="36" stroke={c} strokeWidth={w2} />
      </svg>
    ),

    // ═══ RADIANT — cut corners + brilliant ═══
    radiant: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <polygon points="18,4 82,4 96,18 96,82 82,96 18,96 4,82 4,18" stroke={c} strokeWidth={w} fill="none" />
        <polygon points="35,28 65,28 72,35 72,65 65,72 35,72 28,65 28,35" stroke={c} strokeWidth={w} fill="none" />
        {/* Corners */}
        <line x1="18" y1="4" x2="35" y2="28" stroke={c} strokeWidth={w2} />
        <line x1="82" y1="4" x2="65" y2="28" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="18" x2="72" y2="35" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="82" x2="72" y2="65" stroke={c} strokeWidth={w2} />
        <line x1="82" y1="96" x2="65" y2="72" stroke={c} strokeWidth={w2} />
        <line x1="18" y1="96" x2="35" y2="72" stroke={c} strokeWidth={w2} />
        <line x1="4" y1="82" x2="28" y2="65" stroke={c} strokeWidth={w2} />
        <line x1="4" y1="18" x2="28" y2="35" stroke={c} strokeWidth={w2} />
        {/* Brilliant facets */}
        <line x1="50" y1="4" x2="50" y2="28" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="96" x2="50" y2="72" stroke={c2} strokeWidth={w2} />
        <line x1="4" y1="50" x2="28" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="96" y1="50" x2="72" y2="50" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="4" x2="35" y2="28" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="4" x2="65" y2="28" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="96" x2="35" y2="72" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="96" x2="65" y2="72" stroke={c2} strokeWidth={w2} />
        <line x1="4" y1="50" x2="28" y2="35" stroke={c2} strokeWidth={w2} />
        <line x1="4" y1="50" x2="28" y2="65" stroke={c2} strokeWidth={w2} />
        <line x1="96" y1="50" x2="72" y2="35" stroke={c2} strokeWidth={w2} />
        <line x1="96" y1="50" x2="72" y2="65" stroke={c2} strokeWidth={w2} />
      </svg>
    ),

    // ═══ MARQUISE — navette brilliant ═══
    marquise: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path d="M50 2 C72 2, 96 30, 96 50 C96 70, 72 98, 50 98 C28 98, 4 70, 4 50 C4 30, 28 2, 50 2Z" stroke={c} strokeWidth={w} fill="none" />
        <ellipse cx="50" cy="50" rx="20" ry="32" stroke={c} strokeWidth={w} fill="none" />
        {/* Tips to table */}
        <line x1="50" y1="2" x2="42" y2="18" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="2" x2="58" y2="18" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="98" x2="42" y2="82" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="98" x2="58" y2="82" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="2" x2="50" y2="18" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="98" x2="50" y2="82" stroke={c2} strokeWidth={w2} />
        {/* Sides */}
        <line x1="4" y1="50" x2="30" y2="42" stroke={c} strokeWidth={w2} />
        <line x1="4" y1="50" x2="30" y2="58" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="50" x2="70" y2="42" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="50" x2="70" y2="58" stroke={c} strokeWidth={w2} />
        {/* Diagonals */}
        <line x1="18" y1="22" x2="42" y2="18" stroke={c2} strokeWidth={w2} />
        <line x1="18" y1="22" x2="30" y2="42" stroke={c2} strokeWidth={w2} />
        <line x1="82" y1="22" x2="58" y2="18" stroke={c2} strokeWidth={w2} />
        <line x1="82" y1="22" x2="70" y2="42" stroke={c2} strokeWidth={w2} />
        <line x1="18" y1="78" x2="42" y2="82" stroke={c2} strokeWidth={w2} />
        <line x1="18" y1="78" x2="30" y2="58" stroke={c2} strokeWidth={w2} />
        <line x1="82" y1="78" x2="58" y2="82" stroke={c2} strokeWidth={w2} />
        <line x1="82" y1="78" x2="70" y2="58" stroke={c2} strokeWidth={w2} />
      </svg>
    ),

    // ═══ PEAR — teardrop brilliant ═══
    pear: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path d="M50 4 C70 4, 94 28, 94 50 C94 72, 74 96, 50 98 C26 96, 6 72, 6 50 C6 28, 30 4, 50 4Z" stroke={c} strokeWidth={w} fill="none" />
        <path d="M50 22 C60 22, 72 36, 72 48 C72 60, 62 74, 50 76 C38 74, 28 60, 28 48 C28 36, 40 22, 50 22Z" stroke={c} strokeWidth={w} fill="none" />
        {/* Top point */}
        <line x1="50" y1="4" x2="42" y2="22" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="4" x2="58" y2="22" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="4" x2="50" y2="22" stroke={c2} strokeWidth={w2} />
        {/* Bottom */}
        <line x1="50" y1="98" x2="42" y2="76" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="98" x2="58" y2="76" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="98" x2="50" y2="76" stroke={c2} strokeWidth={w2} />
        {/* Sides */}
        <line x1="6" y1="50" x2="28" y2="42" stroke={c} strokeWidth={w2} />
        <line x1="6" y1="50" x2="28" y2="58" stroke={c} strokeWidth={w2} />
        <line x1="94" y1="50" x2="72" y2="42" stroke={c} strokeWidth={w2} />
        <line x1="94" y1="50" x2="72" y2="58" stroke={c} strokeWidth={w2} />
        {/* Diagonal facets */}
        <line x1="24" y1="20" x2="42" y2="22" stroke={c2} strokeWidth={w2} />
        <line x1="76" y1="20" x2="58" y2="22" stroke={c2} strokeWidth={w2} />
        <line x1="16" y1="72" x2="42" y2="76" stroke={c2} strokeWidth={w2} />
        <line x1="84" y1="72" x2="58" y2="76" stroke={c2} strokeWidth={w2} />
        <line x1="24" y1="20" x2="28" y2="42" stroke={c2} strokeWidth={w2} />
        <line x1="76" y1="20" x2="72" y2="42" stroke={c2} strokeWidth={w2} />
        <line x1="16" y1="72" x2="28" y2="58" stroke={c2} strokeWidth={w2} />
        <line x1="84" y1="72" x2="72" y2="58" stroke={c2} strokeWidth={w2} />
      </svg>
    ),

    // ═══ HEART — brilliant heart ═══
    heart: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path d="M50 96 L6 44 C0 28, 6 10, 22 8 C32 6, 42 12, 50 24 C58 12, 68 6, 78 8 C94 10, 100 28, 94 44 Z" stroke={c} strokeWidth={w} fill="none" />
        {/* Inner table */}
        <path d="M50 72 L24 44 C20 36, 24 26, 32 24 C38 22, 44 26, 50 34 C56 26, 62 22, 68 24 C76 26, 80 36, 76 44 Z" stroke={c} strokeWidth={w} fill="none" />
        {/* Cleft */}
        <line x1="50" y1="24" x2="50" y2="10" stroke={c} strokeWidth={w2} />
        {/* Top crown */}
        <line x1="22" y1="8" x2="32" y2="24" stroke={c} strokeWidth={w2} />
        <line x1="78" y1="8" x2="68" y2="24" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="10" x2="32" y2="24" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="10" x2="68" y2="24" stroke={c2} strokeWidth={w2} />
        {/* Side facets */}
        <line x1="6" y1="44" x2="24" y2="44" stroke={c} strokeWidth={w2} />
        <line x1="94" y1="44" x2="76" y2="44" stroke={c} strokeWidth={w2} />
        <line x1="6" y1="44" x2="24" y2="36" stroke={c2} strokeWidth={w2} />
        <line x1="94" y1="44" x2="76" y2="36" stroke={c2} strokeWidth={w2} />
        {/* Bottom */}
        <line x1="50" y1="96" x2="50" y2="72" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="96" x2="24" y2="50" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="96" x2="76" y2="50" stroke={c} strokeWidth={w2} />
        <line x1="16" y1="62" x2="24" y2="44" stroke={c2} strokeWidth={w2} />
        <line x1="84" y1="62" x2="76" y2="44" stroke={c2} strokeWidth={w2} />
        <line x1="16" y1="62" x2="50" y2="72" stroke={c2} strokeWidth={w2} />
        <line x1="84" y1="62" x2="50" y2="72" stroke={c2} strokeWidth={w2} />
      </svg>
    ),

    // ═══ ASSCHER — octagonal step cut ═══
    asscher: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <polygon points="22,4 78,4 96,22 96,78 78,96 22,96 4,78 4,22" stroke={c} strokeWidth={w} fill="none" />
        <polygon points="28,16 72,16 84,28 84,72 72,84 28,84 16,72 16,28" stroke={c2} strokeWidth={w2} fill="none" />
        <polygon points="34,26 66,26 74,34 74,66 66,74 34,74 26,66 26,34" stroke={c2} strokeWidth={w2} fill="none" />
        <polygon points="38,34 62,34 66,38 66,62 62,66 38,66 34,62 34,38" stroke={c} strokeWidth={w} fill="none" />
        {/* Corner lines through all steps */}
        <line x1="22" y1="4" x2="38" y2="34" stroke={c} strokeWidth={w2} />
        <line x1="78" y1="4" x2="62" y2="34" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="22" x2="66" y2="38" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="78" x2="66" y2="62" stroke={c} strokeWidth={w2} />
        <line x1="78" y1="96" x2="62" y2="66" stroke={c} strokeWidth={w2} />
        <line x1="22" y1="96" x2="38" y2="66" stroke={c} strokeWidth={w2} />
        <line x1="4" y1="78" x2="34" y2="62" stroke={c} strokeWidth={w2} />
        <line x1="4" y1="22" x2="34" y2="38" stroke={c} strokeWidth={w2} />
      </svg>
    ),

    // ═══ TRILLION — triangular brilliant ═══
    trillion: (
      <svg width={size} height={size} viewBox="0 0 100 100">
        <path d="M50 4 L96 88 C96 94, 92 96, 88 96 L12 96 C8 96, 4 94, 4 88 Z" stroke={c} strokeWidth={w} fill="none" />
        {/* Table triangle */}
        <polygon points="50,30 72,72 28,72" stroke={c} strokeWidth={w} fill="none" />
        {/* Top */}
        <line x1="50" y1="4" x2="50" y2="30" stroke={c} strokeWidth={w2} />
        <line x1="50" y1="4" x2="38" y2="30" stroke={c2} strokeWidth={w2} />
        <line x1="50" y1="4" x2="62" y2="30" stroke={c2} strokeWidth={w2} />
        {/* Bottom-left */}
        <line x1="4" y1="90" x2="28" y2="72" stroke={c} strokeWidth={w2} />
        <line x1="4" y1="90" x2="40" y2="72" stroke={c2} strokeWidth={w2} />
        <line x1="4" y1="90" x2="28" y2="58" stroke={c2} strokeWidth={w2} />
        {/* Bottom-right */}
        <line x1="96" y1="90" x2="72" y2="72" stroke={c} strokeWidth={w2} />
        <line x1="96" y1="90" x2="60" y2="72" stroke={c2} strokeWidth={w2} />
        <line x1="96" y1="90" x2="72" y2="58" stroke={c2} strokeWidth={w2} />
        {/* Side facets */}
        <line x1="22" y1="40" x2="38" y2="30" stroke={c2} strokeWidth={w2} />
        <line x1="22" y1="40" x2="28" y2="58" stroke={c2} strokeWidth={w2} />
        <line x1="78" y1="40" x2="62" y2="30" stroke={c2} strokeWidth={w2} />
        <line x1="78" y1="40" x2="72" y2="58" stroke={c2} strokeWidth={w2} />
        {/* Bottom line */}
        <line x1="20" y1="96" x2="50" y2="72" stroke={c2} strokeWidth={w2} />
        <line x1="80" y1="96" x2="50" y2="72" stroke={c2} strokeWidth={w2} />
      </svg>
    ),
  }

  return shapes[shape] || shapes.round
}

export default ShapeSVG
