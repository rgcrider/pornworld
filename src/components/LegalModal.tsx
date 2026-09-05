import React from "react";
import { X, ShieldCheck, FileText, AlertTriangle } from "lucide-react";

export type LegalDocType = "terms" | "privacy" | "dmca" | "age-policy" | "removal" | "guidelines";

interface LegalModalProps {
  type: LegalDocType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, isOpen, onClose }) => {
  if (!isOpen || !type) return null;

  const getContent = () => {
    switch (type) {
      case "dmca":
        return {
          title: "DMCA / Copyright Infringement Policy",
          icon: <ShieldCheck className="w-5 h-5 text-rose-500" />,
          body: (
            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                NexaPlay respects the intellectual property rights of creators and copyright holders and complies with the provisions of the Digital Millennium Copyright Act (17 U.S.C. § 512).
              </p>
              <h5 className="text-sm font-bold text-white">Submitting a Takedown Notice</h5>
              <p>
                If you believe that your copyrighted work has been copied and is accessible on NexaPlay in a way that constitutes copyright infringement, please submit a written notification including:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li>Identification of the copyrighted work claimed to have been infringed.</li>
                <li>Identification of the material to be removed, including specific URLs or video identifiers.</li>
                <li>Your contact information (name, physical address, telephone number, and email address).</li>
                <li>A statement that you have a good faith belief that use of the material is not authorized.</li>
                <li>A statement under penalty of perjury that the information in the notification is accurate.</li>
                <li>A physical or electronic signature of the authorized copyright holder.</li>
              </ul>
              <p className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400">
                Designated Copyright Agent Email: <span className="text-rose-400 font-mono">dmca@nexaplay.io</span>
              </p>
            </div>
          ),
        };
      case "age-policy":
        return {
          title: "18 U.S.C. § 2257 Record-Keeping Compliance",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          body: (
            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                All visual depictions of actual or simulated adult content displayed on this website are produced and published in strict compliance with the record-keeping requirements of Title 18 U.S.C. § 2257 and 28 C.F.R. Part 75.
              </p>
              <h5 className="text-sm font-bold text-white">Custodian of Records</h5>
              <p>
                Records required to be maintained pursuant to 18 U.S.C. § 2257 for materials originating on or uploaded to this website are kept by the designated custodian of records. For third-party federated PeerTube instances, records are maintained by the originating producer/operator at the respective instance location.
              </p>
              <p>
                Zero Tolerance Policy: NexaPlay strictly prohibits the upload, storage, or distribution of non-consensual imagery, content depicting minors, or any illegal media. All violations result in instant permanent account ban and automated reporting to legal authorities.
              </p>
            </div>
          ),
        };
      case "removal":
        return {
          title: "Content Removal & Privacy Request",
          icon: <FileText className="w-5 h-5 text-rose-500" />,
          body: (
            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                If your image, personal likeness, or personal identifying data appears on NexaPlay without your explicit prior consent, you may request immediate expedited takedown under our Non-Consensual Imagery & Privacy Policy.
              </p>
              <p>
                Expedited removal requests are typically processed within 2 to 6 hours. You may submit the video link and brief confirmation to <span className="text-rose-400 font-mono">privacy@nexaplay.io</span> or use the in-player "Report" button on the video watch page.
              </p>
            </div>
          ),
        };
      case "privacy":
        return {
          title: "Privacy Policy",
          icon: <FileText className="w-5 h-5 text-zinc-400" />,
          body: (
            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                Your privacy is paramount. NexaPlay does not sell, rent, or trade your personal information. We collect minimal operational telemetry necessary to stream media, remember playback progress, and maintain security logs.
              </p>
              <p>
                Local storage is used to store your volume settings, theme preferences, and age verification confirmation without tracking across third-party networks.
              </p>
            </div>
          ),
        };
      case "guidelines":
        return {
          title: "Community Guidelines",
          icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
          body: (
            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                NexaPlay fosters an open, respectful, and safe creative environment. Creators and viewers agree to:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-zinc-400">
                <li>Respect consent, copyright, and creator licensing terms.</li>
                <li>Accurately tag and categorize all uploaded content.</li>
                <li>Engage constructively in discussions and comment threads.</li>
                <li>Avoid harassment, hate speech, spam, or malicious payloads.</li>
              </ul>
            </div>
          ),
        };
      case "terms":
      default:
        return {
          title: "Terms of Service",
          icon: <FileText className="w-5 h-5 text-zinc-400" />,
          body: (
            <div className="space-y-3 text-xs text-zinc-300 leading-relaxed">
              <p>
                By accessing or using NexaPlay, you agree to be bound by these Terms of Service. If you do not agree to all terms, you must discontinue using the platform immediately.
              </p>
              <p>
                Users are solely responsible for all video, audio, and text content uploaded or transmitted via their account. NexaPlay reserves the right to remove any content or restrict accounts violating platform safety rules.
              </p>
            </div>
          ),
        };
    }
  };

  const { title, icon, body } = getContent();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl max-h-[85vh] rounded-2xl bg-[#1c1c1c] border border-zinc-800 p-6 shadow-2xl flex flex-col space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-white font-bold text-base sm:text-lg">
            {icon}
            <span>{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {body}
        </div>

        <div className="pt-3 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
