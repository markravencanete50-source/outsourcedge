import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, ClipboardCheck, Home as HomeIcon, Shield, Star, Users, Wrench } from "lucide-react";
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
  heroTitle: "Your listings, expertly managed.",
  heroSubtitle: "OutsourcEdge places vetted offshore property talent with US realtors, landlords, and STR hosts who want calm operations without in-house overhead.",
  servicesTitle: "Property support built around the work owners actually need done",
};

const highlights = [
  { value: "5-7", label: "days to onboard" },
  { value: "24/7", label: "request intake" },
  { value: "40-60%", label: "lower ops overhead" },
  { value: "US", label: "property owner focus" },
];

const servicesFallback = [
  {
    icon: HomeIcon,
    title: "Listing Operations",
    description: "Calendar, listing, guest, and tenant coordination handled with clean daily communication.",
  },
  {
    icon: Wrench,
    title: "Maintenance Coordination",
    description: "Request intake, vendor follow-up, status updates, and documentation before problems get expensive.",
  },
  {
    icon: ClipboardCheck,
    title: "Owner Reporting",
    description: "Reliable summaries, task tracking, rent follow-up, and portfolio visibility without more admin work.",
  },
];

const processSteps = [
  "Map the work",
  "Match the right talent",
  "Onboard into your tools",
  "Report results weekly",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

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
          className="absolute inset-0 bg-cover bg-center opacity-42"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=2200&q=82')",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#1F2A44]/72" aria-hidden="true" />
        <div className="container relative z-10 flex min-h-[calc(92vh-8rem)] items-center pb-16">
          <motion.div className="max-w-4xl" initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-6 h-px w-24 bg-[#C6A75E]" />
            <motion.p variants={fadeUp} className="eyebrow mb-5">
              Offshore property talent. On-shore standards.
            </motion.p>
            <motion.h1 variants={fadeUp} className="max-w-4xl text-5xl font-semibold leading-[1.05] text-white md:text-7xl">
              {content.heroTitle}
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-lg leading-8 text-white/78 md:text-xl">
              {content.heroSubtitle}
            </motion.p>
            <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link href="/contact">
                <Button className="btn-gold text-base">Book a Discovery Call</Button>
              </Link>
              <Link href="/project-management">
                <Button className="border border-white/25 bg-white/8 px-6 py-3.5 text-base font-bold text-white hover:bg-white/14">
                  View Property Services
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
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
              <motion.p variants={fadeUp} className="eyebrow mb-4">Why owners delegate to us</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-semibold leading-tight md:text-5xl">
                Calm support for the tasks that keep portfolios moving.
              </motion.h2>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65 }}
              className="text-lg leading-8 text-[#1B1F2A]/68"
            >
              The brand should feel trustworthy enough to hand the keys to. That means clear owners, documented work, responsive updates, and no noisy sales language.
            </motion.p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { icon: Shield, title: "Vetted people", copy: "Talent selected for reliability, communication, and property operations judgment." },
              { icon: Users, title: "Built into your workflow", copy: "We operate inside your tools, channels, templates, and approval rules." },
              { icon: CheckCircle, title: "Visible delivery", copy: "Weekly reporting and clean task ownership keep work from disappearing." },
            ].map((item) => (
              <motion.article
                key={item.title}
                className="premium-card p-7"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55 }}
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
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, delay: index * 0.06 }}
                >
                  <div className="mb-7 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1F2A44] text-[#C6A75E]">
                    <FallbackIcon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold">{service.title}</h3>
                  <p className="mt-3 leading-7 text-[#1B1F2A]/66">{service.description}</p>
                  <Link href="/project-management">
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

      <section className="section-padding section-deep">
        <div className="container grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="eyebrow mb-4">How it works</p>
            <h2 className="text-4xl font-semibold leading-tight md:text-5xl">A simple handoff, then steady execution.</h2>
            <p className="mt-6 max-w-xl leading-8 text-white/70">
              We keep motion subtle because the message needs to win: match, onboard, execute, report.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {processSteps.map((step, index) => (
              <motion.div
                key={step}
                className="rounded-lg border border-white/12 bg-white/6 p-6"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: index * 0.06 }}
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
                  <p className="leading-7 text-[#1B1F2A]/70">"{testimonial.content}"</p>
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
                <h2 className="text-3xl font-semibold text-white md:text-4xl">Get the right property support in place.</h2>
                <p className="mt-4 max-w-2xl leading-7 text-white/70">
                  Tell us what you need off your plate. We will map the role, tools, and first-week operating rhythm.
                </p>
              </div>
              <Link href="/contact">
                <Button className="btn-gold">Book a Discovery Call</Button>
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
