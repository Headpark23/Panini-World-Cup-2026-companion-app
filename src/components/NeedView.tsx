import React, { useState, useMemo } from "react";
import { Search, Inbox, AlertCircle } from "lucide-react";
import { Sticker } from "../types";
import { TEAMS } from "../data/stickers";
import StickerCard from "./StickerCard";

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
  const [batchText, setBatchText] = useState("");
  const [batchFeedback, setBatchFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

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
                  setBatchFeedback(null);
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

        {/* BATCH IMPORTER COLLAPSIBLE PANEL */}
        {showBatch && (
          <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-[#120624] to-[#04010a] border border-purple-500/20 shadow-2xl relative overflow-hidden animate-fadeIn" id="need-batch-importer-panel">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2 text-pink-400">
              ⚡ Paste Batch Missing List stickers
            </h3>
            <p className="text-xs text-slate-300 mb-3 leading-relaxed">
              💡 <strong>How to use:</strong> Use <strong>3 letters</strong> for the country / team code, then the sticker number (e.g. <code className="bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded font-mono font-bold">JAP3</code>, <code className="bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded font-mono font-bold">ARG14</code>, <code className="bg-pink-500/20 text-pink-400 px-1.5 py-0.5 rounded font-mono font-bold">SCO7</code>). Separate each piece using a <strong>new line</strong> or a <strong>semi-colon (;)</strong>.
            </p>
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="JAP3; ARG14; SCO7&#10;ENG10; BRA2"
              rows={4}
              className="w-full bg-[#05010f] border border-purple-500/30 text-white rounded-xl p-3.5 text-xs focus:outline-none focus:border-pink-500 font-mono transition-colors"
            />
            <div className="mt-3 flex items-center justify-between gap-4 flex-wrap">
              <button
                onClick={() => {
                  const tokens = batchText.split(/[\n;,]+/);
                  const validIds: string[] = [];
                  const invalidInputs: string[] = [];
                  const allStickerIds = new Set(stickers.map((s) => s.id));

                  tokens.forEach((t) => {
                    const clean = t.trim().toUpperCase();
                    if (!clean) return;
                    const match = clean.match(/^([A-Z]{2,3})\s*[-_]?\s*(\d+)$/);
                    if (match) {
                      let teamCode = match[1];
                      const numberStr = match[2];
                      if (teamCode === "JAP") {
                        teamCode = "JPN";
                      }
                      const officialId = `${teamCode} ${parseInt(numberStr, 10)}`;
                      if (allStickerIds.has(officialId)) {
                        validIds.push(officialId);
                      } else {
                        invalidInputs.push(clean);
                      }
                    } else {
                      invalidInputs.push(clean);
                    }
                  });

                  if (validIds.length > 0) {
                    onBatchUpdateStatus(validIds, "needed");
                    setBatchFeedback({
                      type: "success",
                      text: `🎉 Successfully marked ${validIds.length} stickers as missing/needed in your list!${
                        invalidInputs.length > 0
                          ? ` (Skipped ${invalidInputs.length} unrecognized matches: ${invalidInputs.slice(0, 5).join(", ")})`
                          : ""
                      }`,
                    });
                    setBatchText("");
                  } else {
                    setBatchFeedback({
                      type: "error",
                      text: "⚠️ No recognized sticker codes found. Verify you are using 3-letter codes followed by a number (e.g. JAP3, ARG14, SCO7).",
                    });
                  }
                }}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-lg"
              >
                Apply Batch to Missing List
              </button>
              <button
                onClick={() => {
                  setShowBatch(false);
                  setBatchText("");
                  setBatchFeedback(null);
                }}
                className="text-xs text-slate-400 hover:text-white cursor-pointer font-bold"
              >
                Cancel / Close
              </button>
            </div>
            {batchFeedback && (
              <div
                className={`mt-4 p-3 rounded-xl text-xs font-semibold ${
                  batchFeedback.type === "success"
                    ? "bg-emerald-950/40 border border-emerald-500/20 text-emerald-400"
                    : "bg-red-950/40 border border-red-500/20 text-rose-400"
                }`}
              >
                {batchFeedback.text}
              </div>
            )}
          </div>
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
