import PublicPageShell from "@/app/components/PublicPageShell";
import { getPressEntries } from "@/lib/public-data";

export default async function PressPage() {
  const entries = await getPressEntries();

  return (
    <PublicPageShell>
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Press
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          Notes from the roastery.
        </h1>
        <div className="space-y-5 mt-10">
          {entries.length === 0 ? (
            <div className="glass-card rounded-2xl p-8" style={{ color: "var(--coffee-text-secondary)" }}>
              Press updates will appear here.
            </div>
          ) : (
            entries.map((entry) => (
              <article key={entry.id} className="glass-card rounded-2xl p-6">
                <p className="text-sm" style={{ color: "var(--coffee-accent)" }}>
                  {entry.outlet} - {new Date(entry.published_at).toLocaleDateString("en-IN")}
                </p>
                <h2 className="font-['Playfair_Display'] text-3xl font-bold mt-2" style={{ color: "var(--coffee-text-primary)" }}>{entry.title}</h2>
                <p className="text-sm mt-3" style={{ color: "var(--coffee-text-secondary)" }}>{entry.summary}</p>
                {entry.url && (
                  <a href={entry.url} className="btn-accent px-4 py-2 rounded-full text-xs font-semibold mt-5 inline-block" target="_blank" rel="noreferrer">
                    Read More
                  </a>
                )}
              </article>
            ))
          )}
        </div>
      </div>
    </PublicPageShell>
  );
}
