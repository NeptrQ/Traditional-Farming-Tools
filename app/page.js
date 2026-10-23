"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";
import EntryModal from "../components/EntryModal.js";
import { createClient } from "../utils/supabase/client.js";
import { SpotlightGrid, ScrollCarousel, HorizontalScroll } from "./components/ImmersiveKit.jsx";
import { useLanguage } from "./LanguageContext.js";

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
  landingPage: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--space-40) 0",
    boxSizing: "border-box",
  },
  splitLayout: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    backgroundColor: "var(--color-white)",
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    border: "1px solid var(--border)",
    boxShadow: "0 4px 6px var(--shadow)",
    minHeight: 560,
  },
  landingContent: {
    flex: 1,
    padding: "var(--space-64) var(--space-40)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  greenPane: {
    flex: 1,
    backgroundColor: "var(--color-paddy-green)",
    color: "var(--color-white)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--space-40)",
    borderLeft: "1px solid var(--border)",
  },
  academicTitle: {
    fontFamily: "var(--font-serif), var(--font-khmer-title), serif",
    fontSize: "clamp(32px, 4vw, 48px)",
    fontWeight: 700,
    color: "var(--color-soil-brown)",
    margin: "0 0 var(--space-16)",
    lineHeight: 1.2,
  },
  academicKhmerTitle: {
    fontFamily: "var(--font-serif), var(--font-khmer-title), serif",
    fontSize: "clamp(24px, 3vw, 32px)",
    color: "var(--color-clay-terracotta)",
    margin: "0 0 var(--space-8)",
    fontWeight: 700,
  },
  academicNote: {
    fontSize: 16,
    color: "var(--color-soil-brown)",
    opacity: 0.9,
    lineHeight: 1.7,
    margin: "0 0 var(--space-24)",
  },
  landingQuote: {
    borderLeft: "4px solid var(--color-clay-terracotta)",
    paddingLeft: "var(--space-16)",
    fontStyle: "italic",
    marginBottom: "var(--space-40)",
    color: "var(--color-soil-brown)",
    opacity: 0.8,
  },
  portalActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "var(--space-16)",
  },
  featuredTool: {
    textAlign: "center",
  },
  featuredPhotoPlaceholder: {
    width: "100%",
    maxWidth: 300,
    aspectRatio: "4/3",
    backgroundColor: "var(--border)",
    border: "2px dashed var(--border-strong)",
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto var(--space-24)",
    fontStyle: "italic",
    padding: "var(--space-24)",
  },
  archiveGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "var(--space-24)",
    marginTop: "var(--space-40)",
  },
  emptyTitle: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "var(--font-serif), var(--font-khmer-title), serif",
    color: "var(--color-soil-brown)",
  },
  emptySubtitle: {
    margin: "6px 0 0",
    fontSize: 14,
    color: "var(--color-soil-brown)",
    opacity: 0.8,
  },
  suggestionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 18px",
    backgroundColor: "var(--color-warm-paper)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-soil-brown)",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "var(--space-16)",
  }
};

export default function Home() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const { lang } = useLanguage();

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
      alert("សំណើរបស់អ្នកត្រូវបានបញ្ជូនសម្រាប់ការត្រួតពិនិត្យ! / Your entry has been submitted for review! It will be verified by an archivist before appearing in the public collection.");
      setShowAddModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewPlace("");
      setNewContributor("");
      setNewPhotoFile(null);
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

    const { data: isReviewer } = await supabase.rpc('is_reviewer');

    const updatePayload = {
      title: newTitle,
      description: newDesc,
      place: newPlace,
      contributor: newContributor,
      photo_url: publicUrl
    };

    if (!isReviewer) {
      updatePayload.status = 'pending';
    }

    const { data, error } = await supabase.from('entries').update(updatePayload).eq('id', editEntry.id).select();

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
      setEntries((prev) => {
        if (data[0].status !== 'published') {
          return prev.filter(e => e.id !== editEntry.id);
        }
        return prev.map(e => e.id === editEntry.id ? data[0] : e);
      });
      if (selectedEntry?.id === editEntry.id) {
        if (data[0].status !== 'published') {
          setSelectedEntry(null);
        } else {
          setSelectedEntry(data[0]);
        }
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
        .eq("status", "published")
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
      <main style={{ width: "100%", overflowX: "clip" }}>
        {/* HERO SECTION */}
        <section className="container" style={{ padding: "var(--space-64) 1.5rem", minHeight: "80vh", display: "flex", flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "var(--space-40)", position: "relative" }}>
          
          {/* Left Column */}
          <div style={{ flex: "1 1 500px", textAlign: "left", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <div className="hero-mask">
              <h1 className="hero-headline-line khmer-title" style={{ fontFamily: lang === 'KH' ? "var(--font-khmer-title)" : "var(--font-serif)", fontSize: "clamp(48px, 6vw, 72px)", color: "var(--color-paper)", margin: "0 0 var(--space-8)" }}>
                {lang === 'KH' ? 'បណ្ណសារឧបករណ៍កសិកម្ម' : 'Traditional Farming Tools'}
              </h1>
            </div>
            <h2 style={{ fontFamily: lang === 'KH' ? "var(--font-khmer)" : "var(--font-serif)", fontSize: "clamp(40px, 5vw, 72px)", color: "var(--color-paper)", margin: "0 0 var(--space-40)", fontWeight: 400, lineHeight: 1.2 }}>
              {lang === 'KH' ? (
                <>
                  <span className="hero-word" style={{ animationDelay: "200ms" }}>ឧបករណ៍</span>{' '}
                  <span className="hero-word" style={{ animationDelay: "245ms" }}>ដែល</span>{' '}
                  <span className="hero-word" style={{ animationDelay: "290ms" }}>ដូនតា</span>{' '}
                  <span className="hero-word" style={{ animationDelay: "335ms" }}>របស់</span>{' '}
                  <span className="hero-word" style={{ animationDelay: "380ms" }}>ខ្ញុំ</span>{' '}
                  <span className="hero-word" style={{ animationDelay: "425ms", color: "var(--accent)" }}>នៅតែប្រើ</span><span className="hero-word" style={{ animationDelay: "425ms" }}>។</span>
                </>
              ) : (
                <>
                  <span className="hero-word" style={{ animationDelay: "200ms" }}>The</span>{' '}
                  <span className="hero-word" style={{ animationDelay: "245ms" }}>tools</span>{' '}
                  <span className="hero-word" style={{ animationDelay: "290ms" }}>my</span>{' '}
                  <span className="hero-word" style={{ animationDelay: "335ms" }}>grandparents</span>{' '}
                  <span className="hero-word" style={{ animationDelay: "380ms" }}>still</span>{' '}
                  <span className="hero-word" style={{ animationDelay: "425ms", fontStyle: "italic", color: "var(--accent)" }}>use</span><span className="hero-word" style={{ animationDelay: "425ms" }}>.</span>
                </>
              )}
            </h2>
            <div style={{ display: "flex", gap: "var(--space-16)", flexWrap: "wrap" }}>
              <button onClick={() => setShowArchive(true)} className="btn btn-primary hero-button" style={{ animationDelay: "500ms" }}>
                {lang === 'KH' ? 'ស្វែងរកបណ្ណសារ' : 'Browse Archive'}
              </button>
              <Link href="/login" className="btn btn-secondary hero-button" style={{ animationDelay: "550ms" }}>
                Contributor Login
              </Link>
            </div>
          </div>

          {/* Right Column: Featured Card */}
          <div className="card spot-card hero-card" style={{ flex: "1 1 300px", padding: "var(--space-24)", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ width: "100%", aspectRatio: "4/3", backgroundColor: "var(--input-bg)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {entries && entries.length > 0 && entries[0].photo_url ? (
                <img src={entries[0].photo_url} alt={entries[0].title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <pattern id="pat-hero" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M0 20L20 0ZM20 20L0 0" stroke="var(--color-straw-gold)" strokeWidth="1" fill="none" opacity="0.3"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#pat-hero)" />
                </svg>
              )}
            </div>
            <div>
              <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)", color: "var(--color-muted)", marginBottom: "4px" }}>FEATURED</div>
              <h3 className="khmer-title" style={{ color: "var(--color-straw-gold)", fontSize: "24px", margin: "0 0 8px" }}>
                {entries && entries.length > 0 ? entries[0].title : "នង្គ័ល / Nongkol"}
              </h3>
              <p style={{ color: "var(--color-muted)", fontSize: "15px", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {entries && entries.length > 0 ? entries[0].description : "The traditional ox-drawn plow. Pulled by a pair of oxen, the wooden plough turns the hard earth into soft furrows ready for the rains."}
              </p>
            </div>
          </div>
          
          {/* Scroll Hint */}
          <div style={{ position: "absolute", bottom: "var(--space-24)", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
            <div className="hero-scroll-line" />
          </div>
        </section>

        {/* HORIZONTAL SCROLL: A year in the rice field */}
        <HorizontalScroll label="A year in the rice field">
          <div className="card spot-card" style={{ width: "clamp(340px, 80vw, 420px)", flexShrink: 0, scrollSnapAlign: "center", padding: "var(--space-40)", backgroundColor: "var(--color-glass)", border: "1px solid var(--color-glass-border)", borderRadius: "var(--radius-md)" }}>
            <h3 style={{ fontSize: "32px", fontFamily: "var(--font-khmer-title)", color: "var(--color-straw-gold)", margin: "0 0 8px" }}>នង្គ័ល</h3>
            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)", color: "var(--color-muted)", marginBottom: "var(--space-16)" }}>PLOUGH / PREPARING THE SOIL</div>
            <p style={{ color: "var(--color-paper)", lineHeight: 1.6, marginBottom: "var(--space-24)" }}>
              The first step of the season. Pulled by a pair of oxen, the wooden plough turns the hard earth into soft furrows ready for the rains.
            </p>
            <button onClick={() => { setShowArchive(true); setQuery("Nongkol"); }} style={{ background: "none", border: "none", color: "var(--color-straw-gold)", textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}>View in archive →</button>
          </div>
          <div className="card spot-card" style={{ width: "clamp(340px, 80vw, 420px)", flexShrink: 0, scrollSnapAlign: "center", padding: "var(--space-40)", backgroundColor: "var(--color-glass)", border: "1px solid var(--color-glass-border)", borderRadius: "var(--radius-md)" }}>
            <h3 style={{ fontSize: "32px", fontFamily: "var(--font-khmer-title)", color: "var(--color-straw-gold)", margin: "0 0 8px" }}>រនាស់</h3>
            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)", color: "var(--color-muted)", marginBottom: "var(--space-16)" }}>HARROW / LEVELING</div>
            <p style={{ color: "var(--color-paper)", lineHeight: 1.6, marginBottom: "var(--space-24)" }}>
              Following the plough, the harrow breaks up large clods of soil and creates a smooth, level bed for planting rice seedlings.
            </p>
            <button onClick={() => { setShowArchive(true); setQuery("Ronoas"); }} style={{ background: "none", border: "none", color: "var(--color-straw-gold)", textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}>View in archive →</button>
          </div>
          <div className="card spot-card" style={{ width: "clamp(340px, 80vw, 420px)", flexShrink: 0, scrollSnapAlign: "center", padding: "var(--space-40)", backgroundColor: "var(--color-glass)", border: "1px solid var(--color-glass-border)", borderRadius: "var(--radius-md)" }}>
            <h3 style={{ fontSize: "32px", fontFamily: "var(--font-khmer-title)", color: "var(--color-straw-gold)", margin: "0 0 8px" }}>កណ្តៀវ</h3>
            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)", color: "var(--color-muted)", marginBottom: "var(--space-16)" }}>SICKLE / HARVEST</div>
            <p style={{ color: "var(--color-paper)", lineHeight: 1.6, marginBottom: "var(--space-24)" }}>
              A curved blade honed to a razor edge. Used by hand, stalk by stalk, when the golden grains are finally ready to be gathered.
            </p>
            <button onClick={() => { setShowArchive(true); setQuery("Sickle"); }} style={{ background: "none", border: "none", color: "var(--color-straw-gold)", textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}>View in archive →</button>
          </div>
          <div className="card spot-card" style={{ width: "clamp(340px, 80vw, 420px)", flexShrink: 0, scrollSnapAlign: "center", padding: "var(--space-40)", backgroundColor: "var(--color-glass)", border: "1px solid var(--color-glass-border)", borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
            <h3 style={{ fontSize: "28px", fontFamily: "var(--font-serif)", color: "var(--color-straw-gold)", margin: "0 0 16px" }}>
              Explore the Full Archive
            </h3>
            <p style={{ color: "var(--color-paper)", lineHeight: 1.6, marginBottom: "var(--space-24)" }}>
              Browse the complete collection of tools, categories, and oral histories.
            </p>
            <button onClick={() => setShowArchive(true)} className="btn btn-primary focus-ring">
              Browse Archive
            </button>
          </div>
        </HorizontalScroll>

        {/* CAROUSEL: Stories from my grandparents */}
        <section className="container" style={{ padding: "var(--space-64) 0", borderTop: "1px solid var(--color-glass-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-40)" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 400, color: "var(--color-paper)", margin: 0 }}>
              Passed down by <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-straw-gold)" }}>voice</span>
            </h2>
            <div style={{ fontSize: "14px", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>STORIES FROM MY GRANDPARENTS</div>
          </div>
          <ScrollCarousel label="Stories from my grandparents">
            <div className="spot-card card" style={{ padding: "var(--space-40)", width: "300px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "3rem", color: "var(--color-straw-gold)", opacity: 0.2, lineHeight: 0.8 }}>&ldquo;</div>
              <p style={{ flex: 1, fontSize: "1.125rem", fontStyle: "italic", color: "var(--color-paper)", margin: "0 0 var(--space-24)" }}>[Placeholder] A story about how the sickle was forged by a local blacksmith in the village.</p>
              <div style={{ fontSize: "0.875rem", fontFamily: "var(--font-mono)", color: "var(--color-straw-gold)" }}>— GRANDFATHER SOK (SICKLE)</div>
            </div>
            <div className="spot-card card" style={{ padding: "var(--space-40)", width: "300px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "3rem", color: "var(--color-straw-gold)", opacity: 0.2, lineHeight: 0.8 }}>&ldquo;</div>
              <p style={{ flex: 1, fontSize: "1.125rem", fontStyle: "italic", color: "var(--color-paper)", margin: "0 0 var(--space-24)" }}>[Placeholder] I remember learning to weave the winnowing fan when I was just ten years old.</p>
              <div style={{ fontSize: "0.875rem", fontFamily: "var(--font-mono)", color: "var(--color-straw-gold)" }}>— GRANDMOTHER CHEA (WINNOWING FAN)</div>
            </div>
            <div className="spot-card card" style={{ padding: "var(--space-40)", width: "300px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "3rem", color: "var(--color-straw-gold)", opacity: 0.2, lineHeight: 0.8 }}>&ldquo;</div>
              <p style={{ flex: 1, fontSize: "1.125rem", fontStyle: "italic", color: "var(--color-paper)", margin: "0 0 var(--space-24)" }}>[Placeholder] The rains came late that year, and the plough felt twice as heavy in the dry earth.</p>
              <div style={{ fontSize: "0.875rem", fontFamily: "var(--font-mono)", color: "var(--color-straw-gold)" }}>— GRANDFATHER SOK (PLOUGH)</div>
            </div>
            <div className="spot-card card" style={{ padding: "var(--space-40)", width: "300px", height: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: "3rem", color: "var(--color-straw-gold)", opacity: 0.2, lineHeight: 0.8 }}>&ldquo;</div>
              <p style={{ flex: 1, fontSize: "1.125rem", fontStyle: "italic", color: "var(--color-paper)", margin: "0 0 var(--space-24)" }}>[Placeholder] We built the granary high to keep out the floods. It still stands today.</p>
              <div style={{ fontSize: "0.875rem", fontFamily: "var(--font-mono)", color: "var(--color-straw-gold)" }}>— GRANDMOTHER CHEA (GRANARY)</div>
            </div>
          </ScrollCarousel>
        </section>

        {/* ARCHIVE IN NUMBERS */}
        <section className="container" style={{ padding: "var(--space-64) 0" }}>
          <div style={{ textAlign: "center", marginBottom: "var(--space-40)" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 400, color: "var(--color-paper)", margin: 0 }}>
              The archive in <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-straw-gold)" }}>numbers</span>
            </h2>
          </div>
          <SpotlightGrid className="museum-grid">
            <div className="card spot-card" style={{ padding: "var(--space-40)", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", fontFamily: "var(--font-serif)", color: "var(--color-straw-gold)", marginBottom: "var(--space-8)" }}>{entries.length || 24}</div>
              <div style={{ fontSize: "1rem", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>TOOLS DOCUMENTED</div>
            </div>
            <div className="card spot-card" style={{ padding: "var(--space-40)", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", fontFamily: "var(--font-serif)", color: "var(--color-straw-gold)", marginBottom: "var(--space-8)" }}>12</div>
              <div style={{ fontSize: "1rem", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>ORAL STORIES</div>
            </div>
            <div className="card spot-card" style={{ padding: "var(--space-40)", textAlign: "center" }}>
              <div style={{ fontSize: "3rem", fontFamily: "var(--font-serif)", color: "var(--color-straw-gold)", marginBottom: "var(--space-8)" }}>85+</div>
              <div style={{ fontSize: "1rem", color: "var(--color-muted)", fontFamily: "var(--font-mono)" }}>YEARS OF KNOWLEDGE</div>
            </div>
          </SpotlightGrid>
        </section>

        {/* CALL TO ACTION */}
        <section className="container" style={{ padding: "var(--space-64) 0", marginBottom: "var(--space-64)" }}>
          <div className="card spot-card" style={{ padding: "var(--space-40)", textAlign: "center", border: "1px solid var(--color-straw-gold)" }}>
            <h2 style={{ fontFamily: "var(--font-sans)", fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 400, color: "var(--color-paper)", margin: "0 0 var(--space-16)" }}>
              Know a tool we missed? <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", color: "var(--color-straw-gold)" }}>Tell us</span>
            </h2>
            <Link href="/login" className="btn btn-primary" style={{ marginTop: "var(--space-16)" }}>Contribute to Archive</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container" style={{ padding: "var(--space-40) var(--space-24)", flex: 1, width: "100%", boxSizing: "border-box" }}>
      <button onClick={() => setShowArchive(false)} style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 0",
        backgroundColor: "transparent",
        border: "none",
        color: "var(--color-soil-brown)",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        marginBottom: "var(--space-24)",
        opacity: 0.8
      }}>
        ← ត្រឡប់ទៅទំព័រដើម / Back to Welcome
      </button>

      <style>{`
        .museum-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-24);
          margin-top: var(--space-40);
        }
        @media (min-width: 768px) {
          .museum-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .museum-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (min-width: 1280px) {
          .museum-grid { grid-template-columns: repeat(4, 1fr); }
        }
      `}</style>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "var(--space-16)", marginBottom: "var(--space-40)", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 300px" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--color-soil-brown)", opacity: 0.5 }}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21L16.65 16.65" />
          </svg>
          <input
            type="search"
            placeholder="ស្វែងរកឧបករណ៍... / Search tools..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input focus-ring"
            style={{ paddingLeft: 48, background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--color-paper)" }}
          />
        </div>
        <select className="input focus-ring" style={{ width: "auto", minWidth: 160, background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--color-paper)" }}>
          <option value="">Category: All</option>
          <option value="farming">Farming</option>
          <option value="harvesting">Harvesting</option>
          <option value="household">Household</option>
        </select>
        <select className="input focus-ring" style={{ width: "auto", minWidth: 160, background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--color-paper)" }}>
          <option value="">Use: All</option>
          <option value="cutting">Cutting</option>
          <option value="digging">Digging</option>
          <option value="carrying">Carrying</option>
        </select>
        <select className="input focus-ring" style={{ width: "auto", minWidth: 160, background: "var(--input-bg)", border: "1px solid var(--border-strong)", color: "var(--color-paper)" }}>
          <option value="">Region: All</option>
          <option value="kampong-cham">Kampong Cham</option>
          <option value="siem-reap">Siem Reap</option>
          <option value="battambang">Battambang</option>
        </select>
        {user && (
          <button className="btn btn-primary" onClick={() => { setShowAddModal(true); setPhotoError(""); }}>
            ＋ Add Tool
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "var(--space-64)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
          <p style={styles.emptyTitle}>
            🌾 កំពុងទាញយកទិន្នន័យ... / Loading archive...
          </p>
        </div>
      ) : filtered.length > 0 ? (
        <SpotlightGrid className="museum-grid">
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
        </SpotlightGrid>
      ) : suggestion ? (
        <div style={{ textAlign: "center", padding: "var(--space-64)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
          <p style={styles.emptyTitle}>
            រកមិនឃើញឧបករណ៍កសិកម្មទេ / No farming tools found matching &ldquo;{trimmedQuery}&rdquo;
          </p>
          <button
            type="button"
            style={styles.suggestionBtn}
            onClick={() => setQuery(suggestion.title)}
          >
            Did you mean: {suggestion.title}?
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "var(--space-64)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
          <p style={styles.emptyTitle}>រកមិនឃើញឧបករណ៍កសិកម្មទេ។</p>
          <p style={styles.emptySubtitle}>No farming tools found.</p>
        </div>
      )}

      <p style={{ textAlign: "center", marginTop: "var(--space-40)", fontSize: 13, color: "var(--color-soil-brown)", opacity: 0.6 }}>
        {filtered.length} entries in the archive
      </p>

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
            backgroundColor: "var(--bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: "var(--input-bg)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "var(--space-40)",
              width: "100%", maxWidth: 460, boxSizing: "border-box",
              boxShadow: "var(--shadow)",
              maxHeight: "90vh", overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, color: "var(--color-paper)", fontWeight: 800 }}>បន្ថែមឧបករណ៍ថ្មី<br /><span style={{ fontSize: 15, color: "var(--color-muted)", fontWeight: 500 }}>Add New Tool</span></h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--color-muted)", padding: 0 }}>×</button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>ចំណងជើង / Tool Title *</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Enter tool name" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15 }} className="input focus-ring" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>ការពិពណ៌នា / Description *</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={4} placeholder="Describe the tool..." style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", resize: "vertical", background: "var(--surface)", fontSize: 15 }} className="input focus-ring" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>អ្នករួមចំណែក / Contributor *</label>
                <input required value={newContributor} onChange={e => setNewContributor(e.target.value)} placeholder={user?.email || "e.g. Grandfather Sok"} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15 }} className="input focus-ring" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>ទីកន្លែង / Place of Origin *</label>
                <input required value={newPlace} onChange={e => setNewPlace(e.target.value)} placeholder="e.g. Kampong Cham" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15 }} className="input focus-ring" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>រូបភាព / Photo Upload</label>
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
                }} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15 }} className="input focus-ring" />
                {photoError && <span style={{ color: "var(--accent-2)", fontSize: "13px", marginTop: "4px" }}>{photoError}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => { setShowAddModal(false); setPhotoError(""); }} disabled={isSubmitting} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", cursor: isSubmitting ? "default" : "pointer", fontWeight: 600, color: "var(--color-muted)" }}>Cancel</button>
                <button type="submit" disabled={isSubmitting || !!photoError} className="btn btn-primary" style={{ borderRadius: 10, padding: "12px 24px", opacity: (isSubmitting || !!photoError) ? 0.7 : 1, cursor: (isSubmitting || !!photoError) ? "default" : "pointer" }}>{isSubmitting ? "កំពុងផ្ទុករូបភាព... / Uploading..." : "Submit Tool"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editEntry && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "var(--bg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 20, zIndex: 1000,
          }}
          onClick={() => setEditEntry(null)}
        >
          <div
            style={{
              background: "var(--input-bg)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "var(--space-40)",
              width: "100%", maxWidth: 460, boxSizing: "border-box",
              boxShadow: "var(--shadow)",
              maxHeight: "90vh", overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h3 style={{ margin: 0, fontSize: 20, color: "var(--color-paper)", fontWeight: 800 }}>កែប្រែឧបករណ៍<br /><span style={{ fontSize: 15, color: "var(--color-muted)", fontWeight: 500 }}>Edit Tool</span></h3>
              <button onClick={() => setEditEntry(null)} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--color-muted)", padding: 0 }}>×</button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>ចំណងជើង / Tool Title *</label>
                <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Enter tool name" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15 }} className="input focus-ring" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>ការពិពណ៌នា / Description *</label>
                <textarea required value={newDesc} onChange={e => setNewDesc(e.target.value)} rows={4} placeholder="Describe the tool..." style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", resize: "vertical", background: "var(--surface)", fontSize: 15 }} className="input focus-ring" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>អ្នករួមចំណែក / Contributor *</label>
                <input required value={newContributor} onChange={e => setNewContributor(e.target.value)} placeholder={user?.email || "e.g. Grandfather Sok"} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15 }} className="input focus-ring" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>ទីកន្លែង / Place of Origin *</label>
                <input required value={newPlace} onChange={e => setNewPlace(e.target.value)} placeholder="e.g. Kampong Cham" style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15 }} className="input focus-ring" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>រូបភាព / Photo Upload (Optional)</label>
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
                }} style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15 }} className="input focus-ring" />
                {photoError && <span style={{ color: "var(--accent-2)", fontSize: "13px", marginTop: "4px" }}>{photoError}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button type="button" onClick={() => { setEditEntry(null); setPhotoError(""); }} disabled={isSubmitting} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", cursor: isSubmitting ? "default" : "pointer", fontWeight: 600, color: "var(--color-muted)" }}>Cancel</button>
                <button type="submit" disabled={isSubmitting || !!photoError} className="btn btn-primary" style={{ borderRadius: 10, padding: "12px 24px", opacity: (isSubmitting || !!photoError) ? 0.7 : 1, cursor: (isSubmitting || !!photoError) ? "default" : "pointer" }}>{isSubmitting ? "កំពុងផ្ទុករូបភាព... / Uploading..." : "Save Changes"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}






