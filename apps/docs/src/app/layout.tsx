import { RootProvider } from 'fumadocs-ui/provider';
import type { ReactNode } from 'react';
import '@/styles/globals.css';

export const metadata = {
  title: {
    default: 'x4 Documentation',
    template: '%s | x4 Docs',
  },
  description: 'Developer documentation for the x4 platform API',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
