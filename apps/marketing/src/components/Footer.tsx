import Link from 'next/link';

const FOOTER_LINKS = {
  Product: [
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ],
  Resources: [
    { href: '#', label: 'Documentation' },
    { href: '#', label: 'Blog' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
          <div>
            <Link href="/" className="text-lg font-bold text-gray-900">
              x4
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Build multi-platform apps from a single codebase.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-900">{category}</h3>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} x4. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
