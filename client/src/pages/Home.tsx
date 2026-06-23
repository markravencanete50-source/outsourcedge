import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Zap, TrendingUp, Globe, Award, Star, Shield, Cpu, Target, Cog } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { doc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
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
  heroTitle: "Scale Your Business with Dedicated Growth Partners",
  heroSubtitle: "OutsourcEdge helps businesses streamline operations, improve customer experiences, and accelerate growth through world-class outsourcing solutions.",
  servicesTitle: "Our Specialized Services",
};

const trustItems = [
  { icon: Shield, title: "Secure Operations", description: "Enterprise-grade security and compliance standards" },
  { icon: Users, title: "Dedicated Support", description: "Dedicated teams aligned with your business goals" },
  { icon: Cpu, title: "Technology Enabled", description: "Powered by modern tools and platforms" },
  { icon: Cog, title: "Process Driven", description: "Systematic, repeatable, and optimized workflows" },
  { icon: TrendingUp, title: "Scalable Solutions", description: "Grow from 1 to 100+ team members seamlessly" },
  { icon: Award, title: "Operational Excellence", description: "Continuous improvement and quality assurance" },
];

const differentiators = [
  { icon: Target, title: "Operational Excellence", description: "We don't just provide staff—we deliver systematic processes, quality assurance, and continuous improvement frameworks." },
  { icon: Users, title: "Dedicated Growth Partners", description: "Your team becomes an extension of your business, not just a vendor. We invest in understanding your goals." },
  { icon: Cog, title: "Process-Driven Delivery", description: "Every engagement is built on documented processes, clear KPIs, and accountability measures." },
  { icon: TrendingUp, title: "Cost Efficiency", description: "Reduce operational costs by 40-60% while maintaining or improving service quality." },
  { icon: Globe, title: "Scalable Workforce Solutions", description: "Scale your team up or down without the overhead of hiring and managing full-time employees." },
  { icon: Cpu, title: "Technology-Enabled Operations", description: "Leverage Microsoft 365, ClickUp, Firebase, and custom integrations for seamless collaboration." },
];

const processSteps = [
  { step: 1, title: "Discovery", description: "We learn about your business, challenges, and goals." },
  { step: 2, title: "Assessment", description: "We analyze processes and identify opportunities." },
  { step: 3, title: "Talent Matching", description: "We match the right team members to your needs." },
  { step: 4, title: "Onboarding", description: "Seamless integration with your team and systems." },
  { step: 5, title: "Execution", description: "Dedicated team begins delivering results with transparency." },
  { step: 6, title: "Improvement", description: "Regular review, optimization, and scaling." },
];

export default function Home() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    if (!db) return;

    // Store unsubscribe functions and clean them up on unmount
    const docRef = doc(db, "site_content", "main");
    const unsubContent = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setContent({ ...DEFAULT_CONTENT, ...docSnap.data() as PageContent });
    });

    const qServices = query(collection(db, "services"), orderBy("order", "asc"), limit(6));
    const unsubServices = onSnapshot(qServices, (snapshot) =>
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)))
    );

    const qTestimonials = query(collection(db, "testimonials"), limit(3));
    const unsubTestimonials = onSnapshot(qTestimonials, (snapshot) =>
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)))
    );

    // Cleanup all listeners when the component unmounts
    return () => {
      unsubContent();
      unsubServices();
      unsubTestimonials();
    };
  }, []);

  // Animation Variants
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
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-slate-50/30 to-white -z-10" />
        {/* Replaced animate-pulse blobs with static blobs — no GPU drain */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1B3A4B]/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100/20 rounded-full blur-3xl -z-10" />
        
        <div className="container">
          <motion.div 
            className="max-w-4xl"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              variants={fadeUpVariant}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-[#EEF2F5] rounded-full border border-[#1B3A4B]/20"
            >
              <Zap className="w-4 h-4 text-[#1B3A4B]" />
              <span className="text-sm font-bold text-[#1B3A4B]">Trusted by leading businesses worldwide</span>
            </motion.div>

            <motion.h1 
              variants={fadeUpVariant}
              className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight"
            >
              {content.heroTitle}
            </motion.h1>

            <motion.p 
              variants={fadeUpVariant}
              className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl leading-relaxed"
            >
              {content.heroSubtitle}
            </motion.p>

            <motion.div 
              variants={fadeUpVariant}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/contact">
                <Button className="btn-primary text-lg">Book a Consultation</Button>
              </Link>
              <Link href="/services">
                <Button className="btn-outline text-lg">Explore Services</Button>
              </Link>
            </motion.div>

            <motion.div 
              variants={fadeUpVariant}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {[
                { label: "Years of Experience", value: "10+" },
                { label: "Team Members", value: "500+" },
                { label: "Clients Served", value: "200+" },
                { label: "Success Rate", value: "98%" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-[#1B3A4B] mb-2">{stat.value}</div>
                  <div className="text-sm text-slate-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TRUST & CREDIBILITY */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              variants={fadeUpVariant}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            >
              Why Businesses Trust OutsourcEdge
            </motion.h2>
            <motion.p 
              variants={fadeUpVariant}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              We combine operational excellence with dedicated partnership to deliver measurable business outcomes.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            {trustItems.map((item, i) => (
              <motion.div 
                key={i}
                variants={scaleVariant}
                className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-[#B8973E]/50 hover:shadow-xl transition-all duration-300 cursor-pointer"
                whileHover={{ y: -5 }}
              >
                <motion.div 
                  className="w-14 h-14 bg-[#D6E0E5] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#B8D0DA] transition-colors"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <item.icon className="w-7 h-7 text-[#1B3A4B]" />
                </motion.div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WHY OUTSOURCEDGE */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              variants={fadeUpVariant}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            >
              What Sets Us Apart
            </motion.h2>
            <motion.p 
              variants={fadeUpVariant}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Six core differentiators that make OutsourcEdge your ideal growth partner.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            {differentiators.map((item, i) => (
              <motion.div 
                key={i}
                variants={fadeUpVariant}
                className="p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#B8973E]/50 hover:shadow-lg transition-all flex gap-4"
                whileHover={{ x: 5 }}
              >
                <motion.div 
                  whileHover={{ scale: 1.15, rotate: -5 }}
                  className="w-12 h-12 bg-[#1B3A4B] rounded-xl flex items-center justify-center flex-shrink-0"
                >
                  <item.icon className="w-6 h-6 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          <motion.div 
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            <motion.h2 
              variants={fadeUpVariant}
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
            >
              Our Proven Process
            </motion.h2>
            <motion.p 
              variants={fadeUpVariant}
              className="text-xl text-slate-600 max-w-2xl mx-auto"
            >
              Six strategic steps to transform your operations and accelerate growth.
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true, margin: "-100px" }}
          >
            {processSteps.map((item, i) => (
              <motion.div 
                key={i}
                variants={fadeUpVariant}
                className="text-center"
              >
                <motion.div 
                  className="w-12 h-12 bg-[#1B3A4B] text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4 shadow-lg"
                  whileHover={{ scale: 1.2, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {item.step}
                </motion.div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-[#1B3A4B] to-[#254F63] text-white relative overflow-hidden">
        {/* Replaced animate-pulse with static decorative blob */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="container relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            <motion.h2 
              variants={fadeUpVariant}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Ready to Scale Your Business?
            </motion.h2>
            <motion.p 
              variants={fadeUpVariant}
              className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90"
            >
              Partner with OutsourcEdge and gain access to dedicated growth partners and operational excellence.
            </motion.p>
            <motion.div 
              variants={fadeUpVariant}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/contact">
                <Button className="bg-white text-[#1B3A4B] hover:bg-slate-100 text-lg px-8 py-6 font-bold">
                  Book a Consultation
                </Button>
              </Link>
              <Link href="/services">
                <Button className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-6 font-bold">
                  Explore Services
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="py-20 md:py-32 bg-white">
          <div className="container">
            <motion.div 
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.h2 
                variants={fadeUpVariant}
                className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
              >
                Trusted by Industry Leaders
              </motion.h2>
            </motion.div>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true, margin: "-100px" }}
            >
              {testimonials.map((t) => (
                <motion.div 
                  key={t.id}
                  variants={scaleVariant}
                  className="p-8 bg-slate-50 rounded-2xl border border-slate-200 hover:shadow-lg transition-all"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex gap-1 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 italic leading-relaxed">"{t.content}"</p>
                  <div className="border-t border-slate-200 pt-4">
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-sm text-slate-600">{t.company}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
      <AiAssistant />
    </div>
  );
}
