import type { Metadata } from 'next';
import { Diagram } from '@/components/svg/Diagram';
import { STROKE, STROKE_ATTRS, units } from '@/components/svg/grid';

export const metadata: Metadata = {
  title: 'SVG Lab',
  robots: { index: false, follow: false },
};

/**
 * Development harness for the Swiss SVG primitives. Unlinked and noindex.
 * Deleted once both pilot surfaces are verified.
 */
export default function SvgLabPage() {
  return (
    <main className="mx-auto max-w-5xl space-y-16 px-6 py-24">
      <h1 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">SVG Lab</h1>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Diagram — static baseline
        </h2>
        <Diagram width={units(120)} height={units(10)} className="text-border">
          <line
            x1={0}
            y1={units(5)}
            x2={units(120)}
            y2={units(5)}
            stroke="currentColor"
            strokeWidth={STROKE.hairline}
            {...STROKE_ATTRS}
          />
        </Diagram>
      </section>
    </main>
  );
}
