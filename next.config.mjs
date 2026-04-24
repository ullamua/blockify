/** @type {import("next").NextConfig} */
const nextConfig = {
  distDir: "out",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
