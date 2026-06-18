import React, { useState } from "react";
import { CheckCircle2, Sparkles, Plus, Minus, Shield, User } from "lucide-react";
import { Sticker } from "../types";

interface StickerCardProps {
  sticker: Sticker;
  onToggleSticker: (id: string) => void;
  onIncrementDouble?: (id: string) => void;
  onDecrementDouble?: (id: string) => void;
  showDoublesControl?: boolean;
}

// Deterministic image provider with athletic keywords
export const getStickerImage = (code: string, number: number, name: string): string => {
  if (code === "FWC") {
    if (number === 1) return "https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&w=250&q=80"; // Trophy vibe
    if (number === 3) return "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=250&q=80"; // Stadium lights
    return `https://images.unsplash.com/photo-1543351611-58f69d7c1781?auto=format&fit=crop&w=250&q=80`; // Soccer ball close-up
  }
  if (code === "CC") {
    // Red thematic visuals
    return `https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=250&q=80`; // Glitzy splash
  }
  if (number === 1) {
    // Team badge: render beautiful epic stadium view
    return `https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=250&q=80`;
  }
  // Default player portrait
  return `https://picsum.photos/seed/${encodeURIComponent(name)}/180/180`;
};

export default function StickerCard({
  sticker,
  onToggleSticker,
  onIncrementDouble,
  onDecrementDouble,
  showDoublesControl = true,
}: StickerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isOwned = sticker.ownedStatus === "owned";
  const imageUrl = getStickerImage(sticker.code, sticker.number, sticker.name);

  // Determine background/border styling based on section
  const isCoke = sticker.code === "CC";
  const isSpecial = sticker.code === "FWC";

  let borderClasses = "";
  if (isOwned) {
    if (isCoke) {
      borderClasses = "border-red-500 shadow-lg shadow-red-500/10 bg-gradient-to-br from-[#400d0d] to-[#1a0505]";
    } else if (isSpecial) {
      borderClasses = "border-amber-400 shadow-lg shadow-amber-500/10 bg-gradient-to-br from-[#3b2a09] to-[#120d04]";
    } else {
      borderClasses = "border-sky-500/50 shadow-md shadow-sky-500/5 bg-gradient-to-br from-[#0c3975] to-[#13498f]";
    }
  } else {
    borderClasses = "bg-[#0b1c36] border-slate-800 text-slate-400 hover:border-slate-700";
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative rounded-2xl p-3 flex flex-col justify-between h-[310px] transition-all duration-300 border ${borderClasses}`}
      id={`sticker-card-${sticker.id}`}
    >
      {/* 1. Header Portion */}
      <div className="flex items-center justify-between mb-1.5 shrink-0">
        <div className="flex items-center gap-1">
          <span className={`text-[9px] font-mono font-black tracking-wider px-2 py-0.5 rounded-full ${
            isCoke ? "bg-red-600 text-white" : isSpecial ? "bg-amber-400 text-black" : "bg-black/40 text-slate-200"
          }`}>
            {sticker.id}
          </span>
          {isCoke && <span className="text-[9px] text-red-400 font-bold tracking-wider font-mono">COKE</span>}
          {isSpecial && <span className="text-[9px] text-amber-300 font-bold tracking-wider font-mono">LEGEND</span>}
        </div>

        {/* Got Stamp / Double Counter */}
        {isOwned && (
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <CheckCircle2 className={`w-3.5 h-3.5 ${isCoke ? "text-red-400" : isSpecial ? "text-amber-400" : "text-sky-400"}`} />
            {sticker.doublesCount > 0 && (
              <span className="bg-amber-400 text-black text-[9px] font-mono font-black px-1.5 py-0.5 rounded-full border border-yellow-300 shadow leading-none">
                +{sticker.doublesCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 2. Visual Content Portion (Using player and team pictures!) */}
      <div className="relative flex-1 rounded-xl overflow-hidden bg-black/25 border border-slate-700/30 flex items-center justify-center mb-2.5">
        {isOwned ? (
          <img
            src={imageUrl}
            alt={sticker.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-3 text-center text-slate-500/70 select-none">
            {sticker.number === 1 ? (
              <>
                <Shield className="w-8 h-8 text-slate-600 mb-1.5" />
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase font-mono">LOGO MISSING! 🛡️</span>
              </>
            ) : (
              <>
                <User className="w-8 h-8 text-slate-600 mb-1.5" />
                <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase font-mono">STICK PLAYER HERE ⚽</span>
              </>
            )}
          </div>
        )}

        {/* Holographic reflection highlight if owned */}
        {isOwned && (
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none mix-blend-overlay opacity-60" />
        )}
      </div>

      {/* 3. Identity and Information */}
      <div className="mb-2 shrink-0 select-none">
        <p className={`text-xs font-extrabold tracking-tight leading-tight truncate ${isOwned ? "text-white" : "text-slate-400"}`}>
          {sticker.name}
        </p>
        <p className="text-[10px] text-slate-500 font-semibold tracking-wide mt-0.5 uppercase">
          {sticker.number === 1 ? "🛡️ Official Crest" : "⚽ Player Sticker"} #{sticker.number}
        </p>
      </div>

      {/* 4. Action Controls */}
      <div className="space-y-1.5 shrink-0">
        <button
          onClick={() => onToggleSticker(sticker.id)}
          className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold font-mono transition-colors border ${
            isOwned
              ? isCoke
                ? "bg-red-600 hover:bg-red-700 text-white border-red-500"
                : isSpecial
                ? "bg-amber-400 hover:bg-amber-500 text-black border-amber-300"
                : "bg-sky-500 hover:bg-sky-600 text-white border-sky-400"
              : "bg-transparent hover:bg-white/5 text-slate-300 border-[#1e4d8e]"
          }`}
        >
          {isOwned ? "🎉 Got It! Check!" : "➕ I Found This! ⚽"}
        </button>

        {/* Swap counters layout */}
        {isOwned && showDoublesControl && onIncrementDouble && onDecrementDouble && (
          <div className="flex items-center justify-between bg-black/40 rounded-xl p-0.5 border border-[#1e4d8e]/40">
            <button
              onClick={() => onDecrementDouble(sticker.id)}
              className="p-1 hover:text-white transition-colors"
              title="Subtract Trade Copy"
            >
              <Minus className="w-3 h-3 text-slate-400" />
            </button>
            <span className="text-[9px] font-black font-mono text-amber-300">
              {sticker.doublesCount} Double{sticker.doublesCount !== 1 ? "s" : ""}
            </span>
            <button
              onClick={() => onIncrementDouble(sticker.id)}
              className="p-1 hover:text-white transition-colors"
              title="Add Trade Copy"
            >
              <Plus className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      {/* 5. Fact Popup Overlay */}
      {isHovered && sticker.fact && (
        <div className="absolute inset-x-2 -top-16 z-30 bg-slate-900 border border-amber-400/30 text-white rounded-xl p-2.5 text-[10px] leading-relaxed shadow-2xl transition-all">
          <div className="flex items-center gap-1 font-bold text-amber-300 mb-0.5">
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Fact Check:</span>
          </div>
          <p className="text-slate-200 font-sans">{sticker.fact}</p>
        </div>
      )}
    </div>
  );
}
