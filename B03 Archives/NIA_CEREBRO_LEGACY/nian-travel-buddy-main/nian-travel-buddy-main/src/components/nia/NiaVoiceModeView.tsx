import { cn } from "@/lib/utils";
import logoNiaBlack from "@/assets/logo-nia-black.png";
import logoNiaWhite from "@/assets/logo-nia-white.png";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// NIA VOICE MODE VIEW — MODO IMERSIVO DE VOZ
// Exibe apenas a logo centralizada com animação de flutuação.
// Quando captando áudio, aplica efeito de pulso.
// ═══════════════════════════════════════════════════════════════════════════════

interface NiaVoiceModeViewProps {
  isListening: boolean;
  className?: string;
}

export function NiaVoiceModeView({ isListening, className }: NiaVoiceModeViewProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && resolvedTheme === "light" ? logoNiaBlack : logoNiaWhite;

  return (
    <div className={cn(
      "fixed inset-0 z-[70] flex flex-col items-center justify-center bg-background transition-opacity duration-500",
      className
    )}>
      {/* Logo with float/pulse animation */}
      <div className={cn(
        "transition-all duration-500",
        isListening ? "animate-voice-pulse" : "animate-voice-float"
      )}>
        <img
          src={logoSrc}
          alt="N.IA"
          className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] object-contain"
        />
      </div>

      {/* Subtle status text */}
      <p className="mt-8 text-sm text-muted-foreground animate-fade-in">
        {isListening ? "Captando áudio..." : "Modo voz ativo — A NIA está ouvindo"}
      </p>
    </div>
  );
}
