export type Honor = {
  id: string;
  title: string;
  organization: string;
  /** Shown in uppercase accent line */
  dateLine: string;
  description: string;
  /**
   * Optional certificate image — place files in `public/awards/` and set e.g. `/awards/gold-medal.png`.
   * If omitted or load fails, a gradient placeholder is shown.
   */
  imageSrc?: string | null;
  /** Fallback when no image */
  placeholderGradient: string;
};

export const honors: Honor[] = [
  {
    id: "vce-gold-medal",
    title: "Gold Medal - Academic Excellence",
    organization: "Vasavi College of Engineering",
    dateLine: "B.E. CSE · Batch 2019–2023",
    description:
      "Awarded for achieving the highest academic performance across the graduating class, demonstrating consistent excellence throughout the undergraduate program.",
    imageSrc: "/awards/gold-medal.png",
    placeholderGradient: "linear-gradient(145deg, rgba(212,175,55,0.25), rgba(0,212,255,0.08))",
  },
  {
    id: "young-leader",
    title: "Young Leader Award",
    organization: "Vasavi College of Engineering",
    dateLine: "2022–23 · CSE",
    description:
      "Recognized for exceptional leadership qualities, initiative, and the ability to inspire and guide peers in both academic and extracurricular settings.",
    imageSrc: "/awards/young-leader.png",
    placeholderGradient: "linear-gradient(145deg, rgba(34,197,94,0.2), rgba(0,212,255,0.1))",
  },
  {
    id: "csi-volunteer",
    title: "Outstanding Student Volunteer",
    organization: "Computer Society of India",
    dateLine: "May 2023 · Hyderabad Chapter",
    description:
      "Honored for significant contributions as a student volunteer, actively organizing events, driving community engagement, and supporting the mission of CSI.",
    imageSrc: "/awards/csi-volunteer.png",
    placeholderGradient: "linear-gradient(145deg, rgba(234,179,8,0.22), rgba(0,212,255,0.08))",
  },
];
