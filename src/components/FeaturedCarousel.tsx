import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Video } from "../types";
import { formatDuration, formatViews } from "../utils/formatters";
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  Sparkles,
  Flame,
  Clock,
  CheckCircle,
  Eye,
  ThumbsUp,
  Tag as TagIcon
} from "lucide-react";

interface FeaturedCarouselProps {
  videos: Video[];
  onSelectVideo: (video: Video) => void;
  onSaveToPlaylist: (video: Video) => void;
  onShare: (video: Video) => void;
  onSelectCategory?: (category: string) => void;
  onNavigate?: (view: string, param?: string) => void;
}

const SLIDE_DURATION_MS = 6500;

export const FeaturedCarousel: React.FC<FeaturedCarouselProps> = ({
  videos,
  onSelectVideo,
  onSaveToPlaylist,
  onShare,
  onSelectCategory,
  onNavigate,
}) => {
  // Select highlighted, high-engagement videos (featured videos first, supplemented by highest view counts)
  const featuredList = React.useMemo(() => {
    if (!videos || videos.length === 0) return [];

    // Distinct list of featured videos or top engagement
    const explicitlyFeatured = videos.filter((v) => v.isFeatured);
    const topEngaged = [...videos].sort((a, b) => {
      const scoreA = (a.viewsCount || 0) * 0.6 + (a.likesCount || 0) * 2 + (a.ratingScore || 0) * 10000;
      const scoreB = (b.viewsCount || 0) * 0.6 + (b.likesCount || 0) * 2 + (b.ratingScore || 0) * 10000;
      return scoreB - scoreA;
    });

    const combined: Video[] = [...explicitlyFeatured];
    for (const v of topEngaged) {
      if (!combined.some((item) => item.id === v.id)) {
        combined.push(v);
      }
      if (combined.length >= 5) break;
    }

    return combined.slice(0, 5);
  }, [videos]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1 = next, -1 = prev
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const totalSlides = featuredList.length;

  const goToSlide = useCallback((newIndex: number, newDirection: number = 1) => {
    setDirection(newDirection);
    setCurrentIndex(newIndex);
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    goToSlide((currentIndex + 1) % totalSlides, 1);
  }, [currentIndex, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    goToSlide((currentIndex - 1 + totalSlides) % totalSlides, -1);
  }, [currentIndex, totalSlides, goToSlide]);

  // Smooth progress bar and auto-advance timer
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now() - (progress / 100) * SLIDE_DURATION_MS;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min(100, (elapsed / SLIDE_DURATION_MS) * 100);
      setProgress(pct);

      if (elapsed >= SLIDE_DURATION_MS) {
        nextSlide();
      }
    }, 50);

    progressIntervalRef.current = interval;

    return () => {
      clearInterval(interval);
      progressIntervalRef.current = null;
    };
  }, [totalSlides, isPaused, nextSlide, progress]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    } else if (e.key === " " || e.key === "Spacebar") {
      e.preventDefault();
      setIsPaused((p) => !p);
    }
  };

  if (featuredList.length === 0) {
    return null;
  }

  const currentVideo = featuredList[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? 80 : -80,
      scale: 0.98,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (dir: number) => ({
      opacity: 0,
      x: dir > 0 ? -80 : 80,
      scale: 0.98,
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <div
      id="featured-carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full rounded-2xl overflow-hidden border border-zinc-800 bg-[#0f0f10] shadow-2xl group focus:outline-none focus:ring-2 focus:ring-rose-500/30"
      aria-label="Featured Videos Carousel"
      aria-roledescription="carousel"
    >
      {/* Slide Container */}
      <div className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] lg:h-[500px] overflow-hidden">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentVideo.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full"
          >
            {/* Backdrop Image with Parallax Glow */}
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={currentVideo.thumbnailUrl}
                alt={currentVideo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center filter brightness-[0.75] contrast-[1.05] scale-105 transition-transform duration-7000 ease-out group-hover:scale-100"
              />
            </div>

            {/* Gradient Overlays for Readability & Depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/75 to-transparent sm:w-4/5" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-black/50 to-transparent pointer-events-none" />

            {/* Content Layer */}
            <div className="relative z-10 h-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col justify-end pb-8 sm:pb-12 pt-16">
              <div className="max-w-2xl sm:max-w-3xl space-y-3.5">
                {/* Spotlight Badge & Metadata row */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-[11px] shadow-lg shadow-rose-950/60 uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Featured Spotlight</span>
                  </div>

                  {currentVideo.isHD && (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-700/80 text-[10px] font-extrabold text-rose-400 font-mono tracking-wider">
                      4K • 60FPS
                    </span>
                  )}

                  {currentVideo.category && (
                    <button
                      type="button"
                      onClick={() => onSelectCategory && onSelectCategory(currentVideo.category)}
                      className="px-2.5 py-0.5 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors text-xs font-medium cursor-pointer"
                    >
                      {currentVideo.category}
                    </button>
                  )}

                  <div className="flex items-center gap-3 text-zinc-400 text-xs font-medium pl-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      {formatDuration(currentVideo.duration)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-zinc-400" />
                      {formatViews(currentVideo.viewsCount)} views
                    </span>
                    {currentVideo.likesCount > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-rose-400" />
                          {formatViews(currentVideo.likesCount)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Big Title */}
                <h2
                  id={`featured-title-${currentVideo.id}`}
                  onClick={() => onSelectVideo(currentVideo)}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight cursor-pointer hover:text-rose-400 transition-colors line-clamp-2 drop-shadow-md"
                >
                  {currentVideo.title}
                </h2>

                {/* Video Description */}
                <p className="text-xs sm:text-sm md:text-base text-zinc-300 line-clamp-2 max-w-2xl leading-relaxed font-normal">
                  {currentVideo.description ||
                    "Stream high-definition videos with adaptive multi-bitrate HLS, verified creator credentials, and community engagement."}
                </p>

                {/* Creator Channel Snippet */}
                {currentVideo.creator && (
                  <div
                    onClick={() => {
                      if (onNavigate) {
                        onNavigate("creator-dashboard");
                      }
                    }}
                    className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/90 transition-colors cursor-pointer group/creator"
                  >
                    <img
                      src={currentVideo.creator.avatarUrl}
                      alt={currentVideo.creator.channelName}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover border border-zinc-700"
                    />
                    <div className="flex items-center gap-1.5 text-xs text-zinc-200 group-hover/creator:text-white">
                      <span className="font-semibold">{currentVideo.creator.channelName}</span>
                      {currentVideo.creator.isVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20" />
                      )}
                    </div>
                    {currentVideo.creator.subscribersCount > 0 && (
                      <span className="text-[11px] text-zinc-500 font-normal">
                        {formatViews(currentVideo.creator.subscribersCount)} subs
                      </span>
                    )}
                  </div>
                )}

                {/* Interactive CTA Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2 sm:pt-3">
                  {/* Primary CTA: Watch Now */}
                  <button
                    id="featured-watch-btn"
                    type="button"
                    onClick={() => onSelectVideo(currentVideo)}
                    className="px-6 sm:px-8 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-rose-950/60 flex items-center gap-2.5 transition-all transform active:scale-95 cursor-pointer group/btn"
                  >
                    <Play className="w-5 h-5 fill-current group-hover/btn:scale-110 transition-transform" />
                    <span>Watch Now</span>
                  </button>

                  {/* Secondary CTA: Save to Playlist */}
                  <button
                    id="featured-save-btn"
                    type="button"
                    onClick={() => onSaveToPlaylist(currentVideo)}
                    className="px-4 sm:px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs sm:text-sm border border-zinc-700/80 transition-all flex items-center gap-2 shadow-md cursor-pointer hover:border-zinc-600 active:scale-95"
                    title="Add to Playlist"
                  >
                    <Bookmark className="w-4 h-4 text-rose-400" />
                    <span className="hidden xs:inline">Save</span>
                  </button>

                  {/* Secondary CTA: Share */}
                  <button
                    id="featured-share-btn"
                    type="button"
                    onClick={() => onShare(currentVideo)}
                    className="px-4 sm:px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white font-semibold text-xs sm:text-sm border border-zinc-700/80 transition-all flex items-center gap-2 shadow-md cursor-pointer hover:border-zinc-600 active:scale-95"
                    title="Share Video"
                  >
                    <Share2 className="w-4 h-4 text-zinc-400" />
                    <span className="hidden xs:inline">Share</span>
                  </button>

                  {/* Tags Pill Row */}
                  {Array.isArray(currentVideo.tags) && currentVideo.tags.length > 0 && (
                    <div className="hidden md:flex items-center gap-1.5 ml-2">
                      {currentVideo.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full bg-zinc-900/60 border border-zinc-800 text-[10px] font-medium text-zinc-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next Controls (Floating on desktop, always accessible) */}
        <button
          id="featured-carousel-prev-btn"
          type="button"
          onClick={prevSlide}
          aria-label="Previous featured video"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-rose-600 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 -ml-0.5" />
        </button>

        <button
          id="featured-carousel-next-btn"
          type="button"
          onClick={nextSlide}
          aria-label="Next featured video"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-rose-600 border border-white/15 text-white flex items-center justify-center backdrop-blur-md transition-all opacity-80 hover:opacity-100 hover:scale-110 shadow-lg cursor-pointer"
        >
          <ChevronRight className="w-6 h-6 ml-0.5" />
        </button>

        {/* Auto-play Pause/Play Indicator button */}
        <button
          id="featured-carousel-pause-toggle"
          type="button"
          onClick={() => setIsPaused((p) => !p)}
          aria-label={isPaused ? "Resume auto-play" : "Pause auto-play"}
          className="absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 border border-white/15 text-zinc-300 hover:text-white backdrop-blur-md text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          {isPaused ? (
            <>
              <Play className="w-3 h-3 fill-current text-rose-500" />
              <span>Resume</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 fill-current text-zinc-400" />
              <span>Auto-Play</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom Thumbnail Strip / Indicator Navigation */}
      <div className="relative z-10 bg-zinc-950/95 border-t border-zinc-800/90 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Slide Progress / Thumbnails */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-0.5 flex-1">
          {featuredList.map((video, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={video.id}
                id={`carousel-indicator-${idx}`}
                type="button"
                onClick={() => goToSlide(idx, idx > currentIndex ? 1 : -1)}
                className={`relative flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl transition-all cursor-pointer text-left shrink-0 ${
                  isActive
                    ? "bg-zinc-800/90 border border-rose-500/50 shadow-md ring-1 ring-rose-500/30"
                    : "hover:bg-zinc-900 border border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {/* Mini thumbnail */}
                <div className="relative w-10 h-7 rounded-md overflow-hidden bg-zinc-800 shrink-0 border border-zinc-700/60">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-rose-600/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    </div>
                  )}
                </div>

                {/* Title Snippet */}
                <div className="max-w-[120px] sm:max-w-[150px] truncate hidden sm:block">
                  <div
                    className={`text-[11px] font-semibold truncate ${
                      isActive ? "text-white" : "text-zinc-400"
                    }`}
                  >
                    {video.title}
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate">
                    {video.creator ? video.creator.channelName : video.category}
                  </div>
                </div>

                {/* Progress bar under active item */}
                {isActive && !isPaused && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-700 rounded-b-xl overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-75 ease-linear"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Slide Counter */}
        <div className="shrink-0 text-xs font-mono text-zinc-400 flex items-center gap-1.5 bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
          <span className="font-bold text-white">{currentIndex + 1}</span>
          <span className="text-zinc-600">/</span>
          <span>{totalSlides}</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCarousel;
