// Audio recording utility for voice input
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(): Promise<void> {
    try {
      this.audioChunks = [];
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      // Try to use webm format first, fallback to other formats
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg',
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: selectedMimeType || undefined,
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // Collect data every 100ms
      console.log("Recording started with mimeType:", selectedMimeType);
    } catch (error) {
      console.error("Error starting recording:", error);
      throw error;
    }
  }

  async stop(): Promise<{ blob: Blob; base64: string; mimeType: string } | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === 'inactive') {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = async () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const blob = new Blob(this.audioChunks, { type: mimeType });
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({ blob, base64, mimeType });
        };
        reader.readAsDataURL(blob);

        // Clean up
        this.cleanup();
      };

      this.mediaRecorder.stop();
    });
  }

  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
    this.mediaRecorder = null;
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

// Audio player for TTS output
export class AudioPlayer {
  private audio: HTMLAudioElement | null = null;
  private onPlayStart?: () => void;
  private onPlayEnd?: () => void;

  constructor(callbacks?: { onPlayStart?: () => void; onPlayEnd?: () => void }) {
    this.onPlayStart = callbacks?.onPlayStart;
    this.onPlayEnd = callbacks?.onPlayEnd;
  }

  async playBase64Audio(base64Audio: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.stop(); // Stop any currently playing audio

        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;
        this.audio = new Audio(audioUrl);

        this.audio.onplay = () => {
          console.log("Audio playback started");
          this.onPlayStart?.();
        };

        this.audio.onended = () => {
          console.log("Audio playback ended");
          this.onPlayEnd?.();
          resolve();
        };

        this.audio.onerror = (error) => {
          console.error("Audio playback error:", error);
          this.onPlayEnd?.();
          reject(error);
        };

        this.audio.play().catch(reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
      this.onPlayEnd?.();
    }
  }

  pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  resume(): void {
    if (this.audio && this.audio.paused) {
      this.audio.play();
    }
  }

  isPaused(): boolean {
    return this.audio?.paused ?? true;
  }

  isPlaying(): boolean {
    return this.audio !== null && !this.audio.paused && !this.audio.ended;
  }
}
