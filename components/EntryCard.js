// EntryCard shows one archive entry: title, description, contributor, place.

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, " +
  "'Noto Sans Khmer', 'Leelawadee UI', 'Khmer UI', sans-serif";

const styles = {
  card: {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E2D8",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    fontFamily: fontFamily,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "#2D241E",
    margin: "0 0 10px",
  },
  description: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#5C5248",
    overflowWrap: "break-word",
    whiteSpace: "pre-line",
    margin: "0 0 16px",
    flexGrow: 1,
  },
  emptyDescription: {
    fontSize: 15,
    fontStyle: "italic",
    color: "#8C827A",
    margin: "0 0 16px",
  },
  footer: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: "auto",
    paddingTop: 16,
    borderTop: "1px solid #F0EAE1",
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    borderRadius: 16,
    backgroundColor: "#F4EFEA",
    border: "1px solid #E4DDD3",
    fontSize: 12,
    color: "#5C5248",
  },
  pillLabel: {
    fontFamily: "'Courier New', monospace",
    fontSize: 11,
    color: "#B87314",
    fontWeight: 700,
    margin: 0,
  },
};

export default function EntryCard({ entry }) {
  if (!entry) {
    return (
      <article style={styles.card}>
        <p style={styles.emptyDescription}>Entry information unavailable.</p>
      </article>
    );
  }

  return (
    <article style={styles.card}>
      <h2 style={styles.title}>{entry.title}</h2>
      {entry.description ? (
        <p style={styles.description}>{entry.description}</p>
      ) : (
        <p style={styles.emptyDescription}>Description coming soon.</p>
      )}
      {(entry.contributor || entry.place) && (
        <footer style={styles.footer}>
          {entry.contributor && (
            <div style={styles.pill}>
              <span style={styles.pillLabel}>BY</span>
              <span>{entry.contributor}</span>
            </div>
          )}
          {entry.place && (
            <div style={styles.pill}>
              <span style={styles.pillLabel}>LOC</span>
              <span>{entry.place}</span>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}