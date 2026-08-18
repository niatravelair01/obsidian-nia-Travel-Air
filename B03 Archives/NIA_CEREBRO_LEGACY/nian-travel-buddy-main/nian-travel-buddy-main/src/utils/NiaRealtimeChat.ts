import { supabaseFixed as supabase } from "@/lib/supabase-fixed";

export class AudioRecorder {
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private processor: ScriptProcessorNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;

  constructor(private onAudioData: (audioData: Float32Array) => void) {}

  async start() {
    try {
      console.log("Requesting microphone access...");
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.audioContext = new AudioContext({
        sampleRate: 24000,
      });
      
      this.source = this.audioContext.createMediaStreamSource(this.stream);
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        this.onAudioData(new Float32Array(inputData));
      };
      
      this.source.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      console.log("Audio recording started");
    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw error;
    }
  }

  stop() {
    console.log("Stopping audio recording...");
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export interface NiaRealtimeChatCallbacks {
  onMessage: (event: any) => void;
  onTranscript: (text: string, isFinal: boolean) => void;
  onNiaResponse: (text: string, isFinal: boolean) => void;
  onConnectionChange: (connected: boolean) => void;
  onSpeakingChange: (isSpeaking: boolean) => void;
  onError: (error: string) => void;
}

export class NiaRealtimeChat {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private audioEl: HTMLAudioElement;
  private recorder: AudioRecorder | null = null;
  private callbacks: NiaRealtimeChatCallbacks;
  private currentTranscript = "";
  private currentResponse = "";

  constructor(callbacks: NiaRealtimeChatCallbacks) {
    this.callbacks = callbacks;
    this.audioEl = document.createElement("audio");
    this.audioEl.autoplay = true;
  }

  async init() {
    try {
      console.log("Initializing NIA Realtime Chat...");
      
      // Get ephemeral token from our Edge Function
      const { data, error } = await supabase.functions.invoke("nia-realtime-session");
      
      if (error) {
        console.error("Error getting session token:", error);
        throw new Error("Falha ao conectar com a N.IA");
      }
      
      if (!data?.client_secret?.value) {
        console.error("No client secret in response:", data);
        throw new Error("Falha ao obter token de sessão");
      }

      const EPHEMERAL_KEY = data.client_secret.value;
      console.log("Got ephemeral token, setting up WebRTC...");

      // Create peer connection
      this.pc = new RTCPeerConnection();

      // Set up remote audio
      this.pc.ontrack = (e) => {
        console.log("Received audio track");
        this.audioEl.srcObject = e.streams[0];
      };

      // Add local audio track
      const ms = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.pc.addTrack(ms.getTracks()[0]);

      // Set up data channel
      this.dc = this.pc.createDataChannel("oai-events");
      
      this.dc.addEventListener("open", () => {
        console.log("Data channel opened");
        this.callbacks.onConnectionChange(true);
      });

      this.dc.addEventListener("close", () => {
        console.log("Data channel closed");
        this.callbacks.onConnectionChange(false);
      });

      this.dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data);
        this.handleEvent(event);
      });

      // Create and set local description
      const offer = await this.pc.createOffer();
      await this.pc.setLocalDescription(offer);

      // Connect to OpenAI's Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      
      console.log("Connecting to OpenAI Realtime API...");
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${EPHEMERAL_KEY}`,
          "Content-Type": "application/sdp"
        },
      });

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text();
        console.error("SDP response error:", errorText);
        throw new Error("Falha na conexão WebRTC");
      }

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      
      await this.pc.setRemoteDescription(answer);
      console.log("WebRTC connection established");

    } catch (error) {
      console.error("Error initializing chat:", error);
      this.callbacks.onError(error instanceof Error ? error.message : "Erro ao conectar");
      throw error;
    }
  }

  private handleEvent(event: any) {
    console.log("Received event:", event.type);
    this.callbacks.onMessage(event);

    switch (event.type) {
      case "response.audio.delta":
        this.callbacks.onSpeakingChange(true);
        break;

      case "response.audio.done":
        this.callbacks.onSpeakingChange(false);
        break;

      case "conversation.item.input_audio_transcription.completed":
        // User's speech transcription
        const userText = event.transcript || "";
        this.callbacks.onTranscript(userText, true);
        break;

      case "response.audio_transcript.delta":
        // NIA's response transcript (streaming)
        this.currentResponse += event.delta || "";
        this.callbacks.onNiaResponse(this.currentResponse, false);
        break;

      case "response.audio_transcript.done":
        // NIA's response complete
        const finalResponse = event.transcript || this.currentResponse;
        this.callbacks.onNiaResponse(finalResponse, true);
        this.currentResponse = "";
        break;

      case "response.done":
        this.callbacks.onSpeakingChange(false);
        break;

      case "error":
        console.error("Realtime API error:", event.error);
        this.callbacks.onError(event.error?.message || "Erro na comunicação");
        break;
    }
  }

  async sendTextMessage(text: string) {
    if (!this.dc || this.dc.readyState !== 'open') {
      throw new Error('Conexão não está pronta');
    }

    console.log("Sending text message:", text);

    const event = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [
          {
            type: 'input_text',
            text
          }
        ]
      }
    };

    this.dc.send(JSON.stringify(event));
    this.dc.send(JSON.stringify({ type: 'response.create' }));
  }

  disconnect() {
    console.log("Disconnecting NIA Realtime Chat...");
    this.recorder?.stop();
    this.dc?.close();
    this.pc?.close();
    this.audioEl.srcObject = null;
    this.callbacks.onConnectionChange(false);
  }

  isConnected(): boolean {
    return this.dc?.readyState === 'open';
  }
}
