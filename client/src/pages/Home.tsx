import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  ClipboardCheck,
  FileText,
  Headphones,
  Home as HomeIcon,
  MailCheck,
  Shield,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { collection, doc, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

const DEFAULT_CONTENT: PageContent = {
  heroTitle: "Outsourcing that gives your business an operational edge.",
  heroSubtitle: "OutsourcEdge connects growing teams with vetted offshore talent for admin, operations, customer support, and property management work without adding in-house overhead.",
  servicesTitle: "Outsourcing support built around the work your team needs off its plate",
};

const highlights = [
  { value: "5-7", label: "days to launch" },
  { value: "24/7", label: "global coverage" },
  { value: "40-60%", label: "lower ops overhead" },
  { value: "1:1", label: "dedicated talent" },
];

const servicesFallback = [
  {
    icon: Users,
    title: "Virtual Assistant Teams",
    description: "Inbox, calendar, CRM, research, documentation, and repeatable admin work handled by dependable offshore support.",
  },
  {
    icon: Headphones,
    title: "Customer & Client Support",
    description: "Professional response coverage, ticket triage, follow-ups, and escalation rules that protect your customer experience.",
  },
  {
    icon: HomeIcon,
    title: "Property Management Support",
    description: "Tenant coordination, maintenance follow-up, listing support, and owner reporting for real estate operators.",
  },
];

const processSteps = [
  "Define the role",
  "Match vetted talent",
  "Onboard into your tools",
  "Report results weekly",
];

const outsourcingLanes = [
  {
    icon: MailCheck,
    title: "Admin execution",
    copy: "Email, calendars, CRM updates, task follow-up, research, and documentation handled with clean daily rhythm.",
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
    copy: "Property management, client support, back-office coordination, and role-specific workflows built around your business.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=82",
  },
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};

const smoothViewport = { once: true, amount: 0.28, margin: "0px 0px -80px 0px" };

export default function Home() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

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

  const visibleServices = services.length > 0 ? services : servicesFallback.map((service, index) => ({
    id: String(index),
    title: service.title,
    description: service.description,
    icon: "",
  }));

  return (
    <div className="min-h-screen bg-[#FAF7F1]">
      <Header />

      <section className="relative min-h-[92vh] overflow-hidden bg-[#1F2A44] pt-32 text-white md:pt-40">
        <div
          className="drone-sweep absolute inset-0 bg-cover bg-center opacity-[0.38]"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2200&q=82')",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,25,41,0.97)_0%,rgba(31,42,68,0.88)_48%,rgba(31,42,68,0.60)_100%)]" aria-hidden="true" />
        <motion.div
          className="absolute left-[7%] top-28 hidden h-20 w-20 rounded-lg border border-white/12 bg-white/8 backdrop-blur-md lg:block"
          initial={{ opacity: 0, y: -18, rotate: -4 }}
          animate={{ opacity: 1, y: [0, -10, 0], rotate: [-4, 2, -4] }}
          transition={{ opacity: { duration: 0.7, delay: 0.7 }, y: { duration: 5.6, repeat: Infinity, ease: "easeInOut" }, rotate: { duration: 5.6, repeat: Infinity, ease: "easeInOut" } }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-10 right-[8%] hidden w-72 rounded-lg border border-white/14 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-md lg:block"
          initial={{ opacity: 0, x: 42, y: 18 }}
          animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
          transition={{ opacity: { duration: 0.85, delay: 0.55, ease: [0.16, 1, 0.3, 1] }, x: { duration: 0.85, delay: 0.55, ease: [0.16, 1, 0.3, 1] }, y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
          aria-hidden="true"
        >
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#C6A75E] text-[#1F2A44]">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-white">Dedicated talent</p>
              <p className="text-xs text-white/68">Matched to your workflow</p>
            </div>
          </div>
          <div className="space-y-3 text-sm text-white/78">
            <div className="flex items-center justify-between border-t border-white/12 pt-3">
              <span>Admin backlog</span><span className="font-bold text-[#F4D98B]">Handled</span>
            </div>
            <div className="flex items-center justify-between border-t border-white/12 pt-3">
              <span>Client follow-up</span><span className="font-bold text-[#F4D98B]">Daily</span>
            </div>
          </div>
        </motion.div>
        <div className="container relative z-10 flex min-h-[calc(92vh-8rem)] items-center pb-16">
          <motion.div className="max-w-4xl" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6 h-px w-24 bg-[#C6A75E]" />
            <motion.p variants={fadeUp} className="eyebrow mb-5">
              Offshore talent. Onshore standards.
            </motion.p>
            <motion.p variants={fadeUp} className="mb-4 font-['Poppins'] text-2xl font-semibold leading-tight text-white md:text-4xl">
              <span className="hero-word-pop">Your Growth Team, Ready Now</span>
            </motion.p>
            <motion.h1
              variants={fadeUp}
              className="max-w-4xl text-5xl font-bold leading-[1.05] text-white drop-shadow-[0_16px_42px_rgba(0,0,0,0.40)] md:text-7xl"
            >
              {content.heroTitle}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-lg font-medium leading-8 text-white/86 md:text-xl">
              {content.heroSubtitle}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/contact">
                <Button className="btn-gold hero-shine text-base">Book a Discovery Call</Button>
              </Link>
              <Link href="/services">
                <Button variant="ghost" className="border border-white/25 bg-white/10 px-6 py-3.5 text-base font-bold text-white shadow-[0_12px_28px_rgba(0,0,0,0.16)] hover:bg-white/18">
                  Explore Services
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-b border-[#1F2A44]/10 bg-white">
        <div className="container grid grid-cols-2 gap-px md:grid-cols-4">
          {highlights.map((stat) => (
            <div key={stat.label} className="py-8 text-center">
              <p className="stat-value text-3xl md:text-4xl">{stat.value}</p>
              <p className="mt-2 text-sm font-semibold text-[#1B1F2A]/62">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-padding bg-[#FAF7F1]">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <motion.div initial="hidden" whileInView="visible" viewport={smoothViewport} variants={stagger}>
              <motion.p variants={fadeUp} className="eyebrow mb-4">Why teams outsource to us</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-semibold leading-tight md:text-5xl">
                Reliable people for the work that slows your team down.
              </motion.h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={smoothViewport}
              transition={{ duration: 0.68, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg leading-8 text-[#1B1F2A]/68"
            >
              The brand should feel trustworthy enough to hand important work to. That means clear ownership, documented workflows, responsive communication, and talent that fits how you already operate.
            </motion.p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Shield, title: "Vetted people", copy: "Talent selected for reliability, communication, role fit, and judgment under real operating pressure." },
              { icon: Users, title: "Built into your workflow", copy: "We operate inside your tools, channels, templates, and approval rules." },
              { icon: CheckCircle, title: "Visible delivery", copy: "Weekly reporting and clean task ownership keep work from disappearing." },
            ].map((item, index) => (
              <motion.article
                key={item.title}
                className="premium-card p-7"
                initial={{ opacity: 0, y: 26, filter: "blur(7px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={smoothViewport}
                transition={{ duration: 0.62, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, transition: { duration: 0.25 } }}
              >
                <item.icon className="mb-6 h-7 w-7 text-[#C6A75E]" />
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-[#1B1F2A]/66">{item.copy}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-[#E8DCC8]/52">
        <div className="container">
          <div className="mb-12 max-w-3xl">
            <p className="eyebrow mb-4">Services</p>
            <h2 className="text-4xl font-semibold leading-tight md:text-5xl">{content.servicesTitle}</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {visibleServices.map((service, index) => {
              const FallbackIcon = servicesFallback[index]?.icon ?? HomeIcon;
              return (
                <motion.article
                  key={service.id}
                  className="premium-card p-7"
                  initial={{ opacity: 0, y: 28, scale: 0.98 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={smoothViewport}
                  transition={{ duration: 0.62, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.24 } }}
                >
                  <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1F2A44] text-[#C6A75E]">
                    <FallbackIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <p className="mt-3 leading-7 text-[#1B1F2A]/66">{service.description}</p>
                  <Link href={service.title.toLowerCase().includes("property") ? "/project-management" : "/services"}>
                    <a className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#1F2A44] transition hover:gap-3">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </a>
                  </Link>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container">
          <motion.div initial="hidden" whileInView="visible" viewport={smoothViewport} variants={stagger} className="mb-12 max-w-3xl">
            <motion.p variants={fadeUp} className="eyebrow mb-4">Where we plug in</motion.p>
            <motion.h2 variants={fadeUp} className="text-4xl font-semibold leading-tight md:text-5xl">
              Support lanes with visuals that match the work.
            </motion.h2>
          </motion.div>
          <div className="grid gap-6 lg:grid-cols-3">
            {outsourcingLanes.map((lane, index) => (
              <motion.article
                key={lane.title}
                className="group overflow-hidden rounded-lg border border-[#1F2A44]/12 bg-[#FAF7F1]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={smoothViewport}
                transition={{ duration: 0.66, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -8, transition: { duration: 0.24 } }}
              >
                <div
                  className="h-56 bg-cover bg-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  style={{ backgroundImage: `url('${lane.image}')` }}
                  aria-hidden="true"
                />
                <div className="p-7">
                  <lane.icon className="mb-5 h-7 w-7 text-[#C6A75E]" />
                  <h3 className="text-xl font-semibold text-[#1F2A44]">{lane.title}</h3>
                  <p className="mt-3 leading-7 text-[#1B1F2A]/68">{lane.copy}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding section-deep">
        <div className="container grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="eyebrow mb-4">How it works</p>
            <h2 className="text-4xl font-semibold leading-tight text-white md:text-5xl">A simple handoff, then steady execution.</h2>
            <p className="mt-6 max-w-xl leading-8 text-white/70">
              We define the role, match the right person, install the workflow, and keep performance visible.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {processSteps.map((step, index) => (
              <motion.div
                key={step}
                className="rounded-lg border border-white/12 bg-white/6 p-6"
                initial={{ opacity: 0, y: 26, x: index % 2 === 0 ? -12 : 12 }}
                whileInView={{ opacity: 1, y: 0, x: 0 }}
                viewport={smoothViewport}
                transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="mb-4 text-sm font-bold text-[#C6A75E]">0{index + 1}</p>
                <h3 className="text-xl font-semibold text-white">{step}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="section-padding bg-white">
          <div className="container">
            <h2 className="mb-10 text-4xl font-semibold">Trusted by operators who need the work handled.</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article key={testimonial.id} className="premium-card p-7">
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
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-[#FAF7F1] py-18 md:py-24">
        <div className="container">
          <div className="rounded-lg bg-[#1F2A44] p-8 text-white md:p-12">
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="eyebrow mb-4">Next step</p>
                <h2 className="text-3xl font-semibold text-white md:text-4xl">Get the right outsourcing support in place.</h2>
                <p className="mt-4 max-w-2xl leading-7 text-white/70">
                  Tell us what you need off your plate. We will map the role, tools, and first-week operating rhythm.
                </p>
              </div>
              <Link href="/contact">
                <Button className="btn-gold hero-shine">Book a Discovery Call</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <AiAssistant />
    </div>
  );
}
