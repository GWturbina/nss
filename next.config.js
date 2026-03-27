/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // output: 'export' УБРАН — нужны API routes для безопасных admin-операций
  // Vercel автоматически использует SSR mode
  images: { unoptimized: true },
}
module.exports = nextConfig
