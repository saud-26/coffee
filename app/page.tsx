import Navbar from "./components/Navbar";
import HeroCanvasAnimation from "./components/HeroCanvasAnimation";
import StorySection from "./components/StorySection";
import ProductShowcase from "./components/ProductShowcase";
import FeatureSection from "./components/FeatureSection";
import NewsletterCTA from "./components/NewsletterCTA";
import Footer from "./components/Footer";
import CartSidebar from "./components/CartSidebar";
import { features } from "./data/products";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <CartSidebar />
      <HeroCanvasAnimation />
      <div className="section-divider" />
      <StorySection />
      <ProductShowcase />
      <FeatureSection features={features} />
      <NewsletterCTA />
      <Footer />
    </main>
  );
}
