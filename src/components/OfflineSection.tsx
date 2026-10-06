import React from 'react';
import { DownloadCloud, Trash2, Play, HardDrive, CheckCircle2, Music, Video, X } from 'lucide-react';
import { OfflineItem, MediaItem } from '../types';
import { storageService } from '../services/storageService';

interface OfflineSectionProps {
  isOpen: boolean;
  onClose: () => void;
  items: OfflineItem[];
  onPlayMedia: (media: MediaItem) => void;
  onOfflineChange: () => void;
}

export const OfflineSection: React.FC<OfflineSectionProps> = ({
  isOpen,
  onClose,
  items,
  onPlayMedia,
  onOfflineChange,
}) => {
  if (!isOpen) return null;

  const totalMb = storageService.getTotalOfflineStorageMb();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    storageService.removeOfflineMedia(id);
    onOfflineChange();
  };

  const handleClearAll = () => {
    if (confirm("Voulez-vous vraiment supprimer tous les titres et vidéos hors ligne de votre appareil ?")) {
      storageService.clearAllOfflineData();
      onOfflineChange();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
              <DownloadCloud className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-white">Mode Hors Ligne & Téléchargements</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                  {items.length} éléments
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Écoutez vos morceaux et regardez vos vidéos HD partout sans connexion internet.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Storage Bar */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <HardDrive className="w-4 h-4 text-indigo-400" />
            <span>Espace de stockage utilisé :</span>
            <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
              {totalMb} Mo
            </span>
          </div>

          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-rose-400 hover:text-rose-300 font-semibold text-xs flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Tout supprimer</span>
            </button>
          )}
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2 text-xs">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <DownloadCloud className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-300 text-sm">Aucun titre téléchargé hors ligne pour le moment</p>
              <p className="text-slate-500 max-w-sm mx-auto text-xs">
                Cliquez sur le bouton de téléchargement ⬇️ présent sur chaque chanson ou clip vidéo pour les écouter sans utiliser vos données mobiles.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.media.id}
                onClick={() => {
                  onPlayMedia(item.media);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-slate-800">
                    <img
                      src={item.media.coverUrl}
                      alt={item.media.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play className="w-4 h-4 fill-white text-white" />
                    </div>
                  </div>

                  <div className="min-w-0 truncate">
                    <div className="font-bold text-white text-xs truncate group-hover:text-amber-400 transition">
                      {item.media.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {item.media.artist} • {item.media.countryName}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                      <span className="flex items-center gap-0.5 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        Prêt hors ligne
                      </span>
                      <span>•</span>
                      <span>{item.fileSizeMb} Mo</span>
                      <span>•</span>
                      <span className="capitalize">{item.media.type === 'video' ? 'Clip HD' : 'Audio MP3'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={(e) => handleDelete(item.media.id, e)}
                    className="p-2 rounded-xl hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition"
                    title="Supprimer du stockage hors ligne"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
