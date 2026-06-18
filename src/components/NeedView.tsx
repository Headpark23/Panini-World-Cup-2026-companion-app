import React, { useState, useMemo } from "react";
import { Search, Inbox, AlertCircle } from "lucide-react";
import { Sticker } from "../types";
import { TEAMS } from "../data/stickers";
import StickerCard from "./StickerCard";
import IntelligentBatchPanel from "./IntelligentBatchPanel";

interface NeedViewProps {
  stickers: Sticker[];
  onToggleSticker: (id: string) => void;
  onBatchUpdateStatus: (detectedIds: string[], targetStatus: "owned" | "needed") => void;
}

export default function NeedView({ stickers, onToggleSticker, onBatchUpdateStatus }: NeedViewProps) {
  const [search, setSearch] = useState("");
  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");

  // Batch importer state
  const [showBatch, setShowBatch] = useState(false);

  const teamOptions = useMemo(() => {
    return Object.keys(TEAMS).map((code) => ({
      code,
      name: TEAMS[code].name,
      flag: TEAMS[code].flag,
    })).sort((a, b) => {
      if (a.code === "FWC") return -1;
      if (b.code === "FWC") return 1;
      if (a.code === "CC") return 1;
      if (b.code === "CC") return -1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const neededStickers = useMemo(() => {
    return stickers.filter(
      (s) =>
        s.ownedStatus === "needed" &&
        (selectedTeam === "ALL" || s.code === selectedTeam) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.id.toLowerCase().includes(search.toLowerCase()) ||
          s.team.toLowerCase().includes(search.toLowerCase()))
    );
  }, [stickers, search, selectedTeam]);

  return (
    <div className="space-y-6 animate-fadeIn" id="needed-stickers-section">
      <div className="bg-[#0f2e5c] border border-[#1e4d8e] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 opacity-5 rounded-full blur-2xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
              <AlertCircle className="w-5 h-5 text-amber-400 animate-pulse" />
              📋 My Sticker Wishlist!
            </h2>
            <p className="text-xs text-rose-300 font-medium mt-1">
              Here are the <strong>{stickers.filter(s => s.ownedStatus === "needed").length}</strong> players you need to complete your World Cup 2026 book! Got one of these? Just check its card to save it!
            </p>
            <div className="flex items-center gap-3 mt-2.5">
              <button
                id="toggle-need-batch"
                onClick={() => {
                  setShowBatch(!showBatch);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-black px-3.5 py-1.5 rounded-xl cursor-pointer shadow transition-all flex items-center gap-1.5 uppercase tracking-wide"
              >
                ⚡ Paste Bulk List
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Team Selector */}
            <div className="relative w-full sm:w-48">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full bg-[#071d3d] border border-[#1e4d8e] text-white rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-amber-450 cursor-pointer font-bold"
              >
                <option value="ALL">🌎 All Teams ({stickers.filter(s => s.ownedStatus === "needed").length})</option>
                {teamOptions.map((team) => {
                  const countForTeam = stickers.filter(
                    (s) => s.ownedStatus === "needed" && s.code === team.code
                  ).length;
                  return (
                    <option key={team.code} value={team.code}>
                      {team.flag} {team.name} ({countForTeam})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Search box */}
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find players, numbers, or countries..."
                className="w-full bg-[#071d3d] border border-[#1e4d8e] text-white rounded-xl py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-amber-450 font-sans"
              />
            </div>
          </div>
        </div>

        {showBatch && (
          <IntelligentBatchPanel
            stickers={stickers}
            onBatchUpdateStatus={onBatchUpdateStatus}
            targetStatus="needed"
            onClose={() => setShowBatch(false)}
          />
        )}

        {neededStickers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {neededStickers.map((sticker) => (
              <StickerCard
                key={sticker.id}
                sticker={sticker}
                onToggleSticker={onToggleSticker}
                showDoublesControl={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#071d3d]/50 border border-dashed border-[#1e4d8e] rounded-2xl">
            <Inbox className="w-12 h-12 text-amber-300 mx-auto mb-3 animate-bounce" />
            <p className="text-sm text-yellow-300 font-extrabold uppercase">⭐️ No missing cards here! ⭐️</p>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
              If you were typing a name, try erasing it list to see others! If your checklist is empty, you successfully completed your physical sticker book! You are a genuine World Champion collector! 🎉⚽
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
