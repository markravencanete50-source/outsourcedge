import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { MapPin, Briefcase, ArrowRight, Zap } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fadeUpVariant, scaleVariant, containerVariants } from "@/lib/animations";

interface Job {
  id: string;
  title: string;
  category: string;
  type: string;
  location: string;
  description: string;
  status: string;
}

export default function Careers() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "jobs"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Job[]);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Skip nav */}
      <a
        href="#jobs-list"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-600 focus:text-white focus:rounded-lg focus:font-semibold"
      >
        Skip to job listings
      </a>

      {/* HERO */}
      <section aria-label="Careers hero" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-cyan-50/30 to-white -z-10" aria-hidden="true" />

        <div className="container" id="main-content">
          <motion.div className="max-w-4xl" initial="hidden" animate="visible" variants={containerVariants}>
            <motion.div
              variants={fadeUpVariant}
              className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-cyan-50 rounded-full border border-cyan-200/50"
            >
              <Zap className="w-4 h-4 text-cyan-600" aria-hidden="true" />
              <span className="text-sm font-bold text-cyan-900">Join Our Team</span>
            </motion.div>

            <motion.h1
              variants={fadeUpVariant}
              className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight"
            >
              Become a Dedicated Growth Partner
            </motion.h1>

            <motion.p
              variants={fadeUpVariant}
              className="text-xl md:text-2xl text-slate-600 mb-8 max-w-3xl leading-relaxed"
            >
              Build your career with OutsourcEdge. We're looking for passionate professionals who want to grow with us.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* JOBS GRID */}
      <section aria-labelledby="jobs-heading" className="py-20 md:py-32 bg-slate-50" id="jobs-list">
        <div className="container">
          <h2 id="jobs-heading" className="sr-only">Open Positions</h2>

          {isLoading && (
            <div className="flex justify-center py-20" role="status" aria-label="Loading job listings">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600" aria-hidden="true" />
              <span className="sr-only">Loading…</span>
            </div>
          )}

          {!isLoading && jobs.length === 0 && (
            <div className="text-center py-20" role="status">
              <p className="text-slate-500 text-lg">No open positions at the moment. Check back soon!</p>
            </div>
          )}

          {!isLoading && jobs.length > 0 && (
            <motion.ul
              className="grid grid-cols-1 md:grid-cols-2 gap-8 list-none"
              initial="hidden"
              whileInView="visible"
              variants={containerVariants}
              viewport={{ once: true, margin: "-100px" }}
              aria-label="Open job positions"
            >
              {jobs.map((job) => (
                <motion.li
                  key={job.id}
                  variants={scaleVariant}
                  className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-cyan-300 hover:shadow-xl transition-all flex flex-col h-full"
                  whileHover={{ y: -5 }}
                >
                  <div className="flex justify-between items-start mb-6">
                    <Briefcase className="w-10 h-10 text-cyan-600" aria-hidden="true" />
                    <span className="text-sm font-bold text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">
                      {job.type}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{job.title}</h3>

                  <div className="flex items-center text-slate-600 text-sm mb-6">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" aria-hidden="true" />
                    <span>{job.location}</span>
                  </div>

                  <Link href={`/job/${job.id}`}>
                    <a
                      className="mt-auto inline-flex items-center gap-2 text-cyan-600 font-bold hover:gap-3 transition-all focus:outline-none focus:underline"
                      aria-label={`Apply now for ${job.title} position`}
                    >
                      Apply Now <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </a>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
