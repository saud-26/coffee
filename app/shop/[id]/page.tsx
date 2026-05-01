import { notFound } from "next/navigation";
import PublicPageShell from "@/app/components/PublicPageShell";
import { getCoffeeImageByName } from "@/lib/coffee-config";
import { formatINR } from "@/lib/currency";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Coffee } from "@/lib/types";
import ProductBuyButton from "./ProductBuyButton";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("coffees").select("*").eq("id", id).maybeSingle();
  const coffee = data as Coffee | null;

  if (!coffee) notFound();

  const normalizedCoffee = { ...coffee, price: Number(coffee.price) };
  const image = normalizedCoffee.thumbnail_url || getCoffeeImageByName(normalizedCoffee.name);

  return (
    <PublicPageShell>
      <div className="max-w-6xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="rounded-2xl overflow-hidden glass-card">
          <img src={image} alt={normalizedCoffee.name} className="w-full aspect-square object-cover" />
        </div>
        <section className="glass-card rounded-2xl p-8">
          <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
            {normalizedCoffee.origin}
          </p>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
            {normalizedCoffee.name}
          </h1>
          <p className="text-lg mt-5 leading-relaxed" style={{ color: "var(--coffee-text-secondary)" }}>
            {normalizedCoffee.description}
          </p>
          <div className="grid grid-cols-2 gap-3 my-8">
            {[
              ["Roast", normalizedCoffee.roast],
              ["Weight", normalizedCoffee.weight],
              ["Rating", `${normalizedCoffee.rating} / 5`],
              ["Grind", normalizedCoffee.grind_options?.join(", ") || "Whole Bean"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl p-4" style={{ backgroundColor: "rgba(61, 40, 32, 0.35)", border: "1px solid var(--coffee-border)" }}>
                <p className="text-xs uppercase tracking-wider" style={{ color: "var(--coffee-text-secondary)" }}>{label}</p>
                <p className="text-sm font-semibold mt-1" style={{ color: "var(--coffee-text-primary)" }}>{value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <p className="text-3xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
              {formatINR(Number(normalizedCoffee.price))}
            </p>
            <ProductBuyButton coffee={{ ...normalizedCoffee, thumbnail_url: image }} />
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
