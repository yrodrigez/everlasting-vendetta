/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {hostname: 'render.worldofwarcraft.com',},
      {hostname: 'wow.zamimg.com'},
      {hostname:'ijzwizzfjawlixolcuia.supabase.co'}
    ],
  },
  async rewrites() {
    return [
      {
        source:      '/api/v1/bypass/meta/armor/:slot/:displayId.json',
        destination: '/api/v1/bypass/meta/armor/:slot/:displayId',
      },
      {
        source:      '/api/v1/bypass/meta/charactercustomization/:raceGender.json',
        destination: '/api/v1/bypass/meta/charactercustomization/:raceGender',
      },
      {
        source:      '/api/v1/bypass/meta/character/:raceId.json',
        destination: '/api/v1/bypass/meta/character/:raceId',
      },
      {
        source:      '/api/v1/bypass/meta/textures/:id.png',
        destination: '/api/v1/bypass/meta/textures/:id',
      },
      {
        source:      '/api/v1/bypass/meta/item/:id.json',
        destination: '/api/v1/bypass/meta/item/:id',
      },
      {
        source:      '/api/v1/bypass/meta/bone/:id.png',
        destination: '/api/v1/bypass/meta/bone/:id',
      },
    ];
  },
};

export default nextConfig;
