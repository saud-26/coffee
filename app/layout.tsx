import type { Metadata } from "next";
import CookieConsent from "./components/CookieConsent";
import "./globals.css";

export const metadata: Metadata = {
  title: "BREW & CO. | Premium Artisan Coffee",
  description:
    "Experience the finest single-origin coffees, meticulously roasted to perfection. Brew & Co. delivers an unparalleled premium coffee experience — from bean to cup.",
  keywords: [
    "premium coffee",
    "artisan coffee",
    "single origin",
    "specialty roast",
    "coffee beans",
  ],
  openGraph: {
    title: "BREW & CO. | Premium Artisan Coffee",
    description:
      "Experience the finest single-origin coffees, meticulously roasted to perfection.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased grain-overlay">
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
