/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {hostname: 'render.worldofwarcraft.com',},
      {hostname: 'wow.zamimg.com'}
    ],
  },

};

export default nextConfig;
