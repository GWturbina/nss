export async function generateMetadata() {
  const baseUrl = 'https://nss-azure.vercel.app'
  return {
    title: '🏠 Метр Квадратный — Club House | Свой дом под 0%',
    description: 'Тапай, копи метры, строй дом! 3 бизнеса от $50. Клуб добавит 65% к стоимости дома под 0%.',
    openGraph: {
      title: '🏠 Метр Квадратный — Club House',
      description: 'Тапай, копи метры, строй дом! 3 бизнеса от $50. Клуб добавит 65% к стоимости дома под 0%.',
      url: `${baseUrl}/invite`,
      siteName: 'Метр Квадратный — Club House',
      images: [{ url: `${baseUrl}/previews/invite-house.jpg`, width: 1200, height: 630 }],
      locale: 'ru_RU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '🏠 Метр Квадратный — Club House',
      images: [`${baseUrl}/previews/invite-house.jpg`],
    },
  }
}

export default function InviteLayout({ children }) {
  return children
}
