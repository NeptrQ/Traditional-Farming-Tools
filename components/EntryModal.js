"use client";

import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge.js";

export default function EntryModal({ entry, onClose, currentUser, onDelete, onEdit }) {
  const [imgError, setImgError] = useState(false);
  
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!entry) return null;

  const isOwner = currentUser && entry.owner === currentUser.id;

  const handleDeleteClick = () => {
    if (window.confirm("Are you sure you want to delete this farming tool?")) {
      onDelete?.(entry.id);
    }
  };

  return (
    <div className="page-animate" style={{ position: "fixed", inset: 0, backgroundColor: "var(--bg)", zIndex: 1000, overflowY: "auto", display: "flex", flexDirection: "column" }} role="dialog" aria-modal="true">
      <div className="container" style={{ width: "100%", padding: "var(--space-40) 1.5rem", flex: 1, display: "flex", flexDirection: "column" }}>
        
        <div style={{ marginBottom: "var(--space-40)" }}>
          <button onClick={onClose} className="focus-ring" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "none", border: "none", color: "var(--color-muted)", fontSize: 15, cursor: "pointer", padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Archive
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap-reverse", gap: "var(--space-64)", alignItems: "flex-start" }}>
          
          <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", gap: "var(--space-24)" }}>
            <div>
              {entry.status && (
                <div style={{ marginBottom: "var(--space-16)" }}>
                  <StatusBadge status={entry.status} />
                </div>
              )}
              <h2 className="khmer-title" style={{ color: "var(--color-straw-gold)", fontSize: "clamp(32px, 5vw, 48px)", margin: "0 0 8px" }}>{entry.title}</h2>
              <h3 style={{ fontFamily: "var(--font-sans)", fontSize: "20px", color: "var(--color-muted)", margin: 0, fontWeight: 400 }}>{entry.english_name || "Traditional Tool"}</h3>
            </div>
            
            <div style={{ maxWidth: "70ch" }}>
              <p style={{ fontSize: "16px", lineHeight: 1.6, color: "var(--color-paper)", whiteSpace: "pre-wrap", margin: "0 0 var(--space-24)", fontFamily: "var(--font-sans), var(--font-khmer)" }}>{entry.description}</p>
              
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: "var(--space-24)" }}>
                {entry.contributor && <span style={{ padding: "8px 12px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--color-muted)", fontSize: 14 }}>👤 {entry.contributor}</span>}
                {entry.place && <span style={{ padding: "8px 12px", borderRadius: "8px", background: "var(--input-bg)", border: "1px solid var(--border)", color: "var(--color-muted)", fontSize: 14 }}>📍 {entry.place}</span>}
              </div>
            </div>

            {isOwner && (
              <div style={{ display: "flex", gap: 12, marginTop: "var(--space-24)" }}>
                <button onClick={() => { onClose(); onEdit?.(entry); }} className="btn btn-secondary focus-ring">Edit Tool</button>
                <button onClick={handleDeleteClick} className="btn focus-ring" style={{ background: "var(--surface-soft)", color: "var(--accent-2)", border: "1px solid var(--border)" }}>Delete</button>
              </div>
            )}
          </div>

          <div style={{ flex: "1 1 400px", width: "100%" }}>
            <div style={{ width: "100%", backgroundColor: "var(--surface-soft)", borderRadius: "var(--radius-md)", border: "1px solid var(--surface-soft)", overflow: "hidden" }}>
              {entry.photo_url && !imgError ? (
                <img src={entry.photo_url} alt={entry.title} onError={() => setImgError(true)} style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                      <pattern id="pat-modal" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M0 20L20 0ZM20 20L0 0" stroke="var(--color-straw-gold)" strokeWidth="1" fill="none" opacity="0.1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#pat-modal)" />
                  </svg>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

