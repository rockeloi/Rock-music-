import React from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  Tv,
  Calendar,
  User,
  Music,
  Globe,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { COUNTRIES, ALL_GENRES, ARTISTS_BY_REGION } from '../data/catalog';
import { AdvancedSearchFilters, CountryCode, YearRangeFilter, SortOption } from '../types';

interface AdvancedSearchPanelProps {
  filters: AdvancedSearchFilters;
  onFilterChange: (filters: AdvancedSearchFilters) => void;
  onResetFilters: () => void;
  resultCount: number;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  resultCount,
  isOpen,
  onToggleOpen,
}) => {
  const updateFilter = <K extends keyof AdvancedSearchFilters>(
    key: K,
    val: AdvancedSearchFilters[K]
  ) => {
    onFilterChange({
      ...filters,
      [key]: val,
    });
  };

  // Count active non-default filters
  const activeCount = [
    filters.country !== 'ALL',
    filters.genre !== 'ALL',
    filters.artist !== 'ALL',
    filters.yearRange !== 'ALL',
    filters.mediaType !== 'ALL',
    filters.onlyHD,
    filters.onlyNew,
    filters.query.trim().length > 0,
    filters.sortBy !== 'priority_new_hd',
  ].filter(Boolean).length;

  return (
    <div className="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden transition-all duration-300">
      {/* Top Search Header Bar */}
      <div className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/60 border-b border-slate-800/80">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            placeholder="Recherche rapide : Fally, Roga Roga, Rumba, 2026, Tokooos..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
          />
          {filters.query && (
            <button
              onClick={() => updateFilter('query', '')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end shrink-0">
          {/* Result Speed & Count Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-bold text-white">{resultCount}</span>
            <span className="text-slate-400">résultats</span>
          </div>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={onToggleOpen}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm active:scale-95 ${
              isOpen || activeCount > 0
                ? 'bg-amber-400 text-slate-950 shadow-amber-400/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtres Avancés</span>
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {activeCount > 0 && (
            <button
              onClick={onResetFilters}
              title="Réinitialiser tous les filtres"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Advanced Filter Controls */}
      {isOpen && (
        <div className="p-5 space-y-5 bg-slate-900/95 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. Country Selector (Focus RDC & Congo Brazza) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" />
                <span>Pays & Région</span>
              </label>
              <select
                value={filters.country}
                onChange={(e) => updateFilter('country', e.target.value as CountryCode | 'ALL')}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="ALL">🌐 Tous les pays du monde</option>
                <option value="RDC">🇨🇩 RD Congo (Kinshasa) - Focus</option>
                <option value="CG">🇨🇬 Congo Brazzaville - Focus</option>
                <option value="NG">🇳🇬 Nigeria (Afrobeats)</option>
                <option value="CI">🇨🇮 Côte d'Ivoire (Coupé-Décalé)</option>
                <option value="CM">🇨🇲 Cameroun</option>
                <option value="FR">🇫🇷 France & Diaspora</option>
                <option value="WORLD">🌍 Reste du Monde (Global)</option>
              </select>
            </div>

            {/* 2. Artist Filter */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Artiste</span>
              </label>
              <select
                value={filters.artist}
                onChange={(e) => updateFilter('artist', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="ALL">🎤 Tous les artistes</option>
                <optgroup label="🇨🇩 RD Congo (Kinshasa)">
                  {ARTISTS_BY_REGION.filter((a) => a.country === 'RDC').map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.flag} {a.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🇨🇬 Congo Brazzaville">
                  {ARTISTS_BY_REGION.filter((a) => a.country === 'CG').map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.flag} {a.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="🌍 Afrique & International">
                  {ARTISTS_BY_REGION.filter((a) => a.country !== 'RDC' && a.country !== 'CG').map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.flag} {a.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* 3. Genre Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-rose-400" />
                <span>Genre Musical</span>
              </label>
              <select
                value={filters.genre}
                onChange={(e) => updateFilter('genre', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="ALL">🎵 Tous les genres</option>
                {ALL_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Release Date / Year Filter */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Année / Date de Sortie</span>
              </label>
              <select
                value={filters.yearRange}
                onChange={(e) => updateFilter('yearRange', e.target.value as YearRangeFilter)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
              >
                <option value="ALL">📅 Toutes les années</option>
                <option value="2026">🚀 2026 (Exclusivités & Sorties Actuelles)</option>
                <option value="2025">✨ 2025 (Hits Récents)</option>
                <option value="2024">🎵 2024</option>
                <option value="2020-2023">📻 2020 - 2023 (Période Moderne)</option>
                <option value="1990s">🌟 Années 1990 (Wenge 4x4, Extra Musica, Koffi, Ndombolo)</option>
                <option value="1980s">🎸 Années 1980 (Franco, Tabu Ley, Mbilia Bel, Zaïko, Papa Wemba)</option>
                <option value="CLASSIC">🏛️ Tous les Rétros & Classiques (Avant 2000)</option>
              </select>
            </div>
          </div>

          {/* Golden Eras Shortcut Buttons: 1980s & 1990s */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider flex items-center gap-1">
              <span>🕰️ Époques Dorées :</span>
            </span>
            <button
              onClick={() => updateFilter('yearRange', filters.yearRange === '1980s' ? 'ALL' : '1980s')}
              className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 ${
                filters.yearRange === '1980s'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-500/30'
              }`}
            >
              <span>🎸 Années 1980 (Rumba & Soukous)</span>
            </button>
            <button
              onClick={() => updateFilter('yearRange', filters.yearRange === '1990s' ? 'ALL' : '1990s')}
              className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 ${
                filters.yearRange === '1990s'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-amber-200 border border-amber-500/30'
              }`}
            >
              <span>🌟 Années 1990 (Ndombolo & Wenge 4x4)</span>
            </button>
            <button
              onClick={() => updateFilter('yearRange', filters.yearRange === '2026' ? 'ALL' : '2026')}
              className={`px-3 py-1 rounded-xl font-bold transition flex items-center gap-1.5 ${
                filters.yearRange === '2026'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span>🚀 Nouveautés 2026</span>
            </button>
          </div>

          {/* Format, Toggles & Sort Options Row */}
          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            {/* Format selection */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">Format :</span>
              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[
                  { id: 'ALL', label: 'Tout' },
                  { id: 'video', label: '🎬 Clips HD' },
                  { id: 'audio', label: '🎵 Audio' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => updateFilter('mediaType', f.id as 'ALL' | 'video' | 'audio')}
                    className={`px-3 py-1 rounded-lg font-bold transition ${
                      filters.mediaType === f.id
                        ? 'bg-amber-400 text-slate-950 shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Prioritization Toggles (Prompt requirement: prioritizing new releases and HD content) */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => updateFilter('onlyNew', !filters.onlyNew)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition active:scale-95 ${
                  filters.onlyNew
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Nouveautés Récentes Uniquement</span>
              </button>

              <button
                onClick={() => updateFilter('onlyHD', !filters.onlyHD)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition active:scale-95 ${
                  filters.onlyHD
                    ? 'bg-rose-600/20 border-rose-500 text-rose-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Tv className="w-3.5 h-3.5 text-rose-400" />
                <span>Haute Définition (1080p / 4K)</span>
              </button>
            </div>

            {/* Sort Engine Selector */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400">Trier par :</span>
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white text-xs font-semibold focus:outline-none focus:border-amber-400"
              >
                <option value="priority_new_hd">⚡ Priorité Nouveautés & HD (Recommandé)</option>
                <option value="newest">📅 Plus récents d'abord</option>
                <option value="hd_first">🎬 Clips HD en premier</option>
                <option value="popularity">👁️ Popularité & Vues</option>
                <option value="cash_reward">💵 Plus rémunérateurs (FCFA Réel)</option>
                <option value="artist_az">🔤 Nom d'artiste (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Quick Artist Shortcuts for RDC & Congo Brazzaville */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Accès direct aux artistes phares :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { name: 'Fally Ipupa', flag: '🇨🇩' },
                { name: 'Ferré Gola', flag: '🇨🇩' },
                { name: 'Koffi Olomidé', flag: '🇨🇩' },
                { name: 'Roga Roga & Extra Musica', flag: '🇨🇬' },
                { name: 'Tidiane Mario', flag: '🇨🇬' },
                { name: 'Diesel Gucci', flag: '🇨🇬' },
                { name: 'Innoss\'B', flag: '🇨🇩' },
                { name: 'Burna Boy', flag: '🇳🇬' },
                { name: 'Franco & TP OK Jazz', flag: '🇨🇩' },
                { name: 'Les Bantous de la Capitale', flag: '🇨🇬' },
              ].map((art) => (
                <button
                  key={art.name}
                  onClick={() => updateFilter('artist', filters.artist === art.name ? 'ALL' : art.name)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    filters.artist === art.name
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span>{art.flag}</span>
                  <span>{art.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Chips Bar (Shown when any filter is active) */}
      {activeCount > 0 && (
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px]">
          <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3 text-amber-400" />
            <span>Filtres appliqués :</span>
          </span>

          {filters.query && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
              <span>Recherche: "{filters.query}"</span>
              <button onClick={() => updateFilter('query', '')} className="hover:text-amber-400">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.country !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <span>Pays: {filters.country}</span>
              <button onClick={() => updateFilter('country', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.artist !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <span>Artiste: {filters.artist}</span>
              <button onClick={() => updateFilter('artist', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.genre !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              <span>Genre: {filters.genre}</span>
              <button onClick={() => updateFilter('genre', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.yearRange !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span>Année: {filters.yearRange}</span>
              <button onClick={() => updateFilter('yearRange', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.mediaType !== 'ALL' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <span>Type: {filters.mediaType === 'video' ? 'Clips HD' : 'Audio'}</span>
              <button onClick={() => updateFilter('mediaType', 'ALL')} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.onlyHD && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">
              <span>HD / 4K</span>
              <button onClick={() => updateFilter('onlyHD', false)} className="hover:text-amber-300">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.onlyNew && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black">
              <span>Nouveautés</span>
              <button onClick={() => updateFilter('onlyNew', false)} className="hover:text-rose-900">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onResetFilters}
            className="text-amber-400 hover:text-amber-300 underline font-semibold ml-auto text-[11px]"
          >
            Effacer tous les filtres
          </button>
        </div>
      )}
    </div>
  );
};
