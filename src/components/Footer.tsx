import React from "react";
import { Play } from "lucide-react";
import { LegalDocType } from "./LegalModal";

interface FooterProps {
  onOpenLegal: (type: LegalDocType) => void;
  onNavigate: (view: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal, onNavigate }) => {
  return (
    <footer id="main-footer" className="w-full bg-[#0d0d0d] border-t border-zinc-900 mt-16 pt-12 pb-10 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top brand & columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center">
                <Play className="w-3.5 h-3.5 text-white fill-current translate-x-0.5" />
              </div>
              <span className="font-extrabold text-lg text-white font-['Outfit'] tracking-tight">
                Nexa<span className="text-rose-500">Play</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
              A high-performance federated video platform supporting open-license creators, high definition streaming, PeerTube integration, and community safety.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-zinc-500 font-mono">
              <span>HLS v6.0</span>
              <span>•</span>
              <span>PeerTube v6 API</span>
              <span>•</span>
              <span>1080p60 Ready</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Explore</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button type="button" onClick={() => onNavigate("home")} className="hover:text-rose-400 transition-colors">
                  Homepage
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("trending")} className="hover:text-rose-400 transition-colors">
                  Trending Videos
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("categories")} className="hover:text-rose-400 transition-colors">
                  All Categories
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("creator-dashboard")} className="hover:text-rose-400 transition-colors">
                  Creator Studio
                </button>
              </li>
            </ul>
          </div>

          {/* Compliance & Safety */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Compliance</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button type="button" onClick={() => onOpenLegal("age-policy")} className="hover:text-rose-400 transition-colors">
                  18 U.S.C. § 2257
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegal("dmca")} className="hover:text-rose-400 transition-colors">
                  DMCA / Copyright
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegal("removal")} className="hover:text-rose-400 transition-colors">
                  Content Removal
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegal("guidelines")} className="hover:text-rose-400 transition-colors">
                  Community Safety
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Terms */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-zinc-300">Legal</h5>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <button type="button" onClick={() => onOpenLegal("terms")} className="hover:text-rose-400 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenLegal("privacy")} className="hover:text-rose-400 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("admin-dashboard")} className="hover:text-amber-400 transition-colors">
                  Admin & Moderation
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigate("site-settings")} className="hover:text-rose-400 transition-colors">
                  Site Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright notice */}
        <div className="pt-6 border-t border-zinc-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} NexaPlay Video Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Strict zero tolerance for illegal content or unverified minors.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
