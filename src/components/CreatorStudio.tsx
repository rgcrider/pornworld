import React, { useState, useEffect, useRef } from "react";
import { User, Video, Category } from "../types";
import { formatDuration, formatViews } from "../utils/formatters";
import {
  UploadCloud,
  Film,
  BarChart3,
  TrendingUp,
  ThumbsUp,
  Users,
  CheckCircle,
  Loader2,
  Trash2,
  Plus
} from "lucide-react";

interface CreatorStudioProps {
  currentUser: User;
  categories: Category[];
  onVideoUploaded?: () => void;
  onSelectVideo: (video: Video) => void;
}

export const CreatorStudio: React.FC<CreatorStudioProps> = ({
  currentUser,
  categories,
  onVideoUploaded,
  onSelectVideo,
}) => {
  const [activeTab, setActiveTab] = useState<"analytics" | "videos" | "upload">("analytics");
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  // Upload Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0]?.name || "Entertainment");
  const [tags, setTags] = useState("creative, 4k, video");
  const [playbackUrl, setPlaybackUrl] = useState("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
  const [thumbnailUrl, setThumbnailUrl] = useState("https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80");
  const [duration, setDuration] = useState(596);
  const [isAgeRestricted, setIsAgeRestricted] = useState(false);
  const [license, setLicense] = useState("Creative Commons Attribution");

  // Transcoding simulator state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [transcodingStep, setTranscodingStep] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMyVideos();
  }, []);

  const fetchMyVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/videos?limit=50");
      const data = await res.json();
      if (data.videos) {
        // Filter for this creator or show samples
        setMyVideos(data.videos);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
      // Simulate file duration and sample URL
      setDuration(Math.floor(Math.random() * 600) + 180);
    }
  };

  const handleStartUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsUploading(true);
    setUploadProgress(10);
    setTranscodingStep("Uploading media payload to storage cluster...");

    // Simulated progress steps
    setTimeout(() => {
      setUploadProgress(40);
      setTranscodingStep("Transcoding 360p, 480p, 720p, 1080p MP4 renditions...");
    }, 700);

    setTimeout(() => {
      setUploadProgress(75);
      setTranscodingStep("Generating multi-bitrate HLS (.m3u8) adaptive stream playlist...");
    }, 1500);

    setTimeout(async () => {
      setUploadProgress(100);
      setTranscodingStep("Finalizing manifest and publishing video...");

      try {
        const payload = {
          title: title.trim(),
          description: description.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          playbackUrl: playbackUrl.trim(),
          hlsManifestUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
          duration: Number(duration) || 300,
          category,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          isAgeRestricted,
          license,
          sourceProvider: "UserUpload",
        };

        const res = await fetch("/api/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const newVid = await res.json();
        setMyVideos([newVid, ...myVideos]);
        setIsUploading(false);
        setTranscodingStep(null);
        setActiveTab("videos");
        if (onVideoUploaded) onVideoUploaded();
      } catch {
        setIsUploading(false);
        setTranscodingStep(null);
      }
    }, 2400);
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;
    try {
      await fetch(`/api/videos/${id}`, { method: "DELETE" });
      setMyVideos(myVideos.filter((v) => v.id !== id));
    } catch {
      // ignore
    }
  };

  return (
    <div id="creator-studio-container" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-500 flex items-center justify-center">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>Creator Studio</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-rose-400 font-mono">
                {currentUser.name}
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Manage your video pipeline, adaptive HLS encodings, channel metrics, and subscribers.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900 border border-zinc-800 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "analytics"
                ? "bg-rose-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "videos"
                ? "bg-rose-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>My Videos ({myVideos.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              activeTab === "upload"
                ? "bg-rose-600 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Metrics Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Total Views</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-white">4.8M</div>
              <div className="text-[11px] text-emerald-400 font-medium">+18.4% this month</div>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Subscribers</span>
                <Users className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-2xl font-bold text-white">128.5K</div>
              <div className="text-[11px] text-rose-400 font-medium">+2,400 new followers</div>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Avg. Watch Duration</span>
                <Film className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-bold text-white">08:42</div>
              <div className="text-[11px] text-zinc-400">72% completion rate</div>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1a1a] border border-zinc-800 space-y-1">
              <div className="flex items-center justify-between text-zinc-400 text-xs">
                <span>Total Likes</span>
                <ThumbsUp className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white">395K</div>
              <div className="text-[11px] text-emerald-400 font-medium">98.4% positive ratio</div>
            </div>
          </div>

          {/* Quick Upload Banner CTA */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-rose-950/40 via-zinc-900 to-zinc-900 border border-rose-600/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Ready to publish your next piece?</h3>
              <p className="text-xs text-zinc-400">
                Support for 1080p60 MP4, WebM, and direct PeerTube federation with auto thumbnail extraction.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center gap-2 whitespace-nowrap"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Launch Video Uploader</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Upload Video Form */}
      {activeTab === "upload" && (
        <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-[#1a1a1a] border border-zinc-800 space-y-6">
          <div className="border-b border-zinc-800 pb-4">
            <h3 className="text-lg font-bold text-white">Upload New Video</h3>
            <p className="text-xs text-zinc-400">
              Provide metadata and ingest files. Files will be transcoded for adaptive HLS delivery.
            </p>
          </div>

          {isUploading ? (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-rose-500 animate-spin mx-auto" />
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Processing Your Video</h4>
                <p className="text-xs text-zinc-400">{transcodingStep}</p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-zinc-800 rounded-full h-2 max-w-md mx-auto overflow-hidden">
                <div
                  className="bg-rose-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-xs font-mono text-zinc-500">{uploadProgress}%</span>
            </div>
          ) : (
            <form onSubmit={handleStartUpload} className="space-y-4">
              {/* Drag and drop file zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-rose-500 rounded-2xl p-6 text-center cursor-pointer bg-zinc-900/60 hover:bg-zinc-900 transition-all space-y-2 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleSimulatedFileUpload}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-zinc-400 group-hover:text-rose-500 transition-colors mx-auto" />
                <div className="text-xs text-zinc-300 font-medium">
                  Click to select or drag video file here (MP4, MKV, WebM)
                </div>
                <div className="text-[11px] text-zinc-500">Up to 4K resolution supported</div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Video Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunset Reflections & Chill Ambient Beats"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 outline-none focus:border-rose-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe your video, track credits, or timestamps..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 outline-none focus:border-rose-500 resize-none"
                />
              </div>

              {/* Category & License */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">License</label>
                  <select
                    value={license}
                    onChange={(e) => setLicense(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500"
                  >
                    <option value="Creative Commons Attribution">Creative Commons (CC-BY)</option>
                    <option value="Creative Commons Zero">Creative Commons Zero (CC0)</option>
                    <option value="Standard NexaPlay License">Standard Creator License</option>
                    <option value="Open Source Audio/Video">Open Source Public License</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. ambient, relax, nature, 4k"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-100 outline-none focus:border-rose-500"
                />
              </div>

              {/* Age restriction toggle */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="age-restrict-chk"
                  checked={isAgeRestricted}
                  onChange={(e) => setIsAgeRestricted(e.target.checked)}
                  className="rounded accent-rose-500 w-4 h-4"
                />
                <label htmlFor="age-restrict-chk" className="text-xs text-zinc-300 cursor-pointer">
                  Mark as Age-Restricted (18+ content requiring age confirmation gate)
                </label>
              </div>

              <div className="pt-3 border-t border-zinc-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab("videos")}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-950/50 flex items-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Transcode & Publish</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tab 3: Videos List */}
      {activeTab === "videos" && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-[#1a1a1a] border border-zinc-800 overflow-hidden">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Video</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Views</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {myVideos.map((vid) => (
                  <tr key={vid.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-16 h-10 object-cover rounded-md flex-shrink-0 cursor-pointer"
                        onClick={() => onSelectVideo(vid)}
                      />
                      <div className="min-w-0">
                        <div
                          className="font-semibold text-white truncate max-w-xs cursor-pointer hover:text-rose-400"
                          onClick={() => onSelectVideo(vid)}
                        >
                          {vid.title}
                        </div>
                        <div className="text-[11px] text-zinc-500">{formatDuration(vid.duration)}</div>
                      </div>
                    </td>
                    <td className="p-3.5">{vid.category}</td>
                    <td className="p-3.5 font-mono">{formatViews(vid.viewsCount)}</td>
                    <td className="p-3.5 text-emerald-400 font-semibold">{Math.round(vid.ratingScore)}%</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" /> Ready
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteVideo(vid.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 transition-colors"
                        title="Delete video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
