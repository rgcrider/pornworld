// NexaPlay Core TypeScript Types

export type UserRole = 'VISITOR' | 'USER' | 'CREATOR' | 'MODERATOR' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatar: string;
  role: UserRole;
  isVerified: boolean;
  isBanned?: boolean;
  isAgeVerified: boolean;
  createdAt: string;
}

export interface Creator {
  id: string;
  userId?: string;
  channelName: string;
  handle: string;
  avatar: string;
  banner?: string;
  bio?: string;
  isVerified: boolean;
  subscriberCount: number;
  totalViews: number;
}

export interface VideoSourceQuality {
  quality: '1080p' | '720p' | '480p' | '360p' | 'auto';
  fileUrl: string;
  format?: string;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  description: string;
  duration: number; // seconds
  thumbnailUrl: string;
  previewGifUrl?: string;
  playbackUrl: string;
  hlsManifestUrl?: string;
  isHD: boolean;
  resolution: string;
  viewsCount: number;
  likesCount: number;
  dislikesCount: number;
  ratingScore: number; // e.g. 98.4
  isAgeRestricted: boolean;
  status: 'READY' | 'PROCESSING' | 'UPLOADING' | 'REJECTED' | 'REMOVED';
  visibility: 'PUBLIC' | 'UNLISTED' | 'PRIVATE' | 'AGE_RESTRICTED';
  license: string;
  sourceProvider: 'NexaPlay' | 'PeerTube' | 'SelfHosted' | 'OpenSource';
  sourceUrl?: string;
  embedUrl?: string;
  creator: Creator;
  category: string;
  tags: string[];
  createdAt: string;
  userLiked?: boolean;
  userDisliked?: boolean;
  userFavorited?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  thumbnail: string;
  videoCount: number;
  orderIndex: number;
  isVisible: boolean;
}

export interface Comment {
  id: string;
  videoId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  likesCount: number;
  userLiked?: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: string;
  videosCount: number;
  thumbnail?: string;
  createdAt: string;
  videos?: Video[];
}

export interface WatchHistoryItem {
  id: string;
  videoId: string;
  video: Video;
  lastPositionSec: number;
  completed: boolean;
  updatedAt: string;
}

export interface VideoReport {
  id: string;
  videoId: string;
  videoTitle: string;
  videoThumbnail: string;
  reporterName: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
  moderatorNote?: string;
  createdAt: string;
}

export interface PeerTubeInstance {
  id: string;
  name: string;
  url: string;
  apiUrl: string;
  isEnabled: boolean;
  allowedLicenses: string[];
  lastSync?: string;
  videosImportedCount: number;
}

export interface PeerTubeRemoteVideo {
  id: string;
  uuid: string;
  name: string;
  description?: string;
  duration: number;
  views: number;
  likes: number;
  thumbnailUrl: string;
  embedUrl: string;
  playbackUrl: string;
  channelName: string;
  publishedAt: string;
  category: string;
  tags: string[];
  license: string;
  sourceInstance: string;
  isImported?: boolean;
}

export interface SiteSettings {
  siteName: string;
  logoText: string;
  primaryColor: string;
  siteDescription: string;
  enableAgeGate: boolean;
  allowUserRegistration: boolean;
  allowUploads: boolean;
  enableAdvertisements: boolean;
  peerTubeDefaultInstance: string;
  videoGridColumns: number;
  videosPerPage: number;
  adsHeaderEnabled: boolean;
  adsPlayerEnabled: boolean;
  adsSidebarEnabled: boolean;
  adsGridEnabled: boolean;
}

export interface CreatorAnalytics {
  totalViews: number;
  watchTimeHours: number;
  totalLikes: number;
  subscriberCount: number;
  commentsCount: number;
  viewsHistory: { date: string; views: number }[];
  trafficSources: { source: string; percentage: number }[];
  deviceBreakdown: { device: string; percentage: number }[];
  topVideos: { id: string; title: string; views: number; likes: number }[];
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalVideos: number;
  totalViews: number;
  videosToday: number;
  newUsersToday: number;
  pendingReports: number;
  storageUsageGB: number;
  viewsHistory: { date: string; views: number }[];
  recentReports: VideoReport[];
  topCategories: { name: string; percentage: number }[];
}
