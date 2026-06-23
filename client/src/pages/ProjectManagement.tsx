import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle, ClipboardCheck, DollarSign, Home, MessageSquare, Shield, Users, Wrench } from "lucide-react";
import { Link } from "wouter";

const services = [
  {
    icon: Users,
    title: "Tenant and Guest Coordination",
    description: "Inbox triage, move-in details, guest messages, renewal reminders, and day-to-day communication handled with calm follow-through.",
    benefits: ["Tenant inbox support", "Guest messaging", "Move-in and move-out coordination", "Escalation notes"],
  },
  {
    icon: Wrench,
    title: "Maintenance Operations",
    description: "Requests are logged, prioritized, routed to vendors, and tracked until completion so owners are not chasing updates.",
    benefits: ["24/7 request intake", "Vendor coordination", "Work order tracking", "Photo/document collection"],
  },
  {
    icon: ClipboardCheck,
    title: "Listing and Portfolio Admin",
    description: "Keep property records, listing details, rates, calendars, lease files, and owner reports organized across your tools.",
    benefits: ["Listing updates", "Calendar checks", "Lease file support", "Weekly owner summaries"],
  },
  {
    icon: DollarSign,
    title: "Rent and Payment Follow-Up",
    description: "Payment reminders, late-fee tracking, receipt logging, and clean reporting so cash-flow details do not disappear.",
    benefits: ["Rent reminders", "Arrears tracking", "Payment status reports", "Owner-ready summaries"],
  },
];

const operatingModel = [
  "Document your current workflow and approval thresholds.",
  "Match a trained property operations assistant to the role.",
  "Onboard into your PMS, email, task board, and communication rhythm.",
  "Run weekly reporting so performance stays visible.",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.62, ease: [0.16, 1, 0.3, 1] } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function ProjectManagement() {
  return (
    <>
      <title>Property Management Services | OutsourcEdge</title>
      <meta
        name="description"
        content="OutsourcEdge provides offshore property management support for landlords, realtors, and short-term-rental hosts."
      />

      <div className="min-h-screen bg-[#FAF7F1]">
        <Header />

        <section className="relative min-h-screen overflow-hidden bg-[#1F2A44] pt-32 text-white md:pt-40">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=82')",
            }}
            aria-hidden="true"
          />
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-55"
            autoPlay
            muted
            loop
            playsInline
            poster="https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=2200&q=82"
            aria-hidden="true"
          >
            <source src="/media/property-drone.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#1F2A44]/74" aria-hidden="true" />
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#FAF7F1] to-transparent" aria-hidden="true" />

          <div className="container relative z-10 flex min-h-[calc(100vh-8rem)] items-center pb-24">
            <motion.div className="max-w-4xl" initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-6 h-px w-24 bg-[#C6A75E]" />
              <motion.p variants={fadeUp} className="eyebrow mb-5">
                Property management support
              </motion.p>
              <motion.h1 variants={fadeUp} className="text-5xl font-semibold leading-[1.04] text-white md:text-7xl">
                The team behind your properties, without the payroll.
              </motion.h1>
              <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-lg leading-8 text-white/78 md:text-xl">
                Offshore property talent for US landlords, realtors, and STR hosts who need listings, tenants, maintenance, and reporting handled every day.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link href="/contact">
                  <a className="btn-gold inline-flex items-center gap-2">
                    Build My Property Team <ArrowRight className="h-4 w-4" />
                  </a>
                </Link>
                <a href="#services" className="btn-outline border-white/25 bg-white/10 text-white hover:bg-white/16">
                  See What We Handle
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="section-padding bg-[#FAF7F1]">
          <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
              <motion.p variants={fadeUp} className="eyebrow mb-4">Built for owners</motion.p>
              <motion.h2 variants={fadeUp} className="text-4xl font-semibold leading-tight md:text-5xl">
                Less chasing. More visibility. Cleaner handoffs.
              </motion.h2>
              <motion.p variants={fadeUp} className="mt-6 leading-8 text-[#1B1F2A]/68">
                Property operations break down in the small tasks: unanswered messages, vendor follow-up, late documentation, and unclear ownership. We build the support layer around those details.
              </motion.p>
            </motion.div>

            <motion.div
              className="overflow-hidden rounded-lg"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.65 }}
            >
              <img
                src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1500&q=82"
                alt="Modern residential property exterior"
                className="aspect-[4/3] w-full object-cover"
              />
            </motion.div>
          </div>
        </section>

        <section id="services" className="section-padding bg-[#E8DCC8]/52">
          <div className="container">
            <div className="mb-12 max-w-3xl">
              <p className="eyebrow mb-4">What we handle</p>
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
                Property services owners actually feel day to day.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.article
                    key={service.title}
                    className="premium-card p-7 md:p-8"
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.55, delay: index * 0.05 }}
                  >
                    <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-[#1F2A44] text-[#C6A75E]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-2xl font-semibold">{service.title}</h3>
                    <p className="mt-4 leading-7 text-[#1B1F2A]/66">{service.description}</p>
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {service.benefits.map((benefit) => (
                        <div key={benefit} className="flex items-center gap-3 rounded-lg bg-[#FAF7F1] px-4 py-3">
                          <CheckCircle className="h-4 w-4 flex-shrink-0 text-[#C6A75E]" />
                          <span className="text-sm font-semibold text-[#1B1F2A]/72">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-padding section-deep">
          <div className="container grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <p className="eyebrow mb-4">Operating model</p>
              <h2 className="text-4xl font-semibold leading-tight md:text-5xl">
                Your standards stay in place. We add the capacity.
              </h2>
              <p className="mt-6 leading-8 text-white/70">
                The goal is not to hand your properties to a black box. It is to give you dependable support with clear rules, visible work, and simple escalation.
              </p>
            </div>
            <div className="grid gap-4">
              {operatingModel.map((step, index) => (
                <motion.div
                  key={step}
                  className="flex gap-5 rounded-lg border border-white/12 bg-white/6 p-6"
                  initial={{ opacity: 0, x: 24 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.55, delay: index * 0.05 }}
                >
                  <span className="font-['Poppins'] text-xl font-semibold text-[#C6A75E]">0{index + 1}</span>
                  <p className="leading-7 text-white/78">{step}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-padding bg-white">
          <div className="container grid gap-10 lg:grid-cols-3">
            {[
              { icon: Shield, title: "Trust-first handoff", copy: "Access, approvals, and escalation rules are documented before work begins." },
              { icon: MessageSquare, title: "Clear communication", copy: "Your assistant knows what to answer, what to route, and what needs owner approval." },
              { icon: Home, title: "Portfolio ready", copy: "Support works across single-family rentals, multi-unit properties, and STR operations." },
            ].map((item) => (
              <article key={item.title} className="premium-card p-7">
                <item.icon className="mb-6 h-7 w-7 text-[#C6A75E]" />
                <h3 className="text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 leading-7 text-[#1B1F2A]/66">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#FAF7F1] py-18 md:py-24">
          <div className="container">
            <div className="rounded-lg bg-[#1F2A44] p-8 text-white md:p-12">
              <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p className="eyebrow mb-4">Ready when you are</p>
                  <h2 className="text-3xl font-semibold text-white md:text-4xl">Hand off the work that keeps interrupting your day.</h2>
                  <p className="mt-4 max-w-2xl leading-7 text-white/70">
                    We will help define the role, workflows, and first 30 days of property operations support.
                  </p>
                </div>
                <Link href="/contact">
                  <a className="btn-gold inline-flex items-center gap-2">
                    Book a Discovery Call <ArrowRight className="h-4 w-4" />
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
