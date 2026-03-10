import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { geminiJsonModel } from "@/lib/gemini";

export const runtime = "nodejs";

const BodySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(20),
  maxLength: z.number().int().min(100).max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const json = await req.json().catch(() => null);
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { title, content } = parsed.data;
    const maxLength = parsed.data.maxLength ?? 900;

    const prompt = `
Summarize the following article in clear, simple English.
Return ONLY the summary text. No markdown.
Max length: ${maxLength} characters.

TITLE: ${title}
ARTICLE:
${content}
`.trim();

    let summaryText = "";
    try {
      const model = geminiJsonModel();
      const result = await model.generateContent(prompt);
      summaryText = result.response.text().trim();
    } catch (e: any) {
      console.error("Gemini summarize error:", e);
      return NextResponse.json(
        { error: "Gemini summarize failed", detail: e?.message ?? String(e) },
        { status: 500 },
      );
    }

    try {
      const created = await prisma.article.create({
        data: {
          userId,
          title,
          content,
          summary: { create: { text: summaryText, maxLength } },
        },
        include: { summary: true },
      });

      return NextResponse.json({
        articleId: created.id,
        summary: created.summary?.text ?? summaryText,
        createdAt: created.createdAt,
      });
    } catch (e: any) {
      console.error("Prisma save error:", e);

      const code = e?.code ?? e?.name ?? "DB_ERROR";
      const message = e?.message ?? String(e);

      return NextResponse.json(
        { error: "Failed to save to database", code, detail: message },
        { status: 500 },
      );
    }
  } catch (e: any) {
    console.error("Unexpected summarize route error:", e);
    return NextResponse.json(
      { error: "Unexpected server error", detail: e?.message ?? String(e) },
      { status: 500 },
    );
  }
}
