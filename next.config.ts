import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Add Firebase Storage pattern if you plan to store images there
      // {
      //   protocol: "https",
      //   hostname: "firebasestorage.googleapis.com",
      //   port: "",
      //   pathname: "/v0/b/**", // Adjust pathname based on your bucket structure
      // },
    ],
  },
};

export default nextConfig;
