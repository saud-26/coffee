import Link from "next/link";
import PublicPageShell from "@/app/components/PublicPageShell";

const links = [
  { href: "/support/faq", title: "FAQ", text: "Answers to common order, roast, and account questions." },
  { href: "/support/shipping", title: "Shipping", text: "Rates, delivery windows, and tracking expectations." },
  { href: "/support/returns", title: "Returns", text: "Replacement and issue-resolution policy." },
  { href: "/support/contact", title: "Contact", text: "Send a message to the support team." },
];

export default function SupportPage() {
  return (
    <PublicPageShell>
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Support
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          Help for orders, shipping, and coffee care.
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="glass-card rounded-2xl p-6 block hover:border-[var(--coffee-accent)] transition-colors">
              <h2 className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{link.title}</h2>
              <p className="text-sm mt-3" style={{ color: "var(--coffee-text-secondary)" }}>{link.text}</p>
            </Link>
          ))}
        </div>
      </div>
    </PublicPageShell>
  );
}
