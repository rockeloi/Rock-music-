import React, { useState } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  Send,
  ThumbsUp,
} from 'lucide-react';
import { MediaItem, CommentItem } from '../types';
import { INITIAL_COMMENTS } from '../data/catalog';
import { storageService } from '../services/storageService';
import confetti from 'canvas-confetti';

interface SocialShareModalProps {
  media: MediaItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (amount: number) => void;
}

export const SocialShareModal: React.FC<SocialShareModalProps> = ({
  media,
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  if (!isOpen || !media) return null;

  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState('');
  const [hasSharedForReward, setHasSharedForReward] = useState(false);

  const shareUrl = window.location.href;
  const shareText = `🎵 Écoute et regarde le clip HD "${media.title}" de ${media.artist} (${media.countryName}) sur l'application Rock Music ! Téléchargeable avec mode hors ligne et récompenses en argent réel : ${shareUrl}`;

  const triggerShareReward = () => {
    if (!hasSharedForReward) {
      setHasSharedForReward(true);
      const bonus = 200;
      storageService.addCashReward(
        bonus,
        `Partage social du titre "${media.title}"`,
        'share'
      );
      onRewardClaimed(bonus);
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    triggerShareReward();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    triggerShareReward();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleFacebookShare = () => {
    triggerShareReward();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const handleTwitterShare = () => {
    triggerShareReward();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleTelegramShare = () => {
    triggerShareReward();
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const item: CommentItem = {
      id: 'comm-' + Date.now(),
      userName: 'Fan Passionné',
      userCity: 'Kinshasa / Brazza',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      text: newComment.trim(),
      timestamp: 'À l\'instant',
      likes: 1,
    };
    setComments([item, ...comments]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-indigo-800 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Share2 className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black">Partage Social & Communauté</h3>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                  +200 FCFA Réel
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Connectez les mélomanes et gagnez de l'argent réel à chaque partage !
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-xl bg-black/20 hover:bg-black/40 text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Target Media Card */}
          <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
            <img src={media.coverUrl} alt={media.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
            <div className="min-w-0 flex-1 truncate">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{media.countryName}</span>
              <h4 className="font-bold text-sm text-white truncate">{media.title}</h4>
              <p className="text-xs text-slate-400 truncate">{media.artist} • {media.genre}</p>
            </div>
          </div>

          {/* Share Buttons Grid */}
          <div>
            <div className="font-bold text-slate-300 mb-2.5 flex items-center justify-between">
              <span>Partager instantanément sur vos réseaux :</span>
              {hasSharedForReward ? (
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Bonus +200 FCFA encaissé !
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5" /> Gagnez 200 FCFA
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={handleWhatsAppShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-bold transition active:scale-95"
              >
                <MessageCircle className="w-6 h-6 text-emerald-400 mb-1" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleFacebookShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold transition active:scale-95"
              >
                <span className="text-xl mb-0.5">📘</span>
                <span>Facebook</span>
              </button>

              <button
                onClick={handleTwitterShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 text-sky-300 font-bold transition active:scale-95"
              >
                <span className="text-xl mb-0.5">𝕏</span>
                <span>X / Twitter</span>
              </button>

              <button
                onClick={handleTelegramShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 font-bold transition active:scale-95"
              >
                <span className="text-xl mb-0.5">✈️</span>
                <span>Telegram</span>
              </button>
            </div>
          </div>

          {/* Copy Direct Link */}
          <div>
            <div className="font-bold text-slate-300 mb-1.5">Lien direct d'écoute et téléchargement :</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono truncate"
              />
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold px-4 py-2 rounded-xl border border-slate-700 whitespace-nowrap transition active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
          </div>

          {/* Community Feed / Reactions */}
          <div className="pt-2 border-t border-slate-800">
            <div className="font-bold text-slate-200 mb-2 flex items-center justify-between">
              <span>Espace Communauté & Avis des Fans</span>
              <span className="text-slate-400 text-[11px] font-mono">{comments.length} avis</span>
            </div>

            <form onSubmit={handleAddComment} className="flex gap-2 mb-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Laissez votre réaction ou dédicace..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-3 py-2 rounded-xl transition active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="space-y-2.5 max-h-48 overflow-y-auto">
              {comments.map((comm) => (
                <div key={comm.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src={comm.avatar} alt={comm.userName} className="w-6 h-6 rounded-full object-cover" />
                      <span className="font-bold text-white text-[11px]">{comm.userName}</span>
                      <span className="text-[10px] text-slate-500 font-medium">({comm.userCity})</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{comm.timestamp}</span>
                  </div>
                  <p className="text-slate-300 text-xs pl-8">{comm.text}</p>
                  <div className="pl-8 flex items-center gap-1 text-[10px] text-slate-400 pt-1">
                    <button className="flex items-center gap-1 hover:text-amber-400">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{comm.likes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
