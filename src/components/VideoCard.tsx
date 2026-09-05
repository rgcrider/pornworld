import React, { useState } from "react";
import { Video } from "../types";
import { formatDuration, formatViews, formatTimeAgo } from "../utils/formatters";
import { CheckCircle2, ShieldAlert, Sparkles, MoreVertical, BookmarkPlus, Share2 } from "lucide-react";

interface VideoCardProps {
  video: Video;
  onSelectVideo: (video: Video) => void;
  onSaveToPlaylist?: (video: Video) => void;
  onShare?: (video: Video) => void;
  compact?: boolean; // for Up Next sidebar
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelectVideo,
  onSaveToPlaylist,
  onShare,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  if (compact) {
    return (
      <div
        id={`video-card-compact-${video.id}`}
        className="group flex gap-3 p-1.5 rounded-lg hover:bg-[#222222] transition-colors cursor-pointer"
        onClick={() => onSelectVideo(video)}
      >
        <div className="relative w-40 h-24 flex-shrink-0 rounded-md overflow-hidden bg-zinc-800">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-xs text-[11px] font-medium text-zinc-200">
            {formatDuration(video.duration)}
          </span>
          {video.isHD && (
            <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-rose-600/90 text-[9px] font-bold text-white tracking-wider">
              HD
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <h4 className="text-sm font-medium text-zinc-100 line-clamp-2 leading-tight group-hover:text-rose-400 transition-colors">
              {video.title}
            </h4>
            <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
              <span>{video.creator.channelName}</span>
              {video.creator.isVerified && <CheckCircle2 className="w-3 h-3 text-rose-500" />}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span>{formatViews(video.viewsCount)}</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id={`video-card-${video.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-[#1b1b1b] border border-zinc-800/80 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40 transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      {/* Thumbnail Area */}
      <div
        className="relative aspect-video w-full overflow-hidden bg-zinc-900 cursor-pointer"
        onClick={() => onSelectVideo(video)}
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          referrerPolicy="no-referrer"
        />

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 backdrop-blur-xs text-xs font-semibold text-zinc-200 tracking-wide shadow-sm">
          {formatDuration(video.duration)}
        </div>

        {/* HD & Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          {video.isHD && (
            <span className="px-1.5 py-0.5 rounded bg-rose-600 font-extrabold text-[10px] text-white tracking-wider shadow-sm">
              HD
            </span>
          )}
          {video.isAgeRestricted && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/90 text-[10px] font-bold text-zinc-950 flex items-center gap-0.5">
              <ShieldAlert className="w-2.5 h-2.5" /> 18+
            </span>
          )}
          {video.sourceProvider === "PeerTube" && (
            <span className="px-1.5 py-0.5 rounded bg-zinc-800/90 text-[9px] font-semibold text-indigo-300 flex items-center gap-0.5 border border-indigo-500/30">
              <Sparkles className="w-2.5 h-2.5 text-indigo-400" /> PeerTube
            </span>
          )}
        </div>

        {/* Hover subtle red progress line indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800/60 overflow-hidden">
          <div
            className={`h-full bg-rose-600 transition-all duration-300 ${
              isHovered ? "w-2/5" : "w-0"
            }`}
          />
        </div>
      </div>

      {/* Video Info Area */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
        <div className="flex items-start gap-3">
          {/* Creator Avatar */}
          <div
            className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 bg-zinc-800 ring-1 ring-zinc-700/50 cursor-pointer"
            onClick={() => onSelectVideo(video)}
          >
            <img
              src={video.creator.avatar}
              alt={video.creator.channelName}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Title & Metadata */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug group-hover:text-rose-400 transition-colors cursor-pointer"
              onClick={() => onSelectVideo(video)}
              title={video.title}
            >
              {video.title}
            </h3>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="truncate hover:text-zinc-200 transition-colors cursor-pointer">
                {video.creator.channelName}
              </span>
              {video.creator.isVerified && (
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              )}
            </div>
          </div>

          {/* Quick Menu Button */}
          <div className="relative">
            <button
              id={`video-card-menu-btn-${video.id}`}
              type="button"
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              aria-label="Options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-7 z-20 w-44 rounded-lg bg-[#242424] border border-zinc-700 shadow-xl py-1 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {onSaveToPlaylist && (
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700/70 flex items-center gap-2"
                    onClick={() => {
                      setShowMenu(false);
                      onSaveToPlaylist(video);
                    }}
                  >
                    <BookmarkPlus className="w-3.5 h-3.5 text-rose-400" /> Save to Playlist
                  </button>
                )}
                {onShare && (
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-zinc-200 hover:bg-zinc-700/70 flex items-center gap-2"
                    onClick={() => {
                      setShowMenu(false);
                      onShare(video);
                    }}
                  >
                    <Share2 className="w-3.5 h-3.5 text-zinc-300" /> Share Video
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Row Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
          <div className="flex items-center gap-2">
            <span>{formatViews(video.viewsCount)}</span>
            <span>•</span>
            <span>{formatTimeAgo(video.createdAt)}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-medium text-[10px]">
              {video.category}
            </span>
            <span className="text-emerald-400 font-semibold text-[11px]">
              {Math.round(video.ratingScore)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
