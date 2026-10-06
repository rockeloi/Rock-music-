import React, { useState, useEffect, useRef } from 'react';
import { MediaItem } from '../types';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  DownloadCloud,
  Check,
  Share2,
  Sparkles,
  FileText,
  SkipForward,
  Settings,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import confetti from 'canvas-confetti';

interface VideoPlayerModalProps {
  media: MediaItem | null;
  onClose: () => void;
  onNext?: () => void;
  onShare: (media: MediaItem) => void;
  onRewardClaimed: (amount: number) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  media,
  onClose,
  onNext,
  onShare,
  onRewardClaimed,
}) => {
  if (!media) return null;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(media.duration || 180);
  const [isMuted, setIsMuted] = useState(false);
  const [quality, setQuality] = useState<'1080p HD' | '720p HD' | '480p'>('1080p HD');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(() => storageService.isMediaDownloaded(media.id));
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [watchSeconds, setWatchSeconds] = useState(0);

  const SECONDS_REQUIRED_FOR_REWARD = 12;

  useEffect(() => {
    // Reset state for new media
    setCurrentTime(0);
    setWatchSeconds(0);
    setRewardClaimed(false);
    setIsDownloaded(storageService.isMediaDownloaded(media.id));
    setIsPlaying(true);
  }, [media.id]);

  useEffect(() => {
    let interval: number;
    if (isPlaying && !rewardClaimed) {
      interval = window.setInterval(() => {
        setWatchSeconds((prev) => {
          const next = prev + 1;
          if (next >= SECONDS_REQUIRED_FOR_REWARD && !rewardClaimed) {
            triggerReward();
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, rewardClaimed]);

  const triggerReward = () => {
    setRewardClaimed(true);
    const amount = media.cashRewardValue || 150;
    storageService.addCashReward(
      amount,
      `Visionnage HD de "${media.title}" - ${media.artist}`,
      'video_watch'
    );
    onRewardClaimed(amount);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch {
      // ignore
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (videoRef.current.duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleDownload = () => {
    if (!isDownloaded) {
      storageService.saveMediaOffline(media);
      setIsDownloaded(true);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-rose-600 font-extrabold text-[11px] text-white tracking-wider">
              {quality}
            </span>
            <div className="truncate">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">{media.title}</h2>
              <p className="text-xs text-slate-400 truncate">{media.artist} • {media.countryName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Real Cash Reward Tracker Banner */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              {rewardClaimed ? (
                <span className="text-emerald-400 font-bold">+{media.cashRewardValue} FCFA Encaissé !</span>
              ) : (
                <span>
                  Bonus en argent réel : {Math.max(0, SECONDS_REQUIRED_FOR_REWARD - watchSeconds)}s pour +{media.cashRewardValue} FCFA
                </span>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Player Main Viewport */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center group overflow-hidden">
          <video
            ref={videoRef}
            src={media.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
            poster={media.coverUrl}
            autoPlay
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => {
              setIsPlaying(false);
              if (onNext) onNext();
            }}
            className="w-full h-full object-contain"
          />

          {/* Player Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 pointer-events-none">
            {/* Top Overlay details */}
            <div className="flex items-center justify-between pointer-events-auto">
              <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs text-white font-medium">
                {media.genre}
              </span>
            </div>

            {/* Bottom Controls Bar */}
            <div className="space-y-2 pointer-events-auto">
              {/* Progress Slider */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-slate-700 accent-amber-400 rounded-lg cursor-pointer appearance-none"
              />

              <div className="flex items-center justify-between text-xs text-white">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-full bg-amber-400 text-slate-950 hover:scale-105 transition"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 ml-0.5" />}
                  </button>

                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition text-slate-200"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono text-xs text-slate-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quality Selector */}
                  <div className="relative">
                    <button
                      onClick={() => setShowQualityMenu(!showQualityMenu)}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-black/50 hover:bg-black/80 text-[11px] font-bold border border-white/20"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>{quality}</span>
                    </button>
                    {showQualityMenu && (
                      <div className="absolute bottom-full right-0 mb-2 w-32 bg-slate-800 border border-slate-700 rounded-lg py-1 shadow-xl text-xs z-30">
                        {(['1080p HD', '720p HD', '480p'] as const).map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setQuality(q);
                              setShowQualityMenu(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 hover:bg-slate-700 ${
                              quality === q ? 'text-amber-400 font-bold' : 'text-slate-200'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Lyrics Toggle */}
                  <button
                    onClick={() => setShowLyrics(!showLyrics)}
                    className={`p-1.5 rounded-lg transition ${
                      showLyrics ? 'bg-amber-400 text-slate-950' : 'hover:bg-white/10 text-slate-200'
                    }`}
                    title="Afficher les paroles"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={handleFullscreen}
                    className="p-1.5 rounded-lg hover:bg-white/10 transition text-slate-200"
                  >
                    <Maximize className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions & Details Section */}
        <div className="p-4 bg-slate-950 flex flex-col md:flex-row gap-4 overflow-y-auto max-h-60">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownload}
                disabled={isDownloaded}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isDownloaded
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {isDownloaded ? <Check className="w-3.5 h-3.5" /> : <DownloadCloud className="w-3.5 h-3.5" />}
                <span>{isDownloaded ? 'Vidéo Enregistrée Hors Ligne' : 'Télécharger Clip HD (Hors ligne)'}</span>
              </button>

              <button
                onClick={() => onShare(media)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Partager (+200 FCFA)</span>
              </button>

              {onNext && (
                <button
                  onClick={onNext}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Clip Suivant</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {media.description || `${media.title} interprété par ${media.artist}. Diffusé en haute définition exclusive sur Rock Music.`}
            </p>
          </div>

          {/* Synchronized / Scrollable Lyrics panel */}
          {showLyrics && (
            <div className="w-full md:w-80 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 max-h-48 overflow-y-auto">
              <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Paroles officielles</span>
              </div>
              <pre className="font-sans whitespace-pre-wrap leading-relaxed text-slate-300 text-[11px]">
                {media.lyrics || "Les paroles de ce morceau sont en cours de synchronisation par la communauté Rock Music."}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
