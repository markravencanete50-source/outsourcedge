import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, Clock, Calendar, ArrowLeft, Send, Upload, Video } from 'lucide-react';
import { toast } from 'sonner';

interface Job {
  id: string;
  title: string;
  category: string;
  type: string;
  location: string;
  description: string;
  hiringTimeline?: string;
}

export default function JobDetail() {
  const [, params] = useRoute('/job/:id');
  const jobId = params?.id;
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    portfolioUrl: '',
    experience: '',
    coverLetter: '',
    resumeUrl: '',
    videoIntroUrl: ''
  });

  useEffect(() => {
    async function fetchJob() {
      if (!jobId || !db) return;
      try {
        const docRef = doc(db, 'jobs', jobId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() } as Job);
        } else {
          toast.error('Job not found');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
        toast.error('Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    }
    fetchJob();
  }, [jobId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !job) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        jobTitle: job.title,
        ...formData,
        status: 'new',
        date: serverTimestamp()
      });
      toast.success('Application submitted successfully!');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        portfolioUrl: '',
        experience: '',
        coverLetter: '',
        resumeUrl: '',
        videoIntroUrl: ''
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0891B2]"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Job not found</h2>
        <Link href="/careers">
          <a className="text-[#0891B2] hover:underline">Back to Careers</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/careers">
            <a className="inline-flex items-center text-slate-500 hover:text-[#0891B2] mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Careers
            </a>
          </Link>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-8">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">{job.title}</h1>
                <div className="flex flex-wrap gap-4 text-slate-500">
                  <div className="flex items-center bg-slate-50 px-3 py-1 rounded-full text-sm">
                    <Briefcase className="w-4 h-4 mr-2 text-[#0891B2]" />
                    {job.type}
                  </div>
                  <div className="flex items-center bg-slate-50 px-3 py-1 rounded-full text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-[#0891B2]" />
                    {job.location}
                  </div>
                  <div className="flex items-center bg-slate-50 px-3 py-1 rounded-full text-sm">
                    <Clock className="w-4 h-4 mr-2 text-[#0891B2]" />
                    {job.category}
                  </div>
                  {job.hiringTimeline && (
                    <div className="flex items-center bg-[#0891B2]/10 px-3 py-1 rounded-full text-sm text-[#0891B2] font-medium">
                      <Calendar className="w-4 h-4 mr-2" />
                      Hiring: {job.hiringTimeline}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-12">
              <h2 className="text-xl font-bold mb-4">Job Description</h2>
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </div>

            <hr className="border-slate-100 mb-12" />

            <section id="apply">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Apply for this position</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name *</label>
                    <input
                      required
                      type="text"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0891B2] focus:border-transparent transition-all"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address *</label>
                    <input
                      required
                      type="email"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0891B2] focus:border-transparent transition-all"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Contact Number *</label>
                    <input
                      required
                      type="tel"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0891B2] focus:border-transparent transition-all"
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Portfolio Link (Optional)</label>
                    <input
                      type="url"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0891B2] focus:border-transparent transition-all"
                      placeholder="https://behance.net/johndoe"
                      value={formData.portfolioUrl}
                      onChange={e => setFormData({...formData, portfolioUrl: e.target.value} )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Relevant Experience *</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0891B2] focus:border-transparent transition-all"
                    placeholder="Briefly describe your experience related to this role..."
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Cover Letter *</label>
                  <textarea
                    required
                    rows={5}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0891B2] focus:border-transparent transition-all"
                    placeholder="Why are you a great fit for OutsourceEdge?"
                    value={formData.coverLetter}
                    onChange={e => setFormData({...formData, coverLetter: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center">
                      <Upload className="w-4 h-4 mr-2 text-[#0891B2]" />
                      Resume URL (Google Drive/Dropbox) *
                    </label>
                    <input
                      required
                      type="url"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0891B2] focus:border-transparent transition-all"
                      placeholder="Link to your resume..."
                      value={formData.resumeUrl}
                      onChange={e => setFormData({...formData, resumeUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center">
                      <Video className="w-4 h-4 mr-2 text-[#0891B2]" />
                      Short Video Intro Link (Optional)
                    </label>
                    <input
                      type="url"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0891B2] focus:border-transparent transition-all"
                      placeholder="Loom or Drive link (30s - 1min)"
                      value={formData.videoIntroUrl}
                      onChange={e => setFormData({...formData, videoIntroUrl: e.target.value})}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#0891B2] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#0891B2]/90 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0891B2]/20"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  Submit Application
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
