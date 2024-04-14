/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'render.worldofwarcraft.com',
      'wow.zamimg.com'
    ],
  },

};

export default nextConfig;
