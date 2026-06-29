import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowDown, CalendarDays, Building2, Phone, UserPlus, BarChart3,
} from "lucide-react";
import { Link } from "wouter";
import {
  motion, useReducedMotion, useScroll, useTransform,
  type Variants,
} from "framer-motion";
import { useRef } from "react";
import { SMOOTH_EASE } from "@/lib/animations";
import { useMagnetic } from "@/lib/motion3d";
import Seo from "@/components/Seo";

/* ────────────────────────────────────────────────────────────────────────────
   OutsourcEdge — Services (Phase-1 redesign)
   Brand: navy #1F2A44 + champagne gold #C6A75E, Poppins × Inter, page bg #FAF7F1.
   Covers all five services as alternating editorial rows with content-aligned
   photography. Signature motion: word-by-word hero reveal, a NAVY WIPE image
   reveal per row, gentle scroll parallax on each photo, staggered benefit chips,
   and a gold scroll-progress bar across the list. Honors prefers-reduced-motion.
   Imagery is Unsplash placeholder — swap for licensed brand photography later.
──────────────────────────────────────────────────────────────────────────── */

type Service = {
  num: string;
  icon: typeof CalendarDays;
  title: string;
  description: string;
  chips: string[];
  image: string;
  alt: string;
  reverse?: boolean;
  link?: { href: string; label: string };
};

const services: Service[] = [
  {
    num: "01",
    icon: CalendarDays,
    title: "Virtual Assistant Support",
    description:
      "Admin, inbox, calendar and daily tasks — handled by a dependable teammate who learns your rhythm and protects your time.",
    chips: [
      "Email & calendar management",
      "Data entry & CRM upkeep",
      "Travel & scheduling",
      "Document prep & follow-ups",
    ],
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    alt: "Virtual assistant managing inbox, calendar and CRM at a desk",
  },
  {
    num: "02",
    icon: Building2,
    title: "Property Management Support",
    description:
      "Listings, guests and bookings managed end-to-end — tenant coordination through maintenance, kept visible and on-brand.",
    chips: [
      "Guest communication",
      "Listing & calendar sync",
      "Booking handling",
      "Maintenance & cleaning coordination",
    ],
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    alt: "A managed rental property interior",
    reverse: true,
    link: { href: "/project-management", label: "See the dedicated page" },
  },
  {
    num: "03",
    icon: Phone,
    title: "Real Estate Cold Calling & ISA",
    description:
      "Inside sales agents who book qualified appointments for you — consistent outreach that keeps your pipeline full and your calendar moving.",
    chips: [
      "Lead outreach & follow-up",
      "Appointment setting",
      "Lead qualification",
      "CRM logging & pipeline updates",
    ],
    image:
      "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=1200&q=80",
    alt: "City real estate skyline",
  },
  {
    num: "04",
    icon: UserPlus,
    title: "Talent Acquisition & Placement",
    description:
      "We source, vet and place the exact role you're missing — judgment, fit and reliability first, so onboarding feels like gaining a teammate.",
    chips: [
      "Role scoping",
      "Sourcing & screening",
      "Skills & communication vetting",
      "Onboarding support",
    ],
    image:
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
    alt: "Interview and placement conversation",
    reverse: true,
  },
  {
    num: "05",
    icon: BarChart3,
    title: "Back-Office & Admin",
    description:
      "Quiet, reliable support that keeps operations moving — the reporting, books and documentation that make a small team run like a larger one.",
    chips: [
      "Reporting & dashboards",
      "Invoicing & bookkeeping support",
      "Process documentation",
      "General admin",
    ],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    alt: "Reporting dashboards and bookkeeping",
  },
];

const HERO_WORDS_A = ["One", "partner."];
const HERO_WORDS_B = ["Every", "role", "your", "operation", "needs."];

const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.12 } },
};
const wordItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SMOOTH_EASE } },
};
const fadeItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: SMOOTH_EASE } },
};
const chipStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.18 } },
};
const chipItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: SMOOTH_EASE } },
};

/* One row — owns its own scroll-linked parallax so hooks stay top-level. */
function ServiceRow({ service }: { service: Service }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // gentle, medium-paced parallax
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);
  const Icon = service.icon;

  const media = (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.8, ease: SMOOTH_EASE }}
      className="relative overflow-hidden rounded-[20px] border border-[#1F2A44]/[0.07] shadow-[0_34px_78px_rgba(31,42,68,0.18)]"
      style={{ aspectRatio: "5 / 4", order: service.reverse ? 1 : 0 }}
    >
      <motion.div className="absolute inset-x-0 -inset-y-[12%] will-change-transform" style={{ y }}>
        <img src={service.image} alt={service.alt} className="h-full w-full object-cover" />
      </motion.div>
      {/* navy wipe reveal */}
      <motion.span
        aria-hidden
        initial={reduce ? { scaleX: 0 } : { scaleX: 1 }}
        whileInView={{ scaleX: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1, ease: [0.7, 0, 0.2, 1] }}
        className="absolute inset-0 bg-[#1F2A44]"
        style={{ transformOrigin: service.reverse ? "left" : "right" }}
      />
      <span
        className="absolute top-[18px] z-[2] rounded-full bg-[rgba(15,19,33,0.62)] px-[13px] py-[7px] font-[Poppins] text-[13px] font-bold text-[#C6A75E] backdrop-blur-sm"
        style={{ [service.reverse ? "right" : "left"]: "18px" } as React.CSSProperties}
      >
        {service.num}
      </span>
    </motion.div>
  );

  const copy = (
    <div style={{ order: service.reverse ? 2 : 1 }}>
      <Reveal>
        <div className="mb-[18px] flex items-center gap-[13px]">
          <span className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[12px] bg-[#1F2A44] text-[#C6A75E]">
            <Icon size={22} strokeWidth={1.8} />
          </span>
          <span className="font-[Poppins] text-[13px] font-bold uppercase tracking-[0.14em] text-[#1B1F2A]/50">
            Service {service.num}
          </span>
        </div>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 className="font-[Poppins] text-[clamp(24px,3.2vw,38px)] font-semibold leading-[1.12] tracking-[-0.015em] text-[#1F2A44]">
          {service.title}
        </h2>
      </Reveal>
      <Reveal delay={0.12}>
        <span className="mt-[18px] block h-[2px] w-[64px] origin-left bg-[#C6A75E]" />
      </Reveal>
      <Reveal delay={0.16}>
        <p className="mt-[18px] max-w-[440px] text-[clamp(15px,1.7vw,18px)] leading-[1.64] text-[#1B1F2A]/[0.66]">
          {service.description}
        </p>
      </Reveal>
      {service.link && (
        <Reveal delay={0.2}>
          <Link
            href={service.link.href}
            className="group mt-4 inline-flex items-center gap-[7px] text-[14px] font-bold text-[#1F2A44] transition-[gap] hover:gap-3"
          >
            {service.link.label}
            <ArrowRight size={15} strokeWidth={2.6} className="text-[#C6A75E]" />
          </Link>
        </Reveal>
      )}
      <motion.div
        variants={chipStagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="mt-[26px] flex flex-wrap gap-[10px]"
      >
        {service.chips.map((chip) => (
          <motion.span
            key={chip}
            variants={chipItem}
            className="inline-flex items-center gap-[8px] rounded-full border border-[#1F2A44]/10 bg-white px-[14px] py-[9px] text-[13.5px] font-semibold text-[#1F2A44]"
          >
            <span className="h-[6px] w-[6px] rounded-full bg-[#C6A75E]" />
            {chip}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );

  return (
    <article
      ref={ref}
      className="grid items-center gap-[clamp(30px,5vw,76px)] md:grid-cols-2"
    >
      {service.reverse ? (
        <>
          {copy}
          {media}
        </>
      ) : (
        <>
          {media}
          {copy}
        </>
      )}
    </article>
  );
}

export default function Services() {
  const reduce = useReducedMotion();

  // gold scroll-progress bar across the services list
  const listRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start start", "end end"],
  });
  const progressWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const ctaRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(ctaRef);

  return (
    <div className="relative bg-[#FAF7F1] text-[#1B1F2A]">
      <Seo
        title="Services"
        description="Virtual assistant teams, property-management support, and customer/client support — built around the work you'd rather hand off."
        path="/services"
      />
      <Header />

      {/* ── HERO ── */}
      <section
        id="services-top"
        className="relative overflow-hidden px-[clamp(20px,5vw,40px)] pb-[clamp(40px,6vw,72px)] pt-[clamp(118px,15vh,176px)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-[8%] -top-[6%] h-[40vw] max-h-[540px] w-[40vw] max-w-[540px] rounded-full blur-[8px]"
          style={{ background: "radial-gradient(circle,rgba(198,167,94,.14),transparent 66%)" }}
        />
        <div className="relative mx-auto max-w-[1240px]">
          <Reveal>
            <div className="mb-6 flex items-center gap-[14px]">
              <span className="block h-px w-[46px] bg-[#C6A75E]" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#C6A75E]">
                What we do
              </span>
            </div>
          </Reveal>
          <motion.h1
            variants={heroStagger}
            initial="hidden"
            animate="visible"
            className="max-w-[14ch] text-balance font-[Poppins] text-[clamp(38px,6.6vw,82px)] font-semibold leading-[1.03] tracking-[-0.02em] text-[#1F2A44]"
          >
            {HERO_WORDS_A.map((w) => (
              <motion.span key={w} variants={wordItem} className="inline-block">
                {w}&nbsp;
              </motion.span>
            ))}
            <br />
            {HERO_WORDS_B.map((w) => (
              <motion.span key={w} variants={wordItem} className="inline-block text-[#C6A75E]">
                {w}&nbsp;
              </motion.span>
            ))}
          </motion.h1>
          <div className="mt-[30px] grid items-end gap-8 md:grid-cols-[1.2fr_auto]">
            <motion.p
              variants={fadeItem}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.16 }}
              className="max-w-[540px] text-[clamp(16px,2vw,20px)] leading-[1.64] text-[#1B1F2A]/70"
            >
              Whether you need one task off your plate or a full back-office team, we place
              vetted talent matched to your workflow. Mix and match the services below.
            </motion.p>
            <motion.a
              variants={fadeItem}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.24 }}
              href="#svc-1"
              className="inline-flex items-center gap-[9px] whitespace-nowrap rounded-full border border-[#1F2A44]/20 px-5 py-[13px] text-[14px] font-bold text-[#1F2A44] transition-colors hover:border-[#1F2A44]/40 hover:bg-[#1F2A44]/5"
            >
              See all five <ArrowDown size={16} strokeWidth={2.4} />
            </motion.a>
          </div>
        </div>
      </section>

      {/* ── SERVICES LIST ── */}
      <section
        ref={listRef}
        id="svc-list"
        className="relative px-[clamp(20px,5vw,40px)] pb-[clamp(60px,8vw,110px)] pt-[clamp(20px,4vw,48px)]"
      >
        {/* gold scroll-progress hairline */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px]">
          <motion.span className="block h-full bg-[#C6A75E]" style={{ width: progressWidth }} />
        </div>
        <div className="mx-auto flex max-w-[1180px] flex-col gap-[clamp(64px,9vw,140px)]">
          {services.map((s) => (
            <div key={s.num} id={`svc-${Number(s.num)}`}>
              <ServiceRow service={s} />
            </div>
          ))}
        </div>
      </section>

      {/* ── MIX & MATCH ── */}
      <section className="bg-[#E8DCC8] px-[clamp(20px,5vw,40px)] py-[clamp(56px,7vw,96px)]">
        <div className="mx-auto max-w-[1000px] text-center">
          <Reveal>
            <p className="mb-[18px] text-xs font-bold uppercase tracking-[0.16em] text-[#9a7d3f]">
              Mix &amp; match
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="text-balance font-[Poppins] text-[clamp(26px,3.8vw,46px)] font-semibold leading-[1.14] tracking-[-0.015em] text-[#1F2A44]">
              Start with one role. Scale to a full back-office team.
            </h2>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mx-auto mt-[18px] max-w-[620px] text-[clamp(15px,1.8vw,18px)] leading-[1.64] text-[#1B1F2A]/[0.66]">
              Every engagement is built around how your business actually runs — your tools,
              your channels, your approval rules. Add lanes as you grow.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section id="contact" className="bg-[#FAF7F1] px-[clamp(20px,5vw,40px)] py-[clamp(72px,9vw,120px)]">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(120deg,#1F2A44,#2a3a5e)] p-[clamp(40px,6vw,72px)] text-white">
              <div
                aria-hidden
                className="absolute -right-[8%] -top-[30%] h-[34vw] max-h-[460px] w-[34vw] max-w-[460px] rounded-full blur-[10px]"
                style={{ background: "radial-gradient(circle,rgba(198,167,94,.28),transparent 66%)" }}
              />
              <div className="relative grid items-center gap-9 md:grid-cols-[1.4fr_auto]">
                <div>
                  <p className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#C6A75E]">
                    Next step
                  </p>
                  <h2 className="font-[Poppins] text-[clamp(28px,4vw,46px)] font-semibold leading-[1.08] tracking-[-0.015em] text-white">
                    Tell us which role to take off your plate.
                  </h2>
                  <p className="mt-4 max-w-[560px] text-[17px] leading-[1.6] text-white/[0.74]">
                    We'll map the role, the tools, and your first-week operating rhythm — no
                    pressure, no payroll.
                  </p>
                </div>
                <Button asChild className="btn-gold">
                  <Link ref={ctaRef as any} href="/contact" className="inline-flex items-center gap-[9px]">
                    Book a Discovery Call <ArrowRight size={17} strokeWidth={2.4} />
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
