import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, ChevronDown, RefreshCw } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * Built-in, API-free dashboard assistant ("Edge"). It reads the live data the
 * admin already has access to (applications, contacts, service inquiries, jobs,
 * sent emails) straight from Firestore and answers questions with hardcoded
 * intent matching — no external LLM call. Mounted once in AdminLayout so it
 * appears on every admin and CEO page.
 */

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DashData {
  apps: any[];
  contacts: any[];
  inquiries: any[];
  jobs: any[];
  emails: any[];
}

const SUGGESTED = [
  'Give me a summary',
  'How many new applications?',
  'Applications by position',
  'How many contact submissions?',
  'Show recent applicants',
  'How many open jobs?',
];

// ── data helpers ────────────────────────────────────────────────────────────
function toDate(o: any): Date | null {
  const v = o?.date || o?.createdAt || o?.sentAt || o?.timestamp;
  try {
    return v?.toDate ? v.toDate() : v ? new Date(v) : null;
  } catch {
    return null;
  }
}
const isToday = (d: Date | null) => !!d && d.toDateString() === new Date().toDateString();
const withinDays = (d: Date | null, n: number) => !!d && Date.now() - d.getTime() <= n * 86400000;
const countStatus = (arr: any[], s: string) =>
  arr.filter((a) => String(a.status || '').toLowerCase() === s).length;

function groupCount(arr: any[], keyFn: (x: any) => string): Array<[string, number]> {
  const m: Record<string, number> = {};
  for (const x of arr) {
    const k = keyFn(x) || 'Unspecified';
    m[k] = (m[k] || 0) + 1;
  }
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

const has = (s: string, ...words: string[]) => words.some((w) => s.includes(w));

// ── the "brain": map a question to an answer using the live data ─────────────
function answerQuestion(raw: string, d: DashData): string {
  const q = raw.toLowerCase().trim();
  const { apps, contacts, inquiries, jobs, emails } = d;

  const openJobs = jobs.filter((j) => String(j.status || 'active').toLowerCase() === 'active');

  if (!q) return 'Ask me about applications, contacts, service inquiries, jobs, or emails.';

  // Greetings / help
  if (has(q, 'help', 'what can you', 'who are you', 'hello', 'hi ', 'hey')) {
    return (
      "I'm Edge, your dashboard assistant. I read your live data and can tell you things like:\n\n" +
      '• "How many applications?" (total, new, hired, today, this week)\n' +
      '• "Applications by position"\n' +
      '• "Show recent applicants"\n' +
      '• "How many contact submissions?"\n' +
      '• "How many service inquiries?"\n' +
      '• "How many open jobs?"\n' +
      '• "How many emails have we sent?"\n' +
      '• "Give me a summary"'
    );
  }

  // Full snapshot
  if (has(q, 'summary', 'overview', 'snapshot', 'what\'s happening', 'whats happening', 'report', 'dashboard', 'how are we')) {
    const appsWeek = apps.filter((a) => withinDays(toDate(a), 7)).length;
    const contactsWeek = contacts.filter((c) => withinDays(toDate(c), 7)).length;
    return (
      "Here's your current snapshot:\n\n" +
      `📋 Applications: ${apps.length} total — ${countStatus(apps, 'new')} new, ${countStatus(apps, 'hired')} hired\n` +
      `✉️ Contact submissions: ${contacts.length} (${countStatus(contacts, 'new')} new)\n` +
      `🧾 Service inquiries: ${inquiries.length} (${countStatus(inquiries, 'new')} new)\n` +
      `💼 Open jobs: ${openJobs.length} of ${jobs.length}\n` +
      `📨 Emails sent from dashboard: ${emails.length}\n\n` +
      `📈 This week: ${appsWeek} new application${appsWeek === 1 ? '' : 's'}, ${contactsWeek} contact${contactsWeek === 1 ? '' : 's'}.`
    );
  }

  // Emails
  if (has(q, 'email', 'sent mail', 'emails sent')) {
    const today = emails.filter((e) => isToday(toDate(e))).length;
    const week = emails.filter((e) => withinDays(toDate(e), 7)).length;
    return `You've sent ${emails.length} email${emails.length === 1 ? '' : 's'} from the dashboard — ${today} today, ${week} in the last 7 days.`;
  }

  // Applications (check before jobs so "applicants per job" lands here)
  if (has(q, 'applic', 'applicant', 'applied', 'candidate')) {
    // Breakdown by position
    if (has(q, 'per ', 'each ', 'by position', 'by job', 'by role', 'breakdown', 'which position', 'which job', 'which role', 'most applic', 'per position', 'per job', 'per role')) {
      const g = groupCount(apps, (a) => a.jobTitle);
      if (!g.length) return 'No applications yet.';
      const top = g[0];
      return (
        `Applications by position:\n${g.map(([k, v]) => `• ${k}: ${v}`).join('\n')}\n\n` +
        `🏆 Most applied: ${top[0]} (${top[1]}).`
      );
    }
    // Recent / latest
    if (has(q, 'recent', 'latest', 'newest', 'last ', 'show ', 'list ')) {
      const recent = [...apps]
        .sort((a, b) => (toDate(b)?.getTime() || 0) - (toDate(a)?.getTime() || 0))
        .slice(0, 5);
      if (!recent.length) return 'No applications yet.';
      return (
        'Latest applicants:\n' +
        recent
          .map((a) => `• ${a.fullName || 'Anonymous'} — ${a.jobTitle || 'N/A'} (${toDate(a)?.toLocaleDateString() || '—'})`)
          .join('\n')
      );
    }
    // Status-specific
    for (const s of ['new', 'reviewed', 'accepted', 'rejected', 'hired']) {
      if (q.includes(s)) {
        return `You have ${countStatus(apps, s)} ${s} application${countStatus(apps, s) === 1 ? '' : 's'} (out of ${apps.length} total).`;
      }
    }
    // Time-specific
    if (has(q, 'today')) {
      const n = apps.filter((a) => isToday(toDate(a))).length;
      return `${n} application${n === 1 ? '' : 's'} came in today.`;
    }
    if (has(q, 'week')) {
      const n = apps.filter((a) => withinDays(toDate(a), 7)).length;
      return `${n} application${n === 1 ? '' : 's'} in the last 7 days.`;
    }
    if (has(q, 'month')) {
      const n = apps.filter((a) => withinDays(toDate(a), 30)).length;
      return `${n} application${n === 1 ? '' : 's'} in the last 30 days.`;
    }
    // Total (default)
    return `You have ${apps.length} application${apps.length === 1 ? '' : 's'} in total — ${countStatus(apps, 'new')} new, ${countStatus(apps, 'reviewed')} reviewed, ${countStatus(apps, 'accepted')} accepted, ${countStatus(apps, 'hired')} hired, ${countStatus(apps, 'rejected')} rejected.`;
  }

  // Service inquiries / questionnaires (check before generic "contact")
  if (has(q, 'service inquir', 'service enquir', 'questionnaire', 'service inquiry', 'inquiries', 'enquiries')) {
    const today = inquiries.filter((i) => isToday(toDate(i))).length;
    return `You have ${inquiries.length} service inquir${inquiries.length === 1 ? 'y' : 'ies'} — ${countStatus(inquiries, 'new')} new, ${today} today.`;
  }

  // Contact submissions
  if (has(q, 'contact', 'message', 'lead', 'enquir', 'inquir')) {
    const today = contacts.filter((c) => isToday(toDate(c))).length;
    const week = contacts.filter((c) => withinDays(toDate(c), 7)).length;
    return `You have ${contacts.length} contact submission${contacts.length === 1 ? '' : 's'} — ${countStatus(contacts, 'new')} new, ${today} today, ${week} this week.`;
  }

  // Jobs
  if (has(q, 'job', 'position', 'opening', 'vacanc', 'posting', 'listing', 'hiring', 'role')) {
    if (has(q, 'list', 'which', 'show', 'what ')) {
      if (!openJobs.length) return 'There are no open jobs right now.';
      return `Open positions (${openJobs.length}):\n${openJobs.map((j) => `• ${j.title || 'Untitled'}`).join('\n')}`;
    }
    return `There ${openJobs.length === 1 ? 'is' : 'are'} ${openJobs.length} open job${openJobs.length === 1 ? '' : 's'} (out of ${jobs.length} total).`;
  }

  // Fallback
  return (
    "I'm not sure how to answer that one. Try asking about:\n" +
    '• applications (total / new / by position / recent)\n' +
    '• contact submissions\n' +
    '• service inquiries\n' +
    '• open jobs\n' +
    '• emails sent\n\n' +
    'Or type "summary" for the full picture.'
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-[#1B3A4B] dark:bg-[#7FB6CC] rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-gradient-to-br from-[#1B3A4B] to-[#C6A75E]' : 'bg-slate-100 dark:bg-white/[.08] border border-slate-200 dark:border-white/[.1]'
        }`}
      >
        {isUser ? <User className="w-3.5 h-3.5 text-white" /> : <Bot className="w-3.5 h-3.5 text-[#1B3A4B] dark:text-[#7FB6CC]" />}
      </div>
      <div
        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-gradient-to-br from-[#1B3A4B] to-[#143040] text-white rounded-br-sm'
            : 'bg-slate-100 dark:bg-white/[.06] text-slate-800 dark:text-slate-100 rounded-bl-sm'
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

export default function AdminAiAssistant() {
  const { isAuthenticated } = useAdmin();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hi! I'm Edge, your dashboard assistant 📊 Ask me about applications, contacts, service inquiries, jobs, or emails — I read your live data. Try \"give me a summary\".",
    },
  ]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [data, setData] = useState<DashData | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function loadData() {
    if (!db) return;
    setLoadingData(true);
    try {
      const [apps, contacts, inquiries, jobs, emails] = await Promise.all([
        getDocs(collection(db, 'applications')),
        getDocs(collection(db, 'contacts')),
        getDocs(collection(db, 'service_questionnaires')),
        getDocs(collection(db, 'jobs')),
        getDocs(collection(db, 'sentEmails')),
      ]);
      setData({
        apps: apps.docs.map((d) => d.data()),
        contacts: contacts.docs.map((d) => d.data()),
        inquiries: inquiries.docs.map((d) => d.data()),
        jobs: jobs.docs.map((d) => d.data()),
        emails: emails.docs.map((d) => d.data()),
      });
    } catch (err) {
      console.error('Edge assistant data load failed:', err);
    } finally {
      setLoadingData(false);
    }
  }

  // Load (or refresh) the snapshot when the panel opens.
  useEffect(() => {
    if (open && !data && !loadingData) loadData();
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinking]);

  function sendMessage(text: string) {
    if (!text.trim() || thinking) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    // small delay so it feels responsive, then answer locally
    setTimeout(() => {
      const reply = data
        ? answerQuestion(text, data)
        : 'Still loading your data — give me a second and ask again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      setThinking(false);
    }, 220);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <motion.button
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 bg-gradient-to-br from-[#1B3A4B] to-[#C6A75E] rounded-full shadow-xl flex items-center justify-center text-white"
          aria-label="Open dashboard assistant"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                <Sparkles className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
          {!open && <span className="absolute inset-0 rounded-full animate-ping bg-[#1B3A4B] opacity-20" />}
        </motion.button>
      </div>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[370px] max-w-[calc(100vw-2rem)] bg-white dark:bg-[#0F1A2E] rounded-2xl shadow-2xl border border-slate-200 dark:border-white/[.08] flex flex-col overflow-hidden"
            style={{ maxHeight: '540px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#1B3A4B] to-[#143040] px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/15 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#C6A75E]" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">Edge</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    <p className="text-white/80 text-xs">{loadingData ? 'Reading data…' : 'Dashboard assistant'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => loadData()}
                  title="Refresh data"
                  className="text-white/70 hover:text-white transition p-1"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
                </button>
                <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition p-1" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {thinking && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/[.08] border border-slate-200 dark:border-white/[.1] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#1B3A4B] dark:text-[#7FB6CC]" />
                  </div>
                  <div className="bg-slate-100 dark:bg-white/[.06] rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions at start */}
            {messages.length === 1 && !thinking && (
              <div className="px-4 pb-3 flex flex-wrap gap-2 flex-shrink-0">
                {SUGGESTED.map((qn) => (
                  <button
                    key={qn}
                    onClick={() => sendMessage(qn)}
                    className="text-xs bg-[#1B3A4B]/[.06] dark:bg-white/[.06] text-[#1B3A4B] dark:text-slate-200 border border-[#1B3A4B]/10 dark:border-white/[.08] px-3 py-1.5 rounded-full hover:bg-[#1B3A4B]/[.12] dark:hover:bg-white/[.1] transition font-medium"
                  >
                    {qn}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-white/[.08] flex items-center gap-2 flex-shrink-0 bg-white dark:bg-[#0F1A2E]">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about your dashboard…"
                disabled={thinking}
                className="flex-1 text-sm bg-slate-50 dark:bg-white/[.04] border border-slate-200 dark:border-white/[.08] rounded-xl px-4 py-2.5 outline-none focus:border-[#1B3A4B] focus:ring-2 focus:ring-[#1B3A4B]/10 transition placeholder-slate-400 dark:text-slate-100 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={thinking || !input.trim()}
                className="w-9 h-9 bg-gradient-to-br from-[#1B3A4B] to-[#143040] rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition flex-shrink-0"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400 dark:text-slate-500 pb-2 flex-shrink-0">
              Reads your live dashboard data · no data leaves your browser
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
