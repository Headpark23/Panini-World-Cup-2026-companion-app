import React, { useState, useEffect, useMemo } from "react";
import { Sparkles, Share2, Info, BookOpen, Layers, Trophy, AlertCircle, Copy, Check, Users, Home, Camera, Cloud, CloudOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Sticker } from "./types";
import { INITIAL_STICKERS } from "./data/stickers";

// Importing our modular sub-components
import AIUploader from "./components/AIUploader";
import StatisticsPanel from "./components/StatisticsPanel";
import AlbumView from "./components/AlbumView";
import DashboardHome from "./components/DashboardHome";
import NeedView from "./components/NeedView";
import DoublesView from "./components/DoublesView";
import GotView from "./components/GotView";

// Firebase imports
import { auth, db } from "./lib/firebase";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import AuthModal from "./components/AuthModal";

export default function App() {
  const [stickers, setStickers] = useState<Sticker[]>(() => {
    try {
      const saved = localStorage.getItem("panini_stickers_v2");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load stickers from localStorage:", e);
    }
    return INITIAL_STICKERS;
  });

  const [activeTab, setActiveTab] = useState<"dashboard" | "album" | "need" | "doubles" | "got" | "camera" | "share">("dashboard");
  const [copiedShareLink, setCopiedShareLink] = useState(false);
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);

  // Authentication & Cloud states
  const [user, setUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isCloudLoading, setIsCloudLoading] = useState(false);

  // Firebase auth state listener & state restoration
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsCloudLoading(true);
        try {
          const docRef = doc(db, "users", currentUser.uid, "tracker", "state");
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            const cloudMap = data.stickersMap || {};
            // Merge cloud keys over INITIAL_STICKERS to form absolute sticker list
            const merged = INITIAL_STICKERS.map((s) => {
              const cloudState = cloudMap[s.id];
              if (cloudState) {
                return {
                  ...s,
                  ownedStatus: cloudState.ownedStatus,
                  doublesCount: cloudState.doublesCount,
                };
              }
              return {
                ...s,
                ownedStatus: "needed" as const,
                doublesCount: 0,
              };
            });
            setStickers(merged);
            console.log("Stickers state restored successfully from Firestore!");
          } else {
            console.log("No cloud tracking session existed yet. Initial progress will back up automatically.");
          }
        } catch (err) {
          console.error("Failed to restore stickers from Firestore:", err);
        } finally {
          setIsCloudLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Monitor and capture standard PWA install prompt event
  useEffect(() => {
    const handleBeforePrompt = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforePrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforePrompt);
    };
  }, []);

  // Sync to localstorage
  useEffect(() => {
    try {
      localStorage.setItem("panini_stickers_v2", JSON.stringify(stickers));
    } catch (e) {
      console.error("Failed saving stickers to localStorage:", e);
    }
  }, [stickers]);

  // Sync to Cloud Firestore when stickers or user changes (debounced by 1s)
  useEffect(() => {
    if (!user) return;

    const saveToCloud = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "tracker", "state");
        const cloudStateMap: Record<string, { ownedStatus: string; doublesCount: number }> = {};
        
        stickers.forEach((s) => {
          if (s.ownedStatus === "owned" || s.doublesCount > 0) {
            cloudStateMap[s.id] = {
              ownedStatus: s.ownedStatus,
              doublesCount: s.doublesCount,
            };
          }
        });

        await setDoc(docRef, {
          userId: user.uid,
          updatedAt: new Date().toISOString(),
          stickersMap: cloudStateMap,
        });
        console.log("Stickers successfully synced to Cloud Firestore.");
      } catch (err) {
        console.error("Error saving stickers to Firestore", err);
      }
    };

    const timer = setTimeout(() => {
      saveToCloud();
    }, 1000);

    return () => clearTimeout(timer);
  }, [stickers, user]);

  // Handle manual sticker owned toggler
  const handleToggleSticker = (id: string) => {
    setStickers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const isOwned = s.ownedStatus === "owned";
          return {
            ...s,
            ownedStatus: isOwned ? "needed" : "owned",
            // If toggling off, reset duplicates to 0
            doublesCount: isOwned ? 0 : s.doublesCount,
          };
        }
        return s;
      })
    );
  };

  // Handle increment swap count
  const handleIncrementDouble = (id: string) => {
    setStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, doublesCount: s.doublesCount + 1 } : s))
    );
  };

  // Handle decrement swap count
  const handleDecrementDouble = (id: string) => {
    setStickers((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, doublesCount: Math.max(0, s.doublesCount - 1) } : s
      )
    );
  };

  // Process stickers recognized by the AI Photo scan
  const handleStickersScanned = (detectedIds: string[]) => {
    setStickers((prev) => {
      return prev.map((s) => {
        if (detectedIds.includes(s.id)) {
          if (s.ownedStatus === "owned") {
            // Already owned -> Increment doubles count as it is a safe duplicate
            return { ...s, doublesCount: s.doublesCount + 1 };
          } else {
            // Not owned yet -> Mark as owned
            return { ...s, ownedStatus: "owned" };
          }
        }
        return s;
      });
    });
    // Navigate home or to catalog
    setActiveTab("album");
  };

  // Handle batch sticker status updates
  const handleBatchUpdateStatus = (detectedIds: string[], targetStatus: "owned" | "needed") => {
    setStickers((prev) =>
      prev.map((s) => {
        if (detectedIds.includes(s.id)) {
          return {
            ...s,
            ownedStatus: targetStatus,
            // If marking as needed, make sure duplicates is 0
            doublesCount: targetStatus === "needed" ? 0 : s.doublesCount,
          };
        }
        return s;
      })
    );
  };

  // Memorized available sticker ids in the system for validator lookup
  const availableStickerIds = useMemo(() => stickers.map((s) => s.id), [stickers]);

  // Solve currentWackyFact logic based on owned stickers (or default)
  const currentWackyFact = useMemo(() => {
    const ownedWithFacts = stickers.filter((s) => s.ownedStatus === "owned" && s.fact);
    if (ownedWithFacts.length > 0) {
      const randomIndex = Math.floor(Math.random() * ownedWithFacts.length);
      return {
        fact: ownedWithFacts[randomIndex].fact || "No special fact available.",
        player: ownedWithFacts[randomIndex].name,
        code: ownedWithFacts[randomIndex].id
      };
    }
    return {
      fact: "The Lusail Stadium's golden bowl shape is inspired by handmade lantern bowls used across the Middle East for centuries.",
      player: "Lusail Stadium Qatar",
      code: "FWC 3"
    };
  }, [stickers]);

  // Format a swap list text output to share with friends
  const shareText = useMemo(() => {
    const needed = stickers.filter((s) => s.ownedStatus === "needed").map((s) => s.id);
    const doubles = stickers
      .filter((s) => s.doublesCount > 0)
      .map((s) => `${s.id} (${s.doublesCount}x)`);

    const total = stickers.length;
    const uniqueCount = stickers.filter((s) => s.ownedStatus === "owned").length;
    const percentage = total > 0 ? Math.round((uniqueCount / total) * 100) : 0;

    return `🏆 Panini World Cup Sticker Companion Tracker! ⚽
Progress: ${percentage}% Complete (${uniqueCount} of ${total} stickers tracking 48 teams + FWC + Coca Cola)

🔍 MY STICKERS I STILL NEED:
${needed.length > 0 ? needed.join(", ") : "All complete! 🎉"}

🔄 MY SWAPS KEY (DOUBLES TO TRADE):
${doubles.length > 0 ? doubles.join(", ") : "No doubles available right now."}

Let's trade physical stickers and fill our albums together! 🤝`;
  }, [stickers]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText);
    setCopiedShareLink(true);
    setTimeout(() => setCopiedShareLink(false), 3500);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handleShareText = () => {
    const text = encodeURIComponent(shareText);
    window.open(`sms:?body=${text}`, "_self");
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent("My 2026 World Cup Sticker Checklist & Swaps!");
    const body = encodeURIComponent(shareText);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  };

  const downloadOfflineApp = () => {
    const total = stickers.length;
    const ownedCount = stickers.filter((s) => s.ownedStatus === "owned").length;
    const needCount = total - ownedCount;
    const percentage = total > 0 ? Math.round((ownedCount / total) * 100) : 0;
    const neededList = stickers.filter((s) => s.ownedStatus === "needed").map(s => s.id).join(", ");
    
    const offlineHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>2026 Sticker Companion</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="apple-touch-icon" href="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/26bd.png">
  <link rel="icon" href="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/26bd.png">
  <style>
    body {
      background: #07070a;
      color: #f1f5f9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      text-align: center;
      padding: 30px 15px;
      margin: 0;
    }
    .container {
      background: linear-gradient(135deg, #130626, #07030e);
      border: 2px solid #a855f7;
      border-radius: 28px;
      padding: 30px 20px;
      max-width: 440px;
      margin: 0 auto;
      box-shadow: 0 15px 40px rgba(0,0,0,0.6);
    }
    .logo {
      font-size: 72px;
      display: inline-block;
      margin-bottom: 5px;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(5deg); }
    }
    h1 {
      font-size: 24px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: -0.5px;
      margin: 10px 0 5px 0;
      color: #ffffff;
    }
    .subtitle {
      font-size: 11px;
      font-weight: 800;
      color: #f59e0b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      margin-bottom: 20px;
    }
    .progress-box {
      background: rgba(0,0,0,0.4);
      border-radius: 18px;
      padding: 15px;
      margin-bottom: 20px;
      border: 1px solid rgba(168,85,247,0.2);
    }
    .progress-bar-bg {
      background: #110925;
      height: 12px;
      border-radius: 99px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-bar-fill {
      background: linear-gradient(90deg, #10b981, #ec4899, #f59e0b);
      height: 100%;
      border-radius: 99px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 700;
    }
    .badge-needed {
      background: #ec4899;
      color: white;
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 11px;
    }
    .badge-owned {
      background: #10b981;
      color: white;
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 11px;
    }
    .guide-box {
      background: rgba(168, 85, 247, 0.08);
      border: 1px dashed rgba(168, 85, 247, 0.3);
      padding: 15px;
      border-radius: 16px;
      text-align: left;
      font-size: 12px;
      line-height: 1.5;
      color: #cbd5e1;
      margin-top: 20px;
    }
    .guide-box strong {
      color: #ffffff;
    }
    .btn {
      background: linear-gradient(135deg, #a855f7, #6366f1);
      color: white;
      border: none;
      padding: 14px 20px;
      border-radius: 16px;
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      cursor: pointer;
      width: 100%;
      margin-top: 15px;
      box-shadow: 0 4px 15px rgba(168,85,247,0.4);
      transition: all 0.2s;
    }
    .btn:active {
      transform: scale(0.98);
    }
    .needed-preview {
      max-height: 120px;
      overflow-y: auto;
      background: rgba(0,0,0,0.6);
      padding: 10px;
      border-radius: 12px;
      font-family: monospace;
      font-size: 11px;
      color: #fda4af;
      word-wrap: break-word;
      text-align: left;
      border: 1px solid rgba(236,72,153,0.15);
    }
    .copyright {
      font-size: 10px;
      color: #64748b;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">⚽</div>
    <h1>Sticker Companion</h1>
    <div class="subtitle">2026 World Cup Collector</div>
    
    <div class="progress-box">
      <div class="stat-row">
        <span>Collection Progress</span>
        <span style="color: #10b981;">${percentage}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: ${percentage}%"></div>
      </div>
      <div style="display: flex; justify-content: space-between; margin-top: 10px; font-size: 11px; color: #94a3b8;">
        <span>Got: <strong>${ownedCount}</strong></span>
        <span>Need: <strong>${needCount}</strong></span>
      </div>
    </div>

    <div style="text-align: left; margin-bottom: 8px;">
      <span class="badge-needed">🚨 Stickers Still Needed (${needCount})</span>
    </div>
    <div class="needed-preview">
      ${neededList || "No stickers needed! You completed the album! 🎉"}
    </div>

    <div class="guide-box">
      <strong>📱 Add to Phone Companion:</strong><br>
      • <strong>iPhone / Safari:</strong> Tap the Share button <span style="font-size: 14px;">📤</span>, then scroll and select <strong>"Add to Home Screen"</strong>.<br><br>
      • <strong>Android / Chrome:</strong> Tap the options menu <span style="font-size: 14px;">⋮</span>, then select <strong>"Add to Home Screen"</strong> or <strong>"Install App"</strong>.<br><br>
      Fits perfectly onto your phone screen with a beautiful <strong>football ⚽ icon</strong>!
    </div>

    <button class="btn" onclick="alert('Offline sticker list is loaded and fully operational on this phone!')">
      Launch Compact App
    </button>
    
    <div class="copyright">
      © Martin White 2026 • Ported Web App
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([offlineHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "WorldCupCompanion.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerOneClickDownload = async () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      const { outcome } = await pwaPrompt.userChoice;
      if (outcome === "accepted") {
        setPwaPrompt(null);
        return;
      }
    }
    // Standard beautiful offline HTML app backup one-click companion download
    downloadOfflineApp();
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-slate-100 font-sans p-4 md:p-8 selection:bg-amber-400 selection:text-black animate-fadeIn" id="app-wrapper">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* TOP OF PAGE QUICK NAVIGATION CAPSULES TO EACH SEPARATE SECTION */}
        <div className="bg-[#100720]/90 border border-purple-500/20 p-2.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-center gap-1.5 w-full" id="root-tabs-nav-header">
          <button
            id="nav-btn-dashboard"
            onClick={() => setActiveTab("dashboard")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer select-none ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-md scale-102 ring-2 ring-purple-400/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🏠 Home</span>
          </button>
          
          <button
            id="nav-btn-album"
            onClick={() => setActiveTab("album")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer select-none ${
              activeTab === "album"
                ? "bg-cyan-600 hover:bg-cyan-500 text-white shadow-md scale-102 ring-2 ring-cyan-400/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>📔 Book</span>
          </button>

          <button
            id="nav-btn-need"
            onClick={() => setActiveTab("need")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer select-none ${
              activeTab === "need"
                ? "bg-pink-600 hover:bg-pink-500 text-white shadow-md scale-102 ring-2 ring-pink-400/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>📋 Missing</span>
          </button>

          <button
            id="nav-btn-got"
            onClick={() => setActiveTab("got")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer select-none ${
              activeTab === "got"
                ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md scale-102 ring-2 ring-emerald-400/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🏆 Acquired</span>
          </button>

          <button
            id="nav-btn-doubles"
            onClick={() => setActiveTab("doubles")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer select-none ${
              activeTab === "doubles"
                ? "bg-amber-500 hover:bg-amber-400 text-slate-900 shadow-md scale-102 ring-2 ring-amber-400/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>🔄 Swaps</span>
          </button>

          <button
            id="nav-btn-camera"
            onClick={() => setActiveTab("camera")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer select-none ${
              activeTab === "camera"
                ? "bg-purple-600 hover:bg-purple-500 text-white shadow-md scale-102 ring-2 ring-purple-400/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>📷 AI Scan</span>
          </button>

          <button
            id="nav-btn-share"
            onClick={() => setActiveTab("share")}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer select-none ${
              activeTab === "share"
                ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md scale-102 ring-2 ring-indigo-400/30"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>📤 Share</span>
          </button>
        </div>

        {/* CLOUD SYNC & AUTH STATUS BAR */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#110720]/95 border border-purple-500/20 p-3.5 rounded-2xl shadow-xl text-xs" id="cloud-sync-status-bar">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-3 w-3 shrink-0">
              {isCloudLoading ? (
                <span className="animate-spin rounded-full h-3 w-3 border border-purple-500 border-t-transparent"></span>
              ) : (
                <>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${user ? "bg-emerald-400" : "bg-amber-400"}`}></span>
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${user ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                </>
              )}
            </div>
            <span className="font-mono text-slate-300 flex items-center gap-1.5 flex-wrap">
              {isCloudLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-purple-400 animate-spin" />
                  <span>Synchronizing collections with Secure Cloud database...</span>
                </>
              ) : user ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Cloud Backup Active: <strong className="text-emerald-400">{user.email}</strong></span>
                </>
              ) : (
                <>
                  <CloudOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Device Offline Storage Active • <span className="text-amber-300/90 font-bold">Log in to save data across all your devices &amp; avoid data loss!</span></span>
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {user ? (
              <button
                type="button"
                onClick={() => signOut(auth)}
                className="w-full sm:w-auto bg-red-500/10 hover:bg-red-500/20 text-red-300 font-bold font-mono px-3 py-1.5 rounded-xl border border-red-500/20 text-[10px] uppercase tracking-wider transition-all cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black uppercase tracking-wider px-4 py-2 rounded-xl border border-purple-400/20 transition-all cursor-pointer shadow-lg shadow-purple-500/10 text-[10px]"
              >
                🔑 Log In or Sign Up
              </button>
            )}
          </div>
        </div>
        
        {/* CONDITIONAL RENDERING OF THE DASHBOARD LANDING OR THE SUB-SECTION HEADER */}
        {activeTab === "dashboard" ? (
          <>
            {/* 1. TOP FRIENDLY COMPANION CONTEXT */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white text-xs px-4 py-2.5 rounded-xl flex items-center justify-between gap-3 shadow-xl border border-white/10" id="buddy-warning-banner">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-yellow-300 shrink-0" />
                <p className="font-semibold tracking-wide">
                  <strong>⭐ Super Collector Mode:</strong> Ready to log physical stickers, discover fun football facts, and manage duplicates with friends!
                </p>
              </div>
              <span className="hidden sm:inline bg-black/35 px-2.5 py-1 rounded-full font-mono uppercase text-[9px] font-black text-amber-300 border border-amber-300/20">
                🏟️ Stadium Hub Active
              </span>
            </div>
 
            {/* 2. DEDICATED FULL-SIZED HEADER (WITHOUT REPEAT NAV TABS) */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-[#110521] via-[#051111]/90 to-[#0e0a1b] border-2 border-purple-500/25 p-7 rounded-[32px] shadow-2xl relative overflow-hidden" id="app-header">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-amber-400 via-pink-500 via-purple-500 to-emerald-400"></div>
              {/* Background grass pattern hint */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-amber-405 text-white bg-gradient-to-r from-amber-400 to-yellow-500 p-2.5 rounded-2xl shadow-lg ring-4 ring-amber-400/10">
                    <Trophy className="w-6.5 h-6.5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black tracking-tight text-white uppercase sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-amber-200">
                      World Cup Album Companion
                    </h1>
                    <p className="text-xs text-amber-300 font-extrabold font-mono uppercase tracking-widest mt-1.5 flex items-center gap-1.5">
                      ★ 48 National Teams • Legends • Coca-Cola Edition ★
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-950/80 rounded-2xl py-2 px-4 border border-purple-500/25 hidden md:block">
                <span className="text-[10px] font-mono text-purple-300 font-extrabold tracking-widest">🏆 LOCAL COMPANION CLIENT ACTIVE</span>
              </div>
            </header>
 
            {/* 3. COHESIVE HISTOGRAMS & GENERAL STATS */}
            <StatisticsPanel stickers={stickers} />
          </>
        ) : (
          /* SHOW BACK TO DASHBOARD NAVIGATION ON EVERY SINGLE OTHER OPTION SECTION */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#120a24] border border-purple-500/25 p-5 rounded-3xl shadow-2xl relative overflow-hidden mb-6 animate-fadeIn" id="back-nav-bar">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-pink-500 via-purple-500 to-emerald-400"></div>
            
            <button
              onClick={() => setActiveTab("dashboard")}
              className="group flex items-center gap-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs uppercase font-mono px-6 py-3 rounded-2xl shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Return to primary landing space"
            >
              <Home className="w-4 h-4 text-white stroke-[2.5]" />
              <span>← Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xl">⚽</span>
              <div className="text-center sm:text-right">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  {activeTab === "album" && "📔 Album Collector Directory"}
                  {activeTab === "need" && "📋 Missing Plate Checklist"}
                  {activeTab === "got" && "💎 Acquired Showroom"}
                  {activeTab === "doubles" && "🔄 Swaps Trade Deck"}
                  {activeTab === "camera" && "📷 Live AI Uploader"}
                  {activeTab === "share" && "📤 Sharing Dashboard"}
                </h2>
                <span className="text-[10px] text-amber-300 font-mono font-bold uppercase tracking-widest block mt-0.5">
                  World Cup Sticker Tracker Companion
                </span>
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY LAYOUT */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
              >
                <DashboardHome
                  stickers={stickers}
                  onNavigate={(tab) => setActiveTab(tab)}
                  currentWackyFact={currentWackyFact}
                />
              </motion.div>
            )}

            {activeTab === "album" && (
              <motion.div
                key="album"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.15 }}
              >
                <AlbumView
                  stickers={stickers}
                  onToggleSticker={handleToggleSticker}
                  onIncrementDouble={handleIncrementDouble}
                  onDecrementDouble={handleDecrementDouble}
                />
              </motion.div>
            )}

            {activeTab === "need" && (
              <motion.div
                key="need"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
              >
                <NeedView
                  stickers={stickers}
                  onToggleSticker={handleToggleSticker}
                  onBatchUpdateStatus={handleBatchUpdateStatus}
                />
              </motion.div>
            )}

            {activeTab === "got" && (
              <motion.div
                key="got"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <GotView
                  stickers={stickers}
                  onToggleSticker={handleToggleSticker}
                  onBatchUpdateStatus={handleBatchUpdateStatus}
                />
              </motion.div>
            )}

            {activeTab === "doubles" && (
              <motion.div
                key="doubles"
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                transition={{ duration: 0.15 }}
              >
                <DoublesView
                  stickers={stickers}
                  onToggleSticker={handleToggleSticker}
                  onIncrementDouble={handleIncrementDouble}
                  onDecrementDouble={handleDecrementDouble}
                />
              </motion.div>
            )}

            {activeTab === "camera" && (
              <motion.div
                key="camera"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <AIUploader
                  onStickersScanned={handleStickersScanned}
                  availableStickerIds={availableStickerIds}
                />
              </motion.div>
            )}

            {activeTab === "share" && (
              <motion.div
                key="share"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.15 }}
                className="bg-[#0d071d] border border-purple-500/25 rounded-3xl p-6 shadow-2xl space-y-4"
                id="share-section"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="w-5 h-5 text-pink-400" />
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Export Swaps &amp; Needed List</h2>
                </div>

                <p className="text-sm text-slate-300">
                  Below is your live, beautifully auto-formatted physical card checklist showing stickers you still query ("Needed") and extras to trade with other collectors. Copy and distribute it directly in messaging platforms!
                </p>

                <div className="relative">
                  <pre className="bg-[#06030c] border border-purple-900/40 text-slate-300 text-xs rounded-2xl p-4 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed h-72">
                    {shareText}
                  </pre>

                  <button
                    onClick={copyToClipboard}
                    className="absolute bottom-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-lg cursor-pointer"
                  >
                    {copiedShareLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Copied Checklist
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Checklist
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PERSISTENT FOOTER UTILITY FOR ONE-CLICK PHONE DOWNLOAD & QUICK SHARING */}
        <div className="bg-gradient-to-br from-[#120526] to-[#05020c] border border-purple-500/20 rounded-3xl p-6 shadow-2xl space-y-6 mt-8" id="persistent-install-share-card">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-purple-500/10">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>⚽</span> 2026 World Cup Collector Companion App
              </h3>
              <p className="text-xs text-purple-300 font-medium">
                Install to your phone Home Screen or directly message classmates, friends &amp; family!
              </p>
            </div>
            
            {/* ONE-CLICK DOWNLOAD TO PHONE BUTTON WITH SOCCER ICON */}
            <button
              id="pwa-oneclick-install-btn"
              onClick={triggerOneClickDownload}
              className="bg-gradient-to-r from-amber-500 via-pink-500 to-purple-600 hover:from-amber-400 hover:via-pink-400 hover:to-purple-500 text-slate-950 hover:text-white font-black text-xs uppercase px-5 py-3 rounded-2xl transition-all hover:scale-[1.01] active:scale-98 cursor-pointer shadow-xl flex items-center justify-center gap-2 tracking-wide self-start md:self-auto"
            >
              <span className="text-lg animate-spin" style={{ animationDuration: '6s' }}>⚽</span>
              <span>Download App to Phone</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* WHATSAPP SHARE */}
            <button
              id="share-whatsapp-btn"
              onClick={handleShareWhatsApp}
              className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs uppercase p-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md select-none"
            >
              <span className="text-sm">💬</span>
              <span>Share via WhatsApp</span>
            </button>

            {/* SMS / TEXT SHARE */}
            <button
              id="share-text-btn"
              onClick={handleShareText}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs uppercase p-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md select-none"
            >
              <span className="text-sm">📱</span>
              <span>Share by Text (SMS)</span>
            </button>

            {/* EMAIL SHARE */}
            <button
              id="share-email-btn"
              onClick={handleShareEmail}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase p-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md select-none"
            >
              <span className="text-sm">✉️</span>
              <span>Share by Email</span>
            </button>
          </div>
        </div>

        {/* COPYRIGHT WITH MARTIN WHITE 2026 */}
        <footer className="text-center text-[11px] text-slate-500 font-bold uppercase tracking-wider py-8 border-t border-purple-500/10 animate-pulse" id="copyright-footer">
          <p>© Martin White 2026 • Ported Companion App</p>
        </footer>

        {/* AUTHENTICATION FLOW MODAL */}
        <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      </div>
    </div>
  );
}
