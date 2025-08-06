import { prisma } from '@sre-monorepo/lib';
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@sre-monorepo/lib'; // asumsi file kamu tadi

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'development' ? '*' : 'https://yourdomain.com',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
  'Access-Control-Allow-Credentials': 'true',
};

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, coverColor } = body;

  const session = await prisma.brainstormingSession.create({
    data: {
      title,
      description,
      coverColor,
      userId: user.id,
      selectedFilterArticles: [],
    //   graphFilters: JSON[],
      lastActivity: new Date(),
    },
  });

  return NextResponse.json({ id: session.id });
};

// app/api/brainstorming-sessions/route.ts
export async function GET(request: NextRequest) {
  console.log('API: Getting brainstorming sessions');
  console.log('API: Request headers:', Object.fromEntries(request.headers.entries()));

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json([], { status: 401 });
  }

  const sessions = await prisma.brainstormingSession.findMany({
    where: {
      userId: user.id,
    },
    include: {
        _count: {
            select: {
                articles: true,
                chatMessages: true,
            },
        },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return NextResponse.json(sessions);
}

