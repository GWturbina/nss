// ===== LEVELS DATA — единственный источник правды =====
// Админка меняет этот массив. Все компоненты читают отсюда.

export const LEVELS = [
  { id:0, name:'Руки', sub:'Тёмная пещера', emoji:'🤲', nstPerTap:0.1,
    price:'Бесплатно', bnb:0, color:'#94a3b8', themeClass:'theme-0',
    thought:'Как тяжело рыть руками... Вот бы лопату!', thoughtColor:'gold', thoughtIcon:'💡',
    desc:'Без регистрации. Камни испаряются через 30 мин!',
    earn:'Испаряются!', team:0, nstBonus:0, cgtBonus:0, gwtBonus:0 },
  { id:1, name:'Лопата', sub:'Песчаная пещера', emoji:'⛏', nstPerTap:0.4,
    price:'0.0015 BNB (~$1)', bnb:0.0015, color:'#C9903A', themeClass:'theme-1',
    thought:'Лопата помогает, но песок мешает... Нужно сито!', thoughtColor:'green', thoughtIcon:'💡',
    desc:'Первый инструмент. Токены сохраняются навсегда.',
    earn:'2 партнёра × 60% = 0.0018 BNB (~$1.2)', team:2, nstBonus:50, cgtBonus:5, gwtBonus:5 },
  { id:2, name:'Сито', sub:'Речное дно', emoji:'🪣', nstPerTap:0.6,
    price:'0.003 BNB (~$2)', bnb:0.003, color:'#B8860B', themeClass:'theme-2',
    thought:'Наконец камни видно! Но тяжело носить... Нужна тачка!', thoughtColor:'green', thoughtIcon:'🔍',
    desc:'Фильтруй породу. Находи скрытые камни.',
    earn:'4 партнёра × 60% = 0.0072 BNB (~$4.8)', team:4, nstBonus:100, cgtBonus:5, gwtBonus:5 },
  { id:3, name:'Тачка', sub:'Каменный карьер', emoji:'🛒', nstPerTap:1.0,
    price:'0.006 BNB (~$4)', bnb:0.006, color:'#CD7F32', themeClass:'theme-3',
    thought:'Столько камней! Одному не справиться... Нужна автоматизация!', thoughtColor:'gold', thoughtIcon:'💪',
    desc:'Командная работа. 8 мест в структуре.',
    earn:'8 партнёров × 50% = 0.024 BNB (~$16)', team:8, nstBonus:200, cgtBonus:10, gwtBonus:10 },
  { id:4, name:'Авто-Шахта', sub:'Механический зал', emoji:'⚙️', nstPerTap:1.5,
    price:'0.012 BNB (~$8)', bnb:0.012, color:'#E5A600', themeClass:'theme-4',
    thought:'Машины работают за меня! Если огранить камни — они дороже!', thoughtColor:'gold', thoughtIcon:'🔥',
    desc:'🔥 ПОВОРОТНЫЙ МОМЕНТ! Автоматизация клубом.',
    earn:'16 партнёров × 50% = 0.096 BNB (~$64)', team:16, nstBonus:400, cgtBonus:15, gwtBonus:15 },
  { id:5, name:'Огранка', sub:'Мастерская', emoji:'💎', nstPerTap:2.0,
    price:'0.024 BNB (~$16)', bnb:0.024, color:'#10B981', themeClass:'theme-5',
    thought:'Огранённый камень в 5 раз дороже! А если украшение...?', thoughtColor:'green', thoughtIcon:'✨',
    desc:'+40% к стоимости камней. Токенизация.',
    earn:'32 партнёра × 50% = 0.384 BNB (~$256)', team:32, nstBonus:800, cgtBonus:35, gwtBonus:35 },
  { id:6, name:'Ювелирка', sub:'Золотая кузня', emoji:'💍', nstPerTap:3.0,
    price:'0.048 BNB (~$32)', bnb:0.048, color:'#E11D48', themeClass:'theme-6',
    thought:'Мои украшения покупают! 5 источников дохода!', thoughtColor:'ruby', thoughtIcon:'💍',
    desc:'Ювелирное производство. 5 источников дохода.',
    earn:'64 партнёра × 50% = 1.536 BNB (~$1,000)', team:64, nstBonus:1500, cgtBonus:75, gwtBonus:75 },
  { id:7, name:'Метры²', sub:'Архитектурное бюро', emoji:'🏗', nstPerTap:4.0,
    price:'0.096 BNB (~$64)', bnb:0.096, color:'#3B82F6', themeClass:'theme-7',
    thought:'Квадратные метры — самая надёжная инвестиция!', thoughtColor:'blue', thoughtIcon:'📐',
    desc:'Инвестиции в м². P2P торговля CGT/GWT.',
    earn:'128 партнёров × 50% = 6.144 BNB (~$4,000)', team:128, nstBonus:3000, cgtBonus:150, gwtBonus:150 },
  { id:8, name:'Стройка', sub:'Строительная площадка', emoji:'🏗️', nstPerTap:6.0,
    price:'0.192 BNB (~$128)', bnb:0.192, color:'#F97316', themeClass:'theme-8',
    thought:'Из виртуального — в реальный! Мой первый дом близко!', thoughtColor:'gold', thoughtIcon:'🏗️',
    desc:'256 партнёров. Реальные активы.',
    earn:'256 партнёров × 50% = 24.576 BNB (~$16,000)', team:256, nstBonus:6000, cgtBonus:300, gwtBonus:300 },
  { id:9, name:'Свой Дом', sub:'Земельный участок', emoji:'🏠', nstPerTap:8.0,
    price:'0.384 BNB (~$256)', bnb:0.384, color:'#A855F7', themeClass:'theme-9',
    thought:'35% накоплено! Клуб добавляет 65% под 0%!', thoughtColor:'green', thoughtIcon:'🏠',
    desc:'🏠 35%+65% клуба. Дом в любой стране под 0%.',
    earn:'512 партнёров = ~100 BNB (~$65,000)', team:512, nstBonus:12000, cgtBonus:600, gwtBonus:600 },
  { id:10, name:'Посёлок', sub:'Панорама долины', emoji:'🏘', nstPerTap:12.0,
    price:'0.768 BNB (~$512)', bnb:0.768, color:'#67E8F9', themeClass:'theme-10',
    thought:'Четверть миллиона! 1000+ партнёров!', thoughtColor:'blue', thoughtIcon:'🏘',
    desc:'Мэр посёлка. Пенсия активирована!',
    earn:'1024 партнёра = ~300 BNB (~$200,000)', team:1024, nstBonus:25000, cgtBonus:1200, gwtBonus:1200 },
  { id:11, name:'Пансионат', sub:'Горный курорт', emoji:'🏨', nstPerTap:16.0,
    price:'1.536 BNB (~$1,000)', bnb:1.536, color:'#EC4899', themeClass:'theme-11',
    thought:'Клуб Миллионеров! Туризм, гостиницы!', thoughtColor:'ruby', thoughtIcon:'👑',
    desc:'👑 Клуб Миллионеров! $1,000,000+.',
    earn:'2048 партнёров = ~1,500 BNB (~$1M)', team:2048, nstBonus:50000, cgtBonus:2400, gwtBonus:2400 },
  { id:12, name:'Империя', sub:'Тронный зал', emoji:'👑', nstPerTap:25.0,
    price:'3.072 BNB (~$2,000)', bnb:3.072, color:'#FFD700', themeClass:'theme-12',
    thought:'От одного тапа — до Империи! 15 источников. Пенсия 10 BNB/мес!', thoughtColor:'gold', thoughtIcon:'🏰',
    desc:'🏰 Почётный Магнат. Пенсия ПОЖИЗНЕННО.',
    earn:'4096 партнёров = ~6,100 BNB (~$4M+)', team:4096, nstBonus:100000, cgtBonus:4500, gwtBonus:4500 },
];

export const GEMS = [
  // === ДОСТУПНЫЕ (от $50) ===
  { name:'Агат', category:'budget', price:50, supplierCost:25, carat:'8.0', origin:'Бразилия', grade:'Полосатый A', cert:'NSS', stakingAPR:12, svgType:'agate',
    desc:'Натуральный полосатый агат. Идеален для начала коллекции.' },
  { name:'Цитрин', category:'budget', price:120, supplierCost:60, carat:'4.5', origin:'Бразилия', grade:'Golden AA', cert:'NSS', stakingAPR:12, svgType:'citrine',
    desc:'Солнечный камень. Символ богатства и успеха.' },
  { name:'Гранат', category:'budget', price:200, supplierCost:100, carat:'3.2', origin:'Мозамбик', grade:'Deep Red A', cert:'NSS', stakingAPR:14, svgType:'garnet',
    desc:'Огненный гранат. Камень страсти и энергии.' },
  { name:'Топаз', category:'budget', price:350, supplierCost:175, carat:'6.1', origin:'Бразилия', grade:'Swiss Blue AA', cert:'GIA', stakingAPR:14, svgType:'topaz',
    desc:'Голубой топаз высшего качества. Инвестиционный камень.' },
  { name:'Перидот', category:'budget', price:500, supplierCost:250, carat:'3.8', origin:'Пакистан', grade:'Vivid Green A', cert:'GIA', stakingAPR:15, svgType:'peridot',
    desc:'Яркий зелёный перидот. Редкий и красивый.' },
  // === СРЕДНИЕ ($800-$3200) ===
  { name:'Аметист', category:'mid', price:800, supplierCost:400, carat:'5.3', origin:'Бразилия', grade:'Deep Purple', cert:'GIA', stakingAPR:16, svgType:'amethyst',
    desc:'Глубокий фиолетовый. Королевский камень.' },
  { name:'Аквамарин', category:'mid', price:1500, supplierCost:750, carat:'4.2', origin:'Бразилия', grade:'Santa Maria AA', cert:'GIA', stakingAPR:18, svgType:'aquamarine',
    desc:'Редкий Santa Maria. Цвет океана.' },
  { name:'Рубин', category:'mid', price:3200, supplierCost:1600, carat:'1.2', origin:'Мьянма', grade:'Pigeon Blood', cert:'GIA', stakingAPR:20, svgType:'ruby',
    desc:'Легендарный Pigeon Blood. Король камней.' },
  // === ПРЕМИУМ ($4500+) ===
  { name:'Сапфир', category:'premium', price:4500, supplierCost:2250, carat:'1.8', origin:'Шри-Ланка', grade:'Royal Blue', cert:'GIA', stakingAPR:22, svgType:'sapphire',
    desc:'Цейлонский Royal Blue. Камень мудрости.' },
  { name:'Изумруд', category:'premium', price:5800, supplierCost:2900, carat:'2.1', origin:'Колумбия', grade:'Vivid Green', cert:'GRS', stakingAPR:24, svgType:'emerald',
    desc:'Колумбийский Vivid. Самый ценный зелёный камень.' },
  { name:'Танзанит', category:'premium', price:6200, supplierCost:3100, carat:'3.0', origin:'Танзания', grade:'AAA Vivid', cert:'GRS', stakingAPR:24, svgType:'tanzanite',
    desc:'Исчезающий камень. Добывается только в одном месте на Земле.' },
];

// Распределение денег при покупке камня (BP = базисные пункты, 10000 = 100%)
export const GEM_ECONOMICS = {
  supplierCut: 7000,   // 70% — закупка камня
  sponsorCut: 1000,    // 10% — спонсору (маркетинг, мгновенно)
  stakingFund: 1000,   // 10% — фонд стейкинга (из него платятся %)
  platformCut: 1000,   // 10% — платформа (операционные)
  baseDiscountBP: 3000,     // 30% — базовая клубная скидка
  maxDiscountBP: 4000,      // 40% — максимум скидки (с NST)
  maxNstBonusBP: 1000,      // 10% — макс доп.скидка за NST
  nstPerPercent: 1000,       // 1000 NST = +1% скидки (итого 10,000 NST = +10%)
  stakingLockMonths: 6,      // Заморозка 6 месяцев
  stakingMinAPR: 12,         // Мин % годовых (дешёвые камни)
  stakingMaxAPR: 24,         // Макс % годовых (премиум)
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