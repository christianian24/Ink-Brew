import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, genreTags, coverImage } = body;

    await prisma.bookDraft.upsert({
      where: { authorId: session.user.id },
      create: {
        authorId: session.user.id,
        title: title || "",
        description: description || "",
        genreTags: genreTags || "",
        coverImage: coverImage || null,
      },
      update: {
        title: title || "",
        description: description || "",
        genreTags: genreTags || "",
        coverImage: coverImage || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[/api/draft/book POST]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
