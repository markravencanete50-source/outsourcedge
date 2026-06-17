import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Zap, TrendingUp, Globe, Award, Star } from "lucide-react";
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
  heroTitle: "Your Growth Team, Ready Now",
  heroSubtitle: "Scale your operations with dedicated global talent. We provide the expertise you need to grow without the complexity.",
  servicesTitle: "Our Specialized Services",
};

export default function Home() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    if (!db) return;

    // Fetch Page Text
    const docRef = doc(db, "site_content", "main");
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setContent({ ...DEFAULT_CONTENT, ...docSnap.data() as PageContent });
      }
    });

    // Fetch Dynamic Services (Limit to 6 for home)
    const qServices = query(collection(db, "services"), orderBy("order", "asc"), limit(6));
    onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    // Fetch Dynamic Testimonials
    const qTestimonials = query(collection(db, "testimonials"), limit(3));
    onSnapshot(qTestimonials, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
    });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-br from-white via-blue-50 to-white overflow-hidden">
        <div className="container relative">
          <motion.div className="max-w-3xl" initial="hidden" animate="visible" variants={containerVariants}>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-[#0F172A] mb-6 leading-tight">
              {content.heroTitle}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-8 max-w-2xl leading-relaxed">
              {content.heroSubtitle}
            </motion.p>
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact">
                <Button className="btn-primary text-lg px-8 py-6">Get Started Now</Button>
              </Link>
              <Link href="/services">
                <Button variant="outline" className="text-lg px-8 py-6 border-2">View Our Services</Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">{content.servicesTitle}</h2>
            <div className="w-20 h-1 bg-[#0891B2] mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <motion.div key={service.id} className="p-8 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#0891B2]/10 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="w-6 h-6 text-[#0891B2]" />
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-16 text-[#0F172A]">What Our Clients Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.id} className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-700 mb-6 italic">"{t.content}"</p>
                <div>
                  <p className="font-bold text-[#0F172A]">{t.name}</p>
                  <p className="text-sm text-gray-500">{t.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <AiAssistant />
    </div>
  );
}
