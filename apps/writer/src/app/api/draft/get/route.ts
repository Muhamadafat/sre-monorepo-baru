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
    const draftId = searchParams.get('draftId');

    if (!draftId) {
      return NextResponse.json({
        message: "Missing draftId"
      }, { status: 400 });
    }

    const draft = await prisma.draft.findUnique({
      where: {
        id: draftId,
        userId: user.id, // Ensure user owns this draft
      },
      include: {
        sections: {
          orderBy: {
            id: 'asc' // Maintain order
          }
        },
      },
    });

    if (!draft) {
      return NextResponse.json({
        message: "Draft not found"
      }, { status: 404 });
    }

    // Convert sections back to BlockNote editor format
    const editorBlocks: any[] = [];

    draft.sections.forEach((section, index) => {
      // Add heading if not the first section or if section has a meaningful title
      if (index > 0 || (section.title && section.title !== 'Content')) {
        editorBlocks.push({
          type: 'heading',
          props: {
            level: 2
          },
          content: section.title
        });
      }

      // Split content by lines and create paragraph blocks
      const lines = section.content.split('\n').filter(line => line.trim());
      lines.forEach((line) => {
        editorBlocks.push({
          type: 'paragraph',
          content: line.trim()
        });
      });
    });

    // If no content, add empty paragraph
    if (editorBlocks.length === 0) {
      editorBlocks.push({
        type: 'paragraph',
        content: ''
      });
    }

    return NextResponse.json({
      success: true,
      draft: {
        id: draft.id,
        title: draft.title,
        createdAt: draft.createdAt,
        sections: draft.sections
      },
      editorContent: editorBlocks
    });

  } catch (error) {
    console.error('Error loading draft:', error);
    return NextResponse.json({
      message: "Internal server error"
    }, { status: 500 });
  }
}