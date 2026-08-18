import { MainLayout } from "@/components/layout/MainLayout";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NiaAvatar } from "@/components/nia/NiaAvatar";
import { useNiaRealtimeChat } from "@/hooks/useNiaRealtimeChat";

export default function Decisao() {
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    isProcessing,
    sendTextMessage,
  } = useNiaRealtimeChat("decisao");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim() || isProcessing) return;
    sendTextMessage(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-2rem)] p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground">
            Decisão Difícil
          </h1>
          <p className="text-muted-foreground mt-1">
            Analise opções estratégicas com clareza sobre riscos e trade-offs.
          </p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
              <NiaAvatar size="sm" />
              <div className="flex-1">
                <p className="text-sm text-foreground">
                  Olá! Sou a N.IA. Me conte sobre a decisão que você está enfrentando — 
                  vou apresentar as opções, prós, contras e riscos de forma objetiva 
                  para ajudar você a decidir com mais clareza.
                </p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-primary/10 ml-8"
                  : "bg-muted/50 mr-8"
              }`}
            >
              {message.role === "nia" && <NiaAvatar size="sm" />}
              <div className="flex-1">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 mr-8">
              <NiaAvatar size="sm" />
              <div className="flex-1">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="flex gap-2 items-end">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Descreva a decisão que você precisa tomar..."
            className="min-h-[60px] max-h-[120px] resize-none"
            disabled={isProcessing}
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isProcessing}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
