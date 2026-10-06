export type MediaType = 'audio' | 'video';

export type CountryCode = 'RDC' | 'CG' | 'NG' | 'CI' | 'CM' | 'FR' | 'WORLD';

export interface CountryInfo {
  code: CountryCode;
  name: string;
  flag: string;
  description: string;
  popularGenres: string[];
}

export interface MediaItem {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  album?: string;
  duration: number; // in seconds
  releaseYear: number;
  country: CountryCode;
  countryName: string;
  genre: string;
  type: MediaType;
  coverUrl: string;
  videoUrl?: string; // YouTube or direct video
  audioUrl?: string;
  isHD?: boolean;
  hdQuality?: '1080p HD' | '4K Ultra HD' | '720p HD';
  isTrending?: boolean;
  isNew?: boolean;
  views: number;
  likes: number;
  lyrics?: string;
  description?: string;
  cashRewardValue: number; // in FCFA
}

export interface OfflineItem {
  media: MediaItem;
  downloadedAt: number;
  fileSizeMb: number;
  blobType: 'audio/mp3' | 'video/mp4';
  isStoredLocally: boolean;
}

export interface CashRewardTransaction {
  id: string;
  timestamp: number;
  title: string;
  amount: number; // In FCFA
  type: 'listening' | 'video_watch' | 'share' | 'daily_bonus' | 'withdrawal';
  status: 'completed' | 'pending' | 'processing';
  paymentMethod?: 'airtel_money' | 'mtn_momo' | 'orange_money' | 'mpesa' | 'bank_transfer';
  phoneOrAccount?: string;
}

export interface UserPreferences {
  favoriteCountries: CountryCode[];
  favoriteGenres: string[];
  favoriteArtists: string[];
  currency: 'XAF' | 'CDF' | 'USD';
  audioQuality: 'auto' | 'high' | 'saver';
  offlineOnlyMode: boolean;
}

export interface CommentItem {
  id: string;
  userName: string;
  userCity: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

export type YearRangeFilter = 'ALL' | '2026' | '2025' | '2024' | '2020-2023' | '1990s' | '1980s' | 'CLASSIC';

export type SortOption = 'priority_new_hd' | 'newest' | 'hd_first' | 'popularity' | 'cash_reward' | 'artist_az';

export interface AdvancedSearchFilters {
  query: string;
  country: CountryCode | 'ALL';
  genre: string;
  artist: string;
  yearRange: YearRangeFilter;
  mediaType: 'ALL' | 'video' | 'audio';
  onlyHD: boolean;
  onlyNew: boolean;
  sortBy: SortOption;
}

