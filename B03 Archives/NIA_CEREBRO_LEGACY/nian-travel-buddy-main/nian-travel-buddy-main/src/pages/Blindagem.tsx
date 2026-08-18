import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useNiaRealtimeChat } from "@/hooks/useNiaRealtimeChat";

export default function Blindagem() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isProcessing,
    currentNiaResponse,
    sendTextMessage,
  } = useNiaRealtimeChat("blindagem");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentNiaResponse]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendTextMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="text-center">
            <h1 className="text-sm font-medium text-foreground">
              Verificar Riscos
            </h1>
          </div>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-20 pb-32 px-6">
        <div className="max-w-2xl mx-auto w-full">
          {/* Page Header */}
          {messages.length === 0 && !currentNiaResponse && (
            <div className="text-center py-12 animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 border border-accent/20 mb-6">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-xl font-medium text-foreground mb-3">
                Blindagem Anti-Erro
              </h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Descreva o orçamento, cliente, tarefa ou decisão que deseja analisar. 
                N.IA irá identificar riscos e sugerir como mitigá-los.
              </p>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((message) => (
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
                <p className="text-xs text-muted-foreground mt-1.5 px-2">
                  {message.timestamp.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}

            {/* Streaming NIA response */}
            {currentNiaResponse && (
              <div className="animate-fade-in-up text-left">
                <div className="inline-block max-w-[85%] px-5 py-3 rounded-2xl bg-secondary text-secondary-foreground">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentNiaResponse}</p>
                </div>
              </div>
            )}

            {isProcessing && !currentNiaResponse && (
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
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-border p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 bg-secondary rounded-2xl px-5 py-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Descreva o contexto para análise de riscos..."
              className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-xl text-accent hover:bg-accent/10"
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
