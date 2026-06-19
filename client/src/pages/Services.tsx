import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Users, Shield, TrendingUp, Globe, Clock, Mail, FileText } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { containerVariants, fastItemVariants } from "@/lib/animations";

interface Service {
  id: string;
  title: string;
  description: string;
  icon?: string;
  order?: number;
}

const ServiceIcon = ({ name, className }: { name?: string; className?: string }) => {
  const icons: Record<string, any> = { Zap, Users, Shield, TrendingUp, Globe, Clock, Mail, FileText };
  const IconComponent = name && icons[name] ? icons[name] : Zap;
  return <IconComponent className={className} aria-hidden="true" />;
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 5000);
    if (!db) { setIsLoading(false); return; }

    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Service[]);
      setIsLoading(false);
      clearTimeout(timeout);
    }, (error) => {
      console.error("Error fetching services:", error);
      setIsLoading(false);
      clearTimeout(timeout);
    });

    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Skip nav */}
      <a
        href="#services-list"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded-lg focus:font-semibold"
      >
        Skip to services
      </a>

      {/* Hero */}
      <section aria-label="Services hero" className="pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-br from-white via-blue-50 to-white">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6">Our Services</h1>
            <p className="text-xl text-gray-600 mb-8">
              Comprehensive outsourcing solutions tailored to your business needs and growth objectives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section aria-labelledby="services-heading" className="py-20 md:py-32 bg-white" id="main-content">
        <div className="container" id="services-list">
          <h2 id="services-heading" className="sr-only">All Services</h2>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20" role="status" aria-label="Loading services">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0891B2] mb-4" aria-hidden="true" />
              <p className="text-gray-500">Loading our services…</p>
            </div>
          )}

          {!isLoading && services.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300" role="status">
              <p className="text-gray-500 text-lg">No services listed yet. Add some in the Service Manager!</p>
            </div>
          )}

          {!isLoading && services.length > 0 && (
            <motion.ul
              className="grid grid-cols-1 md:grid-cols-2 gap-12 list-none"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true }}
              aria-label="Available services"
            >
              {services.map((service) => (
                <motion.li
                  key={service.id}
                  variants={fastItemVariants}
                  className="p-8 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#0891B2] hover:shadow-lg transition-all duration-300 group"
                >
                  <div
                    className="w-14 h-14 bg-gradient-to-br from-[#0891B2] to-[#059669] text-white rounded-lg flex items-center justify-center mb-6 shadow-lg shadow-[#0891B2]/20 group-hover:scale-110 transition-transform"
                    aria-hidden="true"
                  >
                    <ServiceIcon name={service.icon} className="w-7 h-7" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0F172A] mb-4">{service.title}</h3>
                  <p className="text-gray-600 text-lg mb-6 leading-relaxed">{service.description}</p>
                  <Link href="/contact">
                    <a
                      className="text-[#0891B2] font-bold flex items-center gap-2 hover:gap-3 transition-all focus:outline-none focus:underline"
                      aria-label={`Get started with ${service.title}`}
                    >
                      Get Started <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </a>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
