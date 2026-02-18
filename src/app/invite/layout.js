export async function generateMetadata({ searchParams }) {
  const t = searchParams?.t || 'gems'

  const templates = {
    gems: {
      title: '💎 NSS — Ищи камни, зарабатывай!',
      description: 'Бесплатный старт. Тапай и добывай натуральные камни со скидкой до 40%. Свой дом под 0%!',
    },
    house: {
      title: '🏠 NSS — Свой дом под 0%!',
      description: 'Заработай 35% депозит — клуб добавит 65% под 0% годовых. Дом в любой стране мира!',
    },
    money: {
      title: '💰 NSS — 15 источников дохода!',
      description: 'Камни, инвестиции, AI, реферальная программа — всё в одном приложении. Начни бесплатно!',
    },
  }

  const tpl = templates[t] || templates.gems
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nss.globalway.club'

  return {
    title: tpl.title,
    description: tpl.description,
    openGraph: {
      title: tpl.title,
      description: tpl.description,
      url: `${baseUrl}/invite`,
      siteName: 'NSS — Natural Stone Seekers',
      images: [
        {
          url: `${baseUrl}/previews/invite-${t}.jpg`,
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
      images: [`${baseUrl}/previews/invite-${t}.jpg`],
    },
    other: {
      'telegram:channel': '@nss_stones',
    },
  }
}

export default function InviteLayout({ children }) {
  return children
}
