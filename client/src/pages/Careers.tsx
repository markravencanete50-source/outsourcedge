import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Briefcase, ArrowRight, Clock, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Job {
  id: string;
  title: string;
  category: string;
  type: string;
  location: string;
  description: string;
  status: string;
  hiringTimeline?: string;
}

export default function Careers() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'jobs'),
      where('status', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const jobsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Job[];
      setJobs(jobsData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      {/* ... Hero Section remains the same ... */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-12">Open Positions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobs.map((job) => (
              <div key={job.id} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-[#0891B2]/10 p-3 rounded-xl">
                    <Briefcase className="w-6 h-6 text-[#0891B2]" />
                  </div>
                  <span className="text-sm font-medium text-[#0891B2] bg-[#0891B2]/5 px-3 py-1 rounded-full">
                    {job.type || 'Full-time'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0F172A] mb-2 group-hover:text-[#0891B2] transition-colors">
                  {job.title}
                </h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-500 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    {job.location || 'Remote'}
                  </div>
                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    {job.category}
                  </div>
                  {job.hiringTimeline && (
                    <div className="flex items-center text-[#0891B2] text-sm font-medium">
                      <Calendar className="w-4 h-4 mr-2" />
                      Hiring: {job.hiringTimeline}
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-8 line-clamp-3 flex-grow">
                  {job.description}
                </p>
                <Link href="/contact">
                  <a className="inline-flex items-center text-[#0891B2] font-semibold hover:gap-2 transition-all">
                    Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
