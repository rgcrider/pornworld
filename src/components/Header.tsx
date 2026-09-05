import React, { useState, useEffect, useRef } from "react";
import { User, UserRole, Video, SearchSuggestionVideo, SearchSuggestionTag } from "../types";
import { SearchSuggestionDropdown } from "./SearchSuggestionDropdown";
import {
  Play,
  Search,
  Upload,
  User as UserIcon,
  Flame,
  LayoutGrid,
  Shield,
  Video as VideoIcon,
  Bookmark,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  Loader2
} from "lucide-react";

interface HeaderProps {
  currentUser: User;
  onNavigate: (view: string, param?: string) => void;
  onSearch: (query: string) => void;
  onSelectVideo?: (video: Video) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenUpload: () => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onNavigate,
  onSearch,
  onSelectVideo,
  onSwitchRole,
  onOpenUpload,
  currentView,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [videoMatches, setVideoMatches] = useState<SearchSuggestionVideo[]>([]);
  const [tagMatches, setTagMatches] = useState<SearchSuggestionTag[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("nexaplay_recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch search suggestions in real-time as the user types
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setVideoMatches([]);
      setTagMatches([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(() => {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data === "object") {
            if (Array.isArray(data)) {
              setVideoMatches([]);
              setTagMatches([]);
            } else {
              setVideoMatches(Array.isArray(data.videos) ? data.videos : []);
              setTagMatches(Array.isArray(data.tags) ? data.tags : []);
            }
          }
          setIsLoading(false);
          setActiveIndex(-1);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setIsLoading(false);
          }
        });
    }, 160);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const clickedDesktop = searchContainerRef.current?.contains(target);
      const clickedMobile = mobileSearchContainerRef.current?.contains(target);
      if (!clickedDesktop && !clickedMobile) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem("nexaplay_recent_searches", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, term: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== term);
      try {
        localStorage.setItem("nexaplay_recent_searches", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleClearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem("nexaplay_recent_searches");
    } catch {}
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = searchQuery.trim();
    if (clean) {
      addRecentSearch(clean);
      setShowSuggestions(false);
      setIsMobileMenuOpen(false);
      onSearch(clean);
    }
  };

  const handleSelectVideoMatch = async (videoItem: SearchSuggestionVideo) => {
    addRecentSearch(videoItem.title);
    setShowSuggestions(false);
    setIsMobileMenuOpen(false);

    try {
      const res = await fetch(`/api/videos/${videoItem.id}`);
      const data = await res.json();
      if (data.video && onSelectVideo) {
        onSelectVideo(data.video);
        return;
      }
    } catch {}

    window.history.replaceState(null, "", `/?v=${videoItem.id}`);
    onNavigate("watch", videoItem.id);
  };

  const handleSelectTagMatch = (tagItem: SearchSuggestionTag) => {
    addRecentSearch(`#${tagItem.tag}`);
    setSearchQuery(tagItem.tag);
    setShowSuggestions(false);
    setIsMobileMenuOpen(false);
    onSearch(tagItem.tag);
  };

  const handleSelectRecentSearch = (term: string) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    setIsMobileMenuOpen(false);
    onSearch(term);
  };

  // Keyboard navigation for dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) {
      if (e.key === "ArrowDown") {
        setShowSuggestions(true);
      }
      return;
    }

    const isQueryEmpty = searchQuery.trim().length === 0;
    const totalItems = isQueryEmpty
      ? recentSearches.length
      : videoMatches.length + tagMatches.length + 1; // +1 for "Search all videos for..." row

    if (totalItems === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= totalItems ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? totalItems - 1 : prev - 1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        e.preventDefault();
        if (isQueryEmpty) {
          if (recentSearches[activeIndex]) {
            handleSelectRecentSearch(recentSearches[activeIndex]);
          }
        } else {
          if (activeIndex < videoMatches.length) {
            handleSelectVideoMatch(videoMatches[activeIndex]);
          } else if (activeIndex < videoMatches.length + tagMatches.length) {
            const tagIdx = activeIndex - videoMatches.length;
            handleSelectTagMatch(tagMatches[tagIdx]);
          } else {
            handleSearchSubmit();
          }
        }
      } else {
        handleSearchSubmit(e);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  return (
    <header
      id="main-app-header"
      className="sticky top-0 z-40 w-full bg-[#111111]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-6 py-2.5 transition-all"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Section: Logo & Quick Links */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="md:hidden p-1.5 text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* NexaPlay Brand Logo */}
          <div
            id="brand-logo"
            className="flex items-center gap-2 cursor-pointer group select-none"
            onClick={() => onNavigate("home")}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-rose-500 flex items-center justify-center shadow-lg shadow-rose-950/50 group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 text-white fill-current translate-x-0.5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit'] flex items-center">
              Nexa<span className="text-rose-500">Play</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              id="nav-home"
              type="button"
              onClick={() => onNavigate("home")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === "home"
                  ? "text-rose-400 bg-rose-500/10 font-semibold"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              Home
            </button>
            <button
              id="nav-trending"
              type="button"
              onClick={() => onNavigate("trending")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === "trending"
                  ? "text-rose-400 bg-rose-500/10 font-semibold"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Trending
            </button>
            <button
              id="nav-categories"
              type="button"
              onClick={() => onNavigate("categories")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                currentView === "categories"
                  ? "text-rose-400 bg-rose-500/10 font-semibold"
                  : "text-zinc-300 hover:text-white hover:bg-zinc-800/60"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Categories
            </button>
          </nav>
        </div>

        {/* Center Section: Large Search Bar with Dynamic Suggestions */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl relative hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <div className="absolute left-3.5 pointer-events-none text-zinc-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="header-search-input"
              type="text"
              placeholder="Search video titles, tags, creators..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full bg-[#181818] border border-zinc-700/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 rounded-full py-2 pl-10 pr-20 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all shadow-inner hover:border-zinc-600"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {isLoading && (
                <Loader2 className="w-4 h-4 text-rose-500 animate-spin mr-1" />
              )}
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(true);
                  }}
                  className="p-1 text-zinc-500 hover:text-zinc-200 rounded-full hover:bg-zinc-800 transition-colors"
                  title="Clear search query"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                id="header-search-btn"
                type="submit"
                className="p-1.5 text-zinc-400 hover:text-white transition-colors rounded-full hover:bg-rose-600 hover:text-white"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Dynamic Search Suggestions Dropdown */}
          {showSuggestions && (
            <SearchSuggestionDropdown
              searchQuery={searchQuery}
              videoMatches={videoMatches}
              tagMatches={tagMatches}
              isLoading={isLoading}
              activeIndex={activeIndex}
              recentSearches={recentSearches}
              onSelectVideo={handleSelectVideoMatch}
              onSelectTag={handleSelectTagMatch}
              onSelectRecent={handleSelectRecentSearch}
              onRemoveRecent={handleRemoveRecentSearch}
              onClearAllRecent={handleClearAllRecentSearches}
              onSubmitQuery={handleSearchSubmit}
            />
          )}
        </div>

        {/* Right Section: Upload, Role Switcher, Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Upload Button */}
          <button
            id="header-upload-btn"
            type="button"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-rose-950/40 transition-all active:scale-95"
          >
            <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Upload</span>
          </button>

          {/* Testing Role Switcher */}
          <div className="relative hidden lg:block">
            <button
              id="role-switch-btn"
              type="button"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="px-2.5 py-1 rounded-md bg-zinc-800/90 border border-zinc-700 text-xs text-zinc-300 hover:border-zinc-500 flex items-center gap-1.5"
              title="Test RBAC Roles"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono uppercase text-[11px] font-bold tracking-wider">{currentUser.role}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 top-8 z-50 w-44 rounded-xl bg-[#242424] border border-zinc-700 shadow-2xl p-1.5 text-xs space-y-1"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                  Switch Active Role
                </div>
                {(["ADMIN", "CREATOR", "MODERATOR", "USER", "VISITOR"] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => onSwitchRole(r)}
                    className={`w-full text-left px-2 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                      currentUser.role === r
                        ? "bg-rose-600/20 text-rose-400 font-bold"
                        : "text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    <span>{r}</span>
                    {currentUser.role === r && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          <div className="relative">
            <button
              id="header-profile-btn"
              type="button"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 ring-2 ring-zinc-700 hover:ring-rose-500 transition-all flex items-center justify-center flex-shrink-0"
              aria-label="User menu"
            >
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-zinc-400" />
              )}
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 top-11 z-50 w-60 rounded-xl bg-[#202020] border border-zinc-700 shadow-2xl p-2 text-sm text-zinc-200 space-y-1"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="p-2 border-b border-zinc-800">
                  <div className="font-semibold text-white truncate">{currentUser.name}</div>
                  <div className="text-xs text-zinc-400 truncate">{currentUser.email}</div>
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-rose-400 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    Role: {currentUser.role}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onNavigate("user-dashboard")}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-zinc-400" />
                  <span>My Dashboard</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate("user-dashboard", "history")}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
                >
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <span>Watch History</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate("user-dashboard", "favorites")}
                  className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-800 flex items-center gap-2.5 transition-colors"
                >
                  <Bookmark className="w-4 h-4 text-zinc-400" />
                  <span>Favorites & Playlists</span>
                </button>

                {(currentUser.role === "CREATOR" || currentUser.role === "ADMIN") && (
                  <button
                    type="button"
                    onClick={() => onNavigate("creator-dashboard")}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-800 flex items-center gap-2.5 text-rose-400 transition-colors"
                  >
                    <VideoIcon className="w-4 h-4" />
                    <span>Creator Studio</span>
                  </button>
                )}

                {(currentUser.role === "ADMIN" || currentUser.role === "MODERATOR") && (
                  <button
                    type="button"
                    onClick={() => onNavigate("admin-dashboard")}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-800 flex items-center gap-2.5 text-amber-400 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </button>
                )}

                <div className="border-t border-zinc-800 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={() => onNavigate("site-settings")}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-800 flex items-center gap-2.5 text-xs text-zinc-400"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Site Preferences</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onSwitchRole("VISITOR")}
                    className="w-full px-3 py-2 text-left rounded-lg hover:bg-zinc-800 flex items-center gap-2.5 text-xs text-zinc-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out (Visitor Mode)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-zinc-800 space-y-2 pb-2">
          {/* Mobile Search with Suggestions */}
          <div ref={mobileSearchContainerRef} className="relative mb-3">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="absolute left-3.5 pointer-events-none text-zinc-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="Search titles, tags, creators..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                className="w-full bg-[#1b1b1b] border border-zinc-700 rounded-full py-2 pl-10 pr-16 text-sm text-zinc-100 placeholder-zinc-500 focus:border-rose-500 outline-none"
              />
              <div className="absolute right-2 flex items-center gap-1">
                {isLoading && (
                  <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin mr-1" />
                )}
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(true);
                    }}
                    className="p-1 text-zinc-500 hover:text-zinc-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button type="submit" className="p-1 text-zinc-400 hover:text-white" aria-label="Search">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {showSuggestions && (
              <SearchSuggestionDropdown
                searchQuery={searchQuery}
                videoMatches={videoMatches}
                tagMatches={tagMatches}
                isLoading={isLoading}
                activeIndex={activeIndex}
                recentSearches={recentSearches}
                onSelectVideo={handleSelectVideoMatch}
                onSelectTag={handleSelectTagMatch}
                onSelectRecent={handleSelectRecentSearch}
                onRemoveRecent={handleRemoveRecentSearch}
                onClearAllRecent={handleClearAllRecentSearches}
                onSubmitQuery={handleSearchSubmit}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <button
              type="button"
              onClick={() => {
                onNavigate("home");
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-zinc-800/80 text-left text-zinc-200 font-medium"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate("trending");
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-zinc-800/80 text-left text-zinc-200 font-medium flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-amber-500" />
              Trending
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate("categories");
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-zinc-800/80 text-left text-zinc-200 font-medium flex items-center gap-1.5"
            >
              <LayoutGrid className="w-4 h-4 text-zinc-400" />
              Categories
            </button>
            <button
              type="button"
              onClick={() => {
                onNavigate("user-dashboard");
                setIsMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-lg bg-zinc-800/80 text-left text-zinc-200 font-medium flex items-center gap-1.5"
            >
              <UserIcon className="w-4 h-4 text-zinc-400" />
              Dashboard
            </button>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span>Role: {currentUser.role}</span>
            <button
              type="button"
              onClick={() => onSwitchRole(currentUser.role === "ADMIN" ? "USER" : "ADMIN")}
              className="text-rose-400 underline"
            >
              Toggle Admin/User
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
