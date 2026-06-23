import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://models.evertune.ai';

export const metadata: Metadata = {
  title: "AI Model Release Tracker — Evertune",
  description: "Track every major AI model release from OpenAI, Anthropic, Google, Meta, DeepSeek, and more. Updated daily with release dates, descriptions, and official announcements.",
  metadataBase: new URL(BASE_URL),
  alternates: {
    canonical: BASE_URL,
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    title: "AI Model Release Tracker — Evertune",
    description: "Track every major AI model release from OpenAI, Anthropic, Google, Meta, DeepSeek, and more. Updated daily.",
    url: BASE_URL,
    siteName: "Evertune AI Model Tracker",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "AI Model Release Tracker — Evertune",
    description: "Track every major AI model release from OpenAI, Anthropic, Google, Meta, DeepSeek, and more. Updated daily.",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: 'pIhUDgchkW0yENhNqAfWSiOvw8gBG6PEcF-ytYo8uxk',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
