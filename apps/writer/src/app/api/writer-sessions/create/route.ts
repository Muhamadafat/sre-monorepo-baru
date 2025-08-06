import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@sre-monorepo/lib';
import { createServerSupabaseClient } from '@sre-monorepo/lib';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, projectId } = await req.json();
  
  // Enhanced logging
  console.log('=== API /writer-sessions/create ===');
  console.log('Request payload:', { sessionId, projectId });
  console.log('Authenticated user:', user.id);

  if (!projectId) {
    return NextResponse.json({ 
      message: "Missing projectId" 
    }, { status: 400 });
  }

  try {
    // CASE 1: Jika ada sessionId, berarti dari brainstorming session
    if (sessionId) {
      console.log('Case 1: Creating WriterSession from BrainstormingSession');
      console.log('ProjectId (brainstormingSessionId):', projectId);
      console.log('SessionId (userId from URL):', sessionId);
      
      // Clean sessionId jika mengandung underscore
      let cleanUserId = sessionId;
      if (sessionId.includes('_')) {
        cleanUserId = sessionId.split('_')[0];
        console.log('Cleaned userId:', cleanUserId);
      }

      // Validasi bahwa sessionId yang dibersihkan sama dengan user yang login
      if (cleanUserId !== user.id) {
        return NextResponse.json({ 
          message: "SessionId mismatch with authenticated user" 
        }, { status: 403 });
      }
      
      // Ambil data BrainstormingSession berdasarkan projectId
      const brainSession = await prisma.brainstormingSession.findUnique({
        where: { id: projectId },
      });

      if (!brainSession) {
        console.log('❌ BrainstormingSession not found with id:', projectId);
        
        // FALLBACK: Check if projectId is actually a writerSessionId
        console.log('🔄 Checking if projectId is a writerSessionId instead...');
        const possibleWriterSession = await prisma.writerSession.findUnique({
          where: { id: projectId },
          include: {
            brainstormingSession: {
              select: {
                id: true,
                title: true,
                description: true,
                userId: true
              }
            }
          }
        });
        
        if (possibleWriterSession) {
          console.log('✅ Found existing WriterSession:', possibleWriterSession.id);
          if (possibleWriterSession.userId === user.id) {
            return NextResponse.json({ 
              id: possibleWriterSession.id,
              writerSession: possibleWriterSession,
              type: 'existing_writer_from_case1'
            });
          } else {
            return NextResponse.json({ 
              message: "Access denied to this writer session" 
            }, { status: 403 });
          }
        }
        
        return NextResponse.json({ 
          message: "BrainstormingSession not found and projectId is not a valid writerSessionId" 
        }, { status: 404 });
      }

      // Cek apakah user memiliki akses ke brainstorming session ini
      if (brainSession.userId !== user.id) {
        return NextResponse.json({ 
          message: "Access denied to this brainstorming session" 
        }, { status: 403 });
      }

      // Cek apakah WriterSession sudah ada untuk project ini
      const existing = await prisma.writerSession.findFirst({
        where: {
          brainstormingSessionId: projectId,
          userId: user.id,
        },
      });

      if (existing) {
        console.log('✅ WriterSession already exists:', existing.id);
        return NextResponse.json({ 
          message: "WriterSession already exists", 
          id: existing.id,
          writerSession: existing,
          type: 'existing'
        });
      }

      // Buat WriterSession baru dengan relasi ke BrainstormingSession
      console.log('🆕 Creating new WriterSession...');
      const newWriterSession = await prisma.writerSession.create({
        data: {
          title: `Draft: ${brainSession.title}`,
          description: brainSession.description || '',
          userId: user.id,
          coverColor: brainSession.coverColor,
          brainstormingSessionId: projectId,
        },
      });

      console.log('✅ New WriterSession created:', newWriterSession.id);
      return NextResponse.json({ 
        id: newWriterSession.id,
        writerSession: newWriterSession,
        type: 'created'
      });
    }
    
    // CASE 2: Tidak ada sessionId, berarti projectId adalah writerSessionId
    else {
      console.log('Case 2: Getting existing WriterSession');
      console.log('ProjectId (writerSessionId):', projectId);
      
      // Cari WriterSession berdasarkan projectId
      const writerSession = await prisma.writerSession.findUnique({
        where: { id: projectId },
        include: {
          brainstormingSession: {
            select: {
              id: true,
              title: true,
              description: true,
              userId: true
            }
          }
        }
      });

      if (!writerSession) {
        console.log('❌ WriterSession not found with id:', projectId);
        
        // ADDITIONAL FALLBACK: Check if projectId is brainstormingSessionId
        console.log('🔄 Checking if projectId is a brainstormingSessionId...');
        const possibleBrainSession = await prisma.brainstormingSession.findUnique({
          where: { id: projectId },
        });
        
        if (possibleBrainSession && possibleBrainSession.userId === user.id) {
          console.log('✅ Found brainstormingSession, but no sessionId provided');
          return NextResponse.json({ 
            message: "Found brainstormingSession but missing sessionId parameter. Please provide sessionId to create WriterSession from brainstorming." 
          }, { status: 400 });
        }
        
        return NextResponse.json({ 
          message: "WriterSession not found and projectId is not a valid brainstormingSessionId" 
        }, { status: 404 });
      }

      // Cek apakah user memiliki akses ke writer session ini
      if (writerSession.userId !== user.id) {
        console.log('❌ Access denied. WriterSession belongs to:', writerSession.userId, 'but user is:', user.id);
        return NextResponse.json({ 
          message: "Access denied to this writer session" 
        }, { status: 403 });
      }

      console.log('✅ Returning existing WriterSession:', writerSession.id);
      return NextResponse.json({ 
        id: writerSession.id,
        writerSession: writerSession,
        type: 'existing_writer'
      });
    }

  } catch (error: any) {
    console.error('❌ Error handling WriterSession:', error);
    console.error('Stack trace:', error.stack);
    return NextResponse.json({ 
      message: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}