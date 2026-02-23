const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export function CTA() {
  return (
    <section className="bg-gray-900 py-20 text-center">
      <h2 className="text-3xl font-bold text-white">Ready to build something great?</h2>
      <p className="mx-auto mt-4 max-w-xl text-gray-400">
        Get started in minutes with a production-ready monorepo. Web, mobile, and desktop — all
        wired up.
      </p>
      <a
        href={`${APP_URL}/signup`}
        className="mt-8 inline-block rounded-lg bg-white px-6 py-3 text-sm font-medium text-gray-900 hover:bg-gray-100"
      >
        Start Building
      </a>
    </section>
  );
}
