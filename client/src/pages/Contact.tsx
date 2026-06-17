import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { collection, addDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

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

  // ... (containerVariants, itemVariants, handleSubmit remain same)

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* Hero Section and other parts now use content.contactEmail, content.contactPhone, content.address */}
      {/* ... (refer to full code block in my previous thought for the rest) */}
      <Footer />
    </div>
  );
}
