const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export function Hero() {
  return (
    <section className="py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-gray-900">
        Ship Multi-Platform Apps
        <br />
        <span className="text-gray-500">From One Codebase</span>
      </h1>

      <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
        Web, mobile, and desktop — powered by TypeScript, tRPC, and a shared backend. Stop
        duplicating code across platforms.
      </p>

      <div className="mt-10 flex items-center justify-center gap-4">
        <a
          href={`${APP_URL}/signup`}
          className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          Get Started Free
        </a>
        <a
          href="#features"
          className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Learn More
        </a>
      </div>
    </section>
  );
}
