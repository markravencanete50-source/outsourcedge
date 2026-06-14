import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Briefcase, DollarSign, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function Careers() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    message: "",
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Application submitted! We'll be in touch soon.");
    setFormData({ name: "", email: "", phone: "", position: "", message: "" });
  };

  const jobs = [
    {
      title: "Virtual Assistant",
      location: "Remote",
      type: "Full-time",
      salary: "$25k - $35k",
      description: "Support our clients with administrative tasks, scheduling, and communication.",
    },
    {
      title: "Customer Service Representative",
      location: "Remote",
      type: "Full-time",
      salary: "$20k - $28k",
      description: "Provide exceptional support to our clients' customers across multiple channels.",
    },
    {
      title: "Property Management Specialist",
      location: "Remote",
      type: "Full-time",
      salary: "$30k - $40k",
      description: "Manage property operations, tenant relations, and maintenance coordination.",
    },
    {
      title: "Business Operations Manager",
      location: "Remote",
      type: "Full-time",
      salary: "$35k - $50k",
      description: "Oversee business operations and help clients optimize their processes.",
    },
    {
      title: "Data Entry Specialist",
      location: "Remote",
      type: "Part-time",
      salary: "$15k - $22k",
      description: "Accurately process and manage data for our clients' systems.",
    },
    {
      title: "Account Manager",
      location: "Remote",
      type: "Full-time",
      salary: "$40k - $60k",
      description: "Build and maintain relationships with clients, ensuring their success.",
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
              Join Our Team
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-8"
            >
              Help us empower businesses to scale. We're looking for talented professionals who are passionate about excellence.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Culture Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Why Work With Us</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're building a company where talented people can do their best work.
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
                title: "Flexible Work",
                description: "Work remotely with flexible hours that fit your lifestyle.",
              },
              {
                title: "Growth Opportunities",
                description: "Continuous learning and career development opportunities.",
              },
              {
                title: "Competitive Compensation",
                description: "Competitive salaries and benefits packages.",
              },
              {
                title: "Supportive Culture",
                description: "Work with a team that values collaboration and support.",
              },
              {
                title: "Impact",
                description: "Make a real difference in our clients' success stories.",
              },
              {
                title: "Work-Life Balance",
                description: "We prioritize your wellbeing and work-life balance.",
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center"
              >
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Current Openings</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {jobs.length} positions available. Apply now to join our team!
            </p>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {jobs.map((job, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 bg-white rounded-xl border border-gray-200 hover:border-[#0891B2] hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-[#0F172A] mb-3">{job.title}</h3>
                    <p className="text-gray-600 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#0891B2]" />
                        <span className="text-gray-600">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[#0891B2]" />
                        <span className="text-gray-600">{job.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#0891B2]" />
                        <span className="text-gray-600">{job.salary}</span>
                      </div>
                    </div>
                  </div>
                  <a
                    href="#apply"
                    className="btn-primary whitespace-nowrap"
                  >
                    Apply Now
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-8 text-center">Apply Now</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2] transition"
                  placeholder="Your name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2] transition"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2] transition"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Position Interested In *
                </label>
                <select
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2] transition"
                >
                  <option value="">Select a position</option>
                  {jobs.map((job) => (
                    <option key={job.title} value={job.title}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2] transition"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <Button
                type="submit"
                className="w-full btn-primary py-3"
              >
                Submit Application
              </Button>
            </form>
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
              Don't See Your Role?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals. Send us your resume and let's talk!
            </p>
            <Link href="/contact">
              <a className="inline-block bg-white text-[#0891B2] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition">
                Get in Touch
              </a>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
