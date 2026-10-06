import React, { useState } from 'react';
import { Smartphone, Download, Check, X, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, install, isInstalled, isIOS } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  if (isInstalled || dismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-emerald-950/90 via-slate-900 to-indigo-950/90 border border-emerald-500/40 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shrink-0 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-emerald-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-white tracking-tight">
                Installer Rock Music sur Mobile (Chrome Android)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-bold">
                Application Officielle PWA
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Accès direct sans passer par le store, lecture 100% hors ligne et vitesse maximale sur Android & Chrome.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end shrink-0">
          {isInstallable ? (
            <button
              onClick={install}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-500/20 transition active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Installer Maintenant</span>
            </button>
          ) : (
            <button
              onClick={() => setShowAndroidGuide(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg transition active:scale-95 text-xs sm:text-sm"
            >
              <Smartphone className="w-4 h-4 text-slate-950" />
              <span>Guide Installation Chrome Android</span>
            </button>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Masquer cette bannière"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Android / Chrome Manual Guide Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-black text-base text-white">Installer sur Chrome Android</h4>
                  <p className="text-xs text-slate-400">En 3 secondes directement sur votre écran d'accueil</p>
                </div>
              </div>
              <button onClick={() => setShowAndroidGuide(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0">1</span>
                <div>
                  <div className="font-bold text-white">Ouvrez le lien sur Google Chrome</div>
                  <div className="text-slate-400 text-[11px]">Assurez-vous d'utiliser Chrome sur votre téléphone Android.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0">2</span>
                <div>
                  <div className="font-bold text-white">Appuyez sur les 3 petits points (⋮)</div>
                  <div className="text-slate-400 text-[11px]">En haut à droite de l'écran sur votre navigateur Chrome.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center shrink-0">3</span>
                <div>
                  <div className="font-bold text-white">Appuyez sur "Ajouter à l'écran d'accueil"</div>
                  <div className="text-slate-400 text-[11px]">Ou "Installer l'application". L'icône Rock Music apparaîtra comme une vraie application !</div>
                </div>
              </div>
            </div>

            {isIOS && (
              <div className="mt-4 p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 text-xs text-indigo-200">
                <strong>Sur iPhone / Safari :</strong> Appuyez sur le bouton Partager ⬆️ puis sur <em>"Sur l'écran d'accueil"</em>.
              </div>
            )}

            <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>PWA certifiée ultra légère</span>
              </div>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs"
              >
                J'ai compris
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
