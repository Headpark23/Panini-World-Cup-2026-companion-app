import React, { useRef, useState } from "react";
import { Camera, Upload, Check, RefreshCw, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Sticker } from "../types";

interface AIUploaderProps {
  onStickersScanned: (detectedIds: string[]) => void;
  availableStickerIds: string[];
}

export default function AIUploader({ onStickersScanned, availableStickerIds }: AIUploaderProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{ detected: string[]; message: string } | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Drag and drop event handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setErrorMessage(null);
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  // Camera capture handlers
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      setErrorMessage(null);
      setScanResult(null);
      setImagePreview(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera access failed", err);
      setErrorMessage("📷 Camera access denied. Please use the upload-file feature instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setImagePreview(dataUrl);
        stopCamera();
      }
    }
  };

  // Sending the visual data to our server API endpoint
  const scanStickers = async () => {
    if (!imagePreview) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ocr-stickers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imagePreview }),
      });

      if (!res.ok) {
        throw new Error("HTTP connection failed during scanner communication");
      }

      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setScanResult({
        detected: data.detected || [],
        message: data.message || "Stickers identified!",
      });
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to analyze the sticker purchase.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyDetectedStickers = () => {
    if (scanResult && scanResult.detected.length > 0) {
      // Pass the detected codes to parent state
      onStickersScanned(scanResult.detected);
      setScanResult(null);
      setImagePreview(null);
    }
  };

  return (
    <div className="bg-[#0f2e5c] border border-[#1e4d8e] rounded-2xl p-6 shadow-xl relative overflow-hidden" id="ai-scanner-section">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400 opacity-5 rounded-full blur-3xl"></div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <h2 className="text-xl font-black tracking-tight text-white uppercase">📷 Magic AI Sticker Scanner!</h2>
        </div>
        <span className="text-xs bg-amber-400/20 text-[#ffb000] font-mono px-2 py-1 rounded border border-amber-400/30 font-bold uppercase">
          Super AI Helper ✨
        </span>
      </div>

      <p className="text-sm text-slate-200 mb-6 font-medium">
        Got real sticker packets from the store? ⚽ Snap a picture or upload an image here, and our friendly AI assistant will instantly read the numbers and stick them in your book!
      </p>

      {/* Main control bounds */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {/* CAMERA FEED ACTIVATED */}
          {isCameraActive && (
            <motion.div
              key="camera-feed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative rounded-xl overflow-hidden aspect-video bg-black flex flex-col justify-center border border-slate-700"
            >
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
                <button
                  onClick={capturePhoto}
                  className="bg-amber-400 hover:bg-amber-500 text-[#0f2e5c] font-black px-5 py-2 rounded-full flex items-center gap-1.5 shadow-lg shadow-black/40 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" /> Snapshot 📸
                </button>
                <button
                  onClick={stopCamera}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* NO PREVIEW & CAMERA INACTIVE */}
          {!imagePreview && !isCameraActive && (
            <motion.div
              key="uploader-drop-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                dragActive
                  ? "border-amber-400 bg-amber-400/5 text-amber-400"
                  : "border-[#1e4d8e] hover:border-slate-400 hover:bg-white/5 text-slate-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-10 h-10 mb-3 text-amber-300 animate-bounce" />
              <p className="text-sm text-center font-black text-white">
                Drag &amp; drop picture of real stickers here!
              </p>
              <p className="text-xs text-center text-slate-300 mt-1">
                or click here to select a saved photo from your device 💻
              </p>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-amber-400 bg-black/40 px-3 py-1 rounded-full font-bold">Clear Daylight Photos work best! ☀️</span>
              </div>
            </motion.div>
          )}

          {/* IMAGE PREVIEW ACTIVE */}
          {imagePreview && !isCameraActive && (
            <motion.div
              key="image-preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative rounded-xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-[#1e4d8e]"
            >
              <img src={imagePreview} alt="Physical purchase" className="max-w-full max-h-full object-contain" />
              <button
                onClick={() => {
                  setImagePreview(null);
                  setScanResult(null);
                }}
                className="absolute top-3 right-3 bg-red-500/80 hover:bg-red-600 text-white p-2 rounded-full shadow transition-colors"
                title="Remove Image"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Canvas for capture manipulation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Error notification banner */}
        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500/30 text-rose-300 rounded-lg p-3 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <p className="flex-1">{errorMessage}</p>
          </div>
        )}

        {/* ACTION SWITCHERS */}
        <div className="flex gap-2">
          {!isCameraActive && !imagePreview && (
            <button
              onClick={startCamera}
              className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-450 text-[#0f2e5c] font-black py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md text-sm cursor-pointer hover:-translate-y-0.5"
            >
              <Camera className="w-4 h-4" /> Start Camera Scanner! 📸
            </button>
          )}

          {imagePreview && !isAnalyzing && !scanResult && (
            <button
              onClick={scanStickers}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md text-sm cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-250 animate-spin" /> ✨ Magic Read Stickers!
            </button>
          )}

          {isAnalyzing && (
            <div className="flex-1 bg-slate-800 text-amber-200 py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm border border-slate-700 animate-pulse font-bold">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
              🧙‍♂️ Magic AI is reading your stickers... please wait! ✨
            </div>
          )}
        </div>

        {/* OCR Result Approval Modal/Box */}
        <AnimatePresence>
          {scanResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border border-emerald-500/30 bg-emerald-950/45 rounded-xl p-4 mt-4 space-y-3"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase">
                <Check className="w-4 h-4 text-emerald-350 shrink-0" /> 🎉 AI Scanner Done!
              </div>

              <p className="text-xs text-slate-250 font-semibold">{scanResult.message}</p>

              {scanResult.detected.length > 0 ? (
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Stickers Found ({scanResult.detected.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {scanResult.detected.map((code, idx) => {
                      const isValid = availableStickerIds.includes(code);
                      return (
                        <span
                          key={idx}
                          className={`text-xs font-mono px-2 py-0.5 rounded border ${
                            isValid
                              ? "bg-slate-900 border-emerald-500/50 text-emerald-300"
                              : "bg-slate-900 border-red-500/40 text-red-300 line-through"
                          }`}
                          title={isValid ? "Supported Sticker Code" : "Invalid Code for Album"}
                        >
                          {code}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-300 bg-amber-400/5 p-2 rounded border border-amber-400/20">
                  No recognizable country stickers detected. Try checking physical codes (e.g. ARG 10, FWC 2) in clean daylight!
                </p>
              )}

              <div className="flex gap-2 pt-2">
                {scanResult.detected.length > 0 && (
                  <button
                    onClick={applyDetectedStickers}
                    className="flex-1 bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-450 text-slate-950 text-xs font-black py-2.5 px-3 rounded-lg transition-all shadow-lg cursor-pointer"
                  >
                    💚 Yes! Paste These in My Album! ⚽
                  </button>
                )}
                <button
                  onClick={() => setScanResult(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2.5 px-3 rounded-lg transition-colors cursor-pointer"
                >
                  🗑️ Try Another Picture
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
