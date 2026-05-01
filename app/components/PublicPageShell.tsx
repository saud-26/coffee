import CartSidebar from "./CartSidebar";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function PublicPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen" style={{ background: "var(--coffee-gradient)" }}>
      <Navbar />
      <CartSidebar />
      <div className="pt-28">{children}</div>
      <Footer />
    </main>
  );
}
