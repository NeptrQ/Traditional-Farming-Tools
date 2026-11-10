"use client";

import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge.js";
import { resolveToolPhoto } from "../utils/toolImages.js";

export default function EntryModal({ entry, onClose, currentUser, onDelete, onEdit }) {
  const [imgError, setImgError] = useState(false);
  const photoUrl = resolveToolPhoto(entry);
  
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
    <div
      className="page-animate"
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(25, 22, 20, 0.65)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        zIndex: 1000,
        overflowY: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px 16px"
      }}
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          maxWidth: "920px",
          width: "100%",
          backgroundColor: "#FFFFFF",
          borderRadius: "28px",
          border: "1px solid rgba(40, 28, 18, 0.12)",
          boxShadow: "0 30px 70px -15px rgba(0, 0, 0, 0.35)",
          padding: "36px 32px",
          position: "relative",
          boxSizing: "border-box",
          color: "#191614"
        }}
      >
        
        {/* Top Bar: Back Button & Close */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", borderBottom: "1px solid rgba(40, 28, 18, 0.08)", paddingBottom: "16px" }}>
          <button
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "none",
              border: "none",
              color: "#6B635B",
              fontSize: "14px",
              fontWeight: 500,
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "8px",
              transition: "color 0.2s"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EA580C")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6B635B")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Archive
          </button>

          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              backgroundColor: "#F7F4EE",
              border: "1px solid rgba(40, 28, 18, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#191614"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Main Body Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "36px", alignItems: "start" }}>
          
          {/* Left Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              {entry.status && (
                <div style={{ marginBottom: "12px" }}>
                  <StatusBadge status={entry.status} />
                </div>
              )}
              <h2 style={{ fontFamily: "var(--font-khmer-title), Georgia, serif", fontSize: "32px", color: "#191614", margin: "0 0 4px 0", lineHeight: 1.25, fontWeight: 700 }}>
                {entry.title}
              </h2>
              <h3 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: "18px", color: "#B45309", margin: 0, fontStyle: "italic", fontWeight: 400 }}>
                {entry.english_name || "Traditional Implement"}
              </h3>
            </div>
            
            <p style={{ fontSize: "14.5px", lineHeight: 1.65, color: "#44403C", margin: 0, whiteSpace: "pre-wrap" }}>
              {entry.description || "No oral testimony or description recorded yet."}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "10px" }}>
              {entry.category && (
                <span style={{ padding: "6px 12px", borderRadius: "9999px", backgroundColor: "rgba(234, 88, 12, 0.08)", border: "1px solid rgba(234, 88, 12, 0.2)", color: "#C2410C", fontSize: "12px", fontFamily: "monospace" }}>
                  Category: {entry.category}
                </span>
              )}
              {entry.place && (
                <span style={{ padding: "6px 12px", borderRadius: "9999px", backgroundColor: "#F7F4EE", border: "1px solid rgba(40, 28, 18, 0.12)", color: "#57534E", fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Location: {entry.place}
                </span>
              )}
              {entry.contributor && (
                <span style={{ padding: "6px 12px", borderRadius: "9999px", backgroundColor: "#F7F4EE", border: "1px solid rgba(40, 28, 18, 0.12)", color: "#57534E", fontSize: "12px" }}>
                  Contributor: {entry.contributor}
                </span>
              )}
            </div>

            {isOwner && (
              <div style={{ display: "flex", gap: "12px", marginTop: "18px", borderTop: "1px solid rgba(40, 28, 18, 0.08)", paddingTop: "18px" }}>
                <button
                  onClick={() => { onClose(); onEdit?.(entry); }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "9999px",
                    backgroundColor: "#191614",
                    color: "#FFFFFF",
                    border: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Edit Tool
                </button>
                <button
                  onClick={handleDeleteClick}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "9999px",
                    backgroundColor: "#FEF2F2",
                    color: "#DC2626",
                    border: "1px solid #FCA5A5",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          {/* Right Visual Image */}
          <div style={{ width: "100%" }}>
            <div style={{ width: "100%", height: "340px", backgroundColor: "#F4EFEB", borderRadius: "20px", border: "1px solid rgba(40, 28, 18, 0.1)", overflow: "hidden", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {photoUrl && !imgError ? (
                <img
                  src={photoUrl}
                  alt={entry.title}
                  onError={() => setImgError(true)}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              ) : (
                <div style={{ textAlign: "center", padding: "24px" }}>
                  <svg width="64" height="64" viewBox="0 0 100 80" fill="none" stroke="#EA580C" strokeWidth="2.5">
                    <path d="M 15,62 Q 42,62 62,35 L 86,16" strokeLinecap="round" strokeWidth="3.5" stroke="#F59E0B" />
                    <path d="M 52,42 L 36,68 L 68,68 Z" fill="rgba(234, 88, 12, 0.2)" />
                  </svg>
                  <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#8C827A", marginTop: "8px", letterSpacing: "1px" }}>
                    DOCUMENTED ORAL ARTIFACT
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
