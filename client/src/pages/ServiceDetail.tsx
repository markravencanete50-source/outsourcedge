import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { notifySubmission } from '@/lib/notify';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Mail, Zap, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface Service {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  questions?: string[];
}

export default function ServiceDetail() {
  const [, params] = useRoute('/service/:id');
  const serviceId = params?.id;
  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    answers: {} as Record<string, string>
  });

  useEffect(() => {
    async function fetchService() {
      if (!serviceId || !db) return;
      try {
        const docRef = doc(db, 'services', serviceId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() } as Service);
        } else {
          toast.error('Service not found');
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    }
    fetchService();
  }, [serviceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !service) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'service_questionnaires'), {
        serviceId: service.id,
        serviceTitle: service.title,
        ...formData,
        status: 'new',
        createdAt: serverTimestamp()
      });
      notifySubmission('service', { serviceTitle: service.title, ...formData });
      toast.success('Your inquiry has been submitted successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        answers: {}
      });
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      toast.error('Failed to submit. Please try again or contact us via email.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerChange = (question: string, answer: string) => {
    setFormData(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [question]: answer
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1B3A4B]"></div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Service not found</h2>
        <Link href="/services">
          <a className="text-[#1B3A4B] hover:underline">Back to Services</a>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/services">
            <a className="inline-flex items-center text-slate-500 hover:text-[#1B3A4B] mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Services
            </a>
          </Link>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#1B3A4B] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#1B3A4B]/20">
                <Zap className="w-6 h-6" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{service.title}</h1>
            </div>

            <div className="prose prose-slate max-w-none mb-12">
              <p className="text-lg text-slate-600 leading-relaxed">
                {service.longDescription || service.description}
              </p>
            </div>

            <hr className="border-slate-100 mb-12" />

            <section id="questionnaire">
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-6 h-6 text-[#1B3A4B]" />
                <h2 className="text-2xl font-bold text-slate-900">Tell us more about your needs</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Full Name *</label>
                    <input
                      required
                      type="text"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1B3A4B] focus:border-transparent transition-all"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Email Address *</label>
                    <input
                      required
                      type="email"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1B3A4B] focus:border-transparent transition-all"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>

                {service.questions && service.questions.length > 0 && (
                  <div className="space-y-6">
                    {service.questions.map((q, i) => (
                      <div key={i} className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{q}</label>
                        <textarea
                          rows={3}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1B3A4B] focus:border-transparent transition-all"
                          placeholder="Your answer..."
                          value={formData.answers[q] || ''}
                          onChange={e => handleAnswerChange(q, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-[#1B3A4B]/5 p-6 rounded-2xl border border-[#1B3A4B]/10">
                  <div className="flex items-start gap-4">
                    <Mail className="w-6 h-6 text-[#1B3A4B] mt-1" />
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Prefer to email us?</h3>
                      <p className="text-slate-600 text-sm mb-3">You can also reach out directly to our team for any specific inquiries.</p>
                      <a href="mailto:hello@outsourcedge.com" className="text-[#1B3A4B] font-bold hover:underline">
                        hello@outsourcedge.com
                      </a>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1B3A4B] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#1B3A4B]/90 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#1B3A4B]/20"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  Submit Inquiry
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
