import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@sre-monorepo/lib';
import { createServerSupabaseClient } from '@sre-monorepo/lib';

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { 
      writerSessionId, 
      title, 
      contentBlocks, 
      wordCount 
    } = await req.json();

    if (!writerSessionId || !contentBlocks) {
      return NextResponse.json({ 
        message: "Missing required fields" 
      }, { status: 400 });
    }

    // Buat Draft baru (bukan upsert, karena setiap save adalah versi baru)
    const draft = await prisma.draft.create({
      data: {
        userId: user.id,
        writerId: writerSessionId,
        title: title || `Draft ${new Date().toISOString()}`,
      },
    });

    // Parse contentBlocks menjadi sections
    const sectionsData = [];
    let currentSection = { title: 'Content', content: [] as string[] };

    for (let i = 0; i < contentBlocks.length; i++) {
      const block = contentBlocks[i];
      
      if (block.type === 'heading') {
        // Jika ada section sebelumnya, save dulu
        if (currentSection.content.length > 0) {
          sectionsData.push({
            draftId: draft.id,
            title: currentSection.title,
            content: currentSection.content.join('\n'),
          });
        }
        
        // Mulai section baru dengan heading sebagai title
        const headingText = Array.isArray(block.content) 
          ? block.content.map((c: any) => c.text || '').join('').trim()
          : block.content?.toString() || `Section ${sectionsData.length + 1}`;
          
        currentSection = {
          title: headingText,
          content: []
        };
      } else {
        // Tambahkan content ke section saat ini
        let blockText = '';
        if (typeof block.content === 'string') {
          blockText = block.content;
        } else if (Array.isArray(block.content)) {
          blockText = block.content
            .map((item: any) => typeof item === 'string' ? item : item?.text || '')
            .join(' ');
        }
        
        if (blockText.trim()) {
          currentSection.content.push(blockText.trim());
        }
      }
    }

    // Jangan lupa section terakhir
    if (currentSection.content.length > 0) {
      sectionsData.push({
        draftId: draft.id,
        title: currentSection.title,
        content: currentSection.content.join('\n'),
      });
    }

    // Jika tidak ada sections, buat satu section default
    if (sectionsData.length === 0) {
      const allText = contentBlocks
        .map((block: any) => {
          if (typeof block.content === 'string') return block.content;
          if (Array.isArray(block.content)) {
            return block.content.map((c: any) => c.text || '').join(' ');
          }
          return '';
        })
        .join('\n')
        .trim();

      if (allText) {
        sectionsData.push({
          draftId: draft.id,
          title: title || 'Content',
          content: allText,
        });
      }
    }

    // Insert sections ke database
    if (sectionsData.length > 0) {
      await prisma.draftSection.createMany({
        data: sectionsData,
      });
    }

    // Return draft dengan sections
    const completeDraft = await prisma.draft.findUnique({
      where: { id: draft.id },
      include: {
        sections: true,
      }
    });

    return NextResponse.json({ 
      success: true,
      draft: completeDraft,
      wordCount,
      sectionsCount: sectionsData.length
    });

  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ 
      message: "Internal server error" 
    }, { status: 500 });
  }
}