import React, { useMemo } from "react";
import { BookOpen, AlertCircle, Users, Trophy, Camera, Sparkles, TrendingUp, Info } from "lucide-react";
import { Sticker } from "../types";

interface DashboardHomeProps {
  stickers: Sticker[];
  onNavigate: (tab: "dashboard" | "album" | "need" | "doubles" | "got" | "camera" | "share") => void;
  currentWackyFact: { fact: string; player: string; code: string };
}

export default function DashboardHome({
  stickers,
  onNavigate,
  currentWackyFact,
}: DashboardHomeProps) {
  // Compute counts
  const totalStickers = stickers.length;
  const ownedCount = stickers.filter((s) => s.ownedStatus === "owned").length;
  const needCount = totalStickers - ownedCount;
  const doublesCount = stickers.reduce((sum, s) => sum + s.doublesCount, 0);
  const percentComplete = totalStickers > 0 ? Math.round((ownedCount / totalStickers) * 100) : 0;

  // Coca-Cola specific sub-progress index
  const cokeStickers = stickers.filter(s => s.code === "CC");
  const ownedCoke = cokeStickers.filter(s => s.ownedStatus === "owned").length;
  const cokePercent = cokeStickers.length > 0 ? Math.round((ownedCoke / cokeStickers.length) * 105) : 0; // slight premium touch

  return (
    <div className="space-y-6 animate-fadeIn" id="dashboard-home-component">
      
      {/* 1. WELCOME PROGRESS OVERVIEW HEADER */}
      <div className="bg-gradient-to-br from-[#110626] to-[#05030a] border border-[#7c3aed]/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500 opacity-5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500 opacity-5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-3">
            <span className="inline-block text-[10px] bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 text-white font-black uppercase font-mono px-3.5 py-1.5 rounded-full tracking-wider shadow border border-white/10 mb-2">
              ⭐ 2026 World Cup Collector ⭐
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none uppercase">
              My World Cup Sticker Book! ⚽
            </h2>
            <p className="text-slate-200 text-sm max-w-xl">
              Hey there, Super Collector! Welcome to your very own magic sticker helper. Easily save, scan, and look at all <strong>48 qualified countries</strong>, shiny <strong>Legend Cards</strong>, and super fun <strong>Coca-Cola backsheets</strong>!
            </p>
          </div>

          {/* Animated kid-friendly progress scoreboard */}
          <div className="bg-black/45 rounded-3xl p-5 border border-purple-500/20 flex flex-col justify-center gap-4 shadow-inner min-w-[260px]">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] text-amber-300 font-mono font-black uppercase tracking-widest flex items-center gap-1">
                ⭐ Scoreboard ⭐
              </span>
              <span className="text-[10px] text-pink-300 font-mono font-bold uppercase p-0.5 bg-pink-950/60 rounded border border-pink-500/20">
                {percentComplete}% Done
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              {/* STICKERS GOT */}
              <div className="bg-[#0b0617] py-2 px-3 rounded-2xl border border-emerald-500/20">
                <span className="text-2xl font-black text-emerald-400 block animate-bounce">
                  🏆 {ownedCount}
                </span>
                <span className="text-[10px] text-slate-100 font-bold uppercase tracking-tight block leading-tight mt-0.5">
                  Got Already!
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  pasted inside
                </span>
              </div>

              {/* STICKERS REQUIRED */}
              <div className="bg-[#0b0617] py-2 px-3 rounded-2xl border border-pink-500/20">
                <span className="text-2xl font-black text-pink-400 block animate-pulse">
                  🔍 {needCount}
                </span>
                <span className="text-[10px] text-slate-100 font-bold uppercase tracking-tight block leading-tight mt-0.5">
                  Still Needed!
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  to finish book
                </span>
              </div>
            </div>

            {/* Total sticker capacity hint */}
            <div className="text-center text-[10px] text-slate-300 font-medium">
              Out of a grand total of <strong className="text-cyan-300 font-black">{totalStickers}</strong> stickers!
            </div>
          </div>
        </div>

        {/* Combined progress bar */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1.5 font-mono">
            <span>Overall Collection Index</span>
            <span className="text-amber-300 font-bold">{percentComplete}% Complete</span>
          </div>
          <div className="w-full bg-[#06030c] h-4 rounded-full overflow-hidden border border-purple-900/30 p-[1px] shadow-inner">
            <div
              className="bg-gradient-to-r from-emerald-400 via-pink-400 via-purple-400 to-amber-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 2. FIVE (5) DISTINCT DIRECT NAVIGATION BUTTONS/CARDS: LARGE, COLORFUL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5" id="dashboard-navigation-bento-grid">
        
        {/* BUTTON 1: THE ALBUM VIEW */}
        <button
          onClick={() => onNavigate("album")}
          className="group relative bg-[#061424] border-2 border-cyan-500/25 hover:border-cyan-405 rounded-3xl p-6 text-left transition-all duration-300 flex flex-col justify-between min-h-[230px] hover:-translate-y-1.5 shadow-[0_8px_32px_rgba(6,182,212,0.06)] hover:shadow-cyan-500/20 cursor-pointer"
        >
          <div className="bg-cyan-500/10 text-cyan-300 p-4 rounded-2xl w-fit shadow-md group-hover:scale-110 transition-transform border border-cyan-400/20">
            <BookOpen className="w-6 h-6 animate-pulse text-cyan-300" />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors uppercase tracking-tight flex items-center gap-1.5 leading-none">
              📔 Sticker Book
            </h3>
            <p className="text-xs text-cyan-100/80 leading-tight mt-2.5 font-medium">
              Flip through the pages of your stickers! View countries, golden trophies &amp; star logos!
            </p>
          </div>
          <div className="absolute top-4 right-4 bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            📖 51 Pages
          </div>
        </button>

        {/* BUTTON 2: SEPARATE NEED SECTION */}
        <button
          onClick={() => onNavigate("need")}
          className="group relative bg-[#1f0511] border-2 border-pink-500/25 hover:border-pink-405 rounded-3xl p-6 text-left transition-all duration-300 flex flex-col justify-between min-h-[230px] hover:-translate-y-1.5 shadow-[0_8px_32px_rgba(236,72,153,0.06)] hover:shadow-pink-500/20 cursor-pointer"
        >
          <div className="bg-pink-500/10 text-pink-300 p-4 rounded-2xl w-fit shadow-md group-hover:scale-110 transition-transform border border-pink-500/20">
            <AlertCircle className="w-6 h-6 text-pink-300" />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black text-white group-hover:text-pink-300 transition-colors uppercase tracking-tight leading-none">
              📋 Missing List
            </h3>
            <p className="text-xs text-pink-100/80 leading-tight mt-2.5 font-medium">
              Instantly view every single number you need! Check them off dynamically to fill the gap.
            </p>
          </div>
          <div className="absolute top-4 right-4 bg-pink-950/80 border border-pink-500/30 text-pink-300 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            🚨 {needCount} Left
          </div>
        </button>

        {/* BUTTON 3: SEPARATE 'GOT' SECTION */}
        <button
          onClick={() => onNavigate("got")}
          className="group relative bg-[#041a0d] border-2 border-emerald-500/25 hover:border-emerald-405 rounded-3xl p-6 text-left transition-all duration-300 flex flex-col justify-between min-h-[230px] hover:-translate-y-1.5 shadow-[0_8px_32px_rgba(16,185,129,0.06)] hover:shadow-emerald-500/20 cursor-pointer"
        >
          <div className="bg-emerald-500/10 text-emerald-300 p-4 rounded-2xl w-fit shadow-md group-hover:scale-110 transition-transform border border-emerald-500/25">
            <Trophy className="w-6 h-6 text-emerald-400 animate-bounce" />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition-colors uppercase tracking-tight leading-none">
              🏆 Acquired Deck
            </h3>
            <p className="text-xs text-emerald-100/80 leading-tight mt-2.5 font-medium">
              Behold the absolute stars in your sticker collection! Play, count, and admire your physical trophies!
            </p>
          </div>
          <div className="absolute top-4 right-4 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            💎 {ownedCount} Got
          </div>
        </button>

        {/* BUTTON 4: SEPARATE DOUBLES SECTION */}
        <button
          onClick={() => onNavigate("doubles")}
          className="group relative bg-[#1c1202] border-2 border-amber-500/25 hover:border-amber-405 rounded-3xl p-6 text-left transition-all duration-300 flex flex-col justify-between min-h-[230px] hover:-translate-y-1.5 shadow-[0_8px_32px_rgba(245,158,11,0.06)] hover:shadow-amber-500/20 cursor-pointer"
        >
          <div className="bg-amber-500/10 text-amber-300 p-4 rounded-2xl w-fit shadow-md group-hover:scale-110 transition-transform border border-amber-500/20">
            <Users className="w-6 h-6 text-amber-400" />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors uppercase tracking-tight leading-none">
              🔄 Trade Swaps
            </h3>
            <p className="text-xs text-amber-100/80 leading-tight mt-2.5 font-medium">
              Log duplicates you have. Share trade-codes during recess or with family to complete the album!
            </p>
          </div>
          <div className="absolute top-4 right-4 bg-amber-950/80 border border-amber-500/30 text-amber-300 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            🔥 {doublesCount} Swaps
          </div>
        </button>

        {/* BUTTON 5: ADD STICKERS CAMERA SCREEN */}
        <button
          onClick={() => onNavigate("camera")}
          className="group relative bg-[#130626] border-2 border-purple-500/25 hover:border-purple-405 rounded-3xl p-6 text-left transition-all duration-300 flex flex-col justify-between min-h-[230px] hover:-translate-y-1.5 shadow-[0_8px_32px_rgba(168,85,247,0.06)] hover:shadow-purple-500/20 cursor-pointer"
        >
          <div className="bg-purple-500/15 text-purple-300 p-4 rounded-2xl w-fit shadow-md group-hover:scale-110 transition-transform border border-purple-500/25">
            <Camera className="w-6 h-6 text-purple-300" />
          </div>
          <div className="mt-4">
            <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition-colors uppercase tracking-tight flex items-center gap-1.5 leading-none">
              📷 Premium AI Scan
            </h3>
            <p className="text-xs text-purple-100/80 leading-tight mt-2.5 font-medium">
              Detect stickers using your mobile phone camera! Let the smart AI do the sorting instantly!
            </p>
          </div>
          <div className="absolute top-4 right-4 bg-purple-950/80 border border-purple-500/30 text-purple-300 text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full">
            ✨ Camera AI
          </div>
        </button>

      </div>

      {/* 3. ADDITIONAL DETAILS: STATS WIDGETS AND COKE COLA PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* WACKY FACT PANEL */}
        <div className="bg-[#110526] border-2 border-purple-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden" id="dashboard-fact-card">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>
          <div className="flex items-center gap-1.5 text-xs text-pink-400 uppercase font-mono tracking-widest font-black mb-3">
            <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
            <span>★ Live Star Fact ★</span>
          </div>
          <p className="text-sm text-slate-100 font-medium leading-relaxed italic">
            "{currentWackyFact.fact}"
          </p>
          <p className="text-right text-[10px] font-black text-pink-400 mt-4 uppercase font-mono tracking-wider">
            — {currentWackyFact.player} ({currentWackyFact.code})
          </p>
        </div>

        {/* COCA COLA SECTION PREMIUM CARD */}
        <div className="bg-[#240307] border-2 border-red-500/25 rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-650 opacity-10 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[9px] bg-red-950/80 text-red-300 font-black px-3 py-1 rounded-full uppercase tracking-widest font-mono border border-red-500/20">
                Coca-Cola Back cover
              </span>
              <span className="text-red-405 text-base">🥤</span>
            </div>
            <h4 className="text-base font-black text-white uppercase tracking-tight">🥤 Exclusive Back pocket</h4>
            <p className="text-xs text-rose-100/80 leading-relaxed mt-2 font-medium">
              Log custom fan slots (CC 1 to CC 8) to fully complete your back page red sticker collection!
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-red-500/15 flex items-center justify-between text-[11px] font-mono font-bold text-rose-300">
            <span>Progress: {ownedCoke} / 8 slots filled</span>
            <span className="text-amber-400 font-extrabold">{Math.min(100, Math.round((ownedCoke / 8) * 100))}% Completed</span>
          </div>
        </div>

        {/* TRADING ETHICS CARD */}
        <div className="bg-[#051111]/90 border-2 border-emerald-500/20 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono font-black uppercase tracking-wider mb-2.5">
              <Info className="w-4 h-4 text-emerald-400" />
              <span>🤝 Friendly Collector Pact</span>
            </div>
            <p className="text-xs text-slate-200/90 leading-relaxed font-medium">
              Trading duplicate stickers with your school classmates, local club mates, or family is the true joy of football! Meet up, open your duplicate sets, trade fairly, and complete the magical book together!
            </p>
          </div>
          <span className="text-[10px] text-emerald-400 mt-4 uppercase block font-mono font-black tracking-wider text-center">
            ★ Trade fairly • Share duplicates ⚽ ★
          </span>
        </div>

      </div>

    </div>
  );
}
