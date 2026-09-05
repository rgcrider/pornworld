import React from "react";
import { Video, Category } from "../types";
import { VideoCard } from "./VideoCard";
import { CategoryMenu } from "./CategoryMenu";
import { AdBanner } from "./AdBanner";
import {
  Flame,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  Play,
  ArrowRight,
  ShieldCheck,
  Video as VideoIcon
} from "lucide-react";

interface HomePageProps {
  videos: Video[];
  categories: Category[];
  onSelectVideo: (video: Video) => void;
  onSelectCategory: (categoryName: string) => void;
  onSaveToPlaylist: (video: Video) => void;
  onShare: (video: Video) => void;
  onNavigate: (view: string, param?: string) => void;
  selectedCategory: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  videos,
  categories,
  onSelectVideo,
  onSelectCategory,
  onSaveToPlaylist,
  onShare,
  onNavigate,
  selectedCategory,
}) => {
  const trendingVideos = [...videos].sort((a, b) => b.viewsCount - a.viewsCount).slice(0, 4);
  const recentVideos = [...videos].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 4);
  const recommendedVideos = [...videos].sort((a, b) => b.ratingScore - a.ratingScore).slice(0, 4);

  return (
    <div id="homepage-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-10">
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-rose-950/70 via-[#181818] to-zinc-950 border border-zinc-800/90 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-rose-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-600/20 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open & Federated Video Streaming Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Watch. Explore. <span className="text-rose-500">Enjoy.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
            Stream high-definition videos from verified creators, open-source repositories, and federated PeerTube instances with seamless adaptive HLS streaming.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate("trending")}
              className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/50 flex items-center gap-2 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Explore Videos</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("creator-dashboard")}
              className="px-5 py-2.5 rounded-full bg-zinc-800/90 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm border border-zinc-700 transition-colors flex items-center gap-2"
            >
              <VideoIcon className="w-4 h-4 text-rose-400" />
              <span>Creator Studio</span>
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-0.5">
            <div className="font-bold text-white text-base">4K 60FPS</div>
            <div className="text-zinc-400">Multi-bitrate HLS</div>
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-white text-base">PeerTube</div>
            <div className="text-zinc-400">Federation Bridge</div>
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-white text-base">Verified 18+</div>
            <div className="text-zinc-400">Safety & 2257 Notice</div>
          </div>
          <div className="space-y-0.5">
            <div className="font-bold text-white text-base">Edge Cloud</div>
            <div className="text-zinc-400">Cloudflare & S3 Storage</div>
          </div>
        </div>
      </div>

      <AdBanner placement="header" />

      <div className="space-y-2">
        <CategoryMenu
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
          variant="chips"
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Trending Videos</h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("trending")}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {trendingVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelectVideo={onSelectVideo}
              onSaveToPlaylist={onSaveToPlaylist}
              onShare={onShare}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Most Viewed</h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("search", "sort=most_viewed")}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {recentVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelectVideo={onSelectVideo}
              onSaveToPlaylist={onSaveToPlaylist}
              onShare={onShare}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Popular Categories</h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("categories")}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <CategoryMenu
          categories={categories.slice(0, 8)}
          onSelectCategory={(catName) => onNavigate("search", `category=${catName}`)}
          variant="cards"
        />
      </section>

      <AdBanner placement="grid" />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">Recommended For You</h2>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("search", "sort=highest_rated")}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {recommendedVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              onSelectVideo={onSelectVideo}
              onSaveToPlaylist={onSaveToPlaylist}
              onShare={onShare}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
