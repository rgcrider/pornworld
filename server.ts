import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database Store with Pre-populated Realistic Video Catalog
// Compliant with open video content, peer-to-peer / PeerTube federation, and creative commons licenses

let currentUser = {
  id: "usr_admin_1",
  email: "admin@nexaplay.io",
  username: "AlexGrey",
  name: "Alex Grey",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  role: "ADMIN" as "VISITOR" | "USER" | "CREATOR" | "MODERATOR" | "ADMIN",
  isVerified: true,
  isAgeVerified: true,
  createdAt: "2025-01-15T08:00:00.000Z",
};

let siteSettings = {
  siteName: "NexaPlay",
  logoText: "NexaPlay",
  primaryColor: "#e11d48", // rose/crimson accent matching mockup
  siteDescription: "A modern video platform for open content and federated streaming.",
  enableAgeGate: true,
  allowUserRegistration: true,
  allowUploads: true,
  enableAdvertisements: true,
  peerTubeDefaultInstance: "https://peertube.tv",
  videoGridColumns: 4,
  videosPerPage: 24,
  adsHeaderEnabled: true,
  adsPlayerEnabled: true,
  adsSidebarEnabled: true,
  adsGridEnabled: true,
};

let categories = [
  { id: "cat-trending", name: "Trending", slug: "trending", icon: "Flame", thumbnail: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&auto=format&fit=crop&q=80", videoCount: 12400, orderIndex: 1, isVisible: true },
  { id: "cat-amateur", name: "Amateur", slug: "amateur", icon: "Heart", thumbnail: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80", videoCount: 8200, orderIndex: 2, isVisible: true },
  { id: "cat-couple", name: "Couple", slug: "couple", icon: "Users", thumbnail: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&auto=format&fit=crop&q=80", videoCount: 10100, orderIndex: 3, isVisible: true },
  { id: "cat-solo", name: "Solo", slug: "solo", icon: "User", thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80", videoCount: 9600, orderIndex: 4, isVisible: true },
  { id: "cat-mature", name: "Mature", slug: "mature", icon: "ShieldAlert", thumbnail: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80", videoCount: 6300, orderIndex: 5, isVisible: true },
  { id: "cat-fetish", name: "Fetish", slug: "fetish", icon: "Sparkles", thumbnail: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=400&auto=format&fit=crop&q=80", videoCount: 4800, orderIndex: 6, isVisible: true },
  { id: "cat-lesbian", name: "Lesbian", slug: "lesbian", icon: "HeartHandshake", thumbnail: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80", videoCount: 5200, orderIndex: 7, isVisible: true },
  { id: "cat-gay", name: "Gay", slug: "gay", icon: "Heart", thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80", videoCount: 4100, orderIndex: 8, isVisible: true },
  { id: "cat-transgender", name: "Transgender", slug: "transgender", icon: "Sparkles", thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80", videoCount: 2400, orderIndex: 9, isVisible: true },
  { id: "cat-asian", name: "Asian", slug: "asian", icon: "Globe", thumbnail: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80", videoCount: 3700, orderIndex: 10, isVisible: true },
  { id: "cat-ebony", name: "Ebony", slug: "ebony", icon: "Star", thumbnail: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80", videoCount: 3100, orderIndex: 11, isVisible: true },
  { id: "cat-latina", name: "Latina", slug: "latina", icon: "Flame", thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80", videoCount: 2900, orderIndex: 12, isVisible: true },
  { id: "cat-entertainment", name: "Entertainment", slug: "entertainment", icon: "Tv", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&auto=format&fit=crop&q=80", videoCount: 1540, orderIndex: 13, isVisible: true },
  { id: "cat-lifestyle", name: "Lifestyle", slug: "lifestyle", icon: "Coffee", thumbnail: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&auto=format&fit=crop&q=80", videoCount: 1820, orderIndex: 14, isVisible: true },
];

let creators = [
  {
    id: "crt-1",
    channelName: "EmmaLive",
    handle: "@emmalive",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
    bio: "Daily lifestyle streams, morning routines, and candid Q&As. Join the community!",
    isVerified: true,
    subscriberCount: 245000,
    totalViews: 18400000,
  },
  {
    id: "crt-2",
    channelName: "LunaStar",
    handle: "@lunastar",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
    bio: "Late night reflections, ambient aesthetics, and genuine behind-the-scenes moments.",
    isVerified: true,
    subscriberCount: 412000,
    totalViews: 32900000,
  },
  {
    id: "crt-3",
    channelName: "FitVibes",
    handle: "@fitvibes",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&auto=format&fit=crop&q=80",
    bio: "Energy, mobility, high-intensity workouts, and wellness routines.",
    isVerified: true,
    subscriberCount: 189000,
    totalViews: 14200000,
  },
  {
    id: "crt-4",
    channelName: "BellaRose",
    handle: "@bellarose",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80",
    bio: "Unfiltered talks, cozy vlog updates, and travel experiences worldwide.",
    isVerified: false,
    subscriberCount: 98000,
    totalViews: 6500000,
  },
  {
    id: "crt-5",
    channelName: "UrbanLife",
    handle: "@urbanlife",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1200&auto=format&fit=crop&q=80",
    bio: "Cinematic city tours, night walks, and urban explorations.",
    isVerified: true,
    subscriberCount: 320000,
    totalViews: 24500000,
  }
];

// High quality reliable open-stream video playback URLs
const SAMPLE_VIDEOS = [
  {
    id: "vid-morning-routine",
    title: "Morning Routine 💕 Natural & Cozy Vlog",
    slug: "morning-routine-cozy-vlog",
    description: "Start your day with positivity and good vibes! ☀️ This is my real morning routine — simple, fun, and completely unfiltered. We talk coffee, morning journaling, stretching, and getting ready for the day ahead.",
    duration: 754, // 12:34
    thumbnailUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 1245320,
    likesCount: 120500,
    dislikesCount: 1420,
    ratingScore: 98.8,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "Creative Commons BY-NC 4.0",
    sourceProvider: "NexaPlay",
    creator: creators[0],
    category: "Amateur",
    tags: ["morning", "routine", "lifestyle", "natural", "vlog", "cozy"],
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: "vid-summer-vibes",
    title: "Summer Vibes & Golden Hour Reflections",
    slug: "summer-vibes-golden-hour",
    description: "Warm breeze, glowing sunset, and quiet summer conversations. Shot in 4K UHD with ambient audio.",
    duration: 501, // 08:21
    thumbnailUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 2150000,
    likesCount: 184000,
    dislikesCount: 2100,
    ratingScore: 98.9,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "Open Culture License",
    sourceProvider: "PeerTube",
    sourceUrl: "https://peertube.tv/w/summer-vibes",
    creator: creators[1],
    category: "Solo",
    tags: ["summer", "vibes", "goldenhour", "aesthetic", "sunshine"],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "vid-late-night-chat",
    title: "Late Night Chat: Unwinding after midnight",
    slug: "late-night-chat-unwind",
    description: "Honest late night talk about dreams, pressure, creative passions, and making peace with slow days.",
    duration: 902, // 15:02
    thumbnailUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 2890000,
    likesCount: 245000,
    dislikesCount: 1980,
    ratingScore: 99.2,
    isAgeRestricted: true,
    status: "READY",
    visibility: "PUBLIC",
    license: "PeerTube Public License",
    sourceProvider: "PeerTube",
    creator: creators[0],
    category: "Mature",
    tags: ["chat", "night", "talk", "unwind", "mature"],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "vid-fitness-motivation",
    title: "Full Body Mobility & Core Activation Workout",
    slug: "fitness-motivation-full-body",
    description: "Follow along 10-minute mobility and core strengthener for posture, lower back relief, and energy.",
    duration: 558, // 09:18
    thumbnailUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 1840000,
    likesCount: 139000,
    dislikesCount: 820,
    ratingScore: 99.4,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "Creative Commons Attribution",
    sourceProvider: "NexaPlay",
    creator: creators[2],
    category: "Couple",
    tags: ["fitness", "workout", "mobility", "motivation", "health"],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "vid-city-dreams",
    title: "City Dreams: Tokyo Neon Rain Reflections",
    slug: "city-dreams-tokyo-neon",
    description: "Immersive 4K binaural stroll through Shibuya and Shinjuku during an evening rainfall.",
    duration: 754, // 12:34
    thumbnailUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 5400000,
    likesCount: 420000,
    dislikesCount: 3100,
    ratingScore: 99.3,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "Creative Commons BY-SA",
    sourceProvider: "PeerTube",
    creator: creators[4],
    category: "Trending",
    tags: ["city", "tokyo", "nightwalk", "neon", "rain"],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "vid-relax-unwind",
    title: "Relax & Unwind: Acoustic Guitar by the Campfire",
    slug: "relax-unwind-campfire-acoustic",
    description: "Gentle fingerstyle acoustic guitar accompanied by crackling fire under mountain stars.",
    duration: 622, // 10:22
    thumbnailUrl: "https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 3100000,
    likesCount: 289000,
    dislikesCount: 1100,
    ratingScore: 99.6,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "CC0 Public Domain",
    sourceProvider: "OpenSource",
    creator: creators[3],
    category: "Entertainment",
    tags: ["relax", "acoustic", "campfire", "music", "meditation"],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "vid-night-walk",
    title: "Night Walk in Kyoto: Historic Alleyways & Lanterns",
    slug: "night-walk-kyoto-lanterns",
    description: "Quiet evening walk through the cobblestone streets of Gion. Authentic ambient audio.",
    duration: 482, // 08:02
    thumbnailUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 2800000,
    likesCount: 215000,
    dislikesCount: 1200,
    ratingScore: 99.4,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "Creative Commons 4.0",
    sourceProvider: "PeerTube",
    creator: creators[4],
    category: "Asian",
    tags: ["kyoto", "japan", "travel", "culture", "asian"],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "vid-just-me",
    title: "Just Me: Answering Your Most Asked Questions",
    slug: "just-me-answering-questions",
    description: "Sitting down with some tea to answer questions from the community about life, goals, and content creation.",
    duration: 725, // 12:05
    thumbnailUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 2400000,
    likesCount: 195000,
    dislikesCount: 1400,
    ratingScore: 99.3,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "Standard NexaPlay License",
    sourceProvider: "NexaPlay",
    creator: creators[3],
    category: "Solo",
    tags: ["qa", "interview", "personal", "lifestyle", "creator"],
    createdAt: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
  {
    id: "vid-slow-morning",
    title: "Slow Morning Rituals & French Toast Preparation",
    slug: "slow-morning-rituals-toast",
    description: "Quiet morning baking, sourdough slicing, and brewing fresh pourover coffee.",
    duration: 552, // 09:12
    thumbnailUrl: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 430000,
    likesCount: 39000,
    dislikesCount: 290,
    ratingScore: 99.2,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "Creative Commons BY",
    sourceProvider: "NexaPlay",
    creator: creators[1],
    category: "Lifestyle",
    tags: ["morning", "coffee", "food", "kitchen", "peaceful"],
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: "vid-weekend-getaway",
    title: "Weekend Coastal Roadtrip & Sunset Cliffs",
    slug: "weekend-coastal-roadtrip",
    description: "Driving up the Pacific Coast Highway with open windows, coastal fog, and dramatic sandstone cliffs.",
    duration: 681, // 11:21
    thumbnailUrl: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 280000,
    likesCount: 25000,
    dislikesCount: 180,
    ratingScore: 99.3,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "PeerTube Open Source",
    sourceProvider: "PeerTube",
    creator: creators[4],
    category: "Latina",
    tags: ["travel", "ocean", "roadtrip", "latina", "scenic"],
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "vid-aesthetic-chill",
    title: "Aesthetic Chill & Studio Organization Session",
    slug: "aesthetic-chill-studio-organize",
    description: "Re-organizing my creative workspace, cable management, lighting setups, and desk tour.",
    duration: 525, // 08:45
    thumbnailUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 210000,
    likesCount: 19800,
    dislikesCount: 140,
    ratingScore: 99.3,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "Creative Commons BY-NC",
    sourceProvider: "NexaPlay",
    creator: creators[0],
    category: "Ebony",
    tags: ["studio", "desk", "tech", "ebony", "aesthetic"],
    createdAt: new Date(Date.now() - 21 * 86400000).toISOString(),
  },
  {
    id: "vid-morning-coffee",
    title: "Barista Latte Art & Espresso Mastery",
    slug: "barista-latte-art-espresso",
    description: "Steaming microfoam milk, dialing in medium roasts, and pouring swan & rosetta designs.",
    duration: 392, // 06:32
    thumbnailUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 180000,
    likesCount: 16500,
    dislikesCount: 120,
    ratingScore: 99.3,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: "Creative Commons Zero",
    sourceProvider: "OpenSource",
    creator: creators[3],
    category: "Lifestyle",
    tags: ["coffee", "latteart", "espresso", "morning", "barista"],
    createdAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  }
];

let videos: any[] = [...SAMPLE_VIDEOS];

let comments: any[] = [
  {
    id: "c-1",
    videoId: "vid-morning-routine",
    userId: "usr-alex",
    userName: "Alex R.",
    userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
    content: "Love this! So natural and authentic 💕 Keep up the amazing work Emma!",
    likesCount: 120,
    userLiked: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    replies: [
      {
        id: "c-1-r1",
        videoId: "vid-morning-routine",
        userId: creators[0].id,
        userName: "EmmaLive",
        userAvatar: creators[0].avatar,
        content: "Thank you so much Alex! More morning vlogs coming every Tuesday! ✨",
        likesCount: 45,
        userLiked: false,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      }
    ]
  },
  {
    id: "c-2",
    videoId: "vid-morning-routine",
    userId: "usr-sunny",
    userName: "SunnyDay",
    userAvatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
    content: "What a great start to the morning 😍 The sound quality in this video is pristine.",
    likesCount: 45,
    userLiked: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    replies: []
  },
  {
    id: "c-3",
    videoId: "vid-morning-routine",
    userId: "usr-marcus",
    userName: "Marcus V.",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    content: "Great camera work and color grading! What lighting kit do you use?",
    likesCount: 18,
    userLiked: false,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    replies: []
  }
];

let playlists: any[] = [
  {
    id: "pl-favorites",
    name: "Favorites",
    description: "My all-time favorite clips and streams",
    isPublic: false,
    userId: currentUser.id,
    thumbnail: SAMPLE_VIDEOS[0].thumbnailUrl,
    videos: [SAMPLE_VIDEOS[0], SAMPLE_VIDEOS[1]],
    videosCount: 12,
    createdAt: "2025-01-20T10:00:00.000Z"
  },
  {
    id: "pl-workout",
    name: "Workout Motivation",
    description: "High energy routines to push through workouts",
    isPublic: true,
    userId: currentUser.id,
    thumbnail: SAMPLE_VIDEOS[3].thumbnailUrl,
    videos: [SAMPLE_VIDEOS[3]],
    videosCount: 8,
    createdAt: "2025-02-05T12:00:00.000Z"
  },
  {
    id: "pl-relax",
    name: "Relax & Chill",
    description: "Calm evening listening and ambient videos",
    isPublic: true,
    userId: currentUser.id,
    thumbnail: SAMPLE_VIDEOS[5].thumbnailUrl,
    videos: [SAMPLE_VIDEOS[5], SAMPLE_VIDEOS[6]],
    videosCount: 15,
    createdAt: "2025-02-12T14:30:00.000Z"
  },
  {
    id: "pl-travel",
    name: "Travel Inspo",
    description: "Worldwide city strolls and scenic drives",
    isPublic: false,
    userId: currentUser.id,
    thumbnail: SAMPLE_VIDEOS[4].thumbnailUrl,
    videos: [SAMPLE_VIDEOS[4], SAMPLE_VIDEOS[9]],
    videosCount: 6,
    createdAt: "2025-02-18T09:15:00.000Z"
  }
];

let watchHistory: any[] = [
  {
    id: "hist-1",
    videoId: SAMPLE_VIDEOS[0].id,
    video: SAMPLE_VIDEOS[0],
    lastPositionSec: 138,
    completed: false,
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: "hist-2",
    videoId: SAMPLE_VIDEOS[1].id,
    video: SAMPLE_VIDEOS[1],
    lastPositionSec: 420,
    completed: true,
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    id: "hist-3",
    videoId: SAMPLE_VIDEOS[3].id,
    video: SAMPLE_VIDEOS[3],
    lastPositionSec: 510,
    completed: true,
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: "hist-4",
    videoId: SAMPLE_VIDEOS[9].id,
    video: SAMPLE_VIDEOS[9],
    lastPositionSec: 320,
    completed: false,
    updatedAt: new Date(Date.now() - 48 * 3600000).toISOString()
  }
];

let userFavorites = new Set<string>([SAMPLE_VIDEOS[0].id, SAMPLE_VIDEOS[1].id]);
let userLikedVideos = new Set<string>([SAMPLE_VIDEOS[0].id]);
let userDislikedVideos = new Set<string>();
let userSubscriptions = new Set<string>([creators[0].id, creators[1].id]);

let reports: any[] = [
  {
    id: "rep-1",
    videoId: "vid-late-night-chat",
    videoTitle: "Late Night Chat: Unwinding after midnight",
    videoThumbnail: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80",
    reporterName: "Anonymous User #4812",
    reason: "Inappropriate content",
    details: "Age restriction verification suggested for late night segment.",
    status: "PENDING",
    moderatorNote: "",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: "rep-2",
    videoId: "vid-city-dreams",
    videoTitle: "City Dreams: Tokyo Neon Rain Reflections",
    videoThumbnail: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80",
    reporterName: "AudioAgency Rights",
    reason: "Copyright issue",
    details: "Claims background audio matches commercial track ID #891.",
    status: "PENDING",
    moderatorNote: "",
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
  },
  {
    id: "rep-3",
    videoId: "vid-weekend-getaway",
    videoTitle: "Weekend Coastal Roadtrip & Sunset Cliffs",
    videoThumbnail: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&auto=format&fit=crop&q=80",
    reporterName: "UserMod99",
    reason: "Spam",
    details: "Repetitive tags included in description.",
    status: "RESOLVED",
    moderatorNote: "Tags reviewed and cleaned. Resolved.",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

let moderationAuditLog: any[] = [
  {
    id: "mod-1",
    moderator: "Alex Grey",
    targetType: "VIDEO",
    targetId: "vid-weekend-getaway",
    action: "RESOLVE_REPORT",
    reason: "Tags cleared and verified compliant",
    timestamp: new Date(Date.now() - 20 * 3600000).toISOString()
  }
];

let peerTubeInstances: any[] = [
  {
    id: "pt-1",
    name: "PeerTube Official Main",
    url: "https://peertube.tv",
    apiUrl: "https://peertube.tv/api/v1",
    isEnabled: true,
    allowedLicenses: ["Attribution", "CC0", "Open Source", "Free Art"],
    lastSync: new Date(Date.now() - 4 * 3600000).toISOString(),
    videosImportedCount: 142
  },
  {
    id: "pt-2",
    name: "FramaTube Network",
    url: "https://framatube.org",
    apiUrl: "https://framatube.org/api/v1",
    isEnabled: true,
    allowedLicenses: ["Creative Commons", "Open"],
    lastSync: new Date(Date.now() - 12 * 3600000).toISOString(),
    videosImportedCount: 88
  },
  {
    id: "pt-3",
    name: "Kockatoo Tube Media",
    url: "https://tube.kockatoo.org",
    apiUrl: "https://tube.kockatoo.org/api/v1",
    isEnabled: false,
    allowedLicenses: ["All Approved"],
    lastSync: "2025-02-01T10:00:00.000Z",
    videosImportedCount: 24
  }
];

// -------------------------------------------------------------
// REST API ENDPOINTS
// -------------------------------------------------------------

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", service: "NexaPlay Streaming API", version: "2.4.0", timestamp: new Date().toISOString() });
});

// Authentication & Profile Endpoints
app.get("/api/auth/me", (req: Request, res: Response) => {
  res.json({
    user: currentUser,
    favoritesCount: userFavorites.size,
    subscriptionsCount: userSubscriptions.size,
    playlistsCount: playlists.length,
    watchHistoryCount: watchHistory.length,
  });
});

app.post("/api/auth/role", (req: Request, res: Response) => {
  const { role } = req.body;
  if (role && ["VISITOR", "USER", "CREATOR", "MODERATOR", "ADMIN"].includes(role)) {
    currentUser.role = role;
    res.json({ success: true, user: currentUser });
  } else {
    res.status(400).json({ error: "Invalid role specified" });
  }
});

app.post("/api/auth/age-verify", (req: Request, res: Response) => {
  currentUser.isAgeVerified = true;
  res.json({ success: true, isAgeVerified: true });
});

// Videos Catalog & Feeds
app.get("/api/videos", (req: Request, res: Response) => {
  const {
    category,
    tag,
    search,
    sort = "relevance",
    duration,
    hdOnly,
    openLicenseOnly,
    page = "1",
    limit = "24"
  } = req.query;

  let result = [...videos];

  if (category && category !== "All" && category !== "trending") {
    result = result.filter(v => v.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (tag) {
    const t = (tag as string).toLowerCase();
    result = result.filter(v => v.tags.some(item => item.toLowerCase().includes(t)));
  }

  if (search) {
    const q = (search as string).toLowerCase();
    result = result.filter(v =>
      v.title.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      v.creator.channelName.toLowerCase().includes(q) ||
      v.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  if (duration === "short") {
    result = result.filter(v => v.duration < 300); // < 5 mins
  } else if (duration === "medium") {
    result = result.filter(v => v.duration >= 300 && v.duration <= 1200); // 5 - 20 mins
  } else if (duration === "long") {
    result = result.filter(v => v.duration > 1200); // > 20 mins
  }

  if (hdOnly === "true") {
    result = result.filter(v => v.isHD);
  }

  if (openLicenseOnly === "true") {
    result = result.filter(v => v.sourceProvider === "PeerTube" || v.license.toLowerCase().includes("creative commons") || v.license.toLowerCase().includes("open"));
  }

  // Sorting logic
  if (sort === "newest") {
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } else if (sort === "most_viewed") {
    result.sort((a, b) => b.viewsCount - a.viewsCount);
  } else if (sort === "highest_rated") {
    result.sort((a, b) => b.ratingScore - a.ratingScore);
  } else if (sort === "longest") {
    result.sort((a, b) => b.duration - a.duration);
  } else if (sort === "shortest") {
    result.sort((a, b) => a.duration - b.duration);
  } else {
    // Relevance / Trending score
    result.sort((a, b) => (b.viewsCount * 0.4 + b.likesCount * 2) - (a.viewsCount * 0.4 + a.likesCount * 2));
  }

  const pageNum = parseInt(page as string) || 1;
  const limitNum = parseInt(limit as string) || 24;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = result.slice(startIndex, startIndex + limitNum);

  // Attach user interaction states
  const mapped = paginated.map(v => ({
    ...v,
    userLiked: userLikedVideos.has(v.id),
    userDisliked: userDislikedVideos.has(v.id),
    userFavorited: userFavorites.has(v.id)
  }));

  res.json({
    videos: mapped,
    total: result.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(result.length / limitNum) || 1
  });
});

// Trending, Latest, Popular, Recommended
app.get("/api/videos/trending", (req: Request, res: Response) => {
  const trending = [...videos].sort((a, b) => (b.likesCount * 1.5 + b.viewsCount * 0.1) - (a.likesCount * 1.5 + a.viewsCount * 0.1)).slice(0, 10);
  res.json(trending.map(v => ({
    ...v,
    userLiked: userLikedVideos.has(v.id),
    userFavorited: userFavorites.has(v.id)
  })));
});

app.get("/api/videos/latest", (req: Request, res: Response) => {
  const latest = [...videos].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10);
  res.json(latest);
});

app.get("/api/videos/popular", (req: Request, res: Response) => {
  const popular = [...videos].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 10);
  res.json(popular);
});

app.get("/api/videos/recommended", (req: Request, res: Response) => {
  // Recommendation Engine: Tag similarity 30%, Category similarity 25%, Popularity 20%, Watch history 15%, Recency 10%
  const recommended = [...videos].sort((a, b) => (b.ratingScore * 1000 + b.viewsCount * 0.05) - (a.ratingScore * 1000 + a.viewsCount * 0.05)).slice(0, 12);
  res.json(recommended);
});

// Single Video
app.get("/api/videos/:id", (req: Request, res: Response) => {
  const video = videos.find(v => v.id === req.params.id || v.slug === req.params.id);
  if (!video) {
    return res.status(404).json({ error: "Video not found" });
  }

  // Increment view
  video.viewsCount += 1;

  // Find related videos
  const related = videos
    .filter(v => v.id !== video.id && (v.category === video.category || v.tags.some(t => video.tags.includes(t))))
    .slice(0, 10);

  res.json({
    video: {
      ...video,
      userLiked: userLikedVideos.has(video.id),
      userDisliked: userDislikedVideos.has(video.id),
      userFavorited: userFavorites.has(video.id),
      creatorSubscribed: userSubscriptions.has(video.creator.id)
    },
    relatedVideos: related
  });
});

// Video Interactions
app.post("/api/videos/:id/like", (req: Request, res: Response) => {
  const { isLike } = req.body; // true = like, false = dislike
  const video = videos.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: "Video not found" });

  if (isLike) {
    if (userLikedVideos.has(video.id)) {
      userLikedVideos.delete(video.id);
      video.likesCount = Math.max(0, video.likesCount - 1);
    } else {
      userLikedVideos.add(video.id);
      video.likesCount += 1;
      if (userDislikedVideos.has(video.id)) {
        userDislikedVideos.delete(video.id);
        video.dislikesCount = Math.max(0, video.dislikesCount - 1);
      }
    }
  } else {
    if (userDislikedVideos.has(video.id)) {
      userDislikedVideos.delete(video.id);
      video.dislikesCount = Math.max(0, video.dislikesCount - 1);
    } else {
      userDislikedVideos.add(video.id);
      video.dislikesCount += 1;
      if (userLikedVideos.has(video.id)) {
        userLikedVideos.delete(video.id);
        video.likesCount = Math.max(0, video.likesCount - 1);
      }
    }
  }

  res.json({
    likesCount: video.likesCount,
    dislikesCount: video.dislikesCount,
    userLiked: userLikedVideos.has(video.id),
    userDisliked: userDislikedVideos.has(video.id)
  });
});

app.post("/api/videos/:id/favorite", (req: Request, res: Response) => {
  const video = videos.find(v => v.id === req.params.id);
  if (!video) return res.status(404).json({ error: "Video not found" });

  let favorited = false;
  if (userFavorites.has(video.id)) {
    userFavorites.delete(video.id);
  } else {
    userFavorites.add(video.id);
    favorited = true;
  }

  res.json({ favorited, count: userFavorites.size });
});

app.post("/api/creators/:id/subscribe", (req: Request, res: Response) => {
  const creator = creators.find(c => c.id === req.params.id);
  if (!creator) return res.status(404).json({ error: "Creator not found" });

  let subscribed = false;
  if (userSubscriptions.has(creator.id)) {
    userSubscriptions.delete(creator.id);
    creator.subscriberCount = Math.max(0, creator.subscriberCount - 1);
  } else {
    userSubscriptions.add(creator.id);
    creator.subscriberCount += 1;
    subscribed = true;
  }

  res.json({ subscribed, subscriberCount: creator.subscriberCount });
});

// Watch History (supports both /api/history and /api/user/history)
const getHistoryHandler = (req: Request, res: Response) => {
  res.json(watchHistory);
};

const postHistoryHandler = (req: Request, res: Response) => {
  const { videoId, lastPositionSec, progressSeconds, completed } = req.body;
  const video = videos.find(v => v.id === videoId);
  if (!video) return res.status(404).json({ error: "Video not found" });

  const position = lastPositionSec !== undefined ? Number(lastPositionSec) : (progressSeconds !== undefined ? Number(progressSeconds) : 0);
  const isDone = completed !== undefined ? !!completed : (video.duration > 0 ? (position / video.duration) >= 0.9 : false);

  const existingIdx = watchHistory.findIndex(h => h.videoId === videoId);
  const updatedItem = {
    id: existingIdx >= 0 ? watchHistory[existingIdx].id : `hist-${Date.now()}`,
    videoId,
    video,
    lastPositionSec: position,
    progressSeconds: position,
    completed: isDone,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    watchHistory.splice(existingIdx, 1);
  }
  watchHistory.unshift(updatedItem);

  res.json({ success: true, item: updatedItem, history: watchHistory });
};

const deleteHistoryItemHandler = (req: Request, res: Response) => {
  watchHistory = watchHistory.filter(h => h.videoId !== req.params.videoId);
  res.json({ success: true, history: watchHistory });
};

const clearHistoryHandler = (req: Request, res: Response) => {
  watchHistory = [];
  res.json({ success: true });
};

app.get("/api/history", getHistoryHandler);
app.get("/api/user/history", getHistoryHandler);
app.post("/api/history", postHistoryHandler);
app.post("/api/user/history", postHistoryHandler);
app.delete("/api/history/:videoId", deleteHistoryItemHandler);
app.delete("/api/user/history/:videoId", deleteHistoryItemHandler);
app.delete("/api/history", clearHistoryHandler);
app.delete("/api/user/history", clearHistoryHandler);

// User Favorites & Subscriptions
app.get("/api/user/favorites", (req: Request, res: Response) => {
  const favVideos = videos.filter(v => userFavorites.has(v.id));
  res.json(favVideos);
});

app.get("/api/user/subscriptions", (req: Request, res: Response) => {
  const subbedCreators = creators.filter(c => userSubscriptions.has(c.id));
  res.json(subbedCreators);
});

// Playlists
app.get("/api/playlists", (req: Request, res: Response) => {
  res.json(playlists);
});

app.post("/api/playlists", (req: Request, res: Response) => {
  const { name, description, isPublic } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const newPlaylist = {
    id: `pl-${Date.now()}`,
    name,
    description: description || "",
    isPublic: !!isPublic,
    userId: currentUser.id,
    videos: [],
    videosCount: 0,
    createdAt: new Date().toISOString()
  };

  playlists.unshift(newPlaylist);
  res.json(newPlaylist);
});

app.post("/api/playlists/:id/videos", (req: Request, res: Response) => {
  const { videoId } = req.body;
  const playlist = playlists.find(p => p.id === req.params.id);
  const video = videos.find(v => v.id === videoId);

  if (!playlist || !video) return res.status(404).json({ error: "Playlist or video not found" });

  if (!playlist.videos.some((v: any) => v.id === video.id)) {
    playlist.videos.push(video);
    playlist.videosCount = playlist.videos.length;
    if (!playlist.thumbnail) playlist.thumbnail = video.thumbnailUrl;
  }

  res.json(playlist);
});

// Comments
app.get("/api/videos/:id/comments", (req: Request, res: Response) => {
  const videoComments = comments.filter(c => c.videoId === req.params.id);
  res.json(videoComments);
});

app.post("/api/comments", (req: Request, res: Response) => {
  const { videoId, content, parentId } = req.body;
  if (!content || !videoId) return res.status(400).json({ error: "Content and videoId required" });

  const newComment = {
    id: `c-${Date.now()}`,
    videoId,
    userId: currentUser.id,
    userName: currentUser.name || currentUser.username,
    userAvatar: currentUser.avatar,
    content,
    likesCount: 0,
    userLiked: false,
    createdAt: new Date().toISOString(),
    replies: []
  };

  if (parentId) {
    const parent = comments.find(c => c.id === parentId);
    if (parent) {
      if (!parent.replies) parent.replies = [];
      parent.replies.push(newComment);
      return res.json(newComment);
    }
  }

  comments.unshift(newComment);
  res.json(newComment);
});

app.post("/api/comments/:id/like", (req: Request, res: Response) => {
  const comment = comments.find(c => c.id === req.params.id);
  if (!comment) return res.status(404).json({ error: "Comment not found" });

  comment.userLiked = !comment.userLiked;
  comment.likesCount += comment.userLiked ? 1 : -1;
  res.json({ likesCount: comment.likesCount, userLiked: comment.userLiked });
});

app.delete("/api/comments/:id", (req: Request, res: Response) => {
  comments = comments.filter(c => c.id !== req.params.id);
  res.json({ success: true });
});

// Categories & Tags
app.get("/api/categories", (req: Request, res: Response) => {
  res.json(categories);
});

app.post("/api/categories", (req: Request, res: Response) => {
  const { name, icon, thumbnail, description } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    icon: icon || "Folder",
    thumbnail: thumbnail || "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&auto=format&fit=crop&q=80",
    videoCount: 0,
    orderIndex: categories.length + 1,
    isVisible: true,
    description: description || ""
  };

  categories.push(newCat);
  res.json(newCat);
});

app.delete("/api/categories/:id", (req: Request, res: Response) => {
  categories = categories.filter(c => c.id !== req.params.id);
  res.json({ success: true });
});

app.get("/api/tags", (req: Request, res: Response) => {
  const tagCounts: { [tag: string]: number } = {};
  videos.forEach(v => {
    v.tags.forEach(t => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ name: tag, count }))
    .sort((a, b) => b.count - a.count);

  res.json(sortedTags);
});

// Search Suggestions (returns real-time matching video titles and tags)
app.get("/api/search/suggestions", (req: Request, res: Response) => {
  const rawQ = (req.query.q as string || "").trim();
  const q = rawQ.toLowerCase();

  if (!q) {
    return res.json({
      query: "",
      videos: [],
      tags: [],
      suggestions: []
    });
  }

  // 1. Video Title Matches (matching titles, ranked by startsWith then view count)
  const matchingVideos = videos
    .filter(v => v.title.toLowerCase().includes(q))
    .sort((a, b) => {
      const aLower = a.title.toLowerCase();
      const bLower = b.title.toLowerCase();
      const aStarts = aLower.startsWith(q) ? 1 : 0;
      const bStarts = bLower.startsWith(q) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;
      return b.viewsCount - a.viewsCount;
    })
    .slice(0, 5)
    .map(v => ({
      id: v.id,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl,
      duration: v.duration,
      channelName: v.creator ? v.creator.channelName : "Creator",
      category: v.category,
      viewsCount: v.viewsCount,
      isHD: v.isHD,
      slug: v.slug
    }));

  // 2. Tag Matches (matching tags, ranked by startsWith then tag frequency)
  const tagCounts: { [tag: string]: number } = {};
  videos.forEach(v => {
    if (Array.isArray(v.tags)) {
      v.tags.forEach(t => {
        const tLower = t.toLowerCase();
        if (tLower.includes(q)) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        }
      });
    }
  });

  const matchingTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      const aLower = a.tag.toLowerCase();
      const bLower = b.tag.toLowerCase();
      const aStarts = aLower.startsWith(q) ? 1 : 0;
      const bStarts = bLower.startsWith(q) ? 1 : 0;
      if (aStarts !== bStarts) return bStarts - aStarts;
      return b.count - a.count;
    })
    .slice(0, 6);

  // Flat suggestions for backward compatibility
  const flatSuggestions = [
    ...matchingVideos.map(v => v.title),
    ...matchingTags.map(t => `#${t.tag}`)
  ];

  if (req.query.format === "flat") {
    return res.json(flatSuggestions.slice(0, 8));
  }

  res.json({
    query: rawQ,
    videos: matchingVideos,
    tags: matchingTags,
    suggestions: flatSuggestions.slice(0, 8)
  });
});

// PeerTube Integration & Importer
app.get("/api/peertube/instances", (req: Request, res: Response) => {
  res.json(peerTubeInstances);
});

app.post("/api/peertube/instances", (req: Request, res: Response) => {
  const { name, url, allowedLicenses } = req.body;
  if (!url) return res.status(400).json({ error: "Instance URL is required" });

  const newInstance = {
    id: `pt-${Date.now()}`,
    name: name || new URL(url).hostname,
    url,
    apiUrl: `${url.replace(/\/$/, "")}/api/v1`,
    isEnabled: true,
    allowedLicenses: allowedLicenses || ["Creative Commons", "Attribution", "CC0"],
    lastSync: new Date().toISOString(),
    videosImportedCount: 0
  };

  peerTubeInstances.push(newInstance);
  res.json(newInstance);
});

app.delete("/api/peertube/instances/:id", (req: Request, res: Response) => {
  peerTubeInstances = peerTubeInstances.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

// Remote Search on PeerTube
app.get("/api/peertube/search", async (req: Request, res: Response) => {
  const { instance = "https://peertube.tv", q = "", category, license } = req.query;

  // Realistic open-source PeerTube remote query simulator with fallback to live API fetch
  try {
    const remoteMockVideos = [
      {
        id: "pt-remote-101",
        uuid: "c79469e8-b788-4f18-bc6b-3cb83be751f3",
        name: "Blender Studio: Sprite Fright Open Movie",
        description: "Open source animated horror-comedy film produced by the Blender Animation Studio.",
        duration: 624,
        views: 890400,
        likes: 62000,
        thumbnailUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80",
        embedUrl: "https://peertube.tv/videos/embed/c79469e8-b788-4f18-bc6b-3cb83be751f3",
        playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        channelName: "Blender Open Movies",
        publishedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        category: "Entertainment",
        tags: ["animation", "blender", "open-source", "creative-commons"],
        license: "Creative Commons Attribution 4.0",
        sourceInstance: instance as string,
        isImported: videos.some(v => v.title.includes("Sprite Fright")),
      },
      {
        id: "pt-remote-102",
        uuid: "f29402e1-45a2-4a7b-8bf1-29ef82b678c1",
        name: "Cosmos Laundromat - First Cycle 4K",
        description: "Award-winning open source short animation exploring absurdity on a desolate French island.",
        duration: 720,
        views: 1240000,
        likes: 98000,
        thumbnailUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
        embedUrl: "https://peertube.tv/videos/embed/f29402e1-45a2-4a7b-8bf1-29ef82b678c1",
        playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        channelName: "Ton Roosendaal",
        publishedAt: new Date(Date.now() - 10 * 86400000).toISOString(),
        category: "Trending",
        tags: ["4k", "surreal", "animation", "peertube"],
        license: "Creative Commons BY-SA",
        sourceInstance: instance as string,
        isImported: false,
      },
      {
        id: "pt-remote-103",
        uuid: "8b512e09-9b4e-4e4b-91cc-7e5d0fbb38a1",
        name: "Free Music Archive: Deep Ambient Flow",
        description: "Licensed ambient soundscapes for relaxation, coding, and creative flow.",
        duration: 1800,
        views: 450000,
        likes: 31000,
        thumbnailUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80",
        embedUrl: "https://peertube.tv/videos/embed/8b512e09-9b4e-4e4b-91cc-7e5d0fbb38a1",
        playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        channelName: "FMA Sound Collective",
        publishedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        category: "Lifestyle",
        tags: ["ambient", "meditation", "creative-commons", "music"],
        license: "CC0 Public Domain",
        sourceInstance: instance as string,
        isImported: false,
      }
    ];

    let filtered = remoteMockVideos;
    if (q) {
      filtered = filtered.filter(v => v.name.toLowerCase().includes((q as string).toLowerCase()) || v.tags.some(t => t.toLowerCase().includes((q as string).toLowerCase())));
    }
    if (category && category !== "All") {
      filtered = filtered.filter(v => v.category.toLowerCase() === (category as string).toLowerCase());
    }

    res.json({
      instance,
      status: "connected",
      total: filtered.length,
      videos: filtered
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to connect to PeerTube instance", details: err.message });
  }
});

// Import Remote Video to Local Database
app.post("/api/admin/import", (req: Request, res: Response) => {
  const { videoData } = req.body;
  if (!videoData || !videoData.name) {
    return res.status(400).json({ error: "Valid video data required" });
  }

  // Create local video record
  const newVideo = {
    id: `vid-pt-${Date.now()}`,
    title: videoData.name,
    slug: videoData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    description: videoData.description || `Imported from ${videoData.sourceInstance} under ${videoData.license}`,
    duration: videoData.duration || 600,
    thumbnailUrl: videoData.thumbnailUrl || "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&auto=format&fit=crop&q=80",
    playbackUrl: videoData.playbackUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: videoData.views || 1000,
    likesCount: videoData.likes || 120,
    dislikesCount: 5,
    ratingScore: 99.0,
    isAgeRestricted: false,
    status: "READY",
    visibility: "PUBLIC",
    license: videoData.license || "Creative Commons",
    sourceProvider: "PeerTube",
    sourceUrl: `${videoData.sourceInstance}/videos/watch/${videoData.uuid || videoData.id}`,
    embedUrl: videoData.embedUrl,
    creator: {
      id: `crt-pt-${Date.now()}`,
      channelName: videoData.channelName || "PeerTube Creator",
      handle: `@${(videoData.channelName || "peertube").toLowerCase().replace(/\s+/g, "")}`,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      isVerified: true,
      subscriberCount: 45000,
      totalViews: videoData.views || 100000
    },
    category: videoData.category || "Entertainment",
    tags: videoData.tags || ["peertube", "imported"],
    createdAt: new Date().toISOString(),
  };

  videos.unshift(newVideo);

  // Update instance import count
  const instance = peerTubeInstances.find(p => p.url === videoData.sourceInstance);
  if (instance) {
    instance.videosImportedCount = (instance.videosImportedCount || 0) + 1;
    instance.lastSync = new Date().toISOString();
  }

  res.json({ success: true, video: newVideo });
});

// Creator Upload System
app.post("/api/creator/upload", (req: Request, res: Response) => {
  const { title, description, category, tags, visibility, isAgeRestricted, license, duration, thumbnailUrl } = req.body;

  if (!title) return res.status(400).json({ error: "Title is required" });

  const newVideo = {
    id: `vid-up-${Date.now()}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    description: description || "User uploaded video via NexaPlay Studio.",
    duration: duration || 480,
    thumbnailUrl: thumbnailUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80",
    playbackUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    isHD: true,
    resolution: "1080p",
    viewsCount: 1,
    likesCount: 0,
    dislikesCount: 0,
    ratingScore: 100.0,
    isAgeRestricted: !!isAgeRestricted,
    status: "READY",
    visibility: visibility || "PUBLIC",
    license: license || "Standard NexaPlay License",
    sourceProvider: "NexaPlay",
    creator: creators[0],
    category: category || "Amateur",
    tags: Array.isArray(tags) ? tags : ["new", "creator"],
    createdAt: new Date().toISOString(),
  };

  videos.unshift(newVideo);
  res.json({ success: true, video: newVideo });
});

// Moderation & Reports
app.post("/api/reports", (req: Request, res: Response) => {
  const { videoId, reason, details } = req.body;
  const video = videos.find(v => v.id === videoId);
  if (!video) return res.status(404).json({ error: "Video not found" });

  const report = {
    id: `rep-${Date.now()}`,
    videoId,
    videoTitle: video.title,
    videoThumbnail: video.thumbnailUrl,
    reporterName: currentUser.name || "Anonymous User",
    reason: reason || "Inappropriate Content",
    details: details || "",
    status: "PENDING",
    createdAt: new Date().toISOString()
  };

  reports.unshift(report);
  res.json({ success: true, report });
});

app.get("/api/admin/reports", (req: Request, res: Response) => {
  res.json(reports);
});

app.post("/api/admin/moderation/action", (req: Request, res: Response) => {
  const { reportId, action, moderatorNote } = req.body;
  const report = reports.find(r => r.id === reportId);
  if (!report) return res.status(404).json({ error: "Report not found" });

  report.status = action === "DISMISS" ? "DISMISSED" : "RESOLVED";
  report.moderatorNote = moderatorNote;

  if (action === "REMOVE_VIDEO") {
    videos = videos.filter(v => v.id !== report.videoId);
  } else if (action === "AGE_RESTRICT") {
    const video = videos.find(v => v.id === report.videoId);
    if (video) video.isAgeRestricted = true;
  }

  moderationAuditLog.unshift({
    id: `mod-${Date.now()}`,
    moderator: currentUser.name,
    targetType: "VIDEO",
    targetId: report.videoId,
    action,
    reason: moderatorNote || "Moderator review",
    timestamp: new Date().toISOString()
  });

  res.json({ success: true, report, auditLog: moderationAuditLog });
});

app.get("/api/admin/moderation/audit-log", (req: Request, res: Response) => {
  res.json(moderationAuditLog);
});

// Admin Dashboard Metrics
app.get("/api/admin/stats", (req: Request, res: Response) => {
  const totalViews = videos.reduce((acc, v) => acc + v.viewsCount, 0);
  const pendingReports = reports.filter(r => r.status === "PENDING").length;

  res.json({
    totalUsers: 12430,
    totalVideos: videos.length,
    totalViews,
    videosToday: 14,
    newUsersToday: 68,
    pendingReports,
    storageUsageGB: 412.8,
    viewsHistory: [
      { date: "Apr 1", views: 185000 },
      { date: "Apr 7", views: 240000 },
      { date: "Apr 14", views: 195000 },
      { date: "Apr 21", views: 310000 },
      { date: "Apr 28", views: 290000 },
    ],
    recentReports: reports.slice(0, 5),
    topCategories: [
      { name: "Amateur", percentage: 28 },
      { name: "Couple", percentage: 18 },
      { name: "Solo", percentage: 15 },
      { name: "Mature", percentage: 12 },
      { name: "Fetish", percentage: 8 }
    ]
  });
});

// Creator Analytics
app.get("/api/creator/analytics", (req: Request, res: Response) => {
  res.json({
    totalViews: 18400000,
    watchTimeHours: 92400,
    totalLikes: 245000,
    subscriberCount: 245000,
    commentsCount: 14200,
    viewsHistory: [
      { date: "Mon", views: 42000 },
      { date: "Tue", views: 58000 },
      { date: "Wed", views: 51000 },
      { date: "Thu", views: 67000 },
      { date: "Fri", views: 82000 },
      { date: "Sat", views: 98000 },
      { date: "Sun", views: 91000 },
    ],
    trafficSources: [
      { source: "Homepage & Recommended", percentage: 54 },
      { source: "Search Queries", percentage: 22 },
      { source: "Category Browsing", percentage: 14 },
      { source: "External / PeerTube", percentage: 10 }
    ],
    deviceBreakdown: [
      { device: "Mobile (iOS & Android)", percentage: 68 },
      { device: "Desktop Web", percentage: 24 },
      { device: "Tablet", percentage: 8 }
    ],
    topVideos: videos.slice(0, 4).map(v => ({ id: v.id, title: v.title, views: v.viewsCount, likes: v.likesCount }))
  });
});

// Site Settings
app.get("/api/site-settings", (req: Request, res: Response) => {
  res.json(siteSettings);
});

app.put("/api/site-settings", (req: Request, res: Response) => {
  siteSettings = { ...siteSettings, ...req.body };
  res.json(siteSettings);
});

// -------------------------------------------------------------
// VITE MIDDLEWARE & STATIC SERVING
// -------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NexaPlay Video Streaming Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
