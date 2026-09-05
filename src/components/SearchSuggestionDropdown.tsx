import React from "react";
import { SearchSuggestionVideo, SearchSuggestionTag } from "../types";
import { formatDuration, formatViews } from "../utils/formatters";
import {
  Film,
  Hash,
  Search,
  Clock,
  X,
  ArrowRight,
  CornerDownLeft,
  Play,
  Loader2,
  Tag as TagIcon
} from "lucide-react";

interface SearchSuggestionDropdownProps {
  searchQuery: string;
  videoMatches: SearchSuggestionVideo[];
  tagMatches: SearchSuggestionTag[];
  isLoading: boolean;
  activeIndex: number;
  recentSearches: string[];
  onSelectVideo: (video: SearchSuggestionVideo) => void;
  onSelectTag: (tag: SearchSuggestionTag) => void;
  onSelectRecent: (term: string) => void;
  onRemoveRecent: (e: React.MouseEvent, term: string) => void;
  onClearAllRecent: (e: React.MouseEvent) => void;
  onSubmitQuery: () => void;
}

export const highlightMatch = (text: string, query: string) => {
  if (!query || !query.trim()) return <>{text}</>;
  const q = query.trim().toLowerCase();
  const lower = text.toLowerCase();
  const index = lower.indexOf(q);
  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + q.length);
  const after = text.slice(index + q.length);

  return (
    <>
      {before}
      <span className="text-rose-400 font-semibold bg-rose-950/40 px-0.5 rounded underline decoration-rose-500/50 decoration-1 underline-offset-2">
        {match}
      </span>
      {after}
    </>
  );
};

export const SearchSuggestionDropdown: React.FC<SearchSuggestionDropdownProps> = ({
  searchQuery,
  videoMatches,
  tagMatches,
  isLoading,
  activeIndex,
  recentSearches,
  onSelectVideo,
  onSelectTag,
  onSelectRecent,
  onRemoveRecent,
  onClearAllRecent,
  onSubmitQuery,
}) => {
  const trimmed = searchQuery.trim();
  const hasQuery = trimmed.length > 0;
  const hasVideoMatches = videoMatches.length > 0;
  const hasTagMatches = tagMatches.length > 0;
  const hasAnyMatches = hasVideoMatches || hasTagMatches;

  // Empty query state: Recent searches
  if (!hasQuery) {
    if (recentSearches.length === 0) {
      return (
        <div
          id="search-suggestions-empty-recent"
          className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl bg-[#1a1a1a]/95 border border-zinc-800 shadow-2xl shadow-black/80 backdrop-blur-xl p-4 text-center text-xs text-zinc-400"
        >
          <div className="flex items-center justify-center gap-1.5 text-zinc-400 mb-1">
            <Search className="w-4 h-4 text-zinc-500" />
            <span className="font-medium">Search NexaPlay</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Type a title, creator, or topic tag to see instant suggestions
          </p>
        </div>
      );
    }

    return (
      <div
        id="search-suggestions-recent-searches"
        className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl bg-[#1a1a1a]/95 border border-zinc-800 shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden divide-y divide-zinc-800/80"
      >
        <div className="px-3.5 py-2.5 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            <span>Recent Searches</span>
          </div>
          <button
            id="clear-all-recent-searches"
            type="button"
            onClick={onClearAllRecent}
            className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
          >
            Clear History
          </button>
        </div>

        <div className="py-1">
          {recentSearches.map((term, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <div
                key={idx}
                id={`recent-search-item-${idx}`}
                onClick={() => onSelectRecent(term)}
                className={`px-3.5 py-2 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-rose-500/15 text-white font-medium border-l-2 border-rose-500 pl-3"
                    : "text-zinc-300 hover:bg-zinc-800/70 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{term}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => onRemoveRecent(e, term)}
                  className="p-1 text-zinc-500 hover:text-rose-400 rounded-md hover:bg-zinc-700/50 transition-colors"
                  title="Remove from history"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Active query state with results or loading
  return (
    <div
      id="search-suggestions-dropdown"
      className="absolute top-full mt-2 left-0 right-0 z-50 rounded-2xl bg-[#1a1a1a]/98 border border-zinc-700/80 shadow-2xl shadow-black/85 backdrop-blur-xl overflow-hidden divide-y divide-zinc-800/90 text-zinc-200"
    >
      {/* 1. Video Title Matches */}
      {hasVideoMatches && (
        <div>
          <div className="px-3.5 py-2 bg-zinc-900/75 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <Film className="w-3.5 h-3.5 text-rose-500" />
              <span>Video Matches</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">
              {videoMatches.length} {videoMatches.length === 1 ? "title" : "titles"}
            </span>
          </div>

          <div className="py-1">
            {videoMatches.map((video, idx) => {
              const isSelected = activeIndex === idx;
              return (
                <div
                  key={video.id}
                  id={`suggestion-video-${video.id}`}
                  onClick={() => onSelectVideo(video)}
                  className={`px-3 py-2 flex items-center gap-3 cursor-pointer transition-colors group ${
                    isSelected
                      ? "bg-rose-500/15 border-l-2 border-rose-500 pl-2.5"
                      : "hover:bg-zinc-800/70"
                  }`}
                >
                  {/* Thumbnail with duration badge */}
                  <div className="relative w-14 h-9 rounded-md overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/60 shadow-sm">
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0.5 right-0.5 bg-black/85 text-[9px] font-semibold text-zinc-300 px-1 py-0.2 rounded font-mono">
                      {formatDuration(video.duration)}
                    </div>
                  </div>

                  {/* Video Meta */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-zinc-100 line-clamp-1 group-hover:text-rose-400 transition-colors">
                      {highlightMatch(video.title, trimmed)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                      <span className="truncate text-zinc-300">{video.channelName}</span>
                      <span className="text-zinc-600">•</span>
                      <span>{formatViews(video.viewsCount)}</span>
                      {video.isHD && (
                        <>
                          <span className="text-zinc-600">•</span>
                          <span className="text-[9px] font-bold px-1 rounded bg-zinc-800 text-rose-400 border border-rose-500/20">
                            HD
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Play Action Hint */}
                  <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity pr-1 text-rose-400">
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Tag Matches */}
      {hasTagMatches && (
        <div>
          <div className="px-3.5 py-2 bg-zinc-900/75 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              <Hash className="w-3.5 h-3.5 text-rose-500" />
              <span>Tag Matches</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-medium">
              {tagMatches.length} {tagMatches.length === 1 ? "tag" : "tags"}
            </span>
          </div>

          <div className="py-1">
            {tagMatches.map((tagItem, idx) => {
              const itemIdx = videoMatches.length + idx;
              const isSelected = activeIndex === itemIdx;
              return (
                <div
                  key={tagItem.tag}
                  id={`suggestion-tag-${tagItem.tag}`}
                  onClick={() => onSelectTag(tagItem)}
                  className={`px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors group ${
                    isSelected
                      ? "bg-rose-500/15 border-l-2 border-rose-500 pl-3"
                      : "hover:bg-zinc-800/70"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                      <TagIcon className="w-3 h-3" />
                    </div>
                    <div className="text-xs font-medium text-zinc-200 group-hover:text-rose-400 transition-colors truncate">
                      #{highlightMatch(tagItem.tag, trimmed)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-medium border border-zinc-700/50">
                      {tagItem.count} {tagItem.count === 1 ? "video" : "videos"}
                    </span>
                    <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Empty State (No matches found) */}
      {!isLoading && !hasAnyMatches && (
        <div className="p-4 text-center space-y-1 bg-zinc-900/40">
          <div className="text-xs font-medium text-zinc-300">
            No video titles or tags match <span className="text-rose-400">"{trimmed}"</span>
          </div>
          <p className="text-[11px] text-zinc-500">
            Press Enter to search descriptions, transcripts, and all creators
          </p>
        </div>
      )}

      {/* 4. Loading State indicator */}
      {isLoading && (
        <div className="px-3.5 py-2 bg-zinc-900/60 flex items-center justify-center gap-2 text-xs text-zinc-400">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
          <span>Searching video catalog...</span>
        </div>
      )}

      {/* 5. Bottom Search Action Row */}
      {trimmed.length > 0 && (
        <div
          id="suggestion-submit-query-btn"
          onClick={onSubmitQuery}
          className={`px-3.5 py-2.5 bg-zinc-900/90 flex items-center justify-between cursor-pointer transition-colors group ${
            activeIndex === videoMatches.length + tagMatches.length
              ? "bg-rose-500/20 text-white font-medium border-l-2 border-rose-500 pl-3"
              : "hover:bg-zinc-800/90 text-zinc-300 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2 truncate text-xs">
            <Search className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="truncate">
              Search all videos for <strong className="text-white font-semibold">"{trimmed}"</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono shrink-0 ml-2">
            <span className="hidden sm:inline">Press</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 flex items-center gap-0.5 shadow-sm">
              <span>Enter</span>
              <CornerDownLeft className="w-2.5 h-2.5" />
            </kbd>
          </div>
        </div>
      )}
    </div>
  );
};
