import collection from "../collection.config.js";
import EntryCard from "../components/EntryCard.js";

// Real entries, collected from elders and farmers in Kampong Cham Province.
const entries = [
  {
    title: "នឹម",
    description:
      "ឧបករណ៍ធ្វើពីឈើ ដែលប្រើសម្រាប់ភ្ជាប់សត្វពីរក្បាល ដើម្បីឱ្យវាអាចធ្វើការជាមួយគ្នា និងអូសវត្ថុផ្សេងៗ។",
    contributor: "My grandfather and grandmother",
    place: "Kampong Cham Province, Cambodia",
  },
  {
    title: "កណ្តៀវ",
    description:
      "ឧបករណ៍កសិកម្មបុរាណដែលមានដង និងផ្លែកោង ប្រើសម្រាប់ច្រូតស្រូវ និងកាត់ស្មៅ។",
    contributor: "My grandfather and grandmother",
    place: "Kampong Cham Province, Cambodia",
  },
];

const styles = {
  wrap: {
    maxWidth: 720,
    margin: "0 auto",
    padding: "80px 24px",
  },
  kicker: {
    fontFamily: "'Courier New', monospace",
    color: "#2EE6A8",
    fontSize: 14,
    letterSpacing: 1,
  },
  title: {
    fontSize: 48,
    fontWeight: 700,
    margin: "16px 0 12px",
    lineHeight: 1.1,
  },
  description: {
    fontSize: 18,
    color: "#97A1B3",
    lineHeight: 1.6,
    margin: 0,
  },
  card: {
    marginTop: 48,
    padding: 24,
    backgroundColor: "#1C222C",
    border: "1px solid #2E3644",
    borderRadius: 10,
  },
  cardLabel: {
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    color: "#97A1B3",
    margin: 0,
  },
  cardValue: {
    fontSize: 16,
    margin: "6px 0 0",
  },
  count: {
    fontFamily: "'Courier New', monospace",
    fontSize: 14,
    color: "#2EE6A8",
    marginTop: 48,
  },
  footer: {
    marginTop: 64,
    paddingTop: 24,
    borderTop: "1px solid #2E3644",
    fontSize: 13,
    color: "#5A6373",
  },
};

export default function Home() {
  return (
    <main style={styles.wrap}>
      <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
      <h1 style={styles.title}>{collection.name}</h1>
      <p style={styles.description}>{collection.description}</p>

      <div style={styles.card}>
        <p style={styles.cardLabel}>CURATED BY</p>
        <p style={styles.cardValue}>{collection.curator}</p>
      </div>
      <div style={styles.card}>
        <p style={styles.cardLabel}>SOURCE</p>
        <p style={styles.cardValue}>{collection.source}</p>
      </div>

      {entries.map((entry) => (
        <EntryCard key={entry.title} entry={entry} />
      ))}

      <p style={styles.count}>entries in the archive: {entries.length}</p>

      <footer style={styles.footer}>
        Built in ICT 340 — Vibe Coding, American University of Phnom Penh, Fall
        2026. This archive is under construction all semester. Come back in
        December.
      </footer>
    </main>
  );
}
