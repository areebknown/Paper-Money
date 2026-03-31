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
  title: "Bid Wars | The Ultimate UPI Auction Game",
  description: "Join high-stakes digital auctions, trade artifacts, and win real rewards. The most aesthetic UPI gaming ecosystem.",
  other: {
    "google-site-verification": "P2F-6nBdLydsbkhJ3hlPteWEJhG-SPtqIYeBz04tKqI",
  },
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
