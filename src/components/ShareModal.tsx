import React, { useState } from "react";
import { Video } from "../types";
import { X, Copy, Check, Share2, Code2 } from "lucide-react";

interface ShareModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ video, isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen || !video) return null;

  const currentUrl = `${window.location.origin}/?v=${video.id}`;
  const embedCode = `<iframe src="${video.embedUrl || currentUrl}" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;

  const copyToClipboard = (text: string, isEmbed = false) => {
    navigator.clipboard.writeText(text);
    if (isEmbed) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#1e1e1e] border border-zinc-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Share2 className="w-5 h-5 text-rose-500" />
            <span>Share Video</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video preview mini bar */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-16 h-10 object-cover rounded-md"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-zinc-200 truncate">{video.title}</h4>
            <p className="text-[11px] text-zinc-400 truncate">{video.creator.channelName}</p>
          </div>
        </div>

        {/* Direct Link */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400">Direct Link</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 select-all outline-none"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(currentUrl)}
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Embed Code */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
            <Code2 className="w-3.5 h-3.5 text-zinc-400" />
            <span>Embed Player</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={embedCode}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono select-all outline-none"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(embedCode, true)}
              className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition-colors"
            >
              {copiedEmbed ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEmbed ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <button
            type="button"
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(video.title)}&url=${encodeURIComponent(currentUrl)}`, "_blank")}
            className="py-2 px-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            X / Twitter
          </button>
          <button
            type="button"
            onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(video.title + " " + currentUrl)}`, "_blank")}
            className="py-2 px-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            WhatsApp
          </button>
          <button
            type="button"
            onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(video.title)}`, "_blank")}
            className="py-2 px-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Telegram
          </button>
          <button
            type="button"
            onClick={() => window.open(`https://reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(video.title)}`, "_blank")}
            className="py-2 px-1 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
          >
            Reddit
          </button>
        </div>
      </div>
    </div>
  );
};
