import React, { useMemo } from "react";
import { TrendingUp, Sparkles, BookOpen, Layers, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { Sticker } from "../types";

interface StatisticsPanelProps {
  stickers: Sticker[];
}

export default function StatisticsPanel({ stickers }: StatisticsPanelProps) {
  // Compute standard metrics
  const stats = useMemo(() => {
    const total = stickers.length;
    const ownedUnique = stickers.filter((s) => s.ownedStatus === "owned").length;
    const neededUnique = total - ownedUnique;
    
    // Sum of all duplicates (count > 0)
    const totalDoubles = stickers.reduce((acc, s) => acc + s.doublesCount, 0);
    
    // Completion percentage
    const progressPercent = total > 0 ? Math.round((ownedUnique / total) * 100) : 0;

    // --- Coupon Collector expected value calculation ---
    // If we have 'ownedUnique' stickers, the expected number of single purchases to get
    // all remaining 'neededUnique' stickers from random packs is:
    // E(buy) = N/N + N/(N-1) + ... + N/1
    // For the remaining needed stickers, we sum from j = ownedUnique to N-1 of N / (N - j)
    let expectedStickersToBuy = 0;
    for (let j = ownedUnique; j < total; j++) {
      expectedStickersToBuy += total / (total - j);
    }

    // Since each physical pack contains 7 random stickers, dividing by 7 gives expected packs:
    const expectedPacks = total > 0 && neededUnique > 0 ? Math.ceil(expectedStickersToBuy / 7) : 0;

    // Odds of a duplicate in the NEXT sticker we get:
    // P(duplicate) = ownedUnique / total
    const nextDuplicateProbability = total > 0 ? Math.round((ownedUnique / total) * 100) : 0;

    return {
      total,
      ownedUnique,
      neededUnique,
      totalDoubles,
      progressPercent,
      expectedPacks,
      nextDuplicateProbability,
      expectedStickersToBuy: Math.round(expectedStickersToBuy)
    };
  }, [stickers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="dashboard-statistics-grid">
      
      {/* Percentage Progress Banner */}
      <div className="bg-gradient-to-br from-[#041a0d] via-[#08080d] to-[#010905] border-2 border-emerald-500/30 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-extrabold font-mono flex items-center gap-1">
              🏆 MY ALBUM PROGRESS INDEX
            </span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight text-white font-sans animate-bounce">
              {stats.progressPercent}%
            </span>
            <span className="text-[11px] text-slate-300 font-medium">
              ({stats.ownedUnique} / {stats.total} inside!)
            </span>
          </div>
        </div>

        <div className="mt-5 space-y-2.5">
          {/* Progress bar container */}
          <div className="w-full bg-black/45 h-3.5 rounded-full overflow-hidden border border-emerald-500/20 p-[1px] shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.progressPercent}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full"
            />
          </div>
          <div className="flex justify-between text-[9px] uppercase font-mono text-emerald-400 font-black tracking-wider">
            <span>🚀 KICK OFF!</span>
            <span>🏆 WORLD CHAMPIONS!</span>
          </div>
        </div>
      </div>

      {/* Coupon Collector Prediction Banner */}
      <div className="bg-[#100721] border-2 border-purple-500/25 rounded-3xl p-6 shadow-2xl md:col-span-2 flex flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between mb-3.5 md:pr-4">
              <span className="text-[10px] uppercase tracking-wider text-pink-400 font-black font-mono">
                🔮 SMART PACK PREDICTOR
              </span>
              <TrendingUp className="w-4 h-4 text-pink-400 animate-pulse" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black tracking-tight text-pink-400 font-sans">
                ~{stats.expectedPacks}
              </span>
              <span className="text-xs text-slate-200 font-black uppercase tracking-wider">
                packs left! 🎒
              </span>
            </div>
            <p className="text-[11px] text-slate-350 mt-2 leading-relaxed">
              Based on probability math, you need about <span className="text-pink-400 font-extrabold bg-[#05030c] px-1.5 py-0.5 rounded border border-purple-500/20 font-mono">{stats.expectedStickersToBuy}</span> stickers to fill every blank slot!
            </p>
          </div>

          <div className="bg-black/35 border border-purple-500/20 rounded-2xl p-4 text-xs text-slate-300 flex flex-col justify-center">
            <div className="flex items-center gap-1.5 font-black text-pink-400 mb-1.5 uppercase font-mono tracking-wide text-[10px]">
              <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
              <span>THE PROBABILITY MATH ✨</span>
            </div>
            <p className="leading-relaxed text-[11px] font-medium text-slate-300">
              {stats.progressPercent >= 90 ? (
                "🎉 You are so close! Since you've got almost all stars, open packs will mostly yield duplicates. It is prime time to trade with schoolmates!"
              ) : stats.progressPercent >= 50 ? (
                "📈 Past the halfway line! Double sticker copies are naturally more frequent now. Trade them to unlock your missing targets!"
              ) : (
                "🎯 Fresh collector delight! Almost every physical wrapper you open right now will be brand new for your book. Outstanding momentum!"
              )}
            </p>
          </div>
        </div>

        <div className="mt-5 pt-3.5 border-t border-purple-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono text-[9px] font-black uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>SWAPS DECK SIZE: <span className="text-emerald-400 font-extrabold">{stats.totalDoubles} extra entries</span></span>
          </div>
          <div className="flex items-center gap-2 text-slate-305 font-mono text-[9px] font-black uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>NEXT STICKER DOUBLE RISK: <span className="text-pink-450 font-extrabold">{stats.nextDuplicateProbability}% probability</span></span>
          </div>
        </div>
      </div>

    </div>
  );
}
