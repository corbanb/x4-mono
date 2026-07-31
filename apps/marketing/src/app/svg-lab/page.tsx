import type { Metadata } from 'next';
import { Diagram } from '@/components/svg/Diagram';
import { DrawPath } from '@/components/svg/DrawPath';
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

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          DrawPath — stagger by normalized position
        </h2>
        <Diagram width={units(120)} height={units(10)} className="text-muted-foreground">
          <DrawPath d={`M 0 ${units(5)} L ${units(120)} ${units(5)}`} />
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <DrawPath
              key={t}
              d={`M ${units(120) * t} ${units(5)} L ${units(120) * t} ${units(2)}`}
              weight="hairline"
              duration={0.3}
              delay={0.8 * t}
            />
          ))}
        </Diagram>
      </section>
    </main>
  );
}
