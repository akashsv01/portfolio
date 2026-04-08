/** Shared Cisco mark for Licenses & Certifications cards */
export const CISCO_ISSUER_LOGO = "/certifications/cisco-logo.png" as const;

export type Certification = {
  id: string;
  name: string;
  issuer: string;
  issuerUrl?: string;
  issued: string;
  credentialUrl: string;
  skills: string[];
  /** Official badge artwork */
  badgeImage: string;
};

export const certifications: Certification[] = [
  {
    id: "genai-blue-belt",
    name: "Cisco Generative AI Blue Belt 2024",
    issuer: "Cisco",
    issuerUrl: "https://www.cisco.com/",
    issued: "Sep 2024",
    credentialUrl:
      "https://www.credly.com/badges/fa60625d-a377-419a-9c4d-0e5b172868b4/public_url",
    skills: ["Generative AI", "Data Science"],
    badgeImage: "/certifications/gen-ai-blue-belt-2024.png",
  },
  {
    id: "devnet-associate",
    name: "DevNet Associate (CCNA Automation)",
    issuer: "Cisco",
    issuerUrl: "https://www.cisco.com/",
    issued: "Jun 2023",
    credentialUrl:
      "https://www.credly.com/badges/c2b8b237-b911-449d-9f4b-75e354e101e5",
    skills: ["Network Automation", "DevNet"],
    badgeImage: "/certifications/devnet-associate-automation.png",
  },
  {
    id: "ccna",
    name: "CCNA",
    issuer: "Cisco",
    issuerUrl: "https://www.cisco.com/",
    issued: "Apr 2023",
    credentialUrl:
      "https://www.credly.com/badges/a9e9f05b-f0d3-48ce-b83e-d25d17291f32/public_url",
    skills: ["Networking", "Routing & Switching"],
    badgeImage: "/certifications/ccna.png",
  },
];

/** One-line list for profile / RAG chunks */
export function certificationSummariesForProfile(): string {
  return certifications.map((c) => `${c.name} (${c.issuer})`).join("; ");
}
