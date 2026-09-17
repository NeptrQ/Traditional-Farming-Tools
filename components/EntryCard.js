// EntryCard displays an archive item: title, description, and metadata.
export default function EntryCard({ entry, onSelect }) {
  if (!entry) {
    return (
      <article className="entry-card">
        <p className="entry-empty-desc">Entry information unavailable.</p>
      </article>
    );
  }

  return (
    <article
      className="entry-card"
      onClick={() => onSelect?.(entry)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(entry)}
    >
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
    </article>
  );
}