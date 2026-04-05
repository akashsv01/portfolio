import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/favicon.png", type: "image/png" }],
  },
  title: "Akash S Vora - Software Engineer",
  description:
    "Portfolio of Akash S Vora - Software Engineer, AI/ML Enthusiast. Masters @ UMD · Gold Medalist · Ex-Cisco.",
  keywords: [
    "Akash S Vora",
    "Software Engineer",
    "AI/ML",
    "React",
    "Next.js",
    "Python",
    "UMD",
    "Cisco",
  ],
  authors: [{ name: "Akash Vora" }],
  openGraph: {
    title: "Akash Vora — Software Engineer",
    description:
      "Portfolio of Akash Vora — Software Engineer, AI/ML Enthusiast.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}
      style={{ scrollBehavior: "smooth" }}
    >
      <body className="antialiased overflow-x-hidden">
        <div className="scanlines fixed inset-0 pointer-events-none" style={{ zIndex: 998 }} />
        {children}
      </body>
    </html>
  );
}
