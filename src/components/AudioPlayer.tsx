import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  DownloadCloud,
  Check,
  Video,
  Sparkles,
  Share2,
  Maximize2,
  X,
  Activity,
  Radio,
} from 'lucide-react';
import { audioEngine } from '../services/audioEngine';
import { storageService } from '../services/storageService';
import confetti from 'canvas-confetti';

interface AudioPlayerProps {
  media: MediaItem | null;
  onNext: () => void;
  onPrevious: () => void;
  onOpenVideoModal: (media: MediaItem) => void;
  onShare: (media: MediaItem) => void;
  onRewardClaimed: (amount: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  media,
  onNext,
  onPrevious,
  onOpenVideoModal,
  onShare,
  onRewardClaimed,
}) => {
  if (!media) return null;

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.duration || 240);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(() => storageService.isMediaDownloaded(media.id));
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [secondsListened, setSecondsListened] = useState(0);

  // Studio visualizer modal state
  const [showStudioVisualizer, setShowStudioVisualizer] = useState(false);

  // Live beat metrics for React animations
  const [currentBeatPulse, setCurrentBeatPulse] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const REWARD_DURATION = 15; // 15 seconds of active listening yields cash reward

  useEffect(() => {
    // Whenever new track is selected
    setCurrentTime(0);
    setSecondsListened(0);
    setRewardClaimed(false);
    setIsDownloaded(storageService.isMediaDownloaded(media.id));

    audioEngine.setCallbacks(
      (time, dur) => {
        setCurrentTime(time);
        if (dur && Number.isFinite(dur) && dur > 0) {
          setDuration(dur);
        }
      },
      () => {
        if (isLooping) {
          audioEngine.playTrack(media.id, media.audioUrl, media.genre);
        } else {
          onNext();
        }
      }
    );

    audioEngine.playTrack(media.id, media.audioUrl, media.genre);
    setIsPlaying(true);
  }, [media.id]);

  // Handle cash rewards on active listening
  useEffect(() => {
    let timer: number;
    if (isPlaying && !rewardClaimed) {
      timer = window.setInterval(() => {
        setSecondsListened((prev) => {
          const next = prev + 1;
          if (next >= REWARD_DURATION && !rewardClaimed) {
            claimReward();
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, rewardClaimed]);

  const claimReward = () => {
    setRewardClaimed(true);
    const amount = media.cashRewardValue || 80;
    storageService.addCashReward(
      amount,
      `Écoute complète de "${media.title}" - ${media.artist}`,
      'listening'
    );
    onRewardClaimed(amount);

    try {
      confetti({
        particleCount: 40,
        spread: 55,
        origin: { y: 0.85 },
      });
    } catch {
      // ignore
    }
  };

  // High-performance Beat-Pulsing Waveform Rendering
  useEffect(() => {
    let frameCount = 0;

    const render = () => {
      const metrics = audioEngine.getAudioMetrics();
      const { waveform, bassPulse, smoothedBass } = metrics;

      // Update state sparingly (every ~3 frames) to keep React UI smooth without overhead
      frameCount++;
      if (frameCount % 3 === 0) {
        setCurrentBeatPulse(bassPulse);
      }

      // 1. Draw Mini-Player Waveform Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          const barWidth = 3.5;
          const gap = 2;
          const totalBars = Math.floor(canvas.width / (barWidth + gap));
          const step = Math.max(1, Math.floor(waveform.length / totalBars));

          // Draw beat glow backdrop when bass peaks
          if (isPlaying && bassPulse > 0.4) {
            const glowAlpha = Math.min(0.4, (bassPulse - 0.4) * 0.8);
            ctx.fillStyle = `rgba(251, 191, 36, ${glowAlpha})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          for (let i = 0; i < totalBars; i++) {
            const waveVal = isPlaying ? waveform[i * step] || 25 : 8;
            // Height scales with base frequency + dynamic beat pulse magnification
            const beatBoost = 1 + bassPulse * 0.45;
            const height = Math.max(3, ((waveVal / 255) * canvas.height * 0.95) * beatBoost);
            const x = i * (barWidth + gap);
            const y = canvas.height - height;

            // Vibrant gradient: Electric Amber / Gold -> Crimson / Neon Magenta
            const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
            if (bassPulse > 0.65) {
              gradient.addColorStop(0, '#ffffff');
              gradient.addColorStop(0.3, '#fbbf24');
              gradient.addColorStop(1, '#f43f5e');
            } else {
              gradient.addColorStop(0, '#fbbf24');
              gradient.addColorStop(0.5, '#f59e0b');
              gradient.addColorStop(1, '#e11d48');
            }

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, height, 1.5);
            ctx.fill();

            // Add glowing head dot on top of each peak bar
            if (isPlaying && height > 12) {
              ctx.fillStyle = bassPulse > 0.6 ? '#ffffff' : '#fbbf24';
              ctx.beginPath();
              ctx.arc(x + barWidth / 2, y + 1, barWidth / 2, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // 2. Draw Studio Fullscreen Visualizer Canvas (if open)
      const modalCanvas = modalCanvasRef.current;
      if (modalCanvas) {
        const ctx = modalCanvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);

          const centerX = modalCanvas.width / 2;
          const centerY = modalCanvas.height / 2;
          const baseRadius = 85 + smoothedBass * 35; // pulses with kick!

          // Animated pulsating radial ripples
          if (isPlaying) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius + 20 + bassPulse * 40, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.15 + bassPulse * 0.4})`;
            ctx.lineWidth = 2 + bassPulse * 4;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(centerX, centerY, baseRadius + 45 + bassPulse * 65, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(244, 63, 94, ${0.1 + bassPulse * 0.3})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }

          // Circular Radial Equalizer Bars
          const barsCount = 64;
          const angleStep = (Math.PI * 2) / barsCount;

          for (let i = 0; i < barsCount; i++) {
            const angle = i * angleStep;
            const waveVal = isPlaying ? waveform[i % waveform.length] || 20 : 10;
            const barLen = Math.max(6, (waveVal / 255) * 85 * (1 + bassPulse * 0.5));

            const xStart = centerX + Math.cos(angle) * baseRadius;
            const yStart = centerY + Math.sin(angle) * baseRadius;
            const xEnd = centerX + Math.cos(angle) * (baseRadius + barLen);
            const yEnd = centerY + Math.sin(angle) * (baseRadius + barLen);

            const gradient = ctx.createLinearGradient(xStart, yStart, xEnd, yEnd);
            gradient.addColorStop(0, '#fbbf24');
            gradient.addColorStop(0.7, '#f43f5e');
            gradient.addColorStop(1, '#818cf8');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3.5;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(xStart, yStart);
            ctx.lineTo(xEnd, yEnd);
            ctx.stroke();
          }
        }
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      audioEngine.resume(media.genre);
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    audioEngine.seek(val);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioEngine.setVolume(volume || 0.8);
      setIsMuted(false);
    } else {
      audioEngine.setVolume(0);
      setIsMuted(true);
    }
  };

  const handleDownload = () => {
    if (!isDownloaded) {
      storageService.saveMediaOffline(media);
      setIsDownloaded(true);
    }
  };

  const formatTime = (secs: number) => {
    if (!Number.isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* 1. Main Persistent Bottom Dock Player */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] px-3 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          {/* Seekbar and Real-Time Pulsing Waveform Header */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-slate-400 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center h-5">
              {/* Real-Time Waveform Canvas that Pulses with Beat */}
              <canvas
                ref={canvasRef}
                width={360}
                height={22}
                className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 pointer-events-none opacity-80 h-5 w-full max-w-xl transition-transform duration-75"
                style={{
                  transform: `translate(-50%, -50%) scaleY(${1 + currentBeatPulse * 0.2})`,
                }}
              />
              <input
                type="range"
                min="0"
                max={duration || 240}
                value={currentTime}
                onChange={handleSeek}
                className="relative w-full h-1.5 bg-slate-800/80 accent-amber-400 rounded-lg cursor-pointer appearance-none z-10"
              />
            </div>

            <span className="font-mono text-[11px] text-slate-400 w-10">
              {formatTime(duration || media.duration || 240)}
            </span>
          </div>

          {/* Player Controls Bar */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Track Artwork with Pulsing Bass Glow */}
            <div className="flex items-center gap-2.5 min-w-0 max-w-[200px] sm:max-w-xs">
              <div
                className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-900 border border-slate-800 transition-all duration-100"
                style={{
                  transform: isPlaying ? `scale(${1 + currentBeatPulse * 0.1})` : 'scale(1)',
                  boxShadow: isPlaying && currentBeatPulse > 0.4
                    ? `0 0 ${12 + currentBeatPulse * 20}px rgba(251, 191, 36, ${0.5 + currentBeatPulse * 0.5})`
                    : 'none',
                }}
              >
                <img src={media.coverUrl} alt={media.title} className="w-full h-full object-cover" />
                {isPlaying && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span
                      className="w-2.5 h-2.5 rounded-full bg-amber-400"
                      style={{
                        transform: `scale(${1 + currentBeatPulse * 1.5})`,
                        opacity: 0.6 + currentBeatPulse * 0.4,
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0 truncate">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">{media.title}</h4>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {media.artist} • {media.countryName}
                </p>
              </div>
            </div>

            {/* Center: Playback Controls & Beat Indicator */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => setIsShuffling(!isShuffling)}
                  className={`p-1.5 rounded-lg transition hidden sm:block ${
                    isShuffling ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Lecture aléatoire"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={onPrevious}
                  className="p-1.5 text-slate-300 hover:text-white transition active:scale-95"
                  title="Morceau précédent"
                >
                  <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={togglePlay}
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 flex items-center justify-center shadow-lg transition active:scale-95"
                  style={{
                    boxShadow: isPlaying
                      ? `0 0 ${12 + currentBeatPulse * 18}px rgba(251, 191, 36, 0.6)`
                      : 'none',
                    transform: isPlaying ? `scale(${1 + currentBeatPulse * 0.06})` : 'scale(1)',
                  }}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-slate-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
                  )}
                </button>

                <button
                  onClick={onNext}
                  className="p-1.5 text-slate-300 hover:text-white transition active:scale-95"
                  title="Morceau suivant"
                >
                  <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-1.5 rounded-lg transition hidden sm:block ${
                    isLooping ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="Répéter ce morceau"
                >
                  <Repeat className="w-4 h-4" />
                </button>
              </div>

              {/* Pulsing Beat Sync Status & Cash Reward Earning */}
              <div className="flex items-center gap-2">
                {isPlaying && (
                  <div
                    className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full transition-all duration-75"
                    style={{
                      backgroundColor: currentBeatPulse > 0.55 ? 'rgba(251, 191, 36, 0.3)' : 'rgba(15, 23, 42, 0.6)',
                      borderColor: currentBeatPulse > 0.55 ? '#fbbf24' : '#334155',
                      borderWidth: 1,
                      color: currentBeatPulse > 0.55 ? '#fbbf24' : '#94a3b8',
                      transform: `scale(${1 + currentBeatPulse * 0.08})`,
                    }}
                  >
                    <Activity className="w-3 h-3 text-amber-400" />
                    <span>BEAT SYNC {Math.round(currentBeatPulse * 100)}%</span>
                  </div>
                )}

                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  {rewardClaimed ? (
                    <span className="text-emerald-400 font-bold">+{media.cashRewardValue} FCFA Encaissé !</span>
                  ) : (
                    <span>Écoute : {Math.max(0, REWARD_DURATION - secondsListened)}s pour +{media.cashRewardValue} FCFA</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Studio Visualizer expander, HD Clip button, Download, Volume */}
            <div className="flex items-center gap-2">
              {/* Studio Visualizer Full View Toggle */}
              <button
                onClick={() => setShowStudioVisualizer(true)}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 text-xs font-bold transition active:scale-95 shadow"
                title="Ouvrir le visualiseur de spectre audio plein écran"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>Visualiseur HD</span>
              </button>

              {/* View Clip HD button */}
              <button
                onClick={() => onOpenVideoModal(media)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md transition active:scale-95"
                title="Regarder le clip en Haute Définition"
              >
                <Video className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clip HD</span>
              </button>

              {/* Offline download */}
              <button
                onClick={handleDownload}
                disabled={isDownloaded}
                className={`p-2 rounded-xl border transition ${
                  isDownloaded
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title={isDownloaded ? 'Titre disponible hors ligne' : 'Télécharger en mode hors ligne'}
              >
                {isDownloaded ? <Check className="w-4 h-4" /> : <DownloadCloud className="w-4 h-4" />}
              </button>

              {/* Share */}
              <button
                onClick={() => onShare(media)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition hidden md:block"
                title="Partager ce morceau"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Volume control */}
              <div className="hidden lg:flex items-center gap-1.5 pl-1">
                <button onClick={toggleMute} className="text-slate-400 hover:text-white">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolume}
                  className="w-16 h-1 bg-slate-800 accent-amber-400 rounded-lg cursor-pointer appearance-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Fullscreen Studio Equalizer & Beat Visualizer Modal */}
      {showStudioVisualizer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-2xl animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Activity className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-base text-white">Visualiseur Studio HD en Temps Réel</h3>
                  <p className="text-xs text-slate-400">Pulsation au rythme de la musique en direct • 320 kbps Haute Fidélité</p>
                </div>
              </div>

              <button
                onClick={() => setShowStudioVisualizer(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visualizer Center Canvas with Vinyl Spinning Beat Disc */}
            <div className="relative flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 overflow-hidden min-h-[360px]">
              {/* Radial Canvas behind disc */}
              <canvas
                ref={modalCanvasRef}
                width={500}
                height={500}
                className="absolute inset-0 m-auto pointer-events-none w-[360px] h-[360px] sm:w-[480px] sm:h-[480px]"
              />

              {/* Vinyl Record with Artwork in center that pulses with beat */}
              <div
                className={`relative w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-slate-950 border-4 border-slate-800 shadow-2xl flex items-center justify-center transition-transform duration-75 z-10 ${
                  isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''
                }`}
                style={{
                  transform: `scale(${1 + currentBeatPulse * 0.12})`,
                  boxShadow: `0 0 ${20 + currentBeatPulse * 40}px rgba(251, 191, 36, ${0.4 + currentBeatPulse * 0.6})`,
                }}
              >
                {/* Vinyl grooved rings */}
                <div className="absolute inset-2 rounded-full border border-white/10" />
                <div className="absolute inset-6 rounded-full border border-white/5" />
                <div className="absolute inset-10 rounded-full border border-white/10" />

                {/* Central Album Artwork */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl">
                  <img src={media.coverUrl} alt={media.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 m-auto w-4 h-4 rounded-full bg-slate-950 border border-amber-300" />
                </div>
              </div>

              {/* Real-time Beat Intensity Status Badge */}
              <div className="mt-8 z-10 flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-500/40 text-amber-300 font-mono text-xs font-black flex items-center gap-1.5 shadow">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                  BASS HIT : {Math.round(currentBeatPulse * 100)}%
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 text-xs font-semibold">
                  {media.genre}
                </span>
              </div>
            </div>

            {/* Bottom Controls inside Visualizer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white">{media.title}</h4>
                <p className="text-xs text-slate-400">{media.artist} • {media.countryName}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-bold shadow-lg transition active:scale-95"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
                </button>
                <button
                  onClick={() => {
                    setShowStudioVisualizer(false);
                    onOpenVideoModal(media);
                  }}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-2 rounded-xl text-xs transition"
                >
                  <Video className="w-4 h-4" />
                  <span>Voir le Clip HD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
