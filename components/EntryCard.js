import { useState } from 'react';

export default function EntryCard({ entry, index, onSelect, currentUser, onDelete, onEdit }) {
  const [imgError, setImgError] = useState(false);
  if (!entry) {
    return (
      <article className="card spot-card" style={{ padding: 24 }}>
        <p style={{ fontStyle: "italic", color: "var(--color-muted)" }}>Entry information unavailable.</p>
      </article>
    );
  }

  const isOwner = currentUser && entry.owner === currentUser.id;

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this farming tool?")) {
      onDelete?.(entry.id);
    }
  };

  // Generate a distinct pattern based on the index
  const patternIndex = (index || 0) % 3;
  const geometricPatterns = [
    <svg key="p1" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <pattern id={`pat1-${index}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M0 20L20 0ZM20 20L0 0" stroke="var(--color-straw-gold)" strokeWidth="1" fill="none" opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#pat1-${index})`} />
    </svg>,
    <svg key="p2" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <pattern id={`pat2-${index}`} x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="2" fill="var(--color-straw-gold)" opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#pat2-${index})`} />
    </svg>,
    <svg key="p3" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <pattern id={`pat3-${index}`} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 8H16M8 0V16" stroke="var(--color-straw-gold)" strokeWidth="1" fill="none" opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#pat3-${index})`} />
    </svg>
  ];

  return (
    <article
      className="card spot-card focus-ring"
      onClick={() => onSelect?.(entry)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(entry)}
      style={{ padding: 0, overflow: "hidden", position: "relative", cursor: "pointer", display: "flex", flexDirection: "column" }}
    >
      {isOwner && (
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 10,
          display: "flex", gap: 8
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(entry); }}
            className="focus-ring"
            style={{
              backgroundColor: "var(--surface)", border: "1px solid var(--border-strong)",
              borderRadius: 4, padding: "6px 12px", fontSize: 13,
              color: "var(--color-paper)", fontWeight: 600, cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="focus-ring"
            style={{
              backgroundColor: "var(--surface)", border: "1px solid var(--border-strong)",
              borderRadius: 4, padding: "6px 12px", fontSize: 13,
              color: "var(--accent-2)", fontWeight: 600, cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      )}

      {entry.photo_url && !imgError ? (
        <div style={{ width: "100%", height: 240, backgroundColor: "var(--input-bg)", overflow: "hidden", borderBottom: "1px solid var(--border)", boxSizing: "border-box" }}>
          <img 
            className="entry-image"
            src={entry.photo_url} 
            alt={entry.title || "Archive item"}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
          />
        </div>
      ) : (
        <div style={{ width: "100%", height: 240, backgroundColor: "var(--surface-soft)", overflow: "hidden", borderBottom: "1px solid var(--border)", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {geometricPatterns[patternIndex]}
        </div>
      )}
      
      <div style={{ padding: "var(--space-24)", display: "flex", flexDirection: "column", flexGrow: 1, boxSizing: "border-box" }}>
        <h2 className="khmer-title" style={{ fontSize: 22, color: "var(--color-straw-gold)", margin: "0 0 4px" }}>
          {entry.title || "Untitled Entry"}
        </h2>
        <h3 style={{ fontFamily: "var(--font-sans)", fontSize: 14, color: "var(--color-muted)", margin: "0 0 12px", fontWeight: 500 }}>
          {entry.english_name || entry.title || "Traditional Tool"}
        </h3>
        
        <p style={{ fontSize: 15, color: "var(--color-paper)", margin: 0, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {entry.description || "No description provided."}
        </p>
      </div>
    </article>
  );
}
