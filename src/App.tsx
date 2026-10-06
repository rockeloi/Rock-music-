/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { INITIAL_CATALOG } from './data/catalog';
import { MediaItem, CountryCode, AdvancedSearchFilters } from './types';
import { storageService } from './services/storageService';
import { AdBanner } from './components/AdBanner';
import { Header } from './components/Header';
import { CountryFilter } from './components/CountryFilter';
import { MediaCard } from './components/MediaCard';
import { AudioPlayer } from './components/AudioPlayer';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { RewardsModal } from './components/RewardsModal';
import { SearchWebModal } from './components/SearchWebModal';
import { OfflineSection } from './components/OfflineSection';
import { PreferencesModal } from './components/PreferencesModal';
import { SocialShareModal } from './components/SocialShareModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { AdvancedSearchPanel } from './components/AdvancedSearchPanel';
import {
  Sparkles,
  Play,
  DownloadCloud,
  Phone,
  Flame,
  Globe2,
  Tv,
  Clock,
  Music2,
} from 'lucide-react';

const DEFAULT_FILTERS: AdvancedSearchFilters = {
  query: '',
  country: 'ALL',
  genre: 'ALL',
  artist: 'ALL',
  yearRange: 'ALL',
  mediaType: 'ALL',
  onlyHD: false,
  onlyNew: false,
  sortBy: 'priority_new_hd',
};

export default function App() {
  const [catalog, setCatalog] = useState<MediaItem[]>(INITIAL_CATALOG);
  const [filters, setFilters] = useState<AdvancedSearchFilters>(DEFAULT_FILTERS);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Currently playing audio and video
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(() => INITIAL_CATALOG[0]);
  const [currentVideo, setCurrentVideo] = useState<MediaItem | null>(null);

  // Storage / State
  const [cashBalance, setCashBalance] = useState<number>(() => storageService.getCashBalance());
  const [offlineItems, setOfflineItems] = useState(() => storageService.getOfflineItems());
  const [likedIds, setLikedIds] = useState(() => storageService.getLikedIds());

  // Modals
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showWebSearchModal, setShowWebSearchModal] = useState(false);
  const [showOfflineSection, setShowOfflineSection] = useState(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState(false);
  const [shareMedia, setShareMedia] = useState<MediaItem | null>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const handleRewardClaimed = (amount: number) => {
    const updated = storageService.getCashBalance();
    setCashBalance(updated);
    showToast(`🎉 +${amount} FCFA en argent réel ajoutés à votre cagnotte !`);
  };

  const handleOfflineChange = () => {
    setOfflineItems(storageService.getOfflineItems());
    showToast("💾 Mémorisé dans votre bibliothèque hors ligne !");
  };

  const handleAddNewWebTrack = (newTrack: MediaItem) => {
    setCatalog((prev) => [newTrack, ...prev]);
    showToast(`🌐 Nouveau titre "${newTrack.title}" ajouté au catalogue !`);
  };

  // Next / Previous song handler
  const handleNextTrack = () => {
    if (!currentMedia) return;
    const currentIndex = catalog.findIndex((item) => item.id === currentMedia.id);
    const nextIndex = (currentIndex + 1) % catalog.length;
    setCurrentMedia(catalog[nextIndex]);
  };

  const handlePreviousTrack = () => {
    if (!currentMedia) return;
    const currentIndex = catalog.findIndex((item) => item.id === currentMedia.id);
    const prevIndex = (currentIndex - 1 + catalog.length) % catalog.length;
    setCurrentMedia(catalog[prevIndex]);
  };

  // Synchronize category chips with filters
  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    if (categoryId === 'ALL') {
      setFilters((prev) => ({
        ...prev,
        mediaType: 'ALL',
        onlyHD: false,
        onlyNew: false,
        genre: 'ALL',
        yearRange: 'ALL',
      }));
    } else if (categoryId === 'VIDEOS_HD') {
      setFilters((prev) => ({ ...prev, mediaType: 'video', onlyHD: true }));
    } else if (categoryId === 'AUDIO_ONLY') {
      setFilters((prev) => ({ ...prev, mediaType: 'audio' }));
    } else if (categoryId === 'NEW_RELEASES') {
      setFilters((prev) => ({ ...prev, onlyNew: true, yearRange: 'ALL' }));
    } else if (categoryId === '1990S') {
      setFilters((prev) => ({ ...prev, yearRange: '1990s', onlyNew: false }));
    } else if (categoryId === '1980S') {
      setFilters((prev) => ({ ...prev, yearRange: '1980s', onlyNew: false }));
    } else if (categoryId === 'RUMBA') {
      setFilters((prev) => ({ ...prev, genre: 'Rumba Congolaise' }));
    } else if (categoryId === 'NDOMBOLO') {
      setFilters((prev) => ({ ...prev, genre: 'Ndombolo' }));
    } else if (categoryId === 'AFROBEATS') {
      setFilters((prev) => ({ ...prev, genre: 'Afrobeats' }));
    } else if (categoryId === 'TRENDING') {
      setFilters((prev) => ({ ...prev, sortBy: 'popularity' }));
    }
  };

  // Fast, Efficient Advanced Filter & Sort Engine
  const filteredCatalog = useMemo(() => {
    const start = performance.now();

    const result = catalog.filter((item) => {
      // 1. Full-Text Query
      if (filters.query.trim()) {
        const q = filters.query.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchArtist = item.artist.toLowerCase().includes(q);
        const matchAlbum = item.album?.toLowerCase().includes(q);
        const matchCountry = item.countryName.toLowerCase().includes(q);
        const matchGenre = item.genre.toLowerCase().includes(q);
        const matchYear = item.releaseYear.toString().includes(q);
        const matchDesc = item.description?.toLowerCase().includes(q);
        if (!matchTitle && !matchArtist && !matchAlbum && !matchCountry && !matchGenre && !matchYear && !matchDesc) {
          return false;
        }
      }

      // 2. Country Filter (Focus RDC & Congo Brazzaville, or Global)
      if (filters.country !== 'ALL' && item.country !== filters.country) {
        return false;
      }

      // 3. Artist Filter
      if (filters.artist !== 'ALL') {
        if (!item.artist.toLowerCase().includes(filters.artist.toLowerCase())) {
          return false;
        }
      }

      // 4. Genre Filter
      if (filters.genre !== 'ALL') {
        if (!item.genre.toLowerCase().includes(filters.genre.toLowerCase())) {
          return false;
        }
      }

      // 5. Release Date / Year Filter (Focus on 1980s, 1990s, 2026, 2025, 2024, etc.)
      if (filters.yearRange !== 'ALL') {
        if (filters.yearRange === '2026' && item.releaseYear !== 2026) return false;
        if (filters.yearRange === '2025' && item.releaseYear !== 2025) return false;
        if (filters.yearRange === '2024' && item.releaseYear !== 2024) return false;
        if (filters.yearRange === '2020-2023' && (item.releaseYear < 2020 || item.releaseYear > 2023)) return false;
        if (filters.yearRange === '1990s' && (item.releaseYear < 1990 || item.releaseYear > 1999)) return false;
        if (filters.yearRange === '1980s' && (item.releaseYear < 1980 || item.releaseYear > 1989)) return false;
        if (filters.yearRange === 'CLASSIC' && item.releaseYear >= 2000) return false;
      }

      // 6. Media Format
      if (filters.mediaType === 'video' && item.type !== 'video') return false;
      if (filters.mediaType === 'audio' && item.type !== 'audio') return false;

      // 7. Only HD / 4K
      if (filters.onlyHD && !item.isHD) return false;

      // 8. Only New Releases
      if (filters.onlyNew && (!item.isNew && item.releaseYear < 2025)) return false;

      // 9. Favorites Category
      if (selectedCategory === 'FAVORITES' && !likedIds.includes(item.id)) return false;

      return true;
    });

    // Sort Engine: Prioritizing new releases and HD content by default
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'priority_new_hd': {
          // Weight calculation:
          // New releases (2025/2026) get huge boost
          // HD video content gets solid boost
          // Recent years get incremental boost
          const scoreA =
            (a.isNew || a.releaseYear >= 2025 ? 5000 : 0) +
            (a.isHD ? 2000 : 0) +
            a.releaseYear * 5 +
            Math.min(1000, a.views / 500000);
          const scoreB =
            (b.isNew || b.releaseYear >= 2025 ? 5000 : 0) +
            (b.isHD ? 2000 : 0) +
            b.releaseYear * 5 +
            Math.min(1000, b.views / 500000);
          return scoreB - scoreA;
        }
        case 'newest':
          return b.releaseYear - a.releaseYear || b.views - a.views;
        case 'hd_first':
          return (b.isHD ? 1 : 0) - (a.isHD ? 1 : 0) || b.releaseYear - a.releaseYear;
        case 'popularity':
          return b.views - a.views;
        case 'cash_reward':
          return b.cashRewardValue - a.cashRewardValue;
        case 'artist_az':
          return a.artist.localeCompare(b.artist);
        default:
          return b.releaseYear - a.releaseYear;
      }
    });

    return result;
  }, [catalog, filters, selectedCategory, likedIds]);

  // Featured hero item
  const heroMedia = useMemo(() => {
    return catalog.find((item) => item.id === 'rdc-fally-2026-album') || catalog[0];
  }, [catalog]);

  // Curated collections for the home display
  const tracks1980s = useMemo(
    () => catalog.filter((item) => item.releaseYear >= 1980 && item.releaseYear <= 1989),
    [catalog]
  );
  const tracks1990s = useMemo(
    () => catalog.filter((item) => item.releaseYear >= 1990 && item.releaseYear <= 1999),
    [catalog]
  );
  const newReleases2025_2026 = useMemo(
    () => catalog.filter((item) => item.releaseYear >= 2025),
    [catalog]
  );
  const rdcTracks = useMemo(() => catalog.filter((item) => item.country === 'RDC'), [catalog]);
  const cgTracks = useMemo(() => catalog.filter((item) => item.country === 'CG'), [catalog]);

  // Is actively filtering?
  const isFilteringActive =
    filters.query.trim().length > 0 ||
    filters.country !== 'ALL' ||
    filters.genre !== 'ALL' ||
    filters.artist !== 'ALL' ||
    filters.yearRange !== 'ALL' ||
    filters.mediaType !== 'ALL' ||
    filters.onlyHD ||
    filters.onlyNew ||
    selectedCategory !== 'ALL';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-28">
      {/* 1. Espace Publicitaire Réservé - Contacter 066969689 */}
      <AdBanner />

      {/* 2. Main Header with Advanced Search toggle */}
      <Header
        searchQuery={filters.query}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, query: q }))}
        onOpenRewards={() => setShowRewardsModal(true)}
        onOpenWebSearch={() => setShowWebSearchModal(true)}
        onOpenPreferences={() => setShowPreferencesModal(true)}
        onOpenOfflineSection={() => setShowOfflineSection(true)}
        onToggleAdvancedSearch={() => setIsAdvancedSearchOpen((prev) => !prev)}
        isAdvancedSearchOpen={isAdvancedSearchOpen}
        activeFilterCount={
          [
            filters.country !== 'ALL',
            filters.genre !== 'ALL',
            filters.artist !== 'ALL',
            filters.yearRange !== 'ALL',
            filters.mediaType !== 'ALL',
            filters.onlyHD,
            filters.onlyNew,
          ].filter(Boolean).length
        }
        offlineCount={offlineItems.length}
        cashBalance={cashBalance}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 space-y-6">
        {/* PWA Install on Mobile / Chrome Banner */}
        <PWAInstallBanner />

        {/* 3. Advanced Search & Filtering Console (Always Accessible & Responsive) */}
        <AdvancedSearchPanel
          filters={filters}
          onFilterChange={(newFilters) => {
            setFilters(newFilters);
            if (newFilters.country !== 'ALL') {
              // sync country selection
            }
          }}
          onResetFilters={() => {
            setFilters(DEFAULT_FILTERS);
            setSelectedCategory('ALL');
          }}
          resultCount={filteredCatalog.length}
          isOpen={isAdvancedSearchOpen}
          onToggleOpen={() => setIsAdvancedSearchOpen((prev) => !prev)}
        />

        {/* Hero Spotlight (shown when not filtering) */}
        {!isFilteringActive && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-rose-600 font-black text-white text-xs uppercase tracking-wider flex items-center gap-1.5 shadow">
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    Exclusivité 2026 • RDC 🇨🇩
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-amber-400 font-black text-slate-950 text-[11px] uppercase tracking-wider">
                    Clip 4K Ultra HD
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold font-mono">
                    +{heroMedia.cashRewardValue} FCFA Réel
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {heroMedia.title}
                  </h2>
                  <p className="text-base sm:text-lg text-amber-300 font-bold mt-1">
                    {heroMedia.artist}
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                  {heroMedia.description}
                </p>

                {/* Hero Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => setCurrentVideo(heroMedia)}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black px-5 py-3 rounded-2xl shadow-xl shadow-amber-500/20 transition active:scale-95 text-xs sm:text-sm uppercase tracking-wider cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>Regarder le Clip 4K HD</span>
                  </button>

                  <button
                    onClick={() => setCurrentMedia(heroMedia)}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-3 rounded-2xl border border-slate-700 transition active:scale-95 text-xs sm:text-sm"
                  >
                    <span>Écouter en Audio</span>
                  </button>

                  <button
                    onClick={() => {
                      storageService.saveMediaOffline(heroMedia);
                      handleOfflineChange();
                    }}
                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-3 rounded-2xl border border-slate-800 transition text-xs font-bold"
                    title="Sauvegarder pour lecture sans connexion"
                  >
                    <DownloadCloud className="w-4 h-4 text-indigo-400" />
                    <span className="hidden sm:inline">Télécharger Hors Ligne</span>
                  </button>
                </div>
              </div>

              {/* Cover preview */}
              <div className="lg:col-span-5 relative group cursor-pointer" onClick={() => setCurrentVideo(heroMedia)}>
                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-950">
                  <img
                    src={heroMedia.coverUrl}
                    alt={heroMedia.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                    <div className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition">
                      <Play className="w-7 h-7 fill-slate-950 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Quick Country & Category Filter Chips */}
        <div className="bg-slate-900/60 p-4 rounded-3xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Globe2 className="w-4 h-4 text-amber-400" />
              <span>Navigation par Pays & Époques Musicales</span>
            </span>
            <span>{filteredCatalog.length} résultats actifs</span>
          </div>

          <CountryFilter
            selectedCountry={filters.country}
            onSelectCountry={(country) => setFilters((prev) => ({ ...prev, country }))}
            selectedCategory={selectedCategory}
            onSelectCategory={handleCategorySelect}
            likedCount={likedIds.length}
          />
        </div>

        {/* 5. Main Filtered Results Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>
                {filters.query
                  ? `Résultats pour "${filters.query}"`
                  : filters.yearRange === '1980s'
                  ? '🎸 Les Grands Succès des Années 1980 (Rumba & Soukous)'
                  : filters.yearRange === '1990s'
                  ? '🌟 Les Tubes Culte des Années 1990 (Ndombolo & Rumba Moderne)'
                  : filters.country !== 'ALL'
                  ? `Musiques & Clips : ${filters.country}`
                  : filters.onlyNew
                  ? '🚀 Les Dernières Nouveautés 2025/2026'
                  : filters.onlyHD
                  ? '🎬 Les Clips Vidéos en Haute Définition (HD & 4K)'
                  : selectedCategory === 'FAVORITES'
                  ? 'Vos Chansons & Clips Favoris'
                  : 'Nouveautés & Grands Classiques (Priorité Nouveautés & HD)'}
              </span>
            </h3>
            <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-800">
              {filteredCatalog.length} titres
            </span>
          </div>

          {filteredCatalog.length === 0 ? (
            <div className="py-14 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
              <p className="text-slate-400 text-sm">Aucun morceau ne correspond à votre filtre actuel.</p>
              <div className="flex flex-wrap justify-center gap-2">
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Réinitialiser les filtres
                </button>
                <button
                  onClick={() => setShowWebSearchModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
                >
                  Chercher sur Google & YouTube
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredCatalog.map((media) => (
                <MediaCard
                  key={media.id}
                  media={media}
                  isPlaying={currentMedia?.id === media.id}
                  isCurrent={currentMedia?.id === media.id}
                  onPlayAudio={(item) => setCurrentMedia(item)}
                  onPlayVideo={(item) => setCurrentVideo(item)}
                  onShare={(item) => setShareMedia(item)}
                  onOfflineChange={handleOfflineChange}
                />
              ))}
            </div>
          )}
        </section>

        {/* 6. In-Feed Sponsored Billboard Banner: Espace Publicitaire Réservé */}
        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600/20 via-rose-600/20 to-indigo-600/20 border border-amber-500/40 p-5 sm:p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center shrink-0">
              <span className="text-2xl">📢</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-400 font-black text-slate-950 text-[10px] uppercase">
                  Annonce Sponsorisée
                </span>
                <span className="text-xs text-slate-400">Diffusion garantie RDC & Congo</span>
              </div>
              <h4 className="text-lg font-black text-white mt-1">
                Espace Publicitaire Réservé — Contactez le 066969689
              </h4>
              <p className="text-xs text-slate-300">
                Vous êtes artiste, producteur, organisateur de concert ou entreprise ? Placez votre pub sur Rock Music.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            <a
              href="tel:066969689"
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Appeler 066969689</span>
            </a>
            <a
              href="https://wa.me/242066969689"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow active:scale-95"
            >
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* 7. Dedicated Collection: Les Anciennes Chansons des Années 1990 */}
        {!isFilteringActive && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-amber-500 text-slate-950">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    🌟 Les Tubes Rétro des Années 1990 (Ndombolo & Âge d'Or)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Wenge Musica 4x4, Extra Musica, Koffi Olomidé, JB Mpiana, Awilo Longomba, Pepe Kalle
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCategorySelect('1990S')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold"
              >
                Voir tout (1990) →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tracks1990s.map((media) => (
                <MediaCard
                  key={'90s-' + media.id}
                  media={media}
                  isPlaying={currentMedia?.id === media.id}
                  isCurrent={currentMedia?.id === media.id}
                  onPlayAudio={(item) => setCurrentMedia(item)}
                  onPlayVideo={(item) => setCurrentVideo(item)}
                  onShare={(item) => setShareMedia(item)}
                  onOfflineChange={handleOfflineChange}
                />
              ))}
            </div>
          </section>
        )}

        {/* 8. Dedicated Collection: Les Anciennes Chansons des Années 1980 */}
        {!isFilteringActive && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-indigo-600 text-white">
                  <Music2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    🎸 Les Chansons Légendaires des Années 1980 (Rumba & Soukous)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Franco & TP OK Jazz, Tabu Ley, Mbilia Bel, Zaïko Langa Langa, Papa Wemba, Les Bantous, Zao
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCategorySelect('1980S')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold"
              >
                Voir tout (1980) →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tracks1980s.map((media) => (
                <MediaCard
                  key={'80s-' + media.id}
                  media={media}
                  isPlaying={currentMedia?.id === media.id}
                  isCurrent={currentMedia?.id === media.id}
                  onPlayAudio={(item) => setCurrentMedia(item)}
                  onPlayVideo={(item) => setCurrentVideo(item)}
                  onShare={(item) => setShareMedia(item)}
                  onOfflineChange={handleOfflineChange}
                />
              ))}
            </div>
          </section>
        )}

        {/* 9. Dedicated Collection: Nouveautés 2025/2026 en Haute Définition */}
        {!isFilteringActive && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-rose-600 text-white">
                  <Tv className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    🚀 Nouveautés 2025 - 2026 & Clips HD
                  </h3>
                  <p className="text-xs text-slate-400">
                    Priorité aux sorties récentes en 1080p et 4K Ultra HD
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleCategorySelect('NEW_RELEASES')}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold"
              >
                Voir toutes les nouveautés →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {newReleases2025_2026.slice(0, 4).map((media) => (
                <MediaCard
                  key={'new-' + media.id}
                  media={media}
                  isPlaying={currentMedia?.id === media.id}
                  isCurrent={currentMedia?.id === media.id}
                  onPlayAudio={(item) => setCurrentMedia(item)}
                  onPlayVideo={(item) => setCurrentVideo(item)}
                  onShare={(item) => setShareMedia(item)}
                  onOfflineChange={handleOfflineChange}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer info */}
        <footer className="pt-8 pb-4 text-center space-y-3 border-t border-slate-900 text-xs text-slate-500">
          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <span>🎸 Rock Music © 2026</span>
            <span>•</span>
            <span>RDC 🇨🇩 & Congo Brazzaville 🇨🇬</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">Régie Pub : 066969689</span>
            <span>•</span>
            <span>Mode Hors Ligne PWA</span>
            <span>•</span>
            <span className="text-emerald-400">Gains en Argent Réel</span>
          </div>
          <p className="text-[11px] text-slate-600 max-w-lg mx-auto">
            Rock Music est une application progressive (PWA) installable directement sur Chrome Android et tous navigateurs. Les récompenses sont distribuées en argent réel par Mobile Money.
          </p>
        </footer>
      </main>

      {/* Persistent Bottom Audio Player Bar */}
      {currentMedia && (
        <AudioPlayer
          media={currentMedia}
          onNext={handleNextTrack}
          onPrevious={handlePreviousTrack}
          onOpenVideoModal={(m) => setCurrentVideo(m)}
          onShare={(m) => setShareMedia(m)}
          onRewardClaimed={handleRewardClaimed}
        />
      )}

      {/* HD Video Player Modal */}
      {currentVideo && (
        <VideoPlayerModal
          media={currentVideo}
          onClose={() => setCurrentVideo(null)}
          onNext={() => {
            const videoList = catalog.filter((m) => m.type === 'video');
            const currentIndex = videoList.findIndex((m) => m.id === currentVideo.id);
            const nextVideo = videoList[(currentIndex + 1) % videoList.length];
            setCurrentVideo(nextVideo);
          }}
          onShare={(m) => setShareMedia(m)}
          onRewardClaimed={handleRewardClaimed}
        />
      )}

      {/* Real Cash Rewards Modal */}
      <RewardsModal
        isOpen={showRewardsModal}
        onClose={() => setShowRewardsModal(false)}
        cashBalance={cashBalance}
        onBalanceUpdate={(newBal) => setCashBalance(newBal)}
      />

      {/* Direct Web Engines Explorer & Catalog Sync Modal */}
      <SearchWebModal
        isOpen={showWebSearchModal}
        onClose={() => setShowWebSearchModal(false)}
        onAddNewTrack={handleAddNewWebTrack}
      />

      {/* Offline Mode & Storage Library */}
      <OfflineSection
        isOpen={showOfflineSection}
        onClose={() => setShowOfflineSection(false)}
        items={offlineItems}
        onPlayMedia={(media) => {
          if (media.type === 'video') {
            setCurrentVideo(media);
          } else {
            setCurrentMedia(media);
          }
        }}
        onOfflineChange={handleOfflineChange}
      />

      {/* Preferences & Musical Recommendation Modal */}
      <PreferencesModal
        isOpen={showPreferencesModal}
        onClose={() => setShowPreferencesModal(false)}
        onPreferencesSaved={() => {
          showToast("Recommandations mises à jour avec vos préférences !");
        }}
      />

      {/* Social Share & Community Feedback Modal */}
      <SocialShareModal
        media={shareMedia}
        isOpen={!!shareMedia}
        onClose={() => setShareMedia(null)}
        onRewardClaimed={handleRewardClaimed}
      />

      {/* Toast Notification Floating Pill */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black px-4 py-2.5 rounded-2xl shadow-2xl text-xs sm:text-sm animate-in fade-in slide-in-from-top-2">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
