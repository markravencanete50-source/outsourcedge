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

const serviceSolutions = [
  {
    title: "Property Management Support",
    challenge: "Managing tenant communications and lease administration is time-consuming.",
    solution: "Dedicated property management team handling relations, maintenance, and admin.",
    benefits: ["Faster response times", "Improved tenant satisfaction", "Reduced burden"],
  },
  {
    title: "Customer Experience Support",
    challenge: "Scaling support without hiring full-time staff creates bottlenecks.",
    solution: "Trained support team providing multi-channel service and ticket management.",
    benefits: ["24/7 availability", "Consistent quality", "Reduced response time"],
  },
  {
    title: "Administrative Support",
    challenge: "Administrative tasks consume time meant for strategic activities.",
    solution: "Comprehensive support including scheduling, email management, and reporting.",
    benefits: ["More time for strategy", "Improved organization", "Better documentation"],
  }
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
    const docRef = doc(db, "site_content", "main");
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setContent({ ...DEFAULT_CONTENT, ...docSnap.data() as PageContent });
    });
    const qServices = query(collection(db, "services"), orderBy("order", "asc"), limit(6));
    onSnapshot(qServices, (snapshot) => setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service))));
    const qTestimonials = query(collection(db, "testimonials"), limit(3));
    onSnapshot(qTestimonials, (snapshot) => setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial))));
  }, []);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* HERO */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-white -z-10" />
        <div className="container">
          <motion.div className="max-w-4xl" initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-cyan-50 rounded-full border border-cyan-200/50">
              <Zap className="w-4 h-4 text-cyan-600" />
              <span className="text-sm font-bold text-cyan-900">Trusted by leading businesses worldwide</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              {content.heroTitle}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl leading-relaxed">
              {content.heroSubtitle}
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact"><Button className="btn-primary text-lg">Book a Consultation</Button></Link>
              <Link href="/services"><Button className="btn-outline text-lg">Explore Services</Button></Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TRUST */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Why Businesses Trust OutsourcEdge</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trustItems.map((item, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl border border-slate-200 hover:border-cyan-300 transition-all">
                <item.icon className="w-10 h-10 text-cyan-600 mb-6" />
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">What Sets Us Apart</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {differentiators.map((item, i) => (
              <div key={i} className="p-8 bg-slate-50 rounded-2xl border border-slate-200 flex gap-4">
                <item.icon className="w-10 h-10 text-cyan-600 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Our Proven Process</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {processSteps.map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-4 shadow-lg">{item.step}</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 md:py-32 bg-cyan-600 text-white text-center">
        <div className="container">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Scale Your Business?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">Partner with OutsourcEdge and gain access to dedicated growth partners and operational excellence.</p>
          <Link href="/contact"><Button className="bg-white text-cyan-600 hover:bg-slate-100 text-lg px-8 py-6 font-bold">Book a Consultation</Button></Link>
        </div>
      </section>

      <Footer />
      <AiAssistant />
    </div>
  );
}
