import React, { useState, useMemo } from "react";
import { Copy, Check, Users, Search, Columns, RefreshCw } from "lucide-react";
import { Sticker } from "../types";
import { TEAMS } from "../data/stickers";
import StickerCard from "./StickerCard";

interface DoublesViewProps {
  stickers: Sticker[];
  onToggleSticker: (id: string) => void;
  onIncrementDouble: (id: string) => void;
  onDecrementDouble: (id: string) => void;
}

export default function DoublesView({
  stickers,
  onToggleSticker,
  onIncrementDouble,
  onDecrementDouble,
}: DoublesViewProps) {
  const [search, setSearch] = useState("");
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string>("ALL");

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

  const doubleStickers = useMemo(() => {
    return stickers.filter(
      (s) =>
        s.doublesCount > 0 &&
        (selectedTeam === "ALL" || s.code === selectedTeam) &&
        (s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.id.toLowerCase().includes(search.toLowerCase()) ||
          s.team.toLowerCase().includes(search.toLowerCase()))
    );
  }, [stickers, search, selectedTeam]);

  const rawSwapCodesText = useMemo(() => {
    const doublesList = stickers
      .filter((s) => s.doublesCount > 0)
      .map((s) => `${s.id} (${s.doublesCount}x)`);
    return doublesList.length > 0
      ? `⚽ MY WORLD CUP SWAP DECK CARDS FOR TRADE: ${doublesList.join(", ")}`
      : "No extra cards saved yet. Click '+' on a card to build your trading pile!";
  }, [stickers]);

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(rawSwapCodesText);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const totalCopiesCount = useMemo(() => {
    return stickers.reduce((sum, s) => sum + s.doublesCount, 0);
  }, [stickers]);

  return (
    <div className="space-y-6 animate-fadeIn" id="doubles-stickers-section">
      <div className="bg-[#0f2e5c] border border-[#1e4d8e] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-2xl"></div>
        
        {/* Header Layout */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2 uppercase">
              <Users className="w-5 h-5 text-amber-300 animate-pulse" />
              🔄 My Double Stickers! (Let's Trade! 🤝)
            </h2>
            <p className="text-xs text-amber-250 font-medium mt-1">
              These are your duplicate players! Copy your swap pile list to text your friends and trade for players you actually need (Total: <strong>{totalCopiesCount}</strong> spare copies ready!)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Team Selector */}
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="bg-[#071d3d] border border-[#1e4d8e] text-white rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-amber-450 cursor-pointer font-bold w-full md:w-44 h-8"
            >
              <option value="ALL">🌎 All Teams ({stickers.filter(s => s.doublesCount > 0).length})</option>
              {teamOptions.map((team) => {
                const countForTeam = stickers.filter(
                  (s) => s.doublesCount > 0 && s.code === team.code
                ).length;
                return (
                  <option key={team.code} value={team.code}>
                    {team.flag} {team.name} ({countForTeam})
                  </option>
                );
              })}
            </select>

            {/* Search filter input */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search my doubles..."
              className="bg-[#071d3d] border border-[#1e4d8e] text-white rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-amber-450 font-sans w-full md:w-44 h-8"
            />

            {/* Quick copy buttons */}
            <button
              onClick={handleCopyCodes}
              disabled={doubleStickers.length === 0}
              className={`text-xs font-mono font-black py-2 px-4 rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                doubleStickers.length === 0
                  ? "bg-slate-800/50 text-slate-500 border-slate-800 cursor-not-allowed"
                  : "bg-amber-400 hover:bg-amber-450 text-[#0f2e5c] border-amber-350 shadow-lg hover:-translate-y-0.5"
              }`}
            >
              {copiedCodes ? (
                <>
                  <Check className="w-3.5 h-3.5 animate-bounce text-[#0f2e5c]" /> Copy Success!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> 📲 Copy Trade Text
                </>
              )}
            </button>
          </div>
        </div>

        {/* Short Text Panel */}
        {doubleStickers.length > 0 && (
          <div className="bg-black/35 rounded-xl p-3 border border-[#1e4d8e]/40 text-xs mb-5 flex items-center justify-between gap-4">
            <div className="font-mono text-emerald-300 truncate max-w-lg font-bold">
              {rawSwapCodesText}
            </div>
            <span className="text-[9px] bg-emerald-900/35 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/20 shrink-0 uppercase font-mono tracking-wider font-black">
              Trade Ready
            </span>
          </div>
        )}

        {/* Grid Area */}
        {doubleStickers.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {doubleStickers.map((sticker) => (
              <StickerCard
                key={sticker.id}
                sticker={sticker}
                onToggleSticker={onToggleSticker}
                onIncrementDouble={onIncrementDouble}
                onDecrementDouble={onDecrementDouble}
                showDoublesControl={true}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#071d3d]/50 border border-dashed border-[#1e4d8e] rounded-2xl">
            <RefreshCw className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-pulse" />
            <p className="text-sm text-amber-300 font-extrabold uppercase">🌟 No swaps saved yet! 🌟</p>
            <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
              If you have duplicates, just click <strong>Sticker Book</strong>, click Owned on any player, and press the <strong>plus (+) button</strong>. They will instantly appear here!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
