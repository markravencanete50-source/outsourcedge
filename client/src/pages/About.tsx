import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { CheckCircle, Award, Users, Lightbulb, Target, TrendingUp, Zap, Globe } from "lucide-react";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

interface PageContent {
  aboutTitle: string;
  aboutContent: string;
}

const DEFAULT_CONTENT: PageContent = {
  aboutTitle: "About OutsourcEdge",
  aboutContent: "OutsourcEdge helps businesses streamline operations and accelerate growth through world-class outsourcing solutions.",
};

const coreValues = [
  { icon: Award, title: "Integrity", description: "We operate with honesty and transparency." },
  { icon: Users, title: "Accountability", description: "We take ownership of results." },
  { icon: Lightbulb, title: "Client Success", description: "Your success is our success." },
  { icon: CheckCircle, title: "Continuous Improvement", description: "We constantly refine processes." },
  { icon: Zap, title: "Innovation", description: "We embrace new technologies." },
  { icon: Target, title: "Operational Excellence", description: "We maintain the highest standards." },
];

export default function About() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);

  useEffect(() => {
    if (!db) return;
    const docRef = doc(db, "site_content", "main");
    onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) setContent({ ...DEFAULT_CONTENT, ...docSnap.data() as PageContent });
    });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <section className="pt-32 pb-20 md:pt-48 md:pb-32 bg-slate-50">
        <div className="container text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">{content.aboutTitle}</h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">Dedicated growth partners helping you scale efficiently.</p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold mb-8">Our Mission</h2>
          <p className="text-lg text-slate-700 leading-relaxed mb-8">{content.aboutContent}</p>
        </div>
      </section>

      <section className="py-20 bg-slate-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center mb-16">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {coreValues.map((value, i) => (
              <div key={i} className="p-8 bg-white rounded-2xl border border-slate-200">
                <value.icon className="w-10 h-10 text-cyan-600 mb-4" />
                <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                <p className="text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
