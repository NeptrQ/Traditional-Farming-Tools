// EntryModal displays full details of a selected tool in an interactive popup.
"use client";

import { useEffect } from "react";

const styles = {
  backdrop: { position: "fixed", inset: 0, backgroundColor: "rgba(30, 24, 18, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 1000, boxSizing: "border-box" },
  modal: { backgroundColor: "#FFFFFF", borderRadius: 20, border: "1px solid #E8E2D8", boxShadow: "0 20px 48px rgba(0, 0, 0, 0.18)", maxWidth: 580, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: "28px 24px", position: "relative", boxSizing: "border-box", display: "flex", flexDirection: "column" },
  closeBtn: { position: "absolute", top: 16, right: 16, background: "#F4EFEA", border: "1px solid #E4DDD3", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer", color: "#5C5248" },
  title: { fontSize: 24, fontWeight: 800, color: "#2D241E", margin: "0 0 16px", paddingRight: 40 },
  desc: { fontSize: 16, lineHeight: 1.8, color: "#4A3F35", whiteSpace: "pre-line", margin: "0 0 24px" },
  footer: { display: "flex", flexDirection: "column", gap: 10, paddingTop: 18, borderTop: "1px solid #F0EAE1" },
  badge: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 12, backgroundColor: "#FAF7F2", border: "1px solid #E8E2D8", fontSize: 13, color: "#2D241E" },
};

export default function EntryModal({ entry, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!entry) return null;

  return (
    <div style={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close details">✕</button>
        <h2 style={styles.title}>{entry.title}</h2>
        <p style={styles.desc}>{entry.description}</p>
        {(entry.contributor || entry.place) && (
          <div style={styles.footer}>
            {entry.contributor && <div style={styles.badge}><span>👤</span><span>{entry.contributor}</span></div>}
            {entry.place && <div style={styles.badge}><span>📍</span><span>{entry.place}</span></div>}
          </div>
        )}
      </div>
    </div>
  );
}
