// apps/writer/app/api/assignments/validate/route.ts
// Optional: API untuk validasi kode assignment secara real-time

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@sre-monorepo/lib';

export async function POST(request: NextRequest) {
  try {
    const { assignmentCode } = await request.json();

    if (!assignmentCode) {
      return NextResponse.json(
        { error: 'Kode assignment tidak boleh kosong' },
        { status: 400 }
      );
    }

    const assignment = await prisma.assignment.findFirst({
      where: {
        assignment_code: assignmentCode,
        is_active: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        due_date: true,
        week_number: true
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { 
          valid: false, 
          error: 'Kode assignment tidak valid atau tidak aktif' 
        },
        { status: 404 }
      );
    }

    // Cek apakah sudah lewat due date
    const isOverdue = assignment.due_date && new Date() > assignment.due_date;

    return NextResponse.json({
      valid: true,
      assignment: {
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.due_date,
        weekNumber: assignment.week_number,
        isOverdue
      }
    });

  } catch (error) {
    console.error('Error validating assignment code:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}