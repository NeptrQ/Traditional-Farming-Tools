"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../utils/supabase/client.js";
import EntryCard from "../../components/EntryCard.js";
import EntryModal from "../../components/EntryModal.js";
import StatusBadge from "../../components/StatusBadge.js";
import { useLanguage } from "../LanguageContext.js";

export default function MyEntriesPage() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [entries, setEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const { lang } = useLanguage();

  const [editEntry, setEditEntry] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPlace, setEditPlace] = useState("");
  const [editContributor, setEditContributor] = useState("");
  const [editPhotoFile, setEditPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkAuth() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser ?? null);
      setLoadingAuth(false);

      if (currentUser) {
        loadUserEntries(currentUser.id);
      } else {
        setLoadingEntries(false);
      }
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      setLoadingAuth(false);
      if (nextUser) {
        loadUserEntries(nextUser.id);
      } else {
        setEntries([]);
        setLoadingEntries(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function loadUserEntries(userId) {
    setLoadingEntries(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("owner", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading user entries:", error.message);
    } else if (data) {
      setEntries(data);
    }
    setLoadingEntries(false);
  }

  const handleDelete = async (entryId) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("entries")
      .delete()
      .eq("id", entryId)
      .select();

    if (error) {
      alert(`Error deleting entry: ${error.message}`);
    } else if (!data || data.length === 0) {
      console.error("Delete failed: RLS may have silently blocked it.");
      alert("That change wasn't saved");
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(null);
      }
    }
  };

  const handleEditClick = (entry) => {
    setEditEntry(entry);
    setEditTitle(entry.title || "");
    setEditDesc(entry.description || "");
    setEditPlace(entry.place || "");
    setEditContributor(entry.contributor || "");
    setEditPhotoFile(null);
    setPhotoError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user || !editEntry) return;

    setIsSubmitting(true);
    const supabase = createClient();

    let publicUrl = editEntry.photo_url;
    if (editPhotoFile) {
      const fileExt = editPhotoFile.name.split(".").pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("photos")
        .upload(filePath, editPhotoFile);

      if (uploadError) {
        alert(`Error uploading photo: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }

      const {
        data: { publicUrl: url },
      } = supabase.storage.from("photos").getPublicUrl(filePath);
      publicUrl = url;
    }

    const { data: isReviewer } = await supabase.rpc("is_reviewer");

    const updatePayload = {
      title: editTitle,
      description: editDesc,
      place: editPlace,
      contributor: editContributor,
      photo_url: publicUrl,
    };

    if (!isReviewer) {
      updatePayload.status = "pending";
    }

    const { data, error } = await supabase
      .from("entries")
      .update(updatePayload)
      .eq("id", editEntry.id)
      .select();

    setIsSubmitting(false);

    if (error) {
      alert(`Error updating entry: ${error.message}`);
    } else if (!data || data.length === 0) {
      console.error("Update failed: No data returned, possibly RLS silent refusal.");
      alert("That change wasn't saved");
    } else {
      alert("Success! Entry updated.");
      setEditEntry(null);
      setEditTitle("");
      setEditDesc("");
      setEditPlace("");
      setEditContributor("");
      setEditPhotoFile(null);
      setEntries((prev) =>
        prev.map((e) => (e.id === editEntry.id ? data[0] : e))
      );
      if (selectedEntry?.id === editEntry.id) {
        setSelectedEntry(data[0]);
      }
    }
  };

  if (loadingAuth) {
    return (
      <main className="container" style={{ padding: "var(--space-64) 1.5rem", color: "var(--color-paper)", textAlign: "center" }}>
        <p style={{ fontFamily: "var(--font-sans)" }}>Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="container page-animate" style={{ padding: "var(--space-64) 1.5rem", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", background: "var(--input-bg)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "var(--space-40)", maxWidth: 440 }}>
          <p style={{ color: "var(--color-paper)", fontSize: 16, marginBottom: "var(--space-24)", fontFamily: "var(--font-sans), var(--font-khmer)" }}>
            សូមចូលគណនីដើម្បីមើលកំណត់ត្រារបស់អ្នក<br />Please log in to view your entries.
          </p>
          <Link href="/login" className="btn btn-primary focus-ring">
            Go to Login / ចូលគណនី
          </Link>
        </div>
      </main>
    );
  }

  const filteredEntries = entries.filter((entry) => {
    if (statusFilter === "all") return true;
    return entry.status === statusFilter;
  });

  const countByStatus = {
    all: entries.length,
    pending: entries.filter((e) => e.status === "pending").length,
    published: entries.filter((e) => e.status === "published").length,
    returned: entries.filter((e) => e.status === "returned").length,
  };

  return (
    <main className="container page-animate" style={{ padding: "var(--space-40) var(--space-24)", flex: 1, width: "100%", boxSizing: "border-box" }}>
      <style>{`
        .museum-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--space-24);
          margin-top: var(--space-32);
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

      {/* Header section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-16)", marginBottom: "var(--space-32)" }}>
        <div>
          <h1 className="khmer-title" style={{ color: "var(--color-straw-gold)", fontSize: "clamp(28px, 4vw, 40px)", margin: "0 0 6px" }}>
            {lang === "KH" ? "កំណត់ត្រារបស់ខ្ញុំ" : "My Entries"}
          </h1>
          <p style={{ color: "var(--color-muted)", fontSize: 15, margin: 0, fontFamily: "var(--font-sans)" }}>
            {user.email} &bull; {entries.length} {entries.length === 1 ? "entry" : "entries"} total
          </p>
        </div>
        <Link href="/contribute" className="btn btn-primary focus-ring" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <span>＋</span> {lang === "KH" ? "បន្ថែមឧបករណ៍ថ្មី" : "Add New Tool"}
        </Link>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "var(--space-24)" }}>
        <button
          onClick={() => setStatusFilter("all")}
          className="focus-ring"
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: "1px solid",
            borderColor: statusFilter === "all" ? "var(--accent)" : "var(--border)",
            background: statusFilter === "all" ? "var(--accent)" : "var(--surface)",
            color: statusFilter === "all" ? "var(--accent-contrast)" : "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}
        >
          {lang === "KH" ? "ទាំងអស់" : "All"} ({countByStatus.all})
        </button>
        <button
          onClick={() => setStatusFilter("pending")}
          className="focus-ring"
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: "1px solid",
            borderColor: statusFilter === "pending" ? "var(--accent)" : "var(--border)",
            background: statusFilter === "pending" ? "rgba(232, 176, 74, 0.2)" : "var(--surface)",
            color: statusFilter === "pending" ? "var(--accent)" : "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-sans), var(--font-khmer)",
          }}
        >
          {lang === "KH" ? "កំពុងរង់ចាំ" : "Pending"} ({countByStatus.pending})
        </button>
        <button
          onClick={() => setStatusFilter("published")}
          className="focus-ring"
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: "1px solid",
            borderColor: statusFilter === "published" ? "#22c55e" : "var(--border)",
            background: statusFilter === "published" ? "rgba(34, 197, 94, 0.2)" : "var(--surface)",
            color: statusFilter === "published" ? "#22c55e" : "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-sans), var(--font-khmer)",
          }}
        >
          {lang === "KH" ? "បានបោះពុម្ព" : "Published"} ({countByStatus.published})
        </button>
        <button
          onClick={() => setStatusFilter("returned")}
          className="focus-ring"
          style={{
            padding: "8px 16px",
            borderRadius: 20,
            border: "1px solid",
            borderColor: statusFilter === "returned" ? "var(--accent-2)" : "var(--border)",
            background: statusFilter === "returned" ? "rgba(200, 85, 61, 0.2)" : "var(--surface)",
            color: statusFilter === "returned" ? "var(--accent-2)" : "var(--text)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font-sans), var(--font-khmer)",
          }}
        >
          {lang === "KH" ? "បានប្រគល់ជូនវិញ" : "Returned"} ({countByStatus.returned})
        </button>
      </div>

      {loadingEntries ? (
        <div style={{ textAlign: "center", padding: "var(--space-64)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
          <p style={{ margin: 0, fontSize: 16, color: "var(--color-muted)", fontFamily: "var(--font-sans), var(--font-khmer)" }}>
            🌾 កំពុងទាញយកកំណត់ត្រា... / Loading your entries...
          </p>
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="museum-grid">
          {filteredEntries.map((entry, index) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              index={index}
              showStatus={true}
              onSelect={setSelectedEntry}
              currentUser={user}
              onDelete={handleDelete}
              onEdit={handleEditClick}
            />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: "var(--space-64) var(--space-24)", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🌾</div>
          <p style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 600, color: "var(--color-paper)", fontFamily: "var(--font-sans), var(--font-khmer)" }}>
            {statusFilter === "all"
              ? "មិនទាន់មានកំណត់ត្រានៅឡើយទេ / No entries yet"
              : `រកមិនឃើញកំណត់ត្រាក្នុងស្ថានភាព "${statusFilter}" ទេ`}
          </p>
          <p style={{ margin: "0 0 var(--space-24)", fontSize: 14, color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>
            {statusFilter === "all"
              ? "Contribute your first traditional farming tool to the archive."
              : "No tools match this status filter."}
          </p>
          {statusFilter === "all" && (
            <Link href="/contribute" className="btn btn-primary focus-ring">
              {lang === "KH" ? "បន្ថែមឧបករណ៍ដំបូងរបស់អ្នក" : "Add Your First Tool"}
            </Link>
          )}
        </div>
      )}

      {/* Entry Detail Modal */}
      <EntryModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        currentUser={user}
        onDelete={handleDelete}
        onEdit={handleEditClick}
      />

      {/* Edit Entry Modal */}
      {editEntry && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "var(--bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 1000,
          }}
          onClick={() => setEditEntry(null)}
        >
          <div
            style={{
              background: "var(--input-bg)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-40)",
              width: "100%",
              maxWidth: 460,
              boxSizing: "border-box",
              boxShadow: "var(--shadow)",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 20, color: "var(--color-paper)", fontWeight: 800 }}>
                  កែប្រែឧបករណ៍<br />
                  <span style={{ fontSize: 15, color: "var(--color-muted)", fontWeight: 500 }}>Edit Tool</span>
                </h3>
              </div>
              <button
                onClick={() => setEditEntry(null)}
                style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--color-muted)", padding: 0 }}
              >
                ×
              </button>
            </div>

            {editEntry.status && (
              <div style={{ marginBottom: 16 }}>
                <StatusBadge status={editEntry.status} />
              </div>
            )}

            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>
                  ចំណងជើង / Tool Title *
                </label>
                <input
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter tool name"
                  style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15, color: "var(--color-paper)" }}
                  className="input focus-ring"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>
                  ការពិពណ៌នា / Description *
                </label>
                <textarea
                  required
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={4}
                  placeholder="Describe the tool..."
                  style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", resize: "vertical", background: "var(--surface)", fontSize: 15, color: "var(--color-paper)" }}
                  className="input focus-ring"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>
                  អ្នករួមចំណែក / Contributor *
                </label>
                <input
                  required
                  value={editContributor}
                  onChange={(e) => setEditContributor(e.target.value)}
                  placeholder={user?.email || "e.g. Grandfather Sok"}
                  style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15, color: "var(--color-paper)" }}
                  className="input focus-ring"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>
                  ទីកន្លែង / Place of Origin *
                </label>
                <input
                  required
                  value={editPlace}
                  onChange={(e) => setEditPlace(e.target.value)}
                  placeholder="e.g. Kampong Cham"
                  style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15, color: "var(--color-paper)" }}
                  className="input focus-ring"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: "var(--color-paper)" }}>
                  រូបភាព / Photo Upload (Optional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) {
                      setEditPhotoFile(null);
                      return;
                    }
                    const MAX_SIZE = 5 * 1024 * 1024;
                    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
                    if (!ALLOWED_TYPES.includes(file.type)) {
                      e.target.value = "";
                      setEditPhotoFile(null);
                      setPhotoError("រូបភាពត្រូវតែជា JPEG, PNG ឬ WebP / Please upload a JPG, PNG, or WebP image.");
                      return;
                    }
                    if (file.size > MAX_SIZE) {
                      e.target.value = "";
                      setEditPhotoFile(null);
                      setPhotoError("ទំហំរូបភាពត្រូវតែតូចជាង 5 MB / Image size must be under 5 MB.");
                      return;
                    }
                    setEditPhotoFile(file);
                    setPhotoError("");
                  }}
                  style={{ padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)", outline: "none", background: "var(--surface)", fontSize: 15, color: "var(--color-paper)" }}
                  className="input focus-ring"
                />
                {photoError && <span style={{ color: "var(--accent-2)", fontSize: "13px", marginTop: "4px" }}>{photoError}</span>}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
                <button
                  type="button"
                  onClick={() => {
                    setEditEntry(null);
                    setPhotoError("");
                  }}
                  disabled={isSubmitting}
                  style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border)", background: "transparent", cursor: isSubmitting ? "default" : "pointer", fontWeight: 600, color: "var(--color-muted)" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !!photoError}
                  className="btn btn-primary"
                  style={{ borderRadius: 10, padding: "12px 24px", opacity: isSubmitting || !!photoError ? 0.7 : 1, cursor: isSubmitting || !!photoError ? "default" : "pointer" }}
                >
                  {isSubmitting ? "កំពុងផ្ទុករូបភាព... / Uploading..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
