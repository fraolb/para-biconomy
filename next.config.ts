import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@getpara/react-sdk", "@getpara/*"],
};

export default nextConfig;
