import React from "react";
import { Video, Category, WatchHistoryItem } from "../types";
import { VideoCard } from "./VideoCard";
import { CategoryMenu } from "./CategoryMenu";
import { AdBanner } from "./AdBanner";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { formatDuration } from "../utils/formatters";
import {
  Flame,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  Play,
  ArrowRight,
  ShieldCheck,
  Video as VideoIcon,
  Clock,
  Radio,
  Server
} from "lucide-react";

interface HomePageProps {
  videos: Video[];
  categories: Category[];
  watchHistory?: WatchHistoryItem[];
  onSelectVideo: (video: Video, resumeTime?: number) => void;
  onSelectCategory: (categoryName: string) => void;
  onSaveToPlaylist: (video: Video) => void;
  onShare: (video: Video) => void;
  onNavigate: (view: string, param?: string) => void;
  selectedCategory: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  videos,
  categories,
  watchHistory = [],
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
    <div id="homepage-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-8">
      {/* Featured Carousel: Highlighted, High-Engagement Videos with Auto-Play */}
      <FeaturedCarousel
        videos={videos}
        onSelectVideo={onSelectVideo}
        onSaveToPlaylist={onSaveToPlaylist}
        onShare={onShare}
        onSelectCategory={onSelectCategory}
        onNavigate={onNavigate}
      />

      {/* Platform Capabilities Highlights Bar */}
      <div className="rounded-xl bg-[#141414] border border-zinc-800/80 px-4 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-600/15 text-rose-500 flex items-center justify-center shrink-0">
            <Radio className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-xs truncate">4K 60FPS Adaptive</div>
            <div className="text-[11px] text-zinc-400 truncate">Multi-bitrate HLS</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600/15 text-blue-400 flex items-center justify-center shrink-0">
            <Server className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-xs truncate">PeerTube Bridge</div>
            <div className="text-[11px] text-zinc-400 truncate">Federated Instances</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-600/15 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-xs truncate">Verified Creator IDs</div>
            <div className="text-[11px] text-zinc-400 truncate">Safety & 2257 Notice</div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-purple-600/15 text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-white text-xs truncate">Edge Cloud Cache</div>
            <div className="text-[11px] text-zinc-400 truncate">Low-latency Streaming</div>
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

      {/* Continue / Recently Watched Row */}
      {watchHistory.length > 0 && (
        <section className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[#191919] border border-zinc-800 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600/20 text-rose-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Recently Watched</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-normal">
                  {watchHistory.length}
                </span>
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("user-dashboard", "history")}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>View History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {watchHistory.slice(0, 4).map((item) => {
              const duration = item.video.duration || 1;
              const pos = item.lastPositionSec || 0;
              const percent = Math.min(100, Math.max(0, Math.round((pos / duration) * 100)));

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectVideo(item.video, item.completed ? 0 : pos)}
                  className="group relative flex flex-col rounded-xl bg-[#202020] border border-zinc-800/90 hover:border-zinc-700 overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5"
                >
                  <div className="relative aspect-video w-full bg-zinc-900 overflow-hidden">
                    <img
                      src={item.video.thumbnailUrl}
                      alt={item.video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-semibold text-zinc-200">
                      {formatDuration(duration)}
                    </div>
                    {/* Playback progress bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                      <div
                        className={`h-full ${item.completed ? "bg-emerald-500" : "bg-rose-600"}`}
                        style={{ width: `${item.completed ? 100 : percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-2.5 space-y-1">
                    <h4 className="text-xs font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                      {item.video.title}
                    </h4>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span className="truncate">{item.video.creator.channelName}</span>
                      <span className="text-rose-400 font-mono flex-shrink-0">
                        {item.completed ? "Completed" : `${formatDuration(pos)} (${percent}%)`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

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
