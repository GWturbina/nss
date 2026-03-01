/**
 * gemCatalog.js — Off-chain каталог бриллиантов с матрицей цен
 * 
 * АРХИТЕКТУРА:
 *   Цены хранятся в localStorage (админ устанавливает через AdminPanel)
 *   При покупке → цена передаётся в GemVaultV2.buyGem() on-chain
 *   
 * ФОРМУЛА ЦЕНЫ:
 *   basePrice (за карат по матрице) × carats × certMultiplier × clubDiscount
 *
 * МАТРИЦА ЦЕН (белые бриллианты):
 *   Строки: Clarity (IF, VVS1, VVS2, VS1, VS2, SI1, SI2)
 *   Столбцы: Color (D, E, F, G, H, I, J, K, L)
 *   Значение: цена за 1 карат в USD
 *
 * ЦВЕТНЫЕ БРИЛЛИАНТЫ:
 *   Отдельная матрица: FancyColor × Intensity × Clarity
 */

// ═══════════════════════════════════════════════════
// КОНСТАНТЫ
// ═══════════════════════════════════════════════════

export const SHAPES = [
  { id: 'round',     name: 'Круглый',      nameEn: 'Round',      nameUk: 'Круглий',      emoji: '◯' },
  { id: 'princess',  name: 'Принцесса',    nameEn: 'Princess',   nameUk: 'Принцеса',     emoji: '◇' },
  { id: 'cushion',   name: 'Кушон',        nameEn: 'Cushion',    nameUk: 'Кушон',        emoji: '▢' },
  { id: 'oval',      name: 'Овал',         nameEn: 'Oval',       nameUk: 'Овал',         emoji: '⬭' },
  { id: 'emerald',   name: 'Изумрудная',   nameEn: 'Emerald',    nameUk: 'Смарагдова',   emoji: '▭' },
  { id: 'radiant',   name: 'Радиант',      nameEn: 'Radiant',    nameUk: 'Радіант',      emoji: '◈' },
  { id: 'marquise',  name: 'Маркиз',       nameEn: 'Marquise',   nameUk: 'Маркіз',       emoji: '◊' },
  { id: 'pear',      name: 'Груша',        nameEn: 'Pear',       nameUk: 'Груша',        emoji: '◈' },
  { id: 'heart',     name: 'Сердце',       nameEn: 'Heart',      nameUk: 'Серце',        emoji: '♡' },
  { id: 'asscher',   name: 'Ашер',         nameEn: 'Asscher',    nameUk: 'Ашер',         emoji: '▣' },
  { id: 'trillion',  name: 'Треугольник',  nameEn: 'Trillion',   nameUk: 'Трикутник',    emoji: '△' },
]

export const CLARITIES = [
  { id: 'IF',   name: 'IF',   desc: 'Internally Flawless',            descRu: 'Безупречный',               tier: 1 },
  { id: 'VVS1', name: 'VVS1', desc: 'Very Very Slightly Included 1',  descRu: 'Очень-очень малые вкл. 1',  tier: 2 },
  { id: 'VVS2', name: 'VVS2', desc: 'Very Very Slightly Included 2',  descRu: 'Очень-очень малые вкл. 2',  tier: 3 },
  { id: 'VS1',  name: 'VS1',  desc: 'Very Slightly Included 1',       descRu: 'Очень малые вкл. 1',        tier: 4 },
  { id: 'VS2',  name: 'VS2',  desc: 'Very Slightly Included 2',       descRu: 'Очень малые вкл. 2',        tier: 5 },
  { id: 'SI1',  name: 'SI1',  desc: 'Slightly Included 1',            descRu: 'Малые включения 1',         tier: 6 },
  { id: 'SI2',  name: 'SI2',  desc: 'Slightly Included 2',            descRu: 'Малые включения 2',         tier: 7 },
]

export const WHITE_COLORS = [
  { id: 'D', name: 'D', desc: 'Exceptional White+',  descRu: 'Исключительно белый+', tier: 1 },
  { id: 'E', name: 'E', desc: 'Exceptional White',   descRu: 'Исключительно белый',  tier: 2 },
  { id: 'F', name: 'F', desc: 'Rare White+',         descRu: 'Редко белый+',         tier: 3 },
  { id: 'G', name: 'G', desc: 'Rare White',          descRu: 'Редко белый',          tier: 4 },
  { id: 'H', name: 'H', desc: 'White',               descRu: 'Белый',               tier: 5 },
  { id: 'I', name: 'I', desc: 'Slightly Tinted+',    descRu: 'Слегка тонированный+', tier: 6 },
  { id: 'J', name: 'J', desc: 'Slightly Tinted',     descRu: 'Слегка тонированный',  tier: 7 },
  { id: 'K', name: 'K', desc: 'Tinted+',             descRu: 'Тонированный+',        tier: 8 },
  { id: 'L', name: 'L', desc: 'Tinted',              descRu: 'Тонированный',         tier: 9 },
]

export const FANCY_COLORS = [
  { id: 'fancy_yellow',   name: 'Жёлтый',   nameEn: 'Yellow',  nameUk: 'Жовтий',     hex: '#FFD700' },
  { id: 'fancy_pink',     name: 'Розовый',   nameEn: 'Pink',    nameUk: 'Рожевий',    hex: '#FF69B4' },
  { id: 'fancy_blue',     name: 'Голубой',   nameEn: 'Blue',    nameUk: 'Блакитний',   hex: '#4169E1' },
  { id: 'fancy_green',    name: 'Зелёный',   nameEn: 'Green',   nameUk: 'Зелений',    hex: '#50C878' },
  { id: 'fancy_orange',   name: 'Оранжевый', nameEn: 'Orange',  nameUk: 'Помаранчевий', hex: '#FF8C00' },
  { id: 'fancy_brown',    name: 'Коньячный', nameEn: 'Cognac',  nameUk: 'Коньячний',   hex: '#8B4513' },
  { id: 'fancy_black',    name: 'Чёрный',    nameEn: 'Black',   nameUk: 'Чорний',     hex: '#1a1a1a' },
]

export const FANCY_INTENSITIES = [
  { id: 'faint',     name: 'Бледный',      nameEn: 'Faint',     multiplier: 0.7 },
  { id: 'light',     name: 'Светлый',      nameEn: 'Light',     multiplier: 1.0 },
  { id: 'fancy',     name: 'Фантазийный',  nameEn: 'Fancy',     multiplier: 1.8 },
  { id: 'intense',   name: 'Насыщенный',   nameEn: 'Intense',   multiplier: 3.0 },
  { id: 'vivid',     name: 'Яркий',        nameEn: 'Vivid',     multiplier: 5.0 },
  { id: 'deep',      name: 'Глубокий',     nameEn: 'Deep',      multiplier: 4.0 },
]

export const CERTIFICATES = [
  { id: 'GIA',  name: 'GIA',  desc: 'Gemological Institute of America', multiplier: 1.15 },
  { id: 'IGI',  name: 'IGI',  desc: 'International Gemological Institute', multiplier: 1.08 },
  { id: 'HRD',  name: 'HRD',  desc: 'Hoge Raad voor Diamant', multiplier: 1.06 },
  { id: 'none', name: 'Без сертификата', nameEn: 'No certificate', multiplier: 1.00 },
]

export const CARAT_RANGE = { min: 0.3, max: 10.0, step: 0.01 }

// Множитель формы (Round обычно самый дорогой)
export const SHAPE_MULTIPLIERS = {
  round: 1.00,
  princess: 0.70,
  cushion: 0.75,
  oval: 0.78,
  emerald: 0.72,
  radiant: 0.72,
  marquise: 0.68,
  pear: 0.73,
  heart: 0.75,
  asscher: 0.74,
  trillion: 0.65,
}

// ═══════════════════════════════════════════════════
// ХРАНЕНИЕ ЦЕН (localStorage)
// ═══════════════════════════════════════════════════

const STORAGE_KEY_WHITE = 'nss_diamond_prices_white'
const STORAGE_KEY_FANCY = 'nss_diamond_prices_fancy'
const STORAGE_KEY_SHAPES = 'nss_diamond_shape_multipliers'

/**
 * Дефолтная матрица цен (USD за 1 карат, Round, без сертификата)
 * Админ перезаписывает через панель
 * 
 * Строки: clarity, Столбцы: color
 * Реальные Rapaport-подобные цены (ориентировочные)
 */
const DEFAULT_WHITE_PRICES = {
  //        D       E       F       G       H       I       J       K       L
  IF:   [ 26000,  22000,  19000,  16000,  13500,  10500,   8500,   6500,   5000 ],
  VVS1: [ 18000,  15500,  13500,  11500,  10000,   8000,   6500,   5000,   4000 ],
  VVS2: [ 14000,  12000,  10500,   9200,   8000,   6500,   5200,   4200,   3400 ],
  VS1:  [ 11000,   9500,   8500,   7500,   6500,   5200,   4200,   3500,   2800 ],
  VS2:  [  9000,   8000,   7000,   6200,   5500,   4500,   3600,   3000,   2500 ],
  SI1:  [  6500,   5800,   5200,   4600,   4000,   3400,   2800,   2300,   1900 ],
  SI2:  [  4800,   4300,   3900,   3400,   3000,   2500,   2100,   1800,   1500 ],
}

/**
 * Дефолтные цены цветных бриллиантов
 * Базовая цена за карат при intensity=light, clarity=VS1
 */
const DEFAULT_FANCY_BASE_PRICES = {
  fancy_yellow:  4000,
  fancy_pink:   25000,
  fancy_blue:   40000,
  fancy_green:  15000,
  fancy_orange:  8000,
  fancy_brown:   2500,
  fancy_black:   3000,
}

// ═══════════════════════════════════════════════════
// API: ПОЛУЧЕНИЕ ЦЕН
// ═══════════════════════════════════════════════════

/**
 * Загрузить матрицу цен белых бриллиантов
 */
export function getWhitePriceMatrix() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_WHITE)
    if (saved) return JSON.parse(saved)
  } catch {}
  return DEFAULT_WHITE_PRICES
}

/**
 * Загрузить базовые цены цветных бриллиантов
 */
export function getFancyBasePrices() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FANCY)
    if (saved) return JSON.parse(saved)
  } catch {}
  return DEFAULT_FANCY_BASE_PRICES
}

/**
 * Загрузить множители форм
 */
export function getShapeMultipliers() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SHAPES)
    if (saved) return JSON.parse(saved)
  } catch {}
  return SHAPE_MULTIPLIERS
}

// ═══════════════════════════════════════════════════
// API: РАСЧЁТ ЦЕНЫ
// ═══════════════════════════════════════════════════

/**
 * Рассчитать цену белого бриллианта
 * @param {string} shape - ID формы
 * @param {string} clarity - ID чистоты (IF, VVS1...)
 * @param {string} color - ID цвета (D, E, F...)
 * @param {number} carats - каратность
 * @param {string} certId - ID сертификата (GIA, IGI, HRD, none)
 * @returns {{ marketPrice, clubPrice, discount, perCarat, details }}
 */
export function calcWhitePrice(shape, clarity, color, carats, certId = 'none') {
  const matrix = getWhitePriceMatrix()
  const shapeMult = getShapeMultipliers()

  // Базовая цена за карат (Round, без серт.)
  const colorIdx = WHITE_COLORS.findIndex(c => c.id === color)
  const clarityRow = matrix[clarity]
  if (!clarityRow || colorIdx < 0) return null

  const basePPC = clarityRow[colorIdx] // price per carat

  // Множители
  const shapeM = shapeMult[shape] || 1.0
  const cert = CERTIFICATES.find(c => c.id === certId) || CERTIFICATES[3]

  // Прогрессивная каратность: камни >1ct дорожают нелинейно
  let caratMult = 1.0
  if (carats >= 1.0) caratMult = 1.0 + (carats - 1.0) * 0.12
  if (carats >= 2.0) caratMult = 1.12 + (carats - 2.0) * 0.18
  if (carats >= 3.0) caratMult = 1.30 + (carats - 3.0) * 0.25
  if (carats >= 5.0) caratMult = 1.80 + (carats - 5.0) * 0.35

  const perCarat = Math.round(basePPC * shapeM * cert.multiplier * caratMult)
  const marketPrice = Math.round(perCarat * carats)
  const clubDiscount = 0.35 // 35% скидка клуба
  const clubPrice = Math.round(marketPrice * (1 - clubDiscount))

  return {
    marketPrice,
    clubPrice,
    discount: clubDiscount,
    perCarat,
    details: {
      basePPC,
      shapeMultiplier: shapeM,
      certMultiplier: cert.multiplier,
      caratMultiplier: caratMult,
      carats,
    }
  }
}

/**
 * Рассчитать цену цветного бриллианта
 * @param {string} shape
 * @param {string} fancyColor - ID цвета (fancy_yellow, fancy_pink...)
 * @param {string} intensity - ID интенсивности (faint, light, fancy, intense, vivid, deep)
 * @param {string} clarity
 * @param {number} carats
 * @param {string} certId
 */
export function calcFancyPrice(shape, fancyColor, intensity, clarity, carats, certId = 'none') {
  const basePrices = getFancyBasePrices()
  const shapeMult = getShapeMultipliers()

  const basePrice = basePrices[fancyColor]
  if (!basePrice) return null

  const intObj = FANCY_INTENSITIES.find(i => i.id === intensity)
  const clarityObj = CLARITIES.find(c => c.id === clarity)
  const cert = CERTIFICATES.find(c => c.id === certId) || CERTIFICATES[3]
  const shapeM = shapeMult[shape] || 1.0

  if (!intObj || !clarityObj) return null

  // Множитель чистоты для цветных (менее влияет чем для белых)
  const clarityMults = { IF: 1.3, VVS1: 1.15, VVS2: 1.08, VS1: 1.0, VS2: 0.92, SI1: 0.82, SI2: 0.72 }
  const clarityM = clarityMults[clarity] || 1.0

  // Каратный множитель (ещё агрессивнее для редких цветов)
  let caratMult = 1.0
  if (carats >= 1.0) caratMult = 1.0 + (carats - 1.0) * 0.20
  if (carats >= 2.0) caratMult = 1.20 + (carats - 2.0) * 0.30
  if (carats >= 3.0) caratMult = 1.50 + (carats - 3.0) * 0.40

  const perCarat = Math.round(basePrice * intObj.multiplier * clarityM * shapeM * cert.multiplier * caratMult)
  const marketPrice = Math.round(perCarat * carats)
  const clubDiscount = 0.35
  const clubPrice = Math.round(marketPrice * (1 - clubDiscount))

  return {
    marketPrice,
    clubPrice,
    discount: clubDiscount,
    perCarat,
    details: {
      basePrice,
      intensityMultiplier: intObj.multiplier,
      clarityMultiplier: clarityM,
      shapeMultiplier: shapeM,
      certMultiplier: cert.multiplier,
      caratMultiplier: caratMult,
      carats,
    }
  }
}

// ═══════════════════════════════════════════════════
// API: АДМИНКА (установка цен)
// ═══════════════════════════════════════════════════

/**
 * Сохранить матрицу цен белых бриллиантов
 * @param {object} matrix - { IF: [D,E,F,...], VVS1: [...], ... }
 */
export function saveWhitePriceMatrix(matrix) {
  localStorage.setItem(STORAGE_KEY_WHITE, JSON.stringify(matrix))
}

/**
 * Сохранить базовые цены цветных
 * @param {object} prices - { fancy_yellow: 4000, fancy_pink: 25000, ... }
 */
export function saveFancyBasePrices(prices) {
  localStorage.setItem(STORAGE_KEY_FANCY, JSON.stringify(prices))
}

/**
 * Сохранить множители форм
 * @param {object} multipliers - { round: 1.0, princess: 0.7, ... }
 */
export function saveShapeMultipliers(multipliers) {
  localStorage.setItem(STORAGE_KEY_SHAPES, JSON.stringify(multipliers))
}

/**
 * Сбросить все цены к дефолтным
 */
export function resetAllPrices() {
  localStorage.removeItem(STORAGE_KEY_WHITE)
  localStorage.removeItem(STORAGE_KEY_FANCY)
  localStorage.removeItem(STORAGE_KEY_SHAPES)
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════

/**
 * Форматирование цены
 */
export function formatUSD(amount) {
  if (!amount && amount !== 0) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Получить описание камня для записи в блокчейн
 */
export function gemSpecString(config) {
  if (config.type === 'white') {
    return `${config.shape}|${config.clarity}|${config.color}|${config.carats}ct|${config.cert}`
  } else {
    return `${config.shape}|${config.fancyColor}|${config.intensity}|${config.clarity}|${config.carats}ct|${config.cert}`
  }
}
