import React from "react";
import { ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

interface AgeGateModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onExit: () => void;
}

export const AgeGateModal: React.FC<AgeGateModalProps> = ({
  isOpen,
  onConfirm,
  onExit,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="age-gate-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
    >
      <div
        id="age-gate-dialog"
        className="w-full max-w-lg rounded-2xl bg-[#1c1c1c] border border-zinc-800 p-6 sm:p-8 text-center shadow-2xl space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-rose-950/60 border border-rose-600/40 text-rose-500 mx-auto flex items-center justify-center shadow-lg shadow-rose-950/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Age Verification Required
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">
            This website contains user-generated open content and may contain age-restricted material.
            You must be at least 18 years of age (or the age of majority in your jurisdiction) to access this website.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 text-left space-y-1.5">
          <p className="font-semibold text-zinc-300">Compliance & Legal Notice:</p>
          <p>
            By entering, you confirm you are of legal adult age, agree to our Terms of Service, and comply with all local laws and 18 U.S.C. § 2257 record-keeping requirements.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            id="age-gate-exit-btn"
            type="button"
            onClick={onExit}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            <span>Exit Site</span>
          </button>
          <button
            id="age-gate-confirm-btn"
            type="button"
            onClick={onConfirm}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>I am of legal age (18+)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
