"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";
import EntryModal from "../components/EntryModal.js";
import { entries } from "../data/entries.js";
import { createClient } from "../utils/supabase/client.js";

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
    padding: "24px 16px 40px",
    boxSizing: "border-box",
    color: "#2D241E",
    width: "100%",
  },
  authBar: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
    minHeight: 38,
    flexWrap: "wrap",
  },
  authUserInfo: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    fontSize: 14,
    color: "#5C5248",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  userBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E2D8",
    borderRadius: 20,
    fontSize: 13,
    color: "#2D241E",
    maxWidth: 240,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    padding: "6px 14px",
    backgroundColor: "transparent",
    border: "1px solid #E8E2D8",
    borderRadius: 8,
    color: "#5C5248",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  primaryBtn: {
    padding: "10px 20px",
    backgroundColor: "#B87314",
    border: "1px solid #B87314",
    borderRadius: 8,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  dashboardBanner: {
    backgroundColor: "#FAF7F2",
    borderRadius: 16,
    padding: "32px 24px",
    border: "1px solid #E8E2D8",
    marginBottom: 48,
    textAlign: "center",
  },
  dashboardGreeting: {
    fontSize: 24,
    fontWeight: 800,
    color: "#2D241E",
    margin: "0 0 12px",
  },
  dashboardSubtext: {
    fontSize: 15,
    color: "#5C5248",
    margin: "0 auto 20px",
    maxWidth: 600,
    lineHeight: 1.6,
  },
  statsPill: {
    display: "inline-block",
    padding: "6px 16px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E2D8",
    borderRadius: 20,
    fontSize: 14,
    color: "#B87314",
    fontWeight: 600,
    margin: "0 0 24px",
  },
  authLinks: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  loginLink: {
    padding: "6px 14px",
    border: "1px solid #E8E2D8",
    borderRadius: 8,
    color: "#2D241E",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    backgroundColor: "#FFFFFF",
    transition: "all 0.2s ease",
  },
  signupLink: {
    padding: "6px 14px",
    backgroundColor: "#B87314",
    border: "1px solid #B87314",
    borderRadius: 8,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  heroHeader: {
    textAlign: "center",
    marginBottom: 48,
    padding: "40px 20px",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    border: "1px solid #E8E2D8",
    boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
    position: "relative",
    overflow: "hidden",
  },
  stickersWrap: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    marginBottom: 20,
    fontSize: 32,
  },
  heroTitle: {
    fontSize: "clamp(24px, 5vw, 36px)",
    fontWeight: 800,
    margin: "0 0 16px",
    color: "#2D241E",
    lineHeight: 1.3,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#5C5248",
    lineHeight: 1.7,
    maxWidth: 700,
    margin: "0 auto 28px",
  },
  pillsWrap: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  heroPill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    backgroundColor: "#FDF9F3",
    border: "1px solid #E4DDD3",
    borderRadius: 24,
    fontSize: 14,
    color: "#5C5248",
    fontWeight: 500,
  },
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
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPlace, setNewPlace] = useState("");

  const handleAddSubmit = (e) => {
    e.preventDefault();
    alert("Submission feature coming soon!");
    setShowAddModal(false);
    setNewTitle("");
    setNewDesc("");
    setNewPlace("");
  };

  const nextCard = () => {
    if (activeIndex < filtered.length - 1) setActiveIndex((prev) => prev + 1);
  };
  const prevCard = () => {
    if (activeIndex > 0) setActiveIndex((prev) => prev - 1);
  };

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > 50) nextCard();
    if (distance < -50) prevCard();
    setTouchStart(0);
    setTouchEnd(0);
  };

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser ?? null);
      setLoadingUser(false);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .floating-sticker {
          animation: float 4s ease-in-out infinite;
        }
        .floating-sticker:nth-child(1) { animation-delay: 0s; }
        .floating-sticker:nth-child(2) { animation-delay: 0.5s; }
        .floating-sticker:nth-child(3) { animation-delay: 1s; }
        .floating-sticker:nth-child(4) { animation-delay: 1.5s; }
        .carousel-viewport {
          overflow: hidden;
          padding: 20px 0 40px;
          margin: 20px -16px 0;
        }
        .carousel-track {
          display: flex;
          flex-direction: row;
          gap: 16px;
          padding: 0 16px;
          width: 100%;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .swipe-card {
          flex: 0 0 85%;
          max-width: 85%;
          box-sizing: border-box;
        }
        .control-bar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 10px;
        }
        .carousel-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #FFFFFF;
          border: 1px solid #E8E2D8;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          color: #5C5248;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .carousel-btn:hover:not(:disabled) {
          background-color: #FDF9F3;
          color: #B87314;
          border-color: #B87314;
        }
        .carousel-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pagination-dots {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #E8E2D8;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .dot.active {
          background-color: #B87314;
          transform: scale(1.3);
        }
      `}</style>

      <div style={styles.authBar}>
        {!loadingUser &&
          (user ? (
            <div style={styles.authUserInfo}>
              <span style={styles.userBadge} title={user.email}>
                👤 Contributor: {user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                style={styles.logoutBtn}
                className="auth-btn"
              >
                ចាកចេញ / Log Out
              </button>
            </div>
          ) : (
            <div style={styles.authLinks}>
              <Link href="/login" style={styles.loginLink} className="auth-btn">
                ចូល / Log In
              </Link>
              <Link
                href="/signup"
                style={styles.signupLink}
                className="auth-btn-primary"
              >
                ចុះឈ្មោះ / Sign Up
              </Link>
            </div>
          ))}
      </div>

      {!loadingUser && user ? (
        <section style={styles.dashboardBanner}>
          <h2 style={styles.dashboardGreeting}>ស្វាគមន៍មកកាន់ផ្ទាំងគ្រប់គ្រង / Welcome to your Contributor Dashboard</h2>
          <p style={styles.dashboardSubtext}>
            You are logged in as an official archive contributor. You can contribute new traditional tools and manage your submissions.
          </p>
          <div style={styles.statsPill}>🌾 My Contributions: 0 tools submitted</div>
          <div>
            <button style={styles.primaryBtn} onClick={() => setShowAddModal(true)}>
              ＋ បន្ថែមឧបករណ៍ថ្មី / Add New Farming Tool
            </button>
          </div>
        </section>
      ) : (
        <header style={styles.heroHeader}>
          <div style={styles.stickersWrap}>
            <span className="floating-sticker">🌾</span>
            <span className="floating-sticker">🐃</span>
            <span className="floating-sticker">🪵</span>
            <span className="floating-sticker">🛖</span>
          </div>
          <h1 style={styles.heroTitle}>ស្វាគមន៍មកកាន់បណ្ណសារឧបករណ៍កសិកម្មបុរាណខ្មែរ</h1>
          <p style={styles.heroSubtitle}>
            Welcome to the Traditional Khmer Farming Tools Archive — where you can explore the timeless tools and agricultural heritage used by Cambodian farmers and elders for generations.
          </p>
          <div style={styles.pillsWrap}>
            <div style={styles.heroPill}>
              <span>📍</span>
              <span>Sourced from {collection.source}</span>
            </div>
            <div style={styles.heroPill}>
              <span>👤</span>
              <span>Curated by {collection.curator}</span>
            </div>
            <div style={styles.heroPill}>
              <span>🏛️</span>
              <span>Preserving Living Knowledge</span>
            </div>
          </div>
        </header>
      )}

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
          <div className="carousel-viewport" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div 
              className="carousel-track"
              style={{ transform: `translateX(calc(-${activeIndex * 85}% - ${activeIndex * 16}px))` }}
            >
              {filtered.map((entry, index) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  onSelect={setSelectedEntry}
                  isActive={index === activeIndex}
                />
              ))}
            </div>
          </div>
          <div className="control-bar">
            <button 
              type="button"
              className="carousel-btn" 
              onClick={prevCard}
              disabled={activeIndex === 0}
              aria-label="Previous"
            >
              &lt;
            </button>
            <div className="pagination-dots">
              {filtered.map((_, index) => (
                <div 
                  key={index} 
                  className={`dot ${index === activeIndex ? "active" : ""}`}
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button 
              type="button"
              className="carousel-btn" 
              onClick={nextCard}
              disabled={activeIndex === filtered.length - 1}
              aria-label="Next"
            >
              &gt;
            </button>
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

      {showAddModal && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(45, 36, 30, 0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF", borderRadius: 16, padding: "32px 28px",
              width: "100%", maxWidth: 460, boxSizing: "border-box",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, color: "#2D241E", fontWeight: 800 }}>បន្ថែមឧបករណ៍ថ្មី<br/><span style={{fontSize: 15, color: "#8C827A", fontWeight: 500}}>Add New Tool</span></h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#8C827A", padding: 0 }}>×</button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>ចំណងជើង / Tool Title</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Enter tool name" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>ការពិពណ៌នា / Description</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={4} placeholder="Describe the tool..." style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", resize: "vertical", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>ទីកន្លែង / Place of Origin</label>
                <input required value={newPlace} onChange={e => setNewPlace(e.target.value)} placeholder="e.g. Kampong Cham" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #E8E2D8", background: "transparent", cursor: "pointer", fontWeight: 600, color: "#5C5248" }}>Cancel</button>
                <button type="submit" style={{...styles.primaryBtn, borderRadius: 10, padding: "12px 24px"}}>Submit Tool</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
