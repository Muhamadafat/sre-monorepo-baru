import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@sre-monorepo/lib"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, ...profileData } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Validate email format if provided
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate birthDate format if provided
    if (profileData.birthDate && profileData.birthDate !== "") {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(profileData.birthDate)) {
        return NextResponse.json({ error: "Invalid birthDate format. Use YYYY-MM-DD" }, { status: 400 })
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: profileData.name || null,
        email: profileData.email,
        phone: profileData.phone || null,
        bio: profileData.bio || null,
        university: profileData.university || null,
        faculty: profileData.faculty || null,
        major: profileData.major || null,
        semester: profileData.semester || null,
        address: profileData.address || null,
        birthDate: profileData.birthDate || null,
        linkedin: profileData.linkedin || null,
        github: profileData.github || null,
        website: profileData.website || null,
        updateAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
