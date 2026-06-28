import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { SMOOTH_EASE } from "@/lib/animations";

/* ────────────────────────────────────────────────────────────────────────────
   OutsourcEdge — About (Phase-1 redesign)
   Brand: navy #1F2A44 + champagne gold #C6A75E, Poppins display × Inter body,
   60/30/10 color split, page bg #FAF7F1.
   Motion (all honor prefers-reduced-motion):
     • word-by-word hero reveal + offset photo pair with scroll parallax
     • navy "why we exist" manifesto band
     • 3 alternating story rows with gentle photo parallax + kicker pills
     • a slowly auto-rotating 3D ring of 6 capability cards orbiting a gold core
       (look-around on hover; falls back to a 2-col grid on mobile / reduced motion)
     • 4 value cards with cursor tilt + a "Why offshore?" sand band
     • a 2×2 team photo mosaic
     • navy CTA band, footer, floating Aria assistant
   NOTE: the gold core uses /public/brand/outsourcedge-mark-white.png.
──────────────────────────────────────────────────────────────────────────── */

const NAVY = "#1F2A44";
const GOLD = "#C6A75E";

const HERO_WORDS_A = ["The", "team", "behind", "your", "properties"];
const HERO_WORDS_B = ["—", "without", "the", "payroll."];

const story = [
  {
    n: "01 · The frustration",
    title: "Great owners were stuck doing $15/hour work.",
    copy: "Inboxes, listings, tenant messages, maintenance calls — the work that fills a day but doesn't grow a business. We kept watching capable owners trade their evenings for admin no one should be doing at their level.",
    img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=80",
    alt: "An owner buried in admin and paperwork",
    reversed: false,
  },
  {
    n: "02 · The build",
    title: "So we built the team we wished we'd had.",
    copy: "We went offshore for talent and kept on-shore standards: structured vetting, real communication, and judgment under pressure. Never the cheapest seat we could fill — always the right person for the role.",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    alt: "The OutsourcEdge team collaborating",
    reversed: true,
  },
  {
    n: "03 · The standard",
    title: "Now it runs like a larger company — without the payroll.",
    copy: "Today OutsourcEdge places dependable people inside the systems owners already use, with weekly reporting and clean ownership — so nothing slips through, and everyone always knows what's next.",
    img: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=1200&q=80",
    alt: "Clean weekly reporting",
    reversed: false,
  },
];

const capabilities = [
  { n: "01", title: "Listings & marketing", copy: "Photos, copy, and channel updates kept current.", img: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80" },
  { n: "02", title: "Tenant coordination", copy: "Messages, scheduling, and renewals handled.", img: "https://images.unsplash.com/photo-1556745757-8d76bdb6984b?auto=format&fit=crop&w=800&q=80" },
  { n: "03", title: "Maintenance follow-up", copy: "Vendors dispatched and tickets closed out.", img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80" },
  { n: "04", title: "Owner reporting", copy: "Weekly summaries so nothing disappears.", img: "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=800&q=80" },
  { n: "05", title: "Inbox & calendar", copy: "Triaged daily so the right things move first.", img: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80" },
  { n: "06", title: "Guest & client support", copy: "Fast, on-brand replies that protect reviews.", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" },
];

const values = [
  { title: "Vetted, always", copy: "We hire for skill and judgment, not just availability. Every placement is screened before they ever reach you." },
  { title: "Owners get time back", copy: "Every role is designed to remove work from your plate — not add another thing to manage." },
  { title: "Quietly premium", copy: "Boutique service standards, not call-center scripts. Calm, capable, and easy to work with." },
  { title: "Built to scale", copy: "Start with one role. Grow into a full back office as your portfolio expands." },
];

const teamPhotos = [
  { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=700&q=80", top: false },
  { img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80", top: true },
  { img: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=700&q=80", top: false },
  { img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=700&q=80", top: true },
];

/* ── Story row with scroll-linked photo parallax ──────────────────────────── */
function StoryRow({ item }: { item: (typeof story)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [30, -30]);

  const media = (
    <Reveal>
      <div
        ref={ref}
        className="relative overflow-hidden rounded-[18px] border border-[#1F2A44]/[0.08] shadow-[0_30px_70px_rgba(31,42,68,0.16)]"
        style={{ aspectRatio: "5 / 4" }}
      >
        <motion.img
          src={item.img}
          alt={item.alt}
          style={{ y }}
          className="absolute inset-0 h-[128%] w-full -translate-y-[14%] object-cover"
        />
      </div>
    </Reveal>
  );

  const copy = (
    <div>
      <Reveal>
        <span className="mb-[18px] inline-block rounded-full border border-[#C6A75E]/50 px-[13px] py-[5px] font-[Poppins] text-[13px] font-bold text-[#C6A75E]">
          {item.n}
        </span>
      </Reveal>
      <Reveal delay={0.09}>
        <h3 className="font-[Poppins] text-[clamp(22px,2.8vw,32px)] font-semibold leading-[1.16] tracking-[-0.01em] text-[#1F2A44]">
          {item.title}
        </h3>
      </Reveal>
      <Reveal delay={0.18}>
        <p className="mt-4 max-w-[460px] text-[clamp(15px,1.7vw,18px)] leading-[1.66] text-[#1B1F2A]/[0.66]">
          {item.copy}
        </p>
      </Reveal>
    </div>
  );

  return (
    <div className="mb-[clamp(56px,7vw,104px)] grid items-center gap-[clamp(28px,5vw,72px)] last:mb-0 md:grid-cols-2">
      {item.reversed ? (
        <>
          <div className="order-2 md:order-1">{copy}</div>
          <div className="order-1 md:order-2">{media}</div>
        </>
      ) : (
        <>
          {media}
          {copy}
        </>
      )}
    </div>
  );
}

/* ── Value card with cursor tilt ──────────────────────────────────────────── */
function ValueCard({ v, delay }: { v: (typeof values)[number]; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -4;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 4;
    el.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    el.style.boxShadow = "0 30px 60px rgba(31,42,68,.14)";
    el.style.borderColor = "rgba(198,167,94,.5)";
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "none";
    el.style.boxShadow = "0 18px 44px rgba(31,42,68,.06)";
    el.style.borderColor = "rgba(31,42,68,.1)";
  };

  return (
    <Reveal delay={delay}>
      <article
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="rounded-[16px] border border-[#1F2A44]/10 bg-white p-[clamp(26px,3vw,38px)] shadow-[0_18px_44px_rgba(31,42,68,0.06)] transition-[transform,box-shadow,border-color] duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
      >
        <span className="mb-6 block h-[3px] w-10 rounded-full bg-[#C6A75E]" />
        <h3 className="font-[Poppins] text-[clamp(20px,2.2vw,24px)] font-semibold tracking-[-0.01em] text-[#1F2A44]">
          {v.title}
        </h3>
        <p className="mt-3 text-[15px] leading-[1.62] text-[#1B1F2A]/[0.66]">{v.copy}</p>
      </article>
    </Reveal>
  );
}

/* ── Auto-rotating 3D capability ring (mobile / reduced-motion → grid) ─────── */
function CapabilityRing() {
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const auroraRef = useRef<HTMLDivElement>(null);

  const ringRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ringRef,
    offset: ["start end", "end start"],
  });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 859px)");
    const apply = () => setIsMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const ringOn = !reduce && !isMobile;

  useEffect(() => {
    if (!ringOn) return;
    const stage = stageRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    const N = cards.length;
    if (!stage || !N) return;

    const STEP = 360 / N;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const SPIN = 0.06; // °/frame
    let radius = clamp(window.innerWidth * 0.27, 250, 380);

    const layout = () => {
      radius = clamp(window.innerWidth * 0.27, 250, 380);
      cards.forEach((c, i) => {
        c.style.transform = `rotateY(${i * STEP}deg) translateZ(${radius}px)`;
      });
    };
    layout();
    window.addEventListener("resize", layout, { passive: true });

    let auto = 0;
    let smRing = 0;
    let raf = 0;
    const frame = () => {
      auto += SPIN;
      const target = (scrollYProgress.get() - 0.5) * 170;
      smRing = lerp(smRing, target, 0.05);
      const ang = auto + smRing;
      stage.style.transform = `rotateY(${ang}deg)`;
      for (let i = 0; i < N; i++) {
        const a = ((i * STEP + ang) * Math.PI) / 180;
        const z = Math.cos(a);
        const c = cards[i];
        c.style.opacity = (0.3 + 0.7 * (z * 0.5 + 0.5)).toFixed(3);
        c.style.filter = `brightness(${(0.58 + 0.42 * (z * 0.5 + 0.5)).toFixed(3)})`;
        c.style.zIndex = String(Math.round((z + 1) * 100));
      }
      if (auroraRef.current) {
        auroraRef.current.style.transform = `translate3d(0,${((scrollYProgress.get() - 0.5) * 26).toFixed(1)}px,0)`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // look-around on hover
    const scene = sceneRef.current;
    const fine = window.matchMedia("(pointer:fine)").matches;
    const onMove = (ev: MouseEvent) => {
      if (!scene) return;
      const r = scene.getBoundingClientRect();
      const cx = (ev.clientX - r.left) / r.width - 0.5;
      const cy = (ev.clientY - r.top) / r.height - 0.5;
      scene.style.perspectiveOrigin = `${50 + cx * 16}% ${46 + cy * 14}%`;
    };
    const onLeave = () => {
      if (scene) scene.style.perspectiveOrigin = "50% 46%";
    };
    if (scene && fine) {
      scene.addEventListener("mousemove", onMove);
      scene.addEventListener("mouseleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", layout);
      if (scene && fine) {
        scene.removeEventListener("mousemove", onMove);
        scene.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [ringOn, scrollYProgress]);

  return (
    <section
      ref={ringRef}
      className="relative overflow-hidden bg-[#141929] px-[clamp(20px,5vw,40px)] py-[clamp(76px,9vw,128px)] text-white"
    >
      {/* aurora glows */}
      <div ref={auroraRef} aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -right-[8%] -top-[14%] aspect-square w-[48vw] max-w-[620px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.26),transparent_64%)] blur-2xl" />
        <div className="absolute -bottom-[20%] -left-[10%] aspect-square w-[44vw] max-w-[560px] rounded-full bg-[radial-gradient(circle,rgba(56,72,110,0.55),transparent_66%)] blur-xl" />
      </div>
      {/* grid mask */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)",
          backgroundSize: "64px 64px",
          WebkitMaskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%,#000 30%,transparent 76%)",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 40%,#000 30%,transparent 76%)",
        }}
      />

      <div className="relative mx-auto max-w-[1240px] text-center">
        <Reveal>
          <p className="mb-[18px] text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">
            Inside the operation
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="mx-auto max-w-[16ch] text-balance font-[Poppins] text-[clamp(28px,4.2vw,50px)] font-semibold leading-[1.1] tracking-[-0.015em]">
            One operation. Every moving part, covered.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="mx-auto mt-[18px] max-w-[560px] text-[clamp(15px,1.7vw,18px)] leading-[1.62] text-white/[0.72]">
            The work that runs a property business, orbiting a single dependable
            team. Scroll, or hover to look around.
          </p>
        </Reveal>
      </div>

      {ringOn ? (
        <div
          ref={sceneRef}
          className="relative mx-auto mt-[clamp(36px,5vw,60px)] h-[clamp(360px,46vw,470px)] w-full max-w-[1100px]"
          style={{ perspective: "1500px", perspectiveOrigin: "50% 46%" }}
        >
          <div
            ref={stageRef}
            className="absolute left-1/2 top-1/2 h-0 w-0 [transform-style:preserve-3d] will-change-transform"
          >
            {capabilities.map((c, i) => (
              <article
                key={c.n}
                ref={(el) => { cardRefs.current[i] = el; }}
                className="absolute left-1/2 top-1/2 -ml-[134px] -mt-[168px] h-[336px] w-[268px] overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#1F2A44] shadow-[0_30px_70px_rgba(0,0,0,0.45)] [backface-visibility:hidden]"
              >
                <div className="relative h-[62%] overflow-hidden">
                  <img src={c.img} alt={c.title} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,25,41,0.05),rgba(20,25,41,0.55))]" />
                  <span className="absolute left-[14px] top-[14px] rounded-full bg-[rgba(15,19,33,0.62)] px-[11px] py-[5px] font-[Poppins] text-[12px] font-bold text-[#C6A75E]">
                    {c.n}
                  </span>
                </div>
                <div className="px-5 pt-5">
                  <h3 className="font-[Poppins] text-[18px] font-semibold tracking-[-0.01em] text-white">
                    {c.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-[1.5] text-white/[0.66]">{c.copy}</p>
                </div>
              </article>
            ))}
          </div>
          {/* gold core */}
          <div
            aria-hidden
            className="absolute left-1/2 top-[46%] z-[1] flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_40%_35%,#C6A75E,#9a7e3e)] shadow-[0_0_0_10px_rgba(198,167,94,0.1),0_0_70px_rgba(198,167,94,0.45)]"
          >
            <img
              src="/brand/outsourcedge-mark-white.png"
              alt=""
              className="h-[46px] w-[46px] object-contain opacity-90"
            />
          </div>
        </div>
      ) : (
        <div className="relative mx-auto mt-9 grid max-w-[520px] grid-cols-2 gap-[14px]">
          {capabilities.map((c) => (
            <div
              key={c.n}
              className="rounded-[14px] border border-white/[0.12] bg-[#1F2A44] p-[18px]"
            >
              <span className="font-[Poppins] text-[12px] font-bold text-[#C6A75E]">{c.n}</span>
              <h3 className="mt-2 font-[Poppins] text-[16px] font-semibold text-white">{c.title}</h3>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Hero with offset photo pair + scroll parallax ────────────────────────── */
function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -52]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 60]);
  const yBadge = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -88]);

  const word = (w: string, i: number, gold = false) => (
    <motion.span
      key={`${w}-${i}`}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: SMOOTH_EASE, delay: 0.24 + i * 0.08 }}
      className="inline-block"
      style={gold ? { color: GOLD } : undefined}
    >
      {w}&nbsp;
    </motion.span>
  );

  return (
    <section
      id="about-top"
      className="relative overflow-hidden bg-[#FAF7F1] px-[clamp(20px,5vw,40px)] pb-[clamp(56px,8vw,96px)] pt-[clamp(122px,15vh,180px)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-[10%] -top-[8%] aspect-square w-[42vw] max-w-[560px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.14),transparent_66%)] blur-[8px]"
      />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-[clamp(32px,5vw,72px)] md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal>
            <div className="mb-[22px] flex items-center gap-[14px]">
              <span className="block h-px w-[46px] bg-[#C6A75E]" />
              <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">
                About OutsourcEdge
              </span>
            </div>
          </Reveal>
          <h1 className="text-balance font-[Poppins] text-[clamp(34px,5.4vw,66px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#1F2A44]">
            {HERO_WORDS_A.map((w, i) => word(w, i))}
            <br />
            {HERO_WORDS_B.map((w, i) => word(w, HERO_WORDS_A.length + i, true))}
          </h1>
          <Reveal delay={0.14}>
            <p className="mt-[26px] max-w-[500px] text-[clamp(16px,1.9vw,19px)] leading-[1.66] text-[#1B1F2A]/[0.7]">
              OutsourcEdge is an offshore talent partner built for US realtors,
              landlords, and short-term-rental hosts. We place vetted people who run
              your listings, tenants, and back office — quietly, reliably, and to
              on-shore standards.
            </p>
          </Reveal>
          <Reveal delay={0.26}>
            <div className="mt-[34px] flex flex-wrap gap-[14px]">
              <Button asChild className="btn-gold">
                <Link href="/contact">
                  Book a Discovery Call <ArrowRight className="h-[17px] w-[17px]" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-[10px] border-[#1F2A44]/20 px-6 py-[15px] font-semibold text-[#1F2A44] hover:bg-[#1F2A44]/5"
              >
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </Reveal>
        </div>

        {/* hero art — hidden on mobile */}
        <div ref={ref} className="relative hidden h-[clamp(380px,46vw,540px)] md:block">
          <motion.div
            style={{ y: y1 }}
            className="absolute right-0 top-0 z-[2] w-[70%] overflow-hidden rounded-[18px] border border-[#1F2A44]/[0.08] shadow-[0_36px_80px_rgba(31,42,68,0.2)]"
          >
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1100&q=80"
              alt="OutsourcEdge team at work"
              className="h-full w-full object-cover"
              style={{ aspectRatio: "3 / 4" }}
            />
          </motion.div>
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-0 left-0 z-[3] w-[55%] overflow-hidden rounded-[16px] border-4 border-[#FAF7F1] shadow-[0_28px_64px_rgba(31,42,68,0.22)]"
          >
            <img
              src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=900&q=80"
              alt="A managed residential property"
              className="h-full w-full object-cover"
              style={{ aspectRatio: "1 / 1" }}
            />
          </motion.div>
          <motion.div
            style={{ y: yBadge }}
            className="absolute -left-[2%] top-[18%] z-[4] rounded-[14px] bg-[#1F2A44] px-[18px] py-4 text-white shadow-[0_22px_50px_rgba(31,42,68,0.3)]"
          >
            <p className="font-[Poppins] text-[26px] font-bold leading-none text-[#C6A75E]">5–7</p>
            <p className="mt-[6px] text-[11px] font-semibold tracking-[0.06em] text-white/[0.78]">
              days to launch
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <div className="bg-[#FAF7F1] text-[#1B1F2A]">
      <Header />

      <Hero />

      {/* Why we exist — navy manifesto */}
      <section className="relative overflow-hidden bg-[#1F2A44] px-[clamp(20px,5vw,40px)] py-[clamp(72px,10vw,128px)] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-[30%] -right-[6%] aspect-square w-[44vw] max-w-[560px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.16),transparent_66%)] blur-xl"
        />
        <div className="relative mx-auto max-w-[1000px] text-center">
          <Reveal>
            <span className="mx-auto mb-7 block h-px w-14 bg-[#C6A75E]" />
          </Reveal>
          <Reveal delay={0.08}>
            <p className="mb-[22px] text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">
              Why we exist
            </p>
          </Reveal>
          <Reveal delay={0.18}>
            <h2 className="text-balance font-[Poppins] text-[clamp(26px,3.8vw,46px)] font-medium leading-[1.28] tracking-[-0.01em]">
              We exist to give owners their time back — placing dependable talent
              that makes a one-person operation run like a{" "}
              <span className="text-[#C6A75E]">larger company's</span>, without the
              payroll.
            </h2>
          </Reveal>
        </div>
      </section>

      {/* Our story */}
      <section className="bg-[#FAF7F1] px-[clamp(20px,5vw,40px)] py-[clamp(72px,9vw,124px)]">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-[clamp(48px,6vw,80px)] max-w-[640px]">
            <Reveal>
              <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">
                Our story
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-[Poppins] text-[clamp(28px,4.2vw,50px)] font-semibold leading-[1.08] tracking-[-0.015em] text-[#1F2A44]">
                Built by operators who'd done the work themselves.
              </h2>
            </Reveal>
          </div>
          {story.map((s) => (
            <StoryRow key={s.n} item={s} />
          ))}
        </div>
      </section>

      {/* Inside the operation — 3D ring */}
      <CapabilityRing />

      {/* What we believe */}
      <section className="bg-[#FAF7F1] px-[clamp(20px,5vw,40px)] py-[clamp(72px,9vw,124px)]">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-[clamp(40px,5vw,60px)] max-w-[640px]">
            <Reveal>
              <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">
                What we believe
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-[Poppins] text-[clamp(28px,4.2vw,50px)] font-semibold leading-[1.08] tracking-[-0.015em] text-[#1F2A44]">
                What guides our work.
              </h2>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-4 text-[clamp(15px,1.7vw,18px)] leading-[1.62] text-[#1B1F2A]/[0.66]">
                Four principles shape how we hire, how we work, and how we show up
                for every client we serve.
              </p>
            </Reveal>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {values.map((v, i) => (
              <ValueCard key={v.title} v={v} delay={i % 2 === 1 ? 0.12 : 0} />
            ))}
          </div>
          <Reveal delay={0.14}>
            <div className="mt-5 rounded-[16px] bg-[#E8DCC8] p-[clamp(24px,3vw,34px)]">
              <h3 className="font-[Poppins] text-[clamp(18px,2vw,22px)] font-semibold tracking-[-0.01em] text-[#1F2A44]">
                Why offshore?
              </h3>
              <p className="mt-[10px] max-w-[760px] text-[15px] leading-[1.62] text-[#1B1F2A]/[0.7]">
                Access experienced, English-fluent professionals at a fraction of
                local staffing cost — without sacrificing quality, accountability,
                or your standards.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* The team you're really hiring */}
      <section className="border-t border-[#1F2A44]/[0.07] bg-white px-[clamp(20px,5vw,40px)] py-[clamp(72px,9vw,124px)]">
        <div className="mx-auto grid max-w-[1240px] items-center gap-[clamp(36px,5vw,72px)] md:grid-cols-[0.95fr_1.05fr]">
          <div>
            <Reveal>
              <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">
                The people
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-[Poppins] text-[clamp(26px,3.6vw,44px)] font-semibold leading-[1.1] tracking-[-0.015em] text-[#1F2A44]">
                The team you're really hiring.
              </h2>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-[18px] max-w-[480px] text-[clamp(15px,1.7vw,18px)] leading-[1.66] text-[#1B1F2A]/[0.66]">
                Not a faceless queue of contractors. You get a dedicated person —
                matched to your role, supported by a team that has their back, and
                accountable to one standard: the work gets done, and you can see it.
              </p>
            </Reveal>
            <Reveal delay={0.26}>
              <div className="mt-[30px] flex flex-wrap gap-3">
                {["Structured vetting", "Dedicated match", "Backed by a team"].map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-2 rounded-full border border-[#1F2A44]/10 bg-[#FAF7F1] px-[15px] py-[9px] text-[13px] font-semibold text-[#1F2A44]"
                  >
                    <span className="h-[6px] w-[6px] rounded-full bg-[#C6A75E]" />
                    {chip}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {teamPhotos.map((p, i) => (
              <Reveal key={p.img} delay={i * 0.08}>
                <div
                  className={`overflow-hidden rounded-[16px] shadow-[0_24px_56px_rgba(31,42,68,0.16)] ${p.top ? "mt-7" : ""}`}
                  style={{ aspectRatio: "4 / 5" }}
                >
                  <img src={p.img} alt="An OutsourcEdge team member" className="h-full w-full object-cover" />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section
        id="contact"
        className="bg-[#FAF7F1] px-[clamp(20px,5vw,40px)] pb-[clamp(72px,9vw,120px)] pt-[clamp(56px,7vw,96px)]"
      >
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(120deg,#1F2A44,#2a3a5e)] p-[clamp(40px,6vw,72px)] text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-[8%] -top-[30%] aspect-square w-[34vw] max-w-[460px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.28),transparent_66%)] blur-xl"
              />
              <div className="relative grid items-center gap-9 md:grid-cols-[1.4fr_auto]">
                <div>
                  <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">
                    Next step
                  </p>
                  <h2 className="font-[Poppins] text-[clamp(28px,4vw,46px)] font-semibold leading-[1.08] tracking-[-0.015em]">
                    Get the right support in place.
                  </h2>
                  <p className="mt-4 max-w-[560px] text-[17px] leading-[1.6] text-white/[0.74]">
                    Tell us what you need off your plate. We'll map the role, the
                    tools, and your first-week operating rhythm — no pressure, no
                    payroll.
                  </p>
                </div>
                <Button asChild className="btn-gold whitespace-nowrap px-[30px] py-[18px] text-[16px]">
                  <Link href="/contact">
                    Book a Discovery Call <ArrowRight className="h-[17px] w-[17px]" />
                  </Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
      <AiAssistant />
    </div>
  );
}
