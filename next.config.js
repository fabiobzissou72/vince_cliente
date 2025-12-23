const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/middleware-manifest\.json$/],
  // Força atualização do SW a cada build
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.+\.(png|jpg|jpeg|webp|svg|gif|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60
        }
      }
    },
    // APIs - SEMPRE busca rede primeiro (NetworkFirst)
    {
      urlPattern: /^https:\/\/vincibarbearia\.vercel\.app\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 // 1 minuto apenas
        }
      }
    },
    // APIs locais (proxy) - NetworkOnly (NUNCA cacheia)
    {
      urlPattern: /^https:\/\/vincecliente\.vercel\.app\/api\/proxy\/.*/,
      handler: 'NetworkOnly'
    },
    {
      urlPattern: /^http:\/\/localhost:\d+\/api\/proxy\/.*/,
      handler: 'NetworkOnly'
    },
    {
      urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60
        }
      }
    },
    {
      urlPattern: /\.(?:js|css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60
        }
      }
    }
  ]
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['vincibarbearia.vercel.app', 'nypuvicehlmllhbudghf.supabase.co']
  }
}

module.exports = withPWA(nextConfig)
