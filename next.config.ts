import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The privacy SDK ships ESM only and is consumed on the server in the redeem
  // route; leaving it unbundled keeps its dynamic imports intact.
  serverExternalPackages: ["@starkware-libs/starknet-privacy-sdk"],
};

export default nextConfig;
