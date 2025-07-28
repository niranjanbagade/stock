/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["ui-avatars.com", "drive.google.com", "res.cloudinary.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "/uc*", // This will match the correct image URL format
      },
    ],
  },
};

export default nextConfig;
