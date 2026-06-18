import React, { useState, useMemo } from "react";
import { Search, Globe, Bookmark, ChevronLeft, ChevronRight, BookOpen, Star, Sparkles, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Sticker } from "../types";
import StickerCard from "./StickerCard";

interface AlbumViewProps {
  stickers: Sticker[];
  onToggleSticker: (id: string) => void;
  onIncrementDouble: (id: string) => void;
  onDecrementDouble: (id: string) => void;
}

interface StickersCollectionGridProps {
  code: string;
  sectionName: string;
  flag: string;
  stickersList: Sticker[];
  onToggle: (id: string) => void;
  onAddDouble: (id: string) => void;
  onSubDouble: (id: string) => void;
  subtitle: string;
  themeType?: "gold" | "red" | "sky";
}

function StickersCollectionGrid({
  code,
  sectionName,
  flag,
  stickersList,
  onToggle,
  onAddDouble,
  onSubDouble,
  subtitle,
  themeType = "sky"
}: StickersCollectionGridProps) {
  const ownedCount = stickersList.filter(s => s.ownedStatus === "owned").length;
  const isCoke = themeType === "red";
  const isSpecial = themeType === "gold";

  // Position label helper
  const getSlotTypeLabel = (code: string, num: number) => {
    if (code === "FWC") return "🏆 GOLD LEGEND";
    if (code === "CC") return "🥤 COLA SLOT";
    if (num === 1) return "🛡️ CREST BADGE";
    if (num === 2) return "🏟️ TEAM PHOTO";
    return "⚽ TEAM PLAYER";
  };

  return (
    <div className="flex flex-col h-full justify-between" id={`pact-grid-${code}`}>
      <div className="border-b border-[#1e4d8e]/45 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl filter drop-shadow">{flag}</span>
          <div>
            <h3 className="text-base font-black text-white uppercase leading-tight tracking-tight flex items-center gap-1.5">
              {sectionName}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider font-bold">
              {subtitle}
            </p>
          </div>
          <span className={`text-[10px] font-mono font-black px-2.5 py-1 rounded-full ml-auto border tracking-wider flex items-center gap-1 ${
            isCoke
              ? "bg-red-950/80 border-red-500/35 text-red-305"
              : isSpecial
              ? "bg-amber-950/80 border-amber-500/35 text-amber-305"
              : "bg-emerald-900/60 border-emerald-500/25 text-emerald-305"
          }`}>
            🏆 {ownedCount} / {stickersList.length} Got
          </span>
        </div>
      </div>

      {/* Grid wrapper */}
      <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[380px] lg:max-h-[460px] pr-1 scrollbar-thin">
        {stickersList.map((sticker) => {
          const isOwned = sticker.ownedStatus === "owned";
          let borderClasses = "";
          let bgClasses = "";
          let textAccent = "";

          if (isOwned) {
            if (isCoke) {
              borderClasses = "border-red-500/50 shadow-sm shadow-red-500/5";
              bgClasses = "bg-gradient-to-br from-[#2f080c] to-[#0a0002]";
              textAccent = "text-red-300 font-extrabold";
            } else if (isSpecial) {
              borderClasses = "border-amber-400/50 shadow-sm shadow-amber-500/5";
              bgClasses = "bg-gradient-to-br from-[#251804] to-[#0a0601]";
              textAccent = "text-amber-300 font-extrabold";
            } else {
              borderClasses = "border-emerald-500/40 shadow-sm shadow-emerald-500/5";
              bgClasses = "bg-gradient-to-br from-[#052015] to-[#010a06]";
              textAccent = "text-emerald-350 font-extrabold";
            }
          } else {
            borderClasses = "border-slate-800/85 hover:border-slate-700/60";
            bgClasses = "bg-[#040d16]/45 hover:bg-[#061424]/55";
            textAccent = "text-slate-450";
          }

          return (
            <div
              key={sticker.id}
              className={`rounded-xl p-2.5 transition-all duration-200 border flex flex-col justify-between min-h-[100px] ${bgClasses} ${borderClasses}`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between gap-1 mb-1 bg-black/15 px-1 py-0.5 rounded">
                <span className={`text-[9.5px] font-mono font-black ${textAccent}`}>
                  #{sticker.number}
                </span>

                {isOwned && sticker.doublesCount > 0 && (
                  <span className="bg-amber-450 text-slate-900 text-[8px] font-mono font-black px-1 py-0.5 rounded-full shadow border border-yellow-300 transform scale-95 origin-right">
                    +{sticker.doublesCount} swap
                  </span>
                )}
              </div>

              {/* Slot Name Toggler */}
              <button
                onClick={() => onToggle(sticker.id)}
                className="text-left w-full focus:outline-none cursor-pointer flex-1 flex flex-col justify-center min-h-[35px] group"
              >
                <p className={`text-[11px] font-black leading-tight tracking-tight line-clamp-2 transition-colors ${
                  isOwned ? "text-white" : "text-slate-500 group-hover:text-slate-400"
                }`}>
                  {sticker.name}
                </p>
                <p className="text-[8px] text-slate-500 font-extrabold tracking-widest uppercase mt-0.5 font-mono select-none">
                  {getSlotTypeLabel(sticker.code, sticker.number)}
                </p>
              </button>

              {/* Slot Bottom Actions */}
              {isOwned ? (
                <div className="flex items-center gap-1 mt-1 pt-1 border-t border-slate-800/50">
                  <span className="text-[8.5px] text-slate-500 font-mono font-black uppercase tracking-wider mr-auto">Swaps:</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubDouble(sticker.id);
                    }}
                    className="p-0.5 px-2 rounded bg-black/45 hover:bg-red-500/20 hover:text-red-300 border border-slate-800 text-slate-300 text-[9px] font-mono font-black transition-colors cursor-pointer"
                    title="Subtract extra copy"
                  >
                    -
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddDouble(sticker.id);
                    }}
                    className="p-0.5 px-2 rounded bg-black/45 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-800 text-slate-300 text-[9px] font-mono font-black transition-colors cursor-pointer"
                    title="Add extra copy"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onToggle(sticker.id)}
                  className="mt-1 text-center py-0.5 rounded-lg bg-slate-900/80 hover:bg-emerald-500/15 hover:text-emerald-350 hover:border-emerald-555/20 border border-slate-805 text-[8.5px] font-black uppercase text-slate-400 transition-all cursor-pointer"
                >
                  ➕ Paste
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="hidden sm:flex items-center justify-between text-[8.5px] text-slate-500 font-mono bg-black/20 p-2 rounded-xl mt-1 select-none">
        <span>★ TAP TO TOGGLE STICKER STATUS</span>
        <span>{code} SECTOR CODE</span>
      </div>
    </div>
  );
}

// 51 sequential pages for the interactive flipbook representing all 48 teams + logo cover + specials
const PAGE_SEQUENCE = [
  { type: "cover", code: "COVER", name: "My Album Cover 🏟️", flag: "📕", group: "Cover" },
  { type: "fwc", code: "FWC", name: "Special Legends 🏆", flag: "✨", group: "Specials" },
  
  // Group A
  { type: "team", code: "USA", name: "United States", flag: "🇺🇸", group: "Group A" },
  { type: "team", code: "MEX", name: "Mexico", flag: "🇲🇽", group: "Group A" },
  { type: "team", code: "CAN", name: "Canada", flag: "🇨🇦", group: "Group A" },
  { type: "team", code: "JAM", name: "Jamaica", flag: "🇯🇲", group: "Group A" },

  // Group B
  { type: "team", code: "ARG", name: "Argentina", flag: "🇦🇷", group: "Group B" },
  { type: "team", code: "CHI", name: "Chile", flag: "🇨🇱", group: "Group B" },
  { type: "team", code: "PER", name: "Peru", flag: "🇵🇪", group: "Group B" },
  { type: "team", code: "VEN", name: "Venezuela", flag: "🇻🇪", group: "Group B" },

  // Group C
  { type: "team", code: "BRA", name: "Brazil", flag: "🇧🇷", group: "Group C" },
  { type: "team", code: "COL", name: "Colombia", flag: "🇨🇴", group: "Group C" },
  { type: "team", code: "ECU", name: "Ecuador", flag: "🇪🇨", group: "Group C" },
  { type: "team", code: "PAR", name: "Paraguay", flag: "🇵🇾", group: "Group C" },

  // Group D
  { type: "team", code: "URU", name: "Uruguay", flag: "🇺🇾", group: "Group D" },
  { type: "team", code: "CRC", name: "Costa Rica", flag: "🇨🇷", group: "Group D" },
  { type: "team", code: "PAN", name: "Panama", flag: "🇵🇦", group: "Group D" },
  { type: "team", code: "SEN", name: "Senegal", flag: "🇸🇳", group: "Group D" },

  // Group E
  { type: "team", code: "FRA", name: "France", flag: "🇫🇷", group: "Group E" },
  { type: "team", code: "NGA", name: "Nigeria", flag: "🇳🇬", group: "Group E" },
  { type: "team", code: "GHA", name: "Ghana", flag: "🇬🇭", group: "Group E" },
  { type: "team", code: "CMR", name: "Cameroon", flag: "🇨🇲", group: "Group E" },

  // Group F
  { type: "team", code: "GER", name: "Germany", flag: "🇩🇪", group: "Group F" },
  { type: "team", code: "SUI", name: "Switzerland", flag: "🇨🇭", group: "Group F" },
  { type: "team", code: "POL", name: "Poland", flag: "🇵🇱", group: "Group F" },
  { type: "team", code: "UKR", name: "Ukraine", flag: "🇺🇦", group: "Group F" },

  // Group G
  { type: "team", code: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "Group G" },
  { type: "team", code: "ITA", name: "Italy", flag: "🇮🇹", group: "Group G" },
  { type: "team", code: "SWE", name: "Sweden", flag: "🇸🇪", group: "Group G" },
  { type: "team", code: "DEN", name: "Denmark", flag: "🇩🇰", group: "Group G" },

  // Group H
  { type: "team", code: "ESP", name: "Spain", flag: "🇪🇸", group: "Group H" },
  { type: "team", code: "POR", name: "Portugal", flag: "🇵🇹", group: "Group H" },
  { type: "team", code: "CRO", name: "Croatia", flag: "🇭🇷", group: "Group H" },
  { type: "team", code: "TUR", name: "Turkey", flag: "🇹🇷", group: "Group H" },

  // Group I
  { type: "team", code: "NED", name: "Netherlands", flag: "🇳🇱", group: "Group I" },
  { type: "team", code: "BEL", name: "Belgium", flag: "🇧🇪", group: "Group I" },
  { type: "team", code: "WAL", name: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", group: "Group I" },
  { type: "team", code: "SCO", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", group: "Group I" },

  // Group J
  { type: "team", code: "JPN", name: "Japan", flag: "🇯🇵", group: "Group J" },
  { type: "team", code: "KOR", name: "South Korea", flag: "🇰🇷", group: "Group J" },
  { type: "team", code: "AUS", name: "Australia", flag: "🇦🇺", group: "Group J" },
  { type: "team", code: "GRE", name: "Greece", flag: "🇬🇷", group: "Group J" },

  // Group K
  { type: "team", code: "MAR", name: "Morocco", flag: "🇲🇦", group: "Group K" },
  { type: "team", code: "EGY", name: "Egypt", flag: "🇪🇬", group: "Group K" },
  { type: "team", code: "TUN", name: "Tunisia", flag: "🇹🇳", group: "Group K" },
  { type: "team", code: "KSA", name: "Saudi Arabia", flag: "🇸🇦", group: "Group K" },

  // Group L
  { type: "team", code: "IRN", name: "Iran", flag: "🇮🇷", group: "Group L" },
  { type: "team", code: "IRQ", name: "Iraq", flag: "🇮🇶", group: "Group L" },
  { type: "team", code: "QAT", name: "Qatar", flag: "🇶🇦", group: "Group L" },
  { type: "team", code: "UAE", name: "United Arab Emirates", flag: "🇦🇪", group: "Group L" },
  
  // Coca Cola Section
  { type: "cc", code: "CC", name: "Coca-Cola Back cover 🥤", flag: "❤️", group: "CocaCola" },
];

export default function AlbumView({
  stickers,
  onToggleSticker,
  onIncrementDouble,
  onDecrementDouble,
}: AlbumViewProps) {
  const [search, setSearch] = useState("");
  
  // pageIndex is the active spread starting point. Because it's a double-page book, pageIndex is usually even or odd.
  // We'll increment pageIndex by 2 on large screens, and by 1 on small screens!
  const [pageIndex, setPageIndex] = useState(0);
  const [direction, setDirection] = useState(0); // For sliding page-turn mock animations

  // Quick helper to jump to any page index
  const jumpToPage = (index: number) => {
    setDirection(index > pageIndex ? 1 : -1);
    setPageIndex(index);
  };

  // Switch tabs to jump to dynamic pages
  const handleTabClick = (category: "Cover" | "Specials" | "A-D" | "E-H" | "I-L" | "CocaCola") => {
    let foundIndex = -1;
    if (category === "Cover") {
      foundIndex = PAGE_SEQUENCE.findIndex((p) => p.group === "Cover");
    } else if (category === "Specials") {
      foundIndex = PAGE_SEQUENCE.findIndex((p) => p.group === "Specials");
    } else if (category === "A-D") {
      foundIndex = PAGE_SEQUENCE.findIndex((p) => ["Group A", "Group B", "Group C", "Group D"].includes(p.group));
    } else if (category === "E-H") {
      foundIndex = PAGE_SEQUENCE.findIndex((p) => ["Group E", "Group F", "Group G", "Group H"].includes(p.group));
    } else if (category === "I-L") {
      foundIndex = PAGE_SEQUENCE.findIndex((p) => ["Group I", "Group J", "Group K", "Group L"].includes(p.group));
    } else if (category === "CocaCola") {
      foundIndex = PAGE_SEQUENCE.findIndex((p) => p.group === "CocaCola");
    }
    if (foundIndex !== -1) {
      jumpToPage(foundIndex);
    }
  };

  const getActiveCategory = (): string => {
    const currentGroup = leftPageInfo?.group || "";
    if (currentGroup === "Cover") return "Cover";
    if (currentGroup === "Specials") return "Specials";
    if (["Group A", "Group B", "Group C", "Group D"].includes(currentGroup)) return "A-D";
    if (["Group E", "Group F", "Group G", "Group H"].includes(currentGroup)) return "E-H";
    if (["Group I", "Group J", "Group K", "Group L"].includes(currentGroup)) return "I-L";
    if (currentGroup === "CocaCola") return "CocaCola";
    return "";
  };

  // Calculated search results (Grid view triggers automatically if search query is active)
  const isSearchActive = search.trim().length > 0;

  const searchResults = useMemo(() => {
    if (!isSearchActive) return [];
    return stickers.filter((s) => {
      return (
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.team.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [stickers, search, isSearchActive]);

  // Handle clicking a card in the general search results to jump to the actual book page representation
  const handleJumpToCardPage = (code: string) => {
    const sequenceIndex = PAGE_SEQUENCE.findIndex((p) => p.code === code);
    if (sequenceIndex !== -1) {
      jumpToPage(sequenceIndex);
      setSearch(""); // clear search to view the opened book
    }
  };

  // Go back one step
  const handlePrevPage = () => {
    if (pageIndex > 0) {
      setDirection(-1);
      // Dual page view jumps back by 2, single jumps by 1
      const step = window.innerWidth >= 1024 ? 2 : 1;
      setPageIndex(Math.max(0, pageIndex - step));
    }
  };

  // Go forward one step
  const handleNextPage = () => {
    const step = window.innerWidth >= 1024 ? 2 : 1;
    if (pageIndex + step < PAGE_SEQUENCE.length) {
      setDirection(1);
      setPageIndex(Math.min(PAGE_SEQUENCE.length - 1, pageIndex + step));
    }
  };

  // Fetch the stickers belonging to the left page & right page respectively
  const getPageStickers = (code: string) => {
    return stickers.filter((s) => s.code === code).sort((a, b) => a.number - b.number);
  };

  const leftPageInfo = PAGE_SEQUENCE[pageIndex];
  // On wide screens we show both leftPageInfo and the adjacent rightPageInfo
  const showDoublePage = pageIndex + 1 < PAGE_SEQUENCE.length;
  const rightPageInfo = showDoublePage ? PAGE_SEQUENCE[pageIndex + 1] : null;

  return (
    <div className="space-y-6 animate-fadeIn" id="album-collection-view">
      
      {/* 1. FILTER & BOOK CONTROLS BAR */}
      <div className="bg-[#130626] border border-purple-500/20 rounded-2xl p-4 shadow-xl flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search bar */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-pink-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 Search players (e.g. Messi, Bellingham, FWC)..."
            className="w-full bg-[#070312] border border-purple-500/20 text-white rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-pink-500 font-sans transition-colors"
          />
        </div>

        {/* Tactile bookmarks - Jumper buttons */}
        <div className="flex flex-wrap items-center justify-center gap-1 bg-black/45 p-1.5 rounded-2xl border border-purple-500/15">
          <button
            onClick={() => handleTabClick("Cover")}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-tight rounded-xl transition-all cursor-pointer ${
              getActiveCategory() === "Cover"
                ? "bg-gradient-to-r from-teal-400 to-emerald-400 text-slate-900 scale-105 shadow-md font-black"
                : "text-slate-350 hover:text-white font-semibold"
            }`}
          >
            🏠 Cover
          </button>
          <button
            onClick={() => handleTabClick("Specials")}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-tight rounded-xl transition-all cursor-pointer ${
              getActiveCategory() === "Specials"
                ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 scale-105 shadow-md font-black"
                : "text-slate-350 hover:text-white font-semibold"
            }`}
          >
            🏆 Legends
          </button>
          <button
            onClick={() => handleTabClick("A-D")}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-tight rounded-xl transition-all cursor-pointer ${
              getActiveCategory() === "A-D"
                ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white scale-105 shadow-md font-black"
                : "text-slate-350 hover:text-white font-semibold"
            }`}
          >
            🅰️-🅳 Groups A-D
          </button>
          <button
            onClick={() => handleTabClick("E-H")}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-tight rounded-xl transition-all cursor-pointer ${
              getActiveCategory() === "E-H"
                ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white scale-105 shadow-md font-black"
                : "text-slate-350 hover:text-white font-semibold"
            }`}
          >
            🅴-🅷 Groups E-H
          </button>
          <button
            onClick={() => handleTabClick("I-L")}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-tight rounded-xl transition-all cursor-pointer ${
              getActiveCategory() === "I-L"
                ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-900 scale-105 shadow-md font-black"
                : "text-slate-350 hover:text-white font-semibold"
            }`}
          >
            🅸-🅻 Groups I-L
          </button>
          <button
            onClick={() => handleTabClick("CocaCola")}
            className={`px-3 py-1.5 text-xs font-black uppercase tracking-tight rounded-xl transition-all cursor-pointer ${
              getActiveCategory() === "CocaCola"
                ? "bg-gradient-to-r from-red-500 to-rose-500 text-white scale-105 shadow-md font-black"
                : "text-slate-350 hover:text-white font-semibold"
            }`}
          >
            🥤 Cola Cover
          </button>
        </div>

        {/* Direct page jump dropdown */}
        <div className="w-full lg:w-fit font-sans">
          <select
            value={pageIndex}
            onChange={(e) => jumpToPage(Number(e.target.value))}
            className="w-full bg-[#070312] border border-purple-500/20 text-white text-xs font-black rounded-xl p-2.5 focus:outline-none focus:border-pink-500 cursor-pointer text-center"
          >
            {PAGE_SEQUENCE.map((p, idx) => (
              <option key={idx} value={idx}>
                Page {idx + 1}: {p.flag} {p.name} {p.group !== "Cover" && p.group !== "Specials" && p.group !== "CocaCola" ? `(${p.group})` : ""}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* 2. MAIN RESULTS OR INTERACTIVE ALBUM CONTAINER */}
      <AnimatePresence mode="wait">
        {isSearchActive ? (
          
          /* SEARCH MATCHES OVERLAY */
          <motion.div
            key="search-overlay"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-[#130626] to-[#070312] border border-purple-500/20 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-400 animate-spin" />
                <h3 className="text-lg font-black tracking-tight text-white uppercase">🔍 Found Sticker Matching</h3>
              </div>
              <span className="text-xs text-pink-400 bg-purple-950/50 border border-purple-550/20 px-3 py-1 rounded-full font-black uppercase font-mono">
                {searchResults.length} Results
              </span>
            </div>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((card) => (
                  <div key={card.id} className="relative group">
                    <StickerCard
                      sticker={card}
                      onToggleSticker={onToggleSticker}
                      onIncrementDouble={onIncrementDouble}
                      onDecrementDouble={onDecrementDouble}
                    />
                    {/* Floating mini action button to instantly open that team's book page */}
                    <button
                      onClick={() => handleJumpToCardPage(card.code)}
                      className="absolute top-2.5 left-2.5 bg-black/85 hover:bg-pink-500 hover:text-white text-white px-2 py-1 rounded-md text-[9px] font-bold font-mono tracking-wider shadow border border-purple-500/20 flex items-center gap-1 cursor-pointer transition-all uppercase"
                    >
                      <BookOpen className="w-2.5 h-2.5" /> Jump to page
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">
                <HelpCircle className="w-12 h-12 text-slate-500 mx-auto mb-2 animate-bounce" />
                <p className="font-bold">No matching sticker or teammate found!</p>
                <p className="text-xs text-slate-500 mt-1">Check your spelling or choose a tab above to turn book pages!</p>
              </div>
            )}
          </motion.div>

        ) : (

          /* INTERACTIVE REALISTIC OPEN-BOOK FLAT LAYOUT */
          <div key="sticker-book" className="space-y-6">
            
            {/* Quick Helper Ribbon for kids */}
            <div className="bg-gradient-to-r from-purple-950/80 to-[#100122]/90 text-slate-200 text-xs px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 shadow border border-purple-500/20">
              <span className="flex items-center gap-2 font-black font-sans text-pink-400">
                📖 PAGE DIRECTORY ACTIVE: Page {pageIndex + 1} {showDoublePage && `& ${pageIndex + 2}`} of {PAGE_SEQUENCE.length}
              </span>
              <span className="text-[10px] font-bold bg-pink-500 text-white px-2.5 py-0.5 rounded-full uppercase hidden md:inline animate-pulse">
                👦 Kid & Family Mode 👧
              </span>
            </div>

            {/* Tactile Book frame wrapper */}
            <div className="relative bg-gradient-to-br from-[#100325] to-[#0c031c] border-8 border-purple-950/85 rounded-[40px] px-3 py-6 md:p-8 shadow-2xl relative overflow-hidden transition-colors">
              
              {/* Outer bounding design shadows */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#2b0c54]/10 to-black/45 pointer-events-none rounded-[32px]"></div>

              {/* Central Spine line (Simulates open book page separator) */}
              <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-[4px] bg-gradient-to-r from-black/55 via-[#230942] to-black/55 shadow-2xl z-20"></div>

              {/* Animated Pages inside */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative min-h-[480px]">
                
                {/* ─── LEFT PAGE OR MOBILE SINGLE PAGE ─── */}
                <div className="flex flex-col justify-between space-y-4 relative bg-[#070312] rounded-3xl p-5 border border-purple-500/10 shadow-lg">
                  {leftPageInfo.type === "cover" ? (
                    
                    /* COVER RENDERING PAGE */
                    <div className="flex flex-col justify-between h-full space-y-6 text-center pt-8 pb-4">
                      <div className="space-y-4">
                        <div className="inline-block bg-gradient-to-br from-pink-500 to-purple-600 text-white p-4 rounded-3xl shadow-xl animate-bounce">
                          <BookOpen className="w-12 h-12 stroke-[2.5]" />
                        </div>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tight">
                          🏆 My World Cup <br/> sticker album!
                        </h2>
                        <span className="text-[11px] text-pink-400 font-mono font-black uppercase tracking-widest block bg-black/45 py-1 px-3 rounded-full w-fit mx-auto border border-purple-500/20">
                          ⭐️ Official 2026 Edition ⭐️
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto pt-2 font-medium">
                          Hello Super Collector! Welcome to your very own magic companion. Easily swipe pages left or right, check players you find, and complete all 48 countries!
                        </p>
                      </div>

                      <div className="p-4 bg-purple-950/45 border border-purple-500/20 rounded-2xl max-w-xs mx-auto space-y-2">
                        <div className="text-[10px] text-pink-400 font-mono font-black uppercase tracking-wider">
                          🏷️ Collector Trophy Progress
                        </div>
                        <div className="text-xs text-white font-bold">
                          {stickers.filter((s) => s.ownedStatus === "owned").length} inside out of {stickers.length}!
                        </div>
                        <div className="w-full bg-[#05030c] h-2.5 rounded-full overflow-hidden border border-purple-900/40">
                          <div
                            style={{ width: `${Math.round((stickers.filter(s => s.ownedStatus === "owned").length / stickers.length) * 100)}%` }}
                            className="bg-emerald-400 h-full rounded-full transition-all duration-300"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleNextPage}
                        className="w-full sm:w-auto mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-405 hover:to-indigo-405 text-white font-black uppercase text-xs py-3.5 px-8 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>🎒 Flip Page &amp; Start Collecting!</span>
                        <ChevronRight className="w-4 h-4 text-white stroke-[2.5]" />
                      </button>
                    </div>

                  ) : leftPageInfo.type === "fwc" ? (

                    /* SPECIAL LEGENDS */
                    <StickersCollectionGrid
                      code="FWC"
                      sectionName="Special Legends"
                      flag="✨"
                      stickersList={getPageStickers("FWC")}
                      onToggle={onToggleSticker}
                      onAddDouble={onIncrementDouble}
                      onSubDouble={onDecrementDouble}
                      subtitle="FWC Rare Commemorative Gold List"
                      themeType="gold"
                    />

                  ) : leftPageInfo.type === "cc" ? (

                    /* COCA COLA DRINK BACK CONTEST */
                    <StickersCollectionGrid
                      code="CC"
                      sectionName="Coca-Cola Contest"
                      flag="🥤"
                      stickersList={getPageStickers("CC")}
                      onToggle={onToggleSticker}
                      onAddDouble={onIncrementDouble}
                      onSubDouble={onDecrementDouble}
                      subtitle="Commemorative Red Backsheets"
                      themeType="red"
                    />

                  ) : (

                    /* GENERIC COUNTRY SPREAD PLAYERS Left */
                    <StickersCollectionGrid
                      code={leftPageInfo.code}
                      sectionName={leftPageInfo.name}
                      flag={leftPageInfo.flag}
                      stickersList={getPageStickers(leftPageInfo.code)}
                      onToggle={onToggleSticker}
                      onAddDouble={onIncrementDouble}
                      onSubDouble={onDecrementDouble}
                      subtitle={`${leftPageInfo.name} Qualified National Team`}
                      themeType="sky"
                    />

                  )}
                </div>

                {/* ─── RIGHT PAGE spread ─── */}
                <div className="hidden lg:flex flex-col justify-between space-y-4 relative bg-[#070312] rounded-3xl p-5 border border-purple-500/10 shadow-lg">
                  {showDoublePage && rightPageInfo ? (
                    
                    /* RIGHT PAGE SUBJECT CHECKS */
                    rightPageInfo.type === "fwc" ? (
                      
                      <StickersCollectionGrid
                        code="FWC"
                        sectionName="Special Legends"
                        flag="✨"
                        stickersList={getPageStickers("FWC")}
                        onToggle={onToggleSticker}
                        onAddDouble={onIncrementDouble}
                        onSubDouble={onDecrementDouble}
                        subtitle="FWC Rare Commemorative Gold List"
                        themeType="gold"
                      />

                    ) : rightPageInfo.type === "cc" ? (

                      <StickersCollectionGrid
                        code="CC"
                        sectionName="Coca-Cola Contest"
                        flag="🥤"
                        stickersList={getPageStickers("CC")}
                        onToggle={onToggleSticker}
                        onAddDouble={onIncrementDouble}
                        onSubDouble={onDecrementDouble}
                        subtitle="Commemorative Red Backsheets"
                        themeType="red"
                      />

                    ) : (

                      /* RIGHT COUNTRY SPREAD Star list */
                      <StickersCollectionGrid
                        code={rightPageInfo.code}
                        sectionName={rightPageInfo.name}
                        flag={rightPageInfo.flag}
                        stickersList={getPageStickers(rightPageInfo.code)}
                        onToggle={onToggleSticker}
                        onAddDouble={onIncrementDouble}
                        onSubDouble={onDecrementDouble}
                        subtitle={`${rightPageInfo.name} Qualified National Team`}
                        themeType="sky"
                      />

                    )
                  ) : (
                    /* Outer back index or empty slots */
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500/80">
                      <Star className="w-16 h-16 stroke-1 animate-pulse text-pink-500/25 mb-4" />
                      <p className="font-bold text-slate-400">Back Cover of World Cup Companion</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                        Stay active with your friends, trade duplicate stickers fairly, and let's conquer the virtual world trophy!
                      </p>
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Tactile Book Foot controllers */}
            <div className="flex items-center justify-between bg-[#130626] border border-purple-500/20 p-3 rounded-2xl max-w-md mx-auto shadow-xl">
              <button
                onClick={handlePrevPage}
                disabled={pageIndex === 0}
                className={`py-2 px-4 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all text-[#0d031c] cursor-pointer ${
                  pageIndex === 0
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border-slate-900"
                    : "bg-pink-500 hover:bg-pink-600 active:scale-95 border-pink-400 text-white"
                }`}
              >
                <ChevronLeft className="w-4 h-4 stroke-[2.5]" /> Prev
              </button>

              <span className="font-mono text-xs font-bold text-pink-400 select-none bg-black/35 px-4 py-1.5 rounded-xl border border-purple-500/25">
                Page {pageIndex + 1} {showDoublePage && `& ${pageIndex + 2}`} / {PAGE_SEQUENCE.length}
              </span>

              <button
                onClick={handleNextPage}
                disabled={pageIndex + (window.innerWidth >= 1024 ? 2 : 1) >= PAGE_SEQUENCE.length}
                className={`py-2 px-4 rounded-xl font-black text-xs uppercase flex items-center gap-1.5 transition-all text-[#0d031c] cursor-pointer ${
                  pageIndex + (window.innerWidth >= 1024 ? 2 : 1) >= PAGE_SEQUENCE.length
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed border-slate-900"
                    : "bg-pink-500 hover:bg-pink-600 active:scale-95 border-pink-400 text-white"
                }`}
              >
                Next <ChevronRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

