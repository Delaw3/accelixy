"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type LogoProps = {
  width?: number;
  height?: number;
  className?: string;
};

export function Logo({ width = 140, height = 40, className }: LogoProps) {
  const { resolvedTheme, theme } = useTheme();
  const isLightTheme = resolvedTheme === "light" || theme === "light";
  const logoSrc = isLightTheme ? "/brand/dark.png" : "/brand/white.png";

  return (
    <span className={cn("relative inline-flex items-center", className)}>
      <Image
        key={logoSrc}
        src={logoSrc}
        alt="Accelixy logo"
        width={width}
        height={height}
        className="h-auto w-auto"
        priority
      />
    </span>
  );
}
