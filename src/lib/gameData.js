// ===== LEVELS DATA — единственный источник правды =====
// Club House — путь от бездомного к застройщику
// Токен CHT (Club House Token) — отображаемое имя для NSTToken

export const LEVELS = [
  { id:0, name:'Бездомный', sub:'Улица', emoji:'🏚', nstPerTap:0.3,
    price:'Бесплатно', bnb:0, color:'#94a3b8', themeClass:'theme-0',
    thought:'Холодно на улице... Начни табать — заработай свой первый угол!', thoughtColor:'gold', thoughtIcon:'💡',
    desc:'Без регистрации. Токены испаряются через 30 мин!',
    earn:'Испаряются!', team:0, nstBonus:0, cgtBonus:0, gwtBonus:0 },
  { id:1, name:'Уголок', sub:'Общежитие', emoji:'🛏', nstPerTap:0.4,
    price:'0.0015 BNB', bnb:0.0015, color:'#C9903A', themeClass:'theme-1',
    thought:'Есть угол — уже не на улице! Но хочется нормальную кровать...', thoughtColor:'green', thoughtIcon:'💡',
    desc:'Твой первый угол. Токены сохраняются навсегда.',
    earn:'2 партнёра × 60% = 0.0018 BNB (~$1.2)', team:2, nstBonus:50, cgtBonus:5, gwtBonus:5 },
  { id:2, name:'Кровать', sub:'Комната', emoji:'🛋', nstPerTap:0.4,
    price:'0.003 BNB', bnb:0.003, color:'#B8860B', themeClass:'theme-2',
    thought:'Спать удобно! Но одежду некуда складывать... Нужен шкаф!', thoughtColor:'green', thoughtIcon:'🔍',
    desc:'Своя кровать — своё место. Приглашай соседей!',
    earn:'4 партнёра × 60% = 0.0072 BNB (~$4.8)', team:4, nstBonus:100, cgtBonus:5, gwtBonus:5 },
  { id:3, name:'Шкаф', sub:'Уютный угол', emoji:'👔', nstPerTap:0.5,
    price:'0.006 BNB', bnb:0.006, color:'#CD7F32', themeClass:'theme-3',
    thought:'Порядок! Но готовить негде... Без кухни — не жизнь!', thoughtColor:'gold', thoughtIcon:'💪',
    desc:'Одежда на месте. Команда растёт — 8 мест.',
    earn:'8 партнёров × 50% = 0.024 BNB', team:8, nstBonus:200, cgtBonus:10, gwtBonus:10 },
  { id:4, name:'Кухня', sub:'Полноценный быт', emoji:'🍳', nstPerTap:0.5,
    price:'0.012 BNB', bnb:0.012, color:'#E5A600', themeClass:'theme-4',
    thought:'Своя кухня! Но это всё ещё чужие стены... Пора снимать квартиру!', thoughtColor:'gold', thoughtIcon:'🔥',
    desc:'🔥 Полноценный быт! Натабай токенов — покупай уровни!',
    earn:'16 партнёров × 50% = 0.096 BNB', team:16, nstBonus:400, cgtBonus:15, gwtBonus:15 },
  { id:5, name:'Однушка', sub:'Своя квартира', emoji:'🏠', nstPerTap:0.6,
    price:'0.024 BNB', bnb:0.024, color:'#10B981', themeClass:'theme-5',
    thought:'Своя однушка — всё для жизни! Но сколько уходит на аренду... Пора копить на ДОМ!', thoughtColor:'green', thoughtIcon:'✨',
    desc:'Снял квартиру! Посчитай — аренда + коммуналка = твой метр².',
    earn:'32 партнёра × 50% = 0.384 BNB', team:32, nstBonus:800, cgtBonus:35, gwtBonus:35 },
  { id:6, name:'Метр²', sub:'Первая инвестиция', emoji:'📐', nstPerTap:0.6,
    price:'0.048 BNB', bnb:0.048, color:'#E11D48', themeClass:'theme-6',
    thought:'Первый метр² куплен! Каждый следующий — ближе к своему дому!', thoughtColor:'ruby', thoughtIcon:'📐',
    desc:'Начни копить на свой дом. Купи первый метр²!',
    earn:'64 партнёра × 50% = 1.536 BNB', team:64, nstBonus:1500, cgtBonus:75, gwtBonus:75 },
  { id:7, name:'Стройка 55%', sub:'Фундамент', emoji:'🏗', nstPerTap:0.7,
    price:'0.096 BNB', bnb:0.096, color:'#3B82F6', themeClass:'theme-7',
    thought:'Заработал 45%! Клуб добавляет 55% под 0%! Сжигай CHT — снизь порог!', thoughtColor:'blue', thoughtIcon:'🏗',
    desc:'Получи займ 55%! Сжигай CHT чтобы увеличить до 65%.',
    earn:'128 партнёров × 50% = 6.144 BNB', team:128, nstBonus:3000, cgtBonus:150, gwtBonus:150 },
  { id:8, name:'Стройка 65%', sub:'Стены растут', emoji:'🏗️', nstPerTap:0.7,
    price:'0.192 BNB', bnb:0.192, color:'#F97316', themeClass:'theme-8',
    thought:'65% от клуба! Осталось 35% — а CHT помогли снизить порог!', thoughtColor:'gold', thoughtIcon:'🏗️',
    desc:'Максимальный займ 65% под 0%. Твой дом строится!',
    earn:'256 партнёров × 50% = 24.576 BNB', team:256, nstBonus:6000, cgtBonus:300, gwtBonus:300 },
  { id:9, name:'Владелец', sub:'Свой дом', emoji:'🔑', nstPerTap:0.8,
    price:'0.384 BNB', bnb:0.384, color:'#A855F7', themeClass:'theme-9',
    thought:'🔑 Ключи в руках! Ты — владелец дома! Время строить бизнес!', thoughtColor:'green', thoughtIcon:'🔑',
    desc:'🏠 Свой дом! Теперь — построй бизнес.',
    earn:'512 партнёров = ~100 BNB', team:512, nstBonus:12000, cgtBonus:600, gwtBonus:600 },
  { id:10, name:'Бизнес', sub:'Предприниматель', emoji:'🏨', nstPerTap:0.8,
    price:'0.768 BNB', bnb:0.768, color:'#67E8F9', themeClass:'theme-10',
    thought:'Бизнес запущен! Туризм, медтуризм, экотуризм — выбирай направление!', thoughtColor:'blue', thoughtIcon:'🏨',
    desc:'Выбери направление: туризм, медтуризм, экотуризм, круизы.',
    earn:'1024 партнёра = ~300 BNB', team:1024, nstBonus:25000, cgtBonus:1200, gwtBonus:1200 },
  { id:11, name:'Посёлок', sub:'Застройщик', emoji:'🏘', nstPerTap:0.9,
    price:'1.536 BNB', bnb:1.536, color:'#EC4899', themeClass:'theme-11',
    thought:'Свой посёлок! Клубные дома, инфраструктура, управление!', thoughtColor:'ruby', thoughtIcon:'👑',
    desc:'👑 Построй свой посёлок. Клубные дома — твой актив.',
    earn:'2048 партнёров = ~1,500 BNB (~$1M)', team:2048, nstBonus:50000, cgtBonus:2400, gwtBonus:2400 },
  { id:12, name:'Город', sub:'Магнат', emoji:'🏙', nstPerTap:1.0,
    price:'3.072 BNB', bnb:3.072, color:'#FFD700', themeClass:'theme-12',
    thought:'Свой город! Производство, бизнесы, банк — Империя построена!', thoughtColor:'gold', thoughtIcon:'🏰',
    desc:'🏰 Свой городок. Производство, бизнесы. Пенсия ПОЖИЗНЕННО.',
    earn:'4096 партнёров = ~6,100 BNB (~$4M+)', team:4096, nstBonus:100000, cgtBonus:4500, gwtBonus:4500 },
];

// ═══════════════════════════════════════════════════
// ФОНЫ ДЛЯ ЗОНЫ ТАПАНИЯ — по уровням
// Картинки: /icons/backgrounds/levels/{filename}
// Размер: 860×800px (2x retina), JPG, quality 80%
// ═══════════════════════════════════════════════════
export const LEVEL_BACKGROUNDS = [
  { file: 'bg-homeless.jpg',  overlay: 'rgba(15,15,30,0.55)',  glow: 'rgba(148,163,184,0.08)' },  // 0  Улица
  { file: 'bg-corner.jpg',   overlay: 'rgba(30,20,10,0.50)',  glow: 'rgba(201,144,58,0.15)'  },  // 1  Общежитие
  { file: 'bg-bed.jpg',      overlay: 'rgba(20,18,5,0.50)',   glow: 'rgba(184,134,11,0.15)'  },  // 2  Комната
  { file: 'bg-closet.jpg',   overlay: 'rgba(25,15,8,0.45)',   glow: 'rgba(205,127,50,0.18)'  },  // 3  Уютный угол
  { file: 'bg-kitchen.jpg',  overlay: 'rgba(25,20,0,0.45)',   glow: 'rgba(229,166,0,0.20)'   },  // 4  Полноценный быт
  { file: 'bg-flat.jpg',     overlay: 'rgba(5,20,15,0.45)',   glow: 'rgba(16,185,129,0.22)'  },  // 5  Своя квартира
  { file: 'bg-sqm.jpg',      overlay: 'rgba(25,5,10,0.40)',   glow: 'rgba(225,29,72,0.22)'   },  // 6  Первая инвестиция
  { file: 'bg-build55.jpg',  overlay: 'rgba(8,12,30,0.40)',   glow: 'rgba(59,130,246,0.22)'  },  // 7  Фундамент
  { file: 'bg-build65.jpg',  overlay: 'rgba(25,12,3,0.40)',   glow: 'rgba(249,115,22,0.22)'  },  // 8  Стены растут
  { file: 'bg-house.jpg',    overlay: 'rgba(15,5,25,0.40)',   glow: 'rgba(168,85,247,0.25)'  },  // 9  Свой дом
  { file: 'bg-business.jpg', overlay: 'rgba(5,18,22,0.35)',   glow: 'rgba(103,232,249,0.25)' },  // 10 Предприниматель
  { file: 'bg-village.jpg',  overlay: 'rgba(20,5,18,0.35)',   glow: 'rgba(236,72,153,0.25)'  },  // 11 Застройщик
  { file: 'bg-city.jpg',     overlay: 'rgba(20,15,0,0.30)',   glow: 'rgba(255,215,0,0.35)'   },  // 12 Магнат
];

// ═══════════════════════════════════════════════════
// GEMS и METALS — оставлены для совместимости
// В «Метр Квадратный» камни не отображаются
// ═══════════════════════════════════════════════════
export const GEMS = [];
export const METALS = [];

// ═══════════════════════════════════════════════════
// ЭКОНОМИКА — без Diamond Club
// ═══════════════════════════════════════════════════
export const GEM_ECONOMICS = {
  supplierCut:       7000,
  sponsorCut:        1000,
  stakingFund:       1000,
  platformCut:       1000,
  baseDiscountBP:    3000,
  maxDiscountBP:     4000,
  maxNstBonusBP:     1000,
  nstPerPercent:     1000,
  stakingLockMonths: 6,
  stakingMinAPR:     12,
  stakingMaxAPR:     24,
};

export const METAL_ECONOMICS = {
  buyupSpread:       500,
  sellSpread:        300,
  sponsorCut:        800,
  platformCut:       700,
  stakingFund:       500,
};

// Три Бизнеса (м²)
export const PROJECTS = [
  { id: 0, name: 'Малый Бизнес', price: 50, priceBNB: 0.075, sqm: '1/20', sqmBP: 500, color: '#3498DB', emoji: '💼' },
  { id: 1, name: 'Средний Бизнес', price: 250, priceBNB: 0.375, sqm: '1/4', sqmBP: 2500, color: '#F39C12', emoji: '🏭' },
  { id: 2, name: 'Большой Бизнес', price: 1000, priceBNB: 1.5, sqm: '1', sqmBP: 10000, color: '#FFD700', emoji: '🏙' },
];

// Распределение (для отображения)
export const DISTRIBUTION = {
  normal: { spillover: 48, sponsor: 10, funds: 30, club: 8, author: 2, cgt: 2 },
  reinvest12: { spillover: 48, cut: 18, charity: 18, cgt_extra: 4, club: 8, author: 2, cgt: 2 },
  reinvest3: { spillover: 48, cut: 28, charity: 8, cgt_extra: 4, club: 8, author: 2, cgt: 2 },
};

export const LEADERBOARD = [
  { name:'Александр К.', avatar:'👨‍💼', level:8, nst:45230, refs:12 },
  { name:'Марина В.', avatar:'👩‍🔬', level:7, nst:38100, refs:9 },
  { name:'Дмитрий С.', avatar:'🧔', level:6, nst:27500, refs:15 },
  { name:'Елена П.', avatar:'👩‍💻', level:5, nst:19800, refs:7 },
  { name:'Игорь М.', avatar:'👨‍🚀', level:5, nst:18200, refs:11 },
  { name:'Наталья Ф.', avatar:'👩‍🎨', level:4, nst:12400, refs:6 },
  { name:'Олег Т.', avatar:'🧑‍🔧', level:4, nst:11900, refs:8 },
  { name:'Анна Б.', avatar:'👩‍🏫', level:3, nst:8700, refs:5 },
  { name:'Виктор Д.', avatar:'👨‍🌾', level:3, nst:7200, refs:4 },
  { name:'Светлана Р.', avatar:'👩‍⚕️', level:2, nst:4500, refs:3 },
];
