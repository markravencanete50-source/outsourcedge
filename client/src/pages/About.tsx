import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Award, Users, Lightbulb, CheckCircle, Zap, Target, TrendingUp, Globe, Briefcase, Heart } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { fadeUpVariant, scaleVariant, containerVariants } from "@/lib/animations";

interface PageContent {
  aboutTitle: string;
  aboutContent: string;
}

const DEFAULT_CONTENT: PageContent = {
  aboutTitle: "About OutsourcEdge",
  aboutContent: "OutsourcEdge helps businesses streamline operations and accelerate growth through world-class outsourcing solutions.",
};

const coreValues = [
  { icon: Award,         title: "Integrity",              description: "We operate with honesty, transparency, and ethical business practices in all our dealings." },
  { icon: Users,         title: "Accountability",         description: "We take ownership of results and deliver on our commitments every single time." },
  { icon: Heart,         title: "Client Success",         description: "Your success is our success. We're invested in your growth and long-term partnership." },
  { icon: CheckCircle,   title: "Continuous Improvement", description: "We constantly refine processes and enhance our capabilities to serve you better." },
  { icon: Zap,           title: "Innovation",             description: "We embrace new technologies and creative solutions to drive business transformation." },
  { icon: Target,        title: "Operational Excellence", description: "We maintain the highest standards in everything we do, every single day." },
];

const timeline = [
  { year: "2014", title: "Founded",          description: "OutsourcEdge was founded with a vision to revolutionize outsourcing." },
  { year: "2016", title: "First 100 Clients",description: "Reached 100 satisfied clients across multiple industries." },
  { year: "2018", title: "Global Expansion", description: "Expanded operations to serve clients across North America and beyond." },
  { year: "2020", title: "Tech Integration", description: "Integrated advanced technology platforms for seamless collaboration." },
  { year: "2022", title: "500+ Team Members",description: "Grew to 500+ dedicated team members across all operations." },
  { year: "2024", title: "Industry Leader",  description: "Recognized as a leading outsourcing partner for business operations." },
];

export default function About() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);

  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, "site_content", "main");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setContent({ ...DEFAULT_CONTENT, ...docSnap.data() as PageContent });
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Skip navigation link for keyboard/screen reader users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded-lg focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* HERO */}
      <section
        aria-label="About page hero"
        className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden"
      >
        {/* Mesh gradient background */}
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-white" />
          {/* Static decorative blobs — no animate-pulse */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-100/15 rounded-full blur-3xl" />
        </div>

        <div className="container" id="main-content">
          <motion.div
            className="max-w-4xl"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div
              variants={fadeUpVariant}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-cyan-50 rounded-full border border-cyan-200/50"
            >
              <Zap className="w-4 h-4 text-cyan-600" aria-hidden="true" />
              <span className="text-sm font-bold text-cyan-900">Our Story</span>
            </motion.div>

            <motion.h1
              variants={fadeUpVariant}
              className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight"
            >
              {content.aboutTitle}
            </motion.h1>

            <motion.p
              variants={fadeUpVariant}
              className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl leading-relaxed"
            >
              {content.aboutContent}
            </motion.p>

            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button className="btn-primary text-lg" aria-label="Get started with OutsourcEdge">
                  Get Started
                </Button>
              </Link>
              <Link href="/services">
                <Button className="btn-outline text-lg" aria-label="Explore OutsourcEdge services">
                  Explore Services
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section aria-labelledby="mission-heading" className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeUpVariant} className="p-8 bg-white rounded-2xl border border-slate-200">
              <Target className="w-12 h-12 text-cyan-600 mb-6" aria-hidden="true" />
              <h2 id="mission-heading" className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To empower businesses with world-class outsourcing solutions that streamline operations,
                reduce costs, and enable growth through dedicated, process-driven partnerships.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariant} className="p-8 bg-white rounded-2xl border border-slate-200">
              <Globe className="w-12 h-12 text-cyan-600 mb-6" aria-hidden="true" />
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Vision</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To become the most trusted outsourcing partner globally, recognized for operational
                excellence, innovation, and delivering measurable business outcomes for our clients.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section aria-labelledby="values-heading" className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2
              id="values-heading"
              variants={fadeUpVariant}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            >
              Our Core Values
            </motion.h2>
            <motion.p variants={fadeUpVariant} className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do and how we serve our clients.
            </motion.p>
          </motion.div>

          <motion.ul
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 list-none"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
            aria-label="Core values"
          >
            {coreValues.map((value, i) => (
              <motion.li
                key={i}
                variants={scaleVariant}
                className="group p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:shadow-xl transition-all cursor-pointer"
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-200 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  aria-hidden="true"
                >
                  <value.icon className="w-6 h-6 text-cyan-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </section>

      {/* COMPANY TIMELINE — connected vertical line */}
      <section aria-labelledby="timeline-heading" className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2
              id="timeline-heading"
              variants={fadeUpVariant}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            >
              Our Journey
            </motion.h2>
            <motion.p variants={fadeUpVariant} className="text-xl text-slate-600 max-w-2xl mx-auto">
              A decade of growth, innovation, and delivering exceptional results for our clients.
            </motion.p>
          </motion.div>

          {/* Connected timeline */}
          <ol className="relative max-w-3xl mx-auto" aria-label="Company history timeline">
            {/* Vertical connecting line */}
            <div
              className="absolute left-9 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-300 via-cyan-500 to-cyan-300"
              aria-hidden="true"
            />

            <motion.div
              className="space-y-0"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true, margin: "-100px" }}
            >
              {timeline.map((item, i) => (
                <motion.li
                  key={i}
                  variants={fadeUpVariant}
                  className="relative flex gap-8 pb-12 last:pb-0"
                >
                  {/* Year circle — sits on top of the line */}
                  <motion.div
                    className="relative z-10 w-[4.5rem] h-[4.5rem] bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-lg shadow-cyan-200 ring-4 ring-white"
                    whileHover={{ scale: 1.1 }}
                    aria-label={`Year ${item.year}`}
                  >
                    {item.year}
                  </motion.div>

                  {/* Content */}
                  <div className="pt-3 flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-lg text-slate-600 leading-relaxed">{item.description}</p>
                  </div>
                </motion.li>
              ))}
            </motion.div>
          </ol>
        </div>
      </section>

      <Footer />
    </div>
  );
}
