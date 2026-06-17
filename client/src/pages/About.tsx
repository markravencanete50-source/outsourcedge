import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Award, Users, Lightbulb, CheckCircle, Zap, Target, TrendingUp, Globe, Briefcase, Heart } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

interface PageContent {
  aboutTitle: string;
  aboutContent: string;
}

const DEFAULT_CONTENT: PageContent = {
  aboutTitle: "About OutsourcEdge",
  aboutContent: "OutsourcEdge helps businesses streamline operations and accelerate growth through world-class outsourcing solutions.",
};

const coreValues = [
  { icon: Award, title: "Integrity", description: "We operate with honesty, transparency, and ethical business practices in all our dealings." },
  { icon: Users, title: "Accountability", description: "We take ownership of results and deliver on our commitments every single time." },
  { icon: Heart, title: "Client Success", description: "Your success is our success. We're invested in your growth and long-term partnership." },
  { icon: CheckCircle, title: "Continuous Improvement", description: "We constantly refine processes and enhance our capabilities to serve you better." },
  { icon: Zap, title: "Innovation", description: "We embrace new technologies and creative solutions to drive business transformation." },
  { icon: Target, title: "Operational Excellence", description: "We maintain the highest standards in everything we do, every single day." },
];

const timeline = [
  { year: "2014", title: "Founded", description: "OutsourcEdge was founded with a vision to revolutionize outsourcing." },
  { year: "2016", title: "First 100 Clients", description: "Reached 100 satisfied clients across multiple industries." },
  { year: "2018", title: "Global Expansion", description: "Expanded operations to serve clients across North America and beyond." },
  { year: "2020", title: "Tech Integration", description: "Integrated advanced technology platforms for seamless collaboration." },
  { year: "2022", title: "500+ Team Members", description: "Grew to 500+ dedicated team members across all operations." },
  { year: "2024", title: "Industry Leader", description: "Recognized as a leading outsourcing partner for business operations." },
];

export default function About() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);

  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, "site_content", "main");
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setContent({ ...DEFAULT_CONTENT, ...docSnap.data() as PageContent });
    });
  }, []);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const scaleVariant = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.2,
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-white -z-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/20 rounded-full blur-3xl -z-10 animate-pulse" />
        
        <div className="container">
          <motion.div
            className="max-w-4xl"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={fadeUpVariant} className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-cyan-50 rounded-full border border-cyan-200/50">
              <Zap className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-bold text-cyan-900">Our Story</span>
            </motion.div>

            <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              {content.aboutTitle}
            </motion.h1>

            <motion.p variants={fadeUpVariant} className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl leading-relaxed">
              {content.aboutContent}
            </motion.p>

            <motion.div variants={fadeUpVariant} className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button className="btn-primary text-lg">Get Started</Button>
              </Link>
              <Link href="/services">
                <Button className="btn-outline text-lg">Explore Services</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.div variants={fadeUpVariant} className="p-8 bg-white rounded-2xl border border-slate-200">
              <Target className="w-12 h-12 text-cyan-600 mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Mission</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To empower businesses with world-class outsourcing solutions that streamline operations, reduce costs, and enable growth through dedicated, process-driven partnerships.
              </p>
            </motion.div>

            <motion.div variants={fadeUpVariant} className="p-8 bg-white rounded-2xl border border-slate-200">
              <Globe className="w-12 h-12 text-cyan-600 mb-6" />
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Vision</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                To become the most trusted outsourcing partner globally, recognized for operational excellence, innovation, and delivering measurable business outcomes for our clients.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 variants={fadeUpVariant} className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Our Core Values
            </motion.h2>
            <motion.p variants={fadeUpVariant} className="text-xl text-slate-600 max-w-2xl mx-auto">
              The principles that guide everything we do and how we serve our clients.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            {coreValues.map((value, i) => (
              <motion.div
                key={i}
                variants={scaleVariant}
                className="group p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-cyan-300 hover:shadow-xl transition-all cursor-pointer"
                whileHover={{ y: -5 }}
              >
                <motion.div
                  className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-200 transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <value.icon className="w-6 h-6 text-cyan-600" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{value.title}</h3>
                <p className="text-slate-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* COMPANY TIMELINE */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 variants={fadeUpVariant} className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Our Journey
            </motion.h2>
            <motion.p variants={fadeUpVariant} className="text-xl text-slate-600 max-w-2xl mx-auto">
              A decade of growth, innovation, and delivering exceptional results for our clients.
            </motion.p>
          </motion.div>

          <motion.div
            className="space-y-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            {timeline.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUpVariant}
                className="flex gap-8 items-start"
              >
                <motion.div
                  className="w-20 h-20 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  {item.year}
                </motion.div>
                <div className="pt-2 flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
