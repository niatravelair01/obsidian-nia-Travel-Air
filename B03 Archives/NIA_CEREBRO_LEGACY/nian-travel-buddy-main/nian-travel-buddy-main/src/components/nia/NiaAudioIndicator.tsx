import { cn } from "@/lib/utils";
import { Mic, MicOff } from "lucide-react";
import { useNiaAudio } from "@/contexts/NiaAudioContext";

// ═══════════════════════════════════════════════════════════════════════════════
// NIA AUDIO INDICATOR — FEEDBACK VISUAL OBRIGATÓRIO
// 
// REGRA: Sempre que o áudio estiver ativo, deve existir:
//   - Ícone de microfone ativo
//   - Texto pequeno visível: "Ouvindo"
//
// Sem indicador visível, a escuta não é permitida.
// ═══════════════════════════════════════════════════════════════════════════════

interface NiaAudioIndicatorProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export function NiaAudioIndicator({ 
  className,
  showText = true,
  size = "md" 
}: NiaAudioIndicatorProps) {
  const { audioState, isListening, isSpeaking, isProcessing } = useNiaAudio();
  
  // Don't render if idle
  if (audioState === "idle") {
    return null;
  }
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  
  const containerSizes = {
    sm: "px-2 py-1 text-xs gap-1.5",
    md: "px-3 py-1.5 text-sm gap-2",
    lg: "px-4 py-2 text-base gap-2.5",
  };
  
  const getStatusText = () => {
    switch (audioState) {
      case "listening":
        return "Ouvindo";
      case "processing":
        return "Processando";
      case "speaking":
        return "Falando";
      default:
        return "";
    }
  };
  
  const getStatusColor = () => {
    switch (audioState) {
      case "listening":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "speaking":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };
  
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border",
        containerSizes[size],
        getStatusColor(),
        isListening && "animate-pulse",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Mic 
        className={cn(
          sizeClasses[size],
          isListening && "animate-pulse"
        )} 
      />
      {showText && (
        <span className="font-medium">{getStatusText()}</span>
      )}
    </div>
  );
}

// Compact version for tight spaces
export function NiaAudioIndicatorCompact({ className }: { className?: string }) {
  const { audioState, isListening } = useNiaAudio();
  
  if (audioState === "idle") {
    return null;
  }
  
  return (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full",
        isListening ? "bg-green-500/20 text-green-400" : "bg-blue-500/20 text-blue-400",
        isListening && "animate-pulse",
        className
      )}
      role="status"
      aria-label={isListening ? "Ouvindo" : "Falando"}
    >
      <Mic className="h-4 w-4" />
    </div>
  );
}
