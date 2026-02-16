import './globals.css'
import Script from 'next/script'

export const metadata = {
  title: 'NSS — Natural Stone Seekers',
  description: 'Mine gems, invest in precious stones, build your home!',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#2b2a1a" />
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
