import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@sre-monorepo/lib";
import { createServerSupabaseClient } from "@sre-monorepo/lib";

export async function POST(req: NextRequest) {
    
    const supabase = await createServerSupabaseClient();
    const { data: {user}, error} = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({message: 'Unauthorized'}, {status: 401});
    }

    const body = await req.json();
    const metadata = body?.metadata;
    const document = body?.document;

    if (!metadata || !document){
        return NextResponse.json({message: 'Missing document in metada'});
    };

    try {
        const nodeWithUrl = await prisma.node.findFirst({
            where: { att_url: document},
            select: {
                id: true,
                title: true,
                att_url: true,
                article: {
                    select: {
                        id: true,
                        title: true,
                        filePath: true,
                    },
                }
            }
        });

        if (!nodeWithUrl){
            return NextResponse.json({message: `Article / Node not found for URL: ${document}`});
        };

        const article = nodeWithUrl.article;

        const newAnnotation = await prisma.annotation.create({
            data: {
                articleId: article.id,
                page: metadata.pageNumber,
                highlightedText: metadata.highlightedText || '',
                comment: metadata.contents || '',
                userId: user.id,
            },
            include: {
                article: {
                    select: {
                        id: true,
                        title: true,
                        filePath: true,
                    }
                }
            }
        });

        return NextResponse.json(newAnnotation, {status: 200});
    } catch (error) {
        console.error('[ANNOTATION_ERROR', error);
        return NextResponse.json({message: 'Internal Server Error'}, {status: 500});
    }

};

export async function GET(req: NextRequest){
    const searchParams = req.nextUrl.searchParams;
    const sessionId = searchParams.get("sessionId"); // BrainstormingSession ID
    const projectId = searchParams.get("projectId"); // WriterSession ID
    
    const supabase = await createServerSupabaseClient();
    const { data: {user}, error} = await supabase.auth.getUser();
    if (!user) {
        return NextResponse.json({message: 'Unauthorized'}, {status: 401});
    }

    try {
        let annotations;

        if (sessionId) {
            // Query langsung berdasarkan BrainstormingSession ID
            annotations = await prisma.annotation.findMany({
                where: {
                    article: {
                        sessionId: sessionId,
                    }
                },
                include: {
                    article: {
                        select: {
                            id: true,
                            title: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } else if (projectId) {
            // Query berdasarkan WriterSession ID
            // Pertama cari BrainstormingSession yang terkait dengan WriterSession
            const writerSession = await prisma.writerSession.findUnique({
                where: { id: projectId },
                select: { brainstormingSessionId: true }
            });

            if (!writerSession || !writerSession.brainstormingSessionId) {
                return NextResponse.json({error: 'Writer session not found or not linked to brainstorming session'}, {status: 404});
            }

            // Kemudian cari annotations berdasarkan brainstormingSessionId
            annotations = await prisma.annotation.findMany({
                where: {
                    article: {
                        sessionId: writerSession.brainstormingSessionId,
                    }
                },
                include: {
                    article: {
                        select: {
                            id: true,
                            title: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        } else {
            return NextResponse.json({error: 'Either sessionId or projectId is required'}, {status: 400});
        }

        return NextResponse.json(annotations, {status: 200});
    } catch (error) {
        console.error('Error fetching annotations:', error);
        return NextResponse.json({error: 'Failed to fetch annotations'}, {status: 500});
    }
}