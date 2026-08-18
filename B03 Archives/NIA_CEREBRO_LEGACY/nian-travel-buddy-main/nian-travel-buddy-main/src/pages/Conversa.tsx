import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Mic, ArrowLeft, MicOff, Loader2, Volume2, VolumeX, Square, AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useNiaRealtimeChat } from "@/hooks/useNiaRealtimeChat";
import { NiaConversationLogo } from "@/components/nia/NiaConversationLogo";
import { NiaVoiceModeView } from "@/components/nia/NiaVoiceModeView";
import { useNiaChat } from "@/contexts/NiaChatContext";

// ═══════════════════════════════════════════════════════════════════════════════
// CENTRAL DA NIA — TELA CHEIA
// Página dedicada de conversa profunda com voz.
// Usa o contexto global para manter histórico único.
// Matching de canal: áudio → resposta por áudio, texto → resposta por texto.
// ═══════════════════════════════════════════════════════════════════════════════

export default function Conversa() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isVoiceViewActive, setIsVoiceViewActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Use global chat context for shared history
  const { messages: globalMessages, sendMessage: sendGlobalMessage, isProcessing: globalProcessing } = useNiaChat();
  
  // Realtime Voice Chat Hook
  const {
    isConnected,
    isConnecting,
    isSpeaking,
    isProcessing: realtimeProcessing,
    currentTranscript,
    connect,
    disconnect,
    sendTextMessage
  } = useNiaRealtimeChat();

  const isProcessing = globalProcessing || realtimeProcessing || isConnecting;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [globalMessages, currentTranscript]);

  // Handle text send
  const handleSend = useCallback(async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    
    if (isConnected) {
      await sendTextMessage(text);
    } else {
      await sendGlobalMessage(text);
    }
  }, [input, isConnected, sendTextMessage, sendGlobalMessage]);

  // Handle voice button 
  const handleVoiceButton = useCallback(async () => {
    if (isConnected) {
      disconnect();
      setIsVoiceViewActive(false);
    } else {
      await connect();
      setIsVoiceViewActive(true);
    }
  }, [isConnected, connect, disconnect]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Determine logo animation state
  const getLogoState = (): "idle" | "listening" | "speaking" => {
    if (isSpeaking) return "speaking";
    if (isConnected || isConnecting || isProcessing) return "listening";
    return "idle";
  };

  // Get voice button visual state
  const getVoiceButtonState = () => {
    if (isConnecting) {
      return {
        icon: <Loader2 className="h-5 w-5 animate-spin" />,
        className: "text-muted-foreground",
        label: "Conectando...",
      };
    }
    
    if (isConnected) {
      return {
        icon: <Square className="h-5 w-5" />,
        className: "text-red-500 bg-red-500/10 hover:bg-red-500/20 animate-pulse",
        label: "Desconectar NIA",
      };
    }

    if (isSpeaking) {
      return {
        icon: <Volume2 className="h-5 w-5" />,
        className: "text-accent bg-accent/10 hover:bg-accent/20",
        label: "NIA Falando...",
      };
    }

    return {
      icon: <Mic className="h-5 w-5" />,
      className: "text-muted-foreground hover:text-foreground",
      label: "Ligar para NIA",
    };
  };

  const voiceButtonState = getVoiceButtonState();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header — compact on mobile */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-3 md:px-6 py-2 md:py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground h-7 px-2 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1" />
            Voltar
          </Button>
          
          <div className="text-center">
            <h1 className="text-xs md:text-sm font-medium text-foreground">
              N<span className="text-accent">.</span>IA
            </h1>
            <p className="text-[10px] text-muted-foreground">
              {isConnected ? (
                isSpeaking ? (
                  <span className="flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                    Falando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                    Ouvindo...
                  </span>
                )
              ) : (
                "Conversa com voz"
              )}
            </p>
          </div>

          {/* Voice mode toggle */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVoiceViewActive(!isVoiceViewActive)}
              className={cn(
                "h-7 w-7 p-0",
                isVoiceViewActive ? "text-accent" : "text-muted-foreground"
              )}
              title={isVoiceViewActive ? "Sair do modo voz" : "Modo voz imersivo"}
            >
              <AudioLines className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleVoiceButton}
              className={cn(
                "h-7 w-7 p-0",
                isConnected ? "text-accent" : "text-muted-foreground"
              )}
            >
              {isConnected ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Immersive Voice Mode */}
      {isVoiceViewActive && isConnected && (
        <NiaVoiceModeView isListening={!isSpeaking} />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-12 md:pt-20 pb-32 md:pb-48 px-3 md:px-6 overflow-y-auto">
        {/* Estado Inicial — Logo centralizada, visual limpo, sensação de calma */}
        {globalMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] md:min-h-[60vh]">
            {/* Animated NIA Logo — reduced on mobile */}
            <div className="mb-4 md:mb-6 scale-75 md:scale-100">
              <NiaConversationLogo state={getLogoState()} />
            </div>

            {/* Voice Status Indicator - Abaixo da logo quando ativo */}
            {isConnected && (
              <div className="text-center animate-fade-in-up">
                <p className="text-sm text-muted-foreground">
                  {isSpeaking ? (
                    <span className="text-accent">N.IA está falando...</span>
                  ) : (
                    <span className="text-red-500">Pode falar agora</span>
                  )}
                </p>
              </div>
            )}

            {/* Live Transcript Preview - Abaixo da logo */}
            {currentTranscript && isConnected && (
              <div className="mt-4 max-w-md text-center animate-fade-in-up">
                <p className="text-sm text-muted-foreground italic">
                  "{currentTranscript}"
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Logo compacta - Topo da conversa quando há mensagens */}
            <div className="flex justify-center py-6">
              <NiaConversationLogo state={getLogoState()} className="scale-75" />
            </div>

            {/* Voice Status - Inline quando em conversa */}
            {isConnected && (
              <div className="text-center mb-4 animate-fade-in-up">
                <p className="text-xs text-muted-foreground">
                  {isSpeaking ? (
                    <span className="text-accent">N.IA está falando...</span>
                  ) : (
                    <span className="text-red-500">Ouvindo...</span>
                  )}
                </p>
              </div>
            )}

            {/* Messages */}
            <div className="w-full max-w-2xl mx-auto space-y-6">
              {globalMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "animate-fade-in-up",
                    message.role === "user" ? "text-right" : "text-left"
                  )}
                >
                  <div
                    className={cn(
                      "inline-block max-w-[85%] px-5 py-3 rounded-2xl",
                      message.role === "nia"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-accent/10 text-foreground border border-accent/20"
                    )}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 px-2">
                    {message.page && message.role === "user" && (
                      <span className="text-[10px] text-muted-foreground">
                        em {message.page}
                      </span>
                    )}
                    <p className={cn(
                      "text-xs text-muted-foreground",
                      message.role === "user" ? "text-right ml-auto" : ""
                    )}>
                      {message.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Processing indicator */}
              {isProcessing && (
                <div className="animate-fade-in-up">
                  <div className="inline-block bg-secondary px-5 py-3 rounded-2xl">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.3s]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Live transcript in conversation mode */}
              {currentTranscript && isConnected && !isSpeaking && (
                <div className="text-right animate-fade-in-up">
                  <div className="inline-block max-w-[85%] px-5 py-3 rounded-2xl bg-accent/5 border border-accent/10">
                    <p className="text-sm text-muted-foreground italic">"{currentTranscript}"</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
      </main>

      {/* Input Area - Fixed at bottom with welcome message */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="max-w-2xl mx-auto px-3 md:px-6 py-2 md:py-4">
          {/* Welcome message */}
          {globalMessages.length === 0 && !isConnected && !isProcessing && (
            <div className="mb-2 md:mb-4 text-center space-y-0.5">
              <p className="text-xs md:text-sm text-foreground font-medium">
                Sou a N<span className="text-accent">.</span>IA, sua sócia estratégica.
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground">
                Estarei aqui quando precisar.
              </p>
            </div>
          )}
          <div className="flex items-center gap-2 bg-secondary rounded-xl md:rounded-2xl px-3 md:px-5 py-2 md:py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isConnected ? (isSpeaking ? "NIA está falando..." : "Pode falar ou digitar...") : "Digite sua mensagem..."}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              disabled={isProcessing}
            />
            {isConnected && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground" onClick={disconnect}>
                <Square className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8 rounded-lg transition-colors", voiceButtonState.className)}
              onClick={handleVoiceButton}
              disabled={isProcessing}
            >
              {voiceButtonState.icon}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-accent hover:bg-accent/10"
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Subtle helper text */}
          <p className="text-center text-[10px] text-muted-foreground/60 mt-2">
            {isConnected ? (
              isSpeaking ? "Escute a NIA" : "Fale naturalmente"
            ) : (
              "Inicie uma conversa por voz ou texto"
            )}
          </p>
        </div>
      </footer>
    </div>
  );
}
