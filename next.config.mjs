import createNextIntlPlugin from "next-intl/plugin";

const nextIntlPlugin = createNextIntlPlugin("./src/app/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextIntlPlugin(nextConfig);
