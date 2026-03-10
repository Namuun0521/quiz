// src/lib/json.ts
export function extractJsonObject(text: string) {
  const t = (text || "").trim();

  // remove ```json ... ``` fences
  const noFence = t
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  // find first {...} block
  const first = noFence.indexOf("{");
  const last = noFence.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    return noFence.slice(first, last + 1);
  }

  return noFence;
}
