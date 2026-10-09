export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container">
        <p style={styles.text}>
          Built for ICT 340, American University of Phnom Penh. The Khmer Living
          Archive.
        </p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    borderTop: "1px solid var(--color-glass-border)",
    padding: "var(--space-40) 0",
    textAlign: "center",
    backgroundColor: "var(--surface)",
    marginTop: "auto",
  },
  text: {
    color: "var(--color-muted)",
    fontSize: "14px",
    margin: 0,
  },
};

