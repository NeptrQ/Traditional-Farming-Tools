"use client";

import { useState } from "react";
import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";
import { entries } from "../data/entries.js";

const styles = {
  wrap: { maxWidth: 720, margin: "0 auto", padding: "80px 24px" },
  kicker: { fontFamily: "'Courier New', monospace", color: "#2EE6A8", fontSize: 14, letterSpacing: 1 },
  title: { fontSize: 48, fontWeight: 700, margin: "16px 0 12px", lineHeight: 1.1 },
  description: { fontSize: 18, color: "#97A1B3", lineHeight: 1.6, margin: 0 },
  card: { marginTop: 16, padding: 24, backgroundColor: "#1C222C", border: "1px solid #2E3644", borderRadius: 10 },
  cardLabel: { fontFamily: "'Courier New', monospace", fontSize: 12, color: "#97A1B3", margin: 0 },
  cardValue: { fontSize: 16, margin: "6px 0 0" },
  input: { width: "100%", padding: "14px 16px", marginTop: 32, fontSize: 16, backgroundColor: "#1C222C", border: "1px solid #2E3644", borderRadius: 8, color: "#FFF", boxSizing: "border-box" },
  empty: { padding: 32, textAlign: "center", color: "#97A1B3", backgroundColor: "#1C222C", border: "1px dashed #2E3644", borderRadius: 10, marginTop: 24 },
  count: { fontFamily: "'Courier New', monospace", fontSize: 14, color: "#2EE6A8", marginTop: 48 },
  footer: { marginTop: 64, paddingTop: 24, borderTop: "1px solid #2E3644", fontSize: 13, color: "#5A6373" },
};

function matchTerm(target, term) {
  return target.includes(term) ||
    (term.endsWith("s") && target.includes(term.slice(0, -1))) ||
    (term.endsWith("es") && target.includes(term.slice(0, -2))) ||
    (term.endsWith("ing") && target.includes(term.slice(0, -3)));
}

export default function Home() {
  const [query, setQuery] = useState("");

  const filtered = entries.filter((entry) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const target = `${entry.title} ${entry.description} ${entry.contributor || ""} ${entry.place || ""}`.toLowerCase();
    return q.split(/\s+/).every((term) => matchTerm(target, term));
  });

  return (
    <main style={styles.wrap}>
      <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
      <h1 style={styles.title}>{collection.name}</h1>
      <p style={styles.description}>{collection.description}</p>

      <div style={{ ...styles.card, marginTop: 48 }}>
        <p style={styles.cardLabel}>CURATED BY</p>
        <p style={styles.cardValue}>{collection.curator}</p>
      </div>
      <div style={styles.card}>
        <p style={styles.cardLabel}>SOURCE</p>
        <p style={styles.cardValue}>{collection.source}</p>
      </div>

      <input
        type="search"
        placeholder="ស្វែងរកឧបករណ៍កសិកម្ម... / Search farming tools..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={styles.input}
      />

      {filtered.length > 0 ? (
        filtered.map((entry) => <EntryCard key={entry.id} entry={entry} />)
      ) : (
        <div style={styles.empty}>
          <p style={{ margin: 0, fontSize: 16, color: "#FFF" }}>រកមិនឃើញឧបករណ៍កសិកម្មទេ។</p>
          <p style={{ margin: "6px 0 0", fontSize: 14 }}>No farming tools found.</p>
        </div>
      )}

      <p style={styles.count}>entries in the archive: {filtered.length}</p>

      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall 2026. This archive is under construction all semester. Come back in December.
      </footer>
    </main>
  );
}
