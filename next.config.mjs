// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//     images: {
//       unoptimized: true, // Only if using Next.js Image component
//     },
//     trailingSlash: true, // Helps with serving files properly
//   };

//   export default nextConfig;
