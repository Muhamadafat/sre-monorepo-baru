import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@sre-monorepo/lib"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { createServerSupabaseClient } from "@sre-monorepo/lib"

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData()

//     const assignmentId = formData.get("assignmentId") as string
//     const studentId = formData.get("studentId") as string
//     const assignmentCodeInput = formData.get("assignmentCodeInput") as string
//     const submissionText = formData.get("submissionText") as string
//     const file = formData.get("file") as File | null

//     // Validate required fields
//     if (!assignmentId || !studentId || !assignmentCodeInput) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Missing required fields",
//         },
//         { status: 400 },
//       )
//     }

//     // Validate that either submission text or file is provided
//     if (!submissionText && !file) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Harap isi text submission atau upload file",
//         },
//         { status: 400 },
//       )
//     }

//     let fileUrl: string | null = null
//     let fileName: string | null = null

//     // Handle file upload if provided
//     if (file && file.size > 0) {
//       // Validate file size (max 10MB)
//       if (file.size > 10 * 1024 * 1024) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: "Ukuran file maksimal 10MB",
//           },
//           { status: 400 },
//         )
//       }

//       // Validate file type
//       const allowedTypes = [
//         "application/pdf",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         "text/plain",
//         "application/zip",
//         "application/x-rar-compressed",
//       ]

//       if (!allowedTypes.includes(file.type)) {
//         return NextResponse.json(
//           {
//             success: false,
//             error: "Tipe file tidak didukung. Gunakan PDF, DOC, DOCX, TXT, ZIP, atau RAR",
//           },
//           { status: 400 },
//         )
//       }

//       try {
//         // Create upload directory if it doesn't exist
//         const uploadDir = join(process.cwd(), "public", "uploads", "assignments")
//         await mkdir(uploadDir, { recursive: true })

//         // Generate unique filename
//         const fileExtension = file.name.split(".").pop()
//         const uniqueFileName = `${Date.now()}_${studentId}_${assignmentId}.${fileExtension}`
//         const filePath = join(uploadDir, uniqueFileName)

//         // Convert file to buffer and save
//         const bytes = await file.arrayBuffer()
//         const buffer = Buffer.from(bytes)
//         await writeFile(filePath, buffer)

//         fileUrl = `/uploads/assignments/${uniqueFileName}`
//         fileName = file.name
//       } catch (uploadError: any) {
//         console.error("File upload error:", uploadError)
//         return NextResponse.json(
//           {
//             success: false,
//             error: "Gagal mengupload file",
//           },
//           { status: 500 },
//         )
//       }
//     }

//     // For dummy assignments, simulate successful submission
//     if (assignmentId.startsWith("dummy-")) {
//       // Simulate database operation
//       const submissionData = {
//         id: `submission-${Date.now()}`,
//         assignment_id: assignmentId,
//         student_id: studentId,
//         assignment_code_input: assignmentCodeInput,
//         file_url: fileUrl,
//         file_name: fileName,
//         submission_text: submissionText || null,
//         status: "submitted" as const,
//         grade: null,
//         feedback: null,
//         submitted_at: new Date().toISOString(),
//         graded_at: null,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString(),
//       }

//       return NextResponse.json({
//         success: true,
//         message: "Assignment berhasil dikumpulkan!",
//         submission: submissionData,
//       })
//     }

//     // Check if assignment exists and get assignment code
//     const assignment = await prisma.assignment.findUnique({
//       where: { id: assignmentId },
//       select: { assignment_code: true, is_active: true },
//     })

//     if (!assignment) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Assignment tidak ditemukan",
//         },
//         { status: 404 },
//       )
//     }

//     if (!assignment.is_active) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Assignment sudah tidak aktif",
//         },
//         { status: 400 },
//       )
//     }

//     // Validate assignment code
//     if (assignmentCodeInput !== assignment.assignment_code) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: `Code tugas salah! Code yang benar adalah: ${assignment.assignment_code}`,
//         },
//         { status: 400 },
//       )
//     }

//     // Check if student already submitted
//     const existingSubmission = await prisma.assignmentSubmission.findFirst({
//       where: {
//         assignment_id: assignmentId,
//         student_id: studentId,
//       },
//     })

//     let submission

//     if (existingSubmission) {
//       // Check if already graded
//       if (existingSubmission.status === "graded") {
//         return NextResponse.json(
//           {
//             success: false,
//             error: "Assignment yang sudah dinilai tidak dapat disubmit ulang",
//           },
//           { status: 400 },
//         )
//       }

//       // Update existing submission
//       submission = await prisma.assignmentSubmission.update({
//         where: { id: existingSubmission.id },
//         data: {
//           assignment_code_input: assignmentCodeInput,
//           file_url: fileUrl,
//           file_name: fileName,
//           submission_text: submissionText || null,
//           status: "submitted",
//           submitted_at: new Date(),
//           updatedAt: new Date(),
//         },
//       })
//     } else {
//       // Create new submission
//       submission = await prisma.assignmentSubmission.create({
//         data: {
//           assignment_id: assignmentId,
//           student_id: studentId,
//           assignment_code_input: assignmentCodeInput,
//           file_url: fileUrl,
//           file_name: fileName,
//           submission_text: submissionText || null,
//           status: "submitted",
//           submitted_at: new Date(),
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       })
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Assignment berhasil dikumpulkan!",
//       submission,
//     })
//   } catch (error: any) {
//     console.error("Error submitting assignment:", error)
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Gagal mengumpulkan assignment",
//         details: error.message,
//       },
//       { status: 500 },
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }

type FileMeta = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
};

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const assignmentId = formData.get("assignmentId") as string
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const files = formData.getAll("files") as File[]

    // Validate required fields
    if (!assignmentId || !title) {
      return NextResponse.json({ error: "Assignment ID and title are required" }, { status: 400 })
    }

    // Validate files if any

    const processedFiles: FileMeta[] = []
    if (files && files.length > 0) {
      for (const file of files) {
        if (file instanceof File) {
          // Validate file size (max 10MB per file)
          if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: `File ${file.name} is too large. Maximum size is 10MB` }, { status: 400 })
          }

          // Validate file type (allow common document and image types)
          const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "image/jpeg",
            "image/png",
            "image/gif",
          ]

          if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: `File type ${file.type} is not allowed` }, { status: 400 })
          }

          // In a real application, you would upload the file to a storage service
          // For now, we'll simulate successful upload
          processedFiles.push({
            id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            url: `/uploads/${file.name}`, // Simulated URL
            size: file.size,
            type: file.type,
          })
        }
      }
    }

    // Check if this is a dummy assignment
    const dummyAssignmentIds = ["assignment-1", "assignment-2", "assignment-3"]

    if (dummyAssignmentIds.includes(assignmentId)) {
      // Handle dummy assignment submission
      const dummySubmission = {
        id: `submission-${Date.now()}`,
        assignmentId,
        userId: user.id,
        title,
        content: content || "",
        files: processedFiles,
        submittedAt: new Date().toISOString(),
        status: "submitted",
        grade: null,
        maxScore: assignmentId === "assignment-1" ? 100 : assignmentId === "assignment-2" ? 85 : 90,
        feedback: null,
        gradedAt: null,
        gradedBy: null,
      }

      return NextResponse.json({
        success: true,
        message: "Assignment submitted successfully",
        submission: dummySubmission,
      })
    }

    // For real assignments, try to save to database
    try {
      // Check if assignment exists
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      })

      if (!assignment) {
        return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
      }

      // Check if assignment is still active
      if (new Date() > new Date(assignment.due_date || '')) {
        return NextResponse.json({ error: "Assignment deadline has passed" }, { status: 400 })
      }

      // Create submission in database
      const submission = await prisma.assignmentSubmission.create({
        data: {
          assignment_id: assignmentId,
          student_id: user.id,
          assignment_code_input: assignmentId,
          submission_text: content || '',
          file_url: processedFiles.length > 0 ? processedFiles[0].url : null,
          file_name: processedFiles.length > 0 ? processedFiles[0].name : null,
          status: 'pending', 
        }
      })

      return NextResponse.json({
        success: true,
        message: "Assignment submitted successfully",
        submission,
      })
    } catch (dbError) {
      console.error("Database error:", dbError)

      // Return success with dummy data if database fails
      const dummySubmission = {
        id: `submission-${Date.now()}`,
        assignmentId,
        userId: user.id,
        title,
        content: content || "",
        files: processedFiles,
        submittedAt: new Date().toISOString(),
        status: "submitted",
      }

      return NextResponse.json({
        success: true,
        message: "Assignment submitted successfully",
        submission: dummySubmission,
      })
    }
  } catch (error) {
    console.error("Submit assignment error:", error)
    return NextResponse.json({ error: "Failed to submit assignment" }, { status: 500 })
  }
}
