import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Services() {
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

  const services = [
    {
      title: "Dedicated Growth Partners",
      description: "Strategic teams focused on scaling your business operations and driving sustainable growth.",
      benefits: [
        "Dedicated account managers",
        "Strategic planning and execution",
        "Performance metrics and reporting",
        "Continuous optimization",
      ],
    },
    {
      title: "Property Management Support",
      description: "Expert assistance with tenant relations, maintenance coordination, and compliance management.",
      benefits: [
        "Tenant communication",
        "Maintenance coordination",
        "Lease management",
        "Compliance assistance",
      ],
    },
    {
      title: "Virtual Staffing",
      description: "Access skilled professionals for administrative, technical, and specialized roles.",
      benefits: [
        "Pre-vetted professionals",
        "Flexible staffing solutions",
        "Quick onboarding",
        "Quality assurance",
      ],
    },
    {
      title: "Customer Service Support",
      description: "24/7 support teams delivering exceptional customer experiences across all channels.",
      benefits: [
        "Multi-channel support",
        "24/7 availability",
        "Professional training",
        "Quality monitoring",
      ],
    },
    {
      title: "Administrative Support",
      description: "Handle day-to-day operations while you focus on strategic growth initiatives.",
      benefits: [
        "Email management",
        "Scheduling and coordination",
        "Data entry and processing",
        "Document management",
      ],
    },
    {
      title: "Business Operations",
      description: "End-to-end support for streamlined, efficient operations across your organization.",
      benefits: [
        "Process optimization",
        "Workflow automation",
        "Systems integration",
        "Performance tracking",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-br from-white via-blue-50 to-white">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6"
            >
              Our Services
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-8"
            >
              Comprehensive outsourcing solutions tailored to your business needs and growth objectives.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-12"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {services.map((service, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#0891B2] hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#0891B2] to-[#059669] rounded-lg mb-6" />
                <h3 className="text-2xl font-bold text-[#0F172A] mb-4">{service.title}</h3>
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <div className="space-y-3 mb-6">
                  {service.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#059669] mt-1 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>

                <a href="#" className="text-[#0891B2] font-semibold hover:gap-2 flex items-center gap-1 transition-all">
                  Learn More <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Our Process</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We follow a proven methodology to ensure seamless integration and maximum impact.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {[
              {
                step: "1",
                title: "Discovery",
                description: "We conduct a thorough assessment of your business needs, goals, and current operations.",
              },
              {
                step: "2",
                title: "Planning",
                description: "We develop a customized outsourcing strategy tailored to your specific requirements.",
              },
              {
                step: "3",
                title: "Implementation",
                description: "Our team seamlessly integrates with your operations and begins delivering results.",
              },
              {
                step: "4",
                title: "Optimization",
                description: "We continuously monitor, measure, and optimize performance for maximum ROI.",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="relative p-8 bg-white rounded-xl border border-gray-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#0891B2] to-[#059669] text-white rounded-full flex items-center justify-center font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Key Benefits</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              What you gain when you partner with OutsourcEdge.
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
                title: "Cost Reduction",
                description: "Reduce operational costs by up to 40% while maintaining or improving service quality.",
              },
              {
                title: "Increased Efficiency",
                description: "Streamline operations and focus your internal team on high-value strategic initiatives.",
              },
              {
                title: "Scalability",
                description: "Scale your operations up or down quickly without the overhead of hiring and training.",
              },
              {
                title: "24/7 Support",
                description: "Round-the-clock operations ensure your business never misses a beat.",
              },
              {
                title: "Expert Talent",
                description: "Access to pre-vetted, skilled professionals with industry-specific expertise.",
              },
              {
                title: "Quality Assurance",
                description: "Rigorous quality monitoring and continuous improvement processes ensure excellence.",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#0891B2] transition-all"
              >
                <h3 className="text-xl font-bold text-[#0F172A] mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Frequently Asked Questions</h2>
          </motion.div>

          <motion.div
            className="max-w-2xl mx-auto space-y-6"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {[
              {
                q: "How quickly can we get started?",
                a: "Most clients are onboarded within 5-10 business days. We have a streamlined process to ensure quick integration without compromising quality.",
              },
              {
                q: "What industries do you serve?",
                a: "We serve property management, real estate, tech startups, e-commerce, and various other industries. Our expertise spans multiple sectors.",
              },
              {
                q: "Can you scale services as we grow?",
                a: "Absolutely. Our services are designed to scale with your business. Whether you need to expand or adjust services, we can accommodate your needs.",
              },
              {
                q: "What about data security and confidentiality?",
                a: "We maintain strict security protocols and confidentiality agreements. All data is encrypted and handled according to industry standards.",
              },
              {
                q: "How do you measure success?",
                a: "We establish clear KPIs and metrics upfront. Regular reporting and performance reviews ensure transparency and accountability.",
              },
              {
                q: "What if we need to adjust our service agreement?",
                a: "We're flexible and work with you to adjust services based on your evolving needs. Communication and partnership are key.",
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 bg-white rounded-lg border border-gray-200"
              >
                <h3 className="text-lg font-bold text-[#0F172A] mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-[#0891B2] to-[#059669]">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Let's discuss which services are right for your business.
            </p>
            <Link href="/contact">
              <a className="inline-block bg-white text-[#0891B2] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition">
                Schedule a Consultation
              </a>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
