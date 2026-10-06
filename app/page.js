"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";
import EntryModal from "../components/EntryModal.js";
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
    color: "#44403C",
    backgroundColor: "#F9F8F5",
    width: "100%",
    minHeight: "100vh",
    fontFamily: "system-ui, sans-serif",
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
    color: "#44403C",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  userBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E2DC",
    borderRadius: 4,
    fontSize: 13,
    color: "#1C1917",
    maxWidth: 240,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  logoutBtn: {
    padding: "6px 14px",
    backgroundColor: "transparent",
    border: "1px solid #E5E2DC",
    borderRadius: 4,
    color: "#44403C",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  primaryBtn: {
    padding: "10px 20px",
    backgroundColor: "#1C1917",
    border: "1px solid #1C1917",
    borderRadius: 4,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  dashboardBanner: {
    backgroundColor: "#FFFFFF",
    borderRadius: 4,
    padding: "32px 24px",
    border: "1px solid #E5E2DC",
    marginBottom: 48,
    textAlign: "center",
  },
  dashboardGreeting: {
    fontSize: 24,
    fontWeight: 700,
    fontFamily: "Georgia, 'Kantumruy Pro', serif",
    color: "#1C1917",
    margin: "0 0 12px",
  },
  dashboardSubtext: {
    fontSize: 15,
    color: "#44403C",
    margin: "0 auto 20px",
    maxWidth: 600,
    lineHeight: 1.6,
  },
  statsPill: {
    display: "inline-block",
    padding: "6px 16px",
    backgroundColor: "#F9F8F5",
    border: "1px solid #E5E2DC",
    borderRadius: 4,
    fontSize: 14,
    color: "#44403C",
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
    border: "1px solid #E5E2DC",
    borderRadius: 4,
    color: "#1C1917",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    backgroundColor: "#FFFFFF",
    transition: "all 0.2s ease",
  },
  signupLink: {
    padding: "6px 14px",
    backgroundColor: "#1C1917",
    border: "1px solid #1C1917",
    borderRadius: 4,
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    transition: "all 0.2s ease",
  },
  inputWrap: { position: "relative", marginTop: 32 },
  input: {
    width: "100%",
    padding: "14px 20px 14px 44px",
    fontSize: 16,
    fontFamily: "system-ui, sans-serif",
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E2DC",
    borderRadius: 4,
    color: "#1C1917",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s ease",
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
    border: "1px dashed #E5E2DC",
    borderRadius: 4,
    marginTop: 28,
  },
  emptyTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "Georgia, 'Kantumruy Pro', serif",
    color: "#1C1917",
  },
  emptySubtitle: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "#44403C",
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
    color: "#44403C",
    fontWeight: 500,
  },
  suggestionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 18px",
    backgroundColor: "#F9F8F5",
    border: "1px solid #E5E2DC",
    borderRadius: 4,
    color: "#1C1917",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  count: {
    fontFamily: "'Courier New', monospace",
    fontSize: 13,
    color: "#44403C",
    marginTop: 40,
    textAlign: "center",
  },
  footer: {
    marginTop: 48,
    paddingTop: 20,
    borderTop: "1px solid #E5E2DC",
    fontSize: 13,
    color: "#8C827A",
    textAlign: "center",
  },
};

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showArchive, setShowArchive] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPlace, setNewPlace] = useState("");
  const [newContributor, setNewContributor] = useState("");
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("សូមចូលគណនីជាមុនសិន / Please log in to add new tools.");
      return;
    }
    
    setIsSubmitting(true);
    const supabase = createClient();
    
    let publicUrl = null;
    if (newPhotoFile) {
      const fileExt = newPhotoFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, newPhotoFile);
      
      if (uploadError) {
        alert(`Error uploading photo: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      
      const { data: { publicUrl: url } } = supabase.storage.from('photos').getPublicUrl(filePath);
      publicUrl = url;
    }

    const { data, error } = await supabase.from('entries').insert([{
      title: newTitle,
      description: newDesc,
      place: newPlace,
      contributor: newContributor || user.email,
      photo_url: publicUrl,
      owner: user.id
    }]).select();

    setIsSubmitting(false);

    if (error) {
      alert(`Error adding entry: ${error.message}`);
    } else {
      alert("Success! Entry added.");
      setShowAddModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewPlace("");
      setNewContributor("");
      setNewPhotoFile(null);
      if (data && data.length > 0) {
        setEntries((prev) => [data[0], ...prev]);
      }
    }
  };

  const handleDelete = async (entryId) => {
    const supabase = createClient();
    const { data, error } = await supabase.from('entries').delete().eq('id', entryId).select();
    if (error) {
      alert(`Error deleting entry: ${error.message}`);
    } else if (!data || data.length === 0) {
      console.error("Delete failed: RLS may have silently blocked it.");
      alert("That change wasn't saved");
    } else {
      setEntries((prev) => prev.filter(e => e.id !== entryId));
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
    }
  };

  const handleEditClick = (entry) => {
    setEditEntry(entry);
    setNewTitle(entry.title || "");
    setNewDesc(entry.description || "");
    setNewPlace(entry.place || "");
    setNewContributor(entry.contributor || "");
    setNewPhotoFile(null);
    setPhotoError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user || !editEntry) return;
    
    setIsSubmitting(true);
    const supabase = createClient();
    
    let publicUrl = editEntry.photo_url;
    if (newPhotoFile) {
      const fileExt = newPhotoFile.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, newPhotoFile);
      
      if (uploadError) {
        alert(`Error uploading photo: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      
      const { data: { publicUrl: url } } = supabase.storage.from('photos').getPublicUrl(filePath);
      publicUrl = url;
    }

    const { data, error } = await supabase.from('entries').update({
      title: newTitle,
      description: newDesc,
      place: newPlace,
      contributor: newContributor,
      photo_url: publicUrl
    }).eq('id', editEntry.id).select();

    setIsSubmitting(false);

    if (error) {
      alert(`Error updating entry: ${error.message}`);
    } else if (!data || data.length === 0) {
      console.error("Update failed: No data returned, possibly RLS silent refusal.");
      alert("That change wasn't saved");
    } else {
      alert("Success! Entry updated.");
      setEditEntry(null);
      setNewTitle("");
      setNewDesc("");
      setNewPlace("");
      setNewContributor("");
      setNewPhotoFile(null);
      setEntries((prev) => prev.map(e => e.id === editEntry.id ? data[0] : e));
      if (selectedEntry?.id === editEntry.id) {
        setSelectedEntry(data[0]);
      }
    }
  };



  useEffect(() => {
    const supabase = createClient();

    async function getUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser ?? null);
      setLoadingUser(false);
      if (currentUser) setShowArchive(true);
    }

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingUser(false);
      if (session?.user) setShowArchive(true);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function loadEntries() {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("entries")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setEntries(data);
      }
      setLoading(false);
    }
    loadEntries();
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

  if (!showArchive) {
    return (
      <main className="welcome-portal">
        <style>{`
          .welcome-portal {
            min-height: 100vh;
            background-color: #F9F8F5;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
            position: relative;
            box-sizing: border-box;
            font-family: system-ui, sans-serif;
            color: #44403C;
          }
          .academic-title {
            font-family: Georgia, 'Kantumruy Pro', serif;
            font-size: clamp(32px, 5vw, 42px);
            font-weight: 700;
            color: #1C1917;
            margin: 0 0 12px;
            text-align: center;
            line-height: 1.3;
          }
          .academic-subtitle {
            font-family: Georgia, 'Kantumruy Pro', serif;
            font-size: clamp(20px, 3vw, 24px);
            font-weight: 400;
            color: #44403C;
            margin: 0 0 24px;
            text-align: center;
            font-style: italic;
          }
          .academic-note {
            font-size: 15px;
            color: #44403C;
            line-height: 1.7;
            max-width: 600px;
            text-align: center;
            margin: 0 0 48px;
            border-top: 1px solid #E5E2DC;
            border-bottom: 1px solid #E5E2DC;
            padding: 24px 0;
          }
          .portal-btn-primary {
            padding: 14px 28px;
            background: #1C1917;
            border: 1px solid #1C1917;
            border-radius: 4px;
            color: #FFFFFF;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 10px;
          }
          .portal-btn-primary:hover {
            background: #292524;
          }
          .portal-btn-secondary {
            padding: 14px 28px;
            background-color: transparent;
            border: 1px solid #E5E2DC;
            border-radius: 4px;
            color: #1C1917;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 10px;
          }
          .portal-btn-secondary:hover {
            background-color: #FFFFFF;
          }
          .portal-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            justify-content: center;
          }
          .portal-footer {
            position: absolute;
            bottom: 24px;
            font-size: 13px;
            color: #8C827A;
            text-align: center;
            width: 100%;
          }
        `}</style>

        <h1 className="academic-title">The Khmer Living Archive</h1>
        <h2 className="academic-subtitle">Traditional Agricultural Implements of Cambodia</h2>
        <div className="academic-note">
          A student archive by Va Nuth for ICT 340 at American University of Phnom Penh. Documenting traditional farming tools and oral knowledge from my grandparents in Kampong Cham Province.
        </div>

        <div className="portal-actions">
          <button onClick={() => setShowArchive(true)} className="portal-btn-primary">
            Enter Archive Collection
          </button>
          <Link href="/login" className="portal-btn-secondary">
            Contributor Portal
          </Link>
        </div>

        <footer className="portal-footer">
          Kampong Cham Province • AUPP Software Development • Curated by {collection.curator}
        </footer>
      </main>
    );
  }

  return (
    <main style={styles.wrap}>
      <button onClick={() => setShowArchive(false)} style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        backgroundColor: "transparent",
        border: "1px solid #E8E2D8",
        borderRadius: "20px",
        color: "#5C5248",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        marginBottom: "24px",
        transition: "all 0.2s ease"
      }}>
        ← ត្រឡប់ទៅទំព័រដើម / Back to Welcome
      </button>

      <style>{`
        /* Museum Gallery Grid */
        .museum-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
          margin-top: 40px;
          padding: 0 16px;
        }

        /* EntryCard Hover Interactions */
        .entry-card {
          background-color: #FFFFFF;
          border: 1px solid #E5E2DC;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          overflow-wrap: break-word;
          word-break: break-word;
          cursor: pointer;
          transition: all 0.4s ease;
          position: relative;
        }
        
        .entry-card:hover {
          border-color: #D4A373;
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
        }
        
        .entry-card:hover .entry-image {
          transform: scale(1.03);
        }
        
        .entry-title {
          font-family: Georgia, 'Kantumruy Pro', serif;
          font-size: 20px;
          font-weight: 700;
          color: #1C1917;
          margin: 0 0 10px;
        }
        
        .entry-desc {
          font-size: 15px;
          line-height: 1.8;
          color: #44403C;
          white-space: pre-line;
          margin: 0;
          flex-grow: 1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        
        .entry-card:hover .entry-desc {
          -webkit-line-clamp: unset;
          margin-bottom: 24px;
        }
        
        .entry-empty-desc {
          font-size: 15px;
          font-style: italic;
          color: #8C827A;
          margin: 0 0 16px;
        }
        
        .entry-footer {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 0;
          padding-top: 0;
          border-top: 1px solid transparent;
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        
        .entry-card:hover .entry-footer {
          opacity: 1;
          max-height: 100px;
          padding-top: 16px;
          margin-top: auto;
          border-top-color: #E5E2DC;
        }
        
        .entry-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 4px;
          background-color: #F9F8F5;
          border: 1px solid #E5E2DC;
          font-size: 12px;
          color: #44403C;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .entry-view-hint {
          font-size: 13px;
          color: #1C1917;
          font-weight: 600;
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 4px;
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: all 0.2s ease;
        }
        
        .entry-card:hover .entry-view-hint {
          opacity: 1;
          max-height: 50px;
          margin-top: 16px;
        }
      `}</style>

      <div style={styles.authBar}>
        {!loadingUser &&
          (user ? (
            <div style={styles.authUserInfo}>
              <span style={styles.userBadge} title={user.email}>
                👤 អ្នករួមចំណែក: {user.email}
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

      {!loadingUser && user && (
        <section style={styles.dashboardBanner}>
          <h2 style={styles.dashboardGreeting}>ស្វាគមន៍មកកាន់ផ្ទាំងគ្រប់គ្រង / Welcome to your Contributor Dashboard</h2>
          <p style={styles.dashboardSubtext}>
            You are logged in as an official archive contributor. You can contribute new traditional tools and manage your submissions.
          </p>
          <div style={styles.statsPill}>🌾 My Contributions: 0 tools submitted</div>
          <div>
            <button style={styles.primaryBtn} onClick={() => { setShowAddModal(true); setPhotoError(""); }}>
              ＋ បន្ថែមឧបករណ៍ថ្មី / Add New Farming Tool
            </button>
          </div>
        </section>
      )}

      <div style={styles.inputWrap}>
        {!loadingUser && !user && (
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "inline-block", padding: "6px 14px", backgroundColor: "#FDF9F3", border: "1px solid #E4DDD3", borderRadius: 20, fontSize: 13, color: "#B87314", fontWeight: 700, marginBottom: 16 }}>
              👀 កំពុងមើលជាភ្ញៀវ (Guest Mode) • ចូលគណនីដើម្បីបន្ថែមឧបករណ៍ / Log in to contribute
            </div>
            <div>
              <button onClick={() => alert("សូមចូលគណនីជាមុនសិន / Please log in to add new tools.")} style={styles.primaryBtn}>
                ＋ បន្ថែមឧបករណ៍ថ្មី / Add New Farming Tool
              </button>
            </div>
          </div>
        )}
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

      {loading ? (
        <div style={styles.empty}>
          <p style={styles.emptyTitle}>
            🌾 កំពុងទាញយកទិន្នន័យ... / Loading archive...
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <div id="collection" className="museum-grid">
          {filtered.map((entry, index) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              index={index}
              onSelect={setSelectedEntry}
              currentUser={user}
              onDelete={handleDelete}
              onEdit={handleEditClick}
            />
          ))}
        </div>
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
        currentUser={user}
        onDelete={handleDelete}
        onEdit={handleEditClick}
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
              maxHeight: "90vh", overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, color: "#2D241E", fontWeight: 800 }}>បន្ថែមឧបករណ៍ថ្មី<br /><span style={{ fontSize: 15, color: "#8C827A", fontWeight: 500 }}>Add New Tool</span></h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#8C827A", padding: 0 }}>×</button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>ចំណងជើង / Tool Title *</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Enter tool name" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>ការពិពណ៌នា / Description *</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={4} placeholder="Describe the tool..." style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", resize: "vertical", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>អ្នករួមចំណែក / Contributor *</label>
                <input required value={newContributor} onChange={e => setNewContributor(e.target.value)} placeholder={user?.email || "e.g. Grandfather Sok"} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>ទីកន្លែង / Place of Origin *</label>
                <input required value={newPlace} onChange={e => setNewPlace(e.target.value)} placeholder="e.g. Kampong Cham" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>រូបភាព / Photo Upload</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => {
                  const file = e.target.files[0];
                  if (!file) {
                    setNewPhotoFile(null);
                    return;
                  }
                  const MAX_SIZE = 5 * 1024 * 1024;
                  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
                  if (!ALLOWED_TYPES.includes(file.type)) {
                    e.target.value = "";
                    setNewPhotoFile(null);
                    setPhotoError("រូបភាពត្រូវតែជា JPEG, PNG ឬ WebP / Please upload a JPG, PNG, or WebP image.");
                    return;
                  }
                  if (file.size > MAX_SIZE) {
                    e.target.value = "";
                    setNewPhotoFile(null);
                    setPhotoError("ទំហំរូបភាពត្រូវតែតូចជាង 5 MB / Image size must be under 5 MB.");
                    return;
                  }
                  setNewPhotoFile(file);
                  setPhotoError("");
                }} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
                {photoError && <span style={{ color: "#D32F2F", fontSize: "13px", marginTop: "4px" }}>{photoError}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => { setShowAddModal(false); setPhotoError(""); }} disabled={isSubmitting} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #E8E2D8", background: "transparent", cursor: isSubmitting ? "default" : "pointer", fontWeight: 600, color: "#5C5248" }}>Cancel</button>
                <button type="submit" disabled={isSubmitting || !!photoError} style={{ ...styles.primaryBtn, borderRadius: 10, padding: "12px 24px", opacity: (isSubmitting || !!photoError) ? 0.7 : 1, cursor: (isSubmitting || !!photoError) ? "default" : "pointer" }}>{isSubmitting ? "កំពុងផ្ទុករូបភាព... / Uploading..." : "Submit Tool"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editEntry && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(45, 36, 30, 0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, zIndex: 1000,
          }}
          onClick={() => setEditEntry(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF", borderRadius: 16, padding: "32px 28px",
              width: "100%", maxWidth: 460, boxSizing: "border-box",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              maxHeight: "90vh", overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, color: "#2D241E", fontWeight: 800 }}>កែប្រែឧបករណ៍<br /><span style={{ fontSize: 15, color: "#8C827A", fontWeight: 500 }}>Edit Tool</span></h3>
              <button onClick={() => setEditEntry(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "#8C827A", padding: 0 }}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>ចំណងជើង / Tool Title *</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Enter tool name" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>ការពិពណ៌នា / Description *</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={4} placeholder="Describe the tool..." style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", resize: "vertical", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>អ្នករួមចំណែក / Contributor *</label>
                <input required value={newContributor} onChange={e => setNewContributor(e.target.value)} placeholder={user?.email || "e.g. Grandfather Sok"} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>ទីកន្លែង / Place of Origin *</label>
                <input required value={newPlace} onChange={e => setNewPlace(e.target.value)} placeholder="e.g. Kampong Cham" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "#2D241E" }}>រូបភាព / Photo Upload (Optional)</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => {
                  const file = e.target.files[0];
                  if (!file) {
                    setNewPhotoFile(null);
                    return;
                  }
                  const MAX_SIZE = 5 * 1024 * 1024;
                  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
                  if (!ALLOWED_TYPES.includes(file.type)) {
                    e.target.value = "";
                    setNewPhotoFile(null);
                    setPhotoError("រូបភាពត្រូវតែជា JPEG, PNG ឬ WebP / Please upload a JPG, PNG, or WebP image.");
                    return;
                  }
                  if (file.size > MAX_SIZE) {
                    e.target.value = "";
                    setNewPhotoFile(null);
                    setPhotoError("ទំហំរូបភាពត្រូវតែតូចជាង 5 MB / Image size must be under 5 MB.");
                    return;
                  }
                  setNewPhotoFile(file);
                  setPhotoError("");
                }} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid #E8E2D8", outline: "none", backgroundColor: "#FAF7F2", fontSize: 15 }} className="search-input" />
                {photoError && <span style={{ color: "#D32F2F", fontSize: "13px", marginTop: "4px" }}>{photoError}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => { setEditEntry(null); setPhotoError(""); }} disabled={isSubmitting} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid #E8E2D8", background: "transparent", cursor: isSubmitting ? "default" : "pointer", fontWeight: 600, color: "#5C5248" }}>Cancel</button>
                <button type="submit" disabled={isSubmitting || !!photoError} style={{ ...styles.primaryBtn, borderRadius: 10, padding: "12px 24px", opacity: (isSubmitting || !!photoError) ? 0.7 : 1, cursor: (isSubmitting || !!photoError) ? "default" : "pointer" }}>{isSubmitting ? "កំពុងផ្ទុករូបភាព... / Uploading..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
