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
  tint = "#dceaf8",
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
          <feGaussianBlur stdDeviation="16" />
        </filter>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#ffffff" />
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

    // Depth rates: far clouds move slowly, near ones move faster, grid rises
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
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none" aria-hidden="true">
      {/* Dynamic Sky Gradient */}
      <div
        className={
          isHero
            ? "absolute inset-0 bg-[linear-gradient(180deg,#6497ce_0%,#9cc3ea_16%,#d6e8fb_38%,#f2f8fe_62%,#ffffff_100%)]"
            : "absolute inset-0 bg-[linear-gradient(180deg,#ffffff_0%,#eaf4fe_26%,#cce0f7_68%,#9cc3ea_100%)]"
        }
      />

      {/* Atmospheric Cloud Image Texture with soft overlay */}
      <div
        className="absolute inset-0 bg-cover bg-top opacity-35 mix-blend-soft-light"
        style={{ backgroundImage: "url('/images/clouds-bg.png')" }}
      />

      {/* Warm Ambient Sunbeam Glow */}
      <div className="absolute -left-1/4 -top-1/3 h-[150%] w-[100%] rotate-12 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.9),transparent_65%)]" />

      {/* Far Cloud Layer — Soft & Ambient */}
      <div ref={far} className="absolute inset-x-0 top-[30%] will-change-transform animate-cloud-slow">
        <Cloud id="sky-far-a" className="absolute -left-[10%] w-[75%]" opacity={0.55} tint="#cfe0f2" />
        <Cloud id="sky-far-b" className="absolute -right-[15%] top-8 w-[68%]" opacity={0.48} tint="#cfe0f2" />
      </div>

      {/* Mid Cloud Layer — Drift & Body */}
      <div ref={mid} className="absolute inset-x-0 bottom-[8%] will-change-transform animate-cloud-fast">
        <Cloud id="sky-mid-a" className="absolute -left-[16%] w-[68%]" opacity={0.82} tint="#dbeaf8" />
        <Cloud id="sky-mid-b" className="absolute -right-[18%] bottom-6 w-[72%]" opacity={0.78} tint="#dbeaf8" />
      </div>

      {/* Near Cloud Layer — Foreground Depth */}
      <div ref={near} className="absolute inset-x-0 -bottom-[3%] will-change-transform">
        <Cloud id="sky-near-a" className="absolute -left-[6%] w-[50%]" opacity={0.96} tint="#eaf2fb" />
        <Cloud id="sky-near-b" className="absolute -right-[8%] bottom-2 w-[44%]" opacity={0.92} tint="#eaf2fb" />
      </div>

      {/* Precision Technical Grid with Crisp Intersections */}
      <div
        ref={grid}
        className="absolute inset-0 will-change-transform bg-[linear-gradient(to_right,rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.65)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem]"
        style={{
          maskImage: "radial-gradient(ellipse 85% 65% at 50% 35%, #000 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 65% at 50% 35%, #000 40%, transparent 85%)",
        }}
      />

      {/* Crosshair Coordinate Markers & Technical Pixel Clusters */}
      {isHero && (
        <>
          <div className="absolute top-20 left-[12%] hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-white/80 bg-black/10 px-2 py-0.5 rounded backdrop-blur-xs">
            <span>+</span> <span>SYS://SN_MAIN</span>
          </div>
          <div className="absolute top-20 right-[12%] hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-white/80 bg-black/10 px-2 py-0.5 rounded backdrop-blur-xs">
            <span>+</span> <span>GRID://4.5REM</span>
          </div>
          <div className="absolute top-[45%] left-[6%] hidden lg:flex items-center gap-1 font-mono text-[9px] text-white/60">
            <span>[ZK-01]</span>
          </div>
          <div className="absolute top-[45%] right-[6%] hidden lg:flex items-center gap-1 font-mono text-[9px] text-white/60">
            <span>[POSEIDON]</span>
          </div>
        </>
      )}
    </div>
  );
}
