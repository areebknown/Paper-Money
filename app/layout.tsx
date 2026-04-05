import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ConditionalBottomNav from "@/components/ConditionalBottomNav";
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
  title: "Bid Wars | The Ultimate Virtual Bidding Game",
  description: "Join the virtual bidding challenge, collect legendary artifacts, and climb the SSS+ ranks using 100% Paper Money.",
  other: {
    "google-site-verification": "P2F-6nBdLydsbkhJ3hlPteWEJhG-SPtqIYeBz04tKqI",
  },
};

export const viewport = {
  themeColor: '#020617',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <ConditionalBottomNav />
        <SpeedInsights />
      </body>
    </html>
  );
}
