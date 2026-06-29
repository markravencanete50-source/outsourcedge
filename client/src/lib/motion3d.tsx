/* ─────────────────────────────────────────────────────────────────────────────
   motion3d.tsx — OutsourcEdge shared motion system (Phase 2: "level-up")
   Drop in at: client/src/lib/motion3d.tsx
   Zero extra dependencies (pure React + rAF). Pairs with framer-motion already
   in the repo, but does NOT require it. Everything honors prefers-reduced-motion.

   Exports
   ────────
   • usePrefersReducedMotion()      → boolean
   • useDroneScene(ref, opts)       → drives a 3D parallax-tilt + scroll "drone
                                       descent" hero via CSS variables (--mx,--my,--p)
   • useMagnetic(ref, strength?)    → magnetic-pull pointer effect for CTAs
   • <DroneHud/>                    → reusable aerial telemetry overlay (REC/ALT/reticle)
   • SMOOTH_EASE                    → shared cubic-bezier easing array

   How the CSS-variable approach works
   ───────────────────────────────────
   useDroneScene writes three custom properties onto the hero element each frame:
     --mx, --my  pointer/gyro tilt, smoothed, range −1..1
     --p         scroll "descent" progress, range 0..1
   Child layers consume them with plain inline styles + calc(), e.g.
     transform: scale(calc(1 + var(--p) * 0.16))
                translate3d(calc(var(--mx) * 9px), calc(var(--my) * 9px), 0)
   This keeps motion off the React render path (no per-frame re-renders) and never
   fights framer-motion. See Home.tsx for the full hero markup.
───────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

export const SMOOTH_EASE = [0.16, 1, 0.3, 1] as const;

/* ── prefers-reduced-motion ─────────────────────────────────────────────── */
export function usePrefersReducedMotion(): boolean {
  const ref = useRef(false);
  if (typeof window !== "undefined") {
    ref.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  return ref.current;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/* ── useDroneScene ──────────────────────────────────────────────────────────
   Attach to the hero <section>. Writes --mx/--my (tilt) and --p (descent) as CSS
   vars, updates an optional [data-alt] altitude readout, and reveals [data-hud].
─────────────────────────────────────────────────────────────────────────── */
interface DroneSceneOpts {
  /** total scroll distance the descent spans, in viewport heights. Default 1. */
  descentVh?: number;
  /** altitude readout start/end (ft). Default 400 → 12. */
  altFrom?: number;
  altTo?: number;
  /** reveal the HUD this many ms after mount. Default 950. */
  hudDelay?: number;
}
export function useDroneScene(
  ref: React.RefObject<HTMLElement>,
  opts: DroneSceneOpts = {},
) {
  const { descentVh = 1, altFrom = 400, altTo = 12, hudDelay = 950 } = opts;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer:fine)").matches;
    const hud = el.querySelector<HTMLElement>("[data-hud]");
    const altEl = el.querySelector<HTMLElement>("[data-alt]");

    let mx = 0, my = 0, tx = 0, ty = 0, p = 0;
    let raf = 0;

    const writeVars = () => {
      el.style.setProperty("--mx", reduce ? "0" : mx.toFixed(4));
      el.style.setProperty("--my", reduce ? "0" : my.toFixed(4));
      el.style.setProperty("--p", p.toFixed(4));
      if (altEl) altEl.textContent = String(Math.round(altFrom - p * (altFrom - altTo)));
      if (hud && hudOn) hud.style.opacity = String(clamp(0.5 + p * 0.45, 0, 0.95));
    };

    // scroll → descent progress
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      p = clamp(-r.top / (vh * descentVh), 0, 1);
      writeVars();
    };

    // pointer + gyro → tilt targets
    const onMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onLeave = () => { tx = 0; ty = 0; };
    const onGyro = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return;
      tx = clamp(e.gamma / 28, -1, 1);
      ty = clamp(((e.beta ?? 42) - 42) / 28, -1, 1);
    };

    let hudOn = false;
    const hudTimer = window.setTimeout(() => {
      hudOn = true;
      if (hud) hud.style.opacity = "0.55";
    }, hudDelay);

    // smoothing loop (tilt only — scroll is event-driven)
    const tick = () => {
      mx += (tx - mx) * 0.09;
      my += (ty - my) * 0.09;
      if (Math.abs(tx - mx) > 0.0008 || Math.abs(ty - my) > 0.0008) writeVars();
      raf = requestAnimationFrame(tick);
    };

    writeVars();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    if (!reduce) {
      if (fine) {
        el.addEventListener("mousemove", onMove);
        el.addEventListener("mouseleave", onLeave);
      }
      window.addEventListener("deviceorientation", onGyro, { passive: true } as any);
      tick();
    }

    return () => {
      window.clearTimeout(hudTimer);
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("deviceorientation", onGyro as any);
    };
  }, [ref, descentVh, altFrom, altTo, hudDelay]);
}

/* ── useMagnetic ────────────────────────────────────────────────────────────
   Magnetic pointer pull for a button/anchor. No-op on touch / reduced-motion.
─────────────────────────────────────────────────────────────────────────── */
export function useMagnetic(
  ref: React.RefObject<HTMLElement>,
  strength = 14,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer:fine)").matches) return;
    el.style.transition = "transform .35s cubic-bezier(.16,1,.3,1)";
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const mx = (e.clientX - r.left - r.width / 2) / r.width;
      const my = (e.clientY - r.top - r.height / 2) / r.height;
      el.style.transform = `translate(${(mx * strength).toFixed(1)}px,${(my * strength).toFixed(1)}px)`;
    };
    const leave = () => { el.style.transform = "translate(0,0)"; };
    el.addEventListener("mousemove", move);
    el.addEventListener("mouseleave", leave);
    return () => {
      el.removeEventListener("mousemove", move);
      el.removeEventListener("mouseleave", leave);
    };
  }, [ref, strength]);
}

/* ── DroneHud ───────────────────────────────────────────────────────────────
   Aerial telemetry overlay. Sits inside the hero scene (aria-hidden). Reveal /
   altitude are driven by useDroneScene (it reads [data-hud] and [data-alt]).
─────────────────────────────────────────────────────────────────────────── */
export function DroneHud({ coords = "N 40.71° · W 74.01°", children }: { coords?: string; children?: ReactNode }) {
  return (
    <div data-hud aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0, transition: "opacity 1.1s ease .4s", fontFamily: "'Inter',monospace", transform: "translate3d(calc(var(--mx,0) * 22px), calc(var(--my,0) * 22px), 0)" }}>
      <span style={{ position: "absolute", left: 0, right: 0, top: 0, height: "18vh", background: "linear-gradient(180deg,transparent,rgba(198,167,94,.10) 60%,rgba(198,167,94,.22))", animation: "oe-scan 7.5s linear infinite" }} />
      <div style={{ position: "absolute", top: 104, left: "clamp(20px,5vw,40px)", display: "flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: ".18em", color: "rgba(255,255,255,.7)" }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e5484d", animation: "oe-recBlink 1.4s steps(1) infinite" }} />REC
      </div>
      <div style={{ position: "absolute", top: 104, right: "clamp(20px,5vw,40px)", textAlign: "right", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", color: "rgba(255,255,255,.7)" }}>
        <div>ALT <span data-alt style={{ color: "#C6A75E" }}>400</span> FT</div>
        <div style={{ marginTop: 4, color: "rgba(255,255,255,.5)" }}>{coords}</div>
      </div>
      <span style={{ position: "absolute", top: "50%", left: "50%", width: 118, height: 118, transform: "translate(-50%,-50%)", border: "1px solid rgba(198,167,94,.32)", borderRadius: "50%" }} />
      <span style={{ position: "absolute", top: "50%", left: "50%", width: 1, height: 30, transform: "translate(-50%,-50%)", background: "rgba(198,167,94,.4)" }} />
      <span style={{ position: "absolute", top: "50%", left: "50%", width: 30, height: 1, transform: "translate(-50%,-50%)", background: "rgba(198,167,94,.4)" }} />
      {children}
    </div>
  );
}

/* ── Keyframes the components rely on ─────────────────────────────────────────
   These are component-scoped: render <MotionKeyframes/> once (e.g. in App or the
   page) OR paste the CSS into client/src/index.css. Names are namespaced `oe-`.
─────────────────────────────────────────────────────────────────────────── */
export const MOTION_KEYFRAMES = `
@keyframes oe-drone{0%{transform:scale(1.14) translate3d(-3.5%,-2.5%,0)}50%{transform:scale(1.22) translate3d(1%,1.5%,0)}100%{transform:scale(1.3) translate3d(4%,3.5%,0)}}
@keyframes oe-scan{0%{transform:translateY(-12vh);opacity:0}12%{opacity:.5}88%{opacity:.5}100%{transform:translateY(112vh);opacity:0}}
@keyframes oe-recBlink{0%,49%{opacity:1}50%,100%{opacity:.18}}
@keyframes oe-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes oe-cue{0%{transform:translateY(0);opacity:0}40%{opacity:1}80%{transform:translateY(11px);opacity:0}100%{opacity:0}}
@media (prefers-reduced-motion: reduce){
  *{animation-duration:.001ms!important;animation-iteration-count:1!important}
}`;

export function MotionKeyframes() {
  return <style dangerouslySetInnerHTML={{ __html: MOTION_KEYFRAMES }} />;
}
