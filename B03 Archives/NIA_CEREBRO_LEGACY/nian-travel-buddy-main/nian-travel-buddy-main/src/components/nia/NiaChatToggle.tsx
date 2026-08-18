import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNiaChat } from "@/contexts/NiaChatContext";
import { useNiaAudio } from "@/contexts/NiaAudioContext";
import { NiaAvatar } from "./NiaAvatar";

// ═══════════════════════════════════════════════════════════════════════════════
// NIA CHAT TOGGLE BUTTON — BOTÃO ÚNICO PARA ABRIR/FECHAR CHAT
// Não cria chat separado, apenas abre a central única de conversa.
// Integrado com governança de áudio.
// ═══════════════════════════════════════════════════════════════════════════════

export function NiaChatToggle() {
  const { isOpen, toggleChat, isProcessing, messages } = useNiaChat();
  const { audioState, isListening } = useNiaAudio();
  
  // Count unread messages (simplified - could be enhanced with proper read tracking)
  const hasUnread = messages.length > 1 && !isOpen;
  
  // Show special state when listening
  const isActive = isListening || isProcessing;

  return (
    <button
      onClick={toggleChat}
      className={cn(
        "fixed bottom-6 right-6 z-40", // Primary action - rightmost position
        "w-14 h-14 rounded-full",
        "bg-accent hover:bg-accent/90",
        "flex items-center justify-center",
        "shadow-lg shadow-accent/25 hover:shadow-xl hover:shadow-accent/30",
        "transition-all duration-300",
        "group",
        isOpen && "scale-0 opacity-0 pointer-events-none",
        isListening && "ring-2 ring-status-listening ring-offset-2 ring-offset-background"
      )}
      aria-label={isOpen ? "Fechar chat" : "Abrir chat com N.IA"}
    >
      {isActive ? (
        <NiaAvatar size="sm" isProcessing />
      ) : (
        <MessageCircle className="w-6 h-6 text-accent-foreground group-hover:scale-110 transition-transform" />
      )}
      
      {/* Notification dot */}
      {hasUnread && !isActive && (
        <span className="absolute top-0 right-0 w-3 h-3 bg-status-notification rounded-full border-2 border-background animate-pulse" />
      )}
      
      {/* Listening indicator */}
      {isListening && (
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-status-listening whitespace-nowrap font-medium">
          Ouvindo
        </span>
      )}
    </button>
  );
}
