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
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        service: "",
        message: "",
      });
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
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-gradient-to-br from-white via-blue-50 to-white">
        <div className="container">
          <motion.div className="max-w-3xl mx-auto text-center" initial="hidden" animate="visible" variants={containerVariants}>
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
      <section className="py-20 md:py-32 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Contact Information</h2>
              <p className="text-lg text-gray-600 mb-8"> Reach out to us through any of the following channels. </p>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Mail className="w-6 h-6 text-[#0891B2]" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#0F172A]">Email Us</h3>
                    <p className="text-gray-600">{content.contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Phone className="w-6 h-6 text-[#0891B2]" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#0F172A]">Call Us</h3>
                    <p className="text-gray-600">{content.contactPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-[#0891B2]" />
                  <div>
                    <h3 className="text-xl font-semibold text-[#0F172A]">Our Office</h3>
                    <p className="text-gray-600">{content.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
              <h2 className="text-4xl font-bold text-[#0F172A] mb-6">Send Us an Email</h2>
              <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
                <div>
                  <Label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</Label>
                  <Input type="text" id="name" placeholder="Your Name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="company" className="block text-sm font-medium text-gray-700">Company (Optional)</Label>
                  <Input type="text" id="company" placeholder="Your Company (Optional)" value={formData.company} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</Label>
                  <Input type="email" id="email" placeholder="Your Email" value={formData.email} onChange={handleChange} required />
                </div>
                <div>
                  <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</Label>
                  <Input type="tel" id="phone" placeholder="Your Phone Number (Optional)" value={formData.phone} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="service" className="block text-sm font-medium text-gray-700">Service of Interest</Label>
                  <Select value={formData.service} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full">
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
                  <Label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</Label>
                  <Textarea id="message" placeholder="Your Message" rows={5} value={formData.message} onChange={handleChange} required />
                </div>
                <Button type="submit" className="w-full bg-[#0891B2] hover:bg-[#0891B2]/90 text-white py-3 rounded-lg flex items-center justify-center gap-2" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                  Send Email
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-r from-[#0891B2] to-[#059669]">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6"> Ready to Transform Your Operations? </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto"> Let's discuss how OutsourcEdge can help your business scale and thrive. </p>
            <Link href="/contact" className="inline-block bg-white text-[#0891B2] px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition"> Get in Touch </Link>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
