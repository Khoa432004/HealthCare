/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable server-side rendering - all pages client-side
  // Note: This runs as SPA in development, no need for 'output: export'
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
