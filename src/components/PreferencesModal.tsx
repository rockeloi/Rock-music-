import React, { useState } from 'react';
import { X, Sliders, Check, Globe, Sparkles } from 'lucide-react';
import { storageService } from '../services/storageService';
import { CountryCode, UserPreferences } from '../types';
import { COUNTRIES } from '../data/catalog';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPreferencesSaved: () => void;
}

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  onPreferencesSaved,
}) => {
  if (!isOpen) return null;

  const [prefs, setPrefs] = useState<UserPreferences>(() => storageService.getPreferences());

  const genresList = [
    'Rumba Congolaise',
    'Ndombolo',
    'Afro-Congo',
    'Afrobeats',
    'Congo Trap',
    'Coupé-Décalé',
    'Amapiano',
    'Gospel Congolais',
    'Rap Français / Diaspora',
    'Pop Urbaine',
  ];

  const toggleCountry = (code: CountryCode) => {
    const list = prefs.favoriteCountries;
    const exists = list.includes(code);
    const updated = exists ? list.filter((c) => c !== code) : [...list, code];
    setPrefs({ ...prefs, favoriteCountries: updated });
  };

  const toggleGenre = (genre: string) => {
    const list = prefs.favoriteGenres;
    const exists = list.includes(genre);
    const updated = exists ? list.filter((g) => g !== genre) : [...list, genre];
    setPrefs({ ...prefs, favoriteGenres: updated });
  };

  const handleSave = () => {
    storageService.savePreferences(prefs);
    onPreferencesSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        <div className="bg-slate-950 p-5 border-b border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Sliders className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Recommandations & Préférences</h3>
              <p className="text-xs text-slate-400">Personnalisez votre fil musical Rock Music</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Countries */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-amber-400" />
              <span>Vos pays musicaux préférés :</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COUNTRIES.map((c) => {
                const isSelected = prefs.favoriteCountries.includes(c.code);
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => toggleCountry(c.code)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>{c.flag}</span>
                      <span className="truncate">{c.name}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Genres */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Vos genres et rythmes favoris :</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {genresList.map((genre) => {
                const isSelected = prefs.favoriteGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Currency selection for Real Cash */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Devise d'affichage des gains en argent réel :
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'XAF', label: 'Francs CFA (XAF)', flag: '🇨🇬 🇨🇲' },
                { code: 'CDF', label: 'Francs Congolais (CDF)', flag: '🇨🇩' },
                { code: 'USD', label: 'Dollars ($ USD)', flag: '💵' },
              ].map((cur) => (
                <button
                  key={cur.code}
                  type="button"
                  onClick={() => setPrefs({ ...prefs, currency: cur.code as 'XAF' | 'CDF' | 'USD' })}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    prefs.currency === cur.code
                      ? 'bg-amber-400 text-slate-950 font-black border-amber-400 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="text-xs">{cur.flag}</div>
                  <div className="font-bold text-[11px] mt-0.5">{cur.code}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-5 py-2 rounded-xl text-xs shadow transition active:scale-95"
          >
            Enregistrer mes préférences
          </button>
        </div>
      </div>
    </div>
  );
};
