import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";
import { Reveal, Stagger, StaggerChild } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, Clock, MapPin } from "lucide-react";
import { Link } from "wouter";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SMOOTH_EASE } from "@/lib/animations";

interface Job {
  id: string;
  title: string;
  category: string;
  type: string;
  location: string;
  description: string;
  status: string;
}

const stats = [
  { value: "100%", label: "Remote, always" },
  { value: "5–7", label: "days, apply → offer" },
  { value: "USD", label: "pay you can plan on" },
];

const life = [
  {
    n: "01 · Remote-first",
    title: "Work from home — for real.",
    copy: "No commute, no relocation, no surprise return-to-office. We've been remote since day one, with the rhythms and tools that make it actually work.",
    img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
    reversed: false,
  },
  {
    n: "02 · Real growth",
    title: "Start in a role, grow into a craft.",
    copy: "We hire for judgment and back it with training. Move from a first role into a specialty as your skills — and our clients' trust in you — compound.",
    img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    reversed: true,
  },
  {
    n: "03 · You're backed",
    title: "Never alone with a hard day.",
    copy: "A team has your back: clear escalation, real managers, and colleagues who answer. The work is yours; the weight isn't only on you.",
    img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80",
    reversed: false,
  },
];

const benefits = [
  { title: "Fair, on-time pay in USD", copy: "Reliable compensation you can budget around — paid on schedule, every time." },
  { title: "Steady, long-term clients", copy: "Real relationships, not churn. You grow with the owners you support." },
  { title: "Paid time off & recognition", copy: "Rest that's respected and work that's noticed — we see the people behind the output." },
  { title: "Tools & training provided", copy: "The software, systems, and coaching to do excellent work from anywhere." },
];

const hiring = [
  { n: "1", step: "Apply", copy: "Send the short form for the role that fits. A few minutes, no busywork." },
  { n: "2", step: "Intro chat", copy: "A relaxed conversation about your experience and what you're looking for." },
  { n: "3", step: "Skills check", copy: "A practical look at how you work — relevant to the actual role." },
  { n: "4", step: "Offer & onboard", copy: "Paperwork, tools, and a warm welcome into your new team." },
];

const cardHover = { y: -6, transition: { duration: 0.25, ease: SMOOTH_EASE } };

/* ── Life story row with scroll-linked photo parallax ─────────────────────── */
function LifeRow({ item }: { item: (typeof life)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-8%", "8%"]);

  const media = (
    <Reveal>
      <div ref={ref} className="relative overflow-hidden rounded-[18px] border border-[#1F2A44]/[0.08] shadow-[0_30px_70px_rgba(31,42,68,0.16)]" style={{ aspectRatio: "5 / 4" }}>
        <motion.img src={item.img} alt="" style={{ y }} className="absolute inset-0 h-[124%] w-full -translate-y-[12%] object-cover" />
      </div>
    </Reveal>
  );

  const copy = (
    <div>
      <Reveal>
        <span className="mb-[18px] inline-block rounded-full border border-[#C6A75E]/50 px-[13px] py-[5px] font-['Poppins'] text-[13px] font-bold text-[#C6A75E]">{item.n}</span>
      </Reveal>
      <Reveal delay={0.09}>
        <h3 className="font-['Poppins'] text-[clamp(22px,2.8vw,32px)] font-semibold leading-[1.16] tracking-[-0.01em] text-[#1F2A44]">{item.title}</h3>
      </Reveal>
      <Reveal delay={0.18}>
        <p className="mt-4 max-w-[460px] text-[clamp(15px,1.7vw,18px)] leading-[1.66] text-[#1B1F2A]/[0.66]">{item.copy}</p>
      </Reveal>
    </div>
  );

  return (
    <div className="mb-[clamp(56px,7vw,104px)] grid items-center gap-[clamp(28px,5vw,72px)] last:mb-0 md:grid-cols-2">
      {item.reversed ? (
        <>
          <div className="order-2 md:order-1">{copy}</div>
          <div className="order-1 md:order-2">{media}</div>
        </>
      ) : (
        <>
          {media}
          {copy}
        </>
      )}
    </div>
  );
}

export default function Careers() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const reduce = useReducedMotion();

  // Hero collage parallax
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y1 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -48]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 56]);
  const yBadge = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, -84]);

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, "jobs"), where("status", "==", "active"));
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Job[]);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const categories = useMemo(() => ["All", ...Array.from(new Set(jobs.map((j) => j.category).filter(Boolean)))], [jobs]);
  const visibleJobs = filter === "All" ? jobs : jobs.filter((j) => j.category === filter);
  const rolesOpen = jobs.length;

  return (
    <div className="bg-[#FAF7F1] text-[#1B1F2A]">
      <Header />

      <a href="#openings" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-[#1F2A44] focus:px-4 focus:py-2 focus:font-semibold focus:text-white">
        Skip to open positions
      </a>

      <main>
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section id="careers-top" className="relative overflow-hidden bg-[#FAF7F1] px-[clamp(20px,5vw,40px)] pb-[clamp(56px,8vw,96px)] pt-[clamp(122px,15vh,180px)]">
          <div aria-hidden className="pointer-events-none absolute -left-[10%] -top-[8%] aspect-square w-[42vw] max-w-[560px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.14),transparent_66%)] blur-[8px]" />
          <div className="relative mx-auto grid max-w-[1240px] items-center gap-[clamp(32px,5vw,72px)] md:grid-cols-[1.05fr_0.95fr]">
            <div>
              <Reveal>
                <div className="mb-[22px] flex items-center gap-[14px]">
                  <span className="block h-px w-[46px] bg-[#C6A75E]" />
                  <span className="text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">Careers at OutsourcEdge</span>
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <h1 className="text-balance font-['Poppins'] text-[clamp(34px,5.4vw,66px)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#1F2A44]">
                  Do your best work —<br />
                  <span className="text-[#C6A75E]">from anywhere you are.</span>
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-[26px] max-w-[500px] text-[clamp(16px,1.9vw,19px)] leading-[1.66] text-[#1B1F2A]/[0.7]">
                  Join the team behind dependable property and back-office support for US owners. Remote-first, genuinely supportive, and built so good people can grow.
                </p>
              </Reveal>
              <Reveal delay={0.26}>
                <div className="mt-[34px] flex flex-wrap gap-[14px]">
                  <Button asChild className="btn-gold">
                    <a href="#openings">See open positions <ArrowRight className="h-[17px] w-[17px]" /></a>
                  </Button>
                  <Button asChild variant="outline" className="rounded-[10px] border-[#1F2A44]/20 px-6 py-[15px] font-semibold text-[#1F2A44] hover:bg-[#1F2A44]/5">
                    <a href="#life">Life at OutsourcEdge</a>
                  </Button>
                </div>
              </Reveal>
              <Reveal delay={0.34}>
                <div className="mt-[38px] grid max-w-[460px] grid-cols-3 gap-4">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <p className="font-['Poppins'] text-[clamp(22px,3vw,32px)] font-bold text-[#1F2A44]">{s.value}</p>
                      <p className="mt-1 text-[12px] font-semibold leading-snug text-[#1B1F2A]/60">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>

            {/* hero collage — hidden on mobile */}
            <div ref={heroRef} className="relative hidden h-[clamp(380px,46vw,540px)] md:block">
              <motion.div style={{ y: y1 }} className="absolute right-0 top-0 z-[2] w-[70%] overflow-hidden rounded-[18px] border border-[#1F2A44]/[0.08] shadow-[0_36px_80px_rgba(31,42,68,0.2)]">
                <img src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=1100&q=80" alt="An OutsourcEdge team member working remotely" className="h-full w-full object-cover" style={{ aspectRatio: "3 / 4" }} />
              </motion.div>
              <motion.div style={{ y: y2 }} className="absolute bottom-0 left-0 z-[3] w-[55%] overflow-hidden rounded-[16px] border-4 border-[#FAF7F1] shadow-[0_28px_64px_rgba(31,42,68,0.22)]">
                <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=900&q=80" alt="A teammate on a friendly video call" className="h-full w-full object-cover" style={{ aspectRatio: "1 / 1" }} />
              </motion.div>
              <motion.div style={{ y: yBadge }} className="absolute -left-[2%] top-[16%] z-[4] flex items-center gap-2.5 rounded-full bg-[#1F2A44] px-[18px] py-3 text-white shadow-[0_22px_50px_rgba(31,42,68,0.3)]">
                <span className="relative flex h-2.5 w-2.5">
                  {!reduce && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4ADE80] opacity-75" />}
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4ADE80]" />
                </span>
                <span className="text-[13px] font-semibold">{rolesOpen} role{rolesOpen === 1 ? "" : "s"} open now</span>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── NAVY STATEMENT BAND ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#1F2A44] px-[clamp(20px,5vw,40px)] py-[clamp(72px,10vw,128px)] text-white">
          <div aria-hidden className="pointer-events-none absolute -bottom-[30%] -right-[6%] aspect-square w-[44vw] max-w-[560px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.16),transparent_66%)] blur-xl" />
          <div className="relative mx-auto max-w-[1000px] text-center">
            <Reveal><span className="mx-auto mb-7 block h-px w-14 bg-[#C6A75E]" /></Reveal>
            <Reveal delay={0.08}><p className="mb-[22px] text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">Why build a career here</p></Reveal>
            <Reveal delay={0.18}>
              <h2 className="text-balance font-['Poppins'] text-[clamp(26px,3.8vw,46px)] font-medium leading-[1.28] tracking-[-0.01em] text-white">
                People join for the flexibility — and <span className="text-[#C6A75E]">stay for years</span> because the work is real, the clients are steady, and the team treats you like it matters.
              </h2>
            </Reveal>
          </div>
        </section>

        {/* ── LIFE AT OUTSOURCEDGE ─────────────────────────────────────────── */}
        <section id="life" className="bg-[#FAF7F1] px-[clamp(20px,5vw,40px)] py-[clamp(72px,9vw,124px)]">
          <div className="mx-auto max-w-[1240px]">
            <div className="mb-[clamp(48px,6vw,80px)] max-w-[640px]">
              <Reveal><p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">Life at OutsourcEdge</p></Reveal>
              <Reveal delay={0.1}>
                <h2 className="font-['Poppins'] text-[clamp(28px,4.2vw,50px)] font-semibold leading-[1.08] tracking-[-0.015em] text-[#1F2A44]">A workplace built around the people in it.</h2>
              </Reveal>
            </div>
            {life.map((item) => <LifeRow key={item.n} item={item} />)}
          </div>
        </section>

        {/* ── BENEFITS ─────────────────────────────────────────────────────── */}
        <section className="border-t border-[#1F2A44]/[0.07] bg-white px-[clamp(20px,5vw,40px)] py-[clamp(72px,9vw,124px)]">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-[clamp(40px,5vw,60px)] max-w-[640px]">
              <Reveal><p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">The good stuff</p></Reveal>
              <Reveal delay={0.1}><h2 className="font-['Poppins'] text-[clamp(28px,4.2vw,50px)] font-semibold leading-[1.08] tracking-[-0.015em] text-[#1F2A44]">What you can count on.</h2></Reveal>
            </div>
            <Stagger className="grid gap-5 sm:grid-cols-2">
              {benefits.map((b) => (
                <StaggerChild key={b.title}>
                  <motion.article whileHover={cardHover} className="h-full rounded-2xl border border-[#1F2A44]/10 bg-[#FAF7F1] p-[clamp(26px,3vw,38px)] shadow-[0_18px_44px_rgba(31,42,68,0.06)] transition-colors hover:border-[#C6A75E]/50">
                    <span className="mb-6 block h-[3px] w-10 rounded-full bg-[#C6A75E]" />
                    <h3 className="font-['Poppins'] text-[clamp(20px,2.2vw,24px)] font-semibold tracking-[-0.01em] text-[#1F2A44]">{b.title}</h3>
                    <p className="mt-3 text-[15px] leading-[1.62] text-[#1B1F2A]/[0.66]">{b.copy}</p>
                  </motion.article>
                </StaggerChild>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── OPEN POSITIONS ───────────────────────────────────────────────── */}
        <section id="openings" className="bg-[#FAF7F1] px-[clamp(20px,5vw,40px)] py-[clamp(72px,9vw,124px)]">
          <div className="mx-auto max-w-[1100px]">
            <div className="mb-9 max-w-[640px]">
              <Reveal><p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">Open positions</p></Reveal>
              <Reveal delay={0.1}><h2 className="font-['Poppins'] text-[clamp(28px,4.2vw,50px)] font-semibold leading-[1.08] tracking-[-0.015em] text-[#1F2A44]">Find your seat.</h2></Reveal>
              <Reveal delay={0.18}><p className="mt-4 text-[clamp(15px,1.7vw,18px)] leading-[1.62] text-[#1B1F2A]/[0.66]">Roles below are posted and kept current by our hiring team.</p></Reveal>
            </div>

            {/* category filter */}
            {categories.length > 1 && (
              <div className="mb-8 flex flex-wrap gap-2.5">
                {categories.map((cat) => {
                  const active = filter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(cat)}
                      className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-all ${active ? "border-[#1F2A44] bg-[#1F2A44] text-white" : "border-[#1F2A44]/15 bg-white text-[#1B1F2A]/70 hover:border-[#C6A75E]"}`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center py-16" role="status" aria-label="Loading roles">
                <span className="h-9 w-9 animate-spin rounded-full border-2 border-[#1F2A44]/30 border-t-[#1F2A44]" />
              </div>
            ) : visibleJobs.length === 0 ? (
              <div className="rounded-[18px] border border-dashed border-[#1F2A44]/20 bg-white px-6 py-14 text-center">
                <p className="font-['Poppins'] text-lg font-semibold text-[#1F2A44]">No roles in this category right now.</p>
                <p className="mx-auto mt-2 max-w-md text-[15px] text-[#1B1F2A]/[0.62]">New roles open regularly. Join our talent network and we'll reach out when something fits.</p>
                <Button asChild className="btn-gold mt-6"><Link href="/contact">Join the talent network</Link></Button>
              </div>
            ) : (
              <Stagger className="flex flex-col gap-4">
                {visibleJobs.map((job) => (
                  <StaggerChild key={job.id}>
                    <motion.article whileHover={{ y: -3, transition: { duration: 0.2 } }} className="rounded-[18px] border border-[#1F2A44]/10 bg-white p-[clamp(22px,2.6vw,30px)] shadow-[0_14px_38px_rgba(31,42,68,0.06)] transition-colors hover:border-[#C6A75E]/45">
                      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap items-center gap-2.5">
                            {job.category && <span className="rounded-full bg-[#C6A75E]/[0.14] px-3 py-1 text-[12px] font-bold text-[#9A7E3E]">{job.category}</span>}
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1F8A5B]/10 px-3 py-1 text-[12px] font-bold text-[#1F8A5B]">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#1F8A5B]" /> Active
                            </span>
                          </div>
                          <h3 className="font-['Poppins'] text-[clamp(20px,2.3vw,26px)] font-semibold tracking-[-0.01em] text-[#1F2A44]">{job.title}</h3>
                          {job.description && <p className="mt-2 max-w-[560px] text-[15px] leading-[1.6] text-[#1B1F2A]/[0.66] line-clamp-2">{job.description}</p>}
                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-[#1B1F2A]/[0.6]">
                            {job.type && <span className="inline-flex items-center gap-2"><Clock className="h-[15px] w-[15px] text-[#C6A75E]" /> {job.type}</span>}
                            {job.location && <span className="inline-flex items-center gap-2"><MapPin className="h-[15px] w-[15px] text-[#C6A75E]" /> {job.location}</span>}
                            <span className="inline-flex items-center gap-2"><CalendarDays className="h-[15px] w-[15px] text-[#C6A75E]" /> Apply anytime</span>
                          </div>
                        </div>
                        <Button asChild className="btn-gold w-full justify-center whitespace-nowrap md:w-auto">
                          <Link href={`/job/${job.id}`}>Apply now <ArrowRight className="h-4 w-4" /></Link>
                        </Button>
                      </div>
                    </motion.article>
                  </StaggerChild>
                ))}
              </Stagger>
            )}

            {/* talent-network callout */}
            <Reveal delay={0.1}>
              <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-[18px] bg-[#E8DCC8] p-[clamp(24px,3vw,34px)] md:flex-row md:items-center">
                <div>
                  <h3 className="font-['Poppins'] text-[clamp(18px,2vw,22px)] font-semibold tracking-[-0.01em] text-[#1F2A44]">Don't see your role?</h3>
                  <p className="mt-1.5 max-w-[560px] text-[15px] leading-[1.6] text-[#1B1F2A]/[0.7]">Tell us about yourself and we'll keep you in mind as new roles open.</p>
                </div>
                <Button asChild className="btn-primary whitespace-nowrap"><Link href="/contact">Join the talent network</Link></Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── HOW HIRING WORKS ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-[#141929] px-[clamp(20px,5vw,40px)] py-[clamp(76px,9vw,128px)] text-white">
          <div aria-hidden className="pointer-events-none absolute -right-[6%] -top-[14%] aspect-square w-[44vw] max-w-[560px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.16),transparent_66%)] blur-2xl" />
          <div className="relative mx-auto max-w-[1100px]">
            <div className="mb-[clamp(40px,5vw,64px)] max-w-[640px]">
              <Reveal><p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">How hiring works</p></Reveal>
              <Reveal delay={0.1}><h2 className="font-['Poppins'] text-[clamp(28px,4.2vw,50px)] font-semibold leading-[1.08] tracking-[-0.015em] text-white">Four steps, about a week.</h2></Reveal>
            </div>
            <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {hiring.map((h) => (
                <StaggerChild key={h.n}>
                  <div className="h-full rounded-[16px] border border-white/[0.12] bg-[#1F2A44] p-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#C6A75E] font-['Poppins'] text-base font-bold text-[#1F2A44]">{h.n}</span>
                    <h3 className="mt-5 font-['Poppins'] text-[18px] font-semibold text-white">{h.step}</h3>
                    <p className="mt-2 text-[14px] leading-[1.55] text-white/[0.66]">{h.copy}</p>
                  </div>
                </StaggerChild>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ── CTA BAND ─────────────────────────────────────────────────────── */}
        <section className="bg-[#FAF7F1] px-[clamp(20px,5vw,40px)] pb-[clamp(72px,9vw,120px)] pt-[clamp(56px,7vw,96px)]">
          <div className="mx-auto max-w-[1240px]">
            <Reveal>
              <div className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(120deg,#1F2A44,#2a3a5e)] p-[clamp(40px,6vw,72px)] text-white">
                <div aria-hidden className="pointer-events-none absolute -right-[8%] -top-[30%] aspect-square w-[34vw] max-w-[460px] rounded-full bg-[radial-gradient(circle,rgba(198,167,94,0.28),transparent_66%)] blur-xl" />
                <div className="relative grid items-center gap-9 md:grid-cols-[1.4fr_auto]">
                  <div>
                    <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.16em] text-[#C6A75E]">Ready when you are</p>
                    <h2 className="font-['Poppins'] text-[clamp(28px,4vw,46px)] font-semibold leading-[1.08] tracking-[-0.015em] text-white">Your next chapter starts with one form.</h2>
                    <p className="mt-4 max-w-[560px] text-[17px] leading-[1.6] text-white/[0.74]">Browse the open roles, or tell us about yourself for the talent network — we'd love to meet you.</p>
                  </div>
                  <Button asChild className="btn-gold whitespace-nowrap px-[30px] py-[18px] text-[16px]"><a href="#openings">Start your application <ArrowRight className="h-[17px] w-[17px]" /></a></Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
      <AiAssistant />
    </div>
  );
}
