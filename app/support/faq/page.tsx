import PublicPageShell from "@/app/components/PublicPageShell";
import { getFaqItems } from "@/lib/public-data";

const fallbackFaq = [
  { id: "1", question: "When will my order ship?", answer_html: "<p>Orders move to fulfillment after payment verification, then tracking appears on your order detail page.</p>", category: "Orders", sort_order: 1, is_published: true },
  { id: "2", question: "Can I reorder the same coffee?", answer_html: "<p>Yes. Open an order detail page and use Reorder to add those items back to cart.</p>", category: "Account", sort_order: 2, is_published: true },
];

export default async function FaqPage() {
  const data = await getFaqItems();
  const items = data.length > 0 ? data : fallbackFaq;

  return (
    <PublicPageShell>
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          FAQ
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          Common Questions
        </h1>
        <div className="space-y-4 mt-10">
          {items.map((item) => (
            <article key={item.id} className="glass-card rounded-2xl p-6">
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--coffee-accent)" }}>{item.category}</p>
              <h2 className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{item.question}</h2>
              <div className="text-sm mt-3 leading-relaxed" style={{ color: "var(--coffee-text-secondary)" }} dangerouslySetInnerHTML={{ __html: item.answer_html }} />
            </article>
          ))}
        </div>
      </div>
    </PublicPageShell>
  );
}
