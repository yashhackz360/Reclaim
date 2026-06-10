import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reclaim — Take back what matters",
  description:
    "Your attention belongs to you. Reclaim blocks YouTube Shorts, Instagram Reels, TikTok and short-form content across every device. Free and open source.",
  keywords: [
    "block youtube shorts", "block tiktok", "block instagram reels",
    "screen time", "focus", "digital wellbeing", "open source",
    "doom scrolling", "attention", "reclaim",
  ],
  openGraph: {
    title: "Reclaim — Take back what matters",
    description: "Your attention belongs to you.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reclaim — Take back what matters",
    description: "Your attention belongs to you.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
