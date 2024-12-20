/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
    remotePatterns: [
      { protocol: "https", hostname: "1h3.googleusercontent.com" },
      { protocol: "https", hostname: "avatar.githubusercontent.com" },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      { protocol: "https", hostname: "utfs.io" },
    ],
  },
};

export default nextConfig;
