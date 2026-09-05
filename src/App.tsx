import React, { useState, useEffect } from "react";
import { Video, Category, User, UserRole } from "./types";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/HomePage";
import { WatchPage } from "./components/WatchPage";
import { SearchPage } from "./components/SearchPage";
import { CategoryMenu } from "./components/CategoryMenu";
import { CreatorStudio } from "./components/CreatorStudio";
import { AdminPanel } from "./components/AdminPanel";
import { UserDashboard } from "./components/UserDashboard";
import { AgeGateModal } from "./components/AgeGateModal";
import { ShareModal } from "./components/ShareModal";
import { PlaylistModal } from "./components/PlaylistModal";
import { ReportModal } from "./components/ReportModal";
import { LegalModal, LegalDocType } from "./components/LegalModal";
import { Sparkles, Flame } from "lucide-react";

// Default test user
const INITIAL_USER: User = {
  id: "usr-admin-1",
  email: "director@nexaplay.io",
  username: "alexander",
  name: "Alexander Vance",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  role: "ADMIN",
  isVerified: true,
  isAgeVerified: true,
  createdAt: new Date().toISOString(),
};

export default function App() {
  // Navigation & View State
  const [currentView, setCurrentView] = useState<string>("home");
  const [viewParam, setViewParam] = useState<string | undefined>(undefined);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // User & RBAC State
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);

  // Global Video & Category Data
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAgeGateOpen, setIsAgeGateOpen] = useState(false);
  const [shareVideo, setShareVideo] = useState<Video | null>(null);
  const [playlistVideo, setPlaylistVideo] = useState<Video | null>(null);
  const [reportVideo, setReportVideo] = useState<Video | null>(null);
  const [legalDocType, setLegalDocType] = useState<LegalDocType | null>(null);

  // Initialize data and check age gate
  useEffect(() => {
    // Check local storage for age verification
    const verified = localStorage.getItem("nexaplay_age_verified");
    if (!verified) {
      setIsAgeGateOpen(true);
    }

    // Fetch initial categories and videos
    fetchCategories();
    fetchVideos();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {
      // ignore
    }
  };

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videos?limit=30");
      const data = await res.json();
      if (data.videos) {
        setVideos(data.videos);
        // If no video is selected yet, choose the first trending one for direct deep-link support
        const params = new URLSearchParams(window.location.search);
        const vidParam = params.get("v");
        if (vidParam) {
          const found = data.videos.find((v: Video) => v.id === vidParam);
          if (found) {
            setSelectedVideo(found);
            setCurrentView("watch");
          }
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAgeConfirm = () => {
    localStorage.setItem("nexaplay_age_verified", "true");
    setIsAgeGateOpen(false);
  };

  const handleAgeExit = () => {
    window.location.href = "https://www.google.com";
  };

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    setViewParam(param);
    if (view !== "watch") {
      // clear URL query param when leaving watch
      window.history.replaceState(null, "", window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectVideo = (video: Video) => {
    setSelectedVideo(video);
    setCurrentView("watch");
    window.history.replaceState(null, "", `/?v=${video.id}`);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory("All");
    setCurrentView("search");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSearchQuery("");
    if (categoryName === "All") {
      setCurrentView("home");
    } else {
      setCurrentView("search");
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSwitchRole = (newRole: UserRole) => {
    setCurrentUser((prev) => ({
      ...prev,
      role: newRole,
      name:
        newRole === "ADMIN"
          ? "Alexander Vance (Admin)"
          : newRole === "CREATOR"
          ? "Emma Live Studio (Creator)"
          : newRole === "MODERATOR"
          ? "Trust & Safety Officer"
          : newRole === "VISITOR"
          ? "Guest Visitor"
          : "Standard Viewer",
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#111111] text-zinc-100 font-sans selection:bg-rose-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        onSwitchRole={handleSwitchRole}
        onOpenUpload={() => handleNavigate("creator-dashboard", "upload")}
        currentView={currentView}
      />

      {/* Main Content Router */}
      <main className="flex-1 w-full">
        {/* Watch View */}
        {currentView === "watch" && selectedVideo && (
          <WatchPage
            video={selectedVideo}
            currentUser={currentUser}
            onSelectVideo={handleSelectVideo}
            onSaveToPlaylist={(vid) => setPlaylistVideo(vid)}
            onShare={(vid) => setShareVideo(vid)}
            onReport={(vid) => setReportVideo(vid)}
            onTagClick={(tag) => handleSearch(tag)}
          />
        )}

        {/* Home View */}
        {currentView === "home" && (
          <HomePage
            videos={videos}
            categories={categories}
            onSelectVideo={handleSelectVideo}
            onSelectCategory={handleSelectCategory}
            onSaveToPlaylist={(vid) => setPlaylistVideo(vid)}
            onShare={(vid) => setShareVideo(vid)}
            onNavigate={handleNavigate}
            selectedCategory={selectedCategory}
          />
        )}

        {/* Trending View */}
        {currentView === "trending" && (
          <SearchPage
            initialQuery=""
            initialCategory="All"
            categories={categories}
            onSelectVideo={handleSelectVideo}
            onSaveToPlaylist={(vid) => setPlaylistVideo(vid)}
            onShare={(vid) => setShareVideo(vid)}
          />
        )}

        {/* Search Results View */}
        {currentView === "search" && (
          <SearchPage
            initialQuery={searchQuery}
            initialCategory={selectedCategory}
            categories={categories}
            onSelectVideo={handleSelectVideo}
            onSaveToPlaylist={(vid) => setPlaylistVideo(vid)}
            onShare={(vid) => setShareVideo(vid)}
          />
        )}

        {/* Categories Directory View */}
        {currentView === "categories" && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
            <div className="pb-4 border-b border-zinc-800 space-y-1">
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Browse Video Categories</span>
              </h1>
              <p className="text-xs text-zinc-400">
                Explore specialized genres, open culture streams, lifestyle vlogs, tutorials, and community submissions.
              </p>
            </div>
            <CategoryMenu
              categories={categories}
              onSelectCategory={(cat) => handleSelectCategory(cat)}
              variant="cards"
            />
          </div>
        )}

        {/* Creator Studio View */}
        {currentView === "creator-dashboard" && (
          <CreatorStudio
            currentUser={currentUser}
            categories={categories}
            onVideoUploaded={() => fetchVideos()}
            onSelectVideo={handleSelectVideo}
          />
        )}

        {/* Admin Dashboard View */}
        {currentView === "admin-dashboard" && (
          <AdminPanel
            currentUser={currentUser}
            categories={categories}
            onRefreshCategories={() => fetchCategories()}
            onSelectVideo={handleSelectVideo}
          />
        )}

        {/* User Dashboard View */}
        {currentView === "user-dashboard" && (
          <UserDashboard
            currentUser={currentUser}
            initialTab={viewParam || "history"}
            onSelectVideo={handleSelectVideo}
          />
        )}

        {/* Site Settings View */}
        {currentView === "site-settings" && (
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            <div className="p-6 rounded-2xl bg-[#1c1c1c] border border-zinc-800 space-y-4">
              <h2 className="text-xl font-bold text-white">Viewing & Compliance Preferences</h2>
              <div className="space-y-3 text-xs text-zinc-300">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="font-semibold text-white">18+ Age Gate Confirmation</div>
                    <div className="text-zinc-500">You are currently recorded as verified adult viewer.</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem("nexaplay_age_verified");
                      setIsAgeGateOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
                  >
                    Reset Verification
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                  <div>
                    <div className="font-semibold text-white">Adaptive Streaming Engine</div>
                    <div className="text-zinc-500">HLS.js with automatic multi-bitrate resolution scaling.</div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[10px]">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer
        onOpenLegal={(type) => setLegalDocType(type)}
        onNavigate={handleNavigate}
      />

      {/* Modals */}
      <AgeGateModal
        isOpen={isAgeGateOpen}
        onConfirm={handleAgeConfirm}
        onExit={handleAgeExit}
      />

      <ShareModal
        isOpen={!!shareVideo}
        video={shareVideo}
        onClose={() => setShareVideo(null)}
      />

      <PlaylistModal
        isOpen={!!playlistVideo}
        video={playlistVideo}
        onClose={() => setPlaylistVideo(null)}
      />

      <ReportModal
        isOpen={!!reportVideo}
        video={reportVideo}
        onClose={() => setReportVideo(null)}
      />

      <LegalModal
        isOpen={!!legalDocType}
        type={legalDocType}
        onClose={() => setLegalDocType(null)}
      />
    </div>
  );
}
