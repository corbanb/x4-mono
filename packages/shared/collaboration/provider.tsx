'use client';
import React from 'react';
import { LiveblocksProvider, RoomProvider } from '@liveblocks/react';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

export function CollaborationProvider({
  children,
  roomId,
}: {
  children: React.ReactNode;
  roomId?: string;
}) {
  if (!PUBLIC_KEY) return <>{children}</>;
  return (
    <LiveblocksProvider publicApiKey={PUBLIC_KEY}>
      <RoomProvider id={roomId ?? 'room-default'} initialPresence={{ cursor: null }}>
        {children}
      </RoomProvider>
    </LiveblocksProvider>
  );
}
