import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Users, Zap, TrendingUp, Globe, Award } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
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
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-br from-white via-blue-50 to-white overflow-hidden">
        <div className="container">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-block px-4 py-2 bg-blue-100 text-[#0891B2] rounded-full text-sm font-semibold">
                ✨ Scale Without the Complexity
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold text-[#0F172A] mb-6 leading-tight"
            >
              Your Growth Team,{" "}
              <span className="bg-gradient-to-r from-[#0891B2] to-[#059669] bg-clip-text text-transparent">
                Ready Now
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed"
            >
              Dedicated growth partners who understand your business. Scale faster with expert support in property management, virtual staffing, and business operations.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link href="/contact">
                <a className="btn-primary flex items-center gap-2">
                  Start Your Growth Journey
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Link>
              <Link href="/services">
                <a className="btn-outline">
                  Explore Services
                </a>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Illustration Area */}
          <motion.div
            variants={itemVariants}
            className="mt-16 md:mt-24 relative h-96 md:h-[500px] bg-gradient-to-br from-[#0891B2]/10 to-[#059669]/10 rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-full flex items-center justify-center">
                <div className="grid grid-cols-3 gap-8 opacity-30">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="w-20 h-20 bg-[#0891B2] rounded-lg transform rotate-45"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="relative z-10 text-center">
              <Globe className="w-24 h-24 text-[#0891B2] mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Global Outsourcing Solutions</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="accent-line mx-auto mb-6" />
            <h2 className="section-title">Why Choose OutsourcEdge</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We combine expertise, reliability, and innovation to deliver exceptional results for your business.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {[
              {
                icon: Users,
                title: "Expert Teams",
                description: "Dedicated professionals with industry expertise ready to support your growth.",
              },
              {
                icon: Zap,
                title: "Fast Onboarding",
                description: "Get started in days, not weeks. Our streamlined process ensures quick integration.",
              },
              {
                icon: TrendingUp,
                title: "Proven Results",
                description: "Track record of helping businesses scale operations and increase efficiency.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#0891B2] hover:shadow-lg transition-all duration-300"
              >
                <item.icon className="w-12 h-12 text-[#0891B2] mb-4" />
                <h3 className="text-xl font-semibold text-[#0F172A] mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="accent-line mx-auto mb-6" />
            <h2 className="section-title">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive outsourcing solutions tailored to your business needs.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {[
              {
                title: "Dedicated Growth Partners",
                description: "Strategic teams focused on scaling your business operations.",
              },
              {
                title: "Property Management Support",
                description: "Expert assistance with tenant relations, maintenance, and compliance.",
              },
              {
                title: "Virtual Staffing",
                description: "Access skilled professionals for administrative and specialized roles.",
              },
              {
                title: "Customer Service",
                description: "24/7 support teams delivering exceptional customer experiences.",
              },
              {
                title: "Administrative Support",
                description: "Handle day-to-day operations while you focus on growth.",
              },
              {
                title: "Business Operations",
                description: "End-to-end support for streamlined, efficient operations.",
              },
            ].map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 bg-white rounded-xl border border-gray-200 hover:border-[#0891B2] shadow-sm hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#0891B2] to-[#059669] rounded-lg mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-[#0F172A] mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>
                <a href="#" className="text-[#0891B2] font-semibold hover:gap-2 flex items-center gap-1 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/services">
              <a className="btn-primary inline-flex items-center gap-2">
                View All Services
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How We Work */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="accent-line mx-auto mb-6" />
            <h2 className="section-title">How We Work</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our proven process ensures seamless integration and immediate impact.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {[
              { step: "01", title: "Consultation", description: "Understand your unique needs and goals" },
              { step: "02", title: "Strategy", description: "Develop a customized outsourcing plan" },
              { step: "03", title: "Onboarding", description: "Integrate our team with your operations" },
              { step: "04", title: "Growth", description: "Scale and optimize continuously" },
            ].map((item, index) => (
              <motion.div key={index} variants={itemVariants} className="relative">
                <div className="bg-gradient-to-br from-[#0891B2] to-[#059669] text-white rounded-full w-16 h-16 flex items-center justify-center font-bold text-2xl mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
                {index < 3 && (
                  <div className="hidden md:block absolute top-8 -right-3 text-[#0891B2] text-3xl">→</div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="accent-line mx-auto mb-6" />
            <h2 className="section-title">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real results from businesses like yours.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {[
              {
                name: "Sarah Johnson",
                company: "Property Management Co.",
                text: "OutsourcEdge transformed our operations. We reduced costs by 40% while improving service quality.",
              },
              {
                name: "Michael Chen",
                company: "Tech Startup",
                text: "The team was onboarded in just 5 days. Their support has been instrumental in our growth.",
              },
              {
                name: "Emma Rodriguez",
                company: "Real Estate Investor",
                text: "Professional, reliable, and truly dedicated to our success. Highly recommended!",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-[#0F172A]">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Recruitment CTA */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-[#0891B2] to-[#059669]">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Join Our Growing Team
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're hiring talented professionals to join our mission of helping businesses scale.
            </p>
            <Link href="/careers">
              <a className="inline-flex items-center gap-2 bg-white text-[#0891B2] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition">
                View Open Positions
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="accent-line mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-6">
              Ready to Scale Your Business?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Let's discuss how OutsourcEdge can help you achieve your growth goals.
            </p>
            <Link href="/contact">
              <a className="btn-primary inline-flex items-center gap-2">
                Get in Touch
                <ArrowRight className="w-5 h-5" />
              </a>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
