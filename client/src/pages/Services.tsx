import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Zap, TrendingUp, Users, Briefcase, Shield, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
      setIsLoading(false);
    });

    return () => unsubscribe();
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
              <span className="text-sm font-bold text-cyan-900">Strategic Solutions</span>
            </motion.div>

            <motion.h1 variants={fadeUpVariant} className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
              Our Services
            </motion.h1>

            <motion.p variants={fadeUpVariant} className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl leading-relaxed">
              Strategic outsourcing solutions designed to streamline operations, reduce costs, and accelerate your business growth.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-20 md:py-32 bg-slate-50">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true, margin: "-100px" }}
            >
              {services.map((service) => (
                <motion.div
                  key={service.id}
                  variants={scaleVariant}
                  className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-cyan-300 hover:shadow-xl transition-all cursor-pointer"
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="w-14 h-14 bg-cyan-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-cyan-200 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <Zap className="w-7 h-7 text-cyan-600" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                  <p className="text-slate-600 text-lg mb-6 leading-relaxed line-clamp-3">{service.description}</p>
                  <Link href={`/service/${service.id}`}>
                    <a className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-50 border-2 border-cyan-300 text-cyan-600 font-bold rounded-xl hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all group-hover:translate-x-1">
                      View Details <ArrowRight className="w-5 h-5" />
                    </a>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
