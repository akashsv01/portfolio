"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/ui/Navbar";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import CareerTimeline from "@/components/sections/CareerTimeline";
import Projects from "@/components/sections/Projects";
import Skills from "@/components/sections/Skills";
import TerminalSection from "@/components/sections/TerminalSection";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";
import { navSections } from "@/lib/data";

const ConstellationBG = dynamic(
  () => import("@/components/ui/ConstellationBG"),
  { ssr: false }
);

export default function Home() {
  const [active, setActive] = useState<string>("home");

  useEffect(() => {
    const allSections = ["home", ...navSections];
    const handler = () => {
      const offsets = allSections
        .map((id) => {
          const el = document.getElementById(id);
          return el ? { id, top: Math.abs(el.getBoundingClientRect().top - 120) } : null;
        })
        .filter(Boolean) as { id: string; top: number }[];
      if (offsets.length === 0) return;
      const closest = offsets.reduce((a, b) => (b.top < a.top ? b : a));
      setActive(closest.id);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        color: "var(--text)",
        position: "relative",
      }}
    >
      <ConstellationBG />
      <Navbar active={active} />
      <Hero />
      <About />
      <CareerTimeline />
      <Projects />
      <Skills />
      <TerminalSection />
      <Contact />
      <Footer />
    </main>
  );
}
