"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

const TOTAL_FRAMES = 184;
const FRAME_PATH = "/frames/ezgif-frame-";

function getFrameSrc(index: number): string {
  const frameNumber = Math.min(Math.max(index, 1), TOTAL_FRAMES);
  const padded = String(frameNumber).padStart(3, "0");
  return `${FRAME_PATH}${padded}.jpg`;
}

export default function HeroCanvasAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const animFrameRef = useRef<number>(0);

  // Scroll progress within the hero container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Smoothed scroll progress for buttery frame transitions
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Anti-gravity float effect based on scroll
  const yOffset = useTransform(smoothProgress, [0, 0.5, 1], [15, 0, -15]);
  const springY = useSpring(yOffset, { stiffness: 80, damping: 20 });

  // Text overlay animations
  const titleOpacity = useTransform(smoothProgress, [0, 0.12, 0.25], [1, 1, 0]);
  const titleY = useTransform(smoothProgress, [0, 0.25], [0, -60]);

  const subtitleOpacity = useTransform(
    smoothProgress,
    [0.2, 0.35, 0.5],
    [0, 1, 0]
  );
  const subtitleY = useTransform(smoothProgress, [0.2, 0.35, 0.5], [40, 0, -40]);

  const taglineOpacity = useTransform(
    smoothProgress,
    [0.5, 0.65, 0.8],
    [0, 1, 0]
  );
  const taglineY = useTransform(smoothProgress, [0.5, 0.65, 0.8], [40, 0, -40]);

  const ctaOpacity = useTransform(smoothProgress, [0.75, 0.88, 1], [0, 1, 1]);
  const ctaY = useTransform(smoothProgress, [0.75, 0.88], [40, 0]);
  const ctaScale = useTransform(smoothProgress, [0.75, 0.88], [0.9, 1]);

  // Preload all frames
  useEffect(() => {
    let loaded = 0;
    const imgArray: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let cancelled = false;

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i + 1);
      img.onload = () => {
        if (cancelled) return;
        imgArray[i] = img;
        loaded++;
        setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
        if (loaded === TOTAL_FRAMES) {
          setImages(imgArray);
          setIsLoaded(true);
        }
      };
      img.onerror = () => {
        if (cancelled) return;
        loaded++;
        imgArray[i] = img; // still store it
        setLoadProgress(Math.round((loaded / TOTAL_FRAMES) * 100));
        if (loaded === TOTAL_FRAMES) {
          setImages(imgArray);
          setIsLoaded(true);
        }
      };
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // Render frames on canvas based on scroll
  const renderFrame = useCallback(
    (progress: number) => {
      if (!canvasRef.current || images.length === 0) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const frameIndex = Math.min(
        Math.floor(progress * (TOTAL_FRAMES - 1)),
        TOTAL_FRAMES - 1
      );
      const img = images[frameIndex];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      // Set canvas size to match image aspect ratio
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    },
    [images]
  );

  // Subscribe to scroll progress changes
  useEffect(() => {
    if (!isLoaded) return;

    const unsubscribe = smoothProgress.on("change", (latest) => {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = requestAnimationFrame(() => {
        renderFrame(latest);
      });
    });

    // Render the first frame immediately
    renderFrame(0);

    return () => {
      unsubscribe();
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isLoaded, smoothProgress, renderFrame]);

  return (
    <div
      ref={containerRef}
      id="hero"
      className="relative hero-canvas-wrapper"
      style={{ height: "500vh" }}
    >
      {/* Sticky canvas viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Loading Screen */}
        {!isLoaded && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#1A0F0A]">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <span className="text-5xl" role="img" aria-label="loading">☕</span>
              <h2
                className="font-['Playfair_Display'] text-3xl font-semibold"
                style={{ color: "var(--coffee-text-primary)" }}
              >
                Brewing Your Experience
              </h2>
              {/* Progress bar */}
              <div className="w-64 h-1 bg-[var(--coffee-border)] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: "var(--coffee-accent)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${loadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p
                className="text-sm font-medium"
                style={{ color: "var(--coffee-text-secondary)" }}
              >
                {loadProgress}%
              </p>
            </motion.div>
          </div>
        )}

        {/* Canvas with anti-gravity effect */}
        <motion.div
          style={{ y: springY }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-full object-contain"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        </motion.div>

        {/* Gradient overlays for text readability */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#1A0F0A] to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-[#1A0F0A]/60 to-transparent" />
        </div>

        {/* Text Overlays */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-center px-6 max-w-5xl">
            {/* Title */}
            <motion.div style={{ opacity: titleOpacity, y: titleY }}>
              <p
                className="text-sm md:text-base font-medium tracking-[0.3em] uppercase mb-4"
                style={{ color: "var(--coffee-text-secondary)" }}
              >
                Premium Artisan Coffee
              </p>
              <h1
                className="font-['Playfair_Display'] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold leading-[0.9] tracking-tight text-glow-strong"
                style={{ color: "rgba(255,251,235,0.95)" }}
              >
                BREW
                <br />
                <span className="italic font-normal text-[var(--coffee-accent)]">
                  &
                </span>{" "}
                CO.
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.div
              style={{ opacity: subtitleOpacity, y: subtitleY }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center">
                <h2
                  className="font-['Playfair_Display'] text-4xl md:text-6xl lg:text-7xl font-semibold text-glow"
                  style={{ color: "rgba(255,251,235,0.95)" }}
                >
                  From Bean
                  <br />
                  <span className="italic">to Perfection</span>
                </h2>
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.div
              style={{ opacity: taglineOpacity, y: taglineY }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="text-center max-w-2xl px-6">
                <p
                  className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed text-glow"
                  style={{ color: "rgba(255,251,235,0.85)" }}
                >
                  Single-origin beans, meticulously sourced from the world&apos;s
                  finest highlands and roasted to unlock flavors that tell a story.
                </p>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              style={{ opacity: ctaOpacity, y: ctaY, scale: ctaScale }}
              className="absolute inset-0 flex items-center justify-center pointer-events-auto"
            >
              <div className="text-center flex flex-col items-center gap-6">
                <h2
                  className="font-['Playfair_Display'] text-3xl md:text-5xl font-semibold text-glow"
                  style={{ color: "rgba(255,251,235,0.95)" }}
                >
                  Taste the Difference
                </h2>
                <a
                  href="#products"
                  className="btn-accent btn-shimmer px-10 py-4 rounded-full text-base font-semibold tracking-wide uppercase animate-pulse-glow"
                >
                  Explore Our Collection
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity: titleOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
          <p
            className="text-xs tracking-[0.2em] uppercase"
            style={{ color: "var(--coffee-text-secondary)" }}
          >
            Scroll to explore
          </p>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 border-2 rounded-full flex items-start justify-center pt-1"
            style={{ borderColor: "var(--coffee-text-secondary)" }}
          >
            <div
              className="w-1 h-2 rounded-full"
              style={{ backgroundColor: "var(--coffee-text-secondary)" }}
            />
          </motion.div>
        </motion.div>

        {/* Floating particles (coffee bean-like) */}
        <div className="absolute inset-0 pointer-events-none z-5 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full opacity-20"
              style={{
                width: 4 + i * 2,
                height: 4 + i * 2,
                backgroundColor: "var(--coffee-bean)",
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0.1, 0.25, 0.1],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
