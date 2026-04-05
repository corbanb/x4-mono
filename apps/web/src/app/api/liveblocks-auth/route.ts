import { Liveblocks } from '@liveblocks/node';
import { auth } from '@x4/auth/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) return new Response('Liveblocks not configured', { status: 503 });

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const liveblocks = new Liveblocks({ secret });
  try {
    const { status, body } = await liveblocks.identifyUser(
      { userId: session.user.id, groupIds: [] },
      {
        userInfo: {
          name: session.user.name ?? 'Anonymous',
          avatar: session.user.image ?? '',
          color: stringToColor(session.user.id),
        },
      },
    );
    return new Response(body, { status });
  } catch (err) {
    console.error('[liveblocks-auth] identifyUser failed', err);
    return new Response('Collaboration service unavailable', { status: 503 });
  }
}

function stringToColor(str: string): string {
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];
  let hash = 0;
  for (const ch of str) hash = ch.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
