import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import { Reveal, Stagger, StaggerChild } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  ClipboardCheck,
  Headphones,
  Home as HomeIcon,
  MailCheck,
  Shield,
  Star,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { collection, doc, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SMOOTH_EASE } from "@/lib/animations";

interface PageContent {
  heroTitle: string;
  heroSubtitle: string;
  servicesTitle: string;
}

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface Testimonial {
  id: string;
  name: string;
  company: string;
  content: string;
  rating: number;
}

// Brand voice (Phase 1): property-led, results-focused, calm and concrete.
const DEFAULT_CONTENT: PageContent = {
  heroTitle: "Your listings, expertly managed. Your time, given back.",
  heroSubtitle:
    "OutsourcEdge places vetted offshore talent with US realtors, landlords, and short-term-rental hosts — so your listings, tenants, and back office run like a larger company's, without the payroll.",
  servicesTitle: "Support built around the work you'd rather hand off.",
};

// Trust bar. Per brand, only ONE stat carries gold — the one to remember.
const highlights = [
  { value: "5–7", label: "days to launch", emphasis: false },
  { value: "24/7", label: "coverage across time zones", emphasis: false },
  { value: "40–60%", label: "lower operating overhead", emphasis: true },
  { value: "1:1", label: "dedicated talent match", emphasis: false },
];

const servicesFallback = [
  {
    icon: Users,
    title: "Virtual Assistant Teams",
    description:
      "Inbox, calendar, CRM, research, and repeatable admin work handled by dependable offshore support.",
  },
  {
    icon: HomeIcon,
    title: "Property Management Support",
    description:
      "Tenant coordination, maintenance follow-up, listing support, and owner reporting for real estate operators.",
  },
  {
    icon: Headphones,
    title: "Customer & Client Support",
    description:
      "Professional response coverage, ticket triage, follow-ups, and escalation rules that protect your guest experience.",
  },
];

const valueProps = [
  { icon: Shield, title: "Vetted people", copy: "Talent selected for reliability, communication, role fit, and judgment under real operating pressure." },
  { icon: Users, title: "Built into your workflow", copy: "We operate inside your tools, channels, templates, and approval rules." },
  { icon: CheckCircle, title: "Visible delivery", copy: "Weekly reporting and clean task ownership keep work from disappearing." },
];

const processSteps = [
  { step: "Match", copy: "We define the role and pair you with vetted talent built for it." },
  { step: "Onboard", copy: "Your new teammate installs into your tools, templates, and rhythm." },
  { step: "Results", copy: "Weekly reporting and clean ownership keep the work visible." },
];

const outsourcingLanes = [
  {
    icon: MailCheck,
    title: "Admin execution",
    copy: "Email, calendars, CRM updates, task follow-up, research, and documentation handled with a clean daily rhythm.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=82",
  },
  {
    icon: BarChart3,
    title: "Operations support",
    copy: "Process tracking, reports, SOPs, QA checklists, and recurring work kept visible for managers.",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=82",
  },
  {
    icon: ClipboardCheck,
    title: "Specialized service lanes",
    copy: "Property management, client support, and role-specific workflows built around how your business runs.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82",
  },
];

// Hero entrance (on load, not scroll-triggered).
const heroStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const heroItem: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SMOOTH_EASE } },
};

const cardHover = { y: -6, transition: { duration: 0.25, ease: SMOOTH_EASE } };

export default function Home() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // ── Hero parallax: media drifts slower than scroll, content gently lifts and
  //    fades. Disabled under prefers-reduced-motion. Transform/opacity only. ──
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const mediaY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "16%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "10%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.2]);

  useEffect(() => {
    if (!db) return;

    const unsubContent = onSnapshot(doc(db, "site_content", "main"), (docSnap) => {
      if (docSnap.exists()) setContent({ ...DEFAULT_CONTENT, ...(docSnap.data() as PageContent) });
    });

    const servicesQuery = query(collection(db, "services"), orderBy("order", "asc"), limit(3));
    const unsubServices = onSnapshot(servicesQuery, (snapshot) => {
      setServices(snapshot.docs.map((serviceDoc) => ({ id: serviceDoc.id, ...serviceDoc.data() } as Service)));
    });

    const testimonialsQuery = query(collection(db, "testimonials"), limit(3));
    const unsubTestimonials = onSnapshot(testimonialsQuery, (snapshot) => {
      setTestimonials(snapshot.docs.map((testimonialDoc) => ({ id: testimonialDoc.id, ...testimonialDoc.data() } as Testimonial)));
    });

    return () => {
      unsubContent();
      unsubServices();
      unsubTestimonials();
    };
  }, []);

  const visibleServices =
    services.length > 0
      ? services
      : servicesFallback.map((service, index) => ({
          id: String(index),
          title: service.title,
          description: service.description,
          icon: "",
        }));

  return (
    <div className="min-h-screen bg-[#FAF7F1]">
      <Header />

      <main>
        {/* ── Hero ──────────────────────────────────────────────────────────────
            Brand: navy overlay 55–65% over a muted loop of people at laptops,
            left-aligned Poppins headline, thin gold rule, one gold + one ghost CTA.
            Drop /brand/hero-loop.mp4 in to enable the video; the image is the
            poster/fallback until then. */}
        <section
          ref={heroRef}
          className="relative flex min-h-[88vh] items-center overflow-hidden bg-[#1F2A44] pt-32 text-white md:pt-40"
        >
          <motion.div className="absolute inset-0" style={{ y: mediaY }} aria-hidden="true">
            <video
              className="drone-sweep h-[116%] w-full object-cover opacity-40 [filter:grayscale(0.25)_contrast(1.02)]"
              poster="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2200&q=82"
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="/brand/hero-loop.mp4" type="video/mp4" />
            </video>
          </motion.div>
          {/* Navy overlay (~62%) keeps the headline winning. */}
          <div
            className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,25,41,0.92)_0%,rgba(31,42,68,0.74)_55%,rgba(31,42,68,0.55)_100%)]"
            aria-hidden="true"
          />

          <motion.div className="container relative z-10 pb-16" style={{ y: contentY, opacity: contentOpacity }}>
            <motion.div className="max-w-3xl" initial="hidden" animate="visible" variants={heroStagger}>
              <motion.div variants={heroItem} className="mb-6 h-px w-24 origin-left bg-[#C6A75E]" />
              <motion.p variants={heroItem} className="eyebrow mb-5">
                Offshore talent. On-shore standards.
              </motion.p>
              <motion.h1
                variants={heroItem}
                className="text-4xl font-semibold leading-[1.08] text-white drop-shadow-[0_14px_38px_rgba(0,0,0,0.38)] sm:text-5xl md:text-6xl"
              >
                {content.heroTitle}
              </motion.h1>
              <motion.p
                variants={heroItem}
                className="mt-7 max-w-2xl text-lg font-medium leading-8 text-white/88 md:text-xl"
              >
                {content.heroSubtitle}
              </motion.p>
              <motion.div variants={heroItem} className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Button asChild className="btn-gold text-base">
                  <Link href="/contact">Book a Discovery Call</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="border border-white/25 bg-white/10 px-6 py-3.5 text-base font-bold text-white hover:bg-white/18"
                >
                  <Link href="/services">Explore Services</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Scroll cue */}
          {!reduce && (
            <motion.div
              className="pointer-events-none absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 md:block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              aria-hidden="true"
            >
              <div className="flex h-9 w-5 items-start justify-center rounded-full border border-white/35 p-1.5">
                <motion.span
                  className="h-1.5 w-1 rounded-full bg-[#C6A75E]"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}
        </section>

        {/* ── Trust bar ─────────────────────────────────────────────────────────── */}
        <section className="border-b border-[#1F2A44]/10 bg-white">
          <Stagger className="container grid grid-cols-2 gap-px md:grid-cols-4" gap={0.07}>
            {highlights.map((stat) => (
              <StaggerChild key={stat.label} distance={18}>
                <div className="py-8 text-center">
                  <p
                    className={`font-['Poppins'] text-3xl font-bold md:text-4xl ${
                      stat.emphasis ? "text-[#C6A75E]" : "text-[#1F2A44]"
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#1B1F2A]/62">{stat.label}</p>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </section>

        {/* ── Why owners delegate ───────────────────────────────────────────────── */}
        <section className="section-padding bg-[#FAF7F1]">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <Reveal>
                <p className="eyebrow mb-4">Why owners delegate to us</p>
                <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
                  Reliable people for the work that slows you down.
                </h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="text-lg leading-8 text-[#1B1F2A]/68">
                  The brand has one job: feel trustworthy enough to hand important work to. That means clear ownership, documented workflows, responsive communication, and talent that fits how you already operate.
                </p>
              </Reveal>
            </div>

            <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
              {valueProps.map((item) => (
                <StaggerChild key={item.title}>
                  <motion.article className="premium-card h-full p-7" whileHover={cardHover}>
                    <item.icon className="mb-6 h-7 w-7 text-[#C6A75E]" />
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 leading-7 text-[#1B1F2A]/66">{item.copy}</p>
                  </motion.article>
                </StaggerChild>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── Services (Sand block for rhythm) ──────────────────────────────────── */}
        <section className="section-padding bg-[#E8DCC8]/52">
          <div className="container">
            <Reveal className="mb-12 max-w-3xl">
              <p className="eyebrow mb-4">Services</p>
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">{content.servicesTitle}</h2>
            </Reveal>
            <Stagger className="grid gap-6 md:grid-cols-3">
              {visibleServices.map((service, index) => {
                const FallbackIcon = servicesFallback[index]?.icon ?? HomeIcon;
                return (
                  <StaggerChild key={service.id}>
                    <motion.article className="premium-card h-full p-7" whileHover={cardHover}>
                      <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1F2A44] text-[#C6A75E]">
                        <FallbackIcon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                      <p className="mt-3 leading-7 text-[#1B1F2A]/66">{service.description}</p>
                      <Link
                        href={service.title.toLowerCase().includes("property") ? "/project-management" : "/services"}
                        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1F2A44] transition-all hover:gap-3"
                      >
                        Learn more <ArrowRight className="h-4 w-4" />
                      </Link>
                    </motion.article>
                  </StaggerChild>
                );
              })}
            </Stagger>
          </div>
        </section>

        {/* ── Where we plug in ──────────────────────────────────────────────────── */}
        <section className="section-padding bg-white">
          <div className="container">
            <Reveal className="mb-12 max-w-3xl">
              <p className="eyebrow mb-4">Where we plug in</p>
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
                Support lanes that match the work.
              </h2>
            </Reveal>
            <Stagger className="grid gap-6 lg:grid-cols-3">
              {outsourcingLanes.map((lane) => (
                <StaggerChild key={lane.title}>
                  <motion.article
                    className="group h-full overflow-hidden rounded-lg border border-[#1F2A44]/12 bg-[#FAF7F1]"
                    whileHover={cardHover}
                  >
                    <div
                      className="h-56 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                      style={{ backgroundImage: `url('${lane.image}')` }}
                      aria-hidden="true"
                    />
                    <div className="p-7">
                      <lane.icon className="mb-5 h-7 w-7 text-[#C6A75E]" />
                      <h3 className="text-xl font-semibold text-[#1F2A44]">{lane.title}</h3>
                      <p className="mt-3 leading-7 text-[#1B1F2A]/68">{lane.copy}</p>
                    </div>
                  </motion.article>
                </StaggerChild>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── How it works (navy moment) ────────────────────────────────────────── */}
        <section className="section-padding section-deep">
          <div className="container grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <Reveal>
              <p className="eyebrow mb-4">How it works</p>
              <h2 className="text-4xl font-semibold leading-tight text-white md:text-5xl">A simple handoff, then steady execution.</h2>
              <p className="mt-6 max-w-xl leading-8 text-white/72">
                We match the right person, install the workflow, and keep performance visible — week after week.
              </p>
            </Reveal>
            <Stagger className="grid gap-4 sm:grid-cols-3">
              {processSteps.map((item, index) => (
                <StaggerChild key={item.step}>
                  <motion.div className="h-full rounded-lg border border-white/12 bg-white/[0.06] p-6" whileHover={cardHover}>
                    <p className="mb-4 text-sm font-bold text-[#C6A75E]">0{index + 1}</p>
                    <h3 className="text-lg font-semibold text-white">{item.step}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/72">{item.copy}</p>
                  </motion.div>
                </StaggerChild>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── Social proof ──────────────────────────────────────────────────────── */}
        {testimonials.length > 0 && (
          <section className="section-padding bg-[#FAF7F1]">
            <div className="container">
              <Reveal>
                <h2 className="mb-10 text-4xl font-semibold">Trusted by operators who need the work handled.</h2>
              </Reveal>
              <Stagger className="grid gap-6 md:grid-cols-3">
                {testimonials.map((testimonial) => (
                  <StaggerChild key={testimonial.id}>
                    <motion.article className="premium-card h-full p-7" whileHover={cardHover}>
                      <div className="mb-5 flex gap-1">
                        {[...Array(testimonial.rating)].map((_, index) => (
                          <Star key={index} className="h-4 w-4 fill-[#C6A75E] text-[#C6A75E]" />
                        ))}
                      </div>
                      <p className="leading-7 text-[#1B1F2A]/70">&quot;{testimonial.content}&quot;</p>
                      <div className="mt-6 border-t border-[#1F2A44]/10 pt-5">
                        <p className="font-bold text-[#1F2A44]">{testimonial.name}</p>
                        <p className="text-sm text-[#1B1F2A]/58">{testimonial.company}</p>
                      </div>
                    </motion.article>
                  </StaggerChild>
                ))}
              </Stagger>
            </div>
          </section>
        )}

        {/* ── CTA band ──────────────────────────────────────────────────────────── */}
        <section className="bg-white py-18 md:py-24">
          <div className="container">
            <Reveal>
              <div className="rounded-lg bg-[#1F2A44] p-8 text-white md:p-12">
                <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <p className="eyebrow mb-4">Next step</p>
                    <h2 className="text-3xl font-semibold text-white md:text-4xl">Get the right support in place.</h2>
                    <p className="mt-4 max-w-2xl leading-7 text-white/72">
                      Tell us what you need off your plate. We'll map the role, tools, and first-week operating rhythm.
                    </p>
                  </div>
                  <Button asChild className="btn-gold">
                    <Link href="/contact">Book a Discovery Call</Link>
                  </Button>
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
