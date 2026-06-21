"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Component() {
  const [count] = useState(0);

  return (
    <div className={cn("min-h-screen w-full relative")} data-count={count}>
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)",
        }}
      />
    </div>
  );
}
