"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

type HistoryItem = {
  id: string;
  title: string;
  createdAt: string;
  summary?: { text: string } | null;
  quiz?: { id: string } | null;
};

export default function DashboardPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  async function loadHistory() {
    setHistoryLoading(true);

    const res = await fetch("/api/articles", { cache: "no-store" });
    const text = await res.text();

    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!res.ok) {
      console.error("History API error:", res.status, data);
      alert(
        `${data.error || `Failed to load history (${res.status})`}\n${
          data.code ? `Code: ${data.code}\n` : ""
        }${data.detail || ""}`,
      );
      setHistory([]);
      setHistoryLoading(false);
      return;
    }

    setHistory(data.items ?? []);
    setHistoryLoading(false);
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function onSummarize() {
    setLoading(true);
    console.log(title, content);

    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, maxLength: 900 }),
    });

    console.log({ res });

    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
      console.log({ data });
    } catch {
      data = { raw: text };
    }

    setLoading(false);

    if (!res.ok) {
      console.error("Summarize error:", data);
      alert(
        `${data.error || "Failed"}\n${data.code ? `Code: ${data.code}\n` : ""}${data.detail || ""}`,
      );
      return;
    }

    // ✅ Шинэ article үүссэн тул history шинэчилнэ
    await loadHistory();

    // ✅ Шууд article page руу үсрүүлнэ
    router.push(`/articles/${data.articleId}`);

    // optional: input-аа цэвэрлэх
    setTitle("");
    setContent("");
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr",
        height: "100vh",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          borderRight: "1px solid #e5e5e5",
          padding: 16,
          overflow: "auto",
        }}
      >
        <h3>History</h3>

        {historyLoading ? (
          <p>Loading...</p>
        ) : history.length === 0 ? (
          <p style={{ opacity: 0.7, fontSize: 14 }}>No articles yet</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {history.map((h) => (
              <Link
                key={h.id}
                href={`/articles/${h.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: 10,
                    border: "1px solid #eee",
                    borderRadius: 10,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{h.title}</div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {new Date(h.createdAt).toLocaleString()}
                  </div>

                  {h.quiz?.id && (
                    <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
                      ✅ Quiz created
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </aside>

      <main style={{ padding: 24, overflow: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={28} />
          <h2 style={{ margin: 0 }}>Article Quiz Generator</h2>
        </div>

        <p style={{ opacity: 0.7 }}>
          Paste title + content → summarize → generate quiz.
        </p>

        <div
          style={{
            marginTop: 16,
            display: "flex",
            flexDirection: "column",
            gap: 10,
            maxWidth: 720,
          }}
        >
          <label>
            <div>Article title</div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title..."
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </label>

          <label>
            <div>Article content</div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste article here..."
              rows={10}
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 10,
                border: "1px solid #ddd",
              }}
            />
          </label>

          <button
            onClick={onSummarize}
            disabled={loading || !title.trim() || content.trim().length < 20}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #000",
              background: "#000",
              color: "#fff",
              width: 180,
              opacity: loading ? 0.7 : 1,
              cursor: "pointer",
            }}
          >
            {loading ? "Summarizing..." : "Summarize & Open"}
          </button>
        </div>
      </main>
    </div>
  );
}
// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { Sparkles } from "lucide-react";

// type HistoryItem = {
//   id: string;
//   title: string;
//   createdAt: string;
//   summary?: { text: string } | null;
//   quiz?: { id: string } | null;
// };

// export default function DashboardPage() {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [summary, setSummary] = useState<string>("");
//   const [articleId, setArticleId] = useState<string>("");

//   const [history, setHistory] = useState<HistoryItem[]>([]);
//   const [historyLoading, setHistoryLoading] = useState(true);

//   async function loadHistory() {
//     setHistoryLoading(true);

//     const res = await fetch("/api/articles", { cache: "no-store" });
//     const text = await res.text();

//     let data: any = {};
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = { raw: text };
//     }

//     if (!res.ok) {
//       console.error("History API error:", res.status, data);
//       alert(data.error || `Failed to load history (${res.status})`);
//       setHistory([]);
//       setHistoryLoading(false);
//       return;
//     }

//     setHistory(data.items ?? []);
//     setHistoryLoading(false);
//   }

//   useEffect(() => {
//     loadHistory();
//   }, []);

//   async function onSummarize() {
//     setLoading(true);
//     setSummary("");
//     setArticleId("");

//     const res = await fetch("/api/summarize", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ title, content, maxLength: 900 }),
//     });

//     const text = await res.text();
//     let data: any = {};
//     try {
//       data = JSON.parse(text);
//     } catch {
//       data = { raw: text };
//     }

//     if (!res.ok) {
//       console.error("Summarize error:", data);
//       alert(
//         `${data.error || "Failed"}\n${data.code ? `Code: ${data.code}\n` : ""}${data.detail || ""}`,
//       );
//       return;
//     }

//     // амжилттай үед
//     setSummary(data.summary);
//     setArticleId(data.articleId);
//   }

//   return (
//     <div
//       style={{
//         display: "grid",
//         gridTemplateColumns: "280px 1fr",
//         height: "100vh",
//       }}
//     >
//       {/* Sidebar */}
//       <aside
//         style={{
//           borderRight: "1px solid #e5e5e5",
//           padding: 16,
//           overflow: "auto",
//         }}
//       >
//         <h3>History</h3>
//         {historyLoading ? (
//           <p>Loading...</p>
//         ) : (
//           <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
//             {history.map((h) => (
//               <Link
//                 key={h.id}
//                 href={`/articles/${h.id}`}
//                 style={{ textDecoration: "none" }}
//               >
//                 <div
//                   style={{
//                     padding: 10,
//                     border: "1px solid #eee",
//                     borderRadius: 10,
//                   }}
//                 >
//                   <div style={{ fontWeight: 600 }}>{h.title}</div>
//                   <div style={{ fontSize: 12, opacity: 0.7 }}>
//                     {new Date(h.createdAt).toLocaleString()}
//                   </div>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </aside>

//       {/* Main */}
//       <main style={{ padding: 24, overflow: "auto" }}>
//         <div className="flex">
//           <Sparkles size={32} />
//           <h2> Article Quiz Generator</h2>
//         </div>
//         <p style={{ opacity: 0.7 }}>
//           Paste title + content → summarize → generate quiz.
//         </p>

//         <div
//           style={{
//             marginTop: 16,
//             display: "flex",
//             flexDirection: "column",
//             gap: 10,
//             maxWidth: 720,
//           }}
//         >
//           <label>
//             <div>Article title</div>
//             <input
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Enter a title..."
//               style={{
//                 width: "100%",
//                 padding: 10,
//                 borderRadius: 10,
//                 border: "1px solid #ddd",
//               }}
//             />
//           </label>

//           <label>
//             <div>Article content</div>
//             <textarea
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               placeholder="Paste article here..."
//               rows={10}
//               style={{
//                 width: "100%",
//                 padding: 10,
//                 borderRadius: 10,
//                 border: "1px solid #ddd",
//               }}
//             />
//           </label>

//           <button
//             onClick={onSummarize}
//             disabled={loading || !title.trim() || content.trim().length < 20}
//             style={{
//               padding: "10px 14px",
//               borderRadius: 10,
//               border: "1px solid #000",
//               background: "#000",
//               color: "#fff",
//               width: 160,
//               opacity: loading ? 0.7 : 1,
//               cursor: "pointer",
//             }}
//           >
//             {loading ? "Summarizing..." : "Summarize"}
//           </button>
//         </div>

//         {summary && (
//           <div
//             style={{
//               marginTop: 24,
//               maxWidth: 720,
//               border: "1px solid #eee",
//               borderRadius: 14,
//               padding: 16,
//             }}
//           >
//             <h3>Summarized content</h3>
//             <p style={{ whiteSpace: "pre-wrap" }}>{summary}</p>

//             {articleId && (
//               <Link href={`/articles/${articleId}`}>
//                 <button
//                   style={{
//                     marginTop: 12,
//                     padding: "10px 14px",
//                     borderRadius: 10,
//                   }}
//                 >
//                   Open article
//                 </button>
//               </Link>
//             )}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
