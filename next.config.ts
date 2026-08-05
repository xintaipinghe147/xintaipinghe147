import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 部署到香港服务器（Docker）时启用 standalone；本地构建不需要
  output: process.env.NEXT_BUILD_STANDALONE === "1" ? "standalone" : undefined,
};

export default nextConfig;
