import { CashRewardTransaction, MediaItem, OfflineItem, UserPreferences } from '../types';

const STORAGE_KEYS = {
  OFFLINE_ITEMS: 'rock_music_offline_items_v1',
  CASH_BALANCE: 'rock_music_cash_balance_v1',
  TRANSACTIONS: 'rock_music_transactions_v1',
  PREFERENCES: 'rock_music_preferences_v1',
  LIKED_IDS: 'rock_music_liked_ids_v1',
  LAST_DAILY_BONUS: 'rock_music_last_daily_bonus_v1',
  CUSTOM_TRACKS: 'rock_music_custom_tracks_v1',
};

// Initial default cash balance for a great onboarding experience: 2 500 FCFA
const DEFAULT_INITIAL_BALANCE = 2500;

export const storageService = {
  // --- Offline Library Management ---
  getOfflineItems(): OfflineItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_ITEMS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isMediaDownloaded(mediaId: string): boolean {
    const items = this.getOfflineItems();
    return items.some((item) => item.media.id === mediaId);
  },

  saveMediaOffline(media: MediaItem): OfflineItem {
    const items = this.getOfflineItems();
    const existingIndex = items.findIndex((item) => item.media.id === media.id);
    
    // Estimate file size based on duration and type
    const baseMbPerMin = media.type === 'video' ? 14.5 : 2.8;
    const estimatedMb = parseFloat(((media.duration / 60) * baseMbPerMin).toFixed(1));

    const newItem: OfflineItem = {
      media,
      downloadedAt: Date.now(),
      fileSizeMb: estimatedMb,
      blobType: media.type === 'video' ? 'video/mp4' : 'audio/mp3',
      isStoredLocally: true,
    };

    if (existingIndex >= 0) {
      items[existingIndex] = newItem;
    } else {
      items.unshift(newItem);
    }

    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('LocalStorage quota exceeded for offline items', e);
    }
    return newItem;
  },

  removeOfflineMedia(mediaId: string): void {
    const items = this.getOfflineItems().filter((item) => item.media.id !== mediaId);
    try {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  },

  clearAllOfflineData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.OFFLINE_ITEMS);
    } catch (e) {
      console.error(e);
    }
  },

  getTotalOfflineStorageMb(): number {
    const items = this.getOfflineItems();
    return parseFloat(items.reduce((acc, item) => acc + item.fileSizeMb, 0).toFixed(1));
  },

  // --- Real Cash Rewards & Wallet ---
  getCashBalance(): number {
    try {
      const val = localStorage.getItem(STORAGE_KEYS.CASH_BALANCE);
      if (val === null) {
        // initialize with starting bonus
        this.setCashBalance(DEFAULT_INITIAL_BALANCE);
        this.addTransaction({
          id: 'bonus-welcome',
          timestamp: Date.now(),
          title: 'Bonus de Bienvenue Rock Music',
          amount: DEFAULT_INITIAL_BALANCE,
          type: 'daily_bonus',
          status: 'completed',
        });
        return DEFAULT_INITIAL_BALANCE;
      }
      return parseFloat(val) || 0;
    } catch {
      return DEFAULT_INITIAL_BALANCE;
    }
  },

  setCashBalance(amount: number): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CASH_BALANCE, amount.toString());
    } catch (e) {
      console.error(e);
    }
  },

  addCashReward(amount: number, reason: string, type: CashRewardTransaction['type']): number {
    const current = this.getCashBalance();
    const newBalance = current + amount;
    this.setCashBalance(newBalance);

    const transaction: CashRewardTransaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      title: reason,
      amount,
      type,
      status: 'completed',
    };
    this.addTransaction(transaction);

    return newBalance;
  },

  withdrawCash(
    amount: number,
    paymentMethod: CashRewardTransaction['paymentMethod'],
    phoneOrAccount: string
  ): { success: boolean; message: string; remainingBalance: number } {
    const current = this.getCashBalance();
    if (amount <= 0) {
      return { success: false, message: 'Montant invalide', remainingBalance: current };
    }
    if (current < amount) {
      return { success: false, message: 'Solde insuffisant pour ce retrait', remainingBalance: current };
    }

    const newBalance = current - amount;
    this.setCashBalance(newBalance);

    const tx: CashRewardTransaction = {
      id: 'retrait-' + Date.now(),
      timestamp: Date.now(),
      title: `Retrait vers ${this.getPaymentMethodLabel(paymentMethod)} (${phoneOrAccount})`,
      amount: -amount,
      type: 'withdrawal',
      status: 'processing',
      paymentMethod,
      phoneOrAccount,
    };
    this.addTransaction(tx);

    return {
      success: true,
      message: `Demande de retrait de ${amount.toLocaleString('fr-FR')} FCFA envoyée avec succès vers ${this.getPaymentMethodLabel(paymentMethod)} ! Validation sous 15 minutes.`,
      remainingBalance: newBalance,
    };
  },

  getPaymentMethodLabel(method?: CashRewardTransaction['paymentMethod']): string {
    switch (method) {
      case 'airtel_money':
        return 'Airtel Money';
      case 'mtn_momo':
        return 'MTN Mobile Money';
      case 'orange_money':
        return 'Orange Money';
      case 'mpesa':
        return 'M-Pesa Vodacom';
      case 'bank_transfer':
        return 'Virement Bancaire';
      default:
        return 'Mobile Money';
    }
  },

  getTransactions(): CashRewardTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  addTransaction(tx: CashRewardTransaction): void {
    const list = this.getTransactions();
    list.unshift(tx);
    try {
      // keep up to 100 transactions
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list.slice(0, 100)));
    } catch (e) {
      console.error(e);
    }
  },

  // Daily reward check
  claimDailyBonus(): { claimed: boolean; amount: number } {
    try {
      const last = localStorage.getItem(STORAGE_KEYS.LAST_DAILY_BONUS);
      const today = new Date().toDateString();
      if (last === today) {
        return { claimed: false, amount: 0 };
      }
      localStorage.setItem(STORAGE_KEYS.LAST_DAILY_BONUS, today);
      const bonus = 500; // 500 FCFA daily
      this.addCashReward(bonus, 'Bonus quotidien de connexion Rock Music', 'daily_bonus');
      return { claimed: true, amount: bonus };
    } catch {
      return { claimed: false, amount: 0 };
    }
  },

  // --- Likes ---
  getLikedIds(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LIKED_IDS);
      return data ? JSON.parse(data) : ['rdc-fally-mayday', 'cg-roga-bokoko'];
    } catch {
      return [];
    }
  },

  toggleLike(id: string): boolean {
    const list = this.getLikedIds();
    const exists = list.includes(id);
    let updated: string[];
    if (exists) {
      updated = list.filter((item) => item !== id);
    } else {
      updated = [...list, id];
    }
    try {
      localStorage.setItem(STORAGE_KEYS.LIKED_IDS, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    return !exists;
  },

  // --- User Preferences ---
  getPreferences(): UserPreferences {
    const defaults: UserPreferences = {
      favoriteCountries: ['RDC', 'CG'],
      favoriteGenres: ['Rumba Congolaise', 'Ndombolo', 'Afro-Congo', 'Afrobeats'],
      favoriteArtists: ['Fally Ipupa', 'Roga Roga', 'Ferré Gola', 'Koffi Olomidé', 'Burna Boy'],
      currency: 'XAF',
      audioQuality: 'high',
      offlineOnlyMode: false,
    };
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      return data ? { ...defaults, ...JSON.parse(data) } : defaults;
    } catch {
      return defaults;
    }
  },

  savePreferences(prefs: UserPreferences): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
    } catch (e) {
      console.error(e);
    }
  },

  // Convert FCFA to user currency
  formatCurrency(amountFCFA: number, currency: 'XAF' | 'CDF' | 'USD' = 'XAF'): string {
    if (currency === 'CDF') {
      // 1 FCFA ≈ 4.3 CDF
      const cdf = Math.round(amountFCFA * 4.3);
      return `${cdf.toLocaleString('fr-FR')} CDF`;
    }
    if (currency === 'USD') {
      // 1 USD ≈ 610 FCFA
      const usd = (amountFCFA / 610).toFixed(2);
      return `${usd} $ USD`;
    }
    // XAF FCFA
    return `${Math.round(amountFCFA).toLocaleString('fr-FR')} FCFA`;
  },
};
