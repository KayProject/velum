"use client";

import { useEffect, useRef } from "react";

/**
 * The sky behind the hero and the closing CTA.
 *
 * A real cloud photograph, held slightly zoomed in. Scrolling past the section
 * both deepens the zoom and pans the focal point, so the photo reads as a
 * slow, continuous push through the clouds rather than a static image.
 */

type Variant = "hero" | "cta";

export function SkyBackdrop({ variant = "hero" }: { variant?: Variant }) {
  const photo = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layers = [photo.current, grid.current];
    if (layers.some((layer) => !layer)) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    let frame = 0;

    const apply = () => {
      frame = 0;
      const host = photo.current?.parentElement;
      if (!host) return;

      const rect = host.getBoundingClientRect();
      // Progress through the section: 0 when it enters the viewport, 1 once
      // it has fully scrolled past — clamped so the effect never overshoots.
      const total = rect.height + window.innerHeight;
      const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / total));

      const scale = 1.12 + progress * 0.22;
      const panY = progress * 6; // percent — shifts the focal point downward
      const panX = (progress - 0.5) * 4; // percent — slight lateral drift

      if (photo.current) {
        photo.current.style.transform = `scale(${scale}) translate(${panX}%, ${panY}%)`;
      }
      if (grid.current) {
        grid.current.style.transform = `translate3d(0, ${rect.top * 0.06}px, 0)`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const isHero = variant === "hero";

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
      {/* Cloud photograph — zoomed in, shifts focus on scroll */}
      <div
        ref={photo}
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: "url(/cloud-backdrop.jpeg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scale(1.12)",
          transformOrigin: "center",
        }}
      />

      {/* Atmospheric tint so foreground text stays legible over the photo */}
      <div
        className={
          isHero
            ? "absolute inset-0 bg-[linear-gradient(180deg,rgba(59,130,246,0.35)_0%,rgba(147,197,253,0.15)_35%,rgba(255,255,255,0.55)_75%,#ffffff_100%)]"
            : "absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,rgba(219,234,254,0.55)_30%,rgba(147,197,253,0.3)_70%,rgba(59,130,246,0.4)_100%)]"
        }
      />

      {/* Warm Sunlight Glow from Top-Left */}
      <div className="absolute -left-1/4 -top-1/3 h-[150%] w-[100%] rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85),transparent_65%)]" />

      {/* Precision High-Contrast Technical Grid (Crisp 1px Visible Lines) */}
      <div
        ref={grid}
        className="absolute inset-0 will-change-transform bg-[linear-gradient(to_right,rgba(24,24,24,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,24,0.08)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]"
        style={{
          maskImage: "radial-gradient(ellipse 90% 70% at 50% 35%, #000 50%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 70% at 50% 35%, #000 50%, transparent 90%)",
        }}
      />

      {/* Overlay Secondary White Grid Glow for Depth */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]"
      />

      {/* Crosshair Coordinate Markers & Technical Pixel Clusters */}
      {isHero && (
        <>
          <div className="absolute top-20 left-[12%] hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-[#1e3a8a] bg-white/70 px-2 py-0.5 rounded shadow-2xs border border-white/80 backdrop-blur-xs">
            <span className="font-bold">+</span> <span>SYS://SN_MAIN</span>
          </div>
          <div className="absolute top-20 right-[12%] hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-[#1e3a8a] bg-white/70 px-2 py-0.5 rounded shadow-2xs border border-white/80 backdrop-blur-xs">
            <span className="font-bold">+</span> <span>GRID://4.5REM</span>
          </div>
          <div className="absolute top-[48%] left-[5%] hidden lg:flex items-center gap-1 font-mono text-[9px] text-[#1e40af]/70 bg-white/50 px-1.5 py-0.5 rounded">
            <span>[ZK-PROVER-L2]</span>
          </div>
          <div className="absolute top-[48%] right-[5%] hidden lg:flex items-center gap-1 font-mono text-[9px] text-[#1e40af]/70 bg-white/50 px-1.5 py-0.5 rounded">
            <span>[POSEIDON-CIRCUIT]</span>
          </div>
        </>
      )}
    </div>
  );
}
