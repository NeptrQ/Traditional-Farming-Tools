"use client";

import { useState } from "react";
import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";
import { entries } from "../data/entries.js";

const styles = {
  wrap: { maxWidth: 960, margin: "0 auto", padding: "64px 24px", color: "#2D241E" },
  header: { textAlign: "center", marginBottom: 36 },
  kicker: { fontFamily: "'Courier New', monospace", color: "#B87314", fontSize: 13, letterSpacing: 2, fontWeight: 700, margin: "0 0 8px" },
  title: { fontSize: 42, fontWeight: 800, margin: "0 0 12px", color: "#2D241E", lineHeight: 1.2 },
  description: { fontSize: 17, color: "#5C5248", lineHeight: 1.6, maxWidth: 640, margin: "0 auto" },
  metaRow: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 32 },
  card: { padding: "18px 20px", backgroundColor: "#FFFFFF", border: "1px solid #E8E2D8", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", textAlign: "left" },
  cardLabel: { fontFamily: "'Courier New', monospace", fontSize: 11, color: "#B87314", fontWeight: 700, margin: 0 },
  cardValue: { fontSize: 15, color: "#2D241E", margin: "6px 0 0" },
  input: { width: "100%", padding: "14px 20px", fontSize: 16, backgroundColor: "#FFFFFF", border: "1px solid #E8E2D8", borderRadius: 28, color: "#2D241E", boxSizing: "border-box", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", outline: "none", marginTop: 32 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20, marginTop: 28 },
  empty: { padding: 40, textAlign: "center", color: "#5C5248", backgroundColor: "#FFFFFF", border: "1px dashed #E8E2D8", borderRadius: 12, marginTop: 28 },
  count: { fontFamily: "'Courier New', monospace", fontSize: 13, color: "#B87314", fontWeight: 700, marginTop: 40, textAlign: "center" },
  footer: { marginTop: 48, paddingTop: 20, borderTop: "1px solid #E8E2D8", fontSize: 13, color: "#8C827A", textAlign: "center" },
};

export default function Home() {
  const [query, setQuery] = useState("");

  const filtered = entries.filter((entry) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const target = `${entry.title} ${entry.description} ${entry.contributor || ""} ${entry.place || ""}`.toLowerCase();
    return target.includes(q);
  });

  return (
    <main style={styles.wrap}>
      <header style={styles.header}>
        <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
        <h1 style={styles.title}>{collection.name}</h1>
        <p style={styles.description}>{collection.description}</p>
        <div style={styles.metaRow}>
          <div style={styles.card}>
            <p style={styles.cardLabel}>CURATED BY</p>
            <p style={styles.cardValue}>{collection.curator}</p>
          </div>
          <div style={styles.card}>
            <p style={styles.cardLabel}>SOURCE</p>
            <p style={styles.cardValue}>{collection.source}</p>
          </div>
        </div>
      </header>

      <input
        type="search"
        placeholder="ស្វែងរកឧបករណ៍កសិកម្ម... / Search farming tools..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
      />

      {filtered.length > 0 ? (
        <div style={styles.grid}>
          {filtered.map((entry) => <EntryCard key={entry.id} entry={entry} />)}
        </div>
      ) : (
        <div style={styles.empty}>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#2D241E" }}>រកមិនឃើញឧបករណ៍កសិកម្មទេ។</p>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>No farming tools found.</p>
        </div>
      )}

      <p style={styles.count}>entries in the archive: {filtered.length}</p>

      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall 2026. This archive is under construction all semester.
      </footer>
    </main>
  );
}
