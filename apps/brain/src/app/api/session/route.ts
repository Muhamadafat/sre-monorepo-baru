// apps/brain/src/app/api/session/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@sre-monorepo/lib';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const sessionId = `${session.user.id}_${Math.floor(session.expires_at! / 1000)}`;
    
    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name
      },
      expires_at: session.expires_at,
      sessionId: sessionId
    });
  } catch (error) {
    return NextResponse.json({ error: 'Session fetch failed' }, { status: 500 });
  }
}