import React, { useState } from 'react';
import {
  X,
  Wallet,
  Sparkles,
  ArrowDownToLine,
  CheckCircle2,
  Calendar,
  Share2,
  Headphones,
  Video,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { CashRewardTransaction } from '../types';
import confetti from 'canvas-confetti';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
}

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  cashBalance,
  onBalanceUpdate,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'balance' | 'withdraw' | 'tasks' | 'history'>('balance');
  const [withdrawAmount, setWithdrawAmount] = useState('2500');
  const [paymentMethod, setPaymentMethod] = useState<CashRewardTransaction['paymentMethod']>('airtel_money');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [withdrawResult, setWithdrawResult] = useState<{ success: boolean; message: string } | null>(null);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);

  const prefs = storageService.getPreferences();
  const transactions = storageService.getTransactions();

  const handleClaimDailyBonus = () => {
    const res = storageService.claimDailyBonus();
    if (res.claimed) {
      setDailyBonusClaimed(true);
      const updated = storageService.getCashBalance();
      onBalanceUpdate(updated);
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } else {
      alert("Vous avez déjà récupéré votre bonus quotidien aujourd'hui ! Revenez demain pour 500 FCFA de plus.");
    }
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!phoneNumber || phoneNumber.length < 6) {
      alert("Veuillez saisir un numéro de téléphone mobile money valide (ex: 06 69 69 689).");
      return;
    }

    const res = storageService.withdrawCash(amount, paymentMethod, phoneNumber);
    setWithdrawResult(res);
    if (res.success) {
      onBalanceUpdate(res.remainingBalance);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
        });
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-rose-700 to-indigo-800 p-5 text-white flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Wallet className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black tracking-tight">Cagnotte en Argent Réel</h3>
                <span className="bg-emerald-500/90 text-slate-950 font-black text-[10px] uppercase px-2 py-0.5 rounded-full shadow">
                  100% Cash Réel
                </span>
              </div>
              <p className="text-xs text-amber-100/90 mt-0.5 font-medium">
                Pas de points virtuels : retraits directs sur vos comptes Mobile Money !
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

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-4 text-xs font-bold overflow-x-auto">
          {[
            { id: 'balance', label: 'Mon Solde & Gains' },
            { id: 'withdraw', label: 'Retirer mon Argent' },
            { id: 'tasks', label: 'Gagner plus de Cash' },
            { id: 'history', label: 'Historique des Paiements' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as typeof activeTab);
                setWithdrawResult(null);
              }}
              className={`py-3 px-3.5 border-b-2 transition whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Modal Body Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TAB 1: BALANCE & STATS */}
          {activeTab === 'balance' && (
            <div className="space-y-4">
              {/* Giant Balance Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-amber-500/30 p-5 shadow-xl">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-amber-400">
                    Solde Disponible Immédiat
                  </span>
                  <span className="font-mono text-[11px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                    Devise : {prefs.currency}
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {storageService.formatCurrency(cashBalance, prefs.currency)}
                  </span>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Équivalence : ~{(cashBalance * 4.3).toLocaleString('fr-FR')} CDF • ~{(cashBalance / 610).toFixed(2)} USD
                </p>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black px-4 py-2.5 rounded-xl shadow-lg transition active:scale-95 text-xs uppercase tracking-wider"
                  >
                    <ArrowDownToLine className="w-4 h-4 text-slate-950" />
                    <span>Demander un Retrait Cash</span>
                  </button>

                  <button
                    onClick={handleClaimDailyBonus}
                    disabled={dailyBonusClaimed}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-3.5 py-2.5 rounded-xl border border-slate-700 transition text-xs"
                  >
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Bonus Quotidien (+500 FCFA)</span>
                  </button>
                </div>
              </div>

              {/* How it works banner */}
              <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-2 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Règle d'or : De l'argent réel, pas des points !</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Sur Rock Music, chaque écoute, chaque vidéo regardée et chaque partage vous rapporte des Francs CFA / Francs Congolais réels, financés par notre espace publicitaire réservé. Dès 2 000 FCFA, vous pouvez retirer directement sur Airtel Money, MTN Mobile Money, Orange Money ou M-Pesa.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: WITHDRAW */}
          {activeTab === 'withdraw' && (
            <div className="space-y-4">
              {withdrawResult ? (
                <div
                  className={`p-4 rounded-xl border ${
                    withdrawResult.success
                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                  } space-y-2 text-center`}
                >
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400" />
                  <h4 className="font-black text-base text-white">Demande de Retrait Enregistrée !</h4>
                  <p className="text-xs">{withdrawResult.message}</p>
                  <button
                    onClick={() => setWithdrawResult(null)}
                    className="mt-3 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold"
                  >
                    Faire un autre retrait
                  </button>
                </div>
              ) : (
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      1. Choisissez votre moyen de paiement Mobile Money
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'airtel_money', label: 'Airtel Money', icon: '🔴', sub: 'Congo & RDC' },
                        { id: 'mtn_momo', label: 'MTN MoMo', icon: '🟡', sub: 'Congo Brazza' },
                        { id: 'orange_money', label: 'Orange Money', icon: '🟠', sub: 'RDC & Afrique' },
                        { id: 'mpesa', label: 'M-Pesa', icon: '🟢', sub: 'Vodacom RDC' },
                      ].map((m) => (
                        <button
                          type="button"
                          key={m.id}
                          onClick={() => setPaymentMethod(m.id as typeof paymentMethod)}
                          className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                            paymentMethod === m.id
                              ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                              : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <span className="text-lg">{m.icon}</span>
                          <span className="font-bold text-xs text-white mt-1">{m.label}</span>
                          <span className="text-[10px] text-slate-400">{m.sub}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      2. Numéro Mobile Money bénéficiaire
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 06 69 69 689 ou +242 06 69 69 689"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Le numéro sur lequel vous recevrez les fonds directement par SMS.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      3. Montant du Retrait (Minimum : 2 000 FCFA)
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {['2000', '5000', '10000', '25000'].map((amt) => (
                        <button
                          type="button"
                          key={amt}
                          onClick={() => setWithdrawAmount(amt)}
                          className={`py-1.5 rounded-lg border text-xs font-bold font-mono transition ${
                            withdrawAmount === amt
                              ? 'bg-amber-400 text-slate-950 border-amber-400'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          {parseInt(amt).toLocaleString('fr-FR')} F
                        </button>
                      ))}
                    </div>

                    <input
                      type="number"
                      min="2000"
                      step="500"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={cashBalance < parseFloat(withdrawAmount)}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-3 rounded-xl shadow-lg transition active:scale-95 text-xs sm:text-sm uppercase tracking-wider"
                  >
                    Confirmer le retrait de {parseInt(withdrawAmount || '0').toLocaleString('fr-FR')} FCFA
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: TASKS / EARN MORE CASH */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Chaque action sur l'application Rock Music est rémunérée en argent réel disponible sur votre cagnotte :
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Headphones className="w-5 h-5 text-indigo-400" />
                    <div>
                      <div className="font-bold text-xs text-white">Écouter un morceau en entier</div>
                      <div className="text-[11px] text-slate-400">Rumba, Ndombolo ou Afrobeats</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                    +80 FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-rose-400" />
                    <div>
                      <div className="font-bold text-xs text-white">Regarder un Clip Vidéo HD</div>
                      <div className="text-[11px] text-slate-400">À partir de 12 secondes de visionnage</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/30">
                    +150 FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Share2 className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-bold text-xs text-white">Partager sur WhatsApp ou réseaux</div>
                      <div className="text-[11px] text-slate-400">Faites découvrir des artistes locaux</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                    +200 FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="font-bold text-xs text-white">Connexion quotidienne à l'application</div>
                      <div className="text-[11px] text-slate-400">Bonus de fidélité automatique chaque jour</div>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-amber-400 text-xs bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/30">
                    +500 FCFA
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Dernières transactions réelles</span>
                <span>{transactions.length} enregistrements</span>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Aucune transaction récente. Commencez à écouter de la musique pour accumuler vos gains !
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-bold text-white truncate">{tx.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {new Date(tx.timestamp).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`font-black font-mono ${
                            tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.amount >= 0 ? `+${tx.amount}` : tx.amount} FCFA
                        </div>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            tx.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-amber-950 text-amber-400'
                          }`}
                        >
                          {tx.status === 'completed' ? 'Validé' : 'En traitement'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
