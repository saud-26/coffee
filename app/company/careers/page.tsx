import PublicPageShell from "@/app/components/PublicPageShell";
import { getCareersJobs } from "@/lib/public-data";

export default async function CareersPage() {
  const jobs = await getCareersJobs();

  return (
    <PublicPageShell>
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Careers
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          Join the coffee platform team.
        </h1>
        <div className="space-y-5 mt-10">
          {jobs.length === 0 ? (
            <div className="glass-card rounded-2xl p-8" style={{ color: "var(--coffee-text-secondary)" }}>
              No open roles right now.
            </div>
          ) : (
            jobs.map((job) => (
              <article key={job.id} className="glass-card rounded-2xl p-6">
                <h2 className="font-['Playfair_Display'] text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{job.title}</h2>
                <p className="text-sm mt-2" style={{ color: "var(--coffee-accent)" }}>{job.location} - {job.employment_type}</p>
                <div className="text-sm mt-4 leading-relaxed" style={{ color: "var(--coffee-text-secondary)" }} dangerouslySetInnerHTML={{ __html: job.description_html }} />
              </article>
            ))
          )}
        </div>
      </div>
    </PublicPageShell>
  );
}
