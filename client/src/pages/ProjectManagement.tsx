import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import { Reveal, Stagger, StaggerChild } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  Check, ClipboardCheck, DollarSign,
  Home as HomeIcon, MessageSquare, Shield, Users, Wrench,
} from "lucide-react";
import { Link } from "wouter";
import {
  motion, useReducedMotion, useScroll, useTransform, useSpring,
  type Variants,
} from "framer-motion";
import { useRef } from "react";
import { SMOOTH_EASE } from "@/lib/animations";
import { useMagnetic } from "@/lib/motion3d";
import Seo from "@/components/Seo";

/* ────────────────────────────────────────────────────────────────────────────
   OutsourcEdge — Property Management (Phase-1 redesign)
   Brand: navy #1F2A44 + champagne gold #C6A75E, Poppins × Inter.
   Signature motion: a scroll-driven DRONE DESCENT hero — an aerial view "flies
   down" toward the property (zoom + crossfade) with a live drone HUD, while the
   headline reveals word-by-word and parallaxes away. Below the fold: a global
   scroll-progress bar, springy card-icon pops with staggered benefit chips,
   parallax photography + accent glows, and sliding operating-model steps.
   All honors prefers-reduced-motion. Mobile collapses the pin to normal flow.
   NOTE: aerial imagery uses Unsplash placeholders — swap /media/*.mp4 or
   licensed drone stills of real managed properties when available.
──────────────────────────────────────────────────────────────────────────── */

const services = [
  { icon: Users, title: "Tenant and Guest Coordination", description: "Inbox triage, move-in details, guest messages, renewal reminders, and day-to-day communication handled with calm follow-through.", benefits: ["Tenant inbox support", "Guest messaging", "Move-in / move-out", "Escalation notes"] },
  { icon: Wrench, title: "Maintenance Operations", description: "Requests are logged, prioritized, routed to vendors, and tracked until completion so owners are not chasing updates.", benefits: ["24/7 request intake", "Vendor coordination", "Work order tracking", "Photo / doc collection"] },
  { icon: ClipboardCheck, title: "Listing and Portfolio Admin", description: "Keep property records, listing details, rates, calendars, lease files, and owner reports organized across your tools.", benefits: ["Listing updates", "Calendar checks", "Lease file support", "Weekly owner summaries"] },
  { icon: DollarSign, title: "Rent and Payment Follow-Up", description: "Payment reminders, late-fee tracking, receipt logging, and clean reporting so cash-flow details do not disappear.", benefits: ["Rent reminders", "Arrears tracking", "Payment status reports", "Owner-ready summaries"] },
];

const operatingModel = [
  "Document your current workflow and approval thresholds.",
  "Match a trained property operations assistant to the role.",
  "Onboard into your PMS, email, task board, and communication rhythm.",
  "Run weekly reporting so performance stays visible.",
];

const trust = [
  { icon: Shield, title: "Trust-first handoff", copy: "Access, approvals, and escalation rules are documented before work begins." },
  { icon: MessageSquare, title: "Clear communication", copy: "Your assistant knows what to answer, what to route, and what needs owner approval." },
  { icon: HomeIcon, title: "Portfolio ready", copy: "Support works across single-family rentals, multi-unit properties, and STR operations." },
];

const HERO_WORDS_A = ["Your", "listings,", "expertly", "managed."];
const HERO_WORDS_B = ["Your", "time,", "given", "back."];

const heroStagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.066, delayChildren: 0.15 } } };
const wordItem: Variants = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SMOOTH_EASE } } };
const fadeItem: Variants = { hidden: { opacity: 0, y: 26 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: SMOOTH_EASE } } };
const cardChild: Variants = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: SMOOTH_EASE } } };
const popIcon: Variants = { hidden: { scale: 0.55, rotate: -14 }, visible: { scale: 1, rotate: 0, transition: { duration: 0.65, ease: [0.34, 1.56, 0.64, 1] } } };

const HUD_KEYFRAMES = `
@keyframes oe-cue { 0% { transform: translateY(0); opacity: 0; } 40% { opacity: 1; } 80% { transform: translateY(11px); opacity: 0; } 100% { opacity: 0; } }
@keyframes oe-blink { 0%,100% { opacity: 1; } 50% { opacity: .25; } }
@keyframes oe-scan { 0% { transform: translateY(-120%); } 100% { transform: translateY(360%); } }
@keyframes oe-floatY { 0%,100% { transform: translateY(-50%); } 50% { transform: translateY(calc(-50% - 10px)); } }
@media (prefers-reduced-motion: reduce) { .oe-cue, .oe-blink, .oe-scan, .oe-floatY { animation: none !important; } }`;

export default function ProjectManagement() {
  const reduce = useReducedMotion();

  // Page scroll progress (global bar)
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 });
  const progressW = useTransform(progress, [0, 1], ["0%", "100%"]);

  // Drone hero descent
  const droneRef = useRef<HTMLElement>(null);
  const { scrollYProgress: droneP } = useScroll({ target: droneRef, offset: ["start start", "end end"] });
  const farScale = useTransform(droneP, [0, 1], [reduce ? 1 : 1.5, 1]);
  const farY = useTransform(droneP, [0, 1], ["0%", reduce ? "0%" : "-4%"]);
  const nearOpacity = useTransform(droneP, [0.4, 1], [0, 1]);
  const nearScale = useTransform(droneP, [0.4, 1], [reduce ? 1 : 1.22, 1.04]);
  const heroContentY = useTransform(droneP, [0, 1], ["0%", reduce ? "0%" : "70%"]);
  const heroContentOpacity = useTransform(droneP, [0, 0.8], [1, reduce ? 1 : 0]);
  const cueOpacity = useTransform(droneP, [0, 0.25], [1, 0]);
  const altText = useTransform(droneP, (p) => `ALT ${Math.round(400 - p * 388)} ft`);
  const portfolioOpacity = useTransform(droneP, [0, 0.7], [1, reduce ? 1 : 0]);
  const portfolioBarW = useTransform(droneP, [0, 1], ["18%", "92%"]);

  // "Built for owners" image parallax
  const ownerImgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: ownerP } = useScroll({ target: ownerImgRef, offset: ["start end", "end start"] });
  const ownerImgY = useTransform(ownerP, [0, 1], reduce ? ["0%", "0%"] : ["-7%", "7%"]);

  const ctaRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(ctaRef);

  return (
    <>
      <Seo
        title="Property Management"
        description="Tenant coordination, maintenance follow-up, listing support & owner reporting from vetted offshore property teams."
        path="/project-management"
      />

      <div className="min-h-screen bg-[#FAF7F1]">
        <style dangerouslySetInnerHTML={{ __html: HUD_KEYFRAMES }} />

        {/* Scroll progress bar */}
        <motion.div className="fixed left-0 top-0 z-[65] h-[3px] bg-[linear-gradient(90deg,#C6A75E,#e3c987)] shadow-[0_0_12px_rgba(198,167,94,0.6)]" style={{ width: progressW }} aria-hidden="true" />

        <Header />

        {/* ── DRONE HERO ───────────────────────────────────────────────────── */}
        <section ref={droneRef} className="relative h-[180vh] bg-[#0F1321] md:h-[260vh]">
          <div className="sticky top-0 flex h-screen items-center overflow-hidden bg-[#0F1321]">
            {/* aerial layers */}
            <motion.div className="absolute inset-[-8%] bg-cover bg-center" style={{ scale: farScale, y: farY, backgroundImage: "url('https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=2400&q=80')" }} aria-hidden="true">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,19,33,0.42),rgba(15,19,33,0.62))]" />
            </motion.div>
            <motion.div className="absolute inset-[-8%] bg-cover bg-[center_60%]" style={{ opacity: nearOpacity, scale: nearScale, backgroundImage: "url('https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=2400&q=80')" }} aria-hidden="true">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,19,33,0.3),rgba(15,19,33,0.58))]" />
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(96deg,rgba(15,19,33,0.82)_0%,rgba(20,25,41,0.52)_52%,rgba(31,42,68,0.32)_100%)]" aria-hidden="true" />
            <div className="absolute inset-0 shadow-[inset_0_0_220px_60px_rgba(10,13,24,0.7)]" aria-hidden="true" />

            {/* drone HUD */}
            <div className="pointer-events-none absolute inset-0 z-[4] hidden sm:block" aria-hidden="true">
              <div className="absolute left-[clamp(20px,5vw,40px)] top-[104px] flex items-center gap-2.5 font-['Poppins'] text-[11px] font-semibold tracking-[0.14em] text-white/74">
                <span className="oe-blink h-2 w-2 rounded-full bg-[#C6A75E]" style={{ animation: reduce ? "none" : "oe-blink 1.4s infinite" }} />REC · AERIAL SURVEY
              </div>
              <motion.div className="absolute right-[clamp(20px,5vw,40px)] top-[104px] font-['Poppins'] text-[11px] font-semibold tracking-[0.1em] text-white/74">{altText}</motion.div>
              <div className="absolute left-1/2 top-1/2 h-[clamp(120px,16vw,200px)] w-[clamp(120px,16vw,200px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/[0.18]">
                <span className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#C6A75E]" />
                <span className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#C6A75E]" />
                <span className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#C6A75E]" />
                <span className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#C6A75E]" />
                <span className="absolute left-1/2 top-1/2 h-px w-[30px] -translate-x-1/2 -translate-y-1/2 bg-[#C6A75E]/70" />
                <span className="absolute left-1/2 top-1/2 h-[30px] w-px -translate-x-1/2 -translate-y-1/2 bg-[#C6A75E]/70" />
              </div>
              <div className="absolute inset-0 overflow-hidden opacity-50"><span className="oe-scan absolute inset-x-0 h-[34%] bg-[linear-gradient(180deg,transparent,rgba(198,167,94,0.07),transparent)]" style={{ animation: reduce ? "none" : "oe-scan 6s linear infinite" }} /></div>
            </div>

            {/* hero copy */}
            <motion.div className="container relative z-[5]" style={{ y: heroContentY, opacity: heroContentOpacity }}>
              <motion.div className="max-w-4xl" initial="hidden" animate="visible" variants={heroStagger}>
                <motion.div variants={fadeItem} className="mb-6 flex items-center gap-3.5">
                  <span className="h-px w-[46px] bg-[#C6A75E]" />
                  <span className="eyebrow">Property management support</span>
                </motion.div>
                <h1 className="font-['Poppins'] text-[clamp(36px,6.2vw,78px)] font-semibold leading-[1.03] tracking-[-0.02em] text-white [text-shadow:0_16px_42px_rgba(0,0,0,0.4)] [text-wrap:balance]">
                  {HERO_WORDS_A.map((w, i) => (<motion.span key={"a" + i} variants={wordItem} className="inline-block">{w}&nbsp;</motion.span>))}
                  <br />
                  {HERO_WORDS_B.map((w, i) => (<motion.span key={"b" + i} variants={wordItem} className="inline-block text-[#C6A75E]">{w}&nbsp;</motion.span>))}
                </h1>
                <motion.p variants={fadeItem} className="mt-7 max-w-[640px] text-[clamp(16px,2vw,21px)] font-medium leading-[1.6] text-white/[0.86]">
                  OutsourcEdge places vetted offshore talent with US realtors, landlords, and short-term-rental hosts — so your properties run like a larger company's, without the overhead of hiring in-house.
                </motion.p>
                <motion.div variants={fadeItem} className="mt-9 flex flex-col gap-4 sm:flex-row">
                  <Button asChild className="btn-gold text-base"><Link href="/contact">Build My Property Team</Link></Button>
                  <a href="#services" className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-white/25 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/[0.16]">See What We Handle</a>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* floating portfolio card */}
            <motion.div className="oe-floatY absolute right-[clamp(20px,5vw,56px)] top-1/2 z-[5] hidden w-[300px] -translate-y-1/2 rounded-[14px] border border-white/[0.16] bg-[#141929]/[0.42] p-[22px] shadow-[0_30px_70px_rgba(10,13,24,0.5)] backdrop-blur-md xl:block" style={{ opacity: portfolioOpacity, animation: reduce ? "none" : "oe-floatY 6.5s ease-in-out infinite" }} aria-hidden="true">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">Portfolio view</p>
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {[["18", "Listings"], ["7", "Requests"], ["4", "Owners"]].map(([n, l]) => (
                  <div key={l} className="rounded-[9px] border border-white/[0.12] bg-white/[0.06] px-1.5 py-3 text-center"><p className="font-['Poppins'] text-[19px] font-semibold text-white">{n}</p><p className="mt-[3px] text-[10.5px] font-semibold text-white/60">{l}</p></div>
                ))}
              </div>
              <div className="mt-4 h-[7px] overflow-hidden rounded-full bg-white/[0.12]"><motion.span className="block h-full rounded-full bg-[#C6A75E]" style={{ width: portfolioBarW }} /></div>
              <p className="mt-2.5 text-[11px] font-semibold text-white/[0.58]">Occupancy &amp; ops, handled daily</p>
            </motion.div>

            <motion.div className="absolute bottom-6 left-1/2 z-[5] flex -translate-x-1/2 flex-col items-center gap-2" style={{ opacity: cueOpacity }} aria-hidden="true">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">Descend</span>
              <div className="flex h-9 w-[22px] items-start justify-center rounded-[14px] border-[1.5px] border-white/40 p-[7px]"><span className="oe-cue h-[7px] w-[3.5px] rounded-full bg-[#C6A75E]" style={{ animation: reduce ? "none" : "oe-cue 1.7s ease-in-out infinite" }} /></div>
            </motion.div>
          </div>
        </section>

        {/* ── BUILT FOR OWNERS ─────────────────────────────────────────────── */}
        <section id="owners" className="section-padding bg-[#FAF7F1]">
          <div className="container grid items-center gap-8 md:gap-16 lg:grid-cols-[0.9fr_1.1fr]">
            <Stagger>
              <StaggerChild><p className="eyebrow mb-4">Built for owners</p></StaggerChild>
              <StaggerChild><h2 className="font-['Poppins'] text-[clamp(28px,4.2vw,50px)] font-semibold leading-[1.08] tracking-[-0.015em] text-[#1F2A44]">Less chasing. More visibility. Cleaner handoffs.</h2></StaggerChild>
              <StaggerChild><p className="mt-5 max-w-[520px] text-[clamp(15px,1.7vw,18px)] leading-[1.66] text-[#1B1F2A]/68">Property operations break down in the small tasks: unanswered messages, vendor follow-up, late documentation, and unclear ownership. We build the support layer around those details.</p></StaggerChild>
              <StaggerChild>
                <div className="mt-7 flex flex-wrap gap-2.5">
                  {["Single-family", "Multi-unit", "Short-term rental"].map((t) => (<span key={t} className="rounded-full border border-[#1F2A44]/10 bg-white px-4 py-2.5 text-[13px] font-semibold text-[#1F2A44]">{t}</span>))}
                </div>
              </StaggerChild>
            </Stagger>
            <Reveal delay={0.12}>
              <div ref={ownerImgRef} className="relative overflow-hidden rounded-[18px] border border-[#1F2A44]/[0.08] shadow-[0_40px_90px_rgba(31,42,68,0.2)]">
                <motion.img src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1500&q=82" alt="Modern residential property exterior" className="aspect-[4/3] w-full scale-[1.12] object-cover" style={{ y: ownerImgY }} />
                <div className="absolute bottom-5 left-5 flex items-center gap-2.5 rounded-full bg-[#141929]/55 px-4 py-2.5 backdrop-blur-md"><span className="oe-blink h-2 w-2 rounded-full bg-[#4ade80]" style={{ animation: reduce ? "none" : "oe-blink 1.6s infinite" }} /><span className="text-xs font-semibold text-white">Managed &amp; reported weekly</span></div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── WHAT WE HANDLE ───────────────────────────────────────────────── */}
        <section id="services" className="section-padding relative overflow-hidden bg-[#E8DCC8]">
          <div className="pointer-events-none absolute right-[-4%] top-[8%] h-[30vw] max-h-[420px] w-[30vw] max-w-[420px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.22),transparent_68%)] blur-[10px]" aria-hidden="true" />
          <div className="container relative">
            <div className="mb-12 max-w-[760px]">
              <Reveal><p className="eyebrow mb-4">What we handle</p></Reveal>
              <Reveal delay={0.08}><h2 className="font-['Poppins'] text-[clamp(30px,4.4vw,52px)] font-semibold leading-[1.08] tracking-[-0.015em] text-[#1F2A44]">Property services owners actually feel day to day.</h2></Reveal>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {services.map((service) => {
                const Icon = service.icon;
                return (
                  <motion.article key={service.title} className="premium-card p-7 md:p-9" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} transition={{ staggerChildren: 0.07 }} whileHover={{ y: -8, transition: { duration: 0.24 } }}>
                    <motion.div variants={popIcon} className="mb-6 flex h-[50px] w-[50px] items-center justify-center rounded-xl bg-[#1F2A44] text-[#C6A75E]"><Icon className="h-6 w-6" /></motion.div>
                    <motion.h3 variants={cardChild} className="font-['Poppins'] text-[22px] font-semibold tracking-[-0.01em] text-[#1F2A44]">{service.title}</motion.h3>
                    <motion.p variants={cardChild} className="mt-3 leading-[1.62] text-[#1B1F2A]/66">{service.description}</motion.p>
                    <div className="mt-[22px] grid grid-cols-2 gap-2.5">
                      {service.benefits.map((b) => (
                        <motion.span key={b} variants={cardChild} className="flex items-center gap-2.5 rounded-[9px] bg-[#FAF7F1] px-3 py-2.5 text-[13px] font-semibold text-[#1B1F2A]/72"><Check className="h-[15px] w-[15px] flex-shrink-0 text-[#C6A75E]" strokeWidth={2.4} />{b}</motion.span>
                      ))}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── OPERATING MODEL ──────────────────────────────────────────────── */}
        <section id="model" className="section-padding section-deep relative overflow-hidden">
          <div className="absolute right-[-6%] top-[-10%] h-[40vw] max-h-[520px] w-[40vw] max-w-[520px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.16),transparent_66%)] blur-lg" aria-hidden="true" />
          <div className="container relative grid items-center gap-9 md:gap-16 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <Reveal><p className="eyebrow mb-4">Operating model</p></Reveal>
              <Reveal delay={0.08}><h2 className="font-['Poppins'] text-[clamp(28px,4.2vw,50px)] font-semibold leading-[1.08] tracking-[-0.015em] text-white">Your standards stay in place. We add the capacity.</h2></Reveal>
              <Reveal delay={0.16}><p className="mt-5 max-w-[440px] leading-[1.66] text-white/70">The goal is not to hand your properties to a black box. It is to give you dependable support with clear rules, visible work, and simple escalation.</p></Reveal>
            </div>
            <div className="grid gap-3.5">
              {operatingModel.map((step, i) => (
                <motion.div key={step} className="flex items-start gap-5 rounded-[14px] border border-white/[0.12] bg-white/[0.06] px-6 py-[22px]" initial={{ opacity: 0, x: 28 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, delay: i * 0.08, ease: SMOOTH_EASE }} whileHover={{ x: -6, transition: { duration: 0.24 } }}>
                  <span className="flex-shrink-0 font-['Poppins'] text-xl font-bold text-[#C6A75E]">0{i + 1}</span>
                  <p className="pt-px leading-[1.6] text-white/[0.82]">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST TRIO ───────────────────────────────────────────────────── */}
        <section id="trust" className="section-padding bg-white">
          <Stagger className="container grid gap-[22px] md:grid-cols-3">
            {trust.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerChild key={item.title}>
                  <motion.article className="h-full rounded-2xl border border-[#1F2A44]/10 bg-[#FAF7F1] p-[34px] shadow-[0_18px_44px_rgba(31,42,68,0.06)]" whileHover={{ y: -6, transition: { duration: 0.24 } }}>
                    <div className="mb-[22px] flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F2A44] text-[#C6A75E]"><Icon className="h-[22px] w-[22px]" /></div>
                    <h3 className="font-['Poppins'] text-xl font-semibold text-[#1F2A44]">{item.title}</h3>
                    <p className="mt-3 leading-[1.62] text-[#1B1F2A]/66">{item.copy}</p>
                  </motion.article>
                </StaggerChild>
              );
            })}
          </Stagger>
        </section>

        {/* ── CTA BAND ─────────────────────────────────────────────────────── */}
        <section id="contact" className="bg-[#FAF7F1] px-4 pb-[clamp(72px,9vw,120px)] sm:px-6 lg:px-8">
          <div className="container">
            <Reveal>
              <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(120deg,#1F2A44,#2a3a5e)] p-[clamp(40px,6vw,72px)] text-white">
                <div className="absolute right-[-8%] top-[-30%] h-[34vw] max-h-[460px] w-[34vw] max-w-[460px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.28),transparent_66%)] blur-[10px]" aria-hidden="true" />
                <div className="relative grid items-center gap-9 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="eyebrow mb-4">Ready when you are</p>
                    <h2 className="font-['Poppins'] text-[clamp(28px,4vw,46px)] font-semibold leading-[1.08] tracking-[-0.015em] text-white">Hand off the work that keeps interrupting your day.</h2>
                    <p className="mt-4 max-w-[560px] leading-[1.6] text-white/74">We will help define the role, workflows, and first 30 days of property operations support.</p>
                  </div>
                  <Button asChild className="btn-gold text-base"><Link ref={ctaRef as any} href="/contact">Book a Discovery Call</Link></Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Footer />
        <AiAssistant />
      </div>
    </>
  );
}
