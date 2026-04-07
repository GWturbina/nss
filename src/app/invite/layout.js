const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://gwm.ink'

export async function generateMetadata() {
  return {
    title: '🏠 Метр Квадратный — Свой дом под 0% годовых',
    description: 'Клубное строительство домов. Тапай — копи метры — строй свой дом. Бесплатный старт. 3 бизнеса от $50.',
    openGraph: {
      title: '🏠 Метр Квадратный — Свой дом под 0% годовых',
      description: 'Клубное строительство домов. Тапай — копи метры — строй свой дом. Бесплатный старт. 3 бизнеса от $50.',
      url: `${BASE_URL}/invite`,
      siteName: 'Метр Квадратный — Club House',
      images: [{ url: `${BASE_URL}/previews/invite-house.jpg`, width: 1200, height: 630 }],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '🏠 Метр Квадратный — Club House',
      images: [`${BASE_URL}/previews/invite-house.jpg`],
    },
  }
}

export default function InviteLayout({ children }) {
  return children
}
