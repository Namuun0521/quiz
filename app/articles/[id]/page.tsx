// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";

// type Article = {
//   id: string;
//   title: string;
//   content: string;
//   summary?: { text: string } | null;
//   quiz?: { id: string } | null; // ✅ энд байвал шууд userne
// };

// export default function ArticlePage() {
//   const { id } = useParams<{ id: string }>();
//   const router = useRouter();

//   const [loading, setLoading] = useState(true);
//   const [article, setArticle] = useState<Article | null>(null);
//   const [quizLoading, setQuizLoading] = useState(false);

//   useEffect(() => {
//     if (!id) return; // ✅ id байхгүй үед алгасна
//     setArticle(null); // ✅ хуучныг арилгана
//     setLoading(true);

//     (async () => {
//       const res = await fetch(`/api/articles/${id}`, { cache: "no-store" }); // ✅ cache off
//       const data = await res.json();
//       setArticle(data.article ?? null);
//       setLoading(false);
//     })();
//   }, [id]);
//   async function goToQuiz() {
//     if (!article) return;

//     if (article.quiz?.id) {
//       router.push(`/quizzes/${article.quiz.id}`);
//       return;
//     }

//     // ✅ 2) үүсээгүй бол generate хийж аваад очно
//     setQuizLoading(true);
//     const res = await fetch(`/api/articles/${article.id}/quiz`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ count: 5 }),
//     });
//     const data = await res.json();
//     setQuizLoading(false);

//     if (!res.ok) {
//       alert(data.error || "Failed to generate quiz");
//       return;
//     }

//     router.push(`/quizzes/${data.quizId}`);
//   }

//   if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
//   if (!article) return <div style={{ padding: 24 }}>Not found</div>;

//   return (
//     <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
//       <button onClick={() => router.push("/")} style={{ marginBottom: 12 }}>
//         ← Back
//       </button>

//       <h2>{article.title}</h2>

//       <div
//         style={{
//           marginTop: 12,
//           border: "1px solid #eee",
//           borderRadius: 12,
//           padding: 16,
//         }}
//       >
//         <h3>Summary</h3>
//         <p style={{ whiteSpace: "pre-wrap" }}>
//           {article.summary?.text ?? "No summary"}
//         </p>
//       </div>

//       <button
//         onClick={goToQuiz}
//         disabled={quizLoading}
//         style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10 }}
//       >
//         {quizLoading ? "Preparing quiz..." : "Take a quiz"}
//       </button>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Article = {
  id: string;
  title: string;
  content: string;
  summary?: { text: string } | null;
  quiz?: { id: string } | null;
};

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  console.log({ id });

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState<Article | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setArticle(null);

    (async () => {
      const res = await fetch(`/api/articles/${id}`, { cache: "no-store" });
      const data = await res.json();
      console.log({ data });

      setArticle(data.article ?? null);
      setLoading(false);
    })();
  }, [id]);

  async function goToQuiz() {
    if (!article) return;

    if (article.quiz?.id) {
      router.push(`/quizzes/${article.quiz.id}`);
      return;
    }

    setQuizLoading(true);
    const res = await fetch(`/api/articles/${article.id}/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: 5 }),
    });
    const data = await res.json();
    setQuizLoading(false);

    if (!res.ok) {
      alert(data.error || "Failed to generate quiz");
      return;
    }

    router.push(`/quizzes/${data.quizId}`);
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (!article) return <div style={{ padding: 24 }}>Not found</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <button onClick={() => router.push("/")} style={{ marginBottom: 12 }}>
        ← Back
      </button>

      <h2>{article.title}</h2>

      <div
        style={{
          marginTop: 12,
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h3>Summary</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>
          {article.summary?.text ?? "No summary"}
        </p>
      </div>

      <button
        onClick={goToQuiz}
        disabled={quizLoading}
        style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10 }}
      >
        {quizLoading ? "Preparing quiz..." : "Take a quiz"}
      </button>
    </div>
  );
}
