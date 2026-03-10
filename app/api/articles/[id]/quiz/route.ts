import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { geminiJsonModel } from "@/lib/gemini";
import { extractJsonObject } from "@/lib/json";

export const runtime = "nodejs";

const BodySchema = z.object({
  count: z.number().int().min(5).max(10).optional(),
  force: z.boolean().optional(),
});

const QuizSchema = z.object({
  questions: z
    .array(
      z.object({
        question: z.string().min(5),
        choices: z
          .array(
            z.object({
              label: z.enum(["A", "B", "C", "D"]),
              text: z.string().min(1),
            }),
          )
          .length(4),
        correctLabel: z.enum(["A", "B", "C", "D"]),
        explanation: z.string().optional(),
      }),
    )
    .min(1),
});

async function askGemini(prompt: string) {
  const model = geminiJsonModel();
  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  const cleaned = extractJsonObject(raw);
  return { raw, cleaned };
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const count = parsed.data.count ?? 5;
  const force = parsed.data.force ?? false;

  const { id } = await params;

  const article = await prisma.article.findFirst({
    where: { id, userId },
    include: { summary: true },
  });
  if (!article)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.quiz.findUnique({
    where: { articleId: article.id },
    select: { id: true },
  });

  if (existing && !force)
    return NextResponse.json({ quizId: existing.id, reused: true });

  if (existing && force) {
    await prisma.quiz.delete({ where: { id: existing.id } });
  }

  const source = article.summary?.text || article.content;

  const basePrompt = `
Return ONLY valid JSON. No markdown. No code fences. No extra text.

JSON shape:
{
  "questions": [
    {
      "question": "string",
      "choices": [
        {"label":"A","text":"..."},
        {"label":"B","text":"..."},
        {"label":"C","text":"..."},
        {"label":"D","text":"..."}
      ],
      "correctLabel": "A",
      "explanation": "string (optional)"
    }
  ]
}

Rules:
- Exactly ${count} questions
- Exactly 4 choices A-D per question
- correctLabel must be A/B/C/D

CONTENT:
${source}
`.trim();

  let raw1 = "";
  try {
    const { raw, cleaned } = await askGemini(basePrompt);
    raw1 = raw;

    const obj = JSON.parse(cleaned);
    const v = QuizSchema.safeParse(obj);
    if (!v.success) throw new Error("Validation failed");

    const created = await prisma.quiz.create({
      data: {
        articleId: article.id,
        questions: {
          create: v.data.questions.slice(0, count).map((q, idx) => ({
            order: idx + 1,
            question: q.question,
            choices: q.choices,
            correct: q.correctLabel,
            explanation: q.explanation ?? null,
          })),
        },
      },
    });

    return NextResponse.json({ quizId: created.id });
  } catch (e) {
    try {
      const repairPrompt = `
Fix the following output into VALID JSON matching the required shape.
Return ONLY JSON (no extra text).

BROKEN OUTPUT:
${raw1}
`.trim();

      const { raw: raw2, cleaned: cleaned2 } = await askGemini(repairPrompt);

      const obj2 = JSON.parse(cleaned2);
      const v2 = QuizSchema.safeParse(obj2);
      if (!v2.success) {
        return NextResponse.json(
          {
            error: "AI returned invalid JSON",
            detail: "Validation failed after retry",
            raw: raw2,
          },
          { status: 500 },
        );
      }

      const created = await prisma.quiz.create({
        data: {
          articleId: article.id,
          questions: {
            create: v2.data.questions.slice(0, count).map((q, idx) => ({
              order: idx + 1,
              question: q.question,
              choices: q.choices,
              correct: q.correctLabel,
              explanation: q.explanation ?? null,
            })),
          },
        },
      });

      return NextResponse.json({ quizId: created.id });
    } catch (e2: any) {
      return NextResponse.json(
        {
          error: "AI returned invalid JSON",
          detail: e2?.message ?? String(e2),
          raw: raw1,
        },
        { status: 500 },
      );
    }
  }
}
