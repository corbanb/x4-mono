"use client";

import { cn } from "@/lib/utils";

interface ShimmerButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
}

export function ShimmerButton({
  children,
  className,
  href,
}: ShimmerButtonProps) {
  const classes = cn(
    "group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
    className
  );

  const inner = (
    <>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-glow via-blue-glow to-cyan-glow" />
      {/* Shimmer overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      {/* Glow effect */}
      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-glow via-blue-glow to-cyan-glow opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-40" />
      <span className="relative z-10">{children}</span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {inner}
      </a>
    );
  }

  return <button className={classes}>{inner}</button>;
}
