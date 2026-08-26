import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Velum",
  description:
    "Prove you earned enough, without showing what you earned. Income verification on the STRK20 privacy pool.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
