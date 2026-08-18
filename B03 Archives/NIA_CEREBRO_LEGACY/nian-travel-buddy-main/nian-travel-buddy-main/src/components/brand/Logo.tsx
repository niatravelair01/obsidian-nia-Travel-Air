import logoNiaBlack from "@/assets/logo-nia-black.png";
import logoNiaWhite from "@/assets/logo-nia-white.png";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
}

// Increased sizes by ~18% for better presence
const sizeClasses = {
  sm: "h-[76px] w-[76px]",
  md: "h-[90px] w-[90px]",
  lg: "h-[112px] w-[112px]",
};

export function Logo({ size = "md", className, showText = true }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Dark mode: white logo | Light mode: black logo
  const logoSrc = mounted && resolvedTheme === "light" ? logoNiaBlack : logoNiaWhite;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={logoSrc}
        alt="N.IA Logo"
        className={cn(
          sizeClasses[size],
          "object-contain"
        )}
      />
      {showText && (
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            N<span className="text-accent">.</span>IA
          </h1>
          <p className="text-xs text-muted-foreground">Inteligência para Turismo</p>
        </div>
      )}
    </div>
  );
}
