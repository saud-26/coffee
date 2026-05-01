import PublicPageShell from "@/app/components/PublicPageShell";
import { getProcessSteps } from "@/lib/public-data";

const fallbackSteps = [
  { id: "1", step_number: 1, title: "Source", body: "We start with lots that match the roast profile and intended brew method.", image_url: "", is_published: true },
  { id: "2", step_number: 2, title: "Roast", body: "Small batches keep roast curves responsive and consistent.", image_url: "", is_published: true },
  { id: "3", step_number: 3, title: "Pack", body: "Orders are packed after payment verification with freshness as the priority.", image_url: "", is_published: true },
  { id: "4", step_number: 4, title: "Deliver", body: "Tracking metadata follows the order timeline once shipping begins.", image_url: "", is_published: true },
];

export default async function CompanyProcessPage() {
  const data = await getProcessSteps();
  const steps = data.length > 0 ? data : fallbackSteps;

  return (
    <PublicPageShell>
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Process
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          From roast plan to packed order.
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {steps.map((step) => (
            <article key={step.id} className="glass-card rounded-2xl p-6">
              <p className="text-sm uppercase tracking-wider mb-3" style={{ color: "var(--coffee-accent)" }}>
                Step {step.step_number}
              </p>
              <h2 className="font-['Playfair_Display'] text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{step.title}</h2>
              <p className="text-sm mt-3" style={{ color: "var(--coffee-text-secondary)" }}>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </PublicPageShell>
  );
}
