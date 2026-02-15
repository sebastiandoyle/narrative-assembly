import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://narrative-assembly.vercel.app"),
  title: "Narrative Assembly — What is the BBC saying?",
  description:
    "Explore how BBC News covers topics by assembling narrative threads from real transcripts. An educational tool for media literacy.",
  keywords: ["BBC", "media analysis", "narrative", "transcript", "media literacy"],
  openGraph: {
    title: "Narrative Assembly",
    description: "How narratives are mechanically constructed from real media clips",
    url: "https://narrative-assembly.vercel.app",
    siteName: "Narrative Assembly",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Narrative Assembly",
    description: "How narratives are mechanically constructed from real media clips",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
