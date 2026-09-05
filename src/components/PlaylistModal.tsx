import React, { useState, useEffect } from "react";
import { Video, Playlist } from "../types";
import { X, Plus, Check, BookmarkPlus, FolderPlus } from "lucide-react";

interface PlaylistModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PlaylistModal: React.FC<PlaylistModalProps> = ({ video, isOpen, onClose }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [addedPlaylists, setAddedPlaylists] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetch("/api/playlists")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setPlaylists(data);
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen || !video) return null;

  const handleAddToPlaylist = async (playlistId: string) => {
    try {
      await fetch(`/api/playlists/${playlistId}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      });
      setAddedPlaylists(new Set(addedPlaylists).add(playlistId));
    } catch {
      // ignore
    }
  };

  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const res = await fetch("/api/playlists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlaylistName.trim(), isPublic: false }),
      });
      const data = await res.json();
      setPlaylists([data, ...playlists]);
      setNewPlaylistName("");
      setIsCreating(false);
      handleAddToPlaylist(data.id);
    } catch {
      // ignore
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm rounded-2xl bg-[#1e1e1e] border border-zinc-800 p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <BookmarkPlus className="w-5 h-5 text-rose-500" />
            <span>Save to Playlist</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Playlists list */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
          {playlists.map((pl) => {
            const isAdded = addedPlaylists.has(pl.id);
            return (
              <button
                key={pl.id}
                type="button"
                onClick={() => handleAddToPlaylist(pl.id)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left ${
                  isAdded
                    ? "bg-rose-950/40 border-rose-600/60 text-rose-300"
                    : "bg-zinc-900/90 border-zinc-800 hover:border-zinc-700 text-zinc-200"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold truncate">{pl.name}</div>
                  <div className="text-[11px] text-zinc-500">{pl.videosCount || 0} videos</div>
                </div>
                {isAdded ? (
                  <Check className="w-4 h-4 text-rose-400" />
                ) : (
                  <Plus className="w-4 h-4 text-zinc-400" />
                )}
              </button>
            );
          })}
        </div>

        {/* Create New Playlist */}
        {!isCreating ? (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="w-full py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <FolderPlus className="w-4 h-4 text-rose-500" />
            <span>Create New Playlist</span>
          </button>
        ) : (
          <form onSubmit={handleCreatePlaylist} className="space-y-2 pt-1 border-t border-zinc-800">
            <input
              type="text"
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="w-1/2 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Create & Add
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
