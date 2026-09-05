import React, { useState, useEffect } from "react";
import { User, Video, Playlist, Creator } from "../types";
import { VideoCard } from "./VideoCard";
import { formatTimeAgo, formatDuration } from "../utils/formatters";
import {
  Clock,
  Bookmark,
  ListVideo,
  Users,
  Trash2,
  Play,
  Settings,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

interface UserDashboardProps {
  currentUser: User;
  initialTab?: string;
  onSelectVideo: (video: Video) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  initialTab = "history",
  onSelectVideo,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [history, setHistory] = useState<any[]>([]);
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
      if (activeTab === "history") {
        const res = await fetch("/api/user/history");
        const data = await res.json();
        if (Array.isArray(data)) setHistory(data);
      } else if (activeTab === "favorites") {
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

  const handleClearHistory = async () => {
    if (!confirm("Clear your entire watch history?")) return;
    try {
      await fetch("/api/user/history", { method: "DELETE" });
      setHistory([]);
    } catch {
      // ignore
    }
  };

  const handleRemoveHistoryItem = async (videoId: string) => {
    try {
      await fetch(`/api/user/history/${videoId}`, { method: "DELETE" });
      setHistory(history.filter((item) => item.video.id !== videoId));
    } catch {
      // ignore
    }
  };

  return (
    <div id="user-dashboard-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Banner / User Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#1c1c1c] border border-zinc-800">
        <div className="flex items-center gap-4">
          <img
            src={
              currentUser.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            }
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-rose-500"
            referrerPolicy="no-referrer"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-zinc-800 text-rose-400 font-mono">
                {currentUser.role}
              </span>
            </h1>
            <p className="text-xs text-zinc-400">{currentUser.email}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: "history", label: "History", icon: Clock },
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeTab === tab.id
                    ? "bg-rose-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. History Tab */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-500" />
              <span>Watch History</span>
            </h2>
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All History</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-12 text-center text-zinc-400 text-xs">Loading history...</div>
          ) : history.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#1a1a1a] border border-zinc-800 text-center space-y-2">
              <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-sm font-bold text-white">No watch history yet</p>
              <p className="text-xs text-zinc-400">Videos you watch will appear here with your playback progress.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => {
                const percent = Math.min(
                  100,
                  Math.round((item.progressSeconds / (item.video.duration || 1)) * 100)
                );
                return (
                  <div
                    key={item.id}
                    className="group flex flex-col sm:flex-row gap-4 p-3 rounded-xl bg-[#1c1c1c] border border-zinc-800/80 hover:border-zinc-700 transition-all items-start sm:items-center justify-between"
                  >
                    <div
                      className="flex gap-3 items-center flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSelectVideo(item.video)}
                    >
                      <div className="relative w-36 h-20 rounded-lg overflow-hidden bg-zinc-900 flex-shrink-0">
                        <img
                          src={item.video.thumbnailUrl}
                          alt={item.video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[10px] text-zinc-200">
                          {formatDuration(item.video.duration)}
                        </div>
                        {/* Playback progress bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700">
                          <div className="h-full bg-rose-600" style={{ width: `${percent}%` }} />
                        </div>
                      </div>

                      <div className="min-w-0 space-y-1">
                        <h4 className="text-sm font-semibold text-white truncate group-hover:text-rose-400">
                          {item.video.title}
                        </h4>
                        <p className="text-xs text-zinc-400">{item.video.creator.channelName}</p>
                        <div className="text-[11px] text-zinc-500 flex items-center gap-2">
                          <span>Watched {formatTimeAgo(item.watchedAt)}</span>
                          <span>•</span>
                          <span className="text-rose-400 font-mono">{percent}% completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => onSelectVideo(item.video)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveHistoryItem(item.video.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800"
                        title="Remove from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                <VideoCard key={v.id} video={v} onSelectVideo={onSelectVideo} />
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
                    {creator.subscribersCount.toLocaleString()} subscribers
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
