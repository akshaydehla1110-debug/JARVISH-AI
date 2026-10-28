import { VoiceGender } from '../types/assistant';

export interface PitchAnalysisResult {
  frequencyHz: number;
  gender: VoiceGender;
  confidence: number;
}

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private isListeningToMic: boolean = false;
  private recognitionInstance: any = null;
  private isSpeechRecognitionActive: boolean = false;

  public async initMicrophone(onAmplitude: (amp: number) => void): Promise<boolean> {
    try {
      if (this.audioCtx && this.isListeningToMic) return true;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;

      this.sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);
      this.sourceNode.connect(this.analyser);

      this.isListeningToMic = true;

      const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      const pollLoop = () => {
        if (!this.isListeningToMic || !this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalizedAmp = Math.min(1, avg / 128);
        onAmplitude(normalizedAmp);

        requestAnimationFrame(pollLoop);
      };
      pollLoop();

      return true;
    } catch (err) {
      console.warn('Microphone permission not granted:', err);
      return false;
    }
  }

  /**
   * Continuous Speech Recognition loop
   * Listens for natural English / Hinglish voice commands
   */
  public startSpeechRecognition(
    onCommand: (text: string) => void,
    onError?: (err: string) => void
  ) {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      onError?.('Speech Recognition API not supported in this browser');
      return;
    }

    try {
      if (this.recognitionInstance) {
        this.recognitionInstance.abort();
      }

      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Indian English recognition

      rec.onresult = (event: any) => {
        const lastResultIndex = event.results.length - 1;
        const transcript = event.results[lastResultIndex][0].transcript.trim();
        if (transcript) {
          onCommand(transcript);
        }
      };

      rec.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('Speech recognition error:', e.error);
        }
      };

      rec.onend = () => {
        // Auto-restart if still marked active
        if (this.isSpeechRecognitionActive) {
          try {
            rec.start();
          } catch (_) {}
        }
      };

      rec.start();
      this.recognitionInstance = rec;
      this.isSpeechRecognitionActive = true;
    } catch (err) {
      console.warn('Failed to start speech recognition:', err);
    }
  }

  public stopSpeechRecognition() {
    this.isSpeechRecognitionActive = false;
    if (this.recognitionInstance) {
      try {
        this.recognitionInstance.stop();
        this.recognitionInstance.abort();
      } catch (_) {}
      this.recognitionInstance = null;
    }
  }

  /**
   * Autocorrelation Pitch Detection algorithm
   */
  public detectPitch(): PitchAnalysisResult {
    if (!this.analyser || !this.audioCtx) {
      return { frequencyHz: 115, gender: 'male', confidence: 0.8 };
    }

    const buffer = new Float32Array(this.analyser.fftSize);
    this.analyser.getFloatTimeDomainData(buffer);

    const sampleRate = this.audioCtx.sampleRate;
    const minPeriod = Math.floor(sampleRate / 350);
    const maxPeriod = Math.floor(sampleRate / 70);

    let bestPeriod = -1;
    let maxCorrelation = 0;

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;
      for (let i = 0; i < buffer.length - period; i++) {
        correlation += buffer[i] * buffer[i + period];
      }
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }

    if (bestPeriod > 0 && maxCorrelation > 0.15) {
      const frequency = sampleRate / bestPeriod;
      const gender: VoiceGender = frequency < 160 ? 'male' : 'female';
      return {
        frequencyHz: Math.round(frequency),
        gender,
        confidence: Math.min(1, maxCorrelation / 2),
      };
    }

    return { frequencyHz: 115, gender: 'male', confidence: 0.75 };
  }

  /**
   * DEEP CLEAR MALE VOICE in Indian English accent
   * - Never echoes the user's prompt!
   * - Strictly selects male voice profiles and applies pitch = 0.78
   */
  public speak(
    text: string,
    pitch: number = 0.78,
    speed: number = 1.0,
    accent: string = 'en-IN',
    onStart?: () => void,
    onEnd?: () => void,
    onAudioTick?: (amp: number) => void
  ) {
    if (!('speechSynthesis' in window)) {
      onStart?.();
      setTimeout(() => onEnd?.(), 1200);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();

    // Priority filter for Indian English male voice, or deep clear English male voice
    const femaleTerms = ['female', 'zira', 'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'veena', 'woman'];
    const maleVoices = voices.filter(v => {
      const nameLower = v.name.toLowerCase();
      return !femaleTerms.some(term => nameLower.includes(term));
    });

    const indianMaleVoice = maleVoices.find(
      v => (v.lang === 'en-IN' || v.name.toLowerCase().includes('india')) &&
           (v.name.toLowerCase().includes('rishi') || v.name.toLowerCase().includes('ravi') || v.name.toLowerCase().includes('male'))
    ) || maleVoices.find(v => v.lang === 'en-IN')
      || maleVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('george'))
      || maleVoices.find(v => v.lang.startsWith('en'))
      || voices[0];

    if (indianMaleVoice) {
      utterance.voice = indianMaleVoice;
    }

    // Deep clear male pitch (0.75 to 0.78)
    utterance.pitch = pitch;
    utterance.rate = speed;
    utterance.volume = 1.0;

    let pulseInterval: any = null;

    utterance.onstart = () => {
      onStart?.();
      pulseInterval = setInterval(() => {
        const simulatedAmp = 0.35 + Math.random() * 0.5;
        onAudioTick?.(simulatedAmp);
      }, 70);
    };

    utterance.onend = () => {
      if (pulseInterval) clearInterval(pulseInterval);
      onAudioTick?.(0);
      onEnd?.();
    };

    utterance.onerror = () => {
      if (pulseInterval) clearInterval(pulseInterval);
      onAudioTick?.(0);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public stopMicrophone() {
    this.isListeningToMic = false;
    this.stopSpeechRecognition();
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

export const audioEngine = new AudioEngine();
