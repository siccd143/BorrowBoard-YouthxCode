import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/api/classify-image": ["./models/yolo26n.pt", "./scripts/classify_image.py"],
  },
};

export default nextConfig;
