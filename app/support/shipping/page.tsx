import PublicPageShell from "@/app/components/PublicPageShell";
import { formatINR } from "@/lib/currency";
import { getShippingRates } from "@/lib/public-data";

export default async function ShippingPage() {
  const rates = await getShippingRates();

  return (
    <PublicPageShell>
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Shipping
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          Delivery windows and rates.
        </h1>
        <div className="glass-card rounded-2xl overflow-hidden mt-10">
          <table className="w-full text-left">
            <thead style={{ backgroundColor: "rgba(61,40,32,0.4)" }}>
              <tr>
                <th className="p-4 text-xs uppercase tracking-wider" style={{ color: "var(--coffee-text-secondary)" }}>Region</th>
                <th className="p-4 text-xs uppercase tracking-wider" style={{ color: "var(--coffee-text-secondary)" }}>Minimum</th>
                <th className="p-4 text-xs uppercase tracking-wider" style={{ color: "var(--coffee-text-secondary)" }}>Rate</th>
                <th className="p-4 text-xs uppercase tracking-wider" style={{ color: "var(--coffee-text-secondary)" }}>Estimate</th>
              </tr>
            </thead>
            <tbody>
              {rates.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6" style={{ color: "var(--coffee-text-secondary)" }}>
                    Shipping rates will appear here.
                  </td>
                </tr>
              ) : (
                rates.map((rate) => (
                  <tr key={rate.id} style={{ borderTop: "1px solid rgba(90,64,52,0.2)" }}>
                    <td className="p-4 text-sm" style={{ color: "var(--coffee-text-primary)" }}>{rate.region}</td>
                    <td className="p-4 text-sm" style={{ color: "var(--coffee-text-secondary)" }}>{formatINR(Number(rate.min_order_value))}</td>
                    <td className="p-4 text-sm" style={{ color: "var(--coffee-text-primary)" }}>{formatINR(Number(rate.rate))}</td>
                    <td className="p-4 text-sm" style={{ color: "var(--coffee-text-secondary)" }}>{rate.estimated_days}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PublicPageShell>
  );
}
