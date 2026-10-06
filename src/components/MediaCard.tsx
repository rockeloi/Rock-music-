import React, { useState } from 'react';
import { MediaItem } from '../types';
import { Play, Video, Music, DownloadCloud, Check, Heart, Share2, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';

interface MediaCardProps {
  media: MediaItem;
  isPlaying: boolean;
  isCurrent: boolean;
  onPlayAudio: (media: MediaItem) => void;
  onPlayVideo: (media: MediaItem) => void;
  onShare: (media: MediaItem) => void;
  onOfflineChange: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  isPlaying,
  isCurrent,
  onPlayAudio,
  onPlayVideo,
  onShare,
  onOfflineChange,
}) => {
  const isDownloaded = storageService.isMediaDownloaded(media.id);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLiked, setIsLiked] = useState(() => storageService.getLikedIds().includes(media.id));

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDownloadOffline = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloaded) return;
    setIsDownloading(true);
    setTimeout(() => {
      storageService.saveMediaOffline(media);
      setIsDownloading(false);
      onOfflineChange();
    }, 600);
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = storageService.toggleLike(media.id);
    setIsLiked(updated);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onShare(media);
  };

  return (
    <div
      onClick={() => (media.type === 'video' ? onPlayVideo(media) : onPlayAudio(media))}
      className={`group relative flex flex-col bg-slate-900/90 hover:bg-slate-800/90 rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl ${
        isCurrent
          ? 'border-amber-500 shadow-amber-500/10 ring-1 ring-amber-500/50'
          : 'border-slate-800/80 hover:border-slate-700'
      }`}
    >
      {/* Cover / Thumbnail with overlay badges */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={media.coverUrl}
          alt={media.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Gradient dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/20 to-black/30 group-hover:via-black/40 transition-colors" />

        {/* Top Badges: Country + Media Type + HD Quality */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-white border border-white/10">
            {media.countryName}
          </span>

          <div className="flex items-center gap-1">
            {media.isHD && (
              <span className="rounded bg-rose-600/90 px-1.5 py-0.5 text-[10px] font-extrabold uppercase text-white shadow">
                {media.hdQuality || 'HD 1080p'}
              </span>
            )}
            <span
              className={`rounded-full p-1 backdrop-blur-md text-[10px] ${
                media.type === 'video'
                  ? 'bg-red-500/80 text-white'
                  : 'bg-indigo-500/80 text-white'
              }`}
            >
              {media.type === 'video' ? <Video className="w-3 h-3" /> : <Music className="w-3 h-3" />}
            </span>
          </div>
        </div>

        {/* Center Hover Action Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
          </div>
        </div>

        {/* Bottom Bar: Duration & Cash Reward Pill */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md">
            <Sparkles className="w-3 h-3 fill-slate-950" />
            <span>+{media.cashRewardValue} FCFA Réel</span>
          </div>
          <span className="rounded bg-black/70 px-1.5 py-0.5 font-mono text-[10px] text-slate-200 backdrop-blur-sm">
            {formatDuration(media.duration)}
          </span>
        </div>
      </div>

      {/* Content Details */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <div>
          <h3 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-300 transition-colors">
            {media.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5 font-medium">
            {media.artist}
          </p>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
          <span className="truncate max-w-[120px] text-slate-400">{media.genre}</span>

          {/* Action Icons: Offline Download, Like, Share */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Offline download button */}
            <button
              onClick={handleDownloadOffline}
              disabled={isDownloaded || isDownloading}
              title={isDownloaded ? 'Disponible hors ligne' : 'Télécharger pour écoute hors ligne'}
              className={`p-1.5 rounded-lg transition ${
                isDownloaded
                  ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {isDownloading ? (
                <span className="w-3.5 h-3.5 block border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              ) : isDownloaded ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <DownloadCloud className="w-3.5 h-3.5" />
              )}
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`p-1.5 rounded-lg hover:bg-slate-800 transition ${
                isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-rose-400'
              }`}
              title="Ajouter aux favoris"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShareClick}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
              title="Partager sur WhatsApp, Facebook, X..."
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
