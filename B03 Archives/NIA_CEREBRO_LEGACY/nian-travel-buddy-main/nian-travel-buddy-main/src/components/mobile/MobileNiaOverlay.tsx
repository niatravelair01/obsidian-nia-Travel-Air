import { useState, useRef, useEffect, useCallback } from "react";
import { Send, X, Trash2, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NiaAvatar } from "@/components/nia/NiaAvatar";
import { NiaConversationLogo } from "@/components/nia/NiaConversationLogo";
import { NiaVoiceModeView } from "@/components/nia/NiaVoiceModeView";
import { NiaMicButton } from "@/components/nia/NiaMicButton";
import { NiaAudioIndicator } from "@/components/nia/NiaAudioIndicator";
import { useNiaChat } from "@/contexts/NiaChatContext";
import { useNiaAudio } from "@/contexts/NiaAudioContext";

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE NIA OVERLAY — CHAT FULLSCREEN MOBILE
//
// Abre como overlay em tela cheia com blur no fundo.
// Mesma central de conversa, sem criar nova rota.
// ═══════════════════════════════════════════════════════════════════════════════

export function MobileNiaOverlay() {
  const [input, setInput] = useState("");
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isOpen,
    isProcessing,
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
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = useCallback(async (textOverride?: string, fromAudio?: boolean) => {
    const text = textOverride || input.trim();
    if (!text || isProcessing) return;
    setInput("");
    if (!fromAudio) setLastInputChannel("text");
    await sendMessage(text, async (response) => {
      if (fromAudio && response) await speakIfAudioChannel(response);
    });
  }, [input, isProcessing, sendMessage, setLastInputChannel, speakIfAudioChannel]);

  const handleAudioTranscript = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    await handleSend(transcript, true);
  }, [handleSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const hasMessages = messages.length > 1;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-md animate-fade-in">
      {/* Header — compact */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <NiaAvatar size="sm" isProcessing={isProcessing || isListening} />
          <div>
            <h3 className="font-medium text-xs text-foreground flex items-center gap-1.5">
              N<span className="text-accent">.</span>IA
              <NiaAudioIndicator size="sm" showText={false} />
            </h3>
            <p className="text-[9px] text-muted-foreground">
              {audioState === "listening" ? "Ouvindo..." :
               audioState === "speaking" ? "Falando..." :
               isProcessing ? "Processando..." : "Sua sócia estratégica"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7", isVoiceMode ? "text-accent" : "text-muted-foreground")}
            onClick={() => setIsVoiceMode(!isVoiceMode)}
          >
            <AudioLines className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearHistory}>
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={closeChat}>
            <X className="h-3.5 w-3.5 text-muted-foreground" />
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
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {!hasMessages && (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <NiaConversationLogo state={audioState === "listening" ? "listening" : audioState === "speaking" ? "speaking" : "idle"} />
                <p className="text-sm text-muted-foreground text-center max-w-[240px]">
                  Como posso ajudar sua agência hoje?
                </p>
              </div>
            )}

            {hasMessages && messages.map((message) => (
              <div
                key={message.id}
                className={cn("flex gap-3", message.role === "user" && "flex-row-reverse")}
              >
                {message.role === "nia" && <NiaAvatar size="sm" />}
                <div className="flex flex-col max-w-[85%]">
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
                </div>
              </div>
            ))}

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

          {/* Live transcript */}
          {isListening && currentTranscript && (
            <div className="px-4 py-2 bg-status-success/10 border-t border-status-success/20">
              <p className="text-xs text-status-success italic">"{currentTranscript}"</p>
            </div>
          )}

          {/* Input */}
          <div className="p-2.5 border-t border-border bg-background">
            <div className="flex items-center gap-1.5 bg-secondary rounded-lg px-3 py-1.5">
              <NiaMicButton size="sm" onTranscript={handleAudioTranscript} />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Ouvindo..." : "Mensagem..."}
                className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                disabled={isProcessing || isListening}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-accent hover:text-accent hover:bg-accent/10"
                onClick={() => handleSend()}
                disabled={!input.trim() || isProcessing || isListening}
              >
                <Send className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
