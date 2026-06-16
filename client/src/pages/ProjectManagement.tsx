import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { CheckCircle, Home, Users, Wrench, ClipboardCheck, DollarSign, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

const services = [
  {
    icon: Home,
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
    title: "Property Inspections",
    description:
      "Regular inspections protect your investment and catch issues before they become costly problems. We conduct move-in, periodic, and move-out inspections with photo documentation and detailed reports.",
    benefits: [
      "Move-in and move-out inspections",
      "Routine periodic walkthroughs",
      "Photo and written documentation",
      "Damage assessment reporting",
    ],
  },
  {
    icon: DollarSign,
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

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      variants={itemVariants}
      className="border border-gray-200 rounded-xl overflow-hidden"
    >
      <button
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50 transition"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-base font-semibold text-[#0F172A]">{q}</span>
        <ChevronDown
          className={`w-5 h-5 text-[#0891B2] flex-shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-6 pb-6">
          <p className="text-gray-600 leading-relaxed">{a}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function ProjectManagement() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-br from-white via-blue-50 to-white">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.span
              variants={itemVariants}
              className="inline-block text-sm font-semibold text-[#0891B2] uppercase tracking-widest mb-4"
            >
              Property Management Solutions
            </motion.span>
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6"
            >
              Project Management Services
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-10"
            >
              End-to-end property management support — from landlords and tenants to maintenance and rent collection. We handle the operations so you can focus on growing your portfolio.
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <a className="btn-primary">Get Started Today</a>
              </Link>
              <a href="#services" className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#0891B2] text-[#0891B2] rounded-lg font-semibold hover:bg-blue-50 transition">
                Explore Services
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Five core services designed to cover every aspect of property management.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-col gap-10"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className={`flex flex-col md:flex-row ${isEven ? "" : "md:flex-row-reverse"} items-center gap-10 p-8 md:p-12 bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#0891B2] hover:shadow-lg transition-all duration-300`}
                >
                  {/* Icon block */}
                  <div className="flex-shrink-0 flex items-center justify-center w-24 h-24 bg-gradient-to-br from-[#0891B2] to-[#059669] rounded-2xl shadow-md">
                    <Icon className="w-11 h-11 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-5 leading-relaxed">{service.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {service.benefits.map((b, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#059669] flex-shrink-0" />
                          <span className="text-sm text-gray-700">{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Stats banner */}
      <section className="py-16 bg-gradient-to-r from-[#0891B2] to-[#059669]">
        <div className="container">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {[
              { value: "500+", label: "Properties Managed" },
              { value: "98%", label: "Client Retention" },
              { value: "24/7", label: "Support Available" },
              { value: "5–7", label: "Days to Onboard" },
            ].map((stat, i) => (
              <motion.div key={i} variants={itemVariants}>
                <p className="text-4xl font-bold mb-1">{stat.value}</p>
                <p className="text-white/80 text-sm font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our property management services.
            </p>
          </motion.div>

          <motion.div
            className="max-w-3xl mx-auto flex flex-col gap-4"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {faqs.map((faq, i) => (
              <FaqItem key={i} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
              Ready to Hand Off Your Property Operations?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-xl mx-auto">
              Let's talk about your portfolio. Our team will put together a custom plan that fits your properties and your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <a className="btn-primary text-lg px-8 py-4">Contact Us Today</a>
              </Link>
              <Link href="/services">
                <a className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-[#0891B2] hover:text-[#0891B2] transition text-lg">
                  View All Services
                </a>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
