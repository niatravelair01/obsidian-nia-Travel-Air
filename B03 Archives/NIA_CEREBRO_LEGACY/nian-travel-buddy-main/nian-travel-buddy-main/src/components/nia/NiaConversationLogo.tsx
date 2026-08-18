import { cn } from "@/lib/utils";
import logoNiaBlack from "@/assets/logo-nia-black.png";
import logoNiaWhite from "@/assets/logo-nia-white.png";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

type VoiceState = "idle" | "listening" | "speaking";

interface NiaConversationLogoProps {
  state: VoiceState;
  className?: string;
}

export function NiaConversationLogo({ 
  state = "idle",
  className 
}: NiaConversationLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = mounted && resolvedTheme === "dark";
  const logoSrc = isDarkMode ? logoNiaWhite : logoNiaBlack;
  const isActive = state === "listening" || state === "speaking";

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {/* Outermost expanding ring - only visible when active */}
      {isActive && (
        <div 
          className="absolute rounded-full border border-accent/10 animate-nia-ring-expand"
          style={{
            width: "200px",
            height: "200px",
          }}
        />
      )}

      {/* Outer ambient ring */}
      <div 
        className={cn(
          "absolute rounded-full transition-all duration-700 ease-out",
          "border",
          isActive ? "border-accent/25" : "border-accent/10",
          isActive && "animate-nia-ring-pulse"
        )}
        style={{
          width: "180px",
          height: "180px",
          background: isActive 
            ? "radial-gradient(circle, hsl(var(--nia-glow) / 0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, hsl(var(--nia-glow) / 0.05) 0%, transparent 70%)"
        }}
      />

      {/* Middle ring */}
      <div 
        className={cn(
          "absolute rounded-full transition-all duration-500 ease-out",
          "border",
          isActive ? "border-accent/30" : "border-accent/15",
          state === "speaking" && "animate-nia-ring-pulse-reverse"
        )}
        style={{
          width: "150px",
          height: "150px",
          animationDelay: "0.3s"
        }}
      />

      {/* Inner glow ring */}
      <div 
        className={cn(
          "absolute rounded-full transition-all duration-500 ease-out",
          isActive ? "border-accent/35" : "border-accent/20",
          "border"
        )}
        style={{
          width: "125px",
          height: "125px",
          background: isActive 
            ? "radial-gradient(circle, hsl(var(--nia-glow) / 0.15) 0%, transparent 60%)"
            : "transparent"
        }}
      />

      {/* Core container with logo */}
      <div 
        className={cn(
          "relative rounded-full flex items-center justify-center",
          "w-[100px] h-[100px]",
          "bg-gradient-to-br from-accent/15 to-accent/5",
          "border transition-all duration-500 ease-out",
          isActive ? "border-accent/40" : "border-accent/20",
          // Animations based on state
          state === "idle" && "animate-nia-idle-breathe",
          state === "listening" && "animate-nia-listening-pulse",
          state === "speaking" && "animate-nia-speaking-pulse"
        )}
        style={{
          boxShadow: isActive 
            ? "0 0 40px hsl(var(--nia-glow) / 0.2), 0 0 80px hsl(var(--nia-glow) / 0.1)"
            : "0 0 20px hsl(var(--nia-glow) / 0.08)"
        }}
      >
        {/* Dark mode: subtle inner glow for contrast */}
        {isDarkMode && (
          <div 
            className="absolute inset-2 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%)"
            }}
          />
        )}

        {/* N.IA Logo */}
        <img 
          src={logoSrc}
          alt="N.IA"
          className={cn(
            "w-14 h-14 object-contain relative z-10",
            "transition-all duration-500 ease-out",
            state === "idle" && "animate-nia-logo-idle",
            state === "listening" && "animate-nia-logo-active",
            state === "speaking" && "animate-nia-logo-speaking"
          )}
        />
      </div>
    </div>
  );
}
