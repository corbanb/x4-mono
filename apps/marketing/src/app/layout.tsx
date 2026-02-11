import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "x4 — Ship Multi-Platform Apps From One Codebase",
    template: "%s | x4",
  },
  description:
    "Build web, mobile, and desktop apps from a single TypeScript codebase. Type-safe APIs, built-in auth, AI integration, and production-ready infrastructure.",
  openGraph: {
    title: "x4 — Ship Multi-Platform Apps From One Codebase",
    description:
      "Build web, mobile, and desktop apps from a single TypeScript codebase. Type-safe APIs, built-in auth, AI integration, and production-ready infrastructure.",
    type: "website",
    locale: "en_US",
    siteName: "x4",
  },
  twitter: {
    card: "summary_large_image",
    title: "x4 — Ship Multi-Platform Apps From One Codebase",
    description:
      "Build web, mobile, and desktop apps from a single TypeScript codebase.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
