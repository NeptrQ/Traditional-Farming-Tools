// EntryCard displays an archive item: title, description, and metadata.
export default function EntryCard({ entry, index, onSelect, currentUser, onDelete, onEdit }) {
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

      {entry.photo_url ? (
        <div style={{ width: "100%", height: 180, backgroundColor: "#F9F8F5", borderTopLeftRadius: 4, borderTopRightRadius: 4, overflow: "hidden" }}>
          <img 
            src={entry.photo_url} 
            alt={entry.title || "Archive item"} 
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
          />
        </div>
      ) : (
        <div style={{ width: "100%", height: 180, backgroundColor: "#F9F8F5", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid #E5E2DC", borderTopLeftRadius: 4, borderTopRightRadius: 4 }}>
          <span style={{ fontSize: 64, opacity: 0.1 }}>🌾</span>
        </div>
      )}
      
      <div style={{ padding: 28, display: "flex", flexDirection: "column", height: "100%", boxSizing: "border-box" }}>
        {typeof index === 'number' && (
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "#8C827A", marginBottom: 8, letterSpacing: 1 }}>
            ITEM #{String(index + 1).padStart(2, '0')}
          </div>
        )}
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
                <span>{entry.contributor}</span>
              </div>
            )}
            {entry.place && (
              <div className="entry-pill">
                <span>{entry.place}</span>
              </div>
            )}
          </footer>
        )}
        
        <div className="entry-view-hint">
          <span>View Catalog Entry</span>
        </div>
      </div>
    </article>
  );
}