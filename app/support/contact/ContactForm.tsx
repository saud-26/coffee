"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  topic: "Order support",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    const response = await fetch("/api/support/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = (await response.json()) as { error?: string };

    if (!response.ok) {
      setStatus(result.error || "Could not send your message.");
    } else {
      setStatus("Message sent. We will follow up soon.");
      setForm(initialState);
    }

    setLoading(false);
  };

  const inputStyle = {
    backgroundColor: "rgba(61, 40, 32, 0.5)",
    border: "1px solid var(--coffee-border)",
    color: "var(--coffee-text-primary)",
  };

  return (
    <form onSubmit={submit} className="glass-card rounded-2xl p-6 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
        <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" className="px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
      </div>
      <select value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle}>
        <option>Order support</option>
        <option>Shipping</option>
        <option>Returns</option>
        <option>Wholesale</option>
        <option>Other</option>
      </select>
      <textarea required rows={6} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="How can we help?" className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
      {status && <p className="text-sm" style={{ color: status.startsWith("Message") ? "var(--coffee-accent)" : "#FCA5A5" }}>{status}</p>}
      <button disabled={loading} className="btn-accent px-6 py-3 rounded-full text-sm font-semibold disabled:opacity-50">
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
