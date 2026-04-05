export const personal = {
  name: "Akash S Vora",
  title: "Software Engineer",
  roles: ["Software Engineer", "AI/ML Enthusiast", "Problem Solver"],
  tagline:
    "Building intelligent systems where AI, automation, and dependable engineering come together.",
  subTagline: "Masters @ UMD · Gold Medalist · Ex-Cisco.",
  status: "Open to Summer 2026 Internships",
  email: "akashvora301@gmail.com",
  phone: "+1 (240) 927-9928",
  linkedin: "https://linkedin.com/in/akash-s-vora/",
  github: "https://github.com/akashsv01",
  location: "Washington DC / Baltimore Area",
  /** Served from `public/resume.pdf` — set to `null` to hide the terminal `resume` command download. */
  resumePath: "/resume.pdf" as string | null,
};

/** Short snapshot cards for About (no raw metrics — story-first). */
export const aboutHighlights = [
  { title: "Graduate study", desc: "M.S. Software Engineering, University of Maryland" },
  { title: "Industry path", desc: "Shipped products at Cisco and S&P Global" },
  { title: "Recognition", desc: "Gold medal & top graduate — Vasavi College of Engineering" },
  { title: "What I chase", desc: "Software that stays clear and dependable as systems grow" },
] as const;

export const quickFacts = [
  { emoji: "📍", text: "Washington DC / Baltimore Area" },
  { emoji: "🎓", text: "MS Software Engineering, UMD '27" },
  { emoji: "🏅", text: "Gold Medalist - Vasavi College of Engineering" },
  { emoji: "🔧", text: "Ex-Cisco · Ex-S&P Global" },
];

export const aboutParagraphs = [
  "I'm pursuing my M.S. in Software Engineering at the University of Maryland, College Park — after earning a gold medal and graduating at the top of my class from Vasavi College of Engineering in India. That path shaped how I think about rigor, clarity, and shipping work that holds up outside the classroom.",
  "Before graduate school, I spent time at Cisco and S&P Global building systems people relied on every day: from intelligent troubleshooting flows that changed how engineers resolve incidents, to data and automation that cut manual work and sped up decisions. I care about the whole arc — problem, design, rollout, and what happens when things break at scale.",
  "What pulls me in is the space where careful engineering meets new capabilities in AI: not demos, but tools that earn trust in production. I like problems that need both imagination and discipline — the kind where the right abstraction matters as much as the headline feature.",
];

/** Career path — chronological (used by Experience / timeline UI). */
export const careerTimeline = [
  {
    id: "bachelors",
    kind: "education" as const,
    period: "Aug 2019 – Jun 2023",
    title: "Bachelor's in Computer Science & Engineering",
    subtitle: "Vasavi College of Engineering · Hyderabad, India",
    color: "#818cf8",
    summary:
      "I completed my undergraduate degree at Vasavi College of Engineering in Hyderabad, India, graduating with the Gold Medal and as the top-ranked student in my cohort. The program gave me a strong foundation in algorithms, computer systems, and end-to-end software engineering through coursework, labs, and project work.",
  },
  {
    id: "sp-global",
    kind: "internship" as const,
    period: "May 2022 – Aug 2022",
    title: "Software Engineering Intern",
    subtitle: "S&P Global · Hyderabad, India",
    color: "#38bdf8",
    summary:
      "I interned at S&P Global in Hyderabad, India, where I built a data pipeline visualization solution that integrated Python APIs with AWS Lambda and cut manual processing by 67%. I also shipped an interactive Angular dashboard for real-time data visualization, which helped stakeholders reach insights faster during reviews.",
  },
  {
    id: "cisco-intern",
    kind: "internship" as const,
    period: "Jan 2023 – Jun 2023",
    title: "Technical Undergraduate Intern",
    subtitle: "Cisco · Bengaluru, India",
    color: "#0ea5e9",
    summary:
      "I interned at Cisco in Bengaluru, India, and developed an automated resource management system using Angular and Django that improved task allocation efficiency by 35%. During the same program I earned CCNA and Cisco DevNet certifications, which deepened my skills in networking and programmable infrastructure.",
  },
  {
    id: "cisco-fte",
    kind: "fulltime" as const,
    period: "Aug 2023 – Jul 2025",
    title: "Technical Consulting Engineer",
    subtitle: "Cisco · Bengaluru, India",
    color: "#00d4ff",
    summary:
      "I worked as a Technical Consulting Engineer at Cisco in Bengaluru, India, where I helped build a GenAI-based troubleshooting system using retrieval-augmented generation pipelines, which reduced average issue resolution time by 28%. I served as an Automation Ambassador to grow adoption of GenAI and automation across the team, and I supported Cisco IOS XR deployments for 10,000+ users while resolving 95% of network incidents within SLA timelines.",
  },
  {
    id: "masters",
    kind: "education" as const,
    period: "Aug 2025 – Present",
    title: "Master's in Software Engineering",
    subtitle: "University of Maryland · College Park, MD, USA",
    color: "#a78bfa",
    summary:
      "I am pursuing my Master's in Software Engineering at the University of Maryland, College Park, in the United States, with coursework and research interests spanning software engineering and AI/ML.",
  },
] as const;

export const experiences = [
  {
    role: "Technical Consulting Engineer",
    company: "Cisco",
    period: "Aug 2023 – Jul 2025",
    location: "Bengaluru, India",
    color: "#00d4ff",
    points: [
      "Built a GenAI-based troubleshooting system using RAG pipelines, reducing average issue resolution time by 28%.",
      "Served as Automation Ambassador, driving GenAI and automation adoption across the engineering team.",
      "Managed Cisco IOS XR routers for 10,000+ users; resolved 95% of network incidents within SLA timelines.",
    ],
  },
  {
    role: "Technical Undergraduate Intern",
    company: "Cisco",
    period: "Jan 2023 – Jun 2023",
    location: "Bengaluru, India",
    color: "#0ea5e9",
    points: [
      "Developed an Automated Resource Management System using Angular & Django, improving task allocation efficiency by 35%.",
      "Completed CCNA and Cisco DevNet certifications during the internship.",
    ],
  },
  {
    role: "Software Engineering Intern",
    company: "S&P Global",
    period: "May 2022 – Aug 2022",
    location: "Hyderabad, India",
    color: "#38bdf8",
    points: [
      "Engineered a Data Pipeline Visualization solution integrating Python APIs with AWS Lambda, reducing manual processing by 67%.",
      "Built an interactive Angular dashboard for real-time data visualization, accelerating stakeholder insights by 3x.",
    ],
  },
];

/** Public repos — each card links to GitHub. */
export const githubProjects = [
  {
    title: "Phishing Email Detection using Multimodal Deep Learning",
    desc: "Phishing often mimics real brands visually—not just in text. A multimodal fusion model combines CNN towers on email text and embedded logos with metadata (URLs, urgency cues) for phishing vs. legitimate classification.",
    skills: [
      "PyTorch",
      "Python",
      "Multimodal fusion",
      "CNN",
      "NLP",
      "Jupyter",
    ],
    url: "https://github.com/akashsv01/Phishing-Email-Detection-Multimodal-Deep-Learning",
    accent: "#00d4ff",
    icon: "🛡️",
  },
  {
    title: "Poetry GitHub Issues Analytics",
    desc: "Turns Poetry’s GitHub issue history into actionable insight: resolution-time stats by label, ML estimates for open issues, contributor dashboards (engagement, lifecycle, heatmaps), and separate priority vs. complexity predictors for smarter triage. Python CLI with JSON exports and Plotly charts.",
    skills: [
      "Python",
      "scikit-learn",
      "Pandas",
      "Plotly",
      "ML pipelines",
      "JSON analytics",
    ],
    url: "https://github.com/akashsv01/Poetry-Package-Issues-Analytics",
    accent: "#0ea5e9",
    icon: "📈",
  },
  {
    title: "BiteRight",
    desc: "Snap a photo of a dish, list what you need to avoid, and get a grounded risk read: Gemini names the dish, search surfaces real recipes, and parallel scraping plus LLM checks flag likely ingredients.",
    skills: [
      "Next.js",
      "TypeScript",
      "FastAPI",
      "Python",
      "Gemini API",
      "Web scraping",
    ],
    url: "https://github.com/akashsv01/BiteRight",
    accent: "#38bdf8",
    icon: "🍽️",
  },
  {
    title: "Movie Mania",
    desc: "Cinema-style booking: register with email confirmation, login, browse showtimes, pick seats, view or cancel bookings, plus admin movie/inventory control. PHP & MySQL with normalized schema, PHPMailer, responsive Bootstrap—classic LAMP fundamentals.",
    skills: ["PHP", "MySQL", "JavaScript", "Bootstrap", "PHPMailer", "HTML/CSS"],
    url: "https://github.com/akashsv01/Movie-Mania",
    accent: "#7dd3fc",
    icon: "🎬",
  },
  {
    title: "Delightful Drips",
    desc: "IoT theme project for smarter watering: moisture-aware logic over fixed timers, documented circuits, and automation geared to real plant needs. Repo includes hardware narrative, diagrams, and demo assets for sensor-driven irrigation.",
    skills: ["IoT", "Embedded concepts", "Circuit design", "Sensors", "Documentation"],
    url: "https://github.com/akashsv01/Delightful-Drips",
    accent: "#34d399",
    icon: "🌿",
  },
  {
    title: "Traffic Signs Classifier",
    desc: "CNN trained on GTSRB (German traffic signs) for robust classification under varied lighting and backgrounds; strong test accuracy packaged with a small Python GUI for instant image-to-label demos—notebook research meets a usable desktop tool.",
    skills: ["Python", "TensorFlow/Keras", "CNN", "Computer vision", "Tkinter"],
    url: "https://github.com/akashsv01/Traffic-Signs-Classifier-Using-Neural-Networks",
    accent: "#fb923c",
    icon: "🚦",
  },
];

/** Alias for `githubProjects` — keeps older imports and Turbopack HMR from breaking. */
export const projects = githubProjects;

export type SkillNetworkGroup = {
  id: string;
  label: string;
  icon: string;
  description: string;
  color: string;
  items: string[];
};

/** Skills network — orbiting nodes, graph edges, side panel (domains + items below). */
export const skillsNetworkGroups: SkillNetworkGroup[] = [
  {
    id: "languages",
    label: "Languages",
    icon: "⌨️",
    description:
      "Core programming languages I use to build backends, services, and data-facing code — from systems-friendly languages to the staples of web and data stacks.",
    color: "#00d4ff",
    items: ["Python", "Java", "C++", "JavaScript", "TypeScript", "SQL"],
  },
  {
    id: "frontend",
    label: "Frontend",
    icon: "🎨",
    description:
      "User interfaces and client-side engineering — component frameworks, semantic markup, and styling systems that stay fast and maintainable at scale.",
    color: "#0ea5e9",
    items: ["Angular", "React", "Next.js", "HTML", "CSS", "Tailwind", "Bootstrap"],
  },
  {
    id: "backend",
    label: "Backend",
    icon: "⚙️",
    description:
      "Server-side development and APIs — frameworks, integration patterns, and delivery of reliable HTTP services and business logic.",
    color: "#38bdf8",
    items: ["Django", "Node.js", "Spring Boot", "FastAPI", "Flask", "REST APIs", "PHP"],
  },
  {
    id: "data-databases",
    label: "Data & Databases",
    icon: "🗄️",
    description:
      "Data persistence and retrieval — relational engines, document stores, and caching layers chosen to match workload and consistency needs.",
    color: "#34d399",
    items: ["MySQL", "MongoDB", "PostgreSQL", "Redis"],
  },
  {
    id: "cloud-devops",
    label: "Cloud & DevOps",
    icon: "☁️",
    description:
      "Shipping and operating software in production — cloud primitives, containers, version control, and pipelines that keep releases repeatable.",
    color: "#22c55e",
    items: ["AWS", "Docker", "Git", "CI/CD"],
  },
  {
    id: "genai-llms",
    label: "Generative AI & LLMs",
    icon: "✨",
    description:
      "Large language models and generative workflows — API integration, retrieval-augmented design, and tooling to ship LLM features responsibly.",
    color: "#a78bfa",
    items: ["Generative AI", "RAG Pipelines", "LLM Integration", "LangChain"],
  },
  {
    id: "machine-learning",
    label: "Machine Learning",
    icon: "🔬",
    description:
      "Classical and deep learning for structured problems — modeling, NLP, and frameworks for training and evaluating models beyond prompt-only interfaces.",
    color: "#818cf8",
    items: ["Deep Learning", "NLP", "TensorFlow", "PyTorch", "Scikit-learn"],
  },
  {
    id: "core-concepts",
    label: "Core Concepts",
    icon: "📚",
    description:
      "Foundational computer science and engineering practice — algorithms, systems, networking, design discipline, and how teams ship software together.",
    color: "#f59e0b",
    items: [
      "Data Structures & Algorithms",
      "Operating Systems",
      "Computer Networks",
      "System Design",
      "Linux",
      "Agile Development",
    ],
  },
];

/** All directed edges drawn in the skills graph (union of glow relationships). */
export const skillsNetworkEdges: { from: string; to: string }[] = [
  { from: "languages", to: "frontend" },
  { from: "languages", to: "backend" },
  { from: "languages", to: "machine-learning" },
  { from: "languages", to: "genai-llms" },
  { from: "languages", to: "data-databases" },
  { from: "frontend", to: "languages" },
  { from: "frontend", to: "backend" },
  { from: "backend", to: "languages" },
  { from: "backend", to: "data-databases" },
  { from: "backend", to: "cloud-devops" },
  { from: "backend", to: "frontend" },
  { from: "data-databases", to: "backend" },
  { from: "data-databases", to: "languages" },
  { from: "data-databases", to: "machine-learning" },
  { from: "data-databases", to: "cloud-devops" },
  { from: "cloud-devops", to: "backend" },
  { from: "cloud-devops", to: "frontend" },
  { from: "cloud-devops", to: "data-databases" },
  { from: "genai-llms", to: "machine-learning" },
  { from: "genai-llms", to: "backend" },
  { from: "genai-llms", to: "languages" },
  { from: "genai-llms", to: "data-databases" },
  { from: "machine-learning", to: "languages" },
  { from: "machine-learning", to: "backend" },
  { from: "machine-learning", to: "data-databases" },
  { from: "machine-learning", to: "genai-llms" },
  { from: "core-concepts", to: "languages" },
  { from: "core-concepts", to: "frontend" },
  { from: "core-concepts", to: "backend" },
  { from: "core-concepts", to: "data-databases" },
  { from: "core-concepts", to: "cloud-devops" },
  { from: "core-concepts", to: "genai-llms" },
  { from: "core-concepts", to: "machine-learning" },
];

/**
 * When a category node is selected, these directed edges glow (per-domain connection story).
 */
export const skillsNetworkGlowEdgesBySelection: Record<string, { from: string; to: string }[]> = {
  languages: [
    { from: "languages", to: "frontend" },
    { from: "languages", to: "backend" },
    { from: "languages", to: "machine-learning" },
    { from: "languages", to: "genai-llms" },
    { from: "languages", to: "data-databases" },
  ],
  frontend: [
    { from: "frontend", to: "languages" },
    { from: "frontend", to: "backend" },
  ],
  backend: [
    { from: "backend", to: "languages" },
    { from: "backend", to: "data-databases" },
    { from: "backend", to: "cloud-devops" },
    { from: "backend", to: "frontend" },
  ],
  "data-databases": [
    { from: "data-databases", to: "backend" },
    { from: "data-databases", to: "languages" },
    { from: "data-databases", to: "machine-learning" },
    { from: "data-databases", to: "cloud-devops" },
  ],
  "cloud-devops": [
    { from: "cloud-devops", to: "backend" },
    { from: "cloud-devops", to: "frontend" },
    { from: "cloud-devops", to: "data-databases" },
  ],
  "genai-llms": [
    { from: "genai-llms", to: "machine-learning" },
    { from: "genai-llms", to: "backend" },
    { from: "genai-llms", to: "languages" },
    { from: "genai-llms", to: "data-databases" },
  ],
  "machine-learning": [
    { from: "machine-learning", to: "languages" },
    { from: "machine-learning", to: "backend" },
    { from: "machine-learning", to: "data-databases" },
    { from: "machine-learning", to: "genai-llms" },
  ],
  "core-concepts": [
    { from: "core-concepts", to: "languages" },
    { from: "core-concepts", to: "frontend" },
    { from: "core-concepts", to: "backend" },
    { from: "core-concepts", to: "data-databases" },
    { from: "core-concepts", to: "cloud-devops" },
    { from: "core-concepts", to: "genai-llms" },
    { from: "core-concepts", to: "machine-learning" },
  ],
};

/** Whether a directed edge should use the strong glow for the current selection. */
export function skillsNetworkEdgeGlowsForSelection(
  selectedId: string | null,
  from: string,
  to: string
): boolean {
  if (!selectedId) return false;
  const list = skillsNetworkGlowEdgesBySelection[selectedId];
  if (!list) return false;
  return list.some((e) => e.from === from && e.to === to);
}

export const skillCategories = [
  { 
    title: "Languages", 
    items: ["Python", "Java", "C++", "JavaScript", "TypeScript", "SQL"], 
    color: "#00d4ff", 
    icon: "⌨️" 
  },
  { 
    title: "Frontend", 
    items: ["Angular", "React", "Next.js", "HTML", "CSS", "Tailwind", "Bootstrap"], 
    color: "#0ea5e9", 
    icon: "🎨" 
  },
  { 
    title: "Backend", 
    items: ["Django", "Node.js", "Spring Boot", "FastAPI", "Flask", "REST APIs", "PHP"], 
    color: "#38bdf8", 
    icon: "🔧" 
  },
  { 
    title: "Data & Databases", 
    items: ["MySQL", "MongoDB", "PostgreSQL", "Redis"], 
    color: "#34d399", 
    icon: "🗄️" 
  },
  { 
    title: "Cloud & DevOps", 
    items: ["AWS", "Docker", "Git", "CI/CD"], 
    color: "#22c55e", 
    icon: "☁️" 
  },
  {
    title: "Generative AI & LLMs",
    items: ["Generative AI", "RAG Pipelines", "LLM Integration", "LangChain"],
    color: "#a78bfa",
    icon: "✨",
  },
  {
    title: "Machine Learning",
    items: ["Deep Learning", "NLP", "TensorFlow", "PyTorch", "Scikit-learn"],
    color: "#818cf8",
    icon: "🔬",
  },
  { 
    title: "Core Concepts", 
    items: ["Data Structures & Algorithms", "Operating Systems", "Computer Networks", "System Design", "Linux", "Agile Development"], 
    color: "#f59e0b", 
    icon: "📚" 
  }
];

export const certifications = [
  "Generative AI Blue Belt - Cisco",
  "DevNet - Cisco",
  "CCNA - Cisco",
];

export const navSections = [
  "about",
  "experience",
  "projects",
  "skills",
  "terminal",
  "contact",
] as const;
export type NavSection = (typeof navSections)[number];
