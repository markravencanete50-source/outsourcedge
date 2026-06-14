import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // db is any type

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Save to Firebase Firestore
      if (!db) {
        toast.error("Firebase is not initialized. Please check your configuration.");
        setLoading(false);
        return;
      }
      await addDoc(collection(db, "contacts"), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        service: formData.service,
        message: formData.message,
        createdAt: new Date(),
        status: "new",
      });

      toast.success("Message sent! We'll be in touch within 24 hours.");
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              Get in Touch
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl text-gray-600 mb-8"
            >
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            initial="hidden"
            whileInView="visible"
            variants={containerVariants}
            viewport={{ once: true }}
          >
            {[
              {
                icon: Mail,
                title: "Email",
                content: "sales@outsourcedge.com",
                subtext: "For business inquiries",
              },
              {
                icon: Phone,
                title: "Phone",
                content: "+1 (555) 123-4567",
                subtext: "Mon-Fri, 9am-6pm EST",
              },
              {
                icon: MapPin,
                title: "Address",
                content: "123 Business Ave",
                subtext: "New York, NY 10001",
              },
              {
                icon: Clock,
                title: "Hours",
                content: "9:00 AM - 6:00 PM",
                subtext: "Monday - Friday",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-6 bg-gray-50 rounded-lg border border-gray-200 text-center hover:border-[#0891B2] transition-all"
              >
                <item.icon className="w-10 h-10 text-[#0891B2] mx-auto mb-4" />
                <h3 className="text-lg font-bold text-[#0F172A] mb-2">{item.title}</h3>
                <p className="font-semibold text-gray-900 mb-1">{item.content}</p>
                <p className="text-sm text-gray-600">{item.subtext}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-8 text-center">Send us a Message</h2>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border border-gray-200 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2] transition"
                    placeholder="Your company"
                  />
                </div>
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
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2] transition"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Service Interested In
                </label>
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2] transition"
                >
                  <option value="">Select a service</option>
                  <option value="dedicated-growth">Dedicated Growth Partners</option>
                  <option value="property-management">Property Management Support</option>
                  <option value="virtual-staffing">Virtual Staffing</option>
                  <option value="customer-service">Customer Service Support</option>
                  <option value="admin-support">Administrative Support</option>
                  <option value="business-operations">Business Operations</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0F172A] mb-2">
                  Message *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0891B2] transition"
                  placeholder="Tell us about your needs..."
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3"
              >
                {loading ? "Sending..." : "Send Message"}
              </Button>

              <p className="text-sm text-gray-600 text-center">
                We'll get back to you within 24 hours during business hours.
              </p>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 md:py-32 bg-white">
        <div className="container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0F172A] mb-4">Visit Us</h2>
            <p className="text-lg text-gray-600">
              Our office is located in the heart of New York City.
            </p>
          </motion.div>

          <motion.div
            className="rounded-xl overflow-hidden border border-gray-200 shadow-lg h-96"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890!2d-74.0060!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjEiTiA3NMKwMDAnMjEuNiJX!5e0!3m2!1sen!2sus!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
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
            <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Common Questions</h2>
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
                q: "What's the best way to contact you?",
                a: "You can reach us via email at sales@outsourcedge.com, call us at +1 (555) 123-4567, or fill out the contact form above. We typically respond within 24 hours.",
              },
              {
                q: "Do you offer free consultations?",
                a: "Yes! We offer a free initial consultation to discuss your business needs and how we can help. Contact us to schedule one.",
              },
              {
                q: "What are your business hours?",
                a: "Our team is available Monday through Friday, 9:00 AM to 6:00 PM EST. For urgent matters, please mention that in your message.",
              },
              {
                q: "How long does it take to hear back?",
                a: "We aim to respond to all inquiries within 24 business hours. For urgent matters, we may respond faster.",
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

      <Footer />
    </div>
  );
}
