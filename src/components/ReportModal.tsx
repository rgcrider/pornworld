import React, { useState } from "react";
import { Video } from "../types";
import { X, Flag, CheckCircle2 } from "lucide-react";

interface ReportModalProps {
  video: Video | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ video, isOpen, onClose }) => {
  const [reason, setReason] = useState("Inappropriate content");
  const [details, setDetails] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !video) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId: video.id,
          reason,
          details,
        }),
      });
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
      }, 1800);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-[#1e1e1e] border border-zinc-800 p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <Flag className="w-5 h-5 text-rose-500" />
            <span>Report Content</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Report Submitted</h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Our moderation team reviews reports in accordance with our safety and compliance guidelines. Thank you for keeping NexaPlay safe.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-zinc-300">
              Please tell us why you are reporting <span className="font-semibold text-rose-400">"{video.title}"</span>:
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500"
              >
                <option value="Inappropriate content">Inappropriate / Unmoderated content</option>
                <option value="Copyright violation">Copyright or Trademark infringement (DMCA)</option>
                <option value="Spam or misleading">Spam, deceptive metadata or scam</option>
                <option value="Minor safety or illegal">Illegal content / Minor safety concern</option>
                <option value="Privacy violation">Personal data or non-consensual imagery</option>
                <option value="Other">Other legal issue</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Additional Details (Optional)</label>
              <textarea
                rows={3}
                placeholder="Provide timestamps or specific details..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-700 text-zinc-200 outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-950/40"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
