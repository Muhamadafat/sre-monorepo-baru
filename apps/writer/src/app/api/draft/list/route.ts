import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@sre-monorepo/lib';
import { createServerSupabaseClient } from '@sre-monorepo/lib';

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const writerSessionId = searchParams.get('writerSessionId');

    if (!writerSessionId) {
      return NextResponse.json({ 
        message: "Missing writerSessionId" 
      }, { status: 400 });
    }

    const drafts = await prisma.draft.findMany({
      where: {
        writerId: writerSessionId,
        userId: user.id,
      },
      include: {
        sections: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ drafts });

  } catch (error) {
    console.error('Error loading drafts:', error);
    return NextResponse.json({ 
      message: "Internal server error" 
    }, { status: 500 });
  }
}