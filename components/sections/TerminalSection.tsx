"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import SectionLabel from "@/components/ui/SectionLabel";
import GlowOrb from "@/components/ui/GlowOrb";
import { personal, skillCategories, experiences } from "@/lib/data";

type Line = { type: "in" | "out"; text: string };

function formatSkillsBlock(): string {
  return skillCategories
    .map(
      (c) =>
        `\n[ ${c.title} ]\n${c.items.map((x) => `  • ${x}`).join("\n")}`
    )
    .join("\n");
}

function runCommand(raw: string): string[] {
  const cmd = raw.trim().toLowerCase();
  if (!cmd) return [];

  if (cmd === "help") {
    return [
      "Commands:",
      "  whoami     — your host speaks",
      "  skills     — stack by category",
      "  experience — roles & companies",
      "  resume     — download resume",
      "  contact    — email & links",
      "  clear      — reset terminal",
    ];
  }
  if (cmd === "whoami") return [personal.name];
  if (cmd === "skills") {
    return [`Skills (by category):`, formatSkillsBlock()];
  }
  if (cmd === "experience") {
    return experiences.flatMap((e) => [
      `— ${e.role} @ ${e.company} (${e.period})`,
      `  ${e.location}`,
    ]);
  }
  if (cmd === "resume") {
    if (personal.resumePath) {
      return [
        "Downloading resume…",
        `If nothing happens, open ${personal.resumePath} in your browser.`,
      ];
    }
    return [
      "No résumé file configured.",
      "Add `resume.pdf` to /public and set personal.resumePath in lib/data.ts to `/resume.pdf`.",
    ];
  }
  if (cmd === "contact") {
    return [
      `Email: ${personal.email}`,
      `Phone: ${personal.phone}`,
      `LinkedIn: ${personal.linkedin}`,
      `GitHub: ${personal.github}`,
    ];
  }
  if (cmd === "clear") return [];

  return [`command not found: ${raw.trim()}. Type help`];
}

export default function TerminalSection() {
  const [lines, setLines] = useState<Line[]>([
    { type: "out", text: "akash@portfolio:~$ Welcome. Type `help` for commands." },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  /** Scroll only the terminal body — not `scrollIntoView`, which scrolls the whole page. */
  useEffect(() => {
    const el = bottomRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const submit = () => {
    const cmd = input.trim();
    if (!cmd) return;

    if (cmd.toLowerCase() === "clear") {
      setInput("");
      setLines([{ type: "out", text: "akash@portfolio:~$ " }]);
      return;
    }

    setLines((prev) => [...prev, { type: "in", text: `akash@portfolio:~$ ${cmd}` }]);
    setInput("");

    const out = runCommand(cmd);
    if (cmd.toLowerCase() === "resume" && personal.resumePath) {
      setLines((prev) => [
        ...prev,
        ...out.map((t) => ({ type: "out" as const, text: t })),
      ]);
      const path = personal.resumePath;
      const filename = path.split("/").pop() || "resume.pdf";
      void (async () => {
        try {
          const res = await fetch(path);
          if (!res.ok) throw new Error("fetch failed");
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          a.rel = "noopener noreferrer";
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        } catch {
          window.open(path, "_blank", "noopener,noreferrer");
        }
      })();
      return;
    }
    if (out.length) {
      setLines((prev) => [...prev, ...out.map((t) => ({ type: "out" as const, text: t }))]);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  return (
    <section
      id="terminal"
      style={{ padding: "100px 32px 120px", position: "relative", overflow: "hidden" }}
    >
      <GlowOrb top="40%" right="-5%" color="rgba(129,140,248,0.06)" size={420} />

      <div style={{ maxWidth: 720, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <SectionLabel text="Terminal" />

        <div
          style={{
            marginTop: 24,
            borderRadius: 16,
            border: "1px solid rgba(0,212,255,0.15)",
            background: "rgba(5, 13, 26, 0.85)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.35)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "1px solid rgba(0,212,255,0.1)",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-dm-mono), monospace",
              fontSize: 11,
              color: "var(--muted)",
            }}
          >
            <span style={{ display: "flex", gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f56" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ffbd2e" }} />
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#27c93f" }} />
            </span>
            <span style={{ marginLeft: 8 }}>akash@portfolio — zsh</span>
          </div>

          <div
            ref={bottomRef}
            style={{
              padding: "18px 20px 22px",
              minHeight: 280,
              maxHeight: 420,
              overflowY: "auto",
              fontFamily: "var(--font-dm-mono), monospace",
              fontSize: 12,
              lineHeight: 1.65,
              color: "#a8e6ff",
            }}
          >
            {lines.map((line, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: line.type === "in" ? "#7dd3fc" : "#b8e8ff",
                }}
              >
                {line.text}
              </div>
            ))}

            <form onSubmit={onSubmit} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12 }}>
              <span style={{ color: "#34d399", flexShrink: 0 }}>akash@portfolio:~$</span>
              {/* suppressHydrationWarning: password-manager / form extensions often add attrs to inputs */}
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                aria-label="Terminal command"
                suppressHydrationWarning
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  color: "#e8f8ff",
                  fontFamily: "inherit",
                  fontSize: 12,
                  minWidth: 0,
                }}
              />
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
