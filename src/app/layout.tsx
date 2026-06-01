import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: "VINYL DOWNLOADER — Retro MP3 Ripper",
  description:
    "90s-style YouTube search and MP3 download. VINYL DOWNLOADER.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${pressStart.variable} antialiased`}>{children}</body>
    </html>
  );
}
