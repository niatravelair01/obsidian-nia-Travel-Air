import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Minimize2, Trash2, MessageCircle, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import { NiaAvatar } from "./NiaAvatar";
import { NiaVoiceModeView } from "./NiaVoiceModeView";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useNiaChat } from "@/contexts/NiaChatContext";
import { useNiaAudio } from "@/contexts/NiaAudioContext";
import { NiaAudioIndicator } from "./NiaAudioIndicator";
import { NiaMicButton } from "./NiaMicButton";

// ═══════════════════════════════════════════════════════════════════════════════
// NIA GLOBAL CHAT — CENTRAL ÚNICA DE CONVERSA
// Uma única central de conversa em toda a plataforma.
// O usuário pode conversar enquanto navega por qualquer área do dashboard.
// ═══════════════════════════════════════════════════════════════════════════════

export function NiaGlobalChat() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isOpen,
    isProcessing,
    currentPage,
    closeChat,
    sendMessage,
    clearHistory,
  } = useNiaChat();
  
  const { 
    audioState, 
    isListening, 
    currentTranscript,
    speakIfAudioChannel,
    setLastInputChannel,
  } = useNiaAudio();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = useCallback(async (textOverride?: string, fromAudio?: boolean) => {
    const text = textOverride || input.trim();
    if (!text || isProcessing) return;
    setInput("");
    
    // Mark input channel for response matching
    if (!fromAudio) {
      setLastInputChannel("text");
    }
    
    // Send message with response callback for TTS
    await sendMessage(text, async (response) => {
      // If input was from audio, speak the response
      if (fromAudio && response) {
        await speakIfAudioChannel(response);
      }
    });
  }, [input, isProcessing, sendMessage, setLastInputChannel, speakIfAudioChannel]);
  
  // Handle audio transcript - mark as audio input for response matching
  const handleAudioTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    await handleSend(transcript, true); // true = from audio
  }, [handleSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExpandToFullPage = () => {
    closeChat();
    navigate("/conversa");
  };

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed right-6 bottom-6 w-96 h-[600px] z-50",
        "surface-card rounded-xl overflow-hidden",
        "flex flex-col",
        "animate-fade-in-up",
        "shadow-2xl shadow-black/50"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-3">
          <NiaAvatar size="sm" isProcessing={isProcessing || isListening} />
          <div>
            <h3 className="font-medium text-sm text-foreground flex items-center gap-2">
              N<span className="text-accent">.</span>IA
              {/* Audio indicator - FEEDBACK VISUAL OBRIGATÓRIO */}
              <NiaAudioIndicator size="sm" showText={false} />
            </h3>
            <p className="text-xs text-muted-foreground">
              {audioState === "listening" ? "Ouvindo..." : 
               audioState === "speaking" ? "Falando..." :
               isProcessing ? "Processando..." : currentPage}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8", isVoiceMode ? "text-accent" : "text-muted-foreground hover:text-foreground")}
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            title={isVoiceMode ? "Sair do modo voz" : "Modo voz imersivo"}
          >
            <AudioLines className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={clearHistory}
            title="Limpar histórico"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleExpandToFullPage}
            title="Expandir para tela cheia"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={closeChat}
            title="Minimizar"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Voice Mode Immersive */}
      {isVoiceMode ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <NiaVoiceModeView isListening={isListening} className="relative inset-auto z-auto" />
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-nia">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "flex-row-reverse"
                )}
              >
                {message.role === "nia" && <NiaAvatar size="sm" />}
                <div className="flex flex-col max-w-[80%]">
                  <div
                    className={cn(
                      "px-4 py-2.5 rounded-xl text-sm",
                      message.role === "nia"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-accent/10 text-foreground border border-accent/20"
                    )}
                  >
                    {message.content}
                  </div>
                  {message.page && message.role === "user" && (
                    <span className="text-[10px] text-muted-foreground mt-1 text-right">
                      em {message.page}
                    </span>
                  )}
                </div>
              </div>
            ))}
            
            {/* Processing indicator */}
            {isProcessing && (
              <div className="flex gap-3">
                <NiaAvatar size="sm" isProcessing />
                <div className="bg-secondary px-4 py-2.5 rounded-xl">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.1s]" />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Live transcript preview */}
          {isListening && currentTranscript && (
            <div className="px-4 py-2 bg-status-success/10 border-t border-status-success/20">
              <p className="text-xs text-status-success italic">
                "{currentTranscript}"
              </p>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2 bg-secondary rounded-xl px-4 py-2">
              {/* Mic button */}
              <NiaMicButton size="sm" onTranscript={handleAudioTranscript} />
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Ouvindo..." : "Digite sua mensagem..."}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                disabled={isProcessing || isListening}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                onClick={() => handleSend()}
                disabled={!input.trim() || isProcessing || isListening}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              {isListening ? "Fale agora ou clique no mic para parar" : "Histórico preservado durante navegação"}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
