import { useState, useRef, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabaseFixed as supabase } from "@/lib/supabase-fixed";
import { VoiceRecorder, AudioPlayer } from "@/utils/VoiceUtils";

interface Message {
  id: string;
  role: "user" | "nia";
  content: string;
  timestamp: Date;
}

type VoiceState = "idle" | "listening" | "processing" | "speaking";

const VOICE_MODE_KEY = "nia-voice-mode-enabled";

export function useNiaVoiceChat(context?: string) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceModeEnabled, setVoiceModeEnabled] = useState(() => {
    // Load preference from localStorage
    try {
      return localStorage.getItem(VOICE_MODE_KEY) === "true";
    } catch {
      return false;
    }
  });
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [microphoneAvailable, setMicrophoneAvailable] = useState(true);
  
  const recorderRef = useRef<VoiceRecorder | null>(null);
  const playerRef = useRef<AudioPlayer | null>(null);

  // Persist voice mode preference
  useEffect(() => {
    try {
      localStorage.setItem(VOICE_MODE_KEY, String(voiceModeEnabled));
    } catch {
      // localStorage not available, ignore
    }
  }, [voiceModeEnabled]);

  // Initialize audio player with callbacks
  const getPlayer = useCallback(() => {
    if (!playerRef.current) {
      playerRef.current = new AudioPlayer({
        onPlayStart: () => setVoiceState("speaking"),
        onPlayEnd: () => setVoiceState("idle"),
      });
    }
    return playerRef.current;
  }, []);

  const addMessage = useCallback((role: "user" | "nia", content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  // Check microphone availability
  const checkMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setMicrophoneAvailable(false);
        return false;
      }

      // Try to get permission status if available
      if (navigator.permissions) {
        try {
          const result = await navigator.permissions.query({ name: "microphone" as PermissionName });
          if (result.state === "denied") {
            setMicrophoneAvailable(false);
            return false;
          }
        } catch {
          // Permission query not supported, continue to try getUserMedia
        }
      }

      return true;
    } catch {
      setMicrophoneAvailable(false);
      return false;
    }
  }, []);

  // Start recording voice
  const startListening = useCallback(async (): Promise<boolean> => {
    try {
      // First check if microphone might be available
      const canTry = await checkMicrophonePermission();
      if (!canTry) {
        toast({
          title: "Microfone indisponível",
          description: "Use o campo de texto para continuar a conversa.",
          variant: "destructive",
        });
        setMicrophoneAvailable(false);
        return false;
      }

      recorderRef.current = new VoiceRecorder();
      await recorderRef.current.start();
      setVoiceState("listening");
      setCurrentTranscript("");
      setMicrophoneAvailable(true);
      return true;
    } catch (error: unknown) {
      console.error("Failed to start recording:", error);
      
      // Determine error type and show appropriate message
      let errorMessage = "Não foi possível acessar o microfone.";
      
      if (error instanceof Error) {
        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          errorMessage = "Permissão de microfone negada. Use o texto para continuar.";
        } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
          errorMessage = "Nenhum microfone encontrado. Use o texto para continuar.";
        } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
          errorMessage = "Microfone em uso por outro app. Tente novamente.";
        }
      }
      
      toast({
        title: "Erro no microfone",
        description: errorMessage,
        variant: "destructive",
      });
      
      setMicrophoneAvailable(false);
      setVoiceState("idle");
      return false;
    }
  }, [toast, checkMicrophonePermission]);

  // Stop recording and transcribe
  const stopListening = useCallback(async (): Promise<string | null> => {
    if (!recorderRef.current) return null;

    try {
      setVoiceState("processing");
      const result = await recorderRef.current.stop();
      
      if (!result) {
        setVoiceState("idle");
        return null;
      }

      // Send to STT edge function
      const { data, error } = await supabase.functions.invoke("nia-speech-to-text", {
        body: { 
          audio: result.base64,
          mimeType: result.mimeType,
        },
      });

      if (error || !data?.text) {
        throw new Error(error?.message || "Falha na transcrição");
      }

      setCurrentTranscript(data.text);
      return data.text;
    } catch (error: unknown) {
      console.error("Transcription error:", error);
      
      // Show user-friendly error with retry option
      toast({
        title: "Erro na transcrição",
        description: "Não foi possível transcrever. Tente novamente ou digite sua mensagem.",
        variant: "destructive",
      });
      
      setVoiceState("idle");
      return null;
    }
  }, [toast]);

  // Cancel recording
  const cancelListening = useCallback(() => {
    recorderRef.current?.cancel();
    setVoiceState("idle");
    setCurrentTranscript("");
    
    toast({
      title: "Gravação cancelada",
      description: "Continue digitando sua mensagem.",
    });
  }, [toast]);

  // Generate speech from text (silent fallback on failure)
  const speakText = useCallback(async (text: string) => {
    if (!voiceModeEnabled) return;

    try {
      const { data, error } = await supabase.functions.invoke("nia-text-to-speech", {
        body: { text, voice: "nova" },
      });

      if (error || !data?.audioContent) {
        // Silent fallback - text is already displayed
        console.warn("TTS fallback to text-only:", error?.message);
        setVoiceState("idle");
        return;
      }

      const player = getPlayer();
      await player.playBase64Audio(data.audioContent);
    } catch (error: unknown) {
      // Silent fallback - don't interrupt conversation flow
      console.error("TTS error (falling back to text):", error);
      setVoiceState("idle");
    }
  }, [voiceModeEnabled, getPlayer]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    getPlayer().stop();
    setVoiceState("idle");
  }, [getPlayer]);

  // Pause/resume speaking
  const togglePauseSpeaking = useCallback(() => {
    const player = getPlayer();
    if (player.isPaused()) {
      player.resume();
    } else {
      player.pause();
    }
  }, [getPlayer]);

  // Send message (text or transcribed voice)
  const sendMessage = useCallback(async (text: string, fromVoice: boolean = false) => {
    if (!text.trim()) return;

    // Add user message immediately
    addMessage("user", text);
    setIsProcessing(true);
    setCurrentTranscript("");

    if (fromVoice) {
      setVoiceState("processing");
    }

    try {
      // Build message history for context
      const messageHistory = messages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));
      
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
        addMessage("nia", data.message);
        
        // If voice mode is enabled, speak the response (with silent fallback)
        if (voiceModeEnabled) {
          await speakText(data.message);
        }
      }
    } catch (error: unknown) {
      console.error("Send message error:", error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      if (voiceState === "processing") {
        setVoiceState("idle");
      }
    }
  }, [messages, addMessage, context, toast, voiceModeEnabled, speakText, voiceState]);

  // Toggle voice mode
  const toggleVoiceMode = useCallback(() => {
    const newState = !voiceModeEnabled;
    setVoiceModeEnabled(newState);
    
    if (!newState) {
      // Disable voice mode - stop any ongoing audio
      stopSpeaking();
      cancelListening();
    }
    
    toast({
      title: newState ? "Modo voz ativado" : "Modo voz desativado",
      description: newState 
        ? "A N.IA responderá em texto e áudio"
        : "A N.IA responderá apenas em texto",
    });
  }, [voiceModeEnabled, stopSpeaking, cancelListening, toast]);

  // Handle voice button press (start/stop recording)
  const handleVoiceButton = useCallback(async () => {
    if (voiceState === "listening") {
      // Stop recording and process
      const transcript = await stopListening();
      if (transcript) {
        await sendMessage(transcript, true);
      }
    } else if (voiceState === "idle" || voiceState === "speaking") {
      // Stop any current speech and start listening
      if (voiceState === "speaking") {
        stopSpeaking();
      }
      // startListening now returns success status
      await startListening();
    }
  }, [voiceState, stopListening, sendMessage, startListening, stopSpeaking]);

  return {
    messages,
    voiceState,
    isProcessing,
    voiceModeEnabled,
    currentTranscript,
    microphoneAvailable,
    // Actions
    sendMessage,
    startListening,
    stopListening,
    cancelListening,
    stopSpeaking,
    togglePauseSpeaking,
    toggleVoiceMode,
    handleVoiceButton,
  };
}
