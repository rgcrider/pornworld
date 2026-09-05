import React, { useState } from "react";
import { X, ExternalLink } from "lucide-react";

interface AdBannerProps {
  placement: "header" | "player" | "sidebar" | "grid";
  enabled?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, enabled = true }) => {
  const [dismissed, setDismissed] = useState(false);

  if (!enabled || dismissed) return null;

  if (placement === "header") {
    return (
      <div className="w-full max-w-5xl mx-auto my-3 relative rounded-xl bg-gradient-to-r from-zinc-900 via-[#1e1e1e] to-zinc-900 border border-zinc-800/80 p-3 sm:p-4 flex items-center justify-between gap-4 overflow-hidden shadow-md">
        <div className="flex items-center gap-3">
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-zinc-400 uppercase tracking-widest border border-zinc-700">
            Sponsored
          </span>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <span>Next-Gen High Speed Cloud Video Delivery & Transcoding</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </h4>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Experience seamless 4K HLS playback, global edge CDN distribution, and PeerTube federation tools.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors whitespace-nowrap"
            onClick={() => window.open("https://github.com", "_blank")}
          >
            Learn More
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 text-zinc-500 hover:text-zinc-300 rounded"
            aria-label="Dismiss Ad"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (placement === "grid") {
    return (
      <div className="col-span-full my-4 rounded-xl bg-gradient-to-r from-zinc-900 to-[#181818] border border-dashed border-zinc-700/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-zinc-800 text-zinc-400 uppercase tracking-widest">
            Ad
          </span>
          <p className="text-xs text-zinc-300">
            Open-source PeerTube streaming nodes supported by verified community federations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-rose-400 font-semibold cursor-pointer hover:underline">
            Explore Fediverse Streams →
          </span>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="p-1 text-zinc-500 hover:text-zinc-300"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return null;
};
