"use client";

import { COFFEE_IMAGES, HERO_BACKGROUND_URL } from "@/lib/coffee-config";

export default function AdminSettingsPage() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <h1
        className="font-['Playfair_Display'] text-3xl font-bold"
        style={{ color: "var(--coffee-text-primary)" }}
      >
        Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <h2
            className="font-['Playfair_Display'] text-2xl font-bold mb-3"
            style={{ color: "var(--coffee-text-primary)" }}
          >
            Payment
          </h2>
          <p className="text-sm mb-2" style={{ color: "var(--coffee-text-secondary)" }}>
            Payment Method
          </p>
          <p className="text-base font-semibold" style={{ color: "var(--coffee-text-primary)" }}>
            UPI QR (Manual Verification)
          </p>
          <p className="text-sm mt-4" style={{ color: "var(--coffee-text-secondary)" }}>
            UPI ID
          </p>
          <p className="text-base font-semibold" style={{ color: "var(--coffee-accent)" }}>
            anwarulhaquekhan619@oksbi
          </p>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2
            className="font-['Playfair_Display'] text-2xl font-bold mb-3"
            style={{ color: "var(--coffee-text-primary)" }}
          >
            Storefront Media
          </h2>
          <p className="text-sm mb-2" style={{ color: "var(--coffee-text-secondary)" }}>
            Hero Background
          </p>
          <a
            href={HERO_BACKGROUND_URL}
            target="_blank"
            rel="noreferrer"
            className="text-sm break-all"
            style={{ color: "var(--coffee-accent)" }}
          >
            {HERO_BACKGROUND_URL}
          </a>
          <p className="text-sm mt-4 mb-2" style={{ color: "var(--coffee-text-secondary)" }}>
            Product Image CDN
          </p>
          <p className="text-sm" style={{ color: "var(--coffee-text-primary)" }}>
            {COFFEE_IMAGES.beans}
          </p>
        </div>
      </div>
    </div>
  );
}

