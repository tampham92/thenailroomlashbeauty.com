import type { NextConfig } from "next";
import { SERVER_ACTION_BODY_LIMIT } from "./src/lib/limits";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default is 1 MB, which rejects every phone photo before the upload
      // action runs. See src/lib/limits.ts for how the layers line up.
      bodySizeLimit: SERVER_ACTION_BODY_LIMIT,
    },
  },
};

export default nextConfig;
