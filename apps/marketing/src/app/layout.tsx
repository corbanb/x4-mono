import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "x4 — Multi-Platform App Boilerplate",
    template: "%s | x4",
  },
  description:
    "Build web, mobile, and desktop apps from a single TypeScript codebase. Powered by Next.js, Expo, Electron, tRPC, and Drizzle.",
  openGraph: {
    title: "x4 — Multi-Platform App Boilerplate",
    description:
      "Build web, mobile, and desktop apps from a single TypeScript codebase.",
    type: "website",
    locale: "en_US",
    siteName: "x4",
  },
  twitter: {
    card: "summary_large_image",
    title: "x4 — Multi-Platform App Boilerplate",
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
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-white text-gray-900 antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
