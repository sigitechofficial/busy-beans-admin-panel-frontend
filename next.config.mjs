/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  experimental: {
    appDir: true,
    // turbopack: false
  },
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
