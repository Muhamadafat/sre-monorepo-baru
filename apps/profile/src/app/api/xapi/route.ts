import { NextResponse } from "next/server"
import {prisma} from "@sre-monorepo/lib"  // Sesuaikan path import sesuai struktur monorepo Anda

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body.actor || !body.verb || !body.object) {
      return NextResponse.json({ error: "Invalid xAPI statement" }, { status: 400 })
    }

    const userId = body.userId || null
    const sessionId = body.context?.extensions?.sessionId || null
    
    // Auto-increment sequence untuk session yang sama
    let sequence = 1
    if (sessionId && userId) {
      const lastStatement = await prisma.xapiStatement.findFirst({
        where: { userId, sessionId },
        orderBy: { sequence: 'desc' }
      })
      sequence = (lastStatement?.sequence || 0) + 1
    }

    const newStatement = await prisma.xapiStatement.create({
      data: {
        actor: body.actor,
        verb: body.verb,
        object: body.object,
        result: body.result || null,
        context: body.context || null,
        userId: userId,
        sessionId: sessionId,
        sequence: sequence,
      },
    })

    return NextResponse.json({ message: "Success", statement: newStatement }, { status: 201 })
  } catch (error) {
    console.error("Error recording xAPI statement:", error)
    return NextResponse.json({ error: "Failed to record xAPI statement" }, { status: 500 })
  }
}
