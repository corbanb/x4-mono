'use client';

import dynamic from 'next/dynamic';

const HeroScene = dynamic(
  () =>
    import('@/components/hero/HeroScene').then((mod) => ({
      default: mod.HeroScene,
    })),
  { ssr: false },
);

export function HeroSceneLoader() {
  return <HeroScene />;
}
