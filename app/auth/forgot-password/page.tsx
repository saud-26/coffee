"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--coffee-gradient)" }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card rounded-2xl p-10 max-w-md text-center">
          <span className="text-5xl block mb-4">✉️</span>
          <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-2" style={{ color: "var(--coffee-text-primary)" }}>Check your email</h2>
          <p className="text-sm mb-6" style={{ color: "var(--coffee-text-secondary)" }}>
            We sent a password reset link to <strong style={{ color: "var(--coffee-accent)" }}>{email}</strong>
          </p>
          <Link href="/auth/login" className="btn-accent px-6 py-2.5 rounded-full text-sm font-semibold inline-block">Back to Login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--coffee-gradient)" }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">☕</span>
            <span className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
              BREW <span style={{ color: "var(--coffee-accent)" }}>&</span> CO.
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: "var(--coffee-text-secondary)" }}>Reset your password</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium mb-1.5" style={{ color: "var(--coffee-text-secondary)" }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--coffee-accent)] transition-all" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }} placeholder="you@example.com" />
            </div>
            {error && <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>}
            <button type="submit" disabled={loading} className="w-full btn-accent py-3 rounded-xl text-sm font-semibold tracking-wide uppercase disabled:opacity-50">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--coffee-text-secondary)" }}>
            Remembered it? <Link href="/auth/login" className="font-medium" style={{ color: "var(--coffee-accent)" }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
