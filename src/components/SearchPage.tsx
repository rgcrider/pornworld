import React, { useState, useEffect } from "react";
import { Video, Category } from "../types";
import { VideoCard } from "./VideoCard";
import { Filter, RotateCcw, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface SearchPageProps {
  initialQuery?: string;
  initialCategory?: string;
  categories: Category[];
  onSelectVideo: (video: Video) => void;
  onSaveToPlaylist?: (video: Video) => void;
  onShare?: (video: Video) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  initialQuery = "",
  initialCategory = "",
  categories,
  onSelectVideo,
  onSaveToPlaylist,
  onShare,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory || "All");
  const [sortBy, setSortBy] = useState("relevance");
  const [duration, setDuration] = useState("all");
  const [hdOnly, setHdOnly] = useState(false);
  const [openLicenseOnly, setOpenLicenseOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [videos, setVideos] = useState<Video[]>([]);
  const [totalVideos, setTotalVideos] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    fetchSearchResults();
  }, [query, category, sortBy, duration, hdOnly, openLicenseOnly, page]);

  const fetchSearchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: query,
        category: category !== "All" ? category : "",
        sort: sortBy,
        duration: duration !== "all" ? duration : "",
        hdOnly: hdOnly ? "true" : "false",
        openLicenseOnly: openLicenseOnly ? "true" : "false",
        page: page.toString(),
        limit: "24",
      });

      const res = await fetch(`/api/videos?${params.toString()}`);
      const data = await res.json();
      if (data.videos) {
        setVideos(data.videos);
        setTotalVideos(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setCategory("All");
    setSortBy("relevance");
    setDuration("all");
    setHdOnly(false);
    setOpenLicenseOnly(false);
    setPage(1);
  };

  return (
    <div id="search-page-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Filter Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-6 bg-[#181818] border border-zinc-800 p-5 rounded-2xl h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Filter className="w-4 h-4 text-rose-500" />
              <span>Filters</span>
            </div>
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>

          {/* Sort By Radios */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Sort by</h4>
            <div className="space-y-1.5 text-xs text-zinc-300">
              {[
                { id: "relevance", label: "Relevance" },
                { id: "newest", label: "Newest" },
                { id: "most_viewed", label: "Most viewed" },
                { id: "highest_rated", label: "Highest rated" },
                { id: "longest", label: "Longest" },
                { id: "shortest", label: "Shortest" },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 cursor-pointer hover:text-white p-1 rounded-md hover:bg-zinc-800/60"
                >
                  <input
                    type="radio"
                    name="sortOption"
                    value={item.id}
                    checked={sortBy === item.id}
                    onChange={() => {
                      setSortBy(item.id);
                      setPage(1);
                    }}
                    className="text-rose-600 focus:ring-rose-500 accent-rose-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration Filter */}
          <div className="space-y-2.5 border-t border-zinc-800/80 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Duration</h4>
            <div className="space-y-1.5 text-xs text-zinc-300">
              {[
                { id: "all", label: "Any Duration" },
                { id: "short", label: "Short (< 5 min)" },
                { id: "medium", label: "Medium (5–20 min)" },
                { id: "long", label: "Long (> 20 min)" },
              ].map((item) => (
                <label
                  key={item.id}
                  className="flex items-center gap-2.5 cursor-pointer hover:text-white p-1 rounded-md hover:bg-zinc-800/60"
                >
                  <input
                    type="radio"
                    name="durationOption"
                    value={item.id}
                    checked={duration === item.id}
                    onChange={() => {
                      setDuration(item.id);
                      setPage(1);
                    }}
                    className="accent-rose-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="space-y-2 border-t border-zinc-800/80 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Category</h4>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Feature Checkboxes */}
          <div className="space-y-2 border-t border-zinc-800/80 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Features</h4>
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={hdOnly}
                onChange={(e) => {
                  setHdOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded accent-rose-500"
              />
              <span>HD videos only</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={openLicenseOnly}
                onChange={(e) => {
                  setOpenLicenseOnly(e.target.checked);
                  setPage(1);
                }}
                className="rounded accent-rose-500"
              />
              <span>PeerTube / Open License</span>
            </label>
          </div>
        </div>

        {/* Right Search Results */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              {query ? (
                <>
                  Search results for <span className="text-rose-400">"{query}"</span>
                </>
              ) : category !== "All" ? (
                <>
                  Category: <span className="text-rose-400">{category}</span>
                </>
              ) : (
                "Browse Video Catalog"
              )}
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              {totalVideos.toLocaleString()} results
            </span>
          </div>

          {/* Loading or Video Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-video rounded-xl bg-zinc-800/50 animate-pulse" />
              ))}
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4">
              {videos.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  onSelectVideo={onSelectVideo}
                  onSaveToPlaylist={onSaveToPlaylist}
                  onShare={onShare}
                />
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 bg-[#181818] border border-zinc-800 rounded-2xl">
              <p className="text-base text-zinc-300 font-semibold">No videos found matching your filters</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try loosening your filters or search keywords, or browse our trending recommendations.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 pt-6">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const p = i + 1;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      page === p
                        ? "bg-rose-600 text-white"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
