import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, addDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { containerVariants, itemVariants } from "@/lib/animations";

interface PageContent {
  contactEmail: string;
  contactPhone: string;
  address: string;
}

const DEFAULT_CONTENT: PageContent = {
  contactEmail: "sales@outsourcedge.com",
  contactPhone: "+1 (555) 123-4567",
  address: "123 Business Ave, New York, NY 10001",
};

export default function Contact() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, "site_content", "main");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setContent({ ...DEFAULT_CONTENT, ...docSnap.data() as PageContent });
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, service: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, "contacts"), {
        ...formData,
        timestamp: new Date(),
      });
      toast.success("Message sent successfully!");
      setFormData({ name: "", company: "", email: "", phone: "", service: "", message: "" });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Skip navigation */}
      <a
        href="#contact-form"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded-lg focus:font-semibold"
      >
        Skip to contact form
      </a>

      {/* Hero */}
      <section aria-label="Contact page hero" className="pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-br from-white via-blue-50 to-white">
        <div className="container">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.h1 variants={itemVariants} className="text-5xl md:text-6xl font-bold text-[#0F172A] mb-6">
              Get in Touch
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-8">
              Have questions or ready to start a project? We're here to help.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Contact Form and Info */}
      <section aria-labelledby="contact-info-heading" className="py-20 md:py-32 bg-gray-50" id="main-content">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 id="contact-info-heading" className="text-4xl font-bold text-[#0F172A] mb-6">
                Contact Information
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Reach out to us through any of the following channels.
              </p>

              <address className="not-italic space-y-6">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-[#0891B2] flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#0F172A]">Email Us</h3>
                    <a
                      href={`mailto:${content.contactEmail}`}
                      className="text-gray-600 hover:text-[#0891B2] transition-colors underline underline-offset-2"
                    >
                      {content.contactEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-[#0891B2] flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#0F172A]">Call Us</h3>
                    <a
                      href={`tel:${content.contactPhone.replace(/\D/g, "")}`}
                      className="text-gray-600 hover:text-[#0891B2] transition-colors underline underline-offset-2"
                    >
                      {content.contactPhone}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-[#0891B2] flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#0F172A]">Our Office</h3>
                    <p className="text-gray-600">{content.address}</p>
                  </div>
                </div>
              </address>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Send Us a Message</h2>

              <form
                onSubmit={handleSubmit}
                className="space-y-6 bg-white p-8 rounded-xl shadow-lg"
                id="contact-form"
                aria-label="Contact form"
                noValidate
              >
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span aria-hidden="true" className="text-red-500">*</span>
                    <span className="sr-only">(required)</span>
                  </Label>
                  <Input
                    type="text"
                    id="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    aria-required="true"
                  />
                </div>

                <div>
                  <Label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company <span className="text-gray-400 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    type="text"
                    id="company"
                    placeholder="Your Company"
                    value={formData.company}
                    onChange={handleChange}
                    autoComplete="organization"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span aria-hidden="true" className="text-red-500">*</span>
                    <span className="sr-only">(required)</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    aria-required="true"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </Label>
                  <Input
                    type="tel"
                    id="phone"
                    placeholder="Your Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <Label htmlFor="service-select" className="block text-sm font-medium text-gray-700 mb-1">
                    Service of Interest
                  </Label>
                  <Select value={formData.service} onValueChange={handleSelectChange} name="service">
                    <SelectTrigger className="w-full" id="service-select" aria-label="Select a service of interest">
                      <SelectValue placeholder="Select Service of Interest" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dedicated Growth Partners">Dedicated Growth Partners</SelectItem>
                      <SelectItem value="Property Management Support">Property Management Support</SelectItem>
                      <SelectItem value="Virtual Staffing">Virtual Staffing</SelectItem>
                      <SelectItem value="Customer Service Support">Customer Service Support</SelectItem>
                      <SelectItem value="Administrative Support">Administrative Support</SelectItem>
                      <SelectItem value="Business Operations">Business Operations</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span aria-hidden="true" className="text-red-500">*</span>
                    <span className="sr-only">(required)</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your project or questions"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    aria-required="true"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0891B2] hover:bg-[#0891B2]/90 text-white py-3 rounded-lg flex items-center justify-center gap-2"
                  disabled={loading}
                  aria-label={loading ? "Sending your message…" : "Send message"}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" aria-hidden="true" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" aria-hidden="true" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section aria-labelledby="contact-cta-heading" className="py-20 md:py-32 bg-gradient-to-r from-[#0891B2] to-[#059669]">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 id="contact-cta-heading" className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Operations?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Let's discuss how OutsourcEdge can help your business scale and thrive.
            </p>
            <Link
              href="/contact"
              className="inline-block bg-white text-[#0891B2] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#0891B2]"
              aria-label="Get in touch with OutsourcEdge"
            >
              Get in Touch
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
