import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@sre-monorepo/lib";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId"); // userId (bisa dari URL atau current user)
    const projectId = searchParams.get("projectId"); // brainstormingSessionId atau writerSessionId
    
    console.log('=== NODES API DEBUG ===');
    console.log('1. Raw sessionId (userId):', sessionId);
    console.log('2. Raw projectId:', projectId);

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId (userId)" }, { status: 400 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
    }

    // Clean sessionId jika mengandung underscore
    let cleanUserId = sessionId;
    if (sessionId.includes('_')) {
      cleanUserId = sessionId.split('_')[0];
      console.log('3. Cleaned userId:', cleanUserId);
    }

    // STRATEGY: Coba dua pendekatan untuk mendapatkan brainstormingSessionId

    let targetBrainstormingSessionId = null;

    // STEP 1: Coba langsung sebagai brainstormingSessionId
    console.log('4. Step 1: Trying projectId as brainstormingSessionId...');
    const brainstormingSession = await prisma.brainstormingSession.findFirst({
      where: {
        id: projectId,
        userId: cleanUserId
      }
    });

    if (brainstormingSession) {
      console.log('   ✅ Found as brainstormingSession');
      targetBrainstormingSessionId = projectId;
    } else {
      // STEP 2: Coba sebagai writerSessionId, ambil brainstormingSessionId-nya
      console.log('5. Step 2: Trying projectId as writerSessionId...');
      const writerSession = await prisma.writerSession.findFirst({
        where: {
          id: projectId,
          userId: cleanUserId
        },
        select: {
          brainstormingSessionId: true
        }
      });

      if (writerSession?.brainstormingSessionId) {
        console.log('   ✅ Found as writerSession, brainstormingSessionId:', writerSession.brainstormingSessionId);
        targetBrainstormingSessionId = writerSession.brainstormingSessionId;
      }
    }

    if (!targetBrainstormingSessionId) {
      console.log('6. ❌ No valid brainstormingSessionId found');
      return NextResponse.json([]);
    }

    // STEP 3: Query nodes berdasarkan brainstormingSessionId yang ditemukan
    console.log('7. Querying nodes for brainstormingSessionId:', targetBrainstormingSessionId);
    const nodes = await prisma.node.findMany({
      where: {
        article: {
          userId: cleanUserId,
          sessionId: targetBrainstormingSessionId  // sessionId di Article = brainstormingSessionId
        }
      },
      include: {
        article: {
          select: {
            id: true,
            title: true,
            userId: true,
            sessionId: true,
            session: {
              select: {
                id: true,
                title: true
              }
            }
          }
        }
      }
    });

    console.log('8. Nodes found:', nodes.length);
    if (nodes.length > 0) {
      console.log('9. Sample node:', {
        id: nodes[0].id,
        label: nodes[0].label,
        articleTitle: nodes[0].article?.title,
        sessionTitle: nodes[0].article?.session?.title
      });
    }
    console.log('=== END DEBUG ===');

    return NextResponse.json(nodes);

  } catch (error: any) {
    console.error("Error fetching nodes: ", error);
    return NextResponse.json({ 
      error: 'Failed to fetch nodes', 
      details: error.message 
    }, { status: 500 });
  }
}