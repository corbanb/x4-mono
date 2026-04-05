'use client';
import { useOthers, useUpdateMyPresence } from '@x4/shared/collaboration';
import { useEffect } from 'react';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

export function LiveCursors() {
  if (!PUBLIC_KEY) return null;
  return <LiveCursorsInner />;
}

function LiveCursorsInner() {
  const others = useOthers();
  const updatePresence = useUpdateMyPresence();

  useEffect(() => {
    const onMove = (e: MouseEvent) => updatePresence({ cursor: { x: e.clientX, y: e.clientY } });
    const onLeave = () => updatePresence({ cursor: null });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, [updatePresence]);

  return (
    <>
      {others.map((user) => {
        const cursor = user.presence.cursor as { x: number; y: number } | null | undefined;
        const color = (user.info?.color as string | undefined) ?? '#3b82f6';
        const name = (user.info?.name as string | undefined) ?? 'Guest';

        return (
          cursor && (
            <div
              key={user.connectionId}
              className="pointer-events-none fixed z-50"
              style={{ left: cursor.x, top: cursor.y }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill={color}>
                <path d="M0 0L16 6L8 8L6 16Z" />
              </svg>
              <span
                className="ml-1 rounded px-1 text-xs text-white"
                style={{ backgroundColor: color }}
              >
                {name}
              </span>
            </div>
          )
        );
      })}
    </>
  );
}
