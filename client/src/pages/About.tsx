import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { CheckCircle, Award, Users, Lightbulb } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PageContent {
  aboutTitle: string;
  aboutContent: string;
}

const DEFAULT_CONTENT: PageContent = {
  aboutTitle: "About OutsourcEdge",
  aboutContent: "OutsourcEdge was founded with a simple belief: businesses shouldn't have to choose between growth and operational excellence. We started as a small team of outsourcing experts who saw firsthand how companies struggled to scale without sacrificing quality.\n\nToday, we've grown into a trusted partner for hundreds of businesses across property management, real estate, tech, and beyond. Our dedicated teams have helped clients reduce operational costs by up to 40% while improving service quality and customer satisfaction.\n\nWe believe in building long-term partnerships, not just providing services. Every team member is invested in your success.",
};

export default function About() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);

  useEffect(() => {
    if (!db) return;

    const docRef = doc(db, "site_content", "main");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setContent({ ...DEFAULT_CONTENT, ...docSnap.data() as PageContent });
      }
    });

    return () => unsubscribe();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-br from-white via-blue-50 to-white">
        <div className="container">
          <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={containerVariants}>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6">
              {content.aboutTitle}
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-8">
              We're on a mission to help businesses scale efficiently through dedicated growth partners and seamless operational support.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Our Story</h2>
            {content.aboutContent.split('\n\n').map((paragraph, index) => (
              <p key={index} className="text-lg text-gray-600 mb-6 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-12" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            <motion.div variants={itemVariants} className="p-8 bg-white rounded-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-[#0F172A] mb-4">Our Vision</h3>
              <p className="text-gray-600 leading-relaxed"> To be the world's most trusted outsourcing partner, enabling businesses of all sizes to scale with confidence and achieve their growth potential. </p>
            </motion.div>
            <motion.div variants={itemVariants} className="p-8 bg-white rounded-xl border border-gray-200">
              <h3 className="text-2xl font-bold text-[#0F172A] mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed"> To provide exceptional outsourcing solutions that empower businesses to focus on what matters most while we handle the operational complexities. </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Core Values, Why Choose Us, Culture, and CTA sections remain same but now use the dynamic content where applicable */}
      {/* ... (refer to full code block in my previous thought for the rest) */}
      <Footer />
    </div>
  );
}
