import React, { useState, useEffect } from "react";
import { User, Video, Playlist, Creator, WatchHistoryItem } from "../types";
import { VideoCard } from "./VideoCard";
import { formatTimeAgo, formatDuration } from "../utils/formatters";
import {
  Clock,
  Bookmark,
  ListVideo,
  Users,
  Trash2,
  Play,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  BarChart2,
  Film
} from "lucide-react";

interface UserDashboardProps {
  currentUser: User;
  initialTab?: string;
  watchHistory: WatchHistoryItem[];
  onRemoveHistoryItem: (videoId: string) => void;
  onClearHistory: () => void;
  onSelectVideo: (video: Video, resumeTime?: number) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  initialTab = "history",
  watchHistory,
  onRemoveHistoryItem,
  onClearHistory,
  onSelectVideo,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [favorites, setFavorites] = useState<Video[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [subscriptions, setSubscriptions] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    fetchUserData();
  }, [activeTab]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      if (activeTab === "favorites") {
        const res = await fetch("/api/user/favorites");
        const data = await res.json();
        if (Array.isArray(data)) setFavorites(data);
      } else if (activeTab === "playlists") {
        const res = await fetch("/api/playlists");
        const data = await res.json();
        if (Array.isArray(data)) setPlaylists(data);
      } else if (activeTab === "subscriptions") {
        const res = await fetch("/api/user/subscriptions");
        const data = await res.json();
        if (Array.isArray(data)) setSubscriptions(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistoryConfirm = () => {
    if (confirm("Clear your entire watch history?")) {
      onClearHistory();
    }
  };

  // Calculate stats from watch history
  const totalWatchedVideos = watchHistory.length;
  const inProgressVideos = watchHistory.filter((item) => !item.completed && item.lastPositionSec > 5);
  const completedVideos = watchHistory.filter((item) => item.completed);
  const totalWatchSec = watchHistory.reduce((acc, cur) => acc + (cur.lastPositionSec || 0), 0);
  const totalWatchMinutes = Math.round(totalWatchSec / 60);

  return (
    <div id="user-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Top Banner / User Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1c1c1c] border border-zinc-800 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={
              currentUser.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            }
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-rose-500 shadow-md"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/80 text-rose-400 font-semibold border border-rose-800/40">
                {currentUser.role}
              </span>
            </h1>
            <p className="text-xs text-zinc-400">{currentUser.email}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: "history", label: "Recently Watched", icon: Clock },
            { id: "favorites", label: "Favorites", icon: Bookmark },
            { id: "playlists", label: "Playlists", icon: ListVideo },
            { id: "subscriptions", label: "Subscriptions", icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  activeTab === tab.id
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950/50"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.id === "history" && watchHistory.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-950 text-rose-300 font-mono">
                    {watchHistory.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. RECENTLY WATCHED SECTION (Prompt Focus) */}
      {activeTab === "history" && (
        <section id="recently-watched-section" className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-500 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <span>Recently Watched</span>
                <span className="text-xs font-normal text-zinc-400">
                  ({watchHistory.length} {watchHistory.length === 1 ? "video" : "videos"})
                </span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Your automatically recorded video playback progress. Pick up right where you left off.
              </p>
            </div>

            {watchHistory.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistoryConfirm}
                className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/40 text-xs text-zinc-400 hover:text-rose-400 border border-zinc-800 hover:border-rose-900/50 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Cards */}
          {watchHistory.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#1c1c1c] border border-zinc-800 space-y-1">
                <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <Film className="w-3 h-3 text-rose-400" />
                  <span>Total Watched</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">{totalWatchedVideos}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c1c1c] border border-zinc-800 space-y-1">
                <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <RotateCcw className="w-3 h-3 text-amber-400" />
                  <span>In Progress</span>
                </div>
                <div className="text-lg font-bold text-amber-400 font-mono">{inProgressVideos.length}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c1c1c] border border-zinc-800 space-y-1">
                <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Completed</span>
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono">{completedVideos.length}</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#1c1c1c] border border-zinc-800 space-y-1">
                <div className="text-[11px] text-zinc-400 flex items-center gap-1">
                  <BarChart2 className="w-3 h-3 text-indigo-400" />
                  <span>Watch Time</span>
                </div>
                <div className="text-lg font-bold text-white font-mono">{totalWatchMinutes} min</div>
              </div>
            </div>
          )}

          {/* Recently Watched Videos List */}
          {watchHistory.length === 0 ? (
            <div className="p-12 rounded-2xl bg-[#1a1a1a] border border-zinc-800 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800/80 text-zinc-500 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No Recently Watched Videos</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                As you stream videos across NexaPlay, your playback progress will automatically save here so you can resume anytime.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {watchHistory.map((item) => {
                const duration = item.video.duration || 1;
                const position = item.lastPositionSec || 0;
                const percent = Math.min(100, Math.max(0, Math.round((position / duration) * 100)));

                return (
                  <div
                    key={item.id}
                    className="group flex flex-col sm:flex-row gap-4 p-3.5 rounded-xl bg-[#1c1c1c] border border-zinc-800/80 hover:border-zinc-700 transition-all items-start sm:items-center justify-between"
                  >
                    {/* Left: Thumbnail & Info */}
                    <div
                      className="flex gap-3.5 items-center flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSelectVideo(item.video, position)}
                    >
                      {/* Video Thumbnail with Progress Overlay */}
                      <div className="relative w-36 sm:w-44 h-22 sm:h-24 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0 shadow">
                        <img
                          src={item.video.thumbnailUrl}
                          alt={item.video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {/* Duration badge */}
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-semibold text-zinc-200">
                          {formatDuration(duration)}
                        </div>

                        {/* Playback progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-700/80">
                          <div
                            className={`h-full ${item.completed ? "bg-emerald-500" : "bg-rose-600"}`}
                            style={{ width: `${item.completed ? 100 : percent}%` }}
                          />
                        </div>
                      </div>

                      {/* Video Meta */}
                      <div className="min-w-0 space-y-1">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-rose-400 transition-colors">
                          {item.video.title}
                        </h4>

                        <div className="text-xs text-zinc-400 flex items-center gap-1.5 truncate">
                          <span>{item.video.creator.channelName}</span>
                          {item.video.creator.isVerified && (
                            <CheckCircle2 className="w-3 h-3 text-rose-500 flex-shrink-0" />
                          )}
                          <span>•</span>
                          <span className="text-zinc-500">{item.video.category}</span>
                        </div>

                        {/* Progress and Timestamp */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] pt-0.5">
                          {item.completed ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-800/40 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Completed</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 font-mono text-[10px] border border-rose-800/30">
                              {formatDuration(position)} / {formatDuration(duration)} ({percent}%)
                            </span>
                          )}
                          <span className="text-zinc-500">•</span>
                          <span className="text-zinc-400">Watched {formatTimeAgo(item.updatedAt)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => onSelectVideo(item.video, item.completed ? 0 : position)}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm shadow-rose-950 transition-all active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{item.completed ? "Rewatch" : "Resume"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveHistoryItem(item.video.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        title="Remove from Recently Watched"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 2. Favorites Tab */}
      {activeTab === "favorites" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-rose-500" />
            <span>Favorited Videos ({favorites.length})</span>
          </h2>

          {favorites.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#1a1a1a] border border-zinc-800 text-center space-y-2">
              <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-white">No favorites saved</p>
              <p className="text-xs text-zinc-400">Click the bookmark icon on any video to add it to your favorites.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {favorites.map((v) => (
                <VideoCard key={v.id} video={v} onSelectVideo={(video) => onSelectVideo(video, 0)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Playlists Tab */}
      {activeTab === "playlists" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ListVideo className="w-5 h-5 text-rose-500" />
            <span>Your Playlists</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="p-4 rounded-xl bg-[#1c1c1c] border border-zinc-800 space-y-3 hover:border-zinc-700 transition-all cursor-pointer"
              >
                <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 flex items-center justify-center">
                  <ListVideo className="w-10 h-10 text-rose-500/60" />
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/80 text-xs font-semibold text-zinc-200">
                    {pl.videosCount || 0} videos
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white truncate">{pl.name}</h3>
                  <p className="text-xs text-zinc-400">{pl.isPublic ? "Public Playlist" : "Private"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Subscriptions Tab */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-500" />
            <span>Subscribed Channels ({subscriptions.length})</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subscriptions.map((creator) => (
              <div
                key={creator.id}
                className="p-4 rounded-xl bg-[#1c1c1c] border border-zinc-800 flex items-center gap-3.5 hover:border-zinc-700 transition-all"
              >
                <img
                  src={creator.avatar}
                  alt={creator.channelName}
                  className="w-12 h-12 rounded-full object-cover ring-1 ring-zinc-700"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white flex items-center gap-1.5 truncate">
                    <span>{creator.channelName}</span>
                    {creator.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-rose-500" />}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {creator.subscriberCount ? creator.subscriberCount.toLocaleString() : "0"} subscribers
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
