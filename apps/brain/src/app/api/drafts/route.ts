import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@sre-monorepo/lib";

export async function POST(req: NextRequest){
    
    try {
        const body = await req.json();
        const {title, sections} = body;

        const draft = await prisma.draft.create({
            data: {
                title,
                sections: {
                    create: sections.map((section: any) => ({
                        title: section.title,
                        content: section.content,
                    })),
                },
            },
            include: {sections: true},
        });

        return NextResponse.json(draft, {status: 201});
    } catch (error) {
        console.error('❌ Gagal menyimpan draft:', error);
        return NextResponse.json({ message: 'Failed to save draft'}, {status: 500});
    }
};