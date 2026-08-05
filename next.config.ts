import type { NextConfig } from "next";

// 自动生成版本号：构建日期 + 代码提交标识（每次部署自动变化，无需手动维护）
function buildVersion(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? "";
  const now = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const date = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(
    2,
    "0"
  )}.${String(now.getUTCDate()).padStart(2, "0")}`;
  return sha ? `v${date}-${sha.slice(0, 7)}` : `v${date}-dev`;
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_VERSION: buildVersion(),
  },
  // 部署到香港服务器（Docker）时启用 standalone；本地构建不需要
  output: process.env.NEXT_BUILD_STANDALONE === "1" ? "standalone" : undefined,
};

export default nextConfig;
