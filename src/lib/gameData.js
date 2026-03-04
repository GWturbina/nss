// ===== LEVELS DATA — единственный источник правды =====
// Админка меняет этот массив. Все компоненты читают отсюда.

export const LEVELS = [
  { id:0, name:'Руки', sub:'Тёмная пещера', emoji:'🤲', nstPerTap:0.1,
    price:'Бесплатно', bnb:0, color:'#94a3b8', themeClass:'theme-0',
    thought:'Как тяжело рыть руками... Вот бы лопату!', thoughtColor:'gold', thoughtIcon:'💡',
    desc:'Без регистрации. Камни испаряются через 30 мин!',
    earn:'Испаряются!', team:0, nstBonus:0, cgtBonus:0, gwtBonus:0 },
  { id:1, name:'Лопата', sub:'Песчаная пещера', emoji:'⛏', nstPerTap:0.4,
    price:'0.0015 BNB', bnb:0.0015, color:'#C9903A', themeClass:'theme-1',
    thought:'Лопата помогает, но песок мешает... Нужно сито!', thoughtColor:'green', thoughtIcon:'💡',
    desc:'Первый инструмент. Токены сохраняются навсегда.',
    earn:'2 партнёра × 60% = 0.0018 BNB (~$1.2)', team:2, nstBonus:50, cgtBonus:5, gwtBonus:5 },
  { id:2, name:'Сито', sub:'Речное дно', emoji:'🪣', nstPerTap:0.6,
    price:'0.003 BNB', bnb:0.003, color:'#B8860B', themeClass:'theme-2',
    thought:'Наконец камни видно! Но тяжело носить... Нужна тачка!', thoughtColor:'green', thoughtIcon:'🔍',
    desc:'Фильтруй породу. Находи скрытые камни.',
    earn:'4 партнёра × 60% = 0.0072 BNB (~$4.8)', team:4, nstBonus:100, cgtBonus:5, gwtBonus:5 },
  { id:3, name:'Тачка', sub:'Каменный карьер', emoji:'🛒', nstPerTap:1.0,
    price:'0.006 BNB', bnb:0.006, color:'#CD7F32', themeClass:'theme-3',
    thought:'Столько камней! Одному не справиться... Нужна автоматизация!', thoughtColor:'gold', thoughtIcon:'💪',
    desc:'Командная работа. 8 мест в структуре.',
    earn:'8 партнёров × 50% = 0.024 BNB', team:8, nstBonus:200, cgtBonus:10, gwtBonus:10 },
  { id:4, name:'Авто-Шахта', sub:'Механический зал', emoji:'⚙️', nstPerTap:1.5,
    price:'0.012 BNB', bnb:0.012, color:'#E5A600', themeClass:'theme-4',
    thought:'Машины работают за меня! Если огранить камни — они дороже!', thoughtColor:'gold', thoughtIcon:'🔥',
    desc:'🔥 ПОВОРОТНЫЙ МОМЕНТ! Автоматизация клубом.',
    earn:'16 партнёров × 50% = 0.096 BNB', team:16, nstBonus:400, cgtBonus:15, gwtBonus:15 },
  { id:5, name:'Огранка', sub:'Мастерская', emoji:'💎', nstPerTap:2.0,
    price:'0.024 BNB', bnb:0.024, color:'#10B981', themeClass:'theme-5',
    thought:'Огранённый камень в 5 раз дороже! А если украшение...?', thoughtColor:'green', thoughtIcon:'✨',
    desc:'+40% к стоимости камней. Токенизация.',
    earn:'32 партнёра × 50% = 0.384 BNB', team:32, nstBonus:800, cgtBonus:35, gwtBonus:35 },
  { id:6, name:'Ювелирка', sub:'Золотая кузня', emoji:'💍', nstPerTap:3.0,
    price:'0.048 BNB', bnb:0.048, color:'#E11D48', themeClass:'theme-6',
    thought:'Мои украшения покупают! 5 источников дохода!', thoughtColor:'ruby', thoughtIcon:'💍',
    desc:'Ювелирное производство. 5 источников дохода.',
    earn:'64 партнёра × 50% = 1.536 BNB', team:64, nstBonus:1500, cgtBonus:75, gwtBonus:75 },
  { id:7, name:'Метры²', sub:'Архитектурное бюро', emoji:'🏗', nstPerTap:4.0,
    price:'0.096 BNB', bnb:0.096, color:'#3B82F6', themeClass:'theme-7',
    thought:'Квадратные метры — самая надёжная инвестиция!', thoughtColor:'blue', thoughtIcon:'📐',
    desc:'Инвестиции в м². P2P торговля CGT/GWT.',
    earn:'128 партнёров × 50% = 6.144 BNB', team:128, nstBonus:3000, cgtBonus:150, gwtBonus:150 },
  { id:8, name:'Стройка', sub:'Строительная площадка', emoji:'🏗️', nstPerTap:6.0,
    price:'0.192 BNB', bnb:0.192, color:'#F97316', themeClass:'theme-8',
    thought:'Из виртуального — в реальный! Мой первый дом близко!', thoughtColor:'gold', thoughtIcon:'🏗️',
    desc:'256 партнёров. Реальные активы.',
    earn:'256 партнёров × 50% = 24.576 BNB', team:256, nstBonus:6000, cgtBonus:300, gwtBonus:300 },
  { id:9, name:'Свой Дом', sub:'Земельный участок', emoji:'🏠', nstPerTap:8.0,
    price:'0.384 BNB', bnb:0.384, color:'#A855F7', themeClass:'theme-9',
    thought:'35% накоплено! Клуб добавляет 65% под 0%!', thoughtColor:'green', thoughtIcon:'🏠',
    desc:'🏠 35%+65% клуба. Дом в любой стране под 0%.',
    earn:'512 партнёров = ~100 BNB', team:512, nstBonus:12000, cgtBonus:600, gwtBonus:600 },
  { id:10, name:'Посёлок', sub:'Панорама долины', emoji:'🏘', nstPerTap:12.0,
    price:'0.768 BNB', bnb:0.768, color:'#67E8F9', themeClass:'theme-10',
    thought:'Четверть миллиона! 1000+ партнёров!', thoughtColor:'blue', thoughtIcon:'🏘',
    desc:'Мэр посёлка. Пенсия активирована!',
    earn:'1024 партнёра = ~300 BNB', team:1024, nstBonus:25000, cgtBonus:1200, gwtBonus:1200 },
  { id:11, name:'Пансионат', sub:'Горный курорт', emoji:'🏨', nstPerTap:16.0,
    price:'1.536 BNB', bnb:1.536, color:'#EC4899', themeClass:'theme-11',
    thought:'Клуб Миллионеров! Туризм, гостиницы!', thoughtColor:'ruby', thoughtIcon:'👑',
    desc:'👑 Клуб Миллионеров! $1,000,000+.',
    earn:'2048 партнёров = ~1,500 BNB (~$1M)', team:2048, nstBonus:50000, cgtBonus:2400, gwtBonus:2400 },
  { id:12, name:'Империя', sub:'Тронный зал', emoji:'👑', nstPerTap:25.0,
    price:'3.072 BNB', bnb:3.072, color:'#FFD700', themeClass:'theme-12',
    thought:'От одного тапа — до Империи! 15 источников. Пенсия 10 BNB/мес!', thoughtColor:'gold', thoughtIcon:'🏰',
    desc:'🏰 Почётный Магнат. Пенсия ПОЖИЗНЕННО.',
    earn:'4096 партнёров = ~6,100 BNB (~$4M+)', team:4096, nstBonus:100000, cgtBonus:4500, gwtBonus:4500 },
];

// ═══════════════════════════════════════════════════
// ФОНЫ ДЛЯ ЗОНЫ ТАПАНИЯ — по уровням
// Картинки: /icons/backgrounds/levels/{filename}
// Размер: 860×800px (2x retina), JPG, quality 80%
// ═══════════════════════════════════════════════════
export const LEVEL_BACKGROUNDS = [
  { file: 'bg-hands.jpg',    overlay: 'rgba(15,15,30,0.55)',  glow: 'rgba(148,163,184,0.08)' },  // 0  Тёмная пещера
  { file: 'bg-shovel.jpg',   overlay: 'rgba(30,20,10,0.50)',  glow: 'rgba(201,144,58,0.15)'  },  // 1  Песчаная пещера
  { file: 'bg-sieve.jpg',    overlay: 'rgba(20,18,5,0.50)',   glow: 'rgba(184,134,11,0.15)'  },  // 2  Речное дно
  { file: 'bg-cart.jpg',     overlay: 'rgba(25,15,8,0.45)',   glow: 'rgba(205,127,50,0.18)'  },  // 3  Каменный карьер
  { file: 'bg-auto.jpg',     overlay: 'rgba(25,20,0,0.45)',   glow: 'rgba(229,166,0,0.20)'   },  // 4  Механический зал
  { file: 'bg-cutting.jpg',  overlay: 'rgba(5,20,15,0.45)',   glow: 'rgba(16,185,129,0.22)'  },  // 5  Мастерская
  { file: 'bg-jewelry.jpg',  overlay: 'rgba(25,5,10,0.40)',   glow: 'rgba(225,29,72,0.22)'   },  // 6  Золотая кузня
  { file: 'bg-building.jpg', overlay: 'rgba(8,12,30,0.40)',   glow: 'rgba(59,130,246,0.22)'  },  // 7  Архитектурное бюро
  { file: 'bg-earth.jpg',    overlay: 'rgba(25,12,3,0.40)',   glow: 'rgba(249,115,22,0.22)'  },  // 8  Стройплощадка
  { file: 'bg-house.jpg',    overlay: 'rgba(15,5,25,0.40)',   glow: 'rgba(168,85,247,0.25)'  },  // 9  Земельный участок
  { file: 'bg-village.jpg',  overlay: 'rgba(5,18,22,0.35)',   glow: 'rgba(103,232,249,0.25)' },  // 10 Панорама долины
  { file: 'bg-resort.jpg',   overlay: 'rgba(20,5,18,0.35)',   glow: 'rgba(236,72,153,0.25)'  },  // 11 Горный курорт
  { file: 'bg-empire.jpg',   overlay: 'rgba(20,15,0,0.30)',   glow: 'rgba(255,215,0,0.35)'   },  // 12 Тронный зал
];

// ═══════════════════════════════════════════════════
// img: /images/gems/{img} — PNG файлы
// Пока img нет — показывается SVG заглушка по svgType
// ═══════════════════════════════════════════════════
export const GEMS = [
  // === ДОСТУПНЫЕ (от $50) ===
  { id:0, name:'Агат',      section:'gems', category:'budget',  price:50,   supplierCost:25,   carat:'8.0', origin:'Бразилия',  grade:'Полосатый A',    cert:'NSS', stakingAPR:12, svgType:'agate',
    img:'agate.png',         desc:'Натуральный полосатый агат. Идеален для начала коллекции.',  active:true },
  { id:1, name:'Цитрин',    section:'gems', category:'budget',  price:120,  supplierCost:60,   carat:'4.5', origin:'Бразилия',  grade:'Golden AA',      cert:'NSS', stakingAPR:12, svgType:'citrine',
    img:'citrine.png',       desc:'Солнечный камень. Символ богатства и успеха.',               active:true },
  { id:2, name:'Гранат',    section:'gems', category:'budget',  price:200,  supplierCost:100,  carat:'3.2', origin:'Мозамбик',  grade:'Deep Red A',     cert:'NSS', stakingAPR:14, svgType:'garnet',
    img:'garnet.png',        desc:'Огненный гранат. Камень страсти и энергии.',                 active:true },
  { id:3, name:'Топаз',     section:'gems', category:'budget',  price:350,  supplierCost:175,  carat:'6.1', origin:'Бразилия',  grade:'Swiss Blue AA',  cert:'GIA', stakingAPR:14, svgType:'topaz',
    img:'topaz.png',         desc:'Голубой топаз высшего качества. Инвестиционный камень.',     active:true },
  { id:4, name:'Перидот',   section:'gems', category:'budget',  price:500,  supplierCost:250,  carat:'3.8', origin:'Пакистан',  grade:'Vivid Green A',  cert:'GIA', stakingAPR:15, svgType:'peridot',
    img:'peridot.png',       desc:'Яркий зелёный перидот. Редкий и красивый.',                  active:true },
  // === СРЕДНИЕ ($800-$3200) ===
  { id:5, name:'Аметист',   section:'gems', category:'mid',     price:800,  supplierCost:400,  carat:'5.3', origin:'Бразилия',  grade:'Deep Purple',    cert:'GIA', stakingAPR:16, svgType:'amethyst',
    img:'amethyst.png',      desc:'Глубокий фиолетовый. Королевский камень.',                   active:false },
  { id:6, name:'Аквамарин', section:'gems', category:'mid',     price:1500, supplierCost:750,  carat:'4.2', origin:'Бразилия',  grade:'Santa Maria AA', cert:'GIA', stakingAPR:18, svgType:'aquamarine',
    img:'aquamarine.png',    desc:'Редкий Santa Maria. Цвет океана.',                           active:false },
  { id:7, name:'Рубин',     section:'gems', category:'mid',     price:3200, supplierCost:1600, carat:'1.2', origin:'Мьянма',    grade:'Pigeon Blood',   cert:'GIA', stakingAPR:20, svgType:'ruby',
    img:'ruby.png',          desc:'Легендарный Pigeon Blood. Король камней.',                   active:true },
  // === ПРЕМИУМ ($4500+) ===
  { id:8, name:'Сапфир',    section:'gems', category:'premium', price:4500, supplierCost:2250, carat:'1.8', origin:'Шри-Ланка', grade:'Royal Blue',     cert:'GIA', stakingAPR:22, svgType:'sapphire',
    img:'sapphire.png',      desc:'Цейлонский Royal Blue. Камень мудрости.',                    active:true },
  { id:9, name:'Изумруд',   section:'gems', category:'premium', price:5800, supplierCost:2900, carat:'2.1', origin:'Колумбия',  grade:'Vivid Green',    cert:'GRS', stakingAPR:24, svgType:'emerald',
    img:'emerald.png',       desc:'Колумбийский Vivid. Самый ценный зелёный камень.',           active:true },
  { id:10,name:'Танзанит',  section:'gems', category:'premium', price:6200, supplierCost:3100, carat:'3.0', origin:'Танзания',  grade:'AAA Vivid',      cert:'GRS', stakingAPR:24, svgType:'tanzanite',
    img:'tanzanite.png',     desc:'Исчезающий камень. Добывается только в одном месте на Земле.',active:false },
];

// ═══════════════════════════════════════════════════
// МЕТАЛЛЫ — отдельная секция, пока БЕЗ контракта (будущий раздел)
// Показываются в интерфейсе, покупка через P2PEscrow или отдельный контракт
// ═══════════════════════════════════════════════════
export const METALS = [
  // Золото
  { id:100, name:'Золото 999',    section:'metals', category:'gold',   price:95,   unit:'1г',   purity:'999', img:'gold_bar.png',
    desc:'Инвестиционное золото 999 пробы. 1 грамм. Выкуп лома по рыночной цене.',    active:true,  stakingAPR:8 },
  { id:101, name:'Золото 585',    section:'metals', category:'gold',   price:52,   unit:'1г',   purity:'585', img:'gold_585.png',
    desc:'Ювелирное золото 585 пробы. 1 грамм. Идеально для ювелиров клуба.',         active:true,  stakingAPR:7 },
  { id:102, name:'Золотой Слиток',section:'metals', category:'gold',   price:4750, unit:'50г',  purity:'999', img:'gold_ingot.png',
    desc:'50-граммовый слиток золота 999. Сертифицированный. Хранение в клубе.',      active:false, stakingAPR:9 },
  // Серебро
  { id:110, name:'Серебро 999',   section:'metals', category:'silver', price:1.1,  unit:'1г',   purity:'999', img:'silver_bar.png',
    desc:'Инвестиционное серебро 999 пробы. 1 грамм.',                                active:true,  stakingAPR:6 },
  { id:111, name:'Серебро 925',   section:'metals', category:'silver', price:0.85, unit:'1г',   purity:'925', img:'silver_925.png',
    desc:'Стерлинговое серебро 925. Ювелирное качество.',                             active:true,  stakingAPR:6 },
  { id:112, name:'Серебряный Лот',section:'metals', category:'silver', price:110,  unit:'100г', purity:'999', img:'silver_lot.png',
    desc:'100 грамм серебра 999 пробы оптом. Выгодная цена.',                         active:false, stakingAPR:7 },
  // Лом
  { id:120, name:'Лом Золота',    section:'metals', category:'scrap',  price:45,   unit:'1г',   purity:'~585',img:'gold_scrap.png',
    desc:'Принимаем золотой лом. Оценка и выкуп. Перерабатываем для ювелиров клуба.',active:true,  stakingAPR:0 },
  { id:121, name:'Лом Серебра',   section:'metals', category:'scrap',  price:0.7,  unit:'1г',   purity:'~925',img:'silver_scrap.png',
    desc:'Принимаем серебряный лом. Честная оценка.',                                 active:true,  stakingAPR:0 },
];

// ═══════════════════════════════════════════════════
// ЭКОНОМИКА КАМНЕЙ — меняется только через Админку
// BP = базисные пункты: 10000 = 100%
// ═══════════════════════════════════════════════════
export const GEM_ECONOMICS = {
  // Распределение при покупке камня
  supplierCut:       7000,  // 70% — закупочная стоимость камня
  sponsorCut:        1000,  // 10% — спонсору (реферальный маркетинг)
  stakingFund:       1000,  // 10% — фонд стейкинга (платит % владельцам)
  platformCut:       1000,  // 10% — операционные расходы платформы

  // Скидки клуба
  baseDiscountBP:    3000,  // 30% — базовая клубная скидка (все зарегистрированные)
  maxDiscountBP:     4000,  // 40% — максимальная скидка (30% + 10% NST бонус)
  maxNstBonusBP:     1000,  // 10% — максимальный бонус за NST
  nstPerPercent:     1000,  // 1000 NST = +1% к скидке (нужно 10,000 NST для макс)

  // Стейкинг
  stakingLockMonths: 6,     // Заморозка в месяцах
  stakingMinAPR:     12,    // Мин % годовых
  stakingMaxAPR:     24,    // Макс % годовых
};

// ═══════════════════════════════════════════════════
// ЭКОНОМИКА МЕТАЛЛОВ
// ═══════════════════════════════════════════════════
export const METAL_ECONOMICS = {
  buyupSpread:       500,   // 5% — наша наценка при покупке у нас
  sellSpread:        300,   // 3% — скидка при продаже нам (лом)
  sponsorCut:        800,   // 8% — спонсору
  platformCut:       700,   // 7% — платформа
  stakingFund:       500,   // 5% — фонд хранения
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
