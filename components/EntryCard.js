// EntryCard displays an archive item: title, description, and metadata.
const styles = {
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E2D8",
    borderRadius: 16,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    padding: 28,
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    overflowWrap: "break-word",
    wordBreak: "break-word",
    cursor: "pointer",
    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease",
  },
  title: { fontSize: 20, fontWeight: 700, color: "#2D241E", margin: "0 0 10px" },
  desc: { fontSize: 15, lineHeight: 1.8, color: "#5C5248", whiteSpace: "pre-line", margin: "0 0 24px", flexGrow: 1 },
  emptyDesc: { fontSize: 15, fontStyle: "italic", color: "#8C827A", margin: "0 0 16px" },
  footer: { display: "flex", flexWrap: "wrap", gap: 8, marginTop: "auto", paddingTop: 16, borderTop: "1px solid #F0EAE1" },
  pill: { display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, backgroundColor: "#F7F3EE", border: "1px solid #E4DDD3", fontSize: 12, color: "#5C5248" },
  pillIcon: { fontSize: 13 },
  viewHint: { fontSize: 12, color: "#B87314", fontWeight: 700, marginTop: 16, display: "flex", alignItems: "center", gap: 4 },
};

export default function EntryCard({ entry, onSelect, isActive }) {
  if (!entry) {
    return (
      <article style={styles.card} className="entry-card swipe-card">
        <p style={styles.emptyDesc}>Entry information unavailable.</p>
      </article>
    );
  }

  const activeStyles = isActive
    ? {
        boxShadow: "0 12px 30px rgba(184, 115, 20, 0.1)",
        transform: "scale(1.02)",
        borderColor: "#D8CFC4",
        zIndex: 1,
      }
    : {};

  return (
    <article
      style={{ ...styles.card, ...activeStyles }}
      className="entry-card swipe-card"
      onClick={() => onSelect?.(entry)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onSelect?.(entry)}
    >
      <h2 style={styles.title}>{entry.title || "Untitled Entry"}</h2>
      {entry.description ? (
        <p style={styles.desc}>{entry.description}</p>
      ) : (
        <p style={styles.emptyDesc}>Description coming soon.</p>
      )}
      {(entry.contributor || entry.place) && (
        <footer style={styles.footer}>
          {entry.contributor && (
            <div style={styles.pill}>
              <span style={styles.pillIcon}>👤</span>
              <span>{entry.contributor}</span>
            </div>
          )}
          {entry.place && (
            <div style={styles.pill}>
              <span style={styles.pillIcon}>📍</span>
              <span>{entry.place}</span>
            </div>
          )}
        </footer>
      )}
      <div style={styles.viewHint}>
        <span>មើលលម្អិត / View Details</span>
        <span>→</span>
      </div>
    </article>
  );
}