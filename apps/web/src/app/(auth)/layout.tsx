import { Zap } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-medium">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground text-primary">
            <Zap className="h-4 w-4" />
          </div>
          x4 Platform
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Build. Ship. Scale.</h2>
          <p className="text-primary-foreground/80">
            Full-stack TypeScript platform with type-safe APIs, authentication, AI integration, and
            multi-platform support.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/60">
          Powered by Next.js, tRPC, Drizzle, and Better Auth
        </p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
