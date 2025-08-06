import { type NextRequest, NextResponse } from "next/server"
import { prisma } from '@sre-monorepo/lib';
import { createServerSupabaseClient } from "@sre-monorepo/lib";

// export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
//   try {
//     const { userId } = await params

//     if (!userId) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "User ID is required",
//         },
//         { status: 400 },
//       )
//     }

//     const submissions = await prisma.assignmentSubmission.findMany({
//       where: {
//         student_id: userId,
//       },
//       include: {
//         assignment: {
//           select: {
//             id: true,
//             title: true,
//             week_number: true,
//             assignment_code: true,
//             due_date: true,
//           },
//         },
//         student: {
//           select: {
//             id: true,
//             name: true,
//             nim: true,
//             group: true,
//             email: true,
//           },
//         },
//       },
//       orderBy: {
//         submitted_at: "desc",
//       },
//     })

//     const dummySubmissions = [
//       {
//         id: "dummy-submission-1",
//         assignment_id: "dummy-assignment-1",
//         student_id: userId,
//         assignment_code_input: "ML01",
//         file_url: "/placeholder.pdf?height=300&width=400&query=student+submission+machine+learning",
//         file_name: "ML_Essay_JohnDoe.pdf",
//         submission_text:
//           "Essay tentang machine learning telah saya selesaikan sesuai dengan requirements yang diberikan. Dalam essay ini saya membahas konsep dasar ML, jenis-jenis algoritma, dan implementasinya dalam berbagai bidang.",
//         status: "graded" as const,
//         grade: 85,
//         feedback:
//           "Bagus! Essay Anda menunjukkan pemahaman yang baik tentang konsep ML. Namun, perlu lebih banyak contoh implementasi nyata. Keep up the good work!",
//         submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
//         graded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
//         createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
//         updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
//         assignment: {
//           id: "dummy-assignment-1",
//           title: "Tugas Pengenalan Machine Learning",
//           week_number: 1,
//           assignment_code: "ML01",
//           due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
//         },
//         student: {
//           id: userId,
//           name: "John Doe",
//           email: "john.doe@student.ac.id",
//           nim: "2021001001",
//           group: "A",
//         },
//       },
//     ]

//     // Combine real submissions with dummy data
//     const allSubmissions = [...submissions, ...dummySubmissions]

//     return NextResponse.json({
//       success: true,
//       submissions: allSubmissions,
//     })
//   } catch (error: any) {
//     console.error("Error fetching user submissions:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Gagal memuat submission",
//         details: error.message,
//       },
//       { status: 500 },
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  
  const { userId } = await params;

  try {
    // Verify authentication
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // const { userId } = await params;

    // Verify user can only access their own submissions or is admin
    if (userId !== user.id) {
      // Check if user is admin (you might want to implement proper role checking)
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
      })

      if (userProfile?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Always return dummy submission for now
    const dummySubmission = {
      id: "submission-1",
      assignmentId: "assignment-1",
      userId: userId,
      title: "My Research Paper Submission",
      content: "This is my research paper on machine learning applications in healthcare...",
      files: [
        {
          id: "file-1",
          name: "ML_Healthcare_Research.pdf",
          url: "/placeholder-file.pdf",
          size: 2048576, // 2MB
          type: "application/pdf",
        },
        {
          id: "file-2",
          name: "references.docx",
          url: "/placeholder-references.docx",
          size: 512000, // 500KB
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        },
      ],
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      status: "graded",
      grade: 88,
      maxScore: 100,
      feedback:
        "Excellent work! Your analysis of machine learning applications in healthcare is comprehensive and well-researched. The paper demonstrates a strong understanding of the subject matter. However, there are a few areas for improvement: 1) The conclusion could be more detailed, 2) Some citations need proper formatting, 3) Consider adding more recent research papers. Overall, this is a high-quality submission that meets most of the requirements.",
      gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      gradedBy: {
        id: "teacher-1",
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@university.edu",
      },
      assignment: {
        id: "assignment-1",
        title: "Research Paper: Machine Learning Applications",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        maxScore: 100,
      },
    }

    return NextResponse.json({
      success: true,
      submissions: [dummySubmission],
      total: 1,
    })
  } catch (error) {
    console.error("Get submissions error:", error)

    // Return dummy data even on error
    const dummySubmission = {
      id: "submission-1",
      assignmentId: "assignment-1",
      userId: userId,
      title: "My Research Paper Submission",
      status: "graded",
      grade: 88,
      maxScore: 100,
      feedback: "Good work! Keep it up.",
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      gradedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json({
      success: true,
      submissions: [dummySubmission],
      total: 1,
    })
  }
}
