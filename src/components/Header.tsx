import React, { useState, useEffect, useRef } from "react";
import { User, UserRole } from "../types";
import {
  Play,
  Search,
  Upload,
  User as UserIcon,
  Flame,
  LayoutGrid,
  Shield,
  Video,
  Bookmark,
  Clock,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronDown
} from "lucide-react";

interface HeaderProps {
  currentUser: User;
  onNavigate: (view: string, param?: string) => void;
  onSearch: (query: string) => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenUpload: () => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onNavigate,
  onSearch,
  onSwitchRole,
  onOpenUpload,
  currentView,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch search suggestions
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      fetch(`/api/search/suggestions?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setSuggestions(data);
        })
        .catch(() => {});
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      onSearch(searchQuery.trim());
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
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

        {/* Center Section: Large Search Bar */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl relative hidden sm:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              id="header-search-input"
              type="text"
              placeholder="Search videos, creators, or tags..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-[#1b1b1b] border border-zinc-700/80 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-full py-2 pl-4 pr-11 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all shadow-inner"
            />
            <button
              id="header-search-btn"
              type="submit"
              className="absolute right-1.5 p-1.5 text-zinc-400 hover:text-rose-400 transition-colors rounded-full hover:bg-zinc-800"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Search Suggestions Popover */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-11 left-0 right-0 z-50 rounded-xl bg-[#202020] border border-zinc-700 shadow-2xl overflow-hidden py-1">
              {suggestions.map((item, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700/60 cursor-pointer flex items-center gap-2.5 transition-colors"
                  onClick={() => handleSelectSuggestion(item)}
                >
                  <Search className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
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
                    <Video className="w-4 h-4" />
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
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-3">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1b1b1b] border border-zinc-700 rounded-full py-2 pl-4 pr-10 text-sm text-zinc-100 placeholder-zinc-500"
            />
            <button type="submit" className="absolute right-3 text-zinc-400">
              <Search className="w-4 h-4" />
            </button>
          </form>

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
