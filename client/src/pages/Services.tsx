import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Clock, FileText, Globe, Home, Mail, Shield, TrendingUp, Users, Zap } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
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
  const icons: Record<string, any> = { Zap, Users, Shield, TrendingUp, Globe, Clock, Mail, FileText, Home };
  const IconComponent = name && icons[name] ? icons[name] : Home;
  return <IconComponent className={className} aria-hidden="true" />;
};

const fallbackServices: Service[] = [
  {
    id: "property-management",
    title: "Property Management Support",
    description: "Tenant coordination, maintenance follow-up, listing support, and owner reporting for landlords, realtors, and STR hosts.",
    icon: "Home",
  },
  {
    id: "virtual-assistant",
    title: "Virtual Assistant Support",
    description: "Inbox, calendar, admin, CRM, documentation, and day-to-day operations support built around your tools.",
    icon: "Users",
  },
  {
    id: "operations",
    title: "Business Operations",
    description: "Process documentation, task tracking, reporting, and repeatable workflows that keep teams moving.",
    icon: "FileText",
  },
  {
    id: "client-support",
    title: "Client Support",
    description: "Clear, professional customer communication with escalation rules, response standards, and reporting.",
    icon: "Shield",
  },
];

export default function Services() {
  const [services, setServices] = useState<Service[]>(fallbackServices);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 5000);
    if (!db) {
      setIsLoading(false);
      return;
    }

    const servicesQuery = query(collection(db, "services"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(
      servicesQuery,
      (snapshot) => {
        const liveServices = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })) as Service[];
        setServices(liveServices.length > 0 ? liveServices : fallbackServices);
        setIsLoading(false);
        clearTimeout(timeout);
      },
      (error) => {
        console.error("Error fetching services:", error);
        setIsLoading(false);
        clearTimeout(timeout);
      },
    );

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F1]">
      <Header />

      <a
        href="#services-list"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-[#1F2A44] focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Skip to services
      </a>

      <section aria-label="Services hero" className="relative overflow-hidden bg-[#1F2A44] pb-20 pt-32 text-white md:pb-32 md:pt-48">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2200&q=82')",
          }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#1F2A44]/76" aria-hidden="true" />
        <div className="container">
          <motion.div
            className="relative z-10 mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="eyebrow mb-5">Services</p>
            <h1 className="mb-6 text-5xl font-semibold text-white md:text-6xl">
              Support that feels calm, capable, and already organized.
            </h1>
            <p className="mb-8 text-xl leading-8 text-white/74">
              Outsourcing for property teams and operators who need vetted talent, clean workflows, and dependable follow-through.
            </p>
          </motion.div>
        </div>
      </section>

      <section aria-labelledby="services-heading" className="py-20 md:py-28" id="main-content">
        <div className="container" id="services-list">
          <h2 id="services-heading" className="sr-only">All Services</h2>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20" role="status" aria-label="Loading services">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-[#1F2A44]" aria-hidden="true" />
              <p className="text-[#1B1F2A]/58">Loading our services...</p>
            </div>
          )}

          {!isLoading && (
            <motion.ul
              className="grid list-none grid-cols-1 gap-6 md:grid-cols-2"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true }}
              aria-label="Available services"
            >
              {services.map((service) => (
                <motion.li key={service.id} variants={fastItemVariants} className="premium-card group p-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-lg bg-[#1F2A44] text-[#C6A75E] transition-transform group-hover:scale-105">
                    <ServiceIcon name={service.icon} className="h-7 w-7" />
                  </div>
                  <h3 className="mb-4 text-2xl font-semibold text-[#1F2A44]">{service.title}</h3>
                  <p className="mb-6 text-lg leading-relaxed text-[#1B1F2A]/66">{service.description}</p>
                  <Link href={service.id === "property-management" ? "/project-management" : "/contact"}>
                    <a
                      className="flex items-center gap-2 font-bold text-[#1F2A44] transition-all hover:gap-3 focus:outline-none focus:underline"
                      aria-label={`Learn more about ${service.title}`}
                    >
                      Learn More <ArrowRight className="h-5 w-5" aria-hidden="true" />
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
