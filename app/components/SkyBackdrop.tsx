"use client";

import { useEffect, useRef } from "react";

/**
 * The sky behind the hero and the closing CTA.
 *
 * Combines high-resolution atmospheric cloud blending with multi-tiered SVG cumulus
 * depth layers that continuously drift and respond to scroll parallax physics.
 */

type Variant = "hero" | "cta";

/** One soft cumulus, built from overlapping ellipses and blurred into a single mass. */
function Cloud({
  id,
  className,
  opacity = 1,
  tint = "#c8dff5",
}: {
  id: string;
  className?: string;
  opacity?: number;
  tint?: string;
}) {
  return (
    <svg
      viewBox="0 0 640 220"
      className={className}
      style={{ opacity }}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <filter id={`${id}-soften`} x="-20%" y="-40%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#ffffff" />
          <stop offset="100%" stopColor={tint} />
        </linearGradient>
      </defs>
      <g filter={`url(#${id}-soften)`} fill={`url(#${id}-body)`}>
        <ellipse cx="180" cy="150" rx="150" ry="58" />
        <ellipse cx="300" cy="120" rx="118" ry="74" />
        <ellipse cx="415" cy="140" rx="132" ry="62" />
        <ellipse cx="248" cy="112" rx="86" ry="60" />
        <ellipse cx="360" cy="156" rx="160" ry="52" />
        <ellipse cx="500" cy="162" rx="104" ry="44" />
      </g>
    </svg>
  );
}

export function SkyBackdrop({ variant = "hero" }: { variant?: Variant }) {
  const far = useRef<HTMLDivElement>(null);
  const mid = useRef<HTMLDivElement>(null);
  const near = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layers = [far.current, mid.current, near.current, grid.current];
    if (layers.some((layer) => !layer)) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) return;

    // Depth rates: far clouds move slowly, near ones move faster, grid moves subtly
    const rates = [0.08, 0.18, 0.32, -0.06];
    let frame = 0;

    const apply = () => {
      frame = 0;
      const host = far.current?.parentElement;
      if (!host) return;
      const offset = -host.getBoundingClientRect().top;

      layers.forEach((layer, index) => {
        if (layer) layer.style.transform = `translate3d(0, ${offset * rates[index]}px, 0)`;
      });
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
      {/* Daylight Atmospheric Sky Gradient */}
      <div
        className={
          isHero
            ? "absolute inset-0 bg-[linear-gradient(180deg,#3b82f6_0%,#60a5fa_18%,#93c5fd_38%,#dbeafe_62%,#ffffff_100%)] opacity-95"
            : "absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#dbeafe_35%,#93c5fd_75%,#3b82f6_100%)] opacity-95"
        }
      />

      {/* Atmospheric Cloud Texture Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-top opacity-55 mix-blend-overlay"
        style={{ backgroundImage: "url('/images/clouds-bg.png')" }}
      />

      {/* Warm Sunlight Glow from Top-Left */}
      <div className="absolute -left-1/4 -top-1/3 h-[150%] w-[100%] rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.95),transparent_65%)]" />

      {/* Far Cloud Layer */}
      <div ref={far} className="absolute inset-x-0 top-[25%] will-change-transform animate-cloud-slow">
        <Cloud id="sky-far-a" className="absolute -left-[10%] w-[80%]" opacity={0.65} tint="#bfdbfe" />
        <Cloud id="sky-far-b" className="absolute -right-[12%] top-6 w-[72%]" opacity={0.6} tint="#bfdbfe" />
      </div>

      {/* Mid Cloud Layer */}
      <div ref={mid} className="absolute inset-x-0 bottom-[10%] will-change-transform animate-cloud-fast">
        <Cloud id="sky-mid-a" className="absolute -left-[14%] w-[70%]" opacity={0.88} tint="#dbeafe" />
        <Cloud id="sky-mid-b" className="absolute -right-[16%] bottom-4 w-[74%]" opacity={0.82} tint="#dbeafe" />
      </div>

      {/* Near Cloud Layer */}
      <div ref={near} className="absolute inset-x-0 -bottom-[2%] will-change-transform">
        <Cloud id="sky-near-a" className="absolute -left-[4%] w-[52%]" opacity={0.98} tint="#eff6ff" />
        <Cloud id="sky-near-b" className="absolute -right-[6%] bottom-1 w-[46%]" opacity={0.95} tint="#eff6ff" />
      </div>

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

