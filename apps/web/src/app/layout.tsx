import type { Metadata } from "next";
import { TRPCProvider } from "@/lib/trpc-provider";
import { Navigation } from "@/components/Navigation";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "x4 App",
  description: "Full-stack TypeScript application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TRPCProvider>
          <Navigation />
          <main>{children}</main>
        </TRPCProvider>
      </body>
    </html>
  );
}
