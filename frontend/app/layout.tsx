import type { Metadata } from "next";
import { Press_Start_2P, VT323, Nunito } from "next/font/google";
import "./globals.css";

// next/font downloads fonts at build time and injects CSS variables onto <html>
const pressStart = Press_Start_2P({
  variable: "--font-press-start",
  subsets: ["latin"],
  weight: "400",
});

const vt323 = VT323({
  variable: "--font-vt323",
  subsets: ["latin"],
  weight: "400",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "PDF RAG — Ask Your Documents",
  description: "Upload a PDF and ask questions about it using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${pressStart.variable} ${vt323.variable} ${nunito.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
