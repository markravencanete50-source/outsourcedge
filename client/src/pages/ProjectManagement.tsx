import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, useInView } from "framer-motion";
import { CheckCircle, Home, Users, Wrench, ClipboardCheck, DollarSign, ChevronDown, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useState, useRef } from "react";

/* ─── Animation variants ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut", delay },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const slideIn = (direction: "left" | "right") => ({
  hidden: { opacity: 0, x: direction === "left" ? -40 : 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut" } },
});

/* ─── Data ─── */
const services = [
  {
    icon: Home,
    tag: "01",
    title: "Landlord Support",
    description:
      "We take the complexity out of being a landlord. Our team handles everything from lease agreements and legal compliance to vendor coordination and financial reporting — so you can own property without the headaches.",
    benefits: [
      "Lease drafting and renewals",
      "Legal compliance monitoring",
      "Vendor and contractor management",
      "Monthly financial statements",
    ],
  },
  {
    icon: Users,
    tag: "02",
    title: "Tenant Management",
    description:
      "From first inquiry to move-out, we manage the full tenant lifecycle. We screen applicants thoroughly, handle onboarding, field day-to-day requests, and ensure your tenants feel heard and valued.",
    benefits: [
      "Background and credit screening",
      "Tenant onboarding and orientation",
      "Ongoing communication support",
      "Move-in / move-out coordination",
    ],
  },
  {
    icon: Wrench,
    tag: "03",
    title: "Maintenance Coordination",
    description:
      "Fast response times and reliable contractors keep your properties in top shape. We log, prioritize, and coordinate all maintenance requests end-to-end, keeping both landlords and tenants informed every step of the way.",
    benefits: [
      "24/7 maintenance request intake",
      "Vetted contractor network",
      "Work order tracking and updates",
      "Preventive maintenance scheduling",
    ],
  },
  {
    icon: ClipboardCheck,
    tag: "04",
    title: "Property Inspections",
    description:
      "Regular inspections protect your investment and catch issues before they become costly problems. We conduct move-in, periodic, and move-out inspections with full photo documentation and detailed written reports.",
    benefits: [
      "Move-in and move-out inspections",
      "Routine periodic walkthroughs",
      "Photo and written documentation",
      "Damage assessment reporting",
    ],
  },
  {
    icon: DollarSign,
    tag: "05",
    title: "Rent Collection",
    description:
      "Consistent cash flow is critical for property owners. We manage the full rent collection process — from automated reminders and payment processing to late fee enforcement and arrears tracking.",
    benefits: [
      "Automated payment reminders",
      "Online and manual payment processing",
      "Late fee enforcement",
      "Arrears tracking and reporting",
    ],
  },
];

const faqs = [
  {
    q: "How quickly can you take over management of my property?",
    a: "We typically complete onboarding within 5–7 business days. Our team coordinates directly with current tenants and any existing vendors to ensure a seamless transition with no disruption to your operations.",
  },
  {
    q: "Do you manage both residential and commercial properties?",
    a: "Yes. Our team has experience across single-family homes, multi-unit residential buildings, and small commercial properties. We tailor our approach to the specific needs of each asset type.",
  },
  {
    q: "How do you handle emergency maintenance requests?",
    a: "We have a 24/7 intake system for emergency maintenance. Urgent issues are escalated immediately to our on-call coordinator who dispatches from our vetted contractor network and keeps all parties updated in real time.",
  },
  {
    q: "Can I still be involved in decisions about my property?",
    a: "Absolutely. We work as an extension of your team, not a replacement. You define the level of involvement you want — we handle the day-to-day and escalate anything above your approved thresholds for your sign-off.",
  },
  {
    q: "What does your tenant screening process look like?",
    a: "We run comprehensive background checks including credit history, rental history, employment verification, and references. You receive a full screening report before any lease is signed.",
  },
];

/* ─── Service Card ─── */
function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = service.icon;

  return (
    <motion.article
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={slideIn(index % 2 === 0 ? "left" : "right")}
      className="group relative bg-white rounded-2xl border border-gray-200 hover:border-[#1B3A4B] hover:shadow-xl transition-all duration-500 overflow-hidden"
      aria-label={service.title}
    >
      {/* Accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#1B3A4B] to-[#059669] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="p-8 md:p-10">
        {/* Header row */}
        <div className="flex items-start gap-5 mb-6">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-14 h-14 bg-gradient-to-br from-[#1B3A4B] to-[#059669] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
          >
            <Icon className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <span className="text-xs font-bold text-[#1B3A4B] tracking-widest uppercase">{service.tag}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mt-0.5 leading-tight">
              {service.title}
            </h2>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 leading-relaxed text-base md:text-lg mb-8">
          {service.description}
        </p>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {service.benefits.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
              className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3"
            >
              <CheckCircle className="w-4 h-4 text-[#059669] flex-shrink-0" />
              <span className="text-sm font-medium text-gray-700">{b}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

/* ─── FAQ Item ─── */
function FaqItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      custom={index * 0.07}
      variants={fadeUp}
      className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-[#1B3A4B] transition-colors duration-300"
    >
      <button
        className="w-full flex items-center justify-between gap-4 p-6 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[#0F172A]">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-[#1B3A4B] flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <p className="px-6 pb-6 text-gray-600 leading-relaxed">{a}</p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Page ─── */
export default function ProjectManagement() {
  return (
    <>
      {/* SEO meta */}
      <title>Project Management Services | OutsourcEdge</title>
      <meta
        name="description"
        content="OutsourcEdge offers end-to-end property project management services including Landlord Support, Tenant Management, Maintenance Coordination, Property Inspections, and Rent Collection."
      />
      <meta name="keywords" content="property management, landlord support, tenant management, maintenance coordination, rent collection, property inspections, BPO, outsourcing" />
      <meta property="og:title" content="Project Management Services | OutsourcEdge" />
      <meta property="og:description" content="Expert property management solutions — landlords, tenants, maintenance, inspections, and rent collection all under one roof." />
      <meta property="og:type" content="website" />
      <link rel="canonical" href="https://outsourcedge.vercel.app/project-management" />

      <div className="min-h-screen bg-white">
        <Header />

        {/* ── Hero ── */}
        <section className="relative pt-36 pb-24 md:pt-52 md:pb-36 bg-gradient-to-br from-white via-blue-50 to-white overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1B3A4B]/8 rounded-full blur-3xl -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#059669]/8 rounded-full blur-3xl translate-y-1/2 pointer-events-none" />

          <div className="container relative">
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial="hidden"
              animate="visible"
              variants={stagger}
            >
              <motion.span
                variants={fadeUp}
                custom={0}
                className="inline-block text-xs font-bold text-[#1B3A4B] uppercase tracking-[0.2em] mb-5 px-4 py-1.5 bg-[#1B3A4B]/10 rounded-full"
              >
                Property Management Solutions
              </motion.span>

              <motion.h1
                variants={fadeUp}
                custom={0.05}
                className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6 leading-tight"
              >
                Project Management{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B3A4B] to-[#059669]">
                  Services
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={0.1}
                className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed"
              >
                End-to-end property management support — from landlords and tenants to maintenance and rent collection. We handle the operations so you can focus on growing your portfolio.
              </motion.p>

              <motion.div variants={fadeUp} custom={0.15}>
                <Link href="/contact">
                  <a className="inline-flex items-center gap-2 btn-primary text-base px-8 py-4 group">
                    Get Started Today
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* ── Services ── */}
        <section id="services" className="py-20 md:py-32 bg-white">
          <div className="container">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2
                variants={fadeUp}
                className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4"
              >
                What We Offer
              </motion.h2>
              <motion.p
                variants={fadeUp}
                custom={0.05}
                className="text-xl text-gray-600 max-w-xl mx-auto"
              >
                Five core services designed to cover every aspect of property management.
              </motion.p>
            </motion.div>

            <div className="flex flex-col gap-8 max-w-4xl mx-auto">
              {services.map((service, index) => (
                <ServiceCard key={index} service={service} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-20 bg-gradient-to-r from-[#1B3A4B] to-[#059669]">
          <div className="container">
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {[
                { value: "500+", label: "Properties Managed" },
                { value: "98%", label: "Client Retention" },
                { value: "24/7", label: "Support Available" },
                { value: "5–7", label: "Days to Onboard" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  custom={i * 0.08}
                  variants={fadeUp}
                  className="group"
                >
                  <motion.p
                    className="text-5xl font-bold mb-2"
                    whileInView={{ scale: [0.7, 1.05, 1] }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    {stat.value}
                  </motion.p>
                  <p className="text-white/80 text-sm font-medium uppercase tracking-wide">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 md:py-32 bg-gray-50">
          <div className="container">
            <motion.div
              className="text-center mb-14"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
                Frequently Asked Questions
              </motion.h2>
              <motion.p variants={fadeUp} custom={0.05} className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to know about our property management services.
              </motion.p>
            </motion.div>

            <motion.div
              className="max-w-3xl mx-auto flex flex-col gap-4"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              {faqs.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} index={i} />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Contact CTA ── */}
        <section className="py-20 md:py-32 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-white pointer-events-none" />
          <div className="container relative">
            <motion.div
              className="max-w-2xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="inline-block text-xs font-bold text-[#1B3A4B] uppercase tracking-[0.2em] mb-5 px-4 py-1.5 bg-[#1B3A4B]/10 rounded-full"
              >
                Let's Work Together
              </motion.span>

              <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6 leading-tight">
                Ready to Hand Off Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B3A4B] to-[#059669]">
                  Property Operations?
                </span>
              </h2>

              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Let's talk about your portfolio. Our team will put together a custom plan that fits your properties and your goals — no obligation.
              </p>

              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Link href="/contact">
                  <a className="inline-flex items-center gap-2 btn-primary text-lg px-10 py-4 group">
                    Contact Us Today
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
