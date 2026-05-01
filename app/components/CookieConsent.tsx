"use client";

import { useEffect, useMemo, useState } from "react";

type ConsentChoices = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
};

type StoredConsent = {
  version: number;
  expiresAt: number;
  choices: ConsentChoices;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const STORAGE_KEY = "brew-co-cookie-consent";
const COOKIE_NAME = "cookie_consent";
const CONSENT_VERSION = 1;
const TWELVE_MONTHS_SECONDS = 60 * 60 * 24 * 365;

const defaultChoices: ConsentChoices = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

function readStoredConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION || parsed.expiresAt <= Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistConsent(choices: ConsentChoices): StoredConsent {
  const stored: StoredConsent = {
    version: CONSENT_VERSION,
    expiresAt: Date.now() + TWELVE_MONTHS_SECONDS * 1000,
    choices,
  };
  const encoded = encodeURIComponent(JSON.stringify(stored));

  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  document.cookie = `${COOKIE_NAME}=${encoded}; Max-Age=${TWELVE_MONTHS_SECONDS}; Path=/; SameSite=Lax`;

  return stored;
}

function loadGa4(measurementId: string) {
  if (!measurementId || document.querySelector(`script[data-ga4-id="${measurementId}"]`)) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.dataset.ga4Id = measurementId;
  document.head.appendChild(script);
}

export default function CookieConsent() {
  const [ready, setReady] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [choices, setChoices] = useState<ConsentChoices>(defaultChoices);
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID || "";

  const toggleRows = useMemo(
    () => [
      { key: "analytics" as const, label: "Analytics", text: "Helps us understand page traffic and checkout drop-off." },
      { key: "functional" as const, label: "Functional", text: "Reserved for preference and experience enhancements." },
      { key: "marketing" as const, label: "Marketing", text: "Reserved for future campaign pixels and remarketing hooks." },
    ],
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const stored = readStoredConsent();
      if (stored) {
        setChoices(stored.choices);
        if (stored.choices.analytics && ga4Id) loadGa4(ga4Id);
      } else {
        setShowBanner(true);
      }
      setReady(true);
    }, 0);

    const openSettings = () => setShowPreferences(true);
    window.addEventListener("open-cookie-settings", openSettings);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("open-cookie-settings", openSettings);
    };
  }, [ga4Id]);

  const save = (nextChoices: ConsentChoices) => {
    setChoices(nextChoices);
    persistConsent(nextChoices);
    setShowBanner(false);
    setShowPreferences(false);
    if (nextChoices.analytics && ga4Id) loadGa4(ga4Id);
  };

  if (!ready) return null;

  return (
    <>
      {showBanner && (
        <div className="fixed bottom-5 left-5 right-5 z-[80] glass-card rounded-2xl p-5 md:flex md:items-center md:justify-between gap-5" style={{ color: "var(--coffee-text-primary)" }}>
          <div>
            <p className="font-semibold">Cookie preferences</p>
            <p className="text-sm mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
              Essential cookies stay on. Analytics only loads after you allow it.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
            <button onClick={() => setShowPreferences(true)} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)" }}>
              Preferences
            </button>
            <button onClick={() => save(defaultChoices)} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)" }}>
              Reject Optional
            </button>
            <button onClick={() => save({ essential: true, analytics: true, marketing: true, functional: true })} className="btn-accent px-4 py-2 rounded-full text-sm font-semibold">
              Accept All
            </button>
          </div>
        </div>
      )}

      {showPreferences && (
        <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center px-6">
          <div className="glass-card rounded-2xl p-6 w-full max-w-lg" style={{ color: "var(--coffee-text-primary)" }}>
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="font-['Playfair_Display'] text-2xl font-bold">Cookie Settings</h2>
                <p className="text-sm mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                  Preferences are stored for 12 months.
                </p>
              </div>
              <button onClick={() => setShowPreferences(false)} className="text-sm" style={{ color: "var(--coffee-text-secondary)" }}>
                Close
              </button>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(61, 40, 32, 0.35)", border: "1px solid var(--coffee-border)" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">Essential</p>
                    <p className="text-xs mt-1" style={{ color: "var(--coffee-text-secondary)" }}>
                      Required for cart, login, checkout, and consent storage.
                    </p>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "var(--coffee-accent)" }}>Always on</span>
                </div>
              </div>

              {toggleRows.map((row) => (
                <label key={row.key} className="rounded-xl p-4 flex items-center justify-between gap-4" style={{ backgroundColor: "rgba(61, 40, 32, 0.35)", border: "1px solid var(--coffee-border)" }}>
                  <span>
                    <span className="font-semibold block">{row.label}</span>
                    <span className="text-xs mt-1 block" style={{ color: "var(--coffee-text-secondary)" }}>{row.text}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={choices[row.key]}
                    onChange={(event) => setChoices({ ...choices, [row.key]: event.target.checked })}
                    className="w-5 h-5"
                    style={{ accentColor: "var(--coffee-accent)" }}
                  />
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => save(defaultChoices)} className="px-4 py-2 rounded-full text-sm font-semibold" style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)" }}>
                Reject Optional
              </button>
              <button onClick={() => save({ ...choices, essential: true })} className="btn-accent px-4 py-2 rounded-full text-sm font-semibold">
                Save Choices
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
