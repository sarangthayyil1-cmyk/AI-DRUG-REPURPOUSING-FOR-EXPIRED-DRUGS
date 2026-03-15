import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmStable - Drug Stability Analysis System",
  description:
    "Estimate whether an expired or aging drug is still biologically active using AI-powered pharmacological insights.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-cream text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
