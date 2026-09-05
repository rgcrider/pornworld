import React, { useState, useEffect } from "react";
import { User, Video, Category } from "../types";
import { formatDuration, formatViews, formatTimeAgo } from "../utils/formatters";
import {
  ShieldAlert,
  Server,
  Film,
  DownloadCloud,
  Layers,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw,
  Loader2
} from "lucide-react";

interface AdminPanelProps {
  currentUser: User;
  categories: Category[];
  onRefreshCategories: () => void;
  onSelectVideo: (video: Video) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  categories,
  onRefreshCategories,
  onSelectVideo,
}) => {
  const [activeSection, setActiveSection] = useState<
    "overview" | "moderation" | "peertube" | "categories" | "settings"
  >("overview");

  // Moderation Reports State
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);

  // PeerTube Importer State
  const [ptInstanceUrl, setPtInstanceUrl] = useState("https://peertube.tv");
  const [ptVideos, setPtVideos] = useState<any[]>([]);
  const [ptLoading, setPtLoading] = useState(false);
  const [ptMessage, setPtMessage] = useState<string | null>(null);

  // Category Manager State
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Folder");
  const [newCatThumbnail, setNewCatThumbnail] = useState(
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80"
  );

  // Site Settings
  const [siteName, setSiteName] = useState("NexaPlay");
  const [ageGateEnabled, setAgeGateEnabled] = useState(true);
  const [adsEnabled, setAdsEnabled] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch {
      // ignore
    } finally {
      setReportsLoading(false);
    }
  };

  const handleResolveReport = async (reportId: string, action: "DISMISS" | "AGE_RESTRICT" | "DELETE_VIDEO") => {
    try {
      await fetch(`/api/reports/${reportId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setReports(reports.filter((r) => r.id !== reportId));
    } catch {
      // ignore
    }
  };

  const handleFetchPeerTube = async () => {
    setPtLoading(true);
    setPtMessage(null);
    try {
      const res = await fetch("/api/peertube/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instanceUrl: ptInstanceUrl.trim() }),
      });
      const data = await res.json();
      if (data.videos) {
        setPtVideos(data.videos);
        setPtMessage(`Discovered ${data.videos.length} open licensed videos from ${data.instance}`);
      }
    } catch {
      setPtMessage("Failed to connect to PeerTube instance. Check URL.");
    } finally {
      setPtLoading(false);
    }
  };

  const handleImportPeerTubeVideo = async (ptVid: any) => {
    try {
      await fetch("/api/peertube/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ptVideoId: ptVid.id,
          instanceUrl: ptInstanceUrl,
          category: ptVid.category || "Entertainment",
        }),
      });
      alert(`Imported "${ptVid.name}" into NexaPlay catalog!`);
    } catch {
      alert("Failed to import video.");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCatName.trim(),
          icon: newCatIcon,
          thumbnail: newCatThumbnail,
        }),
      });
      setNewCatName("");
      onRefreshCategories();
    } catch {
      // ignore
    }
  };

  return (
    <div id="admin-panel-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-500 flex items-center justify-center">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>Admin & Safety Center</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 uppercase tracking-widest border border-amber-500/30">
                Staff Control
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Federation bridge, moderation reports, content curation, and site telemetry.
            </p>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: "overview", label: "Overview", icon: Server },
            { id: "moderation", label: `Moderation (${reports.length})`, icon: ShieldAlert },
            { id: "peertube", label: "PeerTube Importer", icon: DownloadCloud },
            { id: "categories", label: "Categories", icon: Layers },
            { id: "settings", label: "Site Settings", icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  activeSection === tab.id
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

      {/* 1. Overview */}
      {activeSection === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#1c1c1c] border border-zinc-800 space-y-1">
              <div className="text-xs text-zinc-400 font-medium">Platform Total Views</div>
              <div className="text-2xl font-bold text-white">14.2M</div>
              <div className="text-[11px] text-emerald-400">+12% traffic spike</div>
            </div>
            <div className="p-4 rounded-xl bg-[#1c1c1c] border border-zinc-800 space-y-1">
              <div className="text-xs text-zinc-400 font-medium">Pending Moderation</div>
              <div className="text-2xl font-bold text-amber-400">{reports.length} reports</div>
              <div className="text-[11px] text-zinc-400">Avg response: 18 min</div>
            </div>
            <div className="p-4 rounded-xl bg-[#1c1c1c] border border-zinc-800 space-y-1">
              <div className="text-xs text-zinc-400 font-medium">Active HLS Transcoders</div>
              <div className="text-2xl font-bold text-indigo-400">4 Worker Nodes</div>
              <div className="text-[11px] text-zinc-400">CPU Load: 34% (Normal)</div>
            </div>
            <div className="p-4 rounded-xl bg-[#1c1c1c] border border-zinc-800 space-y-1">
              <div className="text-xs text-zinc-400 font-medium">Edge Cache Hit Ratio</div>
              <div className="text-2xl font-bold text-emerald-400">96.8%</div>
              <div className="text-[11px] text-zinc-400">Global R2/CDN distribution</div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#1c1c1c] border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-rose-500" />
              <span>Microservices & Architecture Topology</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              NexaPlay runs an Express + Next.js compatible REST cluster backed by Prisma ORM, Redis caching layer for rapid video search and suggestions, AWS S3/Cloudflare R2 storage buckets, and HLS.js adaptive player streaming with 1080p, 720p, 480p bitrates.
            </p>
          </div>
        </div>
      )}

      {/* 2. Moderation Queue */}
      {activeSection === "moderation" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <span>User Reports & Moderation Queue</span>
            </h3>
            <button
              type="button"
              onClick={fetchReports}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>

          {reportsLoading ? (
            <div className="py-12 text-center text-zinc-400 text-xs">Loading queue...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#1c1c1c] border border-zinc-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="text-sm font-bold text-white">All Clear!</p>
              <p className="text-xs text-zinc-400">There are no pending reports or flagged content.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-[#1c1c1c] border border-zinc-800 overflow-hidden">
              <table className="w-full text-left text-xs text-zinc-300">
                <thead className="bg-zinc-900 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                  <tr>
                    <th className="p-3.5">Reported Video</th>
                    <th className="p-3.5">Reason</th>
                    <th className="p-3.5">Details</th>
                    <th className="p-3.5">Reported At</th>
                    <th className="p-3.5 text-right">Moderator Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {reports.map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-900/40">
                      <td className="p-3.5">
                        <div className="font-semibold text-white truncate max-w-xs">{r.videoTitle}</div>
                        <span className="text-[10px] text-zinc-500 font-mono">ID: {r.videoId}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-rose-950/50 text-rose-300 border border-rose-600/30 text-[11px] font-semibold">
                          {r.reason}
                        </span>
                      </td>
                      <td className="p-3.5 max-w-xs truncate text-zinc-400">{r.details || "No details provided"}</td>
                      <td className="p-3.5 text-zinc-500 font-mono text-[11px]">{formatTimeAgo(r.createdAt)}</td>
                      <td className="p-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleResolveReport(r.id, "DISMISS")}
                          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium"
                        >
                          Dismiss
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveReport(r.id, "AGE_RESTRICT")}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold"
                        >
                          Age-Restrict (18+)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleResolveReport(r.id, "DELETE_VIDEO")}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-bold"
                        >
                          Delete Video
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 3. PeerTube Importer */}
      {activeSection === "peertube" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-[#1c1c1c] border border-zinc-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <DownloadCloud className="w-5 h-5 text-indigo-400" />
                <span>Federated PeerTube Importer & Sync</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Query public Fediverse/PeerTube nodes (e.g. peertube.tv, framatube.org) to ingest Creative Commons licensed videos directly into NexaPlay.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={ptInstanceUrl}
                onChange={(e) => setPtInstanceUrl(e.target.value)}
                placeholder="https://peertube.tv"
                className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500 font-mono"
              />
              <button
                type="button"
                onClick={handleFetchPeerTube}
                disabled={ptLoading}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2"
              >
                {ptLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <DownloadCloud className="w-4 h-4" />}
                <span>Fetch Videos</span>
              </button>
            </div>

            {ptMessage && <div className="text-xs text-indigo-300 font-medium">{ptMessage}</div>}
          </div>

          {/* Discovered PeerTube Videos */}
          {ptVideos.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white">Discovered Remote Videos</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {ptVideos.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-[#181818] border border-zinc-800 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900">
                        <img
                          src={v.thumbnailUrl}
                          alt={v.name}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-zinc-200 font-mono">
                          {formatDuration(v.duration)}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-zinc-100 line-clamp-2">{v.name}</h5>
                      <p className="text-[11px] text-zinc-400">{v.account?.displayName || "PeerTube Creator"}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleImportPeerTubeVideo(v)}
                      className="w-full py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors mt-2"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>Import into NexaPlay</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Categories Manager */}
      {activeSection === "categories" && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateCategory}
            className="p-5 rounded-2xl bg-[#1c1c1c] border border-zinc-800 space-y-4 max-w-xl"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-rose-500" />
              <span>Add New Category</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Category Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Technology"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Lucide Icon</label>
                <select
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500"
                >
                  {["Flame", "Heart", "Users", "User", "ShieldAlert", "Sparkles", "Globe", "Star", "Tv", "Coffee", "Folder"].map(
                    (ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Thumbnail URL</label>
                <input
                  type="url"
                  value={newCatThumbnail}
                  onChange={(e) => setNewCatThumbnail(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
            >
              Create Category
            </button>
          </form>

          {/* Existing Categories Table */}
          <div className="rounded-2xl bg-[#1c1c1c] border border-zinc-800 overflow-hidden">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 text-[11px] font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Icon</th>
                  <th className="p-3.5">Videos Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="p-3.5 font-semibold text-white flex items-center gap-2">
                      <img src={c.thumbnail} alt={c.name} className="w-8 h-8 rounded-md object-cover" />
                      <span>{c.name}</span>
                    </td>
                    <td className="p-3.5 text-zinc-400 font-mono">{c.icon}</td>
                    <td className="p-3.5 text-rose-400 font-bold">{c.videoCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Site Settings */}
      {activeSection === "settings" && (
        <div className="max-w-xl p-6 rounded-2xl bg-[#1c1c1c] border border-zinc-800 space-y-5">
          <h3 className="text-base font-bold text-white">Platform Settings & Compliance</h3>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300">Application Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={ageGateEnabled}
                onChange={(e) => setAgeGateEnabled(e.target.checked)}
                className="rounded accent-rose-500 w-4 h-4"
              />
              <span>Enable 18+ Age Verification Modal Gate on first entry</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={adsEnabled}
                onChange={(e) => setAdsEnabled(e.target.checked)}
                className="rounded accent-rose-500 w-4 h-4"
              />
              <span>Display Sponsored Advertisements (Header & Between-grid banners)</span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => alert("Settings saved successfully!")}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
          >
            Save Configuration
          </button>
        </div>
      )}
    </div>
  );
};
