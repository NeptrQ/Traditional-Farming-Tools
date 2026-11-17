"use client";

import { useLanguage } from "../app/LanguageContext.js";

export default function StatusBadge({ status, style = {} }) {
  let lang = "KH";
  try {
    const ctx = useLanguage();
    if (ctx?.lang) lang = ctx.lang;
  } catch {
    lang = "KH";
  }

  if (!status) return null;

  let label = status;
  let bg = "var(--surface-soft)";
  let border = "var(--border)";
  let color = "var(--text)";
  let dotColor = "var(--text-muted)";

  if (status === "pending") {
    label = lang === "KH" ? "កំពុងរង់ចាំការពិនិត្យ" : "Pending Review";
    bg = "rgba(232, 176, 74, 0.15)";
    border = "var(--accent)";
    color = "var(--accent-text)";
    dotColor = "var(--accent)";
  } else if (status === "published") {
    label = lang === "KH" ? "បានបោះពុម្ពផ្សាយ" : "Published";
    bg = "rgba(34, 197, 94, 0.15)";
    border = "#22c55e";
    color = "#22c55e";
    dotColor = "#22c55e";
  } else if (status === "returned") {
    label = lang === "KH" ? "បានប្រគល់ជូនវិញ" : "Returned for Revision";
    bg = "rgba(200, 85, 61, 0.15)";
    border = "var(--accent-2)";
    color = "var(--accent-2)";
    dotColor = "var(--accent-2)";
  }

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 10px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 600,
        fontFamily: lang === "KH" ? "var(--font-khmer)" : "var(--font-sans)",
        backgroundColor: bg,
        border: `1px solid ${border}`,
        color: color,
        lineHeight: 1.2,
        ...style,
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: dotColor,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
