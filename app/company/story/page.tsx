import PublicPageShell from "@/app/components/PublicPageShell";
import { getTimelineEntries } from "@/lib/public-data";

const fallbackTimeline = [
  { id: "1", year_label: "2021", title: "First small batch", body: "Brew & Co. began as a tiny roasting schedule built around freshness.", sort_order: 1, is_published: true },
  { id: "2", year_label: "2023", title: "Direct sourcing focus", body: "We narrowed the catalog around traceable Indian growing regions.", sort_order: 2, is_published: true },
  { id: "3", year_label: "2026", title: "Coffee platform", body: "The shop now connects products, fulfillment, support, and content in one place.", sort_order: 3, is_published: true },
];

export default async function CompanyStoryPage() {
  const entries = await getTimelineEntries();
  const timeline = entries.length > 0 ? entries : fallbackTimeline;

  return (
    <PublicPageShell>
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Our Story
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          Built around fresh roast discipline.
        </h1>
        <div className="space-y-5 mt-10">
          {timeline.map((entry) => (
            <article key={entry.id} className="glass-card rounded-2xl p-6 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-5">
              <p className="text-xl font-bold" style={{ color: "var(--coffee-accent)" }}>{entry.year_label}</p>
              <div>
                <h2 className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{entry.title}</h2>
                <p className="text-sm mt-2" style={{ color: "var(--coffee-text-secondary)" }}>{entry.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PublicPageShell>
  );
}
