import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Loader2, Sparkles, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT = `You are Aria, a friendly and knowledgeable AI assistant for OutsourcEdge — a premium outsourcing company that provides:

1. **Dedicated Growth Partners** – Strategic teams focused on scaling business operations and driving sustainable growth.
2. **Property Management Support** – Expert assistance with tenant relations, maintenance coordination, and compliance.
3. **Virtual Staffing** – Access to pre-vetted, skilled professionals for administrative, technical, and specialized roles.
4. **Customer Service Support** – 24/7 support teams delivering exceptional customer experiences across all channels.
5. **Administrative Support** – Handling day-to-day operations so clients can focus on strategic growth.
6. **Business Operations** – End-to-end support for streamlined, efficient operations.
7. **Project Management Services** – Including Landlord Support, Tenant Management, Maintenance Coordination, Property Inspections, and Rent Collection.

Key facts:
- Onboarding typically takes 5–7 business days
- Services can reduce operational costs by up to 40%
- 24/7 support is available
- 98% client retention rate
- 500+ properties managed
- They serve property management, real estate, tech startups, e-commerce, and more

Your job is to:
- Help visitors understand which OutsourcEdge service is right for them
- Answer questions about services, pricing approach, and onboarding
- Guide users toward booking a consultation via the Contact page
- Be warm, professional, and concise (keep replies under 120 words unless detail is truly needed)
- Always end with a helpful follow-up question or a CTA to visit /contact

Do NOT make up specific pricing — tell users to contact the team for a custom quote.
Do NOT answer questions unrelated to OutsourcEdge or outsourcing/property management.`;

const SUGGESTED_QUESTIONS = [
  "What services do you offer?",
  "How does onboarding work?",
  "Can you help with property management?",
  "How much does it cost?",
];

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-[#0891B2] rounded-full"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-gradient-to-br from-[#0891B2] to-[#059669]"
            : "bg-gray-100 border border-gray-200"
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-[#0891B2]" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-gradient-to-br from-[#0891B2] to-[#059669] text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        {msg.content}
      </div>
    </motion.div>
  );
}

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Aria, OutsourcEdge's AI assistant 👋 I can help you find the right service for your business. What are you looking for today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setShowBadge(false);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      const data = await response.json();
      const reply =
        data?.content?.[0]?.text ?? "Sorry, I couldn't get a response. Please try again.";

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please visit our Contact page and our team will get back to you shortly!",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <>
      {/* ── Floating Button ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Tooltip bubble */}
        <AnimatePresence>
          {!open && showBadge && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ delay: 1.5, duration: 0.3 }}
              className="bg-white text-[#0F172A] text-sm font-medium px-4 py-2 rounded-full shadow-lg border border-gray-200 whitespace-nowrap"
            >
              💬 Ask Aria anything!
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 bg-gradient-to-br from-[#0891B2] to-[#059669] rounded-full shadow-xl flex items-center justify-center text-white"
          aria-label="Open AI Assistant"
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

          {/* Pulse ring */}
          {!open && (
            <span className="absolute inset-0 rounded-full animate-ping bg-[#0891B2] opacity-20" />
          )}
        </motion.button>
      </div>

      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0891B2] to-[#059669] px-5 py-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">Aria</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    <p className="text-white/80 text-xs">OutsourcEdge AI • Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition p-1"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4 min-h-0">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {loading && (
                <div className="flex items-end gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-[#0891B2]" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions (only at start) */}
            {messages.length === 1 && !loading && (
              <div className="px-4 pb-3 flex flex-wrap gap-2 flex-shrink-0">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-blue-50 text-[#0891B2] border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 flex-shrink-0 bg-white">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything…"
                disabled={loading}
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#0891B2] focus:ring-2 focus:ring-[#0891B2]/10 transition placeholder-gray-400 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 bg-gradient-to-br from-[#0891B2] to-[#059669] rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition flex-shrink-0"
                aria-label="Send"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Footer */}
            <p className="text-center text-[10px] text-gray-400 pb-2 flex-shrink-0">
              Powered by OutsourcEdge AI • <a href="/contact" className="underline hover:text-[#0891B2]">Talk to a human</a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
  fix: force re-index AiAssistant component
}
