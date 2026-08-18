import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { VoiceRecorder, AudioPlayer } from "@/utils/VoiceUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// NIA AUDIO GOVERNANCE — PROMPT COMPLETO
// 
// PRINCÍPIO: A NIA nunca escuta passivamente.
// A captação só ocorre quando:
//   1. O usuário ativar manualmente o microfone
//   2. OU usar uma palavra-chave válida
//
// COMPORTAMENTO DE RESPOSTA:
//   - Entrada por áudio → resposta por áudio
//   - Entrada por texto → resposta por texto
//   - Interrupção: fala do usuário para NIA imediatamente
//
// Timeout de silêncio: 10 segundos.
// Feedback visual obrigatório quando ouvindo.
// ═══════════════════════════════════════════════════════════════════════════════

export type AudioState = "idle" | "listening" | "processing" | "speaking";
export type InputChannel = "text" | "audio";

interface AudioKeywords {
  activate: string;
  deactivate: string;
}

interface NiaAudioContextType {
  // State
  audioState: AudioState;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  microphoneAvailable: boolean;
  hasSeenFirstUseModal: boolean;
  keywords: AudioKeywords;
  lastInputChannel: InputChannel;
  
  // Actions
  startListening: () => Promise<void>;
  stopListening: () => Promise<string | null>;
  cancelListening: () => void;
  stopSpeaking: () => void;
  interruptNia: () => void;
  speakText: (text: string) => Promise<void>;
  speakIfAudioChannel: (text: string) => Promise<void>;
  setKeywords: (keywords: AudioKeywords) => void;
  markFirstUseModalSeen: () => void;
  setLastInputChannel: (channel: InputChannel) => void;
  
  // Audio data
  currentTranscript: string;
}

const NiaAudioContext = createContext<NiaAudioContextType | undefined>(undefined);

// Local storage keys
const KEYWORDS_KEY = "nia_audio_keywords";
const FIRST_USE_KEY = "nia_audio_first_use_seen";
const SILENCE_TIMEOUT_MS = 10000; // 10 seconds

// Default keywords
const DEFAULT_KEYWORDS: AudioKeywords = {
  activate: "Sócia confere",
  deactivate: "Chega, sócia",
};

export function NiaAudioProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  
  // Core audio state
  const [audioState, setAudioState] = useState<AudioState>("idle");
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [microphoneAvailable, setMicrophoneAvailable] = useState(true);
  const [lastInputChannel, setLastInputChannel] = useState<InputChannel>("text");
  
  // First use modal state
  const [hasSeenFirstUseModal, setHasSeenFirstUseModal] = useState(() => {
    return localStorage.getItem(FIRST_USE_KEY) === "true";
  });
  
  // Keywords state
  const [keywords, setKeywordsState] = useState<AudioKeywords>(() => {
    const saved = localStorage.getItem(KEYWORDS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_KEYWORDS;
      }
    }
    return DEFAULT_KEYWORDS;
  });
  
  // Refs for audio handling
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastAudioActivityRef = useRef<number>(Date.now());
  
  // Derived states
  const isListening = audioState === "listening";
  const isSpeaking = audioState === "speaking";
  const isProcessing = audioState === "processing";
  
  // Initialize audio player
  const getPlayer = useCallback(() => {
    if (!playerRef.current) {
      playerRef.current = new AudioPlayer({
        onPlayStart: () => {
          console.log("[NIA Audio] Speaking started");
          setAudioState("speaking");
        },
        onPlayEnd: () => {
          console.log("[NIA Audio] Speaking ended");
          setAudioState("idle");
        },
      });
    }
    return playerRef.current;
  }, []);
  
  // Clear silence timeout
  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);
  
  // Internal stop listening (without state checks)
  const stopListeningInternal = useCallback(async (): Promise<string | null> => {
    clearSilenceTimeout();
    
    if (!recorderRef.current) {
      setAudioState("idle");
      return null;
    }
    
    try {
      const result = await recorderRef.current.stop();
      recorderRef.current = null;
      
      if (result && result.base64) {
        setAudioState("processing");
        
        // Send to speech-to-text
        const { data, error } = await supabase.functions.invoke("nia-speech-to-text", {
          body: {
            audio: result.base64,
            mimeType: result.mimeType,
          },
        });
        
        if (error) {
          throw error;
        }
        
        const transcript = data?.text || "";
        setCurrentTranscript(transcript);
        setAudioState("idle");
        
        // Mark that input came from audio
        setLastInputChannel("audio");
        
        return transcript;
      }
      
      setAudioState("idle");
      return null;
    } catch (error) {
      console.error("[NIA Audio] Error stopping recording:", error);
      setAudioState("idle");
      return null;
    }
  }, [clearSilenceTimeout]);
  
  // Reset silence timeout (called when audio activity detected)
  const resetSilenceTimeout = useCallback(() => {
    clearSilenceTimeout();
    lastAudioActivityRef.current = Date.now();
    
    silenceTimeoutRef.current = setTimeout(async () => {
      console.log("[NIA Audio] Silence timeout - stopping listening");
      if (audioState === "listening") {
        await stopListeningInternal();
        toast({
          title: "Escuta pausada",
          description: "10 segundos sem fala detectada.",
        });
      }
    }, SILENCE_TIMEOUT_MS);
  }, [audioState, clearSilenceTimeout, stopListeningInternal, toast]);
  
  // Check microphone permission
  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicrophoneAvailable(true);
      return true;
    } catch (error) {
      console.error("[NIA Audio] Microphone permission denied:", error);
      setMicrophoneAvailable(false);
      return false;
    }
  }, []);
  
  // Start listening
  const startListening = useCallback(async () => {
    console.log("[NIA Audio] Start listening requested");
    
    // Check microphone permission
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      toast({
        title: "Microfone não disponível",
        description: "Por favor, permita o acesso ao microfone para usar comandos de voz.",
        variant: "destructive",
      });
      return;
    }
    
    // Stop any ongoing playback (NIA stops speaking when user starts talking)
    if (audioState === "speaking") {
      getPlayer().stop();
    }
    
    // Initialize recorder
    try {
      recorderRef.current = new VoiceRecorder();
      await recorderRef.current.start();
      setAudioState("listening");
      setCurrentTranscript("");
      resetSilenceTimeout();
      console.log("[NIA Audio] Listening started");
    } catch (error) {
      console.error("[NIA Audio] Error starting recording:", error);
      toast({
        title: "Erro ao iniciar gravação",
        description: "Não foi possível acessar o microfone.",
        variant: "destructive",
      });
      setAudioState("idle");
    }
  }, [audioState, checkMicrophonePermission, getPlayer, resetSilenceTimeout, toast]);
  
  // Stop listening (public API) - returns transcript
  const stopListening = useCallback(async (): Promise<string | null> => {
    console.log("[NIA Audio] Stop listening requested");
    return await stopListeningInternal();
  }, [stopListeningInternal]);
  
  // Cancel listening (discard audio)
  const cancelListening = useCallback(() => {
    console.log("[NIA Audio] Cancel listening requested");
    clearSilenceTimeout();
    
    if (recorderRef.current) {
      recorderRef.current.cancel();
      recorderRef.current = null;
    }
    
    setAudioState("idle");
    setCurrentTranscript("");
  }, [clearSilenceTimeout]);
  
  // Stop speaking
  const stopSpeaking = useCallback(() => {
    console.log("[NIA Audio] Stop speaking requested");
    getPlayer().stop();
    setAudioState("idle");
  }, [getPlayer]);
  
  // Interrupt NIA (user starts speaking)
  const interruptNia = useCallback(() => {
    if (audioState === "speaking") {
      console.log("[NIA Audio] User interrupted NIA");
      stopSpeaking();
    }
  }, [audioState, stopSpeaking]);
  
  // Speak text (text-to-speech) - always speaks
  const speakText = useCallback(async (text: string) => {
    if (!text.trim()) return;
    
    console.log("[NIA Audio] Speaking text:", text.substring(0, 50) + "...");
    
    try {
      const { data, error } = await supabase.functions.invoke("nia-text-to-speech", {
        body: { text },
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.audioContent) {
        await getPlayer().playBase64Audio(data.audioContent);
      }
    } catch (error) {
      console.error("[NIA Audio] TTS Error:", error);
      // Silently fail - text fallback is handled by caller
    }
  }, [getPlayer]);
  
  // Speak only if last input was audio (channel matching)
  const speakIfAudioChannel = useCallback(async (text: string) => {
    if (lastInputChannel === "audio") {
      await speakText(text);
    } else {
      console.log("[NIA Audio] Skipping TTS - last input was text");
    }
  }, [lastInputChannel, speakText]);
  
  // Set keywords
  const setKeywords = useCallback((newKeywords: AudioKeywords) => {
    setKeywordsState(newKeywords);
    localStorage.setItem(KEYWORDS_KEY, JSON.stringify(newKeywords));
    console.log("[NIA Audio] Keywords updated:", newKeywords);
  }, []);
  
  // Mark first use modal as seen
  const markFirstUseModalSeen = useCallback(() => {
    setHasSeenFirstUseModal(true);
    localStorage.setItem(FIRST_USE_KEY, "true");
    console.log("[NIA Audio] First use modal marked as seen");
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearSilenceTimeout();
      if (recorderRef.current) {
        recorderRef.current.cancel();
      }
      if (playerRef.current) {
        playerRef.current.stop();
      }
    };
  }, [clearSilenceTimeout]);
  
  return (
    <NiaAudioContext.Provider
      value={{
        // State
        audioState,
        isListening,
        isSpeaking,
        isProcessing,
        microphoneAvailable,
        hasSeenFirstUseModal,
        keywords,
        lastInputChannel,
        
        // Actions
        startListening,
        stopListening,
        cancelListening,
        stopSpeaking,
        interruptNia,
        speakText,
        speakIfAudioChannel,
        setKeywords,
        markFirstUseModalSeen,
        setLastInputChannel,
        
        // Audio data
        currentTranscript,
      }}
    >
      {children}
    </NiaAudioContext.Provider>
  );
}

export function useNiaAudio() {
  const context = useContext(NiaAudioContext);
  if (context === undefined) {
    throw new Error("useNiaAudio must be used within a NiaAudioProvider");
  }
  return context;
}
