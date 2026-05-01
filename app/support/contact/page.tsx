import PublicPageShell from "@/app/components/PublicPageShell";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  return (
    <PublicPageShell>
      <div className="max-w-4xl mx-auto px-6 pb-20">
        <p className="text-sm uppercase tracking-[0.3em] font-medium mb-3" style={{ color: "var(--coffee-accent)" }}>
          Contact
        </p>
        <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl font-bold" style={{ color: "var(--coffee-text-primary)" }}>
          Send support a note.
        </h1>
        <p className="text-lg mt-4 mb-8" style={{ color: "var(--coffee-text-secondary)" }}>
          Include your order ID for faster help with tracking, payment verification, or replacements.
        </p>
        <ContactForm />
      </div>
    </PublicPageShell>
  );
}
