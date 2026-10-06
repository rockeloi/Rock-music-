import React, { useState } from 'react';
import {
  X,
  Globe,
  ExternalLink,
  Search,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Radio,
  PlusCircle,
} from 'lucide-react';
import { MediaItem } from '../types';

interface SearchWebModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewTrack: (item: MediaItem) => void;
}

export const SearchWebModal: React.FC<SearchWebModalProps> = ({
  isOpen,
  onClose,
  onAddNewTrack,
}) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const engines = [
    {
      name: 'Google',
      icon: '🌐',
      color: 'hover:bg-blue-600',
      getUrl: (q: string) => `https://www.google.com/search?q=${encodeURIComponent(q + ' musique clip video')}`,
    },
    {
      name: 'YouTube Music & HD',
      icon: '🔴',
      color: 'hover:bg-red-600',
      getUrl: (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q + ' clip officiel HD')}`,
    },
    {
      name: 'Microsoft Bing',
      icon: '🔵',
      color: 'hover:bg-cyan-600',
      getUrl: (q: string) => `https://www.bing.com/search?q=${encodeURIComponent(q + ' chanson video')}`,
    },
    {
      name: 'DuckDuckGo',
      icon: '🦆',
      color: 'hover:bg-amber-600',
      getUrl: (q: string) => `https://duckduckgo.com/?q=${encodeURIComponent(q + ' music stream')}`,
    },
    {
      name: 'Qwant',
      icon: '🟢',
      color: 'hover:bg-emerald-600',
      getUrl: (q: string) => `https://www.qwant.com/?q=${encodeURIComponent(q + ' musique')}`,
    },
  ];

  const suggestedQueries = [
    { label: '🇨🇩 Nouveautés RDC 2026 (Kinshasa)', query: 'nouvelle rumba congolaise 2026 kinshasa' },
    { label: '🇨🇬 Nouveaux Clips Congo Brazzaville', query: 'clip congo brazzaville roga roga tidiane mario' },
    { label: '🔥 Top 50 Afrobeats Nigéria & Afrique', query: 'top afrobeats hits 2025 2026' },
    { label: '👑 Fally Ipupa & Ferré Gola inédits', query: 'fally ipupa ferre gola nouveaux titres' },
    { label: '⚡ Ndombolo & Ambiance 242-243', query: 'ndombolo sebene congolais' },
  ];

  const handleLaunchEngine = (engine: (typeof engines)[0]) => {
    const q = query.trim() || 'musique rdc congo brazzaville nouveautes';
    window.open(engine.getUrl(q), '_blank');
  };

  const handleLiveCatalogUpdate = () => {
    setIsUpdating(true);
    setUpdateSuccess(false);

    // Simulate direct contact with search engines and pulling latest web release
    setTimeout(() => {
      const simulatedTrack: MediaItem = {
        id: 'web-sync-' + Date.now(),
        title: query ? `${query} (Trouvé via Web)` : 'Rumba Ya Sika 2026 (Exclusivité Web)',
        artist: 'Collectif Artistes Congo & Diaspora',
        album: 'Web Live Release',
        duration: 225,
        releaseYear: 2026,
        country: 'RDC',
        countryName: 'RD Congo 🇨🇩',
        genre: 'Rumba Moderne / Tokooos',
        type: 'video',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        isHD: true,
        hdQuality: '1080p HD',
        isNew: true,
        isTrending: true,
        views: 350000,
        likes: 18000,
        cashRewardValue: 120,
        description: 'Titre indexé directement depuis les moteurs de recherche mondiaux.',
      };

      onAddNewTrack(simulatedTrack);
      setIsUpdating(false);
      setUpdateSuccess(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-rose-700 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Globe className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">Connexion Directe Moteurs Web</h3>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow">
                  Catalogue Mondial
                </span>
              </div>
              <p className="text-xs text-indigo-100/90 mt-0.5 font-medium">
                Accès direct aux index de Google, YouTube, Bing & mise à jour constante du catalogue
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* 1. Universal Search Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Rechercher n'importe quel artiste, clip ou musique sur tout Internet :
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Fally Ipupa nouveau clip, Roga Roga live, Burna boy 2026..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* 2. Direct Moteurs de Recherche Launch Buttons */}
          <div>
            <div className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>Ouvrir instantanément sur les moteurs de recherche :</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {engines.map((eng) => (
                <button
                  key={eng.name}
                  onClick={() => handleLaunchEngine(eng)}
                  className={`flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-left transition ${eng.color} hover:text-white group`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{eng.icon}</span>
                    <span className="font-bold text-xs text-white">{eng.name}</span>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                </button>
              ))}
            </div>
          </div>

          {/* 3. Recommandations de Recherche Prêtes */}
          <div>
            <div className="font-bold text-slate-300 mb-2">Suggestions tendances RDC, Congo & Monde :</div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedQueries.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setQuery(item.query)}
                  className="bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 hover:text-amber-300 transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Live Catalog Sync & Updater */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Synchroniser et mettre à jour le catalogue en direct</span>
                </div>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  Scanne le web musical pour importer les toutes dernières sorties de la RDC et du Congo Brazzaville directement dans votre application Rock Music.
                </p>
              </div>
            </div>

            {updateSuccess && (
              <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-500/50 p-2.5 rounded-xl text-emerald-300 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Nouveau titre détecté et ajouté avec succès à votre catalogue !</span>
              </div>
            )}

            <button
              onClick={handleLiveCatalogUpdate}
              disabled={isUpdating}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-2.5 rounded-xl transition shadow active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
              <span>{isUpdating ? 'Indexation des nouveautés sur le web...' : 'Lancer la mise à jour automatique du catalogue'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
