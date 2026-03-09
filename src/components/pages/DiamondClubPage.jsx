'use client'
/**
 * NSS Diamond Club v10.2 — Инвестиционный клуб
 * Полная интеграция: GemVaultV2 + DiamondP2P + InsuranceFund + TrustScore + UserBoost + ShowcaseMarket
 * MetalVault отключён (не задеплоен). P2P через DiamondP2P.
 */
import { useState, useEffect, useCallback } from 'react'
import useGameStore from '@/lib/store'
import * as DC from '@/lib/diamondContracts'
import * as DCT from '@/lib/dctContracts'
import { safeCall } from '@/lib/contracts'
import { shortAddress } from '@/lib/web3'
import ADDRESSES from '@/contracts/addresses'
import GemConfigurator from '@/components/pages/GemConfigurator'
import DeliverySection from '@/components/pages/DeliverySection'

// ═════════════════════════════════════════════════════════
// MAIN: DiamondClubTab
// ═════════════════════════════════════════════════════════
export default function DiamondClubTab() {
  const { wallet, t } = useGameStore()
  const [section, setSection] = useState('dashboard')
  const [showHelp, setShowHelp] = useState(false)

  const sections = [
    { id: 'dashboard', icon: '📊', label: t('dcDashboard') || 'Обзор' },
    { id: 'gems',      icon: '💎', label: t('dcGems') || 'Камни' },
    { id: 'metals',    icon: '🥇', label: t('dcMetals') || 'Металлы' },
    { id: 'showcase',  icon: '🏪', label: t('dcShowcase') || 'Витрина' },
    { id: 'p2p',       icon: '🤝', label: 'P2P' },
    { id: 'insurance', icon: '🛡️', label: t('dcInsurance') || 'Страховка' },
    { id: 'boost',     icon: '🚀', label: t('dcBoost') || 'Буст' },
    { id: 'dct',       icon: '🪙', label: 'DCT' },
    { id: 'heritage',  icon: '📜', label: t('dcHeritage') || 'Наследство' },
    { id: 'delivery',  icon: '📦', label: t('dcDelivery') || 'Доставка' },
  ]

  return (
    <div className="flex-1 overflow-y-auto pb-4">
      {/* Заголовок + кнопка помощи */}
      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gold-400">♦️ {t('dcTitle') || 'Diamond Club'}</h2>
          <p className="text-[11px] text-slate-500">{t('dcSubtitle') || 'Инвестиционный клуб'}</p>
        </div>
        <button onClick={() => setShowHelp(true)}
          className="w-9 h-9 rounded-full bg-blue-500/15 border border-blue-500/25 flex items-center justify-center text-blue-400 text-lg font-bold">
          ?
        </button>
      </div>

      {/* Sub-навигация */}
      <div className="grid grid-cols-5 gap-1 px-3 mt-1">
        {sections.map(s => (
          <button key={s.id} onClick={() => setSection(s.id)}
            className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
              section === s.id
                ? 'bg-gold-400/15 border-gold-400/30 text-gold-400'
                : 'border-white/8 text-slate-500'
            }`}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* Подключи кошелёк */}
      {!wallet ? (
        <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center">
          <div className="text-3xl mb-2">🔐</div>
          <div className="text-sm font-bold text-slate-300">{t('connectWallet') || 'Подключите кошелёк'}</div>
          <div className="text-[11px] text-slate-500 mt-1">{t('dcConnectHint') || 'SafePal для доступа к Diamond Club'}</div>
        </div>
      ) : (
        <>
          {section === 'dashboard' && <DashboardSection />}
          {section === 'gems' && <GemsFullSection onGoToDCT={() => setSection('dct')} />}
          {section === 'metals' && <MetalsSection />}
          {section === 'showcase' && <ShowcaseSection />}
          {section === 'p2p' && <P2PSection />}
          {section === 'insurance' && <InsuranceSection />}
          {section === 'boost' && <BoostSection />}
          {section === 'dct' && <DCTSection />}
          {section === 'heritage' && <HeritageSection />}
          {section === 'delivery' && <DeliverySection />}
        </>
      )}

      {/* Модалка инструкции */}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// HELP MODAL — Полная инструкция
// ═════════════════════════════════════════════════════════
function HelpModal({ onClose }) {
  const [tab, setTab] = useState('overview')

  const tabs = [
    { id: 'overview',   icon: '📖', label: 'Обзор' },
    { id: 'gems',       icon: '💎', label: 'Камни' },
    { id: 'staking',    icon: '⏳', label: 'Стейкинг' },
    { id: 'p2p',        icon: '🤝', label: 'P2P' },
    { id: 'showcase',   icon: '🏪', label: 'Витрина' },
    { id: 'insurance',  icon: '🛡️', label: 'Страховка' },
    { id: 'boost',      icon: '🚀', label: 'Буст' },
    { id: 'dct',        icon: '🪙', label: 'DCT' },
    { id: 'heritage',   icon: '📜', label: 'Наследство' },
  ]

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3" onClick={onClose}>
      <div className="w-full max-w-md max-h-[85vh] rounded-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ background: 'linear-gradient(180deg, #1a1a3e 0%, #0f0f2a 100%)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
          <div className="text-[14px] font-black text-gold-400">📖 Инструкция Diamond Club</div>
          <button onClick={onClose} className="text-slate-500 text-lg">✕</button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 px-3 py-2 overflow-x-auto border-b border-white/5" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)}
              className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[9px] font-bold border transition-all ${
                tab === tb.id
                  ? 'bg-gold-400/15 border-gold-400/30 text-gold-400'
                  : 'border-white/8 text-slate-500'
              }`}>
              {tb.icon} {tb.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 text-[12px] text-slate-300 leading-relaxed">

          {tab === 'overview' && (<>
            <HelpTitle emoji="♦️" text="Что такое Diamond Club?" />
            <p>NSS Diamond Club — закрытый инвестиционный клуб, позволяющий приобретать бриллианты, драгоценные камни и ювелирные изделия по клубной цене со скидкой до 35% от рыночной стоимости.</p>

            <HelpTitle emoji="🔑" text="Как начать?" />
            <HelpSteps steps={[
              'Подключите кошелёк SafePal к сети opBNB',
              'Пополните баланс USDT (BEP20)',
              'Перейдите во вкладку «Камни» и выберите камень',
              'Выберите режим: Покупка (владение) или Актив (стейкинг)',
              'Подтвердите транзакцию в кошельке',
            ]} />

            <HelpTitle emoji="💰" text="Способы заработка" />
            <HelpSteps steps={[
              'Стейкинг камней — от 50% до 75% годовых',
              'P2P торговля — перепродажа камней другим участникам',
              'Витрина — продажа реальных активов через агентов',
              'Реферальная программа — бонусы за приглашённых',
              'Буст ставки — сжигание NST для увеличения доходности',
            ]} />

            <HelpTitle emoji="🔐" text="Безопасность" />
            <p>Все средства защищены смарт-контрактами на блокчейне opBNB. Страховой фонд покрывает риски. TrustScore отслеживает репутацию каждого участника. Вывод средств с задержкой 48 часов для дополнительной безопасности.</p>
          </>)}

          {tab === 'gems' && (<>
            <HelpTitle emoji="💎" text="Покупка камней" />
            <p>Раздел «Камни» содержит конфигуратор для подбора камня и список ваших покупок с управлением.</p>

            <HelpTitle emoji="⚙️" text="Конфигуратор" />
            <HelpSteps steps={[
              'Выберите тип: Белый бриллиант или Фантазийный',
              'Укажите форму огранки (круг, принцесса, кушон и др.)',
              'Выберите чистоту (IF, VVS1, VS1 и т.д.)',
              'Укажите цвет и вес в каратах (0.3 — 10.0 ct)',
              'Выберите наличие сертификата и регион',
              'Система рассчитает рыночную и клубную цену',
            ]} />

            <HelpTitle emoji="📦" text="Режимы покупки" />
            <p><b className="text-blue-400">Покупка (PURCHASE)</b> — камень на вашем адресе. Можно конвертировать в Актив, продать на P2P или запросить доставку.</p>
            <p><b className="text-emerald-400">Актив (ASSET)</b> — камень сразу в стейкинг. Через 12 месяцев забрать прибыль, камень или рестейкнуть.</p>

            <HelpTitle emoji="🎯" text="Управление покупками" />
            <HelpSteps steps={[
              'OWNED (📦) — конвертировать в Актив или выставить на P2P',
              'STAKING (⏳) — камень в стейкинге, видна прибыль и срок',
              'READY (✅) — забрать USDT, физический камень или рестейк',
              'P2P (🏪) — выставлен на продажу другим участникам',
              'RESTAKED (🔄) — повторный стейкинг запущен',
            ]} />
          </>)}

          {tab === 'staking' && (<>
            <HelpTitle emoji="⏳" text="Как работает стейкинг" />
            <p>При покупке в режиме «Актив» камень размещается на стейкинг на 12 месяцев. Базовая ставка — 50% годовых.</p>

            <HelpTitle emoji="📈" text="Процентные ставки" />
            <div className="grid grid-cols-3 gap-1 text-[10px]">
              <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">0 NST</b><br/>50%</div>
              <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">10K</b><br/>55%</div>
              <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">30K</b><br/>60%</div>
              <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">50K</b><br/>65%</div>
              <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">80K</b><br/>70%</div>
              <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-gold-400">100K</b><br/>75%</div>
            </div>

            <HelpTitle emoji="🏁" text="По завершении стейкинга" />
            <HelpSteps steps={[
              'Забрать прибыль (USDT) — камень возвращается, можно рестейк',
              'Забрать камень физически — оформить доставку',
              'Рестейк — продлить стейкинг на новый период',
            ]} />
          </>)}

          {tab === 'p2p' && (<>
            <HelpTitle emoji="🤝" text="P2P торговля" />
            <p>DiamondP2P позволяет продавать и покупать камни напрямую между участниками клуба.</p>

            <HelpTitle emoji="📤" text="Как выставить камень" />
            <HelpSteps steps={[
              'Перейдите в «Камни» → «Мои камни»',
              'Найдите камень со статусом OWNED или CLAIMED',
              'Нажмите «🏪 Продать P2P»',
              'Укажите цену в USDT и подтвердите',
              'Камень появится в разделе P2P для всех',
            ]} />

            <HelpTitle emoji="📥" text="Как купить" />
            <HelpSteps steps={[
              'Перейдите в раздел «P2P»',
              'Нажмите «Купить» на предложении',
              'USDT спишется автоматически, камень перейдёт вам',
            ]} />

            <HelpTitle emoji="💸" text="Комиссии" />
            <p>Комиссия P2P зависит от TrustScore. Чем выше репутация — тем ниже комиссия. Базовая — 5%.</p>
          </>)}

          {tab === 'showcase' && (<>
            <HelpTitle emoji="🏪" text="Витрина ShowcaseMarket" />
            <p>Витрина для продажи реальных драгоценностей через платформу при участии сертифицированного агента.</p>

            <HelpTitle emoji="🪪" text="Лицензия агента" />
            <p>Для создания объявлений нужна лицензия агента. Агенты верифицируют товары и подтверждают сделки.</p>

            <HelpTitle emoji="📝" text="Как создать объявление" />
            <HelpSteps steps={[
              'Получите лицензию агента',
              'Нажмите «+ Создать» в разделе Витрина',
              'Выберите тип актива, укажите название и описание',
              'Добавьте фото и сертификат (IPFS/URL)',
              'Установите цену и опубликуйте',
            ]} />

            <HelpTitle emoji="✅" text="Подтверждение продажи" />
            <p>Когда покупатель найден, нажмите «Подтвердить продажу» и укажите адрес покупателя. USDT переводится за вычетом комиссии.</p>
          </>)}

          {tab === 'insurance' && (<>
            <HelpTitle emoji="🛡️" text="Страховой фонд" />
            <p>При каждой покупке 5% идёт в страховой фонд на ваш баланс.</p>

            <HelpTitle emoji="💸" text="Вывод средств" />
            <HelpSteps steps={[
              'Укажите сумму для вывода',
              'Нажмите «Запросить вывод»',
              'Ожидайте 48 часов',
              'Нажмите «Выполнить» для получения USDT',
            ]} />

            <HelpTitle emoji="📋" text="Верификация активов" />
            <p>Периодически подтверждайте владение активами. Пропуск снижает TrustScore.</p>

            <HelpTitle emoji="🆘" text="Страховая заявка" />
            <p>При проблемах с активом подайте заявку с причиной и доказательствами (IPFS).</p>
          </>)}

          {tab === 'boost' && (<>
            <HelpTitle emoji="🚀" text="Буст ставки" />
            <p>Сжигание NST увеличивает ставку стейкинга. Необратимое действие — NST уничтожаются навсегда.</p>

            <HelpTitle emoji="🔥" text="Как сжечь NST" />
            <HelpSteps steps={[
              'Перейдите в раздел «Буст»',
              'Введите количество NST',
              'Нажмите «Сжечь» и подтвердите',
              'Ставка повысится после порога',
            ]} />

            <HelpTitle emoji="🎯" text="TrustScore" />
            <p>Уровни: NONE → PROBATION → BRONZE → SILVER → GOLD. Высокий TrustScore снижает комиссии и открывает функции.</p>
          </>)}

          {tab === 'dct' && (<>
            <HelpTitle emoji="🪙" text="Что такое DCT?" />
            <p>DCT (Diamond Club Token) — токен, обеспеченный реальными бриллиантами. Каждый DCT имеет реальную стоимость, привязанную к стоимости камней в хранилище клуба.</p>

            <HelpTitle emoji="💎" text="Как получить DCT?" />
            <HelpSteps steps={[
              'Купите камень в разделе «Камни»',
              'Перейдите в раздел «DCT»',
              'Нажмите «Получить DCT» — токены будут начислены автоматически',
              'Часть токенов будет заморожена (привязана к камню)',
            ]} />

            <HelpTitle emoji="📊" text="Доли камней" />
            <p>Можно купить долю дорогого камня за DCT вместо покупки целого камня. Все держатели долей получают стейкинг-доход в USDT пропорционально своей доле.</p>

            <HelpTitle emoji="💰" text="Стейкинг-доход" />
            <HelpSteps steps={[
              'В разделе DCT видны все лоты с вашими долями',
              'Доход начисляется в USDT',
              'Нажмите «Забрать доход» когда он накопится',
            ]} />

            <HelpTitle emoji="🔄" text="Биржа DCT/USDT" />
            <HelpSteps steps={[
              'Вы можете купить DCT за USDT или продать DCT за USDT',
              'Создайте ордер с ценой и количеством',
              'Когда другой участник заполнит ваш ордер — сделка совершится',
              'Комиссия биржи небольшая и идёт в фонд клуба',
            ]} />
          </>)}

          {tab === 'heritage' && (<>
            <HelpTitle emoji="📜" text="Наследование DCT" />
            <p>Система наследования позволяет защитить ваши активы. Если вы не появляетесь определённое время — ваши DCT и доли камней автоматически перейдут выбранным наследникам.</p>

            <HelpTitle emoji="⚙️" text="Как настроить" />
            <HelpSteps steps={[
              'Перейдите в раздел «Наследство»',
              'Укажите от 1 до 5 наследников (адрес кошелька, % доли, имя)',
              'Установите период неактивности (минимум 365 дней)',
              'Подтвердите в кошельке',
            ]} />

            <HelpTitle emoji="🔔" text="Подтверждение активности" />
            <HelpSteps steps={[
              'Регулярно нажимайте «Подтвердить активность»',
              'Это сбрасывает таймер неактивности',
              'Если таймер истечёт — наследники смогут забрать ваши активы',
            ]} />

            <HelpTitle emoji="⚠️" text="Важно" />
            <p>Для работы наследования нужно выдать разрешения (approve) на DCT токены и доли камней. Система попросит сделать это при настройке.</p>
          </>)}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-white/8">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-[12px] font-bold gold-btn">
            ✅ Понятно
          </button>
        </div>
      </div>
    </div>
  )
}

function HelpTitle({ emoji, text }) {
  return <div className="text-[13px] font-black text-gold-400 pt-1">{emoji} {text}</div>
}
function HelpSteps({ steps }) {
  return (
    <div className="space-y-1 pl-1">
      {steps.map((s, i) => (
        <div key={i} className="flex gap-2">
          <span className="text-gold-400 font-bold shrink-0">{i + 1}.</span>
          <span>{s}</span>
        </div>
      ))}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// DASHBOARD — Обзор
// ═════════════════════════════════════════════════════════
function DashboardSection() {
  const { wallet, t } = useGameStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!wallet) return
    setLoading(true)
    DC.loadDiamondClubDashboard(wallet).then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [wallet])

  if (loading) return <Loading />
  if (!data) return <ErrorCard text="Ошибка загрузки" />

  const TIER_COLORS = { NONE: 'text-slate-500', PROBATION: 'text-red-400', BRONZE: 'text-orange-400', SILVER: 'text-slate-300', GOLD: 'text-gold-400' }
  const stakingGems = data.gemPurchases.filter(p => p.status === 1)
  const totalInvested = data.gemPurchases.reduce((s, p) => s + parseFloat(p.pricePaid), 0)

  return (
    <div className="px-3 mt-2 space-y-2">
      {data.frozen && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
          <div className="text-lg">🚫</div>
          <div className="text-[12px] font-bold text-red-400">Аккаунт заморожен</div>
          <div className="text-[10px] text-red-300/70">Обратитесь в поддержку</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl glass">
          <div className="text-[10px] text-slate-500">Баланс (USDT)</div>
          <div className="text-xl font-black text-gold-400">${parseFloat(data.insuranceBalance).toFixed(2)}</div>
          <div className="text-[9px] text-slate-500">Вывод через 48ч</div>
        </div>
        <div className="p-3 rounded-2xl glass">
          <div className="text-[10px] text-slate-500">TrustScore</div>
          <div className={`text-xl font-black ${TIER_COLORS[data.trustInfo?.tierName] || 'text-slate-500'}`}>
            {data.trustInfo?.score || 0}
          </div>
          <div className={`text-[9px] font-bold ${TIER_COLORS[data.trustInfo?.tierName] || 'text-slate-500'}`}>
            {data.trustInfo?.tierName || 'NONE'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Инвестировано" value={`$${totalInvested.toFixed(0)}`} color="text-gold-400" />
        <StatCard label="В стейкинге" value={stakingGems.length} color="text-emerald-400" />
        <StatCard label="Ставка" value={`${data.boostInfo?.currentRate || 50}%`} color="text-purple-400" />
      </div>

      {stakingGems.length > 0 && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-gold-400 mb-2">💎 Активный стейкинг ({stakingGems.length})</div>
          <div className="space-y-1.5">
            {stakingGems.slice(0, 3).map(p => <StakingRow key={p.id} purchase={p} />)}
            {stakingGems.length > 3 && <div className="text-[9px] text-slate-500 text-center">+{stakingGems.length - 3} ещё</div>}
          </div>
        </div>
      )}

      {parseFloat(data.referralClaimable) > 0 && (
        <div className="p-3 rounded-2xl glass border-emerald-500/15">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-bold text-emerald-400">🎁 Реферальный бонус</div>
              <div className="text-lg font-black text-emerald-400">{parseFloat(data.referralClaimable).toFixed(2)} NST</div>
            </div>
            <ClaimReferralButton />
          </div>
        </div>
      )}

      {data.gemStats && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-blue-400 mb-2">📈 Статистика клуба</div>
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[11px] font-black text-gold-400">${parseFloat(data.gemStats.totalSales).toFixed(0)}</div>
              <div className="text-[9px] text-slate-500">Продажи</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[11px] font-black text-emerald-400">${parseFloat(data.gemStats.reserve).toFixed(0)}</div>
              <div className="text-[9px] text-slate-500">Резерв</div>
            </div>
            <div className="p-2 rounded-lg bg-white/5">
              <div className="text-[11px] font-black text-blue-400">{data.gemStats.purchases}</div>
              <div className="text-[9px] text-slate-500">Покупок</div>
            </div>
            {data.p2pStats && (
              <div className="p-2 rounded-lg bg-white/5">
                <div className="text-[11px] font-black text-purple-400">{data.p2pStats.trades}</div>
                <div className="text-[9px] text-slate-500">P2P сделок</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// GEMS FULL — Конфигуратор + Мои покупки с управлением + P2P листинг
// ═════════════════════════════════════════════════════════
function GemsFullSection({ onGoToDCT }) {
  const { wallet, addNotification, setTxPending, txPending } = useGameStore()
  const [view, setView] = useState('configurator')
  const [myPurchases, setMyPurchases] = useState([])
  const [loading, setLoading] = useState(false)
  const [p2pModal, setP2pModal] = useState(null)
  const [p2pPrice, setP2pPrice] = useState('')

  const reloadPurchases = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    const p = await DC.getUserGemPurchases(wallet).catch(() => [])
    setMyPurchases(p)
    setLoading(false)
  }, [wallet])

  useEffect(() => { reloadPurchases() }, [reloadPurchases])

  const handleClaim = async (purchaseId, option) => {
    setTxPending(true)
    const result = await safeCall(() => DC.claimGemStaking(purchaseId, option))
    setTxPending(false)
    if (result.ok) { addNotification('✅ Стейкинг получен!'); reloadPurchases() }
    else addNotification(`❌ ${result.error}`)
  }

  const handleRestake = async (purchaseId) => {
    setTxPending(true)
    const result = await safeCall(() => DC.restakeGem(purchaseId))
    setTxPending(false)
    if (result.ok) { addNotification('✅ Рестейк выполнен!'); reloadPurchases() }
    else addNotification(`❌ ${result.error}`)
  }

  const handleConvert = async (purchaseId) => {
    setTxPending(true)
    const result = await safeCall(() => DC.convertGemToAsset(purchaseId))
    setTxPending(false)
    if (result.ok) { addNotification('✅ Конвертировано в Актив!'); reloadPurchases() }
    else addNotification(`❌ ${result.error}`)
  }

  const handleListP2P = async () => {
    if (!p2pModal || !p2pPrice || parseFloat(p2pPrice) <= 0) return
    setTxPending(true)
    const vaultAddr = ADDRESSES?.GemVaultV2 || ADDRESSES?.gemVault || '0x0'
    const result = await safeCall(() => DC.listOnP2P(vaultAddr, p2pModal.id, p2pPrice))
    setTxPending(false)
    if (result.ok) {
      addNotification(`✅ 🏪 Камень #${p2pModal.id} выставлен за $${p2pPrice}`)
      setP2pModal(null); setP2pPrice(''); reloadPurchases()
    } else addNotification(`❌ ${result.error}`)
  }

  const STATUS_EMOJI = { 0: '📦', 1: '⏳', 2: '✅', 3: '🏪', 4: '🔄' }
  const STATUS_TEXT = { 0: 'OWNED', 1: 'STAKING', 2: 'CLAIMED', 3: 'P2P', 4: 'RESTAKED' }

  return (
    <div className="px-3 mt-2 space-y-2">
      {/* Toggle */}
      <div className="flex gap-1">
        <button onClick={() => setView('configurator')}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${
            view === 'configurator' ? 'bg-gold-400/15 border-gold-400/30 text-gold-400' : 'border-white/8 text-slate-500'
          }`}>⚙️ Конфигуратор</button>
        <button onClick={() => { setView('purchases'); reloadPurchases() }}
          className={`flex-1 py-2 rounded-xl text-[11px] font-bold border transition-all ${
            view === 'purchases' ? 'bg-purple-500/15 border-purple-500/30 text-purple-400' : 'border-white/8 text-slate-500'
          }`}>🏆 Мои камни ({myPurchases.length})</button>
      </div>

      {view === 'configurator' && <GemConfigurator />}

      {view === 'purchases' && (<>
        {loading ? <Loading /> : myPurchases.length === 0 ? (
          <div className="p-6 rounded-2xl glass text-center">
            <div className="text-3xl mb-2">💎</div>
            <div className="text-[12px] text-slate-400">У вас пока нет покупок</div>
            <button onClick={() => setView('configurator')}
              className="mt-3 px-4 py-2 rounded-xl text-[11px] font-bold bg-gold-400/15 text-gold-400 border border-gold-400/20">
              ⚙️ Перейти в конфигуратор
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {myPurchases.map(p => {
              const daysLeft = Math.max(0, Math.ceil((p.stakingEndsAt - Date.now() / 1000) / 86400))
              return (
                <div key={p.id} className="p-3 rounded-xl glass">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-black text-white">{STATUS_EMOJI[p.status]} #{p.id}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        p.status===1?'bg-emerald-500/15 text-emerald-400':p.status===0?'bg-blue-500/15 text-blue-400':
                        p.status===2?'bg-gold-400/15 text-gold-400':p.status===3?'bg-purple-500/15 text-purple-400':'bg-white/10 text-slate-400'
                      }`}>{STATUS_TEXT[p.status]}</span>
                    </div>
                    <div className="text-[12px] font-black text-gold-400">${parseFloat(p.pricePaid).toFixed(2)}</div>
                  </div>

                  {p.status === 1 && (
                    <div className="flex items-center justify-between mb-2 p-2 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <div>
                        <div className="text-[10px] text-slate-400">Накоплено</div>
                        <div className="text-[12px] font-black text-emerald-400">+${parseFloat(p.pendingReward).toFixed(2)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400">Ставка / Осталось</div>
                        <div className="text-[11px] font-bold text-white">{p.stakingRateBP/100}% • {daysLeft>0?`${daysLeft} дн`:'✅ Готово'}</div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {p.status === 0 && (<>
                      <button onClick={() => handleConvert(p.id)} disabled={txPending}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        ⏳ В стейкинг</button>
                      <button onClick={() => { setP2pModal(p); setP2pPrice(parseFloat(p.marketValue||p.pricePaid).toFixed(2)) }}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                        🏪 Продать P2P</button>
                    </>)}
                    {p.status === 1 && p.rewardReady && (<>
                      <button onClick={() => handleClaim(p.id, 0)} disabled={txPending}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        💰 Забрать USDT</button>
                      <button onClick={() => handleClaim(p.id, 2)} disabled={txPending}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">
                        📦 Получить камень</button>
                      <button onClick={() => handleRestake(p.id)} disabled={txPending}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-gold-400/15 text-gold-400 border border-gold-400/20">
                        🔄 Рестейк</button>
                    </>)}
                    {p.status === 1 && !p.rewardReady && daysLeft > 0 && (
                      <div className="text-[10px] text-slate-500 py-1">⏳ Завершится {new Date(p.stakingEndsAt*1000).toLocaleDateString()}</div>
                    )}
                    {p.status === 2 && (<>
                      <button onClick={() => handleRestake(p.id)} disabled={txPending}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-gold-400/15 text-gold-400 border border-gold-400/20">
                        🔄 Рестейк</button>
                      <button onClick={() => { setP2pModal(p); setP2pPrice(parseFloat(p.marketValue||p.pricePaid).toFixed(2)) }}
                        className="px-2.5 py-1.5 rounded-lg text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">
                        🏪 Продать P2P</button>
                    </>)}
                    {p.status === 3 && <div className="text-[10px] text-purple-400 py-1">🏪 Выставлен на P2P</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </>)}

      {/* DCT карточка */}
      <div className="p-3 rounded-2xl glass border border-gold-400/15 mt-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">🪙</span>
          <span className="text-[12px] font-bold text-gold-400">Ваши камни дают DCT токены</span>
        </div>
        <div className="text-[10px] text-slate-400 mb-2">Перейдите в раздел DCT чтобы получить токены за ваши камни.</div>
        <button onClick={onGoToDCT}
          className="w-full py-2 rounded-xl text-[11px] font-bold bg-gold-400/15 text-gold-400 border border-gold-400/20">
          Перейти в DCT →
        </button>
      </div>

      {/* P2P Listing Modal */}
      {p2pModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setP2pModal(null)}>
          <div className="w-full max-w-sm p-4 rounded-2xl glass" onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card, #1e1e3a)' }}>
            <div className="text-center mb-3">
              <div className="text-3xl mb-2">🏪</div>
              <div className="text-[14px] font-black text-white">Выставить на P2P</div>
              <div className="text-[11px] text-slate-500">Камень #{p2pModal.id} • ${parseFloat(p2pModal.pricePaid).toFixed(2)}</div>
            </div>
            <div className="mb-3">
              <div className="text-[10px] text-slate-500 mb-1">Цена продажи (USDT)</div>
              <input type="number" value={p2pPrice} onChange={e => setP2pPrice(e.target.value)} placeholder="0.00"
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-lg font-bold text-white outline-none text-center" />
              <div className="text-[9px] text-slate-500 mt-1 text-center">
                Рыночная: ${parseFloat(p2pModal.marketValue||0).toFixed(2)}
              </div>
            </div>
            <button onClick={handleListP2P} disabled={txPending || !p2pPrice}
              className="w-full py-3 rounded-xl text-sm font-bold gold-btn"
              style={{ opacity: (!p2pPrice||txPending) ? 0.5 : 1 }}>
              {txPending ? '⏳ ...' : `🏪 Выставить за $${p2pPrice||'0'}`}
            </button>
            <button onClick={() => setP2pModal(null)}
              className="w-full mt-2 py-2 rounded-xl text-[11px] font-bold text-slate-500 border border-white/8">Отмена</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// METALS — не задеплоен
// ═════════════════════════════════════════════════════════
function MetalsSection() {
  return (
    <div className="px-3 mt-2 space-y-2">
      <div className="p-6 rounded-2xl glass text-center">
        <div className="text-4xl mb-3">🥇</div>
        <div className="text-lg font-black text-gold-400">Драгоценные металлы</div>
        <div className="text-[12px] text-slate-400 mt-2">Скоро</div>
        <div className="text-[11px] text-slate-500 mt-3 max-w-xs mx-auto">
          Раздел драгоценных металлов (золото, серебро, платина) находится в разработке.
        </div>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold-400/10 border border-gold-400/20">
          <span className="text-[11px] font-bold text-gold-400">🔔 Следите за обновлениями</span>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// INSURANCE — баланс + вывод + верификация + заявки
// ═════════════════════════════════════════════════════════
function InsuranceSection() {
  const { wallet, addNotification, setTxPending, txPending } = useGameStore()
  const [balance, setBalance] = useState('0')
  const [requests, setRequests] = useState([])
  const [fundStats, setFundStats] = useState(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [showClaimForm, setShowClaimForm] = useState(false)
  const [claimData, setClaimData] = useState({ purchaseId: '', amount: '', reason: '', evidence: '' })
  const [verifyId, setVerifyId] = useState('')

  const reload = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    const [bal, reqs, stats] = await Promise.all([
      DC.getInsuranceUserBalance(wallet).catch(() => '0'),
      DC.getUserWithdrawRequests(wallet).catch(() => []),
      DC.getInsuranceFundStats().catch(() => null),
    ])
    setBalance(bal); setRequests(reqs); setFundStats(stats); setLoading(false)
  }, [wallet])

  useEffect(() => { reload() }, [reload])

  const handleRequestWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return
    setTxPending(true)
    const result = await safeCall(() => DC.requestWithdraw(withdrawAmount))
    setTxPending(false)
    if (result.ok) { addNotification(`✅ Запрос на вывод $${withdrawAmount}`); setWithdrawAmount(''); reload() }
    else addNotification(`❌ ${result.error}`)
  }

  const handleExecuteWithdraw = async (reqId) => {
    setTxPending(true)
    const result = await safeCall(() => DC.executeWithdraw(reqId))
    setTxPending(false)
    if (result.ok) { addNotification('✅ Вывод выполнен!'); reload() }
    else addNotification(`❌ ${result.error}`)
  }

  const handleVerifyAsset = async () => {
    if (!verifyId) return
    setTxPending(true)
    const result = await safeCall(() => DC.verifyAsset(parseInt(verifyId)))
    setTxPending(false)
    if (result.ok) { addNotification(`✅ Актив #${verifyId} верифицирован`); setVerifyId('') }
    else addNotification(`❌ ${result.error}`)
  }

  const handleSubmitClaim = async () => {
    const { purchaseId, amount, reason, evidence } = claimData
    if (!purchaseId || !amount || !reason) return
    setTxPending(true)
    const result = await safeCall(() => DC.submitClaim(parseInt(purchaseId), amount, reason, evidence))
    setTxPending(false)
    if (result.ok) {
      addNotification('✅ Страховая заявка отправлена')
      setShowClaimForm(false); setClaimData({ purchaseId: '', amount: '', reason: '', evidence: '' })
    } else addNotification(`❌ ${result.error}`)
  }

  if (loading) return <Loading />
  const now = Math.floor(Date.now() / 1000)

  return (
    <div className="px-3 mt-2 space-y-2">
      <div className="p-4 rounded-2xl glass text-center">
        <div className="text-[10px] text-slate-500">Баланс страхового фонда</div>
        <div className="text-2xl font-black text-gold-400">${parseFloat(balance).toFixed(2)}</div>
        <div className="text-[9px] text-slate-500">Вывод с задержкой 48ч</div>
      </div>

      {fundStats && (
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="В фонде" value={`$${parseFloat(fundStats.fundBalance).toFixed(0)}`} color="text-emerald-400" />
          <StatCard label="Выплачено" value={`$${parseFloat(fundStats.totalPaidClaims).toFixed(0)}`} color="text-blue-400" />
          <StatCard label="На контракте" value={`$${parseFloat(fundStats.usdtOnContract).toFixed(0)}`} color="text-gold-400" />
        </div>
      )}

      {parseFloat(balance) > 0 && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-emerald-400 mb-2">💸 Запросить вывод</div>
          <div className="flex gap-2">
            <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
              placeholder="USDT" className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none text-center" />
            <button onClick={() => setWithdrawAmount(parseFloat(balance).toFixed(2))}
              className="px-3 py-2 rounded-xl text-[10px] font-bold text-gold-400 border border-gold-400/20">MAX</button>
          </div>
          <button onClick={handleRequestWithdraw} disabled={txPending || !withdrawAmount}
            className="mt-2 w-full py-2.5 rounded-xl text-xs font-bold gold-btn"
            style={{ opacity: (!withdrawAmount||txPending) ? 0.5 : 1 }}>
            {txPending ? '⏳' : '💸 Запросить вывод'}</button>
        </div>
      )}

      {requests.filter(r => r.status >= 1).length > 0 && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-blue-400 mb-2">📋 Запросы на вывод</div>
          <div className="space-y-1.5">
            {requests.filter(r => r.status >= 1).map(req => {
              const isReady = req.status === 1 && now >= req.availableAt
              const hoursLeft = Math.max(0, Math.ceil((req.availableAt - now) / 3600))
              return (
                <div key={req.id} className="p-2 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-white">${parseFloat(req.amount).toFixed(2)}</span>
                      <span className="text-[9px] text-slate-500 ml-2">
                        {req.status===1?'⏳ Ожидание':req.status===3?'🚫 Заморожен':req.status===4?'✅ Выполнен':'—'}
                      </span>
                    </div>
                    {req.status === 1 && (isReady ? (
                      <button onClick={() => handleExecuteWithdraw(req.id)} disabled={txPending}
                        className="px-3 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        ✅ Выполнить</button>
                    ) : <span className="text-[9px] text-gold-400">⏳ {hoursLeft}ч</span>)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Верификация */}
      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-purple-400 mb-2">📋 Верификация актива</div>
        <div className="text-[10px] text-slate-400 mb-2">Подтвердите владение (ID покупки)</div>
        <div className="flex gap-2">
          <input type="number" value={verifyId} onChange={e => setVerifyId(e.target.value)} placeholder="ID"
            className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none text-center" />
          <button onClick={handleVerifyAsset} disabled={txPending || !verifyId}
            className="px-4 py-2 rounded-xl text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20"
            style={{ opacity: (!verifyId||txPending)?0.5:1 }}>
            {txPending ? '⏳' : '✅ Верифицировать'}</button>
        </div>
      </div>

      {/* Страховая заявка */}
      <div className="p-3 rounded-2xl glass">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[12px] font-bold text-red-400">🆘 Страховая заявка</div>
          <button onClick={() => setShowClaimForm(!showClaimForm)}
            className="text-[10px] text-blue-400 font-bold">{showClaimForm ? '✕ Скрыть' : '+ Создать'}</button>
        </div>
        {showClaimForm ? (
          <div className="space-y-2">
            <input type="number" value={claimData.purchaseId} onChange={e => setClaimData(d => ({...d, purchaseId: e.target.value}))}
              placeholder="ID покупки" className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
            <input type="number" value={claimData.amount} onChange={e => setClaimData(d => ({...d, amount: e.target.value}))}
              placeholder="Сумма (USDT)" className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
            <input value={claimData.reason} onChange={e => setClaimData(d => ({...d, reason: e.target.value}))}
              placeholder="Причина" className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
            <input value={claimData.evidence} onChange={e => setClaimData(d => ({...d, evidence: e.target.value}))}
              placeholder="IPFS ссылка (доказательства)" className="w-full p-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none" />
            <button onClick={handleSubmitClaim} disabled={txPending || !claimData.purchaseId || !claimData.amount || !claimData.reason}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/20"
              style={{ opacity: txPending?0.5:1 }}>
              {txPending ? '⏳' : '🆘 Отправить заявку'}</button>
          </div>
        ) : (
          <div className="text-[10px] text-slate-500">При проблемах с активом создайте заявку с причиной и доказательствами.</div>
        )}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// SHOWCASE — просмотр + создание + подтверждение продажи
// ═════════════════════════════════════════════════════════
function ShowcaseSection() {
  const { wallet, addNotification, setTxPending, txPending } = useGameStore()
  const [listings, setListings]       = useState([])
  const [stats, setStats]             = useState(null)
  const [isAgent, setIsAgent]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('all')   // all | gem | metal | jewelry | other
  const [selectedListing, setSelectedListing] = useState(null)  // для детального просмотра
  const [showCreateForm, setShowCreateForm]   = useState(false)
  const [newListing, setNewListing]   = useState({ assetType:0, title:'', description:'', imageURI:'', certURI:'', price:'' })
  const [confirmModal, setConfirmModal]       = useState(null)
  const [buyerAddress, setBuyerAddress]       = useState('')

  const ASSET_TYPES = [
    { id:0, label:'💎 Камень',   color:'text-blue-400',    bg:'bg-blue-500/10',   border:'border-blue-500/20'   },
    { id:1, label:'🥇 Металл',   color:'text-yellow-400',  bg:'bg-yellow-500/10', border:'border-yellow-500/20' },
    { id:2, label:'💍 Ювелирка', color:'text-pink-400',    bg:'bg-pink-500/10',   border:'border-pink-500/20'   },
    { id:3, label:'📦 Другое',   color:'text-slate-400',   bg:'bg-slate-500/10',  border:'border-slate-500/20'  },
  ]
  const FILTER_TABS = [
    { id:'all',     label:'Все' },
    { id:'0',       label:'💎 Камни' },
    { id:'1',       label:'🥇 Металл' },
    { id:'2',       label:'💍 Ювелирка' },
    { id:'3',       label:'📦 Другое' },
  ]

  const reload = useCallback(async () => {
    setLoading(true)
    const [l, s, agent] = await Promise.all([
      DC.getShowcaseListings().catch(() => []),
      DC.getShowcaseStats().catch(() => null),
      wallet ? DC.checkIsAgent(wallet).catch(() => false) : false,
    ])
    setListings(l); setStats(s); setIsAgent(agent); setLoading(false)
  }, [wallet])

  useEffect(() => { reload() }, [reload])

  const filtered = filter === 'all' ? listings : listings.filter(l => String(l.assetType) === filter)

  const handleBuyLicense = async () => {
    setTxPending(true)
    const r = await safeCall(() => DC.buyAgentLicense())
    setTxPending(false)
    if (r.ok) { addNotification('✅ Лицензия агента получена!'); reload() }
    else addNotification(`❌ ${r.error}`)
  }

  const handleCreateListing = async () => {
    const { assetType, title, description, imageURI, certURI, price } = newListing
    if (!title || !price) return
    setTxPending(true)
    const r = await safeCall(() => DC.listOnShowcase(assetType, title, description, imageURI, certURI, price))
    setTxPending(false)
    if (r.ok) {
      addNotification(`✅ «${title}» опубликовано на витрине!`)
      setShowCreateForm(false)
      setNewListing({ assetType:0, title:'', description:'', imageURI:'', certURI:'', price:'' })
      reload()
    } else addNotification(`❌ ${r.error}`)
  }

  const handleConfirmSale = async () => {
    if (!confirmModal || !buyerAddress) return
    setTxPending(true)
    const r = await safeCall(() => DC.confirmShowcaseSale(confirmModal.id, buyerAddress))
    setTxPending(false)
    if (r.ok) { addNotification(`✅ Продажа #${confirmModal.id} подтверждена!`); setConfirmModal(null); setBuyerAddress(''); reload() }
    else addNotification(`❌ ${r.error}`)
  }

  const handleCancel = async (id) => {
    setTxPending(true)
    const r = await safeCall(() => DC.cancelShowcaseListing(id))
    setTxPending(false)
    if (r.ok) { addNotification('✅ Объявление снято'); reload() }
    else addNotification(`❌ ${r.error}`)
  }

  if (loading) return <Loading />

  return (
    <div className="px-3 mt-2 space-y-3">

      {/* ── Статистика ── */}
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          {[
            { label:'Объявлений', value: stats.total,  icon:'🏪', color:'text-blue-400'    },
            { label:'Продаж',     value: stats.sales,  icon:'✅', color:'text-emerald-400' },
            { label:'Комиссий',   value:`$${parseFloat(stats.commissions||0).toFixed(0)}`, icon:'💰', color:'text-gold-400' },
          ].map(s => (
            <div key={s.label} className="p-2.5 rounded-2xl text-center"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
              <div className="text-lg">{s.icon}</div>
              <div className={`text-[15px] font-black ${s.color}`}>{s.value}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Статус агента ── */}
      <div className="p-3 rounded-2xl flex items-center justify-between"
        style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div>
          <div className="text-[11px] font-bold text-slate-300">Статус агента</div>
          <div className={`text-[10px] font-bold mt-0.5 ${isAgent ? 'text-emerald-400' : 'text-slate-500'}`}>
            {isAgent ? '✅ Лицензия активна — можно публиковать' : '❌ Нет лицензии'}
          </div>
        </div>
        {!isAgent ? (
          <button onClick={handleBuyLicense} disabled={txPending}
            className="px-3 py-2 rounded-xl text-[10px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20 disabled:opacity-50">
            {txPending ? '⏳' : '🏪 Купить'}
          </button>
        ) : (
          <button onClick={() => setShowCreateForm(v => !v)}
            className={`px-3 py-2 rounded-xl text-[10px] font-bold border transition-all ${
              showCreateForm
                ? 'bg-white/5 border-white/10 text-slate-400'
                : 'bg-gold-400/10 border-gold-400/20 text-gold-400'
            }`}>
            {showCreateForm ? '✕ Закрыть' : '+ Разместить'}
          </button>
        )}
      </div>

      {/* ── Форма создания объявления ── */}
      {showCreateForm && isAgent && (
        <div className="p-3 rounded-2xl space-y-2.5"
          style={{ background:'rgba(255,215,0,0.04)', border:'1px solid rgba(255,215,0,0.15)' }}>
          <div className="text-[12px] font-black text-gold-400">📝 Новое объявление</div>

          {/* Тип актива */}
          <div className="grid grid-cols-2 gap-1.5">
            {ASSET_TYPES.map(at => (
              <button key={at.id} onClick={() => setNewListing(l => ({...l, assetType: at.id}))}
                className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
                  newListing.assetType === at.id
                    ? `${at.bg} ${at.border} ${at.color}`
                    : 'border-white/8 text-slate-500'
                }`}>
                {at.label}
              </button>
            ))}
          </div>

          <input value={newListing.title}
            onChange={e => setNewListing(l => ({...l, title: e.target.value}))}
            placeholder="Название (напр. Рубин 1.2 карат, Pigeon Blood)"
            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none placeholder-slate-600" />

          <textarea value={newListing.description}
            onChange={e => setNewListing(l => ({...l, description: e.target.value}))}
            placeholder="Описание — огранка, происхождение, особенности..."
            rows={2}
            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none resize-none placeholder-slate-600" />

          <input value={newListing.imageURI}
            onChange={e => setNewListing(l => ({...l, imageURI: e.target.value}))}
            placeholder="Ссылка на фото (IPFS / URL)"
            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none placeholder-slate-600" />

          <input value={newListing.certURI}
            onChange={e => setNewListing(l => ({...l, certURI: e.target.value}))}
            placeholder="Ссылка на сертификат GIA / GRS (IPFS / URL)"
            className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none placeholder-slate-600" />

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-bold">$</span>
            <input type="number" value={newListing.price}
              onChange={e => setNewListing(l => ({...l, price: e.target.value}))}
              placeholder="Цена в USDT"
              className="w-full p-2.5 pl-7 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none placeholder-slate-600" />
          </div>

          <button onClick={handleCreateListing}
            disabled={txPending || !newListing.title || !newListing.price}
            className="w-full py-3 rounded-xl text-[12px] font-black gold-btn disabled:opacity-40">
            {txPending ? '⏳ Публикация...' : '🏪 Опубликовать на витрине'}
          </button>
        </div>
      )}

      {/* ── Фильтры ── */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
        {FILTER_TABS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap border transition-all flex-shrink-0 ${
              filter === f.id
                ? 'bg-gold-400/15 border-gold-400/30 text-gold-400'
                : 'border-white/8 text-slate-500 hover:border-white/15'
            }`}>
            {f.label}
            {f.id !== 'all' && (
              <span className="ml-1 opacity-60">
                ({listings.filter(l => String(l.assetType) === f.id).length})
              </span>
            )}
            {f.id === 'all' && <span className="ml-1 opacity-60">({listings.length})</span>}
          </button>
        ))}
      </div>

      {/* ── Карточки объявлений ── */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center rounded-2xl"
          style={{ background:'rgba(255,255,255,0.02)', border:'1px dashed rgba(255,255,255,0.08)' }}>
          <div className="text-4xl mb-3">🏪</div>
          <div className="text-[13px] font-bold text-slate-400">Витрина пуста</div>
          <div className="text-[11px] text-slate-600 mt-1">
            {isAgent ? 'Разместите первый актив' : 'Получите лицензию агента чтобы публиковать'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {filtered.map(l => {
            const isMine = wallet && l.seller.toLowerCase() === wallet.toLowerCase()
            const at = ASSET_TYPES[l.assetType] || ASSET_TYPES[3]
            const hasImage = l.imageURI && (l.imageURI.startsWith('http') || l.imageURI.startsWith('ipfs'))

            return (
              <div key={l.id}
                onClick={() => setSelectedListing(l)}
                className="rounded-2xl overflow-hidden cursor-pointer transition-all active:scale-[0.97]"
                style={{ background:'rgba(255,255,255,0.04)', border: isMine ? '1px solid rgba(255,215,0,0.25)' : '1px solid rgba(255,255,255,0.07)' }}>

                {/* Фото / заглушка */}
                <div className="relative w-full aspect-square overflow-hidden"
                  style={{ background:'rgba(0,0,0,0.4)' }}>
                  {hasImage ? (
                    <img
                      src={l.imageURI.startsWith('ipfs://')
                        ? `https://ipfs.io/ipfs/${l.imageURI.slice(7)}`
                        : l.imageURI}
                      alt={l.title}
                      className="w-full h-full object-cover"
                      onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                  ) : null}
                  {/* Заглушка */}
                  <div className="w-full h-full flex items-center justify-center text-4xl"
                    style={{ display: hasImage ? 'none' : 'flex' }}>
                    {at.id === 0 ? '💎' : at.id === 1 ? '🥇' : at.id === 2 ? '💍' : '📦'}
                  </div>

                  {/* Тип актива — бейдж */}
                  <div className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-lg text-[8px] font-bold ${at.bg} ${at.color} ${at.border} border backdrop-blur-sm`}>
                    {at.label}
                  </div>

                  {/* Мой лот — бейдж */}
                  {isMine && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-lg text-[8px] font-bold bg-gold-400/20 text-gold-400 border border-gold-400/30 backdrop-blur-sm">
                      МОЙ
                    </div>
                  )}
                </div>

                {/* Инфо */}
                <div className="p-2.5">
                  <div className="text-[11px] font-bold text-white leading-tight line-clamp-1">{l.title || `Лот #${l.id}`}</div>
                  {l.description && (
                    <div className="text-[9px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">{l.description}</div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-[14px] font-black text-gold-400">${parseFloat(l.price).toLocaleString()}</div>
                    <div className="text-[9px] text-slate-600">{shortAddress(l.seller)}</div>
                  </div>
                  {l.certURI && (
                    <div className="mt-1.5 text-[9px] text-emerald-400 flex items-center gap-1">
                      <span>✅</span> Сертификат
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Детальный просмотр (модалка) ── */}
      {selectedListing && (() => {
        const l = selectedListing
        const isMine = wallet && l.seller.toLowerCase() === wallet.toLowerCase()
        const at = ASSET_TYPES[l.assetType] || ASSET_TYPES[3]
        const hasImage = l.imageURI && (l.imageURI.startsWith('http') || l.imageURI.startsWith('ipfs'))
        const imgSrc = hasImage
          ? (l.imageURI.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${l.imageURI.slice(7)}` : l.imageURI)
          : null

        return (
          <div className="fixed inset-0 bg-black/85 z-50 flex items-end justify-center p-0"
            onClick={() => setSelectedListing(null)}>
            <div className="w-full max-w-sm rounded-t-3xl overflow-hidden"
              style={{ background:'#12122a', border:'1px solid rgba(255,255,255,0.1)' }}
              onClick={e => e.stopPropagation()}>

              {/* Фото */}
              <div className="relative w-full" style={{ aspectRatio:'16/10', background:'rgba(0,0,0,0.6)' }}>
                {imgSrc ? (
                  <img src={imgSrc} alt={l.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-50">
                    {at.id === 0 ? '💎' : at.id === 1 ? '🥇' : at.id === 2 ? '💍' : '📦'}
                  </div>
                )}
                {/* Закрыть */}
                <button onClick={() => setSelectedListing(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white text-lg flex items-center justify-center backdrop-blur-sm">
                  ✕
                </button>
                <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-xl text-[10px] font-bold ${at.bg} ${at.color} ${at.border} border backdrop-blur-sm`}>
                  {at.label}
                </div>
              </div>

              {/* Детали */}
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-[16px] font-black text-white">{l.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{l.description}</div>
                </div>

                <div className="flex items-center justify-between py-2 border-t border-white/8">
                  <div>
                    <div className="text-[10px] text-slate-500">Цена</div>
                    <div className="text-[22px] font-black text-gold-400">${parseFloat(l.price).toLocaleString()} <span className="text-[12px] text-slate-500">USDT</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500">Продавец</div>
                    <div className="text-[11px] text-slate-300 font-mono">{shortAddress(l.seller)}</div>
                    {isMine && <div className="text-[9px] text-gold-400 font-bold">— это вы</div>}
                  </div>
                </div>

                {l.certURI && (
                  <a href={l.certURI.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${l.certURI.slice(7)}` : l.certURI}
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold"
                    onClick={e => e.stopPropagation()}>
                    ✅ <span>Просмотреть сертификат</span>
                    <span className="ml-auto text-[10px] opacity-60">↗</span>
                  </a>
                )}

                {/* Кнопки */}
                {isMine ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { setSelectedListing(null); setConfirmModal(l); setBuyerAddress('') }}
                      className="py-3 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                      ✅ Продажа
                    </button>
                    <button onClick={() => { setSelectedListing(null); handleCancel(l.id) }}
                      disabled={txPending}
                      className="py-3 rounded-xl text-[11px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 disabled:opacity-50">
                      ✕ Снять
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-blue-500/8 border border-blue-500/15 text-[10px] text-slate-400 text-center leading-relaxed">
                    📩 Для покупки свяжитесь с продавцом через<br/>
                    <span className="text-blue-400 font-bold">PrivateMailbox</span> или агента
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Модалка подтверждения продажи ── */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={() => setConfirmModal(null)}>
          <div className="w-full max-w-sm p-5 rounded-3xl space-y-3"
            style={{ background:'#12122a', border:'1px solid rgba(255,215,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-[15px] font-black text-white">Подтверждение продажи</div>
              <div className="text-[11px] text-slate-500 mt-1">«{confirmModal.title}» — <span className="text-gold-400">${parseFloat(confirmModal.price).toLocaleString()}</span></div>
            </div>
            <input value={buyerAddress} onChange={e => setBuyerAddress(e.target.value)}
              placeholder="Адрес кошелька покупателя (0x...)"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white outline-none font-mono placeholder-slate-600" />
            <button onClick={handleConfirmSale}
              disabled={txPending || !buyerAddress}
              className="w-full py-3 rounded-xl text-[12px] font-black gold-btn disabled:opacity-40">
              {txPending ? '⏳ Подтверждение...' : '✅ Подтвердить продажу'}
            </button>
            <button onClick={() => setConfirmModal(null)}
              className="w-full py-2.5 rounded-xl text-[11px] font-bold text-slate-500 border border-white/8">
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// P2P — DiamondP2P
// ═════════════════════════════════════════════════════════
function P2PSection() {
  const { wallet, addNotification, setTxPending, txPending } = useGameStore()
  const [listings, setListings] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    setLoading(true)
    const [l, s] = await Promise.all([DC.getP2PListings().catch(() => []), DC.getP2PStats().catch(() => null)])
    setListings(l); setStats(s); setLoading(false)
  }, [])

  useEffect(() => { reload() }, [reload])

  const handleBuy = async (l) => {
    setTxPending(true)
    const result = await safeCall(() => DC.buyFromP2P(l.id))
    setTxPending(false)
    if (result.ok) { addNotification('✅ 🤝 P2P покупка!'); reload() }
    else addNotification(`❌ ${result.error}`)
  }

  const handleCancel = async (l) => {
    setTxPending(true)
    const result = await safeCall(() => DC.cancelP2PListing(l.id))
    setTxPending(false)
    if (result.ok) { addNotification('✅ Листинг снят'); reload() }
    else addNotification(`❌ ${result.error}`)
  }

  if (loading) return <Loading />

  return (
    <div className="px-3 mt-2 space-y-2">
      {stats && (
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Сделок" value={stats.trades} color="text-blue-400" />
          <StatCard label="Оборот" value={`$${parseFloat(stats.volume).toFixed(0)}`} color="text-emerald-400" />
          <StatCard label="Комиссии" value={`$${parseFloat(stats.commissions).toFixed(0)}`} color="text-gold-400" />
        </div>
      )}

      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-blue-400 mb-1">💡 Как продать на P2P</div>
        <div className="text-[10px] text-slate-400">
          «💎 Камни» → «🏆 Мои камни» → кнопка «🏪 Продать P2P» на камне OWNED/CLAIMED.
        </div>
      </div>

      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-gold-400 mb-2">🤝 P2P Рынок ({listings.length})</div>
        {listings.length === 0 ? (
          <div className="text-[11px] text-slate-500 text-center py-4">Нет P2P предложений</div>
        ) : (
          <div className="space-y-1.5">
            {listings.map(l => {
              const isMine = l.seller.toLowerCase() === wallet?.toLowerCase()
              return (
                <div key={l.id} className="p-2.5 rounded-xl bg-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-white">💎 #{l.purchaseId}</span>
                      <span className="text-[9px] text-slate-500 ml-2">{shortAddress(l.seller)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-black text-gold-400">${parseFloat(l.price).toFixed(2)}</span>
                      {isMine ? (
                        <button onClick={() => handleCancel(l)} disabled={txPending}
                          className="px-2 py-1 rounded-lg text-[9px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">
                          ✕ Снять</button>
                      ) : (
                        <button onClick={() => handleBuy(l)} disabled={txPending}
                          className="px-2 py-1 rounded-lg text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          {txPending ? '⏳' : '💰 Купить'}</button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// BOOST
// ═════════════════════════════════════════════════════════
function BoostSection() {
  const { wallet, nst, addNotification, setTxPending, txPending } = useGameStore()
  const [boostInfo, setBoostInfo] = useState(null)
  const [trustInfo, setTrustInfo] = useState(null)
  const [burnAmount, setBurnAmount] = useState('')
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    const [boost, trust] = await Promise.all([
      DC.getUserBoostInfo(wallet).catch(() => null),
      DC.getUserTrustInfo(wallet).catch(() => null),
    ])
    setBoostInfo(boost); setTrustInfo(trust); setLoading(false)
  }, [wallet])

  useEffect(() => { reload() }, [reload])

  const handleBurn = async () => {
    if (!burnAmount || parseFloat(burnAmount) <= 0) return
    setTxPending(true)
    const result = await safeCall(() => DC.burnNSTForBoost(burnAmount))
    setTxPending(false)
    if (result.ok) { addNotification(`✅ 🔥 ${burnAmount} NST сожжено!`); setBurnAmount(''); reload() }
    else addNotification(`❌ ${result.error}`)
  }

  if (loading) return <Loading />
  const TIER_COLORS = { NONE: 'text-slate-500', PROBATION: 'text-red-400', BRONZE: 'text-orange-400', SILVER: 'text-slate-300', GOLD: 'text-gold-400' }

  return (
    <div className="px-3 mt-2 space-y-2">
      <div className="p-4 rounded-2xl glass text-center">
        <div className="text-[10px] text-slate-500">Текущая ставка</div>
        <div className="text-3xl font-black text-emerald-400">{boostInfo?.currentRate || 50}%</div>
        <div className="text-[9px] text-slate-500">Годовая доходность</div>
      </div>

      {trustInfo && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-blue-400 mb-2">🛡️ TrustScore</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/5">
              <div className={`text-lg font-black ${TIER_COLORS[trustInfo.tierName]}`}>{trustInfo.score}</div>
              <div className="text-[9px] text-slate-500">Баллы</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <div className={`text-[12px] font-bold ${TIER_COLORS[trustInfo.tierName]}`}>{trustInfo.tierName}</div>
              <div className="text-[9px] text-slate-500">Уровень</div>
            </div>
            <div className="p-2 rounded-xl bg-white/5">
              <div className="text-[12px] font-bold text-emerald-400">{trustInfo.canPurchase ? '✅' : '❌'}</div>
              <div className="text-[9px] text-slate-500">Покупки</div>
            </div>
          </div>
        </div>
      )}

      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-orange-400 mb-2">🔥 Сжечь NST</div>
        <div className="text-[11px] text-slate-400 mb-2">Сожгите NST для увеличения ставки</div>
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="p-2 rounded-lg bg-white/5">
            <div className="text-[11px] font-bold text-orange-400">{parseFloat(boostInfo?.nstBurned||0).toFixed(0)}</div>
            <div className="text-[8px] text-slate-500">Сожжено</div>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <div className="text-[11px] font-bold text-gold-400">{(nst||0).toFixed(0)}</div>
            <div className="text-[8px] text-slate-500">Мои NST</div>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <div className="text-[11px] font-bold text-purple-400">{parseFloat(boostInfo?.nextBurnRequired||0).toFixed(0)}</div>
            <div className="text-[8px] text-slate-500">До след.</div>
          </div>
        </div>
        <div className="flex gap-2">
          <input type="number" value={burnAmount} onChange={e => setBurnAmount(e.target.value)} placeholder="NST"
            className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none text-center" />
          <button onClick={handleBurn} disabled={txPending || !burnAmount}
            className="px-4 py-2 rounded-xl text-[11px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/20"
            style={{ opacity: (!burnAmount||txPending)?0.5:1 }}>
            {txPending ? '⏳' : '🔥 Сжечь'}</button>
        </div>
        <div className="mt-3 text-[9px] text-slate-500">
          <div className="grid grid-cols-3 gap-1">
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">0 NST</b><br/>50%</div>
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">10K NST</b><br/>55%</div>
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">30K NST</b><br/>60%</div>
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">50K NST</b><br/>65%</div>
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-white">80K NST</b><br/>70%</div>
            <div className="p-1.5 rounded bg-white/5 text-center"><b className="text-gold-400">100K NST</b><br/>75%</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// DCT — Токен, клейм, стейкинг долей, биржа
// ═════════════════════════════════════════════════════════
function DCTSection() {
  const { wallet, addNotification, setTxPending, txPending } = useGameStore()
  const [loading, setLoading] = useState(true)
  const [tokenInfo, setTokenInfo] = useState(null)
  const [userInfo, setUserInfo] = useState(null)
  const [claimable, setClaimable] = useState(null)
  const [lots, setLots] = useState([])
  const [userLots, setUserLots] = useState({})
  const [prices, setPrices] = useState(null)
  const [exStats, setExStats] = useState(null)
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [showSellModal, setShowSellModal] = useState(false)
  const [showFracModal, setShowFracModal] = useState(null)
  const [orderAmount, setOrderAmount] = useState('')
  const [orderPrice, setOrderPrice] = useState('')
  const [fracAmount, setFracAmount] = useState('')

  const reload = useCallback(async () => {
    if (!wallet) return
    setLoading(true)
    try {
      const [ti, ui, cl, pr, st] = await Promise.all([
        DCT.getDCTTokenInfo().catch(() => null),
        DCT.getDCTUserInfo(wallet).catch(() => null),
        DCT.getClaimableGems(wallet).catch(() => ({ purchaseIds: [], marketValues: [], estimatedDCT: [] })),
        DCT.getExchangeBestPrices().catch(() => ({ bestBid: '0', bestAsk: '0' })),
        DCT.getExchangeStats().catch(() => null),
      ])
      setTokenInfo(ti); setUserInfo(ui); setClaimable(cl); setPrices(pr); setExStats(st)
      const allLots = await DCT.getAllFractionalLots().catch(() => [])
      const activeLots = allLots.filter(l => l.status >= 1 && l.status <= 4)
      setLots(activeLots)
      const uLots = {}
      for (const lot of activeLots) {
        const info = await DCT.getUserLotInfo(lot.id, wallet).catch(() => null)
        if (info && (info.fractions > 0 || parseFloat(info.claimableStaking) > 0)) uLots[lot.id] = info
      }
      setUserLots(uLots)
    } catch {}
    setLoading(false)
  }, [wallet])

  useEffect(() => { reload() }, [reload])

  const handleClaimAll = async () => {
    setTxPending(true)
    const result = await safeCall(() => DCT.claimAllGemDCT())
    setTxPending(false)
    if (result.ok) { addNotification('✅ 🪙 DCT получены!'); reload() }
    else addNotification('❌ ' + result.error)
  }

  const handleClaimStaking = async (lotId) => {
    setTxPending(true)
    const result = await safeCall(() => DCT.claimFractionalStaking(lotId))
    setTxPending(false)
    if (result.ok) { addNotification('✅ 💰 Доход получен!'); reload() }
    else addNotification('❌ ' + result.error)
  }

  const handleBuyFractions = async () => {
    if (!showFracModal || !fracAmount || parseInt(fracAmount) <= 0) return
    setTxPending(true)
    const result = await safeCall(() => DCT.buyFractions(showFracModal, parseInt(fracAmount)))
    setTxPending(false)
    if (result.ok) { addNotification('✅ Доли куплены!'); setShowFracModal(null); setFracAmount(''); reload() }
    else addNotification('❌ ' + result.error)
  }

  const handleCreateBuyOrder = async () => {
    if (!orderAmount || !orderPrice) return
    setTxPending(true)
    const result = await safeCall(() => DCT.createBuyOrderDCT(orderAmount, orderPrice))
    setTxPending(false)
    if (result.ok) { addNotification('✅ Ордер на покупку создан!'); setShowBuyModal(false); setOrderAmount(''); setOrderPrice(''); reload() }
    else addNotification('❌ ' + result.error)
  }

  const handleCreateSellOrder = async () => {
    if (!orderAmount || !orderPrice) return
    setTxPending(true)
    const result = await safeCall(() => DCT.createSellOrderDCT(orderAmount, orderPrice))
    setTxPending(false)
    if (result.ok) { addNotification('✅ Ордер на продажу создан!'); setShowSellModal(false); setOrderAmount(''); setOrderPrice(''); reload() }
    else addNotification('❌ ' + result.error)
  }

  if (loading) return <Loading />
  const totalClaimable = claimable?.estimatedDCT?.reduce((s, v) => s + parseFloat(v), 0) || 0
  const myLotsWithStaking = Object.entries(userLots).filter(([, info]) => parseFloat(info.claimableStaking) > 0)

  return (
    <div className="px-3 mt-2 space-y-2">
      {tokenInfo && (
        <div className="p-4 rounded-2xl glass text-center">
          <div className="text-[10px] text-slate-500 mb-1">🪙 Токен DCT</div>
          <div className="grid grid-cols-3 gap-2">
            <div><div className="text-lg font-black text-gold-400">${parseFloat(tokenInfo.price).toFixed(4)}</div><div className="text-[9px] text-slate-500">Цена</div></div>
            <div><div className="text-lg font-black text-blue-400">{parseFloat(tokenInfo.supply).toLocaleString('ru',{maximumFractionDigits:0})}</div><div className="text-[9px] text-slate-500">Всего</div></div>
            <div><div className="text-lg font-black text-emerald-400">${parseFloat(tokenInfo.backing).toLocaleString('ru',{maximumFractionDigits:0})}</div><div className="text-[9px] text-slate-500">Обеспечение</div></div>
          </div>
        </div>
      )}

      {userInfo && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-gold-400 mb-2">💰 Мой баланс</div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/5"><div className="text-[12px] font-black text-white">{parseFloat(userInfo.total).toFixed(0)}</div><div className="text-[8px] text-slate-500">Всего DCT</div></div>
            <div className="p-2 rounded-xl bg-white/5"><div className="text-[12px] font-black text-emerald-400">{parseFloat(userInfo.free).toFixed(0)}</div><div className="text-[8px] text-slate-500">Свободные</div></div>
            <div className="p-2 rounded-xl bg-white/5"><div className="text-[12px] font-black text-orange-400">{parseFloat(userInfo.locked).toFixed(0)}</div><div className="text-[8px] text-slate-500">Заморожены</div></div>
          </div>
          <div className="text-center mt-1.5 text-[10px] text-slate-500">Стоимость: <span className="text-gold-400 font-bold">${parseFloat(userInfo.valueUSDT).toFixed(2)}</span></div>
        </div>
      )}

      {claimable && claimable.purchaseIds.length > 0 && (
        <div className="p-3 rounded-2xl glass border border-gold-400/15">
          <div className="text-[12px] font-bold text-gold-400 mb-1">💎 Получить DCT за камни</div>
          <div className="text-[10px] text-slate-400 mb-2">У вас {claimable.purchaseIds.length} камн{claimable.purchaseIds.length===1?'ь':claimable.purchaseIds.length<5?'я':'ей'}</div>
          <div className="text-center mb-2"><span className="text-lg font-black text-emerald-400">~{totalClaimable.toFixed(0)} DCT</span></div>
          <button onClick={handleClaimAll} disabled={txPending} className="w-full py-2.5 rounded-xl text-[11px] font-bold gold-btn" style={{opacity:txPending?0.5:1}}>
            {txPending ? '⏳' : '🪙 Получить все DCT'}</button>
        </div>
      )}

      {myLotsWithStaking.length > 0 && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-emerald-400 mb-2">📊 Стейкинг-доход</div>
          <div className="space-y-1.5">{myLotsWithStaking.map(([lotId, info]) => {
            const lot = lots.find(l => l.id === parseInt(lotId))
            return (<div key={lotId} className="flex items-center justify-between p-2 rounded-lg bg-white/5">
              <div><span className="text-[11px] font-bold text-white">Лот #{lotId}</span>{lot && <span className="text-[9px] text-slate-500 ml-2">{lot.carats}ct</span>}
                <div className="text-[10px] font-bold text-emerald-400">+${parseFloat(info.claimableStaking).toFixed(2)}</div></div>
              <button onClick={() => handleClaimStaking(parseInt(lotId))} disabled={txPending}
                className="px-3 py-1.5 rounded-lg text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                {txPending ? '⏳' : '💰 Забрать'}</button>
            </div>)
          })}</div>
        </div>
      )}

      {lots.filter(l => l.status === 1 && l.soldFractions < l.totalFractions).length > 0 && (
        <div className="p-3 rounded-2xl glass">
          <div className="text-[12px] font-bold text-purple-400 mb-2">🧩 Доступные доли</div>
          <div className="text-[10px] text-slate-400 mb-2">Купите долю за DCT — получайте доход в USDT</div>
          <div className="space-y-1.5">{lots.filter(l => l.status===1 && l.soldFractions<l.totalFractions).map(lot => (
            <div key={lot.id} className="p-2 rounded-lg bg-white/5">
              <div className="flex items-center justify-between mb-1">
                <div><span className="text-[11px] font-bold text-white">{lot.name||`Лот #${lot.id}`}</span><span className="text-[9px] text-slate-500 ml-2">{lot.carats}ct</span></div>
                <div className="text-[10px] font-bold text-emerald-400">{lot.stakingAPR/100}% год.</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-[9px] text-slate-500">{lot.soldFractions}/{lot.totalFractions} • {lot.fractionPriceDCT} DCT/доля</div>
                <button onClick={() => { setShowFracModal(lot.id); setFracAmount('1') }}
                  className="px-2 py-1 rounded-lg text-[9px] font-bold bg-purple-500/15 text-purple-400 border border-purple-500/20">🧩 Купить</button>
              </div>
            </div>
          ))}</div>
        </div>
      )}

      <div className="p-3 rounded-2xl glass">
        <div className="text-[12px] font-bold text-blue-400 mb-2">🔄 Биржа DCT / USDT</div>
        {prices && (<div className="grid grid-cols-2 gap-2 mb-2 text-center">
          <div className="p-2 rounded-xl bg-white/5"><div className="text-[11px] font-bold text-emerald-400">${parseFloat(prices.bestBid||0).toFixed(4)}</div><div className="text-[8px] text-slate-500">Лучшая покупка</div></div>
          <div className="p-2 rounded-xl bg-white/5"><div className="text-[11px] font-bold text-red-400">${parseFloat(prices.bestAsk||0).toFixed(4)}</div><div className="text-[8px] text-slate-500">Лучшая продажа</div></div>
        </div>)}
        {exStats && (<div className="grid grid-cols-3 gap-1 mb-2 text-center">
          <div className="p-1.5 rounded-lg bg-white/5"><div className="text-[10px] font-bold text-white">{exStats.trades}</div><div className="text-[8px] text-slate-500">Сделок</div></div>
          <div className="p-1.5 rounded-lg bg-white/5"><div className="text-[10px] font-bold text-gold-400">${parseFloat(exStats.volumeUSDT||0).toFixed(0)}</div><div className="text-[8px] text-slate-500">Оборот</div></div>
          <div className="p-1.5 rounded-lg bg-white/5"><div className="text-[10px] font-bold text-orange-400">{parseFloat(exStats.burnedDCT||0).toFixed(0)}</div><div className="text-[8px] text-slate-500">Сожжено</div></div>
        </div>)}
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => { setShowBuyModal(true); setOrderAmount(''); setOrderPrice(prices?.bestAsk||'') }}
            className="py-2.5 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">📈 Купить DCT</button>
          <button onClick={() => { setShowSellModal(true); setOrderAmount(''); setOrderPrice(prices?.bestBid||'') }}
            className="py-2.5 rounded-xl text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/20">📉 Продать DCT</button>
        </div>
      </div>

      {showBuyModal && (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowBuyModal(false)}>
        <div className="w-full max-w-sm p-4 rounded-2xl glass" onClick={e => e.stopPropagation()} style={{background:'var(--bg-card,#1e1e3a)'}}>
          <div className="text-center mb-3"><div className="text-3xl mb-2">📈</div><div className="text-[14px] font-black text-white">Купить DCT</div></div>
          <div className="space-y-2 mb-3">
            <div><div className="text-[10px] text-slate-500 mb-1">Количество DCT</div>
              <input type="number" value={orderAmount} onChange={e => setOrderAmount(e.target.value)} placeholder="0" className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-lg font-bold text-white outline-none text-center" /></div>
            <div><div className="text-[10px] text-slate-500 mb-1">Цена за 1 DCT (USDT)</div>
              <input type="number" value={orderPrice} onChange={e => setOrderPrice(e.target.value)} placeholder="0.00" className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-lg font-bold text-white outline-none text-center" /></div>
            {orderAmount && orderPrice && <div className="text-center text-[11px] text-slate-400">Итого: <span className="text-gold-400 font-bold">${(parseFloat(orderAmount||0)*parseFloat(orderPrice||0)).toFixed(2)} USDT</span></div>}
          </div>
          <button onClick={handleCreateBuyOrder} disabled={txPending||!orderAmount||!orderPrice} className="w-full py-3 rounded-xl text-sm font-bold gold-btn" style={{opacity:(!orderAmount||!orderPrice||txPending)?0.5:1}}>
            {txPending ? '⏳' : '📈 Создать ордер'}</button>
          <button onClick={() => setShowBuyModal(false)} className="w-full mt-2 py-2 rounded-xl text-[11px] font-bold text-slate-500 border border-white/8">Отмена</button>
        </div>
      </div>)}

      {showSellModal && (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowSellModal(false)}>
        <div className="w-full max-w-sm p-4 rounded-2xl glass" onClick={e => e.stopPropagation()} style={{background:'var(--bg-card,#1e1e3a)'}}>
          <div className="text-center mb-3"><div className="text-3xl mb-2">📉</div><div className="text-[14px] font-black text-white">Продать DCT</div></div>
          <div className="space-y-2 mb-3">
            <div><div className="text-[10px] text-slate-500 mb-1">Количество DCT</div>
              <input type="number" value={orderAmount} onChange={e => setOrderAmount(e.target.value)} placeholder="0" className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-lg font-bold text-white outline-none text-center" />
              {userInfo && <button onClick={() => setOrderAmount(parseFloat(userInfo.free).toFixed(0))} className="mt-1 text-[9px] text-gold-400 font-bold">Макс: {parseFloat(userInfo.free).toFixed(0)} DCT</button>}</div>
            <div><div className="text-[10px] text-slate-500 mb-1">Цена за 1 DCT (USDT)</div>
              <input type="number" value={orderPrice} onChange={e => setOrderPrice(e.target.value)} placeholder="0.00" className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-lg font-bold text-white outline-none text-center" /></div>
            {orderAmount && orderPrice && <div className="text-center text-[11px] text-slate-400">Получите: <span className="text-emerald-400 font-bold">${(parseFloat(orderAmount||0)*parseFloat(orderPrice||0)).toFixed(2)} USDT</span></div>}
          </div>
          <button onClick={handleCreateSellOrder} disabled={txPending||!orderAmount||!orderPrice} className="w-full py-3 rounded-xl text-sm font-bold bg-red-500/20 text-red-400 border border-red-500/30" style={{opacity:(!orderAmount||!orderPrice||txPending)?0.5:1}}>
            {txPending ? '⏳' : '📉 Создать ордер'}</button>
          <button onClick={() => setShowSellModal(false)} className="w-full mt-2 py-2 rounded-xl text-[11px] font-bold text-slate-500 border border-white/8">Отмена</button>
        </div>
      </div>)}

      {showFracModal !== null && (() => {
        const lot = lots.find(l => l.id === showFracModal); if (!lot) return null
        const remaining = lot.totalFractions - lot.soldFractions
        return (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowFracModal(null)}>
          <div className="w-full max-w-sm p-4 rounded-2xl glass" onClick={e => e.stopPropagation()} style={{background:'var(--bg-card,#1e1e3a)'}}>
            <div className="text-center mb-3"><div className="text-3xl mb-2">🧩</div><div className="text-[14px] font-black text-white">Купить доли</div>
              <div className="text-[11px] text-slate-500">{lot.name||`Лот #${lot.id}`} • {lot.carats}ct</div></div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-center text-[9px]">
              <div className="p-1.5 rounded-lg bg-white/5"><div className="text-[10px] font-bold text-white">{lot.fractionPriceDCT}</div><div className="text-slate-500">DCT/доля</div></div>
              <div className="p-1.5 rounded-lg bg-white/5"><div className="text-[10px] font-bold text-emerald-400">{remaining}</div><div className="text-slate-500">Доступно</div></div>
            </div>
            <div className="mb-3"><div className="text-[10px] text-slate-500 mb-1">Количество долей</div>
              <input type="number" value={fracAmount} onChange={e => setFracAmount(e.target.value)} placeholder="1" min="1" max={remaining}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-lg font-bold text-white outline-none text-center" />
              {fracAmount && <div className="text-center mt-1 text-[10px] text-slate-400">Итого: <span className="text-gold-400 font-bold">{(parseInt(fracAmount||0)*parseFloat(lot.fractionPriceDCT)).toFixed(0)} DCT</span></div>}
            </div>
            <button onClick={handleBuyFractions} disabled={txPending||!fracAmount||parseInt(fracAmount)<=0} className="w-full py-3 rounded-xl text-sm font-bold gold-btn" style={{opacity:(!fracAmount||txPending)?0.5:1}}>
              {txPending ? '⏳' : '🧩 Купить доли'}</button>
            <button onClick={() => setShowFracModal(null)} className="w-full mt-2 py-2 rounded-xl text-[11px] font-bold text-slate-500 border border-white/8">Отмена</button>
          </div>
        </div>)
      })()}
    </div>
  )
}

// ═════════════════════════════════════════════════════════
// HERITAGE — Наследование DCT
// ═════════════════════════════════════════════════════════
function HeritageSection() {
  const { wallet, addNotification, setTxPending, txPending } = useGameStore()
  const [loading, setLoading] = useState(true)
  const [heritage, setHeritage] = useState(null)
  const [heirs, setHeirs] = useState([])
  const [approvals, setApprovals] = useState({ dctApproved: false, fractionsApproved: false })
  const [showSetup, setShowSetup] = useState(false)
  const [heirRows, setHeirRows] = useState([{ wallet: '', sharePct: '', label: '' }])
  const [inactDays, setInactDays] = useState('365')

  const reload = useCallback(async () => {
    if (!wallet) return; setLoading(true)
    const [h, hr, ap] = await Promise.all([DCT.getHeritageInfo(wallet).catch(()=>null), DCT.getHeirs(wallet).catch(()=>[]), DCT.checkHeritageApprovals(wallet).catch(()=>({dctApproved:false,fractionsApproved:false}))])
    setHeritage(h); setHeirs(hr); setApprovals(ap); setLoading(false)
  }, [wallet])
  useEffect(() => { reload() }, [reload])

  const handlePing = async () => { setTxPending(true); const r = await safeCall(()=>DCT.pingHeritage()); setTxPending(false); if(r.ok){addNotification('✅ 🔔 Активность подтверждена!');reload()} else addNotification('❌ '+r.error) }
  const handleApproveDCT = async () => { setTxPending(true); const r = await safeCall(()=>DCT.approveDCTForHeritage()); setTxPending(false); if(r.ok){addNotification('✅ DCT одобрены');reload()} else addNotification('❌ '+r.error) }
  const handleApproveFractions = async () => { setTxPending(true); const r = await safeCall(()=>DCT.approveFractionsForHeritage()); setTxPending(false); if(r.ok){addNotification('✅ Доли одобрены');reload()} else addNotification('❌ '+r.error) }

  const handleSaveHeritage = async () => {
    const valid = heirRows.filter(r => r.wallet && r.sharePct)
    if (!valid.length) return addNotification('❌ Укажите наследника')
    const totalPct = valid.reduce((s,r) => s+parseInt(r.sharePct||0), 0)
    if (totalPct !== 100) return addNotification('❌ Сумма долей: '+totalPct+'% (нужно 100%)')
    setTxPending(true)
    const r = await safeCall(() => DCT.configureHeritage(valid.map(r=>r.wallet), valid.map(r=>parseInt(r.sharePct)*100), valid.map(r=>r.label||''), parseInt(inactDays)||365))
    setTxPending(false)
    if(r.ok){addNotification('✅ 📜 Наследование настроено!');setShowSetup(false);reload()} else addNotification('❌ '+r.error)
  }

  const handleCancel = async () => { setTxPending(true); const r = await safeCall(()=>DCT.cancelHeritage()); setTxPending(false); if(r.ok){addNotification('✅ Отменено');reload()} else addNotification('❌ '+r.error) }

  const addHeirRow = () => { if(heirRows.length<5) setHeirRows([...heirRows, {wallet:'',sharePct:'',label:''}]) }
  const removeHeirRow = (i) => { if(heirRows.length>1) setHeirRows(heirRows.filter((_,idx)=>idx!==i)) }
  const updateHeirRow = (i,f,v) => { setHeirRows(heirRows.map((r,idx)=>idx===i?{...r,[f]:v}:r)) }

  if (loading) return <Loading />
  const isActive = heritage && heritage.active && !heritage.executed
  const nextDate = heritage ? new Date(heritage.canExecuteAt*1000).toLocaleDateString() : '—'

  return (
    <div className="px-3 mt-2 space-y-2">
      <div className="p-3 rounded-2xl glass text-center">
        <div className="text-lg mb-1">📜</div>
        <div className="text-[12px] font-bold text-gold-400">Наследование DCT</div>
        <div className="text-[10px] text-slate-400 mt-1">Если вы не появляетесь определённое время — наследники получат ваши DCT и доли камней.</div>
      </div>

      {(!approvals.dctApproved || !approvals.fractionsApproved) && (
        <div className="p-3 rounded-2xl glass border border-orange-500/20">
          <div className="text-[12px] font-bold text-orange-400 mb-2">⚠️ Нужны разрешения</div>
          <div className="text-[10px] text-slate-400 mb-2">Для работы наследования одобрите доступ к активам.</div>
          <div className="space-y-1.5">
            {!approvals.dctApproved && <button onClick={handleApproveDCT} disabled={txPending} className="w-full py-2 rounded-xl text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/20">{txPending?'⏳':'🪙 Одобрить DCT'}</button>}
            {!approvals.fractionsApproved && <button onClick={handleApproveFractions} disabled={txPending} className="w-full py-2 rounded-xl text-[10px] font-bold bg-orange-500/15 text-orange-400 border border-orange-500/20">{txPending?'⏳':'🧩 Одобрить доли'}</button>}
          </div>
        </div>
      )}

      {isActive ? (
        <div className="p-3 rounded-2xl glass border border-emerald-500/15">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-400 font-bold text-[12px]">✅ Настроено</span>
            <span className="text-[10px] text-slate-500">• {heritage.heirCount} наследн.</span>
          </div>
          <div className="text-[10px] text-slate-400 mb-2">Период: <span className="text-white font-bold">{heritage.inactivityDays} дней</span><br/>Дедлайн: <span className="text-gold-400 font-bold">{nextDate}</span></div>
          {heirs.length > 0 && (<div className="space-y-1 mb-2">{heirs.map((h,i) => (
            <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-white/5">
              <div><span className="text-[10px] font-bold text-white">{h.label||`Наследник ${i+1}`}</span><span className="text-[8px] text-slate-500 ml-2">{shortAddress(h.wallet)}</span></div>
              <span className="text-[11px] font-black text-gold-400">{h.sharePct}%</span>
            </div>
          ))}</div>)}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handlePing} disabled={txPending} className="py-2.5 rounded-xl text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">{txPending?'⏳':'🔔 Я здесь'}</button>
            <button onClick={() => { setShowSetup(true); if(heirs.length>0){setHeirRows(heirs.map(h=>({wallet:h.wallet,sharePct:h.sharePct,label:h.label}))); setInactDays(String(heritage.inactivityDays))} }}
              className="py-2.5 rounded-xl text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">✏️ Изменить</button>
          </div>
          <button onClick={handleCancel} disabled={txPending} className="w-full mt-2 py-2 rounded-xl text-[10px] font-bold text-red-400/60 border border-white/5">Отменить наследование</button>
        </div>
      ) : (
        <div className="p-3 rounded-2xl glass text-center">
          <div className="text-[12px] text-slate-400 mb-2">Наследование не настроено</div>
          <button onClick={() => setShowSetup(true)} className="px-6 py-2.5 rounded-xl text-[11px] font-bold gold-btn">⚙️ Настроить</button>
        </div>
      )}

      {showSetup && (<div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-3" onClick={() => setShowSetup(false)}>
        <div className="w-full max-w-md max-h-[85vh] rounded-2xl overflow-y-auto p-4 space-y-3" onClick={e => e.stopPropagation()} style={{background:'linear-gradient(180deg,#1a1a3e 0%,#0f0f2a 100%)'}}>
          <div className="text-center mb-2"><div className="text-3xl mb-1">📜</div><div className="text-[14px] font-black text-white">Настройка наследования</div></div>
          <div><div className="text-[10px] text-slate-500 mb-1">Период неактивности (дней, мин. 365)</div>
            <input type="number" value={inactDays} onChange={e => setInactDays(e.target.value)} min="365" placeholder="365" className="w-full p-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white outline-none text-center" /></div>
          <div className="text-[10px] text-slate-500">Наследники (1–5)</div>
          {heirRows.map((row,idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-white/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-300">Наследник {idx+1}</span>
                {heirRows.length>1 && <button onClick={() => removeHeirRow(idx)} className="text-[9px] text-red-400">✕</button>}
              </div>
              <input value={row.label} onChange={e => updateHeirRow(idx,'label',e.target.value)} placeholder="Имя" className="w-full p-2 rounded-lg bg-white/5 border border-white/8 text-[11px] text-white outline-none" />
              <input value={row.wallet} onChange={e => updateHeirRow(idx,'wallet',e.target.value)} placeholder="Адрес (0x...)" className="w-full p-2 rounded-lg bg-white/5 border border-white/8 text-[11px] text-white outline-none font-mono" />
              <input type="number" value={row.sharePct} onChange={e => updateHeirRow(idx,'sharePct',e.target.value)} placeholder="Доля (%)" className="w-full p-2 rounded-lg bg-white/5 border border-white/8 text-[11px] text-white outline-none text-center" />
            </div>
          ))}
          {heirRows.length<5 && <button onClick={addHeirRow} className="w-full py-2 rounded-xl text-[10px] font-bold text-blue-400 border border-blue-500/20">+ Добавить наследника</button>}
          {(() => { const t = heirRows.reduce((s,r) => s+parseInt(r.sharePct||0), 0); return <div className={`text-center text-[11px] font-bold ${t===100?'text-emerald-400':'text-red-400'}`}>Сумма: {t}% {t===100?'✅':'(нужно 100%)'}</div> })()}
          <button onClick={handleSaveHeritage} disabled={txPending} className="w-full py-3 rounded-xl text-sm font-bold gold-btn" style={{opacity:txPending?0.5:1}}>{txPending?'⏳':'📜 Сохранить'}</button>
          <button onClick={() => setShowSetup(false)} className="w-full py-2 rounded-xl text-[11px] font-bold text-slate-500 border border-white/8">Отмена</button>
        </div>
      </div>)}
    </div>
  )
}


// ═════════════════════════════════════════════════════════
// SHARED
// ═════════════════════════════════════════════════════════
function Loading() {
  return <div className="flex items-center justify-center py-12"><div className="text-2xl animate-spin">💎</div></div>
}
function ErrorCard({ text }) {
  return <div className="mx-3 mt-4 p-4 rounded-2xl glass text-center text-red-400 text-[12px]">❌ {text}</div>
}
function StatCard({ label, value, color }) {
  return (
    <div className="p-2 rounded-2xl glass text-center">
      <div className={`text-lg font-black ${color}`}>{value}</div>
      <div className="text-[9px] text-slate-500">{label}</div>
    </div>
  )
}
function StakingRow({ purchase }) {
  const daysLeft = Math.max(0, Math.ceil((purchase.stakingEndsAt - Date.now()/1000) / 86400))
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
      <div>
        <span className="text-[11px] font-bold text-white">#{purchase.id}</span>
        <span className="text-[10px] text-slate-500 ml-2">${parseFloat(purchase.pricePaid).toFixed(0)}</span>
      </div>
      <div className="text-right">
        <div className="text-[10px] font-bold text-emerald-400">+${parseFloat(purchase.pendingReward).toFixed(2)}</div>
        <div className="text-[8px] text-slate-500">{daysLeft > 0 ? `${daysLeft} дн` : '✅ Готово'}</div>
      </div>
    </div>
  )
}
function ClaimReferralButton() {
  const { setTxPending, txPending, addNotification } = useGameStore()
  const handleClaim = async () => {
    setTxPending(true)
    const result = await safeCall(() => DC.claimReferralBonus())
    setTxPending(false)
    if (result.ok) addNotification('✅ Бонус получен!')
    else addNotification(`❌ ${result.error}`)
  }
  return (
    <button onClick={handleClaim} disabled={txPending}
      className="px-3 py-2 rounded-xl text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
      {txPending ? '⏳' : '🎁 Забрать'}
    </button>
  )
}
