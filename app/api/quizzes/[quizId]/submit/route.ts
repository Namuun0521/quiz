import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const BodySchema = z.object({
  answersByQuestionId: z.record(z.string(), z.string()),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> },
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { quizId } = await params;

  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, article: { userId } },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const answers = parsed.data.answersByQuestionId;
  const total = quiz.questions.length;

  let score = 0;
  const breakdown = quiz.questions.map((q) => {
    const userAnswer = (answers[q.id] || "").trim();
    const correct = q.correct.trim();
    const isCorrect = userAnswer === correct;
    if (isCorrect) score += 1;

    return {
      questionId: q.id,
      order: q.order,
      question: q.question,
      userAnswer,
      correctAnswer: correct,
      isCorrect,
      explanation: q.explanation ?? null,
    };
  });

  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId,
      score,
      total,
      answers,
    },
  });

  return NextResponse.json({ attemptId: attempt.id, score, total, breakdown });
}
