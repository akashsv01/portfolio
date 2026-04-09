import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  personal,
  aboutParagraphs,
  careerTimeline,
  ciscoCombinedTenureSummary,
  experiences,
  githubProjects,
  skillsNetworkGroups,
} from "@/lib/data";
import { certificationSummariesForProfile, certifications } from "@/lib/certifications";
import { honors } from "@/lib/honors";

export type KnowledgeChunk = {
  id: string;
  label: string;
  text: string;
};

type TestimonialsFile = {
  testimonials: {
    id: string;
    name: string;
    title: string;
    company: string;
    linkedin: string;
    date: string;
    relationship: string;
    text: string;
    image: string | null;
  }[];
};

function testimonialsChunksFromPublicJson(): KnowledgeChunk[] {
  try {
    const path = join(process.cwd(), "public", "data", "testimonials.json");
    const raw = readFileSync(path, "utf8");
    const data = JSON.parse(raw) as TestimonialsFile;
    if (!data.testimonials?.length) return [];
    return data.testimonials.map((t) => ({
      id: `testimonial-${t.id}`,
      label: `Testimonial — ${t.name}`,
      text: [
        `Name: ${t.name}`,
        `Role: ${t.title}`,
        t.company ? `Company: ${t.company}` : "",
        `Date: ${t.date}`,
        `Relationship: ${t.relationship}`,
        `LinkedIn (recommender): ${t.linkedin}`,
        "",
        "Recommendation text:",
        t.text,
      ]
        .filter(Boolean)
        .join("\n"),
    }));
  } catch {
    return [];
  }
}

/** Build RAG chunks from site data (single source of truth for the portfolio). */
export function buildKnowledgeChunksFromSite(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];

  chunks.push({
    id: "profile",
    label: "Profile & contact",
    text: [
      `Name: ${personal.name}`,
      `Title: ${personal.title}`,
      `Tagline: ${personal.tagline}`,
      `Sub-tagline: ${personal.subTagline}`,
      `Status: ${personal.status}`,
      `Location: ${personal.location}`,
      `Email: ${personal.email}`,
      `Phone: ${personal.phone}`,
      `LinkedIn: ${personal.linkedin}`,
      `GitHub: ${personal.github}`,
      `Certifications: ${certificationSummariesForProfile()}`,
    ].join("\n"),
  });

  chunks.push({
    id: "hiring-availability",
    label:
      "hiring availability recruiting open to work internship job opportunities contact linkedin email",
    text: [
      "Purpose: Recruiter and employer intent — hiring, availability, internships, full-time, how to reach Akash.",
      "",
      `Stated availability on this portfolio: ${personal.status}`,
      "Akash is pursuing his M.S. in Software Engineering at the University of Maryland, College Park, with coursework and research interests spanning software engineering and AI/ML.",
      "",
      "What he is targeting:",
      "- Summer 2026 internships and software engineering roles (including full-time pipelines where relevant); strong fit for teams that care about production quality and AI/ML applied responsibly.",
      "",
      "Professional experience (summary for recruiters):",
      "- Cisco — Technical Consulting Engineer: GenAI/RAG-style troubleshooting systems, automation ambassador work, Cisco IOS XR at large scale (see Experience chunks for responsibilities and metrics).",
      "- Cisco — Technical Undergraduate Intern: automation and platform-oriented work; CCNA and Cisco DevNet certifications completed during the program.",
      "- S&P Global — Software Engineering Intern: data pipeline / visualization and Angular dashboard work.",
      "- Undergraduate: Gold Medalist and top graduate — Vasavi College of Engineering (details in timeline and honors).",
      "",
      "Strengths often relevant to employers: full-stack development, AI/ML engineering, cloud and data systems, networking platforms, and shipping reliable software under operational pressure.",
      "",
      "How to take the next step:",
      `- Contact: use the Contact section on this site — email ${personal.email}.`,
      `- LinkedIn: ${personal.linkedin}`,
      `- Phone (if appropriate for your process): ${personal.phone}`,
      "Outreach is welcome; treat this as an active search for the right opportunities.",
    ].join("\n"),
  });

  chunks.push({
    id: "about",
    label: "About",
    text: aboutParagraphs.join("\n\n"),
  });

  chunks.push({
    id: "education-gpa",
    label: "GPA grades academic performance CGPA score university rank topper",
    text: "Akash graduated as the Gold Medalist (University Rank 1) from Vasavi College of Engineering, Hyderabad with a 9.78 GPA in B.E. Computer Science & Engineering (2019-2023 batch). He is currently pursuing his M.S. in Software Engineering at the University of Maryland, College Park.",
  });

  for (const t of careerTimeline) {
    chunks.push({
      id: `timeline-${t.id}`,
      label: `${t.title} (${t.period})`,
      text: [
        `Kind: ${t.kind}`,
        `Period: ${t.period}`,
        `Title: ${t.title}`,
        `Place: ${t.subtitle}`,
        `Summary: ${t.summary}`,
      ].join("\n"),
    });
  }

  experiences.forEach((e, i) => {
    chunks.push({
      id: `exp-${i}`,
      label: `${e.role} @ ${e.company}`,
      text: [
        `Role: ${e.role}`,
        `Company: ${e.company}`,
        `Period: ${e.period}`,
        `Location: ${e.location}`,
        `Highlights:\n${e.points.map((p) => `- ${p}`).join("\n")}`,
      ].join("\n"),
    });
  });

  chunks.push({
    id: "cisco-tenure-combined",
    label: "Cisco — combined tenure (intern + full-time)",
    text: ciscoCombinedTenureSummary,
  });

  for (const p of githubProjects) {
    const slug = p.url.split("/").pop() ?? p.title;
    chunks.push({
      id: `project-${slug}`,
      label: `Project: ${p.title}`,
      text: [
        `Title: ${p.title}`,
        `Description: ${p.desc}`,
        `Tech / skills: ${p.skills.join(", ")}`,
        `Repository: ${p.url}`,
      ].join("\n"),
    });
  }

  /** Single chunk so "skills" queries always retrieve the full Skills Network (RAG top-K is small). */
  chunks.push({
    id: "skills-overview",
    label: "Skills — complete list (all categories)",
    text: [
      "This is the complete skills list as shown in the Skills Network on this portfolio. Use every category below when summarizing Akash's skills.",
      "",
      ...skillsNetworkGroups.map(
        (g) => `${g.label}: ${g.items.join(", ")}`
      ),
    ].join("\n"),
  });

  for (const g of skillsNetworkGroups) {
    chunks.push({
      id: `skills-${g.id}`,
      label: `Skills — ${g.label}`,
      text: [
        `Category: ${g.label}`,
        `Description: ${g.description}`,
        `Items: ${g.items.join(", ")}`,
      ].join("\n"),
    });
  }

  /** Featured projects = `githubProjects` on the site (not the full GitHub API index). */
  chunks.push({
    id: "portfolio-featured-projects",
    label: "Featured projects (Projects section on this portfolio)",
    text: [
      "These are the projects highlighted in the Projects section of this portfolio website. When the user asks to view or summarize his projects, mention several of these by name with a short description and repo link — do not enumerate every public repository from GitHub unless they ask for a full repo list or count.",
      "",
      ...githubProjects.map((p, i) => {
        return [
          `${i + 1}. ${p.title}`,
          `   Summary: ${p.desc}`,
          `   Tech: ${p.skills.join(", ")}`,
          `   Repo: ${p.url}`,
        ].join("\n");
      }),
      "",
      `Akash's GitHub profile (all public repos): ${personal.github}`,
    ].join("\n"),
  });

  chunks.push({
    id: "certifications-licenses",
    label: "Licenses and certifications (Cisco / Credly)",
    text: [
      "Akash holds the following credentials (verify on Credly where linked):",
      "",
      ...certifications.map((c) =>
        [
          `— ${c.name}`,
          `  Issuer: ${c.issuer}`,
          `  Issued: ${c.issued}`,
          `  Skills / topics: ${c.skills.join(", ")}`,
          `  Credential URL: ${c.credentialUrl}`,
        ].join("\n")
      ),
    ].join("\n\n"),
  });

  chunks.push({
    id: "honors-awards",
    label: "Honors and awards",
    text: [
      "Honors and recognition listed on the portfolio:",
      "",
      ...honors.map((h) =>
        [
          `— ${h.title}`,
          `  Organization: ${h.organization}`,
          `  Context: ${h.dateLine}`,
          `  Description: ${h.description}`,
        ].join("\n")
      ),
    ].join("\n\n"),
  });

  /** Single overview for navigation + lexical match (names also appear in per-testimonial chunks below). */
  chunks.push({
    id: "portfolio-sections-overview",
    label: "Portfolio sections — overview and key names",
    text: [
      "Main sections on this single-page portfolio: home (hero), about, experience (timeline), projects, skills, terminal, certifications, testimonials, honors, contact.",
      "",
      "Testimonials — LinkedIn-style recommendations on this site are from:",
      "- Jagadeesan Subramani (Leader, Customer Delivery, Cisco Systems India Pvt Ltd)",
      "- Ankit Kapoor (HTTS SP Team Lead at Cisco)",
      "- Naresh Tikader (Software Engineering Technical Leader)",
      "",
      "Certifications (Cisco / Credly) highlighted on this site:",
      "- Cisco Generative AI Blue Belt 2024",
      "- DevNet Associate (CCNA Automation)",
      "- CCNA",
      "",
      "Honors & awards highlighted on this site:",
      "- Gold Medal / Academic Excellence (first in class, Vasavi College of Engineering)",
      "- Young Leader Award (Vasavi College of Engineering)",
      "- Outstanding Student Volunteer (Computer Society of India, Hyderabad Chapter)",
      "",
      `Contact: see Profile chunk for email, phone, LinkedIn, and GitHub (${personal.github}).`,
    ].join("\n"),
  });

  chunks.push(...testimonialsChunksFromPublicJson());

  return chunks;
}

/** Split optional extended markdown by ## headings into chunks. */
export function chunksFromExtendedMarkdown(markdown: string): KnowledgeChunk[] {
  const trimmed = markdown.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/^##\s+/m).filter(Boolean);
  const out: KnowledgeChunk[] = [];

  if (parts.length === 1) {
    out.push({
      id: "extended-manual",
      label: "Extended notes",
      text: parts[0]!.trim(),
    });
    return out;
  }

  for (let i = 0; i < parts.length; i++) {
    const block = parts[i]!.trim();
    const firstLineEnd = block.indexOf("\n");
    const title =
      firstLineEnd === -1 ? block.slice(0, 80) : block.slice(0, firstLineEnd).trim();
    const body = firstLineEnd === -1 ? "" : block.slice(firstLineEnd + 1).trim();
    out.push({
      id: `extended-${i}-${title.slice(0, 24).replace(/\W+/g, "-")}`,
      label: title || `Section ${i + 1}`,
      text: body || block,
    });
  }

  return out;
}
