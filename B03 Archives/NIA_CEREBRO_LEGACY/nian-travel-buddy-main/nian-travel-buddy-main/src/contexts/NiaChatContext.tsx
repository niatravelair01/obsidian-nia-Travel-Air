import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabaseFixed as supabase } from "@/lib/supabase-fixed";
import { useLocation } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════════
// NIA CHAT CONTEXT — CENTRAL ÚNICA DE CONVERSA
// Arquitetura Absoluta: Uma única central de conversa em toda a plataforma.
// Histórico contínuo, único e preservado durante toda a sessão.
// ═══════════════════════════════════════════════════════════════════════════════

// Action types that NIA can trigger
interface NiaClientAction {
  name: string;
  phone?: string | null;
  email?: string | null;
  destination?: string | null;
  notes?: string | null;
  status?: string;
}

export interface NiaMessage {
  id: string;
  role: "user" | "nia";
  content: string;
  timestamp: Date;
  page?: string; // Página onde a mensagem foi enviada
}

interface NiaChatContextType {
  // State
  messages: NiaMessage[];
  isOpen: boolean;
  isProcessing: boolean;
  currentPage: string;
  
  // Actions
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  sendMessage: (text: string, onResponse?: (response: string) => void) => Promise<void>;
  clearHistory: () => void;
}

const NiaChatContext = createContext<NiaChatContextType | undefined>(undefined);

// Map routes to context names for the AI
const getContextFromPath = (pathname: string): string => {
  const contextMap: Record<string, string> = {
    '/': 'dashboard',
    '/clientes': 'clientes',
    '/orcamentos': 'orcamentos',
    '/followups': 'followups',
    '/prioridades': 'prioridades',
    '/relatorios': 'relatorios',
    '/viagens': 'viagens',
    '/gargalos': 'gargalos',
    '/treinamento': 'treinamento',
    '/configuracoes': 'configuracoes',
    '/tarefas': 'tarefas',
    '/blindagem': 'blindagem',
    '/decisao': 'decisao',
    '/onboarding': 'onboarding',
  };
  return contextMap[pathname] || 'general';
};

// Map routes to human-readable page names
const getPageNameFromPath = (pathname: string): string => {
  const nameMap: Record<string, string> = {
    '/': 'Dashboard',
    '/clientes': 'Clientes',
    '/orcamentos': 'Orçamentos',
    '/followups': 'Follow-ups',
    '/prioridades': 'Prioridades do Dia',
    '/relatorios': 'Relatórios',
    '/viagens': 'Viagens',
    '/gargalos': 'Detector de Gargalos',
    '/treinamento': 'Treinamento',
    '/configuracoes': 'Banco de Dados da Agência',
    '/tarefas': 'Tarefas',
    '/blindagem': 'Blindagem',
    '/decisao': 'Decisão',
    '/onboarding': 'Onboarding',
    '/conversa': 'Central da N.IA',
  };
  return nameMap[pathname] || 'Navegação';
};

export function NiaChatProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const location = useLocation();
  
  // State
  const [messages, setMessages] = useState<NiaMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load message history from Supabase on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(50);

        if (error) {
          console.error("[NIA] Error loading history:", error);
        } else if (data && data.length > 0) {
          const formattedMessages: NiaMessage[] = data.map(msg => ({
            id: msg.id,
            role: msg.role as "user" | "nia",
            content: msg.content,
            timestamp: new Date(msg.created_at),
            page: msg.context || undefined
          }));
          setMessages(formattedMessages);
        } else {
          // Default welcome if no history
          setMessages([
            {
              id: "welcome",
              role: "nia",
              content: "Olá! Sou a N.IA, sua sócia estratégica. Como posso ajudar com a Noma Travel hoje?",
              timestamp: new Date(),
              page: "Dashboard",
            },
          ]);
        }
      } catch (err) {
        console.error("[NIA] Failed to fetch chat history:", err);
      }
    };
    
    loadHistory();
  }, []);

  // Current page tracking
  const currentPage = getPageNameFromPath(location.pathname);
  const currentContext = getContextFromPath(location.pathname);
  
  // Ref for message history to use in API calls
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const addMessage = useCallback(async (role: "user" | "nia", content: string, page?: string) => {
    // Generate a temporary ID for optimistic UI
    const tempId = Date.now().toString();
    const newMessage: NiaMessage = {
      id: tempId,
      role,
      content,
      timestamp: new Date(),
      page,
    };
    
    // Optimistic update
    setMessages(prev => [...prev, newMessage]);

    // Save to Supabase for persistence
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        console.warn("[NIA] Message created but not saved to DB: No authenticated user.");
        return newMessage;
      }

      const { data, error } = await supabase.from('chat_messages').insert({
        role,
        content,
        context: page,
        company_id: userId
      }).select().single();

      if (error) {
        console.error("[NIA] Error saving message to database:", error);
      } else if (data) {
        // Update the message in state with the real DB ID
        setMessages(prev => prev.map(m => m.id === tempId ? {
          ...m,
          id: data.id,
          timestamp: new Date(data.created_at)
        } : m));
      }
    } catch (err) {
      console.error("[NIA] Critical error in message persistence:", err);
    }

    return newMessage;
  }, []);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);
  
  const clearHistory = useCallback(async () => {
    try {
      await supabase.from('chat_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      setMessages([
        {
          id: "welcome-new",
          role: "nia",
          content: "Histórico limpo. Estou pronta para uma nova conversa.",
          timestamp: new Date(),
          page: currentPage,
        },
      ]);
    } catch (err) {
      console.error("[NIA] Error clearing history:", err);
    }
  }, [currentPage]);

  // Parse and execute actions from NIA's response
  const processNiaActions = useCallback(async (message: string): Promise<string> => {
    // Check for CREATE_CLIENT action
    const clientActionMatch = message.match(/\[ACTION:CREATE_CLIENT\]([\s\S]*?)\[\/ACTION:CREATE_CLIENT\]/);
    
    if (clientActionMatch) {
      try {
        const clientData: NiaClientAction = JSON.parse(clientActionMatch[1].trim());
        console.log("[NIA] Detected CREATE_CLIENT action:", clientData);
        
        const { data, error } = await supabase.functions.invoke("nia-create-client", {
          body: {
            action: "upsert",
            client: {
              ...clientData,
            },
            triggered_by: "nia-chat",
          },
        });
        
        if (error) {
          console.error("[NIA] Error creating client:", error);
          toast({
            title: "Erro ao criar cliente",
            description: "Não foi possível adicionar o cliente. Tente novamente.",
            variant: "destructive",
          });
        } else {
          console.log("[NIA] Client created successfully:", data);
          toast({
            title: "Cliente adicionado",
            description: `${clientData.name} foi adicionado à sua lista.`,
          });
        }
      } catch (parseError) {
        console.error("[NIA] Error parsing client action:", parseError);
      }
      
      // Remove action tags from displayed message
      return message.replace(/\[ACTION:CREATE_CLIENT\][\s\S]*?\[\/ACTION:CREATE_CLIENT\]/, "").trim();
    }
    
    return message;
  }, [toast]);

  const sendMessage = useCallback(async (text: string, onResponse?: (response: string) => void) => {
    if (!text.trim()) return;

    // Add user message to state and database
    await addMessage("user", text, currentPage);
    setIsProcessing(true);

    try {
      // Build message history for context (last 20 messages)
      const messageHistory = messagesRef.current.slice(-20).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Add the current message
      messageHistory.push({ role: "user", content: text });

      const { data, error } = await supabase.functions.invoke("nia-text-chat", {
        body: { 
          messages: messageHistory,
          context: currentContext,
          currentPage: currentPage,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.message) {
        // Process any actions in the response
        const cleanedMessage = await processNiaActions(data.message);
        
        // Add assistant message to state and database
        await addMessage("nia", cleanedMessage, currentPage);
        
        // Call response callback for TTS
        if (onResponse) {
          onResponse(cleanedMessage);
        }
      }
    } catch (error) {
      console.error("NIA Chat error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [addMessage, currentContext, currentPage, toast, processNiaActions]);

  return (
    <NiaChatContext.Provider
      value={{
        messages,
        isOpen,
        isProcessing,
        currentPage,
        openChat,
        closeChat,
        toggleChat,
        sendMessage,
        clearHistory,
      }}
    >
      {children}
    </NiaChatContext.Provider>
  );
}

export function useNiaChat() {
  const context = useContext(NiaChatContext);
  if (context === undefined) {
    throw new Error("useNiaChat must be used within a NiaChatProvider");
  }
  return context;
}
