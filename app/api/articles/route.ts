import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await prisma.article.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        createdAt: true,
        summary: { select: { text: true } },
        quiz: { select: { id: true } },
      },
    });

    return NextResponse.json({ items });
  } catch (e: any) {
    console.error("GET /api/articles error:", e);

    return NextResponse.json(
      {
        error: "Failed to load articles",
        detail: e?.message ?? String(e),
        code: e?.code ?? e?.name ?? "UNKNOWN",
      },
      { status: 500 },
    );
  }
}
