// EntryCard displays an archive item: title, description, and metadata.
export default function EntryCard({ entry, onSelect, currentUser, onDelete }) {
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
        <button
          onClick={handleDeleteClick}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            backgroundColor: "rgba(255,255,255,0.9)", border: "1px solid #E8E2D8",
            borderRadius: 8, padding: "6px 12px", fontSize: 13,
            color: "#D32F2F", fontWeight: 700, cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          🗑️ លុប / Delete
        </button>
      )}

      {entry.photo_url ? (
        <div style={{ width: "100%", height: 180, backgroundColor: "#F7F3EE", borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: "hidden" }}>
          <img 
            src={entry.photo_url} 
            alt={entry.title || "Archive item"} 
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
          />
        </div>
      ) : (
        <div style={{ width: "100%", height: 180, backgroundColor: "#FDF9F3", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #E8E2D8", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <span style={{ fontSize: 64, opacity: 0.5 }}>🌾</span>
        </div>
      )}
      
      <div style={{ padding: 28, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
        <h2 className="entry-title">{entry.title || "Untitled Entry"}</h2>
        
        {entry.description ? (
          <p className="entry-desc">{entry.description}</p>
        ) : (
          <p className="entry-empty-desc">Description coming soon.</p>
        )}
        
        {(entry.contributor || entry.place) && (
          <footer className="entry-footer">
            {entry.contributor && (
              <div className="entry-pill">
                <span>👤</span>
                <span>{entry.contributor}</span>
              </div>
            )}
            {entry.place && (
              <div className="entry-pill">
                <span>📍</span>
                <span>{entry.place}</span>
              </div>
            )}
          </footer>
        )}
        
        <div className="entry-view-hint">
          <span>ស្វែងយល់បន្ថែម / View Full Story</span>
          <span>→</span>
        </div>
      </div>
    </article>
  );
}