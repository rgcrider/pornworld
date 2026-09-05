import React from "react";
import { Category } from "../types";
import {
  Flame,
  Heart,
  Users,
  User,
  ShieldAlert,
  Sparkles,
  HeartHandshake,
  Globe,
  Star,
  Tv,
  Coffee,
  Folder
} from "lucide-react";
import { formatCount } from "../utils/formatters";

interface CategoryMenuProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (categoryName: string) => void;
  variant?: "chips" | "cards";
}

export const CategoryMenu: React.FC<CategoryMenuProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  variant = "chips",
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "flame":
        return <Flame className="w-4 h-4 text-rose-500" />;
      case "heart":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "users":
        return <Users className="w-4 h-4 text-purple-400" />;
      case "user":
        return <User className="w-4 h-4 text-sky-400" />;
      case "shieldalert":
        return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case "sparkles":
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case "hearthandshake":
        return <HeartHandshake className="w-4 h-4 text-rose-400" />;
      case "globe":
        return <Globe className="w-4 h-4 text-emerald-400" />;
      case "star":
        return <Star className="w-4 h-4 text-yellow-400" />;
      case "tv":
        return <Tv className="w-4 h-4 text-indigo-400" />;
      case "coffee":
        return <Coffee className="w-4 h-4 text-orange-400" />;
      default:
        return <Folder className="w-4 h-4 text-zinc-400" />;
    }
  };

  if (variant === "chips") {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
        <button
          type="button"
          onClick={() => onSelectCategory("All")}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
            !selectedCategory || selectedCategory === "All"
              ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40"
              : "bg-[#1c1c1c] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
          }`}
        >
          <span>All Videos</span>
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.name)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                isSelected
                  ? "bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/40"
                  : "bg-[#1c1c1c] text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-white"
              }`}
            >
              {getIcon(cat.icon)}
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Cards Variant (Full visual cards grid for Categories Page)
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
      {categories.map((cat) => (
        <div
          key={cat.id}
          onClick={() => onSelectCategory(cat.name)}
          className="group relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer border border-zinc-800 hover:border-rose-500/80 transition-all duration-300 shadow-lg shadow-black/40"
        >
          {/* Background image */}
          <img
            src={cat.thumbnail}
            alt={cat.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-65 group-hover:opacity-80"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

          {/* Content centered & bottom */}
          <div className="absolute inset-0 p-4 flex flex-col justify-end items-center text-center space-y-1">
            <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-xs border border-white/10 flex items-center justify-center mb-1 group-hover:scale-110 transition-transform">
              {getIcon(cat.icon)}
            </div>
            <h3 className="text-base font-bold text-white tracking-wide group-hover:text-rose-400 transition-colors">
              {cat.name}
            </h3>
            <p className="text-xs text-zinc-400 font-medium">
              {formatCount(cat.videoCount)} videos
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
