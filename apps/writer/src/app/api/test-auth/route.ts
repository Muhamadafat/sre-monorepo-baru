// apps/writer/src/app/api/test-auth/route.ts
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@sre-monorepo/lib'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    return NextResponse.json({
      hasSession: !!session,
      userEmail: session?.user?.email,
      error: error?.message,
      // NO DATABASE QUERY - pure auth test
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}