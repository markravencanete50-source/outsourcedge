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

      {/* Core Values */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto"> These principles guide everything we do. </p>
          </motion.div>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            {[{
              icon: Award,
              title: "Excellence",
              description: "We deliver exceptional quality in everything we do.",
            }, {
              icon: Users,
              title: "Partnership",
              description: "Your success is our success. We're invested in your growth.",
            }, {
              icon: Lightbulb,
              title: "Innovation",
              description: "We continuously improve and adapt to your evolving needs.",
            }, {
              icon: CheckCircle,
              title: "Reliability",
              description: "You can count on us to deliver, every single time.",
            },].map((value, index) => (
              <motion.div key={index} variants={itemVariants} className="p-8 bg-gray-50 rounded-xl border border-gray-200 text-center hover:border-[#0891B2] transition-all">
                <value.icon className="w-12 h-12 text-[#0891B2] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#0F172A] mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Why Choose OutsourcEdge</h2>
          </motion.div>
          <motion.div className="max-w-3xl mx-auto space-y-6" initial="hidden" whileInView="visible" variants={containerVariants} viewport={{ once: true }}>
            {[{
              title: "Industry Expertise",
              description: "Years of experience across property management, real estate, tech, and more.",
            }, {
              title: "Dedicated Teams",
              description: "Your own dedicated team members who understand your business inside and out.",
            }, {
              title: "Proven Track Record",
              description: "Hundreds of satisfied clients with measurable results and ROI.",
            }, {
              title: "Scalable Solutions",
              description: "Services that grow with your business, from startups to enterprises.",
            }, {
              title: "24/7 Support",
              description: "Round-the-clock support to ensure your business never misses a beat.",
            }, {
              title: "Expert Talent",
              description: "Access to pre-vetted, skilled professionals with industry-specific expertise.",
            }, {
              title: "Quality Assurance",
              description: "Rigorous quality monitoring and continuous improvement processes ensure excellence.",
            },].map((item, index) => (
              <motion.div key={index} variants={itemVariants} className="p-6 bg-white rounded-lg border border-gray-200 flex gap-4">
                <CheckCircle className="w-6 h-6 text-[#059669] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div className="max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Our Culture</h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed"> At OutsourcEdge, we believe that great results come from great people. Our team is composed of talented professionals from diverse backgrounds who share a passion for excellence and client success. </p>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed"> We foster a culture of continuous learning, innovation, and collaboration. Our team members are empowered to take ownership, make decisions, and contribute ideas that shape our company's future. </p>
            <p className="text-lg text-gray-600 leading-relaxed"> We're committed to creating an inclusive, supportive environment where everyone can thrive and grow. </p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-[#0891B2] to-[#059669]">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6"> Ready to Partner With Us? </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"> Let's discuss how OutsourcEdge can help your business scale and thrive. </p>
            <Link href="/contact">
              <a className="inline-block bg-white text-[#0891B2] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"> Get in Touch </a>
            </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
