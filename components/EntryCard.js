import { useState } from 'react';

// EntryCard displays an archive item: title, description, and metadata.
export default function EntryCard({ entry, index, onSelect, currentUser, onDelete, onEdit }) {
  const [imgError, setImgError] = useState(false);
  if (!entry) {
    return (
      <article className="entry-card">
        <p className="entry-empty-desc">Entry information unavailable.</p>
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

  return (
    <article
      className="entry-card"
      onClick={() => onSelect?.(entry)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(entry)}
      style={{ padding: 0, overflow: "hidden", position: "relative" }}
    >
      {isOwner && (
        <div style={{
          position: "absolute", top: 12, right: 12, zIndex: 10,
          display: "flex", gap: 8
        }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit?.(entry); }}
            style={{
              backgroundColor: "rgba(255,255,255,0.9)", border: "1px solid #E5E2DC",
              borderRadius: 4, padding: "6px 12px", fontSize: 13,
              color: "#44403C", fontWeight: 600, cursor: "pointer",
            }}
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            style={{
              backgroundColor: "rgba(255,255,255,0.9)", border: "1px solid #E5E2DC",
              borderRadius: 4, padding: "6px 12px", fontSize: 13,
              color: "#D32F2F", fontWeight: 600, cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      )}

      {entry.photo_url && !imgError ? (
        <div style={{ width: "100%", height: 280, backgroundColor: "#F4F1EA", overflow: "hidden", borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottom: "1px solid #E5E2DC", boxSizing: "border-box" }}>
          <img 
            className="entry-image"
            src={entry.photo_url} 
            alt={entry.title || "Archive item"}
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s ease" }} 
          />
        </div>
      ) : (
        <div style={{ width: "100%", height: 280, backgroundColor: "#F4F1EA", overflow: "hidden", borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottom: "1px solid #E5E2DC", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <span style={{ fontSize: 32, opacity: 0.6 }}>🌾</span>
          <span style={{ color: "#8C827A", fontStyle: "italic", fontSize: 14, fontWeight: 500 }}>រូបថតកំពុងរៀបចំ / Photograph Being Documented</span>
        </div>
      )}
      
      <div style={{ padding: 24, display: "flex", flexDirection: "column", boxSizing: "border-box" }}>
        {typeof index === 'number' && (
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "#8C827A", marginBottom: 8, letterSpacing: 1 }}>
            CATALOG #{String(index + 1).padStart(2, '0')}
          </div>
        )}
        <h2 className="entry-title" style={{ marginBottom: 16 }}>{entry.title || "Untitled Entry"}</h2>
        
        <div style={{ fontSize: 13, color: "#B87314", fontWeight: 700, display: "flex", alignItems: "center", gap: 4, marginTop: "auto" }}>
          <span>មើលព័ត៌មានលម្អិត / View Details</span>
          <span style={{ fontSize: 14 }}>→</span>
        </div>
      </div>
    </article>
  );
}