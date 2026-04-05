"use client";

import { useState, type FormEvent, type CSSProperties } from "react";
import FadeIn from "@/components/ui/FadeIn";
import SectionLabel from "@/components/ui/SectionLabel";
import GlowOrb from "@/components/ui/GlowOrb";
import { personal } from "@/lib/data";

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "var(--font-dm-sans), sans-serif",
  fontSize: 15,
  color: "var(--text)",
  background: "rgba(0,212,255,0.04)",
  border: "1px solid rgba(0,212,255,0.12)",
  borderRadius: 12,
  padding: "14px 16px",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrMsg("");

    /** Inlined at build time — must be NEXT_PUBLIC_* and match Web3Forms dashboard. */
    const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();
    if (!accessKey) {
      setStatus("error");
      setErrMsg(
        "Automatic delivery isn’t active: set NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY in .env.local (your Web3Forms key), restart the dev server, and add the same variable on Vercel then redeploy. Until then, use “Say Hello” above."
      );
      return;
    }

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          name: form.name,
          email: form.email,
          message: form.message,
          subject: `Portfolio: ${form.name}`,
          from_name: form.name,
          replyto: form.email,
        }),
      });
      const raw = await res.text();
      const cleaned = raw.replace(/^\uFEFF/, "").trim();
      let data: { success?: boolean; message?: string } = {};
      if (cleaned) {
        try {
          data = JSON.parse(cleaned) as typeof data;
        } catch {
          setStatus("error");
          setErrMsg(
            "The email service returned a non-JSON response. Check your Web3Forms access key and dashboard settings."
          );
          return;
        }
      }

      if (!res.ok || !data.success) {
        setStatus("error");
        setErrMsg(data.message || "Could not send. Try the Say Hello button or email directly.");
        return;
      }

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
      setErrMsg("Network error. Please email directly.");
    }
  }

  return (
    <section
      id="contact"
      style={{
        padding: "120px 32px 100px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <GlowOrb
        top="20%"
        left="50%"
        color="rgba(0,212,255,0.06)"
        size={600}
        opacity={0.8}
      />

      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <FadeIn>
          <SectionLabel text="Get In Touch" />
        </FadeIn>

        <FadeIn delay={0.1}>
          <h2
            style={{
              fontFamily: "var(--font-syne), sans-serif",
              fontWeight: 800,
              fontSize: "clamp(28px, 5vw, 48px)",
              color: "var(--text)",
              letterSpacing: "-1.5px",
              margin: "0 0 20px",
              lineHeight: 1.15,
            }}
          >
            Let&apos;s build something
            <br />
            <span className="gradient-text">remarkable together.</span>
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 16,
              color: "var(--text-muted)",
              lineHeight: 1.8,
              marginBottom: 44,
              maxWidth: 560,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            I&apos;m actively looking for{" "}
            <span style={{ color: "var(--accent)", fontWeight: 500 }}>
              Summer 2026 internship opportunities
            </span>{" "}
            in software engineering, AI/ML, and backend systems. Let&apos;s connect!
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <a
            href={`mailto:${personal.email}`}
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 16,
              fontWeight: 600,
              padding: "16px 52px",
              borderRadius: 14,
              display: "inline-block",
              background: "linear-gradient(135deg, #0ea5e9, #00d4ff)",
              color: "#050d1a",
              textDecoration: "none",
              boxShadow:
                "0 4px 32px rgba(0,212,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              transition: "all 0.25s",
              letterSpacing: "0.3px",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(-3px) scale(1.02)";
              el.style.boxShadow =
                "0 12px 48px rgba(0,212,255,0.45), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.transform = "translateY(0) scale(1)";
              el.style.boxShadow =
                "0 4px 32px rgba(0,212,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)";
            }}
          >
            Say Hello →
          </a>
        </FadeIn>

        <FadeIn delay={0.42}>
          <div
            style={{
              display: "flex",
              gap: 28,
              justifyContent: "center",
              marginTop: 40,
              flexWrap: "wrap",
            }}
          >
            {[
              { icon: "✉️", text: personal.email },
              { icon: "📱", text: personal.phone },
            ].map(({ icon, text }) => (
              <span
                key={text}
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: 12,
                  color: "var(--muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  letterSpacing: "0.2px",
                }}
              >
                {icon} {text}
              </span>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.52}>
          <div
            style={{
              display: "flex",
              gap: 14,
              justifyContent: "center",
              marginTop: 32,
            }}
          >
            {[
              { href: personal.linkedin, label: "LinkedIn" },
              { href: personal.github, label: "GitHub" },
            ].map(({ href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: 11,
                  color: "var(--muted)",
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(0,212,255,0.1)",
                  transition: "all 0.25s",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "var(--accent)";
                  el.style.borderColor = "rgba(0,212,255,0.3)";
                  el.style.background = "rgba(0,212,255,0.05)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "var(--muted)";
                  el.style.borderColor = "rgba(0,212,255,0.1)";
                  el.style.background = "transparent";
                }}
              >
                {label} ↗
              </a>
            ))}
          </div>
        </FadeIn>

        <FadeIn delay={0.58}>
          <div
            style={{
              marginTop: 56,
              paddingTop: 48,
              borderTop: "1px solid rgba(0,212,255,0.08)",
              maxWidth: 520,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-dm-mono), monospace",
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                margin: "0 0 24px",
              }}
            >
              Send a message
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ textAlign: "left" }}
              noValidate
              suppressHydrationWarning
            >
              <label
                htmlFor="contact-name"
                style={{
                  display: "block",
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: 11,
                  color: "var(--muted)",
                  marginBottom: 8,
                  letterSpacing: "0.06em",
                }}
              >
                Name
              </label>
              <input
                id="contact-name"
                name="name"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                suppressHydrationWarning
                style={{ ...inputStyle, marginBottom: 18 }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,212,255,0.35)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,212,255,0.12)";
                  e.target.style.boxShadow = "none";
                }}
              />

              <label
                htmlFor="contact-email"
                style={{
                  display: "block",
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: 11,
                  color: "var(--muted)",
                  marginBottom: 8,
                  letterSpacing: "0.06em",
                }}
              >
                Email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                suppressHydrationWarning
                style={{ ...inputStyle, marginBottom: 18 }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,212,255,0.35)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,212,255,0.12)";
                  e.target.style.boxShadow = "none";
                }}
              />

              <label
                htmlFor="contact-message"
                style={{
                  display: "block",
                  fontFamily: "var(--font-dm-mono), monospace",
                  fontSize: 11,
                  color: "var(--muted)",
                  marginBottom: 8,
                  letterSpacing: "0.06em",
                }}
              >
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                suppressHydrationWarning
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  minHeight: 120,
                  marginBottom: 22,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(0,212,255,0.35)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0,212,255,0.12)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {status === "error" && (
                <p
                  role="alert"
                  style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 14,
                    color: "#f87171",
                    margin: "0 0 16px",
                  }}
                >
                  {errMsg}
                </p>
              )}

              {status === "success" && (
                <p
                  style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 14,
                    color: "#34d399",
                    margin: "0 0 16px",
                  }}
                >
                  Thanks — your message is on its way. I&apos;ll get back to you soon.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                suppressHydrationWarning
                style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 15,
                  fontWeight: 600,
                  padding: "14px 28px",
                  borderRadius: 12,
                  border: "none",
                  cursor: status === "loading" ? "wait" : "pointer",
                  opacity: status === "loading" ? 0.75 : 1,
                  background: "linear-gradient(135deg, rgba(14,165,233,0.25), rgba(0,212,255,0.15))",
                  color: "var(--text)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: "rgba(0,212,255,0.35)",
                  boxShadow: "0 4px 24px rgba(0,212,255,0.12)",
                  width: "100%",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
              >
                {status === "loading" ? "Sending…" : "Send message"}
              </button>
            </form>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
