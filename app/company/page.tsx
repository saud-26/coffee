import Link from "next/link";
import PublicPageShell from "@/app/components/PublicPageShell";

const links = [
  { href: "/company/story", title: "Our Story", text: "Milestones, founders, and the roastery journey." },
  { href: "/company/process", title: "Process", text: "How coffees move from sourcing to your doorstep." },
  { href: "/company/sustainability", title: "Sustainability", text: "Metrics behind our sourcing and packaging decisions." },
  { href: "/company/careers", title: "Careers", text: "Open roles and ways to join the team." },
  { href: "/company/press", title: "Press", text: "Announcements, mentions, and media links." },
];

export default function CompanyPage() {
  return (
    <PublicPageShell>
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Company
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold max-w-3xl" style={{ color: "var(--coffee-text-primary)" }}>
          Coffee with a visible trail from roast to doorstep.
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
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
