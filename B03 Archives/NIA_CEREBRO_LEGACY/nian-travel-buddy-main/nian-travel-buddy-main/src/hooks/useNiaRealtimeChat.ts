import { useState, useRef, useCallback } from "react";
import { NiaRealtimeChat, NiaRealtimeChatCallbacks } from "@/utils/NiaRealtimeChat";
import { useToast } from "@/hooks/use-toast";
import { supabaseFixed as supabase } from "@/lib/supabase-fixed";

interface Message {
  id: string;
  role: "user" | "nia";
  content: string;
  timestamp: Date;
  actions?: { type: string; success: boolean; message: string }[];
}

export function useNiaRealtimeChat(context?: string) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [currentNiaResponse, setCurrentNiaResponse] = useState("");
  
  const chatRef = useRef<NiaRealtimeChat | null>(null);

  const addMessage = useCallback((role: "user" | "nia", content: string, actions?: Message["actions"]) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
      actions,
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const callbacks: NiaRealtimeChatCallbacks = {
    onMessage: (event) => {
      console.log("Event received:", event.type);
    },
    onTranscript: (text, isFinal) => {
      if (isFinal && text.trim()) {
        addMessage("user", text);
        setCurrentTranscript("");
        setIsProcessing(true);
      } else {
        setCurrentTranscript(text);
      }
    },
    onNiaResponse: (text, isFinal) => {
      if (isFinal && text.trim()) {
        addMessage("nia", text);
        setCurrentNiaResponse("");
        setIsProcessing(false);
      } else {
        setCurrentNiaResponse(text);
      }
    },
    onConnectionChange: (connected) => {
      setIsConnected(connected);
      setIsConnecting(false);
      if (connected) {
        toast({
          title: "Conectado",
          description: "Modo voz ativo — você pode falar com a N.IA",
        });
      }
    },
    onSpeakingChange: (speaking) => {
      setIsSpeaking(speaking);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
      setIsProcessing(false);
      setIsConnecting(false);
    },
  };

  const connect = useCallback(async () => {
    if (chatRef.current?.isConnected()) {
      return;
    }

    setIsConnecting(true);
    
    try {
      chatRef.current = new NiaRealtimeChat(callbacks);
      await chatRef.current.init();
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    chatRef.current?.disconnect();
    chatRef.current = null;
    setIsConnected(false);
    setIsSpeaking(false);
    setIsProcessing(false);
  }, []);

  // Text message handler - works independently of voice connection
  const sendTextMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Add user message immediately
    addMessage("user", text);
    setIsProcessing(true);

    // If voice is connected, use the realtime API
    if (chatRef.current?.isConnected()) {
      try {
        await chatRef.current.sendTextMessage(text);
      } catch (error) {
        console.error("Failed to send via voice:", error);
        // Fallback to text API if voice fails
        await sendViaTextAPI(text);
      }
      return;
    }

    // Use text API (primary method when voice is not active)
    await sendViaTextAPI(text);
  }, [addMessage, context]);

  // Separate function for text-only API calls
  const sendViaTextAPI = useCallback(async (text: string) => {
    try {
      // Build message history for context
      const messageHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Add the new user message to history
      messageHistory.push({ role: "user", content: text });

      const { data, error } = await supabase.functions.invoke("nia-text-chat", {
        body: { 
          messages: messageHistory,
          context: context || "general"
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.message) {
        // Show action results as toasts
        if (data.actions && Array.isArray(data.actions)) {
          for (const action of data.actions) {
            toast({
              title: action.success ? "✅ Ação executada" : "❌ Erro na ação",
              description: action.message,
              variant: action.success ? "default" : "destructive",
            });
          }
        }

        addMessage("nia", data.message, data.actions);
      }
    } catch (error) {
      console.error("Text API error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [messages, addMessage, context, toast]);

  return {
    messages,
    isConnected,
    isConnecting,
    isSpeaking,
    isProcessing,
    currentTranscript,
    currentNiaResponse,
    connect,
    disconnect,
    sendTextMessage,
  };
}
