import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Velum — Prove what matters. Reveal nothing else.",
  description:
    "The zero-knowledge proof layer for private income on Starknet STRK20. Prove income thresholds to landlords, lenders, and insurers without disclosing balances or transaction history.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen bg-[#fafafa] text-[#121316] font-sans antialiased selection:bg-[#10b981]/20 selection:text-[#065f46]">
        {children}
      </body>
    </html>
  );
}


