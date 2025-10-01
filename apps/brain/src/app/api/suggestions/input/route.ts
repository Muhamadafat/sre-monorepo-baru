import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";
// import { SuggestionPanel } from "@/components/SuggestionPanel";

export async function POST(req: NextRequest){
    try {
        const { context, mode} = await req.json();

        // Check if Python backend is configured
        if (!process.env.PY_URL) {
            // Return empty suggestions if Python backend not configured
            return NextResponse.json({ suggestions: [] });
        }

        //for mcp
        const pythonResponse = await fetch(`${process.env.PY_URL}/mcp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'tools/call',
                params: {
                    name: 'get_suggestions',
                    arguments: {
                        query: mode,
                        context,
                        suggestion_type: 'input'
                    }
                },
                id: 1
            }),
            signal: AbortSignal.timeout(60000)
        });

        const mcpResponse = await pythonResponse.json();
        if (mcpResponse.error){
            return NextResponse.json({ suggestions: [] });
        }

        const result = mcpResponse.result;
        if (result && result.content && result.content[0] && result.content[0].text){
            const data = JSON.parse(result.content[0].text);
            return NextResponse.json(data);
        }

        return NextResponse.json({ suggestions: [] });
    } catch (error) {
        console.error('Suggestions API failed:', error);
        // Return empty suggestions instead of error
        return NextResponse.json({ suggestions: [] });
    }
}