/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Suprimir warnings de hidratação causados por extensões do navegador
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2
  },
  // Configuração para permitir importação de módulos externos
  experimental: {
    serverComponentsExternalPackages: ["swagger-ui-react"]
  },
  // Configuração para output standalone (otimizado para Docker/EasyPanel)
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined
}

module.exports = nextConfig
