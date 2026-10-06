// Robust, real-time Audio Engine with HTML5 Audio and Web Audio Analyser for beat detection and pulsing waveform

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private htmlAudio: HTMLAudioElement | null = null;

  private isPlaying = false;
  private currentTrackId: string | null = null;
  private volume = 0.85;

  private smoothedBass = 0;
  private onTimeUpdateCallback: ((time: number, duration: number) => void) | null = null;
  private onEndCallback: (() => void) | null = null;

  constructor() {
    // Persistent HTMLAudioElement for reliable, gapless playback
    if (typeof window !== 'undefined') {
      this.htmlAudio = new Audio();
      this.htmlAudio.crossOrigin = 'anonymous';
      this.htmlAudio.preload = 'auto';

      this.htmlAudio.ontimeupdate = () => {
        if (this.htmlAudio && this.onTimeUpdateCallback) {
          this.onTimeUpdateCallback(this.htmlAudio.currentTime, this.htmlAudio.duration || 0);
        }
      };

      this.htmlAudio.onended = () => {
        this.isPlaying = false;
        if (this.onEndCallback) this.onEndCallback();
      };
    }
  }

  private initAudioContext() {
    if (typeof window === 'undefined') return;

    if (!this.audioCtx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 128; // 64 frequency bins for crisp real-time reactivity
      this.analyser.smoothingTimeConstant = 0.75; // smooth natural decay

      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.value = this.volume;

      // Connect HTMLAudio element to Web Audio graph if not yet connected
      if (this.htmlAudio && !this.sourceNode) {
        try {
          this.sourceNode = this.audioCtx.createMediaElementSource(this.htmlAudio);
          this.sourceNode.connect(this.analyser);
          this.analyser.connect(this.gainNode);
          this.gainNode.connect(this.audioCtx.destination);
        } catch (e) {
          console.warn('MediaElementSource connection note:', e);
        }
      }
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public setCallbacks(
    onTimeUpdate?: (time: number, duration: number) => void,
    onEnd?: () => void
  ) {
    if (onTimeUpdate) this.onTimeUpdateCallback = onTimeUpdate;
    if (onEnd) this.onEndCallback = onEnd;
  }

  public playTrack(trackId: string, audioUrl?: string, genre: string = 'Rumba'): void {
    this.initAudioContext();
    this.currentTrackId = trackId;
    this.isPlaying = true;

    // Use reliable audio stream: fallback to local preloaded tracks if none specified
    let targetUrl = audioUrl;
    if (!targetUrl || targetUrl.trim().length === 0) {
      const g = genre.toLowerCase();
      if (g.includes('ndombolo') || g.includes('sebene')) {
        targetUrl = '/audio/ndombolo-bokoko.mp3';
      } else if (g.includes('afro') || g.includes('amapiano') || g.includes('pop')) {
        targetUrl = '/audio/afrobeats-cityboys.mp3';
      } else {
        targetUrl = '/audio/rumba-mayday.mp3';
      }
    }

    if (this.htmlAudio) {
      // If same track was paused, simply resume
      if (this.htmlAudio.src.endsWith(targetUrl) && this.htmlAudio.currentTime > 0) {
        this.htmlAudio.play().catch((err) => console.log('Playback error:', err));
        return;
      }

      this.htmlAudio.src = targetUrl;
      this.htmlAudio.currentTime = 0;
      this.htmlAudio.volume = this.volume;

      this.htmlAudio
        .play()
        .then(() => {
          this.isPlaying = true;
        })
        .catch((e) => {
          console.warn('Audio play request had to wait for user interaction:', e);
        });
    }
  }

  public pause(): void {
    this.isPlaying = false;
    if (this.htmlAudio) {
      this.htmlAudio.pause();
    }
  }

  public resume(genre = 'Rumba'): void {
    this.initAudioContext();
    this.isPlaying = true;
    if (this.htmlAudio && this.htmlAudio.src) {
      this.htmlAudio.play().catch(() => {});
    }
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.currentTime = 0;
    }
  }

  public seek(seconds: number): void {
    if (this.htmlAudio && Number.isFinite(seconds)) {
      this.htmlAudio.currentTime = seconds;
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.htmlAudio) {
      this.htmlAudio.volume = this.volume;
    }
    if (this.gainNode) {
      this.gainNode.gain.value = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTime(): number {
    return this.htmlAudio?.currentTime || 0;
  }

  public getDuration(): number {
    return this.htmlAudio?.duration || 0;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Real-time audio waveform and beat analysis
   * Extracts bass kick pulse (sub-bass / kick frequency), mid-range, and full frequency spectrum
   */
  public getAudioMetrics(): {
    waveform: Uint8Array;
    bassPulse: number; // 0 to 1 (instantaneous beat intensity)
    smoothedBass: number; // smoothed glowing pulse (0 to 1)
    isBeatHit: boolean; // boolean kick trigger
  } {
    const binCount = this.analyser ? this.analyser.frequencyBinCount : 32;
    const waveform = new Uint8Array(binCount);

    if (this.analyser && this.isPlaying) {
      this.analyser.getByteFrequencyData(waveform);
    } else if (this.isPlaying) {
      // Natural procedural audio fallback for visualization
      const time = Date.now() / 150;
      for (let i = 0; i < binCount; i++) {
        const wave = Math.sin(time + i * 0.4) * 0.5 + 0.5;
        const kick = Math.max(0, Math.sin(time * 0.75));
        waveform[i] = Math.floor(wave * 120 + kick * 100);
      }
    }

    // Low-frequency bass analysis (bins 0 to 4 in 64 bins represent ~20Hz - ~300Hz, the kick/bass)
    let bassSum = 0;
    const bassBins = Math.min(6, binCount);
    for (let i = 0; i < bassBins; i++) {
      bassSum += waveform[i] || 0;
    }
    const rawBassLevel = bassSum / (bassBins * 255); // 0 to 1

    // Smoothing filter for organic breathing animation
    this.smoothedBass = this.smoothedBass * 0.8 + rawBassLevel * 0.2;
    const isBeatHit = rawBassLevel > 0.62;

    return {
      waveform,
      bassPulse: rawBassLevel,
      smoothedBass: this.smoothedBass,
      isBeatHit,
    };
  }
}

export const audioEngine = new AudioEngine();
