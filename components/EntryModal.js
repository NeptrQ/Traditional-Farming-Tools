// EntryModal displays full details of a selected tool in an interactive popup.
"use client";

import { useEffect } from "react";

const styles = {
  backdrop: { position: "fixed", inset: 0, backgroundColor: "rgba(30, 24, 18, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000, boxSizing: "border-box" },
  modal: { backgroundColor: "#FFFFFF", borderRadius: 20, border: "1px solid #E8E2D8", boxShadow: "0 20px 48px rgba(0, 0, 0, 0.18)", maxWidth: 580, width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxSizing: "border-box", display: "flex", flexDirection: "column" },
  closeBtn: { position: "absolute", top: 16, right: 16, background: "#F4EFEA", border: "1px solid #E4DDD3", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", color: "#5C5248", zIndex: 10 },
  contentWrapper: { padding: "28px 24px" },
  title: { fontSize: 24, fontWeight: 800, color: "#2D241E", margin: "0 0 16px", paddingRight: 40 },
  desc: { fontSize: 16, lineHeight: 1.8, color: "#4A3F35", whiteSpace: "pre-line", margin: "0 0 24px" },
  footer: { display: "flex", flexWrap: "wrap", gap: 10, paddingTop: 18, borderTop: "1px solid #F0EAE1", justifyContent: "space-between", alignItems: "center" },
  badgeWrap: { display: "flex", flexWrap: "wrap", gap: 10 },
  badge: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 12, backgroundColor: "#FAF7F2", border: "1px solid #E8E2D8", fontSize: 13, color: "#2D241E" },
  imageContainer: { width: "100%", backgroundColor: "#F7F3EE", borderBottom: "1px solid #E8E2D8" },
  image: { width: "100%", height: "auto", maxHeight: 300, objectFit: "cover", display: "block", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  deleteBtn: { padding: "8px 14px", borderRadius: 12, backgroundColor: "transparent", border: "1px solid #E8E2D8", fontSize: 13, color: "#D32F2F", fontWeight: 700, cursor: "pointer" }
};

export default function EntryModal({ entry, onClose, currentUser, onDelete }) {
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
    <div style={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close details">✕</button>
        
        {entry.photo_url && (
          <div style={styles.imageContainer}>
            <img src={entry.photo_url} alt={entry.title} style={styles.image} />
          </div>
        )}
        
        <div style={styles.contentWrapper}>
          <h2 style={styles.title}>{entry.title}</h2>
          <p style={styles.desc}>{entry.description}</p>
          <div style={styles.footer}>
            <div style={styles.badgeWrap}>
              {entry.contributor && <div style={styles.badge}><span>👤</span><span>{entry.contributor}</span></div>}
              {entry.place && <div style={styles.badge}><span>📍</span><span>{entry.place}</span></div>}
            </div>
            {isOwner && (
              <button style={styles.deleteBtn} onClick={handleDeleteClick}>
                🗑️ លុប / Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
