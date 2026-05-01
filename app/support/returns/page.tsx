import PublicPageShell from "@/app/components/PublicPageShell";
import { getSitePage } from "@/lib/public-data";

export default async function ReturnsPage() {
  const page = await getSitePage("returns");

  return (
    <PublicPageShell>
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Support
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          {page?.title ?? "Returns"}
        </h1>
        <section className="glass-card rounded-2xl p-8 mt-10 text-base leading-relaxed" style={{ color: "var(--coffee-text-secondary)" }}>
          {page ? (
            <div dangerouslySetInnerHTML={{ __html: page.body_html }} />
          ) : (
            <p>If your order arrives damaged, incorrect, or missing an item, contact support within 7 days and include your order ID.</p>
          )}
        </section>
      </div>
    </PublicPageShell>
  );
}
