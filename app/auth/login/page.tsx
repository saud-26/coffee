"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const errorParam = searchParams.get("error");
  const [error, setError] = useState(
    errorParam === "not_admin"
      ? "Access denied. This account does not have admin permissions."
      : errorParam
        ? `Access Denied: ${errorParam}`
        : ""
  );
  const supabase = createClient();

  const resolvePostLoginRoute = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role === "admin") {
      return "/admin";
    }

    return redirect;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      const target = await resolvePostLoginRoute();
      router.push(target);
      router.refresh();
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "var(--coffee-gradient)" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-3xl">☕</span>
            <span className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
              BREW <span style={{ color: "var(--coffee-accent)" }}>&</span> CO.
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: "var(--coffee-text-secondary)" }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: "rgba(255,255,255,0.08)",
              border: "1px solid var(--coffee-border)",
              color: "var(--coffee-text-primary)",
            }}
            id="google-login-btn"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--coffee-border)" }} />
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--coffee-text-secondary)" }}>
              or
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: "var(--coffee-border)" }} />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-medium mb-1.5" style={{ color: "var(--coffee-text-secondary)" }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--coffee-accent)] transition-all"
                style={{
                  backgroundColor: "rgba(61, 40, 32, 0.5)",
                  border: "1px solid var(--coffee-border)",
                  color: "var(--coffee-text-primary)",
                }}
                placeholder="you@example.com"
                id="login-email"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs uppercase tracking-wider font-medium" style={{ color: "var(--coffee-text-secondary)" }}>
                  Password
                </label>
                <Link href="/auth/forgot-password" className="text-xs hover:text-[var(--coffee-accent)] transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--coffee-accent)] transition-all"
                style={{
                  backgroundColor: "rgba(61, 40, 32, 0.5)",
                  border: "1px solid var(--coffee-border)",
                  color: "var(--coffee-text-primary)",
                }}
                placeholder="••••••••"
                id="login-password"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-accent py-3 rounded-xl text-sm font-semibold tracking-wide uppercase disabled:opacity-50"
              id="login-submit"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: "var(--coffee-text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" className="font-medium" style={{ color: "var(--coffee-accent)" }}>
              Sign up
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center">
          <Link href="/" className="text-xs hover:text-[var(--coffee-accent)] transition-colors" style={{ color: "var(--coffee-text-secondary)" }}>
            ← Back to store
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
