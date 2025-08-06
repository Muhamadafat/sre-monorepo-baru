import { type NextRequest, NextResponse } from "next/server"
import { prisma } from '@sre-monorepo/lib';
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"


export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("avatar") as File
    const userId = formData.get("userId") as string

    if (!file || !userId) {
      return NextResponse.json({ error: "File and userId are required" }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPG, PNG, GIF allowed" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size too large. Max 5MB allowed" }, { status: 400 })
    }

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), "public", "uploads", "avatars")
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const filePath = join(uploadDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Generate public URL
    const avatarUrl = `/uploads/avatars/${fileName}`

    // Update user avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar_url: avatarUrl,
        updateAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, avatarUrl, user: updatedUser })
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return NextResponse.json({ error: "Failed to upload avatar" }, { status: 500 })
  }
}
