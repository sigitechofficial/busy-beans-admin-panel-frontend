import createNextIntlPlugin from "next-intl/plugin";

const nextIntlPlugin = createNextIntlPlugin("./src/app/i18n/request.js");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // output: "export",
  eslint: {
    ignoreDuringBuilds: true,
  },
  // admin.busybeancoffee.com + stageadmin — never index in search engines
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextIntlPlugin(nextConfig);
