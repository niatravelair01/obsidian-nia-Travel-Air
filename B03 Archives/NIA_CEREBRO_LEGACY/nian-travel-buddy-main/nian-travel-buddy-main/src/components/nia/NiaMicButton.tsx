import { useState, useCallback } from "react";
import { Mic, MicOff, Square, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNiaAudio } from "@/contexts/NiaAudioContext";
import { useNiaChat } from "@/contexts/NiaChatContext";
import { NiaFirstAudioModal } from "./NiaFirstAudioModal";

// ═══════════════════════════════════════════════════════════════════════════════
// NIA MIC BUTTON — BOTÃO DE CONTROLE DE ÁUDIO
// 
// REGRAS:
//   - Botão de microfone visível em qualquer tela
//   - Clique liga / clique desliga
//   - Estado do botão reflete exatamente o estado real da escuta
//   - Primeira utilização mostra modal explicativo
//
// COMPORTAMENTO:
//   - Entrada por áudio → resposta por áudio (automático via context)
//   - Se usuário começar a falar, NIA interrompe imediatamente qualquer fala
//   - Após captura, envia automaticamente para a Central da NIA
// ═══════════════════════════════════════════════════════════════════════════════

interface NiaMicButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "floating";
  onTranscript?: (text: string) => void;
}

export function NiaMicButton({
  className,
  size = "md",
  variant = "default",
  onTranscript,
}: NiaMicButtonProps) {
  const [showFirstUseModal, setShowFirstUseModal] = useState(false);
  
  const {
    audioState,
    isListening,
    isProcessing,
    isSpeaking,
    hasSeenFirstUseModal,
    startListening,
    stopListening,
    cancelListening,
    interruptNia,
  } = useNiaAudio();
  
  const { sendMessage, openChat } = useNiaChat();
  
  // Handle mic button click
  const handleClick = useCallback(async () => {
    // If NIA is speaking, interrupt her first
    if (isSpeaking) {
      interruptNia();
      return;
    }
    
    // If already listening, stop and process
    if (isListening) {
      const transcript = await stopListening();
      
      // If we got a transcript, send it to NIA
      if (transcript && transcript.trim()) {
        // Notify callback if provided
        if (onTranscript) {
          onTranscript(transcript);
        } else {
          // Default behavior: send to global chat
          openChat();
          await sendMessage(transcript);
        }
      }
      return;
    }
    
    // If processing, cancel
    if (isProcessing) {
      cancelListening();
      return;
    }
    
    // First time using audio? Show modal
    if (!hasSeenFirstUseModal) {
      setShowFirstUseModal(true);
      return;
    }
    
    // Start listening
    await startListening();
  }, [
    isSpeaking,
    isListening,
    isProcessing,
    hasSeenFirstUseModal,
    interruptNia,
    stopListening,
    cancelListening,
    startListening,
    onTranscript,
    openChat,
    sendMessage,
  ]);
  
  // First use modal close handler - start listening after acknowledging
  const handleFirstUseModalClose = useCallback(async () => {
    setShowFirstUseModal(false);
    // Start listening after modal closes
    await startListening();
  }, [startListening]);
  
  // Size variants
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };
  
  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  
  const iconSize = iconSizes[size];
  
  // Button icon based on state
  const getIcon = () => {
    if (isProcessing) {
      return <Loader2 className={cn(iconSize, "animate-spin")} />;
    }
    if (isListening) {
      return <Square className={iconSize} />; // Stop icon
    }
    if (isSpeaking) {
      return <MicOff className={iconSize} />; // Interrupt icon
    }
    return <Mic className={iconSize} />;
  };
  
  // Button label for accessibility
  const getLabel = () => {
    if (isProcessing) return "Processando áudio";
    if (isListening) return "Parar gravação";
    if (isSpeaking) return "Interromper N.IA";
    return "Iniciar gravação";
  };
  
  // Floating variant styles
  // Floating variant: positioned left of chat button for ergonomic access
  const floatingStyles = variant === "floating" 
    ? "fixed bottom-6 right-24 z-40 shadow-lg shadow-accent/25" 
    : "";
  
  return (
    <>
      <div className={cn("relative", variant === "floating" && floatingStyles)}>
        <Button
          variant={isListening ? "default" : "outline"}
          size="icon"
          onClick={handleClick}
          disabled={isProcessing}
          data-tour="nia-mic"
          className={cn(
            sizeClasses[size],
            "rounded-full transition-all duration-200",
            isListening && "bg-status-success hover:bg-status-success/90 border-status-success text-status-success-foreground animate-pulse",
            isSpeaking && "bg-accent hover:bg-accent/90 border-accent text-accent-foreground",
            className
          )}
          aria-label={getLabel()}
        >
          {getIcon()}
        </Button>
        
        {/* Feedback visual obrigatório — "Ouvindo" quando ativo */}
        {isListening && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-status-success whitespace-nowrap animate-fade-in">
            Ouvindo
          </span>
        )}
        
        {isSpeaking && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-accent whitespace-nowrap animate-fade-in">
            Falando
          </span>
        )}
        
        {isProcessing && (
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-muted-foreground whitespace-nowrap animate-fade-in">
            Processando
          </span>
        )}
      </div>
      
      {/* First use modal */}
      <NiaFirstAudioModal
        open={showFirstUseModal}
        onClose={handleFirstUseModalClose}
      />
    </>
  );
}

// Floating variant as separate export for convenience
export function NiaMicFloatingButton() {
  return <NiaMicButton variant="floating" size="lg" />;
}
