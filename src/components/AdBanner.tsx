import React, { useState } from 'react';
import { Megaphone, Phone, MessageCircle, Sparkles, X, CheckCircle, ShieldCheck } from 'lucide-react';

export const AdBanner: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', service: 'Bannière Principale', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const phoneContact = "066969689";
  const intlPhone = "+242066969689"; // Congo Brazza / RDC direct contact

  const handleCall = () => {
    window.location.href = `tel:${phoneContact}`;
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent("Bonjour Rock Music, je souhaite réserver un espace publicitaire (Contact 066969689).");
    window.open(`https://wa.me/${intlPhone.replace('+', '')}?text=${text}`, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowModal(false);
    }, 2800);
  };

  return (
    <>
      {/* Top Banner Alert Bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-rose-700 to-indigo-800 text-white px-3 py-2 text-xs sm:text-sm font-medium shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 truncate">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
            </span>
            <Megaphone className="w-4 h-4 text-amber-200 shrink-0" />
            <span className="font-bold tracking-wide text-amber-100 uppercase">
              Espace Publicitaire Réservé
            </span>
            <span className="hidden md:inline text-white/90">
              — Faites la promotion de vos concerts, marques, singles et vidéos !
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="bg-black/30 backdrop-blur-sm px-2.5 py-0.5 rounded-full font-mono text-amber-200 text-xs font-bold border border-amber-300/30">
              📞 Contacter : {phoneContact}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-1 rounded text-xs transition transform hover:scale-105 active:scale-95 shadow cursor-pointer"
            >
              Réserver / Tarifs
            </button>
          </div>
        </div>
      </div>

      {/* Advertiser Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-indigo-500/20 p-5 border-b border-slate-800 flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Régie Publicitaire Officielle
                </div>
                <h3 className="text-xl font-black text-white tracking-wide">
                  Espace Publicitaire Réservé
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  Contact direct : <span className="text-amber-400 font-bold font-mono text-base">{phoneContact}</span>
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCall}
                  className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition active:scale-95 text-sm"
                >
                  <Phone className="w-4 h-4" />
                  Appeler ({phoneContact})
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition active:scale-95 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp Direct
                </button>
              </div>

              {/* Formats Dispo */}
              <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2 text-xs">
                <div className="font-semibold text-amber-300 uppercase tracking-wider mb-2">
                  Emplacements disponibles sur Rock Music :
                </div>
                <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/80">
                  <span>🎯 Bannière Header & Slider Principal</span>
                  <span className="text-emerald-400 font-mono font-bold">Haute Visibilité</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/80">
                  <span>🎬 Spot Vidéo HD avant les clips</span>
                  <span className="text-emerald-400 font-mono font-bold">100% Impact</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 py-1 border-b border-slate-800/80">
                  <span>🎵 Mise en avant Titre / Nouvel Artiste RDC-Congo</span>
                  <span className="text-emerald-400 font-mono font-bold">Top Trending</span>
                </div>
                <div className="flex items-center justify-between text-slate-300 py-1">
                  <span>📱 Notification push aux auditeurs de l'app</span>
                  <span className="text-emerald-400 font-mono font-bold">Ciblé RDC & Congo</span>
                </div>
              </div>

              {/* Form */}
              {submitted ? (
                <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-4 text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-white text-sm">Demande enregistrée !</p>
                  <p className="text-xs text-slate-300">Notre équipe commerciale vous rappellera directement au numéro indiqué ou au {phoneContact}.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Votre Nom / Entreprise</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Maison de production, Brasserie, Artiste"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Votre Numéro de Téléphone</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Ex: 06 69 69 689 / +242..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Type de Campagne souhaitée</label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option>Bannière Principale d'Accueil</option>
                      <option>Spot Vidéo HD avant clip</option>
                      <option>Promotion Single / Clip d'Artiste (RDC / Brazza)</option>
                      <option>Sponsoring Officiel de la Playlist Nationale</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl transition text-xs shadow-lg uppercase tracking-wider"
                  >
                    Envoyer ma demande de devis express
                  </button>
                </form>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Régie officielle Rock Music • Ligne directe : 066969689</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
