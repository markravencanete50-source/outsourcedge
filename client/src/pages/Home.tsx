import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import Seo from "@/components/Seo";
import { Reveal, Stagger, StaggerChild } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, BarChart3, CheckCircle, ClipboardCheck, Headphones,
  Home as HomeIcon, MailCheck, Shield, Users,
} from "lucide-react";
import { Link } from "wouter";
import {
  motion, useReducedMotion, useScroll, useTransform, useMotionValueEvent,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { collection, doc, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SMOOTH_EASE } from "@/lib/animations";
import { useDroneScene, useMagnetic, DroneHud, MotionKeyframes } from "@/lib/motion3d";

/* ────────────────────────────────────────────────────────────────────────────
   OutsourcEdge — Home (Phase-2 motion level-up)
   Brand: navy #1F2A44 + champagne gold #C6A75E, Poppins × Inter, 60/30/10.

   Hero is now a CINEMATIC 3D DRONE SCENE:
     • real looping drone city/property flyover video over an always-moving
       aerial still (oe-drone ken-burns) — motion shows even if autoplay blocks
     • multi-layer parallax TILT (mouse on desktop, device gyro on mobile) via
       useDroneScene → writes --mx / --my / --p CSS vars onto the <section>
     • on scroll the camera DESCENDS (scale-in) behind a subtle drone HUD
     • magnetic primary CTA (useMagnetic)
   The rest of the page (trust strip, pinned scrollytelling, horizontal lanes,
   drawing timeline, CTA) is unchanged from Phase 1. All honors reduced-motion.

   Assets needed in /client/public/brand/:
     hero-loop.mp4               (drone city/property flyover)
     outsourcedge-mark-white.png (white mark — already added in Phase 1)
     og-cover.jpg                (1200×630 social card, for <Seo/>)
──────────────────────────────────────────────────────────────────────────── */

interface PageContent { heroTitle: string; heroSubtitle: string; servicesTitle: string; }
interface Service { id: string; title: string; description: string; icon: string; }
interface Testimonial { id: string; name: string; company: string; content: string; rating: number; }

const DEFAULT_CONTENT: PageContent = {
  heroTitle: "Your listings, expertly managed. Your time, given back.",
  heroSubtitle:
    "OutsourcEdge places vetted offshore talent with US realtors, landlords, and short-term-rental hosts — so your listings, tenants, and back office run like a larger company's, without the payroll.",
  servicesTitle: "Support built around the work you'd rather hand off.",
};

const HERO_WORDS_A = ["Your", "listings,", "expertly", "managed."];
const HERO_WORDS_B = ["Your", "time,", "given", "back."];

const highlights = [
  { value: "5–7", label: "days to launch", emphasis: false },
  { value: "24/7", label: "coverage, across time zones", emphasis: false },
  { value: "40–60%", label: "lower operating overhead", emphasis: true },
  { value: "1:1", label: "dedicated talent match", emphasis: false },
];

const servicesFallback = [
  { icon: Users, title: "Virtual Assistant Teams", description: "Inbox, calendar, CRM, research, and repeatable admin work handled by dependable offshore support." },
  { icon: HomeIcon, title: "Property Management Support", description: "Tenant coordination, maintenance follow-up, listing support, and owner reporting for real estate operators." },
  { icon: Headphones, title: "Customer & Client Support", description: "Professional response coverage, ticket triage, follow-ups, and escalation rules that protect your guest experience." },
];

const whyPanels = [
  { title: "Vetted people you can hand the keys to.", copy: "Talent selected for reliability, communication, role fit, and judgment under real operating pressure — not the cheapest seat we can fill.", img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80" },
  { title: "Built into the way you already work.", copy: "We operate inside your tools, channels, templates, and approval rules — so it feels less like outsourcing and more like a teammate who simply gets it.", img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1200&q=80" },
  { title: "Delivery you can actually see.", copy: "Weekly reporting and clean task ownership keep work from disappearing. You always know what got done, what's next, and who owns it.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" },
];

const lanes = [
  { icon: MailCheck, n: "01", title: "Admin execution", copy: "Email, calendars, CRM updates, task follow-up, research, and documentation — handled with a clean daily rhythm.", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80" },
  { icon: BarChart3, n: "02", title: "Operations support", copy: "Process tracking, reports, SOPs, QA checklists, and recurring work kept visible for the people who manage it.", img: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80" },
  { icon: HomeIcon, n: "03", title: "Property management", copy: "Tenant coordination, maintenance follow-up, listing support, and owner reporting built around how you run.", img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80" },
  { icon: ClipboardCheck, n: "04", title: "Client & guest support", copy: "Response coverage, ticket triage, follow-ups, and escalation rules that protect your guest experience.", img: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80" },
];

const processSteps = [
  { step: "Match", copy: "We define the role and pair you with vetted talent built for it — judgment, fit, and reliability first." },
  { step: "Onboard", copy: "Your new teammate installs into your tools, templates, and rhythm — usually live within 5–7 days." },
  { step: "Results", copy: "Weekly reporting and clean ownership keep the work visible — and your time genuinely given back." },
];

const heroStagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } } };
const wordItem: Variants = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SMOOTH_EASE } } };
const fadeItem: Variants = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SMOOTH_EASE } } };
const cardHover = { y: -6, transition: { duration: 0.25, ease: SMOOTH_EASE } };

function useIsDesktop(query = "(min-width: 1024px)") {
  const [v, setV] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setV(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return v;
}

export default function Home() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop(); // pinned scrollytelling + horizontal lanes only on lg+

  // ── HERO · 3D drone scene ───────────────────────────────────────────────
  const heroRef = useRef<HTMLElement>(null);
  useDroneScene(heroRef, { descentVh: 1, altFrom: 400, altTo: 12 });
  const heroCtaRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(heroCtaRef, 14);
  // reveal the drone video only once it's genuinely playing, so a blocked
  // autoplay degrades to the always-moving aerial still (never a frozen frame).
  const droneVidRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = droneVidRef.current;
    if (!v) return;
    const onPlaying = () => { v.style.opacity = "0.55"; };
    v.addEventListener("playing", onPlaying);
    v.play?.().catch(() => {});
    return () => v.removeEventListener("playing", onPlaying);
  }, []);

  // Scrollytelling (why we delegate)
  const whyRef = useRef<HTMLElement>(null);
  const { scrollYProgress: whyP } = useScroll({ target: whyRef, offset: ["start start", "end end"] });
  const [whyActive, setWhyActive] = useState(0);
  const whyBar = useTransform(whyP, [0, 1], ["0%", "100%"]);
  useMotionValueEvent(whyP, "change", (v) => {
    const i = Math.min(whyPanels.length - 1, Math.max(0, Math.floor(v * whyPanels.length * 0.999)));
    setWhyActive(i);
  });

  // Horizontal lanes
  const lanesRef = useRef<HTMLElement>(null);
  const { scrollYProgress: lanesP } = useScroll({ target: lanesRef, offset: ["start start", "end end"] });
  const trackX = useTransform(lanesP, [0, 1], ["0%", reduce ? "0%" : "-72%"]);
  const lanesBar = useTransform(lanesP, [0, 1], ["12%", "100%"]);

  // Timeline draw
  const tlRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: tlP } = useScroll({ target: tlRef, offset: ["start 0.8", "center 0.5"] });
  const tlScale = useTransform(tlP, [0, 1], [0, 1]);

  useEffect(() => {
    if (!db) return;
    const unsubContent = onSnapshot(doc(db, "site_content", "main"), (s) => {
      if (s.exists()) setContent({ ...DEFAULT_CONTENT, ...(s.data() as PageContent) });
    });
    const sQ = query(collection(db, "services"), orderBy("order", "asc"), limit(3));
    const unsubServices = onSnapshot(sQ, (snap) => setServices(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Service))));
    const tQ = query(collection(db, "testimonials"), limit(3));
    const unsubT = onSnapshot(tQ, (snap) => setTestimonials(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Testimonial))));
    return () => { unsubContent(); unsubServices(); unsubT(); };
  }, []);

  const visibleServices = services.length > 0
    ? services
    : servicesFallback.map((s, i) => ({ id: String(i), title: s.title, description: s.description, icon: "" }));

  return (
    <div className="min-h-screen bg-[#FAF7F1]">
      <Seo
        org
        title={DEFAULT_CONTENT.heroTitle}
        description="Vetted offshore talent for US realtors, landlords & STR hosts — admin, ops, support & property management without the payroll."
        path="/"
      />
      <MotionKeyframes />
      <Header />

      <main>
        {/* ── HERO · 3D DRONE SCENE ────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative flex min-h-[100vh] items-center overflow-hidden bg-[#141929] pt-32 text-white md:pt-40"
          style={{ perspective: "1500px" }}
        >
          {/* 3D scene wrapper — scales on scroll (--p), tilts on pointer/gyro (--mx/--my) */}
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
              transition: "transform .5s cubic-bezier(.16,1,.3,1)",
              transform:
                "scale(calc(1 + var(--p,0) * 0.16)) rotateX(calc(var(--my,0) * -3.2deg)) rotateY(calc(var(--mx,0) * 3.2deg))",
            }}
          >
            {/* always-moving aerial city still (guaranteed motion) */}
            <div className="absolute inset-[-10%_-6%]" style={{ transform: "translate3d(calc(var(--mx,0) * 9px), calc(var(--my,0) * 9px), 0)", willChange: "transform" }}>
              <img
                src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=2400&q=80"
                alt=""
                className="h-full w-full object-cover"
                style={{ opacity: 0.62, filter: "grayscale(0) brightness(1.12) contrast(1.04) saturate(1.05)", animation: reduce ? "none" : "oe-drone 20s ease-in-out infinite alternate" }}
              />
            </div>
            {/* real drone footage — revealed only once it's actually playing */}
            <video
              ref={droneVidRef}
              autoPlay muted loop playsInline preload="auto" aria-hidden="true"
              className="absolute inset-[-10%_-6%] h-[120%] w-[112%] object-cover"
              style={{ opacity: 0, transition: "opacity 1.4s ease", filter: "grayscale(.18) contrast(1.05)", transform: "translate3d(calc(var(--mx,0) * 9px), calc(var(--my,0) * 9px), 0)" }}
            >
              <source src="/brand/hero-loop.mp4" type="video/mp4" />
            </video>
            {/* legibility gradient */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(96deg,rgba(15,19,33,.9) 0%,rgba(20,25,41,.62) 48%,rgba(31,42,68,.22) 100%)" }} />
            {/* depth grid */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px)",
                backgroundSize: "64px 64px",
                WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 30% 40%,#000 30%,transparent 75%)",
                maskImage: "radial-gradient(ellipse 80% 70% at 30% 40%,#000 30%,transparent 75%)",
                transform: "translate3d(calc(var(--mx,0) * 16px), calc(var(--my,0) * 16px), 0)",
              }}
            />
            {/* drone telemetry HUD (reveal + altitude driven by useDroneScene) */}
            {!reduce && <DroneHud />}
          </div>

          {/* hero content — counter-tilts and lifts on scroll */}
          <motion.div
            className="container relative z-10 pb-16"
            style={{ transform: "translate3d(calc(var(--mx,0) * -6px), calc(var(--p,0) * 60px + var(--my,0) * -6px), 0)", opacity: "calc(1 - var(--p,0) * 1.05)", willChange: "transform,opacity" }}
          >
            <motion.div className="max-w-3xl" initial="hidden" animate="visible" variants={heroStagger}>
              <motion.div variants={fadeItem} className="mb-6 flex items-center gap-3.5">
                <span className="h-px w-[46px] bg-[#C6A75E]" />
                <span className="eyebrow">Offshore talent · On-shore standards</span>
              </motion.div>
              <h1 className="font-['Poppins'] text-[clamp(38px,6.4vw,76px)] font-semibold leading-[1.04] tracking-[-0.02em] text-white [text-wrap:balance]">
                {HERO_WORDS_A.map((w, i) => (
                  <motion.span key={"a" + i} variants={wordItem} className="inline-block">{w}&nbsp;</motion.span>
                ))}
                <br />
                {HERO_WORDS_B.map((w, i) => (
                  <motion.span key={"b" + i} variants={wordItem} className="inline-block text-[#C6A75E]">{w}&nbsp;</motion.span>
                ))}
              </h1>
              <motion.p variants={fadeItem} className="mt-7 max-w-[560px] text-[clamp(16px,2vw,20px)] font-medium leading-[1.62] text-white/82">
                {content.heroSubtitle}
              </motion.p>
              <motion.div variants={fadeItem} className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Button asChild className="btn-gold text-base"><Link ref={heroCtaRef as any} href="/contact">Book a Discovery Call</Link></Button>
                <Button asChild variant="ghost" className="border border-white/25 bg-white/10 px-6 py-3.5 text-base font-bold text-white hover:bg-white/[0.18]">
                  <Link href="/services">Explore Services</Link>
                </Button>
              </motion.div>
              <motion.div variants={fadeItem} className="mt-10 flex flex-wrap gap-2.5">
                {["Virtual assistants", "Property management", "24/7 coverage"].map((c, i) => (
                  <span key={c} className="inline-flex items-center gap-2 rounded-full border border-white/[0.13] bg-white/[0.07] px-3.5 py-2 text-[13px] font-semibold text-white/[0.86]" style={{ animation: reduce ? "none" : `oe-float 7s ease-in-out ${i * 0.9}s infinite` }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C6A75E]" />{c}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>

          {!reduce && (
            <div data-hero-cue className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 md:block" aria-hidden="true">
              <div className="flex h-9 w-[22px] items-start justify-center rounded-full border-[1.5px] border-white/40 p-[7px]">
                <span className="h-[7px] w-[3.5px] rounded-full bg-[#C6A75E]" style={{ animation: "oe-cue 1.7s ease-in-out infinite" }} />
              </div>
            </div>
          )}
        </section>

        {/* ── TRUST STRIP ──────────────────────────────────────────────────── */}
        <section className="border-b border-[#1F2A44]/10 bg-white">
          <div className="container py-4">
            <Reveal><p className="text-center text-xs font-bold uppercase tracking-[0.14em] text-[#1B1F2A]/50">Trusted by US realtors, landlords &amp; short-term-rental hosts</p></Reveal>
          </div>
          <Stagger className="container grid grid-cols-2 border-t border-[#1F2A44]/10 md:grid-cols-4" gap={0.07}>
            {highlights.map((s) => (
              <StaggerChild key={s.label} distance={18}>
                <div className="py-8 text-center">
                  <p className={`font-['Poppins'] text-[clamp(30px,4vw,42px)] font-bold leading-none ${s.emphasis ? "text-[#C6A75E]" : "text-[#1F2A44]"}`}>{s.value}</p>
                  <p className="mt-2 text-[13px] font-semibold text-[#1B1F2A]/60">{s.label}</p>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </section>

        {/* ── SCROLLYTELLING · WHY DELEGATE (pinned) ────────────────────────── */}
        <section ref={whyRef} className={`relative bg-[#FAF7F1] ${isDesktop ? "h-[340vh]" : ""}`}>
          <div className={`flex items-center ${isDesktop ? "sticky top-0 h-screen overflow-hidden" : ""}`}>
            <div className="container grid items-center gap-8 py-16 lg:grid-cols-2 lg:gap-[clamp(28px,5vw,72px)] lg:py-0">
              <div>
                <p className="eyebrow mb-[18px]">Why owners delegate to us</p>
                <div className="relative">
                  {whyPanels.map((p, i) => (
                    <motion.div key={i} className={isDesktop ? (i === 0 ? "" : "absolute inset-0") : (i === 0 ? "" : "mt-10")} animate={isDesktop ? { opacity: whyActive === i ? 1 : 0, y: whyActive === i ? 0 : 14 } : { opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={{ pointerEvents: isDesktop && whyActive !== i ? "none" : "auto" }}>
                      <h2 className="font-['Poppins'] text-[clamp(28px,4.2vw,50px)] font-semibold leading-[1.08] tracking-[-0.015em] text-[#1F2A44]">{p.title}</h2>
                      <p className="mt-[18px] max-w-[480px] text-[clamp(15px,1.7vw,19px)] leading-[1.62] text-[#1B1F2A]/[0.66]">{p.copy}</p>
                      <motion.span className="mt-6 block h-0.5 w-16 origin-left bg-[#C6A75E]" animate={{ scaleX: isDesktop ? (whyActive === i ? 1 : 0) : 1 }} transition={{ duration: 0.6, ease: SMOOTH_EASE }} />
                    </motion.div>
                  ))}
                </div>
                <div className={`mt-10 gap-2.5 ${isDesktop ? "flex" : "hidden"}`}>
                  {whyPanels.map((_, i) => (
                    <span key={i} className="h-[3px] w-[46px] rounded-full transition-colors duration-300" style={{ background: whyActive === i ? "#C6A75E" : "rgba(31,42,68,.16)" }} />
                  ))}
                </div>
              </div>
              <div className="relative hidden aspect-[4/5] overflow-hidden rounded-[18px] border border-[#1F2A44]/10 shadow-[0_40px_90px_rgba(31,42,68,0.22)] lg:block">
                {whyPanels.map((p, i) => (
                  <motion.div key={i} className="absolute inset-0" animate={{ opacity: whyActive === i ? 1 : 0, scale: whyActive === i ? 1 : 1.07 }} transition={{ duration: 0.6 }}>
                    <img src={p.img} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,25,41,0.12),rgba(20,25,41,0.55))]" />
                  </motion.div>
                ))}
                <div className="absolute inset-x-[22px] bottom-[22px] flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-[0.14em] text-white/85">The OutsourcEdge standard</span>
                  <span className="font-['Poppins'] text-[15px] font-bold text-[#C6A75E]">0{whyActive + 1} / 0{whyPanels.length}</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/[0.18]"><motion.span className="block h-full bg-[#C6A75E]" style={{ width: whyBar }} /></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES ─────────────────────────────────────────────────────── */}
        <section className="section-padding bg-[#E8DCC8]">
          <div className="container">
            <Reveal className="mb-12 max-w-[680px]">
              <p className="eyebrow mb-4">Services</p>
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">{content.servicesTitle}</h2>
            </Reveal>
            <Stagger className="grid gap-5 md:grid-cols-3">
              {visibleServices.map((service, i) => {
                const Icon = servicesFallback[i]?.icon ?? HomeIcon;
                return (
                  <StaggerChild key={service.id}>
                    <motion.article className="premium-card h-full p-[34px]" whileHover={cardHover}>
                      <div className="mb-[26px] flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-[#1F2A44] text-[#C6A75E]"><Icon className="h-6 w-6" /></div>
                      <h3 className="font-['Poppins'] text-[21px] font-semibold tracking-[-0.01em] text-[#1F2A44]">{service.title}</h3>
                      <p className="mt-3 text-[15px] leading-[1.62] text-[#1B1F2A]/[0.66]">{service.description}</p>
                      <Link href={service.title.toLowerCase().includes("property") ? "/project-management" : "/services"} className="mt-[22px] inline-flex items-center gap-2 text-sm font-bold text-[#1F2A44] transition-all hover:gap-3">Learn more <ArrowRight className="h-4 w-4" /></Link>
                    </motion.article>
                  </StaggerChild>
                );
              })}
            </Stagger>
          </div>
        </section>

        {/* ── HORIZONTAL · WHERE WE PLUG IN ─────────────────────────────────── */}
        <section ref={lanesRef} className="relative bg-white lg:h-[360vh]">
          <div className="flex flex-col justify-center overflow-hidden py-20 lg:sticky lg:top-0 lg:h-screen lg:py-0">
            <div className="container mb-6 flex flex-col items-start justify-between gap-5 lg:mb-12 lg:flex-row lg:items-end">
              <div>
                <p className="eyebrow mb-3.5">Where we plug in</p>
                <h2 className="max-w-[620px] font-['Poppins'] text-[clamp(28px,4vw,50px)] font-semibold leading-[1.06] tracking-[-0.015em] text-[#1F2A44]">Support lanes that match the work.</h2>
              </div>
              <span className="hidden items-center gap-2 whitespace-nowrap text-[13px] font-semibold text-[#1B1F2A]/45 lg:flex">Scroll <ArrowRight className="h-3.5 w-5" /></span>
            </div>
            <motion.div className="flex gap-[22px] overflow-x-auto px-4 [scrollbar-width:none] sm:px-6 lg:overflow-visible lg:px-[clamp(20px,5vw,40px)] [&::-webkit-scrollbar]:hidden" style={{ x: isDesktop ? trackX : 0, scrollSnapType: "x mandatory" }}>
              {lanes.map((l) => (
                <article key={l.n} className="w-[clamp(280px,74vw,440px)] flex-[0_0_auto] snap-start overflow-hidden rounded-[18px] border border-[#1F2A44]/10 bg-[#FAF7F1]">
                  <div className="relative h-[230px]">
                    <img src={l.img} alt={l.title} className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,25,41,0.1),rgba(20,25,41,0.5))]" />
                    <span className="absolute left-4 top-4 rounded-full bg-[rgba(15,19,33,0.6)] px-3 py-1.5 font-['Poppins'] text-[13px] font-bold text-[#C6A75E]">{l.n}</span>
                  </div>
                  <div className="p-7"><l.icon className="mb-4 h-7 w-7 text-[#C6A75E]" /><h3 className="font-['Poppins'] text-[22px] font-semibold text-[#1F2A44]">{l.title}</h3><p className="mt-3 text-[15px] leading-[1.6] text-[#1B1F2A]/[0.68]">{l.copy}</p></div>
                </article>
              ))}
              <article className="flex w-[clamp(280px,74vw,420px)] flex-[0_0_auto] snap-start flex-col justify-center rounded-[18px] bg-[#1F2A44] p-[38px] text-white">
                <p className="eyebrow mb-4">Don't see your lane?</p>
                <h3 className="font-['Poppins'] text-[26px] font-semibold leading-[1.18] text-white">We build role-specific workflows around how your business runs.</h3>
                <Button asChild className="btn-gold mt-[26px] self-start"><Link href="/contact">Tell us what you need</Link></Button>
              </article>
            </motion.div>
            <div className="container mt-9 hidden lg:block">
              <div className="h-[3px] overflow-hidden rounded-full bg-[#1F2A44]/10"><motion.span className="block h-full rounded-full bg-[#C6A75E]" style={{ width: lanesBar }} /></div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS (drawing timeline) ───────────────────────────────── */}
        <section className="section-padding section-deep relative overflow-hidden">
          <div className="absolute right-[-6%] top-[-10%] h-[40vw] max-h-[520px] w-[40vw] max-w-[520px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.16),transparent_66%)] blur-lg" aria-hidden="true" />
          <div className="container relative">
            <div className="mb-[clamp(44px,6vw,72px)] max-w-[620px]">
              <Reveal><p className="eyebrow mb-4">How it works</p></Reveal>
              <Reveal delay={0.08}><h2 className="text-4xl font-semibold leading-tight text-white md:text-5xl">A simple handoff, then steady execution.</h2></Reveal>
              <Reveal delay={0.16}><p className="mt-[18px] text-lg leading-[1.62] text-white/72">We match the right person, install the workflow, and keep performance visible — week after week.</p></Reveal>
            </div>
            <div className="relative" ref={tlRef}>
              <div className="absolute inset-x-0 top-[27px] hidden h-0.5 bg-white/12 md:block"><motion.span className="block h-full origin-left bg-[#C6A75E]" style={{ scaleX: tlScale }} /></div>
              <Stagger className="relative grid gap-7 md:grid-cols-3">
                {processSteps.map((s, i) => (
                  <StaggerChild key={s.step}>
                    <div className="relative z-[2] flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#C6A75E] bg-[#1F2A44] font-['Poppins'] text-[18px] font-bold text-[#C6A75E]">0{i + 1}</div>
                    <h3 className="mt-6 font-['Poppins'] text-[22px] font-semibold text-white">{s.step}</h3>
                    <p className="mt-2.5 max-w-[300px] text-[15px] leading-[1.6] text-white/70">{s.copy}</p>
                  </StaggerChild>
                ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* ── PROMISE / SOCIAL PROOF ────────────────────────────────────────── */}
        {testimonials.length > 0 ? (
          <section className="section-padding bg-[#FAF7F1]">
            <div className="container">
              <Reveal><h2 className="mb-10 text-4xl font-semibold">Trusted by operators who need the work handled.</h2></Reveal>
              <Stagger className="grid gap-6 md:grid-cols-3">
                {testimonials.map((t) => (
                  <StaggerChild key={t.id}>
                    <motion.article className="premium-card h-full p-7" whileHover={cardHover}>
                      <p className="leading-7 text-[#1B1F2A]/70">&ldquo;{t.content}&rdquo;</p>
                      <div className="mt-6 border-t border-[#1F2A44]/10 pt-5"><p className="font-bold text-[#1F2A44]">{t.name}</p><p className="text-sm text-[#1B1F2A]/58">{t.company}</p></div>
                    </motion.article>
                  </StaggerChild>
                ))}
              </Stagger>
            </div>
          </section>
        ) : (
          <section className="section-padding bg-[#FAF7F1]">
            <div className="container max-w-[1000px] text-center">
              <Reveal><span className="mx-auto mb-7 block h-px w-14 bg-[#C6A75E]" /></Reveal>
              <Reveal delay={0.08}>
                <p className="font-['Poppins'] text-[clamp(24px,3.6vw,44px)] font-medium leading-[1.32] tracking-[-0.01em] text-[#1F2A44] [text-wrap:balance]">
                  &ldquo;Vetted, dependable talent that gives owners their time back — and makes their operation run like a <span className="text-[#C6A75E]">larger company's</span>.&rdquo;
                </p>
              </Reveal>
              <Reveal delay={0.2}><p className="mt-7 text-[13px] font-bold uppercase tracking-[0.14em] text-[#1B1F2A]/50">The OutsourcEdge promise</p></Reveal>
            </div>
          </section>
        )}

        {/* ── CTA BAND ─────────────────────────────────────────────────────── */}
        <section className="bg-[#FAF7F1] px-4 pb-[clamp(72px,9vw,120px)] sm:px-6 lg:px-8">
          <div className="container">
            <Reveal>
              <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(120deg,#1F2A44,#2a3a5e)] p-[clamp(40px,6vw,72px)] text-white">
                <div className="absolute right-[-8%] top-[-30%] h-[34vw] max-h-[460px] w-[34vw] max-w-[460px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.28),transparent_66%)] blur-[10px]" aria-hidden="true" />
                <div className="relative grid items-center gap-9 md:grid-cols-[1.4fr_auto]">
                  <div>
                    <p className="eyebrow mb-4">Next step</p>
                    <h2 className="font-['Poppins'] text-[clamp(28px,4vw,46px)] font-semibold leading-[1.08] tracking-[-0.015em] text-white">Get the right support in place.</h2>
                    <p className="mt-4 max-w-[560px] text-[17px] leading-[1.6] text-white/74">Tell us what you need off your plate. We'll map the role, the tools, and your first-week operating rhythm — no pressure, no payroll.</p>
                  </div>
                  <Button asChild className="btn-gold text-base"><Link href="/contact">Book a Discovery Call</Link></Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
      <AiAssistant />
    </div>
  );
}
