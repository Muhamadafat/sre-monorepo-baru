import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@sre-monorepo/lib"
import { createServerSupabaseClient } from "@sre-monorepo/lib"

export async function GET(request: NextRequest) {
  try {
    // Get active assignments with creator information
    const assignments = await prisma.assignment.findMany({
      where: {
        is_active: true,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        week_number: "asc",
      },
    })

    // Always add dummy data for demonstration
    const dummyAssignments = [
      {
        id: "dummy-assignment-1",
        title: "Tugas Pengenalan Machine Learning",
        description:
          "Buatlah essay tentang konsep dasar machine learning dan implementasinya dalam kehidupan sehari-hari. Minimal 1000 kata dengan referensi yang valid. Jelaskan perbedaan antara supervised, unsupervised, dan reinforcement learning.",
        week_number: 1,
        assignment_code: "ML01",
        file_url: "/placeholder.pdf?height=400&width=600&query=machine+learning+assignment+pdf",
        file_name: "Assignment_ML_Week1.pdf",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        is_active: true,
        created_by: "admin-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: "admin-1",
          name: "Dr. Ahmad Fauzi",
          email: "ahmad.fauzi@university.ac.id",
        },
      },
      {
        id: "dummy-assignment-2",
        title: "Analisis Data dengan Python",
        description:
          "Lakukan analisis data menggunakan Python dan library pandas. Dataset akan disediakan dalam file assignment. Buat visualisasi data dan berikan insight dari hasil analisis Anda.",
        week_number: 2,
        assignment_code: "PY02",
        file_url: "/placeholder.csv?height=300&width=500&query=python+data+analysis+dataset",
        file_name: "Dataset_Analysis_Week2.csv",
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        is_active: true,
        created_by: "admin-2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: "admin-2",
          name: "Prof. Siti Nurhaliza",
          email: "siti.nurhaliza@university.ac.id",
        },
      },
      {
        id: "dummy-assignment-3",
        title: "Project Web Development",
        description:
          "Buat aplikasi web sederhana menggunakan React.js dan Node.js. Aplikasi harus memiliki fitur CRUD (Create, Read, Update, Delete) dan menggunakan database. Sertakan dokumentasi dan deployment link.",
        week_number: 3,
        assignment_code: "WEB3",
        file_url: null,
        file_name: null,
        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
        is_active: true,
        created_by: "admin-3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: "admin-3",
          name: "Ir. Budi Santoso",
          email: "budi.santoso@university.ac.id",
        },
      },
    ]

    // Combine real assignments with dummy data
    const allAssignments = [...assignments, ...dummyAssignments]

    return NextResponse.json({
      success: true,
      assignments: allAssignments,
    })
  } catch (error: any) {
    console.error("Error fetching active assignments:", error)

    // Return dummy data even if database fails
    const dummyAssignments = [
      {
        id: "dummy-assignment-1",
        title: "Tugas Pengenalan Machine Learning",
        description:
          "Buatlah essay tentang konsep dasar machine learning dan implementasinya dalam kehidupan sehari-hari. Minimal 1000 kata dengan referensi yang valid.",
        week_number: 1,
        assignment_code: "ML01",
        file_url: "/placeholder.pdf?height=400&width=600&query=machine+learning+assignment+pdf",
        file_name: "Assignment_ML_Week1.pdf",
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true,
        created_by: "admin-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: "admin-1",
          name: "Dr. Ahmad Fauzi",
          email: "ahmad.fauzi@university.ac.id",
        },
      },
    ]

    return NextResponse.json({
      success: true,
      assignments: dummyAssignments,
    })
  }
}

// export async function GET(request: NextRequest) {
//   try {
//     // Verify authentication
//     const supabase = await createServerSupabaseClient()
//     const {
//       data: { user },
//       error: authError,
//     } = await supabase.auth.getUser()

//     if (authError || !user) {
//       return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
//     }

//     // Always return dummy assignments for now
//     const dummyAssignments = [
//       {
//         id: "assignment-1",
//         title: "Research Paper: Machine Learning Applications",
//         description:
//           "Write a comprehensive research paper on machine learning applications in healthcare. The paper should be 10-15 pages long and include at least 10 academic references.",
//         dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
//         maxScore: 100,
//         status: "active",
//         creator: {
//           id: "teacher-1",
//           name: "Dr. Sarah Johnson",
//           email: "sarah.johnson@university.edu",
//         },
//         submissionCount: 12,
//         totalStudents: 25,
//         createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
//         requirements: [
//           "Minimum 10 pages",
//           "APA citation format",
//           "At least 10 academic references",
//           "Include abstract and conclusion",
//         ],
//       },
//       {
//         id: "assignment-2",
//         title: "Data Analysis Project",
//         description:
//           "Analyze the provided dataset using statistical methods and create visualizations. Submit your analysis report along with the code.",
//         dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
//         maxScore: 85,
//         status: "active",
//         creator: {
//           id: "teacher-2",
//           name: "Prof. Michael Chen",
//           email: "michael.chen@university.edu",
//         },
//         submissionCount: 8,
//         totalStudents: 25,
//         createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
//         requirements: [
//           "Use Python or R for analysis",
//           "Include data visualizations",
//           "Write interpretation of results",
//           "Submit both report and code",
//         ],
//       },
//       {
//         id: "assignment-3",
//         title: "Group Presentation: AI Ethics",
//         description:
//           "Prepare a 20-minute group presentation on ethical considerations in artificial intelligence. Each group should have 4-5 members.",
//         dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
//         maxScore: 90,
//         status: "active",
//         creator: {
//           id: "teacher-1",
//           name: "Dr. Sarah Johnson",
//           email: "sarah.johnson@university.edu",
//         },
//         submissionCount: 3,
//         totalStudents: 25,
//         createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
//         requirements: [
//           "20-minute presentation",
//           "Groups of 4-5 members",
//           "Include case studies",
//           "Q&A session preparation",
//         ],
//       },
//     ]

//     return NextResponse.json({
//       success: true,
//       assignments: dummyAssignments,
//       total: dummyAssignments.length,
//     })
//   } catch (error) {
//     console.error("Get assignments error:", error)

//     // Return dummy data even on error
//     const dummyAssignments = [
//       {
//         id: "assignment-1",
//         title: "Research Paper: Machine Learning Applications",
//         description: "Write a comprehensive research paper on machine learning applications in healthcare.",
//         dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
//         maxScore: 100,
//         status: "active",
//         creator: {
//           id: "teacher-1",
//           name: "Dr. Sarah Johnson",
//           email: "sarah.johnson@university.edu",
//         },
//         submissionCount: 12,
//         totalStudents: 25,
//         createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
//         requirements: ["Minimum 10 pages", "APA citation format"],
//       },
//     ]

//     return NextResponse.json({
//       success: true,
//       assignments: dummyAssignments,
//       total: dummyAssignments.length,
//     })
//   }
// }
