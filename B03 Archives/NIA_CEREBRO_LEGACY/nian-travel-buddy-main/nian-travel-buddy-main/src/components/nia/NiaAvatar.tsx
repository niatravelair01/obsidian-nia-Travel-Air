import { cn } from "@/lib/utils";
import logoNiaBlack from "@/assets/logo-nia-black.png";
import logoNiaWhite from "@/assets/logo-nia-white.png";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface NiaAvatarProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isProcessing?: boolean;
  isSpeaking?: boolean;
  isHovered?: boolean;
  className?: string;
}

export function NiaAvatar({ 
  size = "md", 
  isProcessing = false, 
  isSpeaking = false,
  isHovered = false,
  className 
}: NiaAvatarProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [internalHover, setInternalHover] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sizes increased by ~18% for better presence
  const sizeClasses = {
    xs: "w-10 h-10",
    sm: "w-14 h-14",
    md: "w-[80px] h-[80px]",
    lg: "w-[130px] h-[130px]",
    xl: "w-52 h-52",
  };

  const iconSizeClasses = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-[80px] h-[80px]",
    xl: "w-32 h-32",
  };

  const ringClasses = {
    xs: "w-12 h-12",
    sm: "w-16 h-16",
    md: "w-[96px] h-[96px]",
    lg: "w-[156px] h-[156px]",
    xl: "w-60 h-60",
  };

  // Dark mode: white logo | Light mode: black logo
  const isDarkMode = mounted && resolvedTheme === "dark";
  const logoSrc = isDarkMode ? logoNiaWhite : logoNiaBlack;
  const effectiveHover = isHovered || internalHover;

  return (
    <div 
      className={cn("relative flex items-center justify-center group", className)}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      {/* Outer glow ring - subtle ambient presence */}
      <div 
        className={cn(
          "absolute rounded-full",
          "border border-accent/10",
          ringClasses[size],
          "transition-all duration-500 ease-out",
          isProcessing && "animate-nia-processing",
          !isProcessing && !effectiveHover && "animate-nia-ring-glow",
          effectiveHover && "border-accent/25 scale-103"
        )}
        style={{
          background: effectiveHover 
            ? "radial-gradient(circle, hsl(var(--nia-glow) / 0.12) 0%, transparent 65%)"
            : "radial-gradient(circle, hsl(var(--nia-glow) / 0.05) 0%, transparent 65%)"
        }}
      />
      
      {/* Core avatar container */}
      <div 
        className={cn(
          "relative rounded-full flex items-center justify-center",
          sizeClasses[size],
          "bg-gradient-to-br from-accent/10 to-transparent",
          "border border-accent/15",
          "transition-all duration-500 ease-out",
          !isProcessing && !isSpeaking && !effectiveHover && "animate-nia-glow-pulse",
          isProcessing && "animate-nia-pulse",
          isSpeaking && "animate-nia-response-pulse",
          effectiveHover && "border-accent/30"
        )}
      >
        {/* N.IA Logo Icon - Theme-aware */}
        <img 
          src={logoSrc}
          alt="N.IA"
          className={cn(
            iconSizeClasses[size],
            "object-contain",
            "transition-all duration-500 ease-out",
            // Premium presence animation
            !isProcessing && !isSpeaking && !effectiveHover && "animate-nia-presence",
            // Processing state
            isProcessing && "animate-nia-micro-rotate",
            // Speaking/responding
            isSpeaking && "animate-nia-response-pulse",
            // Hover
            effectiveHover && "scale-105"
          )}
        />
      </div>
    </div>
  );
}
