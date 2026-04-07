const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://gwm.ink'

const templates = {
  house: {
    title: '🏠 Метр Квадратный — Свой дом под 0% годовых',
    description: 'Заработай 35% депозит через клуб — мы добавим 65% под 0% годовых. Дом в любой стране мира. Без банков и кредитов.',
    image: 'invite-house.jpg',
  },
  build: {
    title: '🏗 Метр Квадратный — Строй дом, зарабатывай!',
    description: 'Бесплатный старт. Тапай и копи метры квадратные. 3 бизнеса от $50. Клубные дома — экономия до 40%.',
    image: 'invite-build.jpg',
  },
  money: {
    title: '💰 Метр Квадратный — 15 источников дохода',
    description: 'Недвижимость, инвестиции, партнёрская программа. Бесплатный старт — зарабатывай с первого дня.',
    image: 'invite-money.jpg',
  },
}

export function generateStaticParams() {
  return [{ t: 'house' }, { t: 'build' }, { t: 'money' }]
}

export async function generateMetadata({ params }) {
  const t = params.t || 'house'
  const tpl = templates[t] || templates.house

  return {
    title: tpl.title,
    description: tpl.description,
    openGraph: {
      title: tpl.title,
      description: tpl.description,
      url: `${BASE_URL}/invite/${t}`,
      siteName: 'Метр Квадратный — Club House',
      images: [
        {
          url: `${BASE_URL}/previews/${tpl.image}`,
          width: 1200,
          height: 630,
          alt: tpl.title,
        },
      ],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: tpl.title,
      description: tpl.description,
      images: [`${BASE_URL}/previews/${tpl.image}`],
    },
  }
}

export default function InviteTypeLayout({ children }) {
  return children
}
