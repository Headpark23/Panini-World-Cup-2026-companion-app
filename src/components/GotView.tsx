import React, { useState, useMemo } from "react";
import { Search, Trophy, Layers } from "lucide-react";
import { Sticker } from "../types";
import { TEAMS } from "../data/stickers";
import StickerCard from "./StickerCard";
import IntelligentBatchPanel from "./IntelligentBatchPanel";

interface GotViewProps {
  stickers: Sticker[];
  onToggleSticker: (id: string) => void;
  onBatchUpdateStatus: (detectedIds: string[], targetStatus: "owned" | "needed") => void;
}

export default function GotView({ stickers, onToggleSticker, onBatchUpdateStatus }: GotViewProps) {
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

  const ownedStickers = useMemo(() => {
    return stickers.filter(
      (s) =>
        s.ownedStatus === "owned" &&
        (selectedTeam === "ALL" || s.code === selectedTeam) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.id.toLowerCase().includes(search.toLowerCase()) ||
          s.team.toLowerCase().includes(search.toLowerCase()))
    );
  }, [stickers, search, selectedTeam]);

  return (
    <div className="space-y-6 animate-fadeIn" id="got-stickers-section">
      <div className="bg-[#0f2e5c] border border-[#1e4d8e] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500 opacity-5 rounded-full blur-2xl"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 uppercase animate-pulse">
              <Trophy className="w-5 h-5 text-amber-300 fill-amber-350" />
              🏆 My Sticker Trophies!
            </h2>
            <p className="text-xs text-emerald-300 font-medium mt-1">
              Look at all these amazing players! You have successfully pasted <strong>{stickers.filter(s => s.ownedStatus === "owned").length}</strong> awesome stickers into your physical book!
            </p>
            <div className="flex items-center gap-3 mt-2.5">
              <button
                id="toggle-got-batch"
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
                <option value="ALL">🌎 All Teams ({stickers.filter(s => s.ownedStatus === "owned").length})</option>
                {teamOptions.map((team) => {
                  const countForTeam = stickers.filter(
                    (s) => s.ownedStatus === "owned" && s.code === team.code
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
                placeholder="Search your trophy room..."
                className="w-full bg-[#071d3d] border border-[#1e4d8e] text-white rounded-xl py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-amber-450 font-sans"
              />
            </div>
          </div>
        </div>

        {showBatch && (
          <IntelligentBatchPanel
            stickers={stickers}
            onBatchUpdateStatus={onBatchUpdateStatus}
            targetStatus="owned"
            onClose={() => setShowBatch(false)}
          />
        )}

        {ownedStickers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {ownedStickers.map((sticker) => (
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
            <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-amber-300 font-extrabold uppercase">🌿 Your Trophy Room is Waiting! 🌿</p>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
              You haven't added any stickers to your album yet! Go to the <strong>Sticker Book</strong>, tap some checkmarks, or use your <strong>Camera Scanner</strong> to see your collection grow here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
