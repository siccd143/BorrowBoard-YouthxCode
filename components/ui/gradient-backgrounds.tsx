"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type GradientBackgroundProps = {
  children?: React.ReactNode;
  className?: string;
  tone?: "indigo" | "slate";
};

export const Component = ({
  children,
  className,
  tone = "indigo",
}: GradientBackgroundProps) => {
  const [count] = useState(0);
  const gradient =
    tone === "slate"
      ? "radial-gradient(125% 125% at 50% 10%, #fff 40%, #475569 100%)"
      : "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)";

  return (
    <div className={cn("min-h-screen w-full relative overflow-hidden", className)} data-count={count}>
      <div
        className="absolute inset-0 z-0"
        style={{
          background: gradient,
        }}
      />
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_18%_18%,rgba(245,158,11,0.16),transparent_28%),radial-gradient(circle_at_78%_8%,rgba(99,102,241,0.16),transparent_30%),linear-gradient(135deg,rgba(255,247,237,0.72),rgba(255,255,255,0.28)_42%,rgba(241,245,249,0.44))]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Component;
