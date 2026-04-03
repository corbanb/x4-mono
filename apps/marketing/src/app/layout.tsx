import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'x4 — The Complete AI Dev Workflow for Claude Code',
    template: '%s | x4',
  },
  description:
    'One Claude Code plugin. Scaffold a full-stack TypeScript monorepo, plan features with AI, dispatch agent teams, and ship pull requests — all from your terminal.',
  openGraph: {
    title: 'x4 — The Complete AI Dev Workflow for Claude Code',
    description:
      'One Claude Code plugin. Scaffold, plan, build, and ship full-stack TypeScript apps with autonomous agent teams.',
    type: 'website',
    locale: 'en_US',
    siteName: 'x4',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'x4 — The Complete AI Dev Workflow for Claude Code',
    description: 'One Claude Code plugin. Describe your app. Watch agents build it.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
