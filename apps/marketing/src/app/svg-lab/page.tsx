import { Fragment } from 'react';
import type { Metadata } from 'next';
import { Axis } from '@/components/svg/Axis';
import { Diagram } from '@/components/svg/Diagram';
import { DrawPath } from '@/components/svg/DrawPath';
import { STROKE, STROKE_ATTRS, stationOffsets, units } from '@/components/svg/grid';
import { Junction, Node, Terminal, Tick } from '@/components/svg/marks';

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

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Marks</h2>
        <Diagram width={units(120)} height={units(10)} className="text-muted-foreground">
          <Tick x={units(10)} y={units(5)} orientation="horizontal" />
          <Node x={units(30)} y={units(5)} />
          <Node x={units(50)} y={units(5)} filled />
          <Junction x={units(70)} y={units(5)} />
          <Terminal x={units(90)} y={units(5)} className="text-violet-glow" />
        </Diagram>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Marks — staggered by normalized position
        </h2>
        <Diagram width={units(120)} height={units(10)} className="text-muted-foreground">
          <DrawPath d={`M ${units(4)} ${units(5)} L ${units(104)} ${units(5)}`} weight="hairline" />
          {stationOffsets(6).map((t) => (
            <Fragment key={t}>
              <Tick
                x={units(4) + units(100) * t}
                y={units(5)}
                orientation="horizontal"
                delay={0.8 * t}
              />
              <Node x={units(4) + units(100) * t} y={units(5)} filled={t < 0.5} delay={0.8 * t} />
            </Fragment>
          ))}
          <Terminal x={units(112)} y={units(5)} delay={0.8} className="text-violet-glow" />
        </Diagram>
      </section>

      <section className="space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Axis — horizontal, six stations, accent terminal
        </h2>
        <Axis
          orientation="horizontal"
          length={units(120)}
          count={6}
          terminal
          className="text-border"
        />
      </section>

      <section className="max-w-xs space-y-4">
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Axis — vertical, eight stations, all filled
        </h2>
        {/* 448 across 8 stations is 64 exactly. The brief's units(60) would snap
            to a 72/64/72/64 rhythm — evenly spaced stations require
            length / (count - 1) to be a multiple of UNIT. */}
        <Axis
          orientation="vertical"
          length={units(56)}
          count={8}
          filled={Array(8).fill(true)}
          terminal
          className="text-border"
        />
      </section>
    </main>
  );
}
