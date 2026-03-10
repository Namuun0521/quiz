import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { quizId } = await params;

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, article: { userId } },
    include: {
      article: { select: { id: true, title: true } },
      questions: { orderBy: { order: "asc" } },
    },
  });

  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    quiz: {
      id: quiz.id,
      article: quiz.article,
      questions: quiz.questions.map((q) => ({
        id: q.id,
        order: q.order,
        question: q.question,
        choices: q.choices,
      })),
    },
  });
}
