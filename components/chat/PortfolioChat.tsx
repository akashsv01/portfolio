"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type ChatRole = "user" | "assistant";

type ChatMsg = { role: ChatRole; content: string };

const BOT_NAME = "ASV.ai";
const FAB_TOOLTIP = "Ask ASV.ai anything about me";
/** Official ASV.ai lockup (icon + wordmark), served from `public/chat/`. */
const ASV_AI_LOGO_SRC = "/chat/asv-ai-logo.png";

const QUICK_CHIPS = [
  "What are Akash's skills?",
  "Tell me about his experience",
  "View his projects",
  "What certifications does he have?",
] as const;

const WELCOME: ChatMsg = {
  role: "assistant",
  content:
    `Hi — I'm ${BOT_NAME}. Ask me about Akash's skills, experience, projects, certifications, testimonials, honors, or his public GitHub repos. What would you like to know?`,
};

const VALID_SECTIONS = new Set([
  "about",
  "experience",
  "projects",
  "skills",
  "terminal",
  "certifications",
  "testimonials",
  "honors",
  "contact",
]);

function sectionLabel(id: string): string {
  const map: Record<string, string> = {
    about: "About",
    experience: "Experience",
    projects: "Projects",
    skills: "Skills",
    terminal: "Terminal",
    certifications: "Certifications",
    testimonials: "Testimonials",
    honors: "Honors & Awards",
    contact: "Contact",
  };
  return map[id] ?? id;
}

/** Renders `**bold**`, and `‹section-id›` as in-page anchor links. */
function AssistantMessageBody({ text }: { text: string }): ReactNode {
  const tokenRe = /(\*\*[^*]+\*\*|‹[^›]+›)/g;
  const parts = text.split(tokenRe);

  return (
    <>
      {parts.map((part, i) => {
        const bold = part.match(/^\*\*([\s\S]+)\*\*$/);
        if (bold) {
          return (
            <strong
              key={i}
              style={{
                fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                fontWeight: 600,
                color: "var(--text)",
              }}
            >
              {bold[1]}
            </strong>
          );
        }
        const nav = part.match(/^‹([^›]+)›$/);
        if (nav) {
          const id = nav[1]!.trim().toLowerCase();
          const href = VALID_SECTIONS.has(id) ? `#${id}` : `#${id}`;
          return (
            <a
              key={i}
              href={href}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
              }}
              style={{
                fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
                color: "var(--accent)",
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              {sectionLabel(id)}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function AsvAiAvatar() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={ASV_AI_LOGO_SRC}
      alt=""
      className="portfolio-chat-logo-avatar"
      width={28}
      height={28}
      draggable={false}
    />
  );
}

function ChatIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3C7.03 3 3 6.58 3 11c0 2.13 1.17 4.05 3 5.35V21l4.34-2.6c.9.25 1.85.4 2.66.4 4.97 0 9-3.58 9-8s-4.03-8-9-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 11h.01M12 11h.01M15.5 11h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PortfolioChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const hasUserMessage = useMemo(() => messages.some((m) => m.role === "user"), [messages]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => textareaRef.current?.focus(), 220);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /** Keep input visible when mobile keyboard opens */
  useEffect(() => {
    const ta = textareaRef.current;
    const panel = panelRef.current;
    if (!open || !ta || !panel) return;

    const onFocus = () => {
      window.setTimeout(() => {
        ta.scrollIntoView({ block: "end", behavior: "smooth" });
      }, 280);
    };

    const vv = window.visualViewport;
    const onViewport = () => {
      if (!vv) return;
      const h = window.innerHeight - vv.height;
      if (h > 80) {
        panel.style.maxHeight = `min(560px, ${Math.max(vv.height - 24, 280)}px)`;
      } else {
        panel.style.maxHeight = "";
      }
    };

    ta.addEventListener("focus", onFocus);
    vv?.addEventListener("resize", onViewport);
    return () => {
      ta.removeEventListener("focus", onFocus);
      vv?.removeEventListener("resize", onViewport);
      panel.style.maxHeight = "";
    };
  }, [open]);

  const sendWithText = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || loading) return;

      const nextUser: ChatMsg = { role: "user", content: text };
      const payload = [...messages, nextUser].map(({ role, content }) => ({ role, content }));

      setInput("");
      setMessages((m) => [...m, nextUser]);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: payload }),
        });
        const data = (await res.json()) as { reply?: string; error?: string };

        if (!res.ok) {
          setMessages((m) => [
            ...m,
            {
              role: "assistant",
              content:
                data.error ??
                "Something went wrong. If chat is not configured, set GROQ_API_KEY in .env.local (Groq) and restart the dev server.",
            },
          ]);
          return;
        }

        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.reply?.trim() || "No reply returned." },
        ]);
      } catch {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: "Network error. Check your connection and try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  const send = useCallback(() => {
    void sendWithText(input);
  }, [input, sendWithText]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  return (
    <div className="portfolio-chat-root">
      <div
        className="portfolio-chat-fab-stack"
        data-open={open ? "true" : "false"}
        data-panel-open={open ? "true" : "false"}
      >
        <span className="portfolio-chat-fab-tooltip">{FAB_TOOLTIP}</span>
        <div className="portfolio-chat-fab-ring" aria-hidden />
        <motion.button
          type="button"
          className="portfolio-chat-fab-btn"
          aria-label={open ? `Close ${BOT_NAME}` : `Open ${BOT_NAME}`}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          suppressHydrationWarning
        >
          <motion.span
            animate={open ? { rotate: 90 } : { rotate: 0 }}
            style={{ display: "flex" }}
          >
            {open ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <ChatIcon size={26} />
            )}
          </motion.span>
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close assistant overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              suppressHydrationWarning
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10030,
                border: "none",
                padding: 0,
                margin: 0,
                background: "rgba(2, 8, 18, 0.55)",
                backdropFilter: "blur(6px)",
                cursor: "pointer",
              }}
            />
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="portfolio-chat-title"
              className="portfolio-chat-panel"
              initial={{ opacity: 0, x: 28, y: 36 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 20, y: 28 }}
              transition={{ type: "spring", stiffness: 360, damping: 30 }}
            >
              <div className="portfolio-chat-header">
                <div className="portfolio-chat-header-inner">
                  <div className="portfolio-chat-brand">
                    <div className="portfolio-chat-brand-logo">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        id="portfolio-chat-title"
                        src={ASV_AI_LOGO_SRC}
                        alt={BOT_NAME}
                        className="portfolio-chat-logo-header"
                        width={180}
                        height={48}
                        draggable={false}
                      />
                    </div>
                    <div className="portfolio-chat-brand-text">
                      <div className="portfolio-chat-title-row portfolio-chat-title-meta">
                        <span className="portfolio-chat-status-dot" aria-hidden />
                        <span className="portfolio-chat-online-label">Online</span>
                      </div>
                      <p className="portfolio-chat-subtitle">Ask me anything about Akash</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="portfolio-chat-close-btn"
                    onClick={() => setOpen(false)}
                    aria-label="Close chat"
                    suppressHydrationWarning
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M6 6l12 12M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                ref={scrollRef}
                className="portfolio-chat-scroll"
              >
                {messages.map((m, i) =>
                  m.role === "assistant" ? (
                    <motion.div
                      key={`${i}-a-${m.content.slice(0, 20)}`}
                      className="portfolio-chat-bot-row"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="portfolio-chat-avatar-wrap" aria-hidden>
                        <AsvAiAvatar />
                      </div>
                      <div className="portfolio-chat-msg-bot">
                        <AssistantMessageBody text={m.content} />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`${i}-u-${m.content.slice(0, 20)}`}
                      className="portfolio-chat-user-row"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="portfolio-chat-msg-user">{m.content}</div>
                    </motion.div>
                  )
                )}
                {loading && (
                  <div className="portfolio-chat-bot-row" aria-live="polite" aria-busy="true">
                    <div className="portfolio-chat-avatar-wrap" aria-hidden>
                      <AsvAiAvatar />
                    </div>
                    <div className="portfolio-chat-msg-bot portfolio-chat-typing-bubble">
                      <span className="portfolio-chat-typing-dot" />
                      <span className="portfolio-chat-typing-dot" />
                      <span className="portfolio-chat-typing-dot" />
                    </div>
                  </div>
                )}
              </div>

              <div className="portfolio-chat-footer">
                {!hasUserMessage && (
                  <div className="portfolio-chat-chips" role="group" aria-label="Suggested prompts">
                    {QUICK_CHIPS.map((label) => (
                      <button
                        key={label}
                        type="button"
                        className="portfolio-chat-chip"
                        onClick={() => void sendWithText(label)}
                        disabled={loading}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="portfolio-chat-input-row">
                  <div className="portfolio-chat-input-shell">
                    <textarea
                      ref={textareaRef}
                      className="portfolio-chat-input-field"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={onKeyDown}
                      placeholder="Ask anything about the portfolio…"
                      rows={1}
                      disabled={loading}
                      suppressHydrationWarning
                    />
                  </div>
                  <button
                    type="button"
                    className="portfolio-chat-send"
                    onClick={() => void send()}
                    disabled={loading || !input.trim()}
                    aria-label="Send message"
                    suppressHydrationWarning
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
