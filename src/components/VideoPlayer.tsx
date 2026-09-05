import React, { useRef, useState, useEffect } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Settings,
  Tv,
  Check
} from "lucide-react";
import { formatDuration } from "../utils/formatters";

interface VideoPlayerProps {
  playbackUrl: string;
  hlsManifestUrl?: string;
  posterUrl: string;
  title: string;
  initialTime?: number;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  autoplay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  playbackUrl,
  hlsManifestUrl,
  posterUrl,
  title,
  initialTime = 0,
  onEnded,
  onTimeUpdate,
  autoplay = true,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialTimeApplied = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedQuality, setSelectedQuality] = useState("1080p");
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize HLS if available and supported, otherwise use native video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const streamSource = hlsManifestUrl || playbackUrl;
    initialTimeApplied.current = false;

    if (hlsManifestUrl && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(hlsManifestUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoplay) {
          video.play().catch(() => setIsPlaying(false));
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          // Fallback to direct MP4 URL if HLS error occurs
          video.src = playbackUrl;
          if (autoplay) video.play().catch(() => setIsPlaying(false));
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native Safari HLS
      video.src = streamSource;
      if (autoplay) video.play().catch(() => setIsPlaying(false));
    } else {
      video.src = playbackUrl;
      if (autoplay) video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [playbackUrl, hlsManifestUrl, autoplay]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onTimeUpdate) {
        onTimeUpdate(video.currentTime, video.duration || 0);
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      video.volume = volume;
      if (!initialTimeApplied.current && initialTime > 0 && initialTime < (video.duration || 0) - 2) {
        video.currentTime = initialTime;
        initialTimeApplied.current = true;
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [onEnded, onTimeUpdate, volume]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in input or textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;

      const video = videoRef.current;
      if (!video) return;

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "KeyK") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute();
      } else if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        seekDelta(-5);
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        seekDelta(5);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isMuted]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    if (newVol === 0) {
      setIsMuted(true);
      video.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      video.muted = false;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const seekDelta = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(0, video.currentTime + seconds), video.duration || 0);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const togglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      // ignore
    }
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      id="main-video-player"
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group select-none ring-1 ring-zinc-800"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        poster={posterUrl}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Center Big Play Button (when paused) */}
      {!isPlaying && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs cursor-pointer"
          onClick={togglePlay}
        >
          <button
            type="button"
            className="w-18 h-18 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-rose-500 transition-all pl-1 ring-4 ring-rose-500/30"
            aria-label="Play video"
          >
            <Play className="w-8 h-8 fill-current" />
          </button>
        </div>
      )}

      {/* Top Title Overlay (subtle on hover) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-base md:text-lg font-semibold text-white drop-shadow-md truncate">
          {title}
        </h2>
      </div>

      {/* Controls Overlay */}
      <div
        className={`absolute bottom-0 left-0 right-0 pt-10 pb-3 px-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 flex flex-col gap-2 ${
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Progress Slider */}
        <div className="relative group/bar flex items-center">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 hover:h-2.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-rose-500 transition-all"
            style={{
              background: `linear-gradient(to right, #e11d48 ${progressPercent}%, #3f3f46 ${progressPercent}%)`,
            }}
          />
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-zinc-200">
          {/* Left Controls */}
          <div className="flex items-center gap-3 md:gap-4">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 hover:text-rose-400 transition-colors"
              title={isPlaying ? "Pause (k/space)" : "Play (k/space)"}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              type="button"
              onClick={() => seekDelta(-10)}
              className="p-1 text-zinc-400 hover:text-white transition-colors hidden sm:block"
              title="Replay 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => seekDelta(10)}
              className="p-1 text-zinc-400 hover:text-white transition-colors hidden sm:block"
              title="Forward 10 seconds"
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 group/vol">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 hover:text-rose-400 transition-colors"
                title="Mute (m)"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-500" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-14 sm:w-20 h-1 bg-zinc-600 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>

            {/* Time display */}
            <div className="text-xs font-mono text-zinc-300">
              <span>{formatDuration(currentTime)}</span>
              <span className="text-zinc-500 mx-1">/</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Speed & Quality Settings Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1 hover:text-rose-400 transition-colors ${showSettings ? "text-rose-500" : ""}`}
                title="Playback Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettings && (
                <div className="absolute right-0 bottom-9 w-48 rounded-xl bg-[#1e1e1e] border border-zinc-700 shadow-2xl p-3 text-xs space-y-3 z-30">
                  <div>
                    <div className="font-semibold text-zinc-400 mb-1.5 uppercase text-[10px] tracking-wider">
                      Playback Speed
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() => changePlaybackRate(rate)}
                          className={`px-2 py-1 rounded text-center transition-colors ${
                            playbackRate === rate ? "bg-rose-600 text-white font-bold" : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-zinc-800 pt-2">
                    <div className="font-semibold text-zinc-400 mb-1.5 uppercase text-[10px] tracking-wider">
                      Resolution
                    </div>
                    {["1080p", "720p", "480p", "Auto"].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          setSelectedQuality(q);
                          setShowSettings(false);
                        }}
                        className="w-full flex items-center justify-between py-1 px-1.5 rounded hover:bg-zinc-800 text-zinc-200"
                      >
                        <span>{q}</span>
                        {selectedQuality === q && <Check className="w-3.5 h-3.5 text-rose-500" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Picture-in-Picture */}
            <button
              type="button"
              onClick={togglePiP}
              className="p-1 text-zinc-400 hover:text-white transition-colors hidden sm:block"
              title="Picture in Picture"
            >
              <Tv className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 hover:text-rose-400 transition-colors"
              title="Fullscreen (f)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
