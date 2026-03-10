"use client";

import { useEffect, useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";
type Q = {
  id: string;
  order: number;
  question: string;
  choices: any;
};

export default function QuizPage() {
  const params = useParams<{ quizId: string }>();

  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<{
    id: string;
    questions: Q[];
    article: any;
  } | null>(null);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/quizzes/${params.quizId}`);
      const data = await res.json();
      setQuiz(data.quiz ?? null);
      setLoading(false);
    })();
  }, [params.quizId]);

  const total = quiz?.questions.length ?? 0;
  const answeredCount = useMemo(() => Object.keys(answers).length, [answers]);
  const canSubmit = total > 0 && answeredCount === total;

  function normalizeChoices(raw: any): Array<{ label: string; text: string }> {
    if (!raw) return [];
    if (Array.isArray(raw) && raw.length && typeof raw[0] === "object")
      return raw;

    if (Array.isArray(raw)) {
      const labels = ["A", "B", "C", "D"];
      return raw
        .slice(0, 4)
        .map((t, i) => ({ label: labels[i], text: String(t) }));
    }
    return [];
  }

  async function onSubmit() {
    if (!quiz) return;
    setSubmitting(true);
    const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answersByQuestionId: answers }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      alert(data.error || "Submit failed");
      return;
    }
    setResult(data);
  }

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>;
  if (!quiz) return <p style={{ padding: 24 }}>Not found</p>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2> Quick test</h2>
      <p style={{ opacity: 0.7 }}>{quiz.article?.title}</p>

      {!result ? (
        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {quiz.questions.map((q) => {
            const choices = normalizeChoices(q.choices);
            const selected = answers[q.id];

            return (
              <div
                key={q.id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>
                    {q.order}. {q.question}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {q.order}/{total}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {choices.map((c) => (
                    <button
                      key={c.label}
                      onClick={() =>
                        setAnswers((p) => ({ ...p, [q.id]: c.label }))
                      }
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        border: "1px solid #ddd",
                        background: selected === c.label ? "#111" : "#fff",
                        color: selected === c.label ? "#fff" : "#111",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <b>{c.label}.</b> {c.text}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <button
            onClick={onSubmit}
            disabled={!canSubmit || submitting}
            style={{ padding: "10px 14px", borderRadius: 10, width: 180 }}
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>

          <div style={{ fontSize: 13, opacity: 0.7 }}>
            Answered: {answeredCount}/{total}
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 18 }}>
          <h3>
            Score: {result.score}/{result.total}
          </h3>

          <div
            style={{
              marginTop: 12,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {result.breakdown.map((b: any) => (
              <div
                key={b.questionId}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  {b.order}. {b.question}
                </div>
                <div style={{ marginTop: 8 }}>
                  Your answer: <b>{b.userAnswer || "-"}</b> {"  "}
                  {b.isCorrect ? "✅" : "❌"}
                </div>
                {!b.isCorrect && (
                  <div style={{ marginTop: 6 }}>
                    Correct answer: <b>{b.correctAnswer}</b>
                  </div>
                )}
                {b.explanation && (
                  <div style={{ marginTop: 6, opacity: 0.8 }}>
                    {b.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
            <button
              onClick={() =>
                router.push(
                  quiz?.article?.id ? `/articles/${quiz.article.id}` : "/",
                )
              }
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #ddd",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              ← Back
            </button>

            <button
              onClick={() => {
                setAnswers({});
                setResult(null);
                router.push("/");
              }}
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid #000",
                background: "#000",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Start again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
