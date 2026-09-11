"use client";

import { useState } from "react";
import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";
import EntryModal from "../components/EntryModal.js";
import { entries } from "../data/entries.js";

function getLevenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

function findSuggestion(rawQuery, allEntries) {
  const q = (rawQuery || "").trim().toLowerCase();
  if (!q || q.length < 2 || !allEntries?.length) return null;

  let bestEntry = null;
  let bestScore = 0;

  for (const entry of allEntries) {
    if (!entry?.title) continue;
    const rawClean = entry.title.replace(/[()]/g, " ");
    const terms = [
      entry.title,
      ...rawClean.split(/[\s/]+/).filter((w) => w.length >= 2),
    ];

    for (const term of terms) {
      const t = term.toLowerCase().trim();
      if (!t || t.length < 2) continue;

      let score = 0;
      if (t === q) {
        score = 1.0;
      } else if (t.includes(q) || q.includes(t)) {
        const overlap = Math.min(t.length, q.length);
        const maxLen = Math.max(t.length, q.length);
        score = Math.max(score, overlap / maxLen);
      } else {
        const dist = getLevenshteinDistance(q, t);
        const maxLen = Math.max(q.length, t.length);
        const sim = 1 - dist / maxLen;
        if (dist <= 2 || sim >= 0.45) {
          score = Math.max(score, sim);
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestEntry = entry;
      }
    }
  }

  return bestScore >= 0.45 ? bestEntry : null;
}

const styles = {
  wrap: {
    maxWidth: 960,
    margin: "0 auto",
    padding: "40px 16px",
    boxSizing: "border-box",
    color: "#2D241E",
    width: "100%",
  },
  header: { textAlign: "center", marginBottom: 36 },
  kicker: {
    fontFamily: "'Courier New', monospace",
    color: "#B87314",
    fontSize: 13,
    letterSpacing: 2,
    fontWeight: 700,
    margin: "0 0 8px",
  },
  title: {
    fontSize: "clamp(28px, 6vw, 42px)",
    fontWeight: 800,
    margin: "0 0 12px",
    color: "#2D241E",
    lineHeight: 1.2,
    wordBreak: "break-word",
  },
  description: {
    fontSize: 17,
    color: "#5C5248",
    lineHeight: 1.6,
    maxWidth: 640,
    margin: "0 auto",
  },
  metaRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: 16,
    marginTop: 32,
  },
  card: {
    padding: "18px 20px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E2D8",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    textAlign: "left",
    boxSizing: "border-box",
  },
  cardLabel: {
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
    color: "#B87314",
    fontWeight: 700,
    margin: 0,
  },
  cardValue: { fontSize: 15, color: "#2D241E", margin: "6px 0 0" },
  inputWrap: { position: "relative", marginTop: 32 },
  input: {
    width: "100%",
    padding: "14px 20px 14px 44px",
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E2D8",
    borderRadius: 28,
    color: "#2D241E",
    boxSizing: "border-box",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    outline: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  },
  searchIcon: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: 16,
    color: "#8C827A",
    pointerEvents: "none",
  },
  empty: {
    padding: "48px 20px",
    textAlign: "center",
    backgroundColor: "#FFFFFF",
    border: "1px dashed #E8E2D8",
    borderRadius: 16,
    marginTop: 28,
  },
  emptyTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#2D241E",
  },
  emptySubtitle: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#5C5248",
  },
  suggestionWrap: {
    marginTop: 16,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  suggestionLabel: {
    fontSize: 14,
    color: "#7A6F65",
    fontWeight: 500,
  },
  suggestionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 18px",
    backgroundColor: "#FDF9F3",
    border: "1.5px solid #B87314",
    borderRadius: 24,
    color: "#B87314",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(184, 115, 20, 0.1)",
    transition: "all 0.2s ease",
  },
  count: {
    fontFamily: "'Courier New', monospace",
    fontSize: 13,
    color: "#B87314",
    fontWeight: 700,
    marginTop: 40,
    textAlign: "center",
  },
  footer: {
    marginTop: 48,
    paddingTop: 20,
    borderTop: "1px solid #E8E2D8",
    fontSize: 13,
    color: "#8C827A",
    textAlign: "center",
  },
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);

  const trimmedQuery = query.trim();

  const filtered = (entries || []).filter((entry) => {
    const q = trimmedQuery.toLowerCase();
    if (!q) return true;

    const title = (entry?.title || "").toLowerCase();
    if (q.length === 1) {
      return title.includes(q);
    }

    const description = (entry?.description || "").toLowerCase();
    return title.includes(q) || description.includes(q);
  });

  const suggestion =
    filtered.length === 0 && trimmedQuery
      ? findSuggestion(trimmedQuery, entries)
      : null;

  return (
    <main style={styles.wrap}>
      <style>{`
        .swipe-container {
          display: flex;
          flex-direction: row;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          gap: 16px;
          padding: 8px 16px 20px;
          margin: 20px -16px 0;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .swipe-container::-webkit-scrollbar {
          display: none;
        }
        .swipe-card {
          flex: 0 0 85%;
          max-width: 85%;
          scroll-snap-align: center;
          box-sizing: border-box;
        }
        .entry-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
          border-color: #D8CFC4;
        }
        .search-input:focus {
          border-color: #B87314 !important;
          box-shadow: 0 0 0 3px rgba(184, 115, 20, 0.15), 0 2px 8px rgba(0,0,0,0.04) !important;
        }
        .suggestion-btn:hover {
          background-color: #B87314 !important;
          color: #FFFFFF !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(184, 115, 20, 0.25) !important;
        }
        .mobile-swipe-hint {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 13px;
          color: "#8C827A";
          margin: 16px 0 -8px;
          font-weight: 500;
        }
        @media (min-width: 641px) {
          .swipe-container {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)) !important;
            overflow-x: visible !important;
            padding: 0 !important;
            margin: 28px 0 0 !important;
            gap: 20px !important;
          }
          .swipe-card {
            flex: unset !important;
            max-width: 100% !important;
            scroll-snap-align: unset !important;
          }
          .mobile-swipe-hint {
            display: none !important;
          }
        }
      `}</style>

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

      <div style={styles.inputWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="search"
          placeholder="ស្វែងរកឧបករណ៍កសិកម្ម... / Search farming tools..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={styles.input}
          className="search-input"
        />
      </div>

      {filtered.length > 0 ? (
        <>
          <div className="mobile-swipe-hint">👉 អូសដើម្បីមើលបន្ថែម / Swipe cards</div>
          <div className="swipe-container">
            {filtered.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onSelect={setSelectedEntry}
              />
            ))}
          </div>
        </>
      ) : suggestion ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>
            រកមិនឃើញឧបករណ៍កសិកម្មទេ / No farming tools found matching &ldquo;{trimmedQuery}&rdquo;
          </p>
          <div style={styles.suggestionWrap}>
            <button
              type="button"
              style={styles.suggestionBtn}
              className="suggestion-btn"
              onClick={() => setQuery(suggestion.title)}
            >
              🔍 Did you mean: <strong>{suggestion.title}</strong>?
            </button>
          </div>
        </div>
      ) : (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>រកមិនឃើញឧបករណ៍កសិកម្មទេ។</p>
          <p style={styles.emptySubtitle}>No farming tools found.</p>
        </div>
      )}

      <p style={styles.count}>entries in the archive: {filtered.length}</p>

      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall 2026. This archive is under construction all semester.
      </footer>

      <EntryModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </main>
  );
}
