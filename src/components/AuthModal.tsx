import React, { useState } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { motion } from "motion/react";
import { LogIn, UserPlus, X, AlertCircle } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDismissible?: boolean;
}

export default function AuthModal({ isOpen, onClose, isDismissible = true }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error("Auth error", err);
      // Beautiful human-readable error messages
      let msg = "Authentication failed. Please check your credentials.";
      if (err?.code === "auth/email-already-in-use") {
        msg = "This email address is already in use by another account.";
      } else if (err?.code === "auth/weak-password") {
        msg = "Password is too weak. Please use at least 6 characters.";
      } else if (err?.code === "auth/invalid-credential") {
        msg = "Invalid email or password. Please try again.";
      } else if (err?.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn" id="auth-modal-backdrop">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-gradient-to-b from-[#160b2d] to-[#0a0515] border-2 border-purple-500/30 rounded-3xl p-6 shadow-2xl relative"
        id="auth-modal-content"
      >
        {isDismissible && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition duration-150 cursor-pointer"
            id="close-auth-modal"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6 mt-2">
          <div className="text-4xl mb-2">🏆</div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            {isSignUp ? "Create Collector Account" : "Sign in to Panini World Cup 2026 sticker companion app"}
          </h2>
          <p className="text-xs text-purple-300 mt-1">
            {isSignUp
              ? "Instantly sync and backup your stickers checker across devices!"
              : "Access your cloud-saved World Cup sticker checklist"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-200 text-xs px-4 py-3 rounded-2xl flex items-start gap-2.5 mb-4" id="auth-error-banner">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" id="auth-modal-form">
          <div>
            <label className="block text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full bg-[#0a0515] border border-purple-500/20 text-slate-100 text-sm rounded-2xl p-3.5 focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/60 outline-none transition duration-150"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#0a0515] border border-purple-500/20 text-slate-100 text-sm rounded-2xl p-3.5 focus:border-pink-500/60 focus:ring-1 focus:ring-pink-500/60 outline-none transition duration-150"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-500 hover:via-pink-500 hover:to-amber-400 text-white font-black text-xs uppercase p-4 rounded-2xl transition duration-150 flex items-center justify-center gap-2 tracking-wider shadow-lg shadow-purple-500/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
            ) : isSignUp ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Register Account</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Login Securely</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-400 border-t border-purple-500/10 pt-4" id="auth-modal-footer">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer bg-transparent border-none p-0"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
              >
                Sign In
              </button>
            </p>
          ) : (
            <p>
              New collector?{" "}
              <button
                type="button"
                className="text-pink-400 hover:text-pink-300 font-bold underline cursor-pointer bg-transparent border-none p-0"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
              >
                Register Free
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
