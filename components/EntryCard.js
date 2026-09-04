// EntryCard shows one archive entry: title, description, contributor, place.

// Same Latin stack as the site body, followed by Khmer-capable fonts before
// the generic fallback. Font matching is per glyph: Latin text resolves in
// the same fonts as before, while Khmer glyphs pick a real Khmer typeface
// instead of whatever the operating system happens to guess. The Khmer
// names come after the Latin ones on purpose - Noto Sans Khmer also
// contains basic Latin, so listing it first would change English rendering.
const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, " +
  "'Noto Sans Khmer', 'Leelawadee UI', 'Khmer UI', sans-serif";

const styles = {
  card: {
    marginTop: 24,
    padding: 24,
    backgroundColor: "#1C222C",
    border: "1px solid #2E3644",
    borderRadius: 10,
    // Set once here so every text element in the card inherits it. The
    // CONTRIBUTOR/PLACE labels declare their own monospace font, which
    // overrides inheritance, so they are unaffected.
    fontFamily: fontFamily,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    margin: "0 0 8px",
  },
  description: {
    // Tall line height so Khmer script's stacked glyphs are not clipped,
    // and break-word so long text wraps instead of stretching the layout.
    fontSize: 16,
    lineHeight: 1.7,
    color: "#C6CEDA",
    overflowWrap: "break-word",
    whiteSpace: "pre-line",
    margin: "0 0 16px",
  },
  emptyDescription: {
    fontSize: 16,
    fontStyle: "italic",
    color: "#5A6373",
    margin: "0 0 16px",
  },
  label: {
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    color: "#97A1B3",
    margin: 0,
  },
  value: {
    fontSize: 15,
    margin: "4px 0 12px",
  },
};

export default function EntryCard({ entry }) {
  // Without this guard, a missing entry would crash on the first field below.
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
        <footer>
          {/* Each field renders only when it has content, so a label
              never sits above a blank value. */}
          {entry.contributor && (
            <>
              <p style={styles.label}>CONTRIBUTOR</p>
              <p style={styles.value}>{entry.contributor}</p>
            </>
          )}
          {entry.place && (
            <>
              <p style={styles.label}>PLACE</p>
              <p style={{ ...styles.value, marginBottom: 0 }}>{entry.place}</p>
            </>
          )}
        </footer>
      )}
    </article>
  );
}