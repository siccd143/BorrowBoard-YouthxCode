import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep native deps out of the bundler so their binaries load at runtime.
  serverExternalPackages: ["onnxruntime-node", "sharp"],
  // Ship the model weights into the serverless function on Vercel.
  outputFileTracingIncludes: {
    "/api/classify-image": [
      "./models/yolo26n.onnx",
      "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/onnxruntime_binding.node",
      "./node_modules/onnxruntime-node/bin/napi-v6/linux/x64/libonnxruntime.so.1",
    ],
  },
};

export default nextConfig;
