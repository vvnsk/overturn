import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Overturn — appeals engine",
  description:
    "Prior-auth denial in, evidence-chained appeal out. Human approves the send.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
