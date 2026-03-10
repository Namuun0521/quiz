"use client";

import { ReactNode } from "react";

export default function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium text-slate-600">{label}</div>
      {children}
    </div>
  );
}
