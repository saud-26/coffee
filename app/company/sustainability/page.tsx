import PublicPageShell from "@/app/components/PublicPageShell";
import { getSustainabilityMetrics } from "@/lib/public-data";

const fallbackMetrics = [
  { id: "1", label: "Small batches", value: "100%", description: "Roasting in focused batches reduces stale inventory.", sort_order: 1, is_published: true },
  { id: "2", label: "Packaging", value: "Recyclable", description: "Packaging choices are reviewed as supplier options improve.", sort_order: 2, is_published: true },
  { id: "3", label: "Sourcing", value: "Traceable", description: "Origins are kept visible on product records.", sort_order: 3, is_published: true },
];

export default async function SustainabilityPage() {
  const data = await getSustainabilityMetrics();
  const metrics = data.length > 0 ? data : fallbackMetrics;

  return (
    <PublicPageShell>
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Sustainability
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          Practical metrics over vague claims.
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {metrics.map((metric) => (
            <article key={metric.id} className="glass-card rounded-2xl p-6">
              <p className="text-3xl font-bold" style={{ color: "var(--coffee-accent)" }}>{metric.value}</p>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold mt-4" style={{ color: "var(--coffee-text-primary)" }}>{metric.label}</h2>
              <p className="text-sm mt-3" style={{ color: "var(--coffee-text-secondary)" }}>{metric.description}</p>
            </article>
          ))}
        </div>
      </div>
    </PublicPageShell>
  );
}
