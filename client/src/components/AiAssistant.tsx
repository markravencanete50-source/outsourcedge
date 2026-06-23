import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Bot, User, Loader2, Sparkles, ChevronDown } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

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
          className="w-2 h-2 bg-[#1B3A4B] rounded-full"
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
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser
            ? "bg-gradient-to-br from-[#1B3A4B] to-[#059669]"
            : "bg-gray-100 border border-gray-200"
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-white" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-[#1B3A4B]" />
        )}
      </div>

      <div
        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? "bg-gradient-to-br from-[#1B3A4B] to-[#059669] text-white rounded-br-sm"
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
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Call our secure server-side proxy — API key never touches the browser
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data?.reply ?? "Sorry, I couldn't get a response. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
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
          className="relative w-14 h-14 bg-gradient-to-br from-[#1B3A4B] to-[#059669] rounded-full shadow-xl flex items-center justify-center text-white"
          aria-label="Open AI Assistant"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Sparkles className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {!open && (
            <span className="absolute inset-0 rounded-full animate-ping bg-[#1B3A4B] opacity-20" />
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
            <div className="bg-gradient-to-r from-[#1B3A4B] to-[#059669] px-5 py-4 flex items-center justify-between flex-shrink-0">
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
                    <Bot className="w-3.5 h-3.5 text-[#1B3A4B]" />
                  </div>
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm">
                    <TypingDots />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions — shown only at conversation start */}
            {messages.length === 1 && !loading && (
              <div className="px-4 pb-3 flex flex-wrap gap-2 flex-shrink-0">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-blue-50 text-[#1B3A4B] border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 transition font-medium"
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
                className="flex-1 text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-[#1B3A4B] focus:ring-2 focus:ring-[#1B3A4B]/10 transition placeholder-gray-400 disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={loading || !input.trim()}
                className="w-9 h-9 bg-gradient-to-br from-[#1B3A4B] to-[#059669] rounded-xl flex items-center justify-center text-white disabled:opacity-40 hover:opacity-90 transition flex-shrink-0"
                aria-label="Send message"
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
              Powered by OutsourcEdge AI •{" "}
              <a href="/contact" className="underline hover:text-[#1B3A4B]">
                Talk to a human
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
