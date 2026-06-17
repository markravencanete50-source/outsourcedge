import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="pt-32 pb-20 bg-gray-50">
        <div className="container text-center">
          <h1 className="text-5xl font-bold text-[#0F172A] mb-6">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Expert solutions to help your business scale.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {services.map((service) => (
              <motion.div key={service.id} className="p-8 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#0891B2] transition-all">
                <div className="w-14 h-14 bg-[#0891B2] text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-[#0891B2]/20">
                  <Zap className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F172A] mb-4">{service.title}</h3>
                <p className="text-gray-600 text-lg mb-6 leading-relaxed">{service.description}</p>
                <Link href="/contact">
                  <a className="text-[#0891B2] font-bold flex items-center gap-2 hover:gap-3 transition-all">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </a>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
