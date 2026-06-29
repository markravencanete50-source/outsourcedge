import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import { Reveal, Stagger, StaggerChild } from "@/components/Reveal";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { addDoc, collection, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notifySubmission } from "@/lib/notify";
import { SMOOTH_EASE } from "@/lib/animations";

interface PageContent {
  contactEmail: string;
  contactPhone: string;
  address: string;
}

// Brand defaults (Firebase-overridable via site_content/main).
const DEFAULT_CONTENT: PageContent = {
  contactEmail: "contact@outsourcedge.com",
  contactPhone: "+1 (234) 567-890",
  address: "Serving US teams remotely",
};

const HERO_WORDS = [
  { w: "Let's", gold: false },
  { w: "find", gold: false },
  { w: "you", gold: false },
  { w: "the", gold: true },
  { w: "right", gold: true },
  { w: "people.", gold: true },
];

const SERVICE_CHIPS = [
  "Virtual assistants",
  "Property management",
  "Customer support",
  "Operations",
  "Not sure yet",
];

const heroStagger: Variants = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } };
const wordItem: Variants = { hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SMOOTH_EASE } } };
const fadeItem: Variants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: SMOOTH_EASE } } };

const KEYFRAMES = `
@keyframes oe-aurora { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(6%,-5%) scale(1.12); } 100% { transform: translate(-4%,4%) scale(1.04); } }
@keyframes oe-aurora2 { 0% { transform: translate(0,0) scale(1.04); } 50% { transform: translate(-7%,5%) scale(1.15); } 100% { transform: translate(5%,-3%) scale(1); } }
@keyframes oe-shake { 10%,90% { transform: translateX(-1px); } 20%,80% { transform: translateX(2px); } 30%,50%,70% { transform: translateX(-5px); } 40%,60% { transform: translateX(5px); } }
@media (prefers-reduced-motion: reduce) { .oe-aurora, .oe-aurora2 { animation: none !important; } }`;

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  textarea?: boolean;
  error?: string;
  shake?: boolean;
  inputRef?: React.Ref<HTMLInputElement & HTMLTextAreaElement>;
}

function Field({ id, label, value, onChange, type = "text", required, autoComplete, textarea, error, shake, inputRef }: FieldProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  const labelPos = floated ? "top-2 text-[11px] font-semibold tracking-[0.04em]" : textarea ? "top-4 text-[15px]" : "top-1/2 -translate-y-1/2 text-[15px]";
  const base =
    "peer w-full rounded-xl border bg-[#FAF7F1] px-4 text-[15px] text-[#1F2A44] outline-none transition-all duration-200 focus:bg-white focus:shadow-[0_0_0_4px_rgba(198,167,94,0.16)] " +
    (error ? "border-[#d8694c]" : "border-[#1F2A44]/12 focus:border-[#C6A75E]");

  return (
    <div className={shake ? "animate-[oe-shake_0.4s_ease-in-out]" : ""}>
      <div className="relative">
        {textarea ? (
          <textarea
            id={id}
            ref={inputRef as React.Ref<HTMLTextAreaElement>}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={5}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : undefined}
            className={`${base} resize-none pb-3 pt-7`}
          />
        ) : (
          <input
            id={id}
            ref={inputRef as React.Ref<HTMLInputElement>}
            type={type}
            value={value}
            onChange={onChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete={autoComplete}
            aria-required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-err` : undefined}
            className={`${base} h-14 pt-4`}
          />
        )}
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-4 transition-all duration-200 ${labelPos} ${focused ? "text-[#C6A75E]" : "text-[#1B1F2A]/55"}`}
        >
          {label}{required ? " *" : ""}
        </label>
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-[13px] font-medium text-[#c0492f]">{error}</p>
      )}
    </div>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emptyForm = { name: "", email: "", phone: "", company: "", service: "", message: "" };
type FormState = typeof emptyForm;
type Errors = Partial<Record<keyof FormState, string>>;

export default function Contact() {
  const [content, setContent] = useState<PageContent>(DEFAULT_CONTENT);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [shakeField, setShakeField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const emailRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const messageRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const refs: Record<string, React.RefObject<(HTMLInputElement & HTMLTextAreaElement) | null>> = {
    name: nameRef,
    email: emailRef,
    message: messageRef,
  };

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "18%"]);
  const heroContentY = useTransform(scrollYProgress, [0, 1], ["0%", reduce ? "0%" : "26%"]);
  const heroContentOpacity = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0]);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "site_content", "main"), (s) => {
      if (s.exists()) setContent({ ...DEFAULT_CONTENT, ...(s.data() as PageContent) });
    });
    return () => unsub();
  }, []);

  const telHref = `tel:${content.contactPhone.replace(/[^\d+]/g, "")}`;

  const update = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Please enter your name.";
    if (!form.email.trim()) next.email = "Please enter your email.";
    else if (!EMAIL_RE.test(form.email)) next.email = "Please enter a valid email.";
    if (!form.message.trim()) next.message = "Tell us a little about what you need.";
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    const firstInvalid = (["name", "email", "message"] as const).find((k) => next[k]);
    if (firstInvalid) {
      setShakeField(firstInvalid);
      window.setTimeout(() => setShakeField(null), 450);
      refs[firstInvalid]?.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      if (db) {
        await addDoc(collection(db, "contacts"), { ...form, timestamp: new Date() });
      }
      notifySubmission("contact", { ...form });
      setSubmitted(true);
    } catch (err) {
      console.error("Error sending message:", err);
      setErrors({ message: "Something went wrong sending your message. Please try again or call us." });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setErrors({});
    setSubmitted(false);
  };

  const firstName = form.name.trim().split(" ")[0];

  return (
    <div className="min-h-screen bg-[#FAF7F1]">
      <style dangerouslySetInnerHTML={{ __html: KEYFRAMES }} />
      <Header />

      <a
        href="#form"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-[#1F2A44] focus:px-4 focus:py-2 focus:font-semibold focus:text-white"
      >
        Skip to contact form
      </a>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section ref={heroRef} className="relative overflow-hidden bg-[#141929] pt-36 pb-28 text-white md:pt-44 md:pb-36">
          <motion.div className="absolute inset-0" style={{ y: photoY }} aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=2200&q=80"
              alt=""
              className="h-full w-full object-cover opacity-[0.28] [filter:grayscale(0.55)]"
            />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,19,33,0.92),rgba(20,25,41,0.72)_55%,rgba(31,42,68,0.5))]" aria-hidden="true" />
          {/* aurora blobs */}
          <div className="oe-aurora pointer-events-none absolute -left-[6%] top-[8%] h-[42vw] max-h-[460px] w-[42vw] max-w-[460px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.22),transparent_66%)] blur-2xl" style={{ animation: reduce ? "none" : "oe-aurora 16s ease-in-out infinite alternate" }} aria-hidden="true" />
          <div className="oe-aurora2 pointer-events-none absolute -right-[8%] bottom-[2%] h-[40vw] max-h-[420px] w-[40vw] max-w-[420px] rounded-full bg-[radial-gradient(circle,rgba(56,72,110,0.5),transparent_66%)] blur-2xl" style={{ animation: reduce ? "none" : "oe-aurora2 19s ease-in-out infinite alternate" }} aria-hidden="true" />

          <motion.div className="container relative z-10" style={{ y: heroContentY, opacity: heroContentOpacity }}>
            <motion.div className="max-w-3xl" initial="hidden" animate="visible" variants={heroStagger}>
              <motion.div variants={fadeItem} className="mb-6 flex items-center gap-3.5">
                <span className="h-px w-[46px] bg-[#C6A75E]" />
                <span className="eyebrow">Contact</span>
              </motion.div>
              <h1 className="font-['Poppins'] text-[clamp(36px,6.4vw,72px)] font-semibold leading-[1.05] tracking-[-0.02em] [text-wrap:balance]">
                {HERO_WORDS.map((word, i) => (
                  <motion.span key={i} variants={wordItem} className={`inline-block ${word.gold ? "text-[#C6A75E]" : "text-white"}`}>
                    {word.w}&nbsp;
                  </motion.span>
                ))}
              </h1>
              <motion.p variants={fadeItem} className="mt-7 max-w-[560px] text-[clamp(16px,2vw,20px)] font-medium leading-[1.6] text-white/82">
                Tell us what you need off your plate. We'll map the role, the tools, and your first-week rhythm — usually within a day.
              </motion.p>
              <motion.div variants={fadeItem} className="mt-9 flex flex-wrap gap-3.5">
                <a href={telHref} className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/[0.16]">
                  <Phone className="h-4 w-4 text-[#C6A75E]" /> {content.contactPhone}
                </a>
                <a href={`mailto:${content.contactEmail}`} className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/[0.16]">
                  <Mail className="h-4 w-4 text-[#C6A75E]" /> {content.contactEmail}
                </a>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* ── FORM + INFO ──────────────────────────────────────────────────── */}
        <section className="section-padding bg-[#FAF7F1]">
          <div className="container grid gap-[clamp(28px,4vw,60px)] lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left — form card */}
            <Reveal>
              <div id="form" className="rounded-3xl border border-[#1F2A44]/10 bg-white p-[clamp(24px,4vw,44px)] shadow-[0_30px_70px_rgba(31,42,68,0.10)]">
                {!submitted ? (
                  <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
                    <p className="eyebrow mb-3">Send a message</p>
                    <h2 className="font-['Poppins'] text-[clamp(26px,3.4vw,38px)] font-semibold leading-[1.1] tracking-[-0.015em] text-[#1F2A44]">Start a conversation.</h2>
                    <p className="mt-3 text-[15px] leading-[1.6] text-[#1B1F2A]/[0.62]">A few details and we'll take it from there — no pressure, no payroll.</p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                      <Field id="name" label="Full name" value={form.name} onChange={update("name")} required autoComplete="name" error={errors.name} shake={shakeField === "name"} inputRef={nameRef} />
                      <Field id="email" label="Work email" type="email" value={form.email} onChange={update("email")} required autoComplete="email" error={errors.email} shake={shakeField === "email"} inputRef={emailRef} />
                      <Field id="phone" label="Phone (optional)" type="tel" value={form.phone} onChange={update("phone")} autoComplete="tel" />
                      <Field id="company" label="Company (optional)" value={form.company} onChange={update("company")} autoComplete="organization" />
                    </div>

                    <fieldset className="mt-6">
                      <legend className="mb-3 text-sm font-semibold text-[#1F2A44]">What do you need help with?</legend>
                      <div className="flex flex-wrap gap-2.5">
                        {SERVICE_CHIPS.map((chip) => {
                          const selected = form.service === chip;
                          return (
                            <button
                              key={chip}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setForm((f) => ({ ...f, service: selected ? "" : chip }))}
                              className={`rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 ${
                                selected
                                  ? "-translate-y-0.5 border-[#1F2A44] bg-[#1F2A44] text-white shadow-[0_8px_20px_rgba(31,42,68,0.18)]"
                                  : "border-[#1F2A44]/15 bg-[#FAF7F1] text-[#1F2A44] hover:border-[#C6A75E]"
                              }`}
                            >
                              {chip}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    <div className="mt-6">
                      <Field id="message" label="Message" value={form.message} onChange={update("message")} required textarea error={errors.message} shake={shakeField === "message"} inputRef={messageRef} />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-gold mt-7 inline-flex w-full items-center justify-center gap-2.5 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                    >
                      {submitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1F2A44]/40 border-t-[#1F2A44]" aria-hidden="true" />
                          Sending…
                        </>
                      ) : (
                        <>Send message <ArrowRight className="h-4 w-4" /></>
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="flex flex-col items-center py-10 text-center" role="status" aria-live="polite">
                    <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
                      {!reduce && <span className="absolute inset-0 animate-ping rounded-full bg-[#3fae66]/25" />}
                      <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#3fae66]/12">
                        <svg viewBox="0 0 52 52" className="h-12 w-12">
                          <motion.circle cx="26" cy="26" r="23" fill="none" stroke="#3fae66" strokeWidth="3" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: SMOOTH_EASE }} />
                          <motion.path d="M15 27 l8 8 l15 -16" fill="none" stroke="#3fae66" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, delay: 0.5, ease: SMOOTH_EASE }} />
                        </svg>
                      </span>
                    </div>
                    <h2 className="font-['Poppins'] text-[clamp(24px,3.2vw,34px)] font-semibold tracking-[-0.015em] text-[#1F2A44]">Message on its way.</h2>
                    <p className="mt-3 max-w-md text-[15px] leading-[1.6] text-[#1B1F2A]/[0.62]">
                      Thanks{firstName ? `, ${firstName}` : ""} — we've got your note and we'll be in touch shortly. Need to talk sooner?
                    </p>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <a href={telHref} className="btn-gold inline-flex items-center justify-center gap-2">
                        <Phone className="h-4 w-4" /> Call {content.contactPhone}
                      </a>
                      <button type="button" onClick={resetForm} className="inline-flex items-center justify-center rounded-[11px] border border-[#1F2A44]/15 bg-white px-6 py-3.5 text-sm font-bold text-[#1F2A44] transition-colors hover:border-[#C6A75E]">
                        Send another
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>

            {/* Right — info cards */}
            <Stagger className="flex flex-col gap-4">
              <StaggerChild>
                <a href={telHref} className="group flex items-start gap-4 rounded-2xl bg-[#1F2A44] p-6 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(31,42,68,0.20)]">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#C6A75E]"><Phone className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C6A75E]">Call us</p>
                    <p className="mt-1.5 font-['Poppins'] text-lg font-semibold text-white">{content.contactPhone}</p>
                    <p className="mt-1 text-sm text-white/60">Mon–Fri, business hours</p>
                  </div>
                </a>
              </StaggerChild>
              <StaggerChild>
                <a href={`mailto:${content.contactEmail}`} className="group flex items-start gap-4 rounded-2xl border border-[#1F2A44]/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#C6A75E] hover:shadow-[0_30px_60px_rgba(31,42,68,0.12)]">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#1F2A44] text-[#C6A75E]"><Mail className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C6A75E]">Email us</p>
                    <p className="mt-1.5 font-['Poppins'] text-lg font-semibold text-[#1F2A44]">{content.contactEmail}</p>
                    <p className="mt-1 text-sm text-[#1B1F2A]/55">We reply within one business day</p>
                  </div>
                </a>
              </StaggerChild>
              <StaggerChild>
                <div className="flex items-start gap-4 rounded-2xl border border-[#1F2A44]/10 bg-white p-6">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#1F2A44] text-[#C6A75E]"><MapPin className="h-5 w-5" /></span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#C6A75E]">Where we work</p>
                    <p className="mt-1.5 font-['Poppins'] text-lg font-semibold text-[#1F2A44]">{content.address}</p>
                    <p className="mt-1 text-sm text-[#1B1F2A]/55">Coverage across US time zones</p>
                  </div>
                </div>
              </StaggerChild>
              <StaggerChild>
                <a href={telHref} className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#C6A75E,#d8bd78)] p-6 text-[#1F2A44] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(198,167,94,0.34)]">
                  <span className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/20 transition-transform duration-500 group-hover:scale-125" aria-hidden="true" />
                  <p className="relative text-xs font-bold uppercase tracking-[0.14em] text-[#1F2A44]/70">Prefer to talk?</p>
                  <h3 className="relative mt-2 font-['Poppins'] text-xl font-semibold leading-snug">Book a call and we'll scope it together.</h3>
                  <span className="relative mt-4 inline-flex items-center gap-2 text-sm font-bold">Book a call <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                </a>
              </StaggerChild>
            </Stagger>
          </div>
        </section>
      </main>

      <Footer />
      <AiAssistant />
    </div>
  );
}
