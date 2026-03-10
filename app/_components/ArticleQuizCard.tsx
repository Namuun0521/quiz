"use client";

import { FileText, Sparkles } from "lucide-react";
import Field from "./Field";

type Props = {
  title: string;
  content: string;
  setTitle: (v: string) => void;
  setContent: (v: string) => void;
  canGenerate: boolean;
};

export default function ArticleQuizCard({
  title,
  content,
  setTitle,
  setContent,
  canGenerate,
}: Props) {
  return (
    <div className="w-157 h-full bg-gray-200 mx-64 mt-12">
      <section className="justify-center   rounded-lg border border-slate-200 bg-white">
        <div className="px-6 py-6">
          <div className="flex items-start gap-3">
            <div className="text-3xl">
              <Sparkles size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-800">
                Article Quiz Generator
              </h1>
              <p className=" text-base text-slate-500">
                Paste your article below to generate a summarize and quiz
                question. Your articles will saved in the sidebar for future
                reference.
              </p>
            </div>
          </div>

          <div className="w-full mt-6 space-y-4 text-sm">
            <Field label="Article Title ">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your article..."
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />
            </Field>

            <Field label="Article Content">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your article content here..."
                className=" w-full h-40 resize-none rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-200"
              />
            </Field>

            <div className="flex justify-end pt-2">
              <button
                disabled={!canGenerate}
                className={`h-9 rounded-md px-4 text-sm font-medium transition ${
                  canGenerate
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed"
                }`}
              >
                Generate summary
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
