import React, { useState, useEffect } from "react";
import { Video, User } from "../types";
import { VideoPlayer } from "./VideoPlayer";
import { VideoCard } from "./VideoCard";
import { CommentSection } from "./CommentSection";
import { AdBanner } from "./AdBanner";
import { formatViews, formatTimeAgo } from "../utils/formatters";
import {
  ThumbsUp,
  ThumbsDown,
  Share2,
  BookmarkPlus,
  Flag,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface WatchPageProps {
  video: Video;
  currentUser: User;
  initialResumePosition?: number;
  onSelectVideo: (video: Video, resumeTime?: number) => void;
  onSaveToPlaylist: (video: Video) => void;
  onShare: (video: Video) => void;
  onReport: (video: Video) => void;
  onTagClick: (tag: string) => void;
  onProgressUpdate?: (video: Video, currentTime: number, duration: number) => void;
}

export const WatchPage: React.FC<WatchPageProps> = ({
  video,
  currentUser,
  initialResumePosition = 0,
  onSelectVideo,
  onSaveToPlaylist,
  onShare,
  onReport,
  onTagClick,
  onProgressUpdate,
}) => {
  const [likesCount, setLikesCount] = useState(video.likesCount);
  const [dislikesCount, setDislikesCount] = useState(video.dislikesCount);
  const [userInteraction, setUserInteraction] = useState<"like" | "dislike" | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(video.creator.subscribersCount);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [autoplayNext, setAutoplayNext] = useState(true);

  // Sync state when video prop changes
  useEffect(() => {
    setLikesCount(video.likesCount);
    setDislikesCount(video.dislikesCount);
    setUserInteraction(null);
    setSubscribersCount(video.creator.subscribersCount);

    // Track view in API and user watch history
    fetch(`/api/videos/${video.id}/view`, { method: "POST" }).catch(() => {});
    fetch("/api/user/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId: video.id, progressSeconds: 0 }),
    }).catch(() => {});

    // Fetch related videos
    fetch(`/api/videos/${video.id}/related`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setRelatedVideos(data);
      })
      .catch(() => {});

    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [video.id]);

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/videos/${video.id}/like`, { method: "POST" });
      const data = await res.json();
      setLikesCount(data.likesCount);
      setDislikesCount(data.dislikesCount);
      setUserInteraction(data.userLiked ? "like" : null);
    } catch {
      // ignore
    }
  };

  const handleDislike = async () => {
    try {
      const res = await fetch(`/api/videos/${video.id}/dislike`, { method: "POST" });
      const data = await res.json();
      setLikesCount(data.likesCount);
      setDislikesCount(data.dislikesCount);
      setUserInteraction(data.userDisliked ? "dislike" : null);
    } catch {
      // ignore
    }
  };

  const handleToggleSubscribe = async () => {
    try {
      const res = await fetch(`/api/creators/${video.creator.id}/subscribe`, { method: "POST" });
      const data = await res.json();
      setIsSubscribed(data.isSubscribed);
      setSubscribersCount(data.subscribersCount);
    } catch {
      // ignore
    }
  };

  const lastReportedTime = React.useRef(0);

  const handleVideoEnded = () => {
    if (onProgressUpdate) {
      onProgressUpdate(video, video.duration || 0, video.duration || 0);
    }
    if (autoplayNext && relatedVideos.length > 0) {
      onSelectVideo(relatedVideos[0]);
    }
  };

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    const roundedTime = Math.floor(currentTime);
    // Report whenever the second advances by at least 2 seconds or on start
    if (Math.abs(roundedTime - lastReportedTime.current) >= 2 || (roundedTime > 0 && lastReportedTime.current === 0)) {
      lastReportedTime.current = roundedTime;
      if (onProgressUpdate) {
        onProgressUpdate(video, currentTime, duration || video.duration || 0);
      }
    }
  };

  return (
    <div id="watch-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Player, Video Info, Channel, Description, Comments */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Video Player */}
          <VideoPlayer
            playbackUrl={video.playbackUrl}
            hlsManifestUrl={video.hlsManifestUrl}
            posterUrl={video.thumbnailUrl}
            title={video.title}
            initialTime={initialResumePosition}
            onEnded={handleVideoEnded}
            onTimeUpdate={handleTimeUpdate}
            autoplay={true}
          />

          {/* Video Title */}
          <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
            {video.title}
          </h1>

          {/* Action Row & Channel Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-zinc-800">
            {/* Creator info */}
            <div className="flex items-center gap-3">
              <img
                src={video.creator.avatar}
                alt={video.creator.channelName}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-zinc-700"
                referrerPolicy="no-referrer"
              />
              <div>
                <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                  <span>{video.creator.channelName}</span>
                  {video.creator.isVerified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
                  )}
                </div>
                <div className="text-xs text-zinc-400">
                  {subscribersCount.toLocaleString()} subscribers
                </div>
              </div>

              {/* Subscribe button */}
              <button
                type="button"
                onClick={handleToggleSubscribe}
                className={`ml-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isSubscribed
                    ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700"
                    : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50"
                }`}
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>

            {/* Interaction Buttons (Like, Dislike, Share, Save, Report) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {/* Like / Dislike group */}
              <div className="flex items-center rounded-full bg-zinc-800/90 border border-zinc-700/80 p-0.5">
                <button
                  type="button"
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-zinc-700/70 transition-colors ${
                    userInteraction === "like" ? "text-rose-500" : "text-zinc-200"
                  }`}
                  title="I like this"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{likesCount.toLocaleString()}</span>
                </button>
                <div className="h-4 w-px bg-zinc-700" />
                <button
                  type="button"
                  onClick={handleDislike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-zinc-700/70 transition-colors ${
                    userInteraction === "dislike" ? "text-rose-500" : "text-zinc-400"
                  }`}
                  title="I dislike this"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                  {dislikesCount > 0 && <span>{dislikesCount.toLocaleString()}</span>}
                </button>
              </div>

              {/* Share button */}
              <button
                type="button"
                onClick={() => onShare(video)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800/90 border border-zinc-700/80 hover:bg-zinc-700/70 text-xs font-semibold text-zinc-200 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share</span>
              </button>

              {/* Save to Playlist */}
              <button
                type="button"
                onClick={() => onSaveToPlaylist(video)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-800/90 border border-zinc-700/80 hover:bg-zinc-700/70 text-xs font-semibold text-zinc-200 transition-colors"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-rose-400" />
                <span>Save</span>
              </button>

              {/* Report button */}
              <button
                type="button"
                onClick={() => onReport(video)}
                className="p-2 rounded-full bg-zinc-800/90 border border-zinc-700/80 hover:bg-zinc-700/70 text-zinc-400 hover:text-rose-400 transition-colors"
                title="Report Video"
              >
                <Flag className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Description Box (Expandable) */}
          <div
            className="p-4 rounded-xl bg-[#1c1c1c] border border-zinc-800/90 text-xs space-y-3 cursor-pointer hover:bg-[#202020] transition-colors"
            onClick={() => setIsDescExpanded(!isDescExpanded)}
          >
            <div className="flex items-center justify-between font-semibold text-zinc-300">
              <div className="flex items-center gap-2">
                <span>{formatViews(video.viewsCount)}</span>
                <span>•</span>
                <span>{formatTimeAgo(video.createdAt)}</span>
                <span>•</span>
                <span className="text-rose-400">{video.category}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <span>{isDescExpanded ? "Show less" : "Show more"}</span>
                {isDescExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </div>
            </div>

            <p className={`text-zinc-300 leading-relaxed ${isDescExpanded ? "" : "line-clamp-2"}`}>
              {video.description}
            </p>

            {/* Tags, License & Source */}
            {isDescExpanded && (
              <div className="pt-3 border-t border-zinc-800 space-y-3">
                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {video.tags.map((tag) => (
                    <span
                      key={tag}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTagClick(tag);
                      }}
                      className="px-2.5 py-1 rounded-full bg-zinc-800 hover:bg-rose-600/30 hover:text-rose-300 text-zinc-400 text-[11px] font-medium transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* License & Source Info */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-zinc-300">License:</span>
                    <span>{video.license || "Standard License"}</span>
                  </div>
                  {video.sourceProvider && (
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-zinc-300">Source:</span>
                      <span className="text-indigo-400 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        {video.sourceProvider}
                      </span>
                    </div>
                  )}
                  {video.embedUrl && (
                    <a
                      href={video.embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Original Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Comment Section */}
          <CommentSection videoId={video.id} currentUser={currentUser} />
        </div>

        {/* Right Column: Up Next, Autoplay Toggle, Related Videos */}
        <div className="space-y-4">
          {/* Autoplay & Up Next Bar */}
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
            <h3 className="text-sm font-bold text-white">Up Next</h3>
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
              <span>Autoplay</span>
              <div
                onClick={() => setAutoplayNext(!autoplayNext)}
                className={`w-8 h-4 rounded-full transition-colors relative cursor-pointer ${
                  autoplayNext ? "bg-rose-600" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                    autoplayNext ? "left-4.5" : "left-0.5"
                  }`}
                />
              </div>
            </label>
          </div>

          {/* Related Videos List */}
          <div className="space-y-2">
            {relatedVideos.map((relVid) => (
              <VideoCard
                key={relVid.id}
                video={relVid}
                compact={true}
                onSelectVideo={onSelectVideo}
                onSaveToPlaylist={onSaveToPlaylist}
                onShare={onShare}
              />
            ))}
          </div>

          {/* Sidebar Ad Placement */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-[#181818] to-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-2">
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-zinc-500 uppercase tracking-widest">
              Promoted
            </span>
            <div className="font-semibold text-zinc-200">High-speed Edge CDN for Independent Creators</div>
            <p className="text-[11px] text-zinc-400">
              Broadcast low latency HLS streaming across 280+ edge locations worldwide.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
