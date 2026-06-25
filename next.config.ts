import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native deps out of the bundler so their binaries load at runtime.
  serverExternalPackages: ["onnxruntime-node", "sharp"],
  // Ship the model weights into the serverless function on Vercel.
  outputFileTracingIncludes: {
    "/api/classify-image": ["./models/yolo26n.onnx"],
  },
};

export default nextConfig;
