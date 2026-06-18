import React, { useState, useEffect, useMemo } from "react";
import { Check, AlertCircle, HelpCircle, RefreshCw, Trash2, X, Sparkles, Plus, Search, Info } from "lucide-react";
import { Sticker } from "../types";

interface IntelligentBatchPanelProps {
  stickers: Sticker[];
  onBatchUpdateStatus: (detectedIds: string[], targetStatus: "owned" | "needed") => void;
  targetStatus: "owned" | "needed";
  onClose: () => void;
}

interface ParsedItem {
  id: string; // "SCO 7"
  sticker: Sticker;
  isCorrected?: boolean;
  originalText?: string;
  selected: boolean;
}

interface UnsureQuestion {
  id: string; // Unique question identifier
  originalText: string;
  type: "corrected_code" | "out_of_bounds" | "player_name" | "unknown";
  message: string;
  suggestions: { id: string; label: string; sticker: Sticker }[];
  resolvedId?: string | null; // Selected sticker ID, or null if skipped/discarded
}

const COMMON_ALIASES: Record<string, string> = {
  JAP: "JPN",
  ESP: "ESP", // Spanish
  GER: "GER", // German
  ENG: "ENG", // England
  SCOT: "SCO",
  US: "USA",
  MEXI: "MEX",
  COLA: "CC",
  COKE: "CC",
};

export default function IntelligentBatchPanel({
  stickers,
  onBatchUpdateStatus,
  targetStatus,
  onClose
}: IntelligentBatchPanelProps) {
  const [inputText, setInputText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [unsureQuestions, setUnsureQuestions] = useState<UnsureQuestion[]>([]);
  const [hasProcessedOnce, setHasProcessedOnce] = useState(false);

  // Helper sets for fast lookup
  const stickerMap = useMemo(() => {
    const map = new Map<string, Sticker>();
    stickers.forEach((s) => map.set(s.id.toUpperCase(), s));
    return map;
  }, [stickers]);

  const teamCodes = useMemo(() => {
    const list = Array.from(new Set(stickers.map((s) => s.code.toUpperCase())));
    return list;
  }, [stickers]);

  const playerStickers = useMemo(() => {
    return stickers.filter(s => s.name && s.name.length > 2);
  }, [stickers]);

  // Main intelligence parser
  const handleAnalyzeText = () => {
    if (!inputText.trim()) {
      setParsedItems([]);
      setUnsureQuestions([]);
      return;
    }

    const textToParse = inputText;
    const foundValid: ParsedItem[] = [];
    const questions: UnsureQuestion[] = [];
    let questionCounter = 0;

    // Track which IDs we've already matched in this pass to prevent duplicating inside the list
    const addedIds = new Set<string>();

    // 1. Process line-by-line first to keep user context
    const lines = textToParse.split("\n");

    lines.forEach((line) => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Check for code-based groups e.g., "SCO 7 9 12 11" or "SCO 7, 9, 12, 11"
      // This regex matches a word (2-4 letters) followed by multiple numbers separated by spaces, commas, or semicolons
      const groupRegex = /([A-Za-z]{2,4})\s*((?:\d+[\s,;]*)+)/g;
      let match;
      let matchedAnyInLine = false;
      const parsedSpans: { start: number; end: number } = { start: -1, end: -1 };

      while ((match = groupRegex.exec(cleanLine)) !== null) {
        matchedAnyInLine = true;
        const origCodeToken = match[1];
        const numPart = match[2];
        
        let normalizedCode = origCodeToken.toUpperCase();
        let isCorrected = false;

        // Check aliases
        if (COMMON_ALIASES[normalizedCode]) {
          normalizedCode = COMMON_ALIASES[normalizedCode];
          isCorrected = true;
        }

        // Extract all individual numbers
        const numbers = numPart.match(/\d+/g) || [];
        
        numbers.forEach((numStr) => {
          const num = parseInt(numStr, 10);
          const candidateId = `${normalizedCode} ${num}`;
          const matchedSticker = stickerMap.get(candidateId);

          if (matchedSticker) {
            if (!addedIds.has(candidateId)) {
              addedIds.add(candidateId);
              foundValid.push({
                id: candidateId,
                sticker: matchedSticker,
                isCorrected: isCorrected || (origCodeToken !== normalizedCode),
                originalText: `${origCodeToken} ${numStr}`,
                selected: true,
              });
            }
          } else {
            // Out of bounds or invalid code
            const isCodeValid = teamCodes.includes(normalizedCode);
            if (isCodeValid) {
              // Valid code, but invalid number (e.g. SCO 99)
              const teamName = stickers.find(s => s.code === normalizedCode)?.team || normalizedCode;
              
              // Find some smart suggestions: e.g. last digit, or existing stickers
              const limitStr = "1 to 20";
              const suggestionCandidates = [1, 2, num % 10, num % 20, 10, 20].filter(n => n >= 1 && n <= 20);
              const uniqueCand = Array.from(new Set(suggestionCandidates));
              const suggestions = uniqueCand.map(n => {
                const suggId = `${normalizedCode} ${n}`;
                const s = stickerMap.get(suggId)!;
                return { id: suggId, label: `Sticker #${n} (${s?.name || "Player"})`, sticker: s };
              });

              questions.push({
                id: `q-${questionCounter++}`,
                originalText: `${origCodeToken} ${numStr}`,
                type: "out_of_bounds",
                message: `⚠️ "${teamName}" (${normalizedCode}) only has sticker numbers 1 to 20. You typed "${origCodeToken} ${numStr}".`,
                suggestions,
              });
            } else {
              // Code is completely invalid (e.g. XYZ 7)
              questions.push({
                id: `q-${questionCounter++}`,
                originalText: `${origCodeToken} ${numStr}`,
                type: "unknown",
                message: `❓ Unrecognized country / team code "${origCodeToken}".`,
                suggestions: [],
              });
            }
          }
        });
      }

      // If no code-groups matched, maybe this is a player's name search! e.g. "Messi", "Bellingham", "Kane"
      if (!matchedAnyInLine) {
        // Find if the raw line mentions any player in our sticker database
        const normalizedLine = cleanLine.toLowerCase();
        
        // Find matching player stickers
        const matches = playerStickers.filter(
          (s) => normalizedLine.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(normalizedLine)
        );

        if (matches.length > 0) {
          questions.push({
            id: `q-${questionCounter++}`,
            originalText: cleanLine,
            type: "player_name",
            message: `🤔 We found player matches for your text "${cleanLine}":`,
            suggestions: matches.slice(0, 3).map(s => ({
              id: s.id,
              label: `${s.team} - ${s.name} (${s.id})`,
              sticker: s
            })),
          });
        } else if (cleanLine.length > 2) {
          // General invalid text skip query
          questions.push({
            id: `q-${questionCounter++}`,
            originalText: cleanLine,
            type: "unknown",
            message: `❓ We couldn't recognize "${cleanLine}". Did you write a country prefix and card number?`,
            suggestions: [],
          });
        }
      }
    });

    setParsedItems(foundValid);
    setUnsureQuestions(questions);
    setHasProcessedOnce(true);
  };

  // Trigger analysis when input changes or when user clicks search
  useEffect(() => {
    if (inputText.length === 0) {
      setParsedItems([]);
      setUnsureQuestions([]);
      setHasProcessedOnce(false);
    }
  }, [inputText]);

  // Handle checking/unchecking parsed ready entries
  const handleToggleSelectItem = (id: string) => {
    setParsedItems(prev =>
      prev.map(item => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Resolve a question by picking a suggestion
  const handleResolveQuestion = (questionId: string, stickerId: string | null) => {
    setUnsureQuestions(prev =>
      prev.map(q => {
        if (q.id === questionId) {
          return { ...q, resolvedId: stickerId };
        }
        return q;
      })
    );

    // If resolved with an actual sticker, append it into our active recognized stickers!
    if (stickerId) {
      const matched = stickerMap.get(stickerId);
      if (matched) {
        setParsedItems(prev => {
          if (prev.some(p => p.id === stickerId)) return prev; // Avoid duplicate
          return [
            ...prev,
            {
              id: stickerId,
              sticker: matched,
              isCorrected: true,
              originalText: "Interactive Choice",
              selected: true,
            }
          ];
        });
      }
    }
  };

  // Compute final count of stickers about to be imported
  const readyToApplyCount = useMemo(() => {
    return parsedItems.filter(item => item.selected).length;
  }, [parsedItems]);

  const handleApply = () => {
    const finalStickersToApply = parsedItems
      .filter((item) => item.selected)
      .map((item) => item.id);

    if (finalStickersToApply.length > 0) {
      onBatchUpdateStatus(finalStickersToApply, targetStatus);
      setInputText("");
      setParsedItems([]);
      setUnsureQuestions([]);
      setHasProcessedOnce(false);
      onClose();
    }
  };

  const hasUnsavedStuff = parsedItems.length > 0 || unsureQuestions.length > 0;

  return (
    <div className="mb-6 p-5 rounded-2xl bg-gradient-to-br from-[#120624] to-[#04010a] border border-purple-500/20 shadow-2xl relative overflow-hidden animate-fadeIn" id="intelligent-batch-importer-panel">
      {/* Decorative stars background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex items-center justify-between border-b border-purple-500/10 pb-3 mb-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2 text-pink-400">
          <Sparkles className="w-4 h-4 text-pink-400 animate-spin" />
          <span>Intelligent Batch {targetStatus === "owned" ? "Acquired" : "Wishlist"} Importer</span>
        </h3>
        <button
          onClick={() => {
            setInputText("");
            setParsedItems([]);
            setUnsureQuestions([]);
            onClose();
          }}
          className="text-slate-400 hover:text-white p-1 rounded-lg bg-white/5 cursor-pointer hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Helper guide */}
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          💡 Our smart engine understands standard listings, line-breaks, and team summaries! Try formats like: <br />
          <code className="bg-pink-500/20 text-pink-400 px-1 py-0.5 rounded font-mono text-[10px] font-bold">SCO 7 9 12 11</code> or{" "}
          <code className="bg-pink-500/20 text-pink-400 px-1 py-0.5 rounded font-mono text-[10px] font-bold">SCO 7, 9, 12, 11</code> or even player names like{" "}
          <code className="bg-pink-500/20 text-pink-400 px-1 py-0.5 rounded font-mono text-[10px] font-bold">Messi, Bellingham</code>.
        </p>

        {/* Text Area Input */}
        <div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or paste here... e.g.&#10;SCO 7, 9, 12, 11&#10;JAP 3&#10;Messi, Bellingham"
            rows={5}
            className="w-full bg-[#05010f] border border-purple-500/30 text-white rounded-xl p-3.5 text-xs focus:outline-none focus:border-pink-500 font-mono transition-colors placeholder-slate-600 focus:ring-1 focus:ring-pink-500"
          />
        </div>

        {/* Action Button to trigger analysis */}
        {inputText.trim() && !hasProcessedOnce && (
          <button
            onClick={handleAnalyzeText}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-extrabold text-xs uppercase p-3 rounded-xl shadow-lg shadow-purple-500/10 cursor-pointer transition-all duration-155 transform hover:scale-[1.01]"
          >
            ⚡ Analyze Paste List
          </button>
        )}

        {hasProcessedOnce && (
          <div className="space-y-4 pt-1 border-t border-purple-500/10">
            {/* 1. RECOGNIZED PORTION */}
            {parsedItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" />
                    Recognized ({parsedItems.length} Stickers)
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">Uncheck any to skip</span>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto bg-black/45 p-3 rounded-xl border border-emerald-500/10">
                  {parsedItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleToggleSelectItem(item.id)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 border cursor-pointer ${
                        item.selected
                          ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-350"
                          : "bg-slate-900/60 border-slate-800 text-slate-500 line-through"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.selected}
                        readOnly
                        className="rounded accent-emerald-500 shrink-0 cursor-pointer text-emerald-400"
                      />
                      <span>{item.id}</span>
                      <span className="text-[10px] text-slate-350 font-normal">({item.sticker.name})</span>
                      {item.isCorrected && (
                        <span className="text-[8px] bg-pink-500/30 text-pink-400 px-1 py-0.2 rounded font-sans uppercase animate-pulse">
                          Auto-fixed
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 2. UNSURE/DIFFICULT PORTION (Q&A FOR THE USER) */}
            {unsureQuestions.length > 0 && (
              <div className="space-y-3 bg-[#17051f]/60 p-4 border border-pink-500/20 rounded-xl relative">
                <div className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-pink-400 animate-pulse" />
                  <span className="text-[11px] font-black uppercase text-pink-400 tracking-wider">
                    🤔 Clarification Required ({unsureQuestions.filter(q => q.resolvedId === undefined).length} Left)
                  </span>
                </div>
                
                <p className="text-[10px] text-slate-300 leading-normal">
                  We detected some items that were a bit unclear. Please select the correct option or skip to ensure error-free recording!
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto divide-y divide-purple-500/10 pr-1">
                  {unsureQuestions.map((q) => {
                    const isAnswered = q.resolvedId !== undefined;
                    
                    return (
                      <div key={q.id} className="pt-2 text-xs">
                        <p className="text-slate-300 font-bold mb-1.5 tracking-tight">
                          {q.message}
                        </p>

                        {!isAnswered ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {q.suggestions.length > 0 ? (
                              q.suggestions.map((sugg) => (
                                <button
                                  key={sugg.id}
                                  onClick={() => handleResolveQuestion(q.id, sugg.id)}
                                  className="px-2.5 py-1 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-white rounded-lg text-[10px] font-bold border border-purple-500/20 flex items-center gap-1 cursor-pointer transition-transform duration-100 hover:scale-[1.02]"
                                >
                                  <Plus className="w-3 h-3 text-pink-400 shrink-0" />
                                  <span>{sugg.label}</span>
                                </button>
                              ))
                            ) : null}

                            <button
                              onClick={() => handleResolveQuestion(q.id, null)}
                              className="px-2.5 py-1 bg-red-950/35 hover:bg-red-900/40 text-red-350 hover:text-red-350 rounded-lg text-[10px] font-bold border border-red-500/10 cursor-pointer font-mono"
                            >
                              ✕ Skip / Ignore
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] py-0.5 text-slate-400 font-mono italic">
                            {q.resolvedId ? (
                              <span className="text-emerald-400 font-bold">
                                Added {q.resolvedId} ✅
                              </span>
                            ) : (
                              <span className="text-slate-500 line-through">
                                Skipped "{q.originalText}"
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-4 flex-wrap">
              <button
                onClick={handleApply}
                disabled={readyToApplyCount === 0}
                className={`flex-1 min-w-[200px] py-3 text-center rounded-xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all ${
                  readyToApplyCount > 0
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-900 cursor-pointer transform hover:scale-[1.01]"
                    : "bg-slate-900 text-slate-550 border border-slate-805 cursor-not-allowed"
                }`}
              >
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>Apply Checkbox List ({readyToApplyCount} Stickers)</span>
              </button>

              <button
                onClick={() => {
                  setInputText("");
                  setParsedItems([]);
                  setUnsureQuestions([]);
                  setHasProcessedOnce(false);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 cursor-pointer font-extrabold uppercase py-1 border-b border-transparent hover:border-rose-400 font-mono"
              >
                Clear / Reset
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
