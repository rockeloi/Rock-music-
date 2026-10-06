import React from 'react';
import { Search, Globe, DownloadCloud, Sparkles, Sliders, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { storageService } from '../services/storageService';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenRewards: () => void;
  onOpenWebSearch: () => void;
  onOpenPreferences: () => void;
  onOpenOfflineSection: () => void;
  onToggleAdvancedSearch?: () => void;
  isAdvancedSearchOpen?: boolean;
  activeFilterCount?: number;
  offlineCount: number;
  cashBalance: number;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenRewards,
  onOpenWebSearch,
  onOpenPreferences,
  onOpenOfflineSection,
  onToggleAdvancedSearch,
  isAdvancedSearchOpen,
  activeFilterCount = 0,
  offlineCount,
  cashBalance,
}) => {
  const { isInstallable, install, isIOS, isAndroid, isInstalled } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const prefs = storageService.getPreferences();

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="w-full md:w-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-600 to-indigo-600 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl">🎸</span>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping"></div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-yellow-200 to-rose-400 bg-clip-text text-transparent uppercase">
                  Rock music
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  HD & Offline
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                RDC 🇨🇩 • Congo Brazzaville 🇨🇬 • Reste du Monde 🌍
              </p>
            </div>
          </div>

          {/* Mobile Right Controls: Online status & Wallet */}
          <div className="flex md:hidden items-center gap-2">
            {onToggleAdvancedSearch && (
              <button
                onClick={onToggleAdvancedSearch}
                className={`p-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1 ${
                  isAdvancedSearchOpen || activeFilterCount > 0
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300'
                }`}
                title="Filtres avancés"
              >
                <span>🔍 Filtres</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-300 text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}

            {!isOnline ? (
              <span className="flex items-center gap-1 text-[11px] text-amber-400 bg-amber-950/50 px-2 py-1 rounded-lg border border-amber-800">
                <WifiOff className="w-3.5 h-3.5" />
              </span>
            ) : null}

            <button
              onClick={onOpenRewards}
              className="flex items-center gap-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black px-2 py-1.5 rounded-xl shadow-md text-xs active:scale-95 transition"
            >
              <span>💵</span>
              <span>{storageService.formatCurrency(cashBalance, prefs.currency)}</span>
            </button>
          </div>
        </div>

        {/* Center: Search & Web Engines Connect */}
        <div className="w-full md:max-w-xl flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Rechercher par titre, artiste, pays, rumba, 1980, 1990..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Advanced Search toggle button */}
          {onToggleAdvancedSearch && (
            <button
              onClick={onToggleAdvancedSearch}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition shadow active:scale-95 shrink-0 ${
                isAdvancedSearchOpen || activeFilterCount > 0
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-amber-400/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800'
              }`}
              title="Ouvrir la recherche avancée par pays, genre, artiste, année et qualité HD"
            >
              <span>Filtres Avancés</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-slate-950 text-amber-300 text-[10px] font-black flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* Direct Web Search Button */}
          <button
            onClick={onOpenWebSearch}
            title="Connexion directe avec les moteurs de recherche du Web (Google, YouTube, etc.)"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl border border-slate-700 text-xs font-semibold whitespace-nowrap transition active:scale-95 shadow shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Web Explorer</span>
            <span className="sm:hidden">Web</span>
          </button>
        </div>

        {/* Right Actions: Cash Wallet, Offline Downloads, PWA Chrome install, Preferences */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Online/Offline status badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-slate-400">En direct</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] text-amber-300 font-medium">Mode Hors ligne</span>
              </>
            )}
          </div>

          {/* Cash Rewards Button (Real Money!) */}
          <button
            onClick={onOpenRewards}
            className="group flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black px-3.5 py-1.5 rounded-xl shadow-lg shadow-amber-500/20 hover:brightness-105 active:scale-95 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-bounce" />
            <div className="text-left leading-tight">
              <div className="text-[9px] uppercase tracking-wider text-slate-900 font-bold">Argent Réel</div>
              <div className="text-xs sm:text-sm font-black">
                {storageService.formatCurrency(cashBalance, prefs.currency)}
              </div>
            </div>
          </button>

          {/* Offline Downloads library */}
          <button
            onClick={onOpenOfflineSection}
            className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition"
            title="Consulter mes titres et clips hors ligne"
          >
            <DownloadCloud className="w-4 h-4 text-indigo-400" />
            <span>Hors ligne</span>
            {offlineCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold">
                {offlineCount}
              </span>
            )}
          </button>

          {/* PWA Install Button for Chrome Android & Desktop */}
          {!isInstalled && (
            <button
              onClick={install}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 active:scale-95"
              title="Installer Rock Music sur Chrome Android & mobile"
            >
              <Smartphone className="w-4 h-4" />
              <span>{isAndroid ? 'Installer sur Android' : isIOS ? 'Installer iOS' : 'Télécharger App'}</span>
            </button>
          )}

          {/* Preferences */}
          <button
            onClick={onOpenPreferences}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition"
            title="Préférences et recommandations musicales"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
