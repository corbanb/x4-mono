'use client';
import { useOthers } from '@x4/shared/collaboration';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const PUBLIC_KEY = process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY;

export function AvatarStack() {
  if (!PUBLIC_KEY) return null;
  return <AvatarStackInner />;
}

function AvatarStackInner() {
  const others = useOthers();
  if (others.length === 0) return null;
  const visible = others.slice(0, 5);
  const overflow = others.length - 5;

  return (
    <div className="flex -space-x-2">
      {visible.map((user) => (
        <Avatar key={user.connectionId} className="h-7 w-7 border-2 border-background">
          <AvatarImage src={user.info?.avatar as string | undefined} />
          <AvatarFallback style={{ backgroundColor: user.info?.color as string | undefined }}>
            {user.info?.name?.[0] ?? '?'}
          </AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
          +{overflow}
        </div>
      )}
    </div>
  );
}
