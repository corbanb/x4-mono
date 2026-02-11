"use client";

import { cn } from "@/lib/utils";

interface GradientBorderProps {
  children: React.ReactNode;
  className?: string;
  borderWidth?: number;
  animated?: boolean;
}

export function GradientBorder({
  children,
  className,
  borderWidth = 1,
  animated = false,
}: GradientBorderProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        className
      )}
    >
      {/* Gradient border layer */}
      <div
        className={cn(
          "absolute inset-0 rounded-2xl",
          animated && "animate-spin-slow"
        )}
        style={{
          padding: borderWidth,
          background:
            "linear-gradient(135deg, oklch(0.541 0.281 293.009 / 60%), oklch(0.623 0.214 259.815 / 30%), oklch(0.715 0.143 215.221 / 60%))",
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask:
            "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
        }}
      />
      {/* Content */}
      <div className="relative rounded-2xl bg-card">{children}</div>
    </div>
  );
}
