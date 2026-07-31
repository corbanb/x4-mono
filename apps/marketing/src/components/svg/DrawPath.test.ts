import { describe, expect, test } from 'bun:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DrawPath } from './DrawPath';
import { STROKE, type StrokeWeight } from './grid';

/**
 * DrawPath resolves a named weight to a number, and that is the whole of its
 * static surface — so these render it for real and read the stroke off the
 * markup, rather than asserting that a prop was passed through.
 *
 * `renderToStaticMarkup` rather than the call-and-walk technique the other tests
 * in this directory use: DrawPath calls `useDiagram`, so invoking it outside a
 * renderer throws. react-dom already ships with the app, so this adds no
 * dependency, and the markup it returns is the actual first paint.
 *
 * The reduced-motion half of DrawPath's contract — that it animates the dash
 * properties and nothing else — is pinned in grid.test.ts, next to the CSS rule
 * that half depends on.
 */

/** The stroke-width the emitted <path> carries, as a number. */
function strokeWidth(props: { d: string; weight?: StrokeWeight }): number {
  const html = renderToStaticMarkup(createElement(DrawPath, props));
  const attribute = html.match(/stroke-width="([^"]*)"/);
  if (!attribute) throw new Error(`no stroke-width in ${html}`);
  return Number(attribute[1]);
}

const D = 'M 8 24 L 88 24';

describe('DrawPath weight', () => {
  test('defaults to the hairline', () => {
    // Pinned deliberately, and enumerated as 1 rather than as STROKE.hairline, so
    // flipping the default fails here instead of silently landing 1.5 under the
    // first path a future surface forgets to weight.
    //
    // The default was `primary`, which no call site on the branch ever received:
    // every DrawPath inside svg/ passes `hairline` explicitly and the marks expose
    // no weight prop at all, so 1.5 rendered nowhere. A default that only reaches
    // the call sites that forgot to choose is the wrong way round — the common
    // case is the default and the emphasis is opted into.
    expect(strokeWidth({ d: D })).toBe(1);
    expect(strokeWidth({ d: D })).toBe(STROKE.hairline);
  });

  test('resolves the named weight to its authored number', () => {
    expect(strokeWidth({ d: D, weight: 'hairline' })).toBe(1);
    // `primary` remains reachable and remains 1.5: it is the weight a path that is
    // the SUBJECT of a diagram takes, as opposed to the structure around it.
    expect(strokeWidth({ d: D, weight: 'primary' })).toBe(1.5);
  });

  test('emits only weights the stroke scale rule in globals.css compensates', () => {
    // globals.css keys its --x4-stroke-scale correction off [stroke-width='N'],
    // one rule per authored weight, so a third weight would render uncorrected at
    // mobile scales.
    const authored = Object.values(STROKE) as number[];
    for (const weight of Object.keys(STROKE) as StrokeWeight[]) {
      expect(authored).toContain(strokeWidth({ d: D, weight }));
    }
    expect(authored).toContain(strokeWidth({ d: D }));
  });
});
