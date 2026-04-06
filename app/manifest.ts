import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bid Wars',
    short_name: 'Bid Wars',
    description: 'The Ultimate Virtual Bidding Game',
    start_url: '/home',
    display: 'standalone',
    background_color: '#03081A',
    theme_color: '#03081A',
    icons: [
      {
        src: '/pwa-icon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
