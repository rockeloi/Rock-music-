import React from 'react';
import { COUNTRIES } from '../data/catalog';
import { CountryCode } from '../types';
import { Heart, Sparkles, Video, Music } from 'lucide-react';

interface CountryFilterProps {
  selectedCountry: CountryCode | 'ALL';
  onSelectCountry: (country: CountryCode | 'ALL') => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  likedCount: number;
}

export const CountryFilter: React.FC<CountryFilterProps> = ({
  selectedCountry,
  onSelectCountry,
  selectedCategory,
  onSelectCategory,
  likedCount,
}) => {
  const categoryChips = [
    { id: 'ALL', label: 'Tout le Catalogue', icon: null },
    { id: 'VIDEOS_HD', label: 'Clips Vidéos HD', icon: Video },
    { id: 'NEW_RELEASES', label: '🚀 Nouveautés 2025/2026', icon: Sparkles },
    { id: '1990S', label: '🌟 Années 1990 (Ndombolo)', icon: null },
    { id: '1980S', label: '🎸 Années 1980 (Rumba d\'Or)', icon: null },
    { id: 'AUDIO_ONLY', label: 'Chansons Audio', icon: Music },
    { id: 'TRENDING', label: 'Tendances & Hits', icon: Sparkles },
    { id: 'RUMBA', label: 'Rumba Congolaise 🇨🇩', icon: null },
    { id: 'NDOMBOLO', label: 'Ndombolo & Ambiance ⚡', icon: null },
    { id: 'AFROBEATS', label: 'Afrobeats & Pop 🌍', icon: null },
    { id: 'FAVORITES', label: `Mes Favoris (${likedCount})`, icon: Heart },
  ];

  return (
    <div className="space-y-3">
      {/* 1. Primary Country Selector Bar with flags */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-800">
        <button
          onClick={() => onSelectCountry('ALL')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
            selectedCountry === 'ALL'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
              : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
          }`}
        >
          <span className="text-base">🌐</span>
          <span>Tous les Pays</span>
        </button>

        {COUNTRIES.map((c) => {
          const isSelected = selectedCountry === c.code;
          return (
            <button
              key={c.code}
              onClick={() => onSelectCountry(c.code)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <span className="text-base">{c.flag}</span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Secondary Format & Genre Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {categoryChips.map((chip) => {
          const isSelected = selectedCategory === chip.id;
          const Icon = chip.icon;
          return (
            <button
              key={chip.id}
              onClick={() => onSelectCategory(chip.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              {Icon && <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />}
              <span>{chip.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
