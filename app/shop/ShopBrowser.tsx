"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatINR } from "@/lib/currency";
import { getCoffeeImageByName } from "@/lib/coffee-config";
import { useCartStore } from "@/lib/store/cart";
import type { Coffee, GiftSet, SubscriptionPlan } from "@/lib/types";

type ShopBrowserProps = {
  coffees: Coffee[];
  giftSets?: GiftSet[];
  plans?: SubscriptionPlan[];
  title: string;
  subtitle: string;
};

const roastOptions = ["All", "Light", "Medium", "Medium-Dark", "Dark"];

export default function ShopBrowser({ coffees, giftSets = [], plans = [], title, subtitle }: ShopBrowserProps) {
  const [roast, setRoast] = useState("All");
  const [tag, setTag] = useState("All");
  const addItem = useCartStore((state) => state.addItem);

  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    coffees.forEach((coffee) => coffee.tags?.forEach((item) => tagSet.add(item)));
    return ["All", ...Array.from(tagSet).sort()];
  }, [coffees]);

  const filtered = coffees.filter((coffee) => {
    const roastMatch = roast === "All" || coffee.roast === roast;
    const tagMatch = tag === "All" || coffee.tags?.includes(tag);
    return roastMatch && tagMatch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20">
      <section className="mb-10">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Shop
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          {title}
        </h1>
        <p className="text-lg max-w-2xl mt-4" style={{ color: "var(--coffee-text-secondary)" }}>
          {subtitle}
        </p>
      </section>

      <section className="glass-card rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {roastOptions.map((option) => (
            <button
              key={option}
              onClick={() => setRoast(option)}
              className="px-4 py-2 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: roast === option ? "var(--coffee-accent)" : "rgba(61, 40, 32, 0.45)",
                color: roast === option ? "white" : "var(--coffee-text-secondary)",
                border: "1px solid var(--coffee-border)",
              }}
            >
              {option}
            </button>
          ))}
        </div>
        <select
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ backgroundColor: "rgba(61, 40, 32, 0.5)", border: "1px solid var(--coffee-border)", color: "var(--coffee-text-primary)" }}
        >
          {tags.map((option) => (
            <option key={option} value={option}>
              {option === "All" ? "All tags" : option}
            </option>
          ))}
        </select>
      </section>

      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center" style={{ color: "var(--coffee-text-secondary)" }}>
          No coffees match these filters.
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {filtered.map((coffee, index) => {
            const image = coffee.thumbnail_url || getCoffeeImageByName(coffee.name, index);
            return (
              <article key={coffee.id} className="product-card glass-card rounded-2xl overflow-hidden">
                <Link href={`/shop/${coffee.id}`} className="block h-56 overflow-hidden" style={{ backgroundColor: "var(--coffee-bg-secondary)" }}>
                  <img src={image} alt={coffee.name} className="w-full h-full object-cover product-image" />
                </Link>
                <div className="p-5">
                  <p className="text-xs uppercase tracking-widest font-medium mb-1" style={{ color: "var(--coffee-accent)" }}>{coffee.origin}</p>
                  <h2 className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{coffee.name}</h2>
                  <p className="text-sm mt-2 line-clamp-2" style={{ color: "var(--coffee-text-secondary)" }}>{coffee.description}</p>
                  <div className="flex items-center justify-between gap-3 mt-5">
                    <div>
                      <p className="text-xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{formatINR(Number(coffee.price))}</p>
                      <p className="text-xs" style={{ color: "var(--coffee-text-secondary)" }}>{coffee.weight}</p>
                    </div>
                    <button onClick={() => addItem({ ...coffee, price: Number(coffee.price), thumbnail_url: image })} className="btn-accent px-4 py-2 rounded-full text-xs font-semibold">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {giftSets.length > 0 && (
        <section className="mb-14">
          <h2 className="font-['Playfair_Display'] text-3xl font-bold mb-5" style={{ color: "var(--coffee-text-primary)" }}>
            Gift Sets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {giftSets.map((giftSet) => (
              <article key={giftSet.id} className="glass-card rounded-2xl overflow-hidden">
                <img src={giftSet.thumbnail_url || getCoffeeImageByName(giftSet.name)} alt={giftSet.name} className="h-56 w-full object-cover" />
                <div className="p-5">
                  <h3 className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{giftSet.name}</h3>
                  <p className="text-sm mt-2" style={{ color: "var(--coffee-text-secondary)" }}>{giftSet.description}</p>
                  <p className="text-xl font-bold mt-4" style={{ color: "var(--coffee-text-primary)" }}>{formatINR(Number(giftSet.price))}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {plans.length > 0 && (
        <section>
          <h2 className="font-['Playfair_Display'] text-3xl font-bold mb-5" style={{ color: "var(--coffee-text-primary)" }}>
            Subscriptions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <article key={plan.id} className="glass-card rounded-2xl p-6">
                <h3 className="font-['Playfair_Display'] text-2xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>{plan.name}</h3>
                <p className="text-sm mt-2" style={{ color: "var(--coffee-text-secondary)" }}>{plan.description}</p>
                <p className="text-2xl font-bold mt-5" style={{ color: "var(--coffee-text-primary)" }}>{formatINR(Number(plan.price))}</p>
                <p className="text-xs mt-1 uppercase tracking-wider" style={{ color: "var(--coffee-accent)" }}>{plan.bag_count} bag - {plan.cadence}</p>
                <Link href="/support/contact" className="btn-accent px-4 py-2 rounded-full text-xs font-semibold mt-5 inline-block">
                  Request Plan
                </Link>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
