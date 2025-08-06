// apps/writer/app/api/assignments/submit/route.ts
// Enhanced version dengan writer session support - TANPA BATAS MINIMUM KATA

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@sre-monorepo/lib'; // sesuaikan dengan path prisma Anda

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      assignmentCode, 
      content, 
      fileName, 
      studentId,
      aiPercentage,
      writerSessionId // Optional: untuk link ke writer session
    } = body;

    // Validasi input
    if (!assignmentCode || !content || !studentId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // HAPUS VALIDASI MINIMUM CONTENT - SEKARANG BISA SUBMIT APAPUN
    // const wordCount = content
    //   .split(/\s+/)
    //   .filter((word: string) => word.length > 0).length;

    // if (wordCount < 10) {
    //   return NextResponse.json(
    //     { error: 'Konten terlalu pendek. Minimal 10 kata.' },
    //     { status: 400 }
    //   );
    // }

    // Hitung word count untuk logging saja (tidak untuk validasi)
    const wordCount = content
      .split(/\s+/)
      .filter((word: string) => word.length > 0).length;

    // Cari assignment berdasarkan kode
    const assignment = await prisma.assignment.findFirst({
      where: {
        assignment_code: assignmentCode,
        is_active: true
      }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Kode assignment tidak valid atau tidak aktif' },
        { status: 404 }
      );
    }

    // Cek due date
    if (assignment.due_date && new Date() > assignment.due_date) {
      return NextResponse.json(
        { error: 'Assignment sudah melewati batas waktu pengumpulan' },
        { status: 400 }
      );
    }

    // Cek apakah sudah pernah submit
    const existingSubmission = await prisma.assignmentSubmission.findFirst({
      where: {
        assignment_id: assignment.id,
        student_id: studentId
      }
    });

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'Anda sudah pernah submit assignment ini' },
        { status: 400 }
      );
    }

    // Validasi student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, name: true, email: true }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student tidak ditemukan' },
        { status: 404 }
      );
    }

    // Buat submission baru
    const submission = await prisma.assignmentSubmission.create({
      data: {
        assignment_id: assignment.id,
        student_id: studentId,
        assignment_code_input: assignmentCode,
        submission_text: content,
        file_name: fileName || 'Untitled',
        status: 'submitted'
      },
      include: {
        assignment: {
          select: {
            title: true,
            due_date: true,
            week_number: true
          }
        },
        student: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Optional: Update writer session jika ada
    if (writerSessionId) {
      try {
        await prisma.writerSession.update({
          where: { id: writerSessionId },
          data: {
            // Tambahkan field yang relevan jika ada di model WriterSession
            // updatedAt akan otomatis terupdate
          }
        });
      } catch (error) {
        console.log('Writer session update failed (non-critical):', error);
      }
    }

    // Log activity
    console.log(`📝 Assignment submitted:`, {
      submissionId: submission.id,
      student: student.name || student.email,
      assignment: assignment.title,
      wordCount: wordCount, // Tetap log word count untuk monitoring
      aiPercentage: aiPercentage
    });

    return NextResponse.json({
      success: true,
      message: 'Assignment berhasil dikirim!',
      data: {
        submissionId: submission.id,
        assignmentTitle: submission.assignment.title,
        assignmentWeek: submission.assignment.week_number,
        submittedAt: submission.submitted_at,
        wordCount: wordCount,
        aiPercentage: aiPercentage,
        studentName: submission.student.name || submission.student.email,
        dueDate: submission.assignment.due_date
      }
    });

  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}