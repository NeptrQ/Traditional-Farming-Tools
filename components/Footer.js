export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(40, 28, 18, 0.08)",
        padding: "48px 24px 36px 24px",
        backgroundColor: "#FFFFFF",
        marginTop: "auto",
        position: "relative",
        overflow: "hidden"
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <strong style={{ fontSize: "15px", color: "#191614", display: "block", marginBottom: "4px" }}>
            The Khmer Living Archive
          </strong>
          <p style={{ margin: 0, fontSize: "13px", color: "#6B635B", maxWidth: "440px" }}>
            An oral history collection preserving traditional farming implements from Kampong Cham Province before mechanization. Built for ICT 340 · American University of Phnom Penh.
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#EA580C", textTransform: "uppercase", letterSpacing: "1.5px", display: "block" }}>
            CURATORIAL STEWARD
          </span>
          <span style={{ fontSize: "13px", color: "#191614", fontWeight: 600 }}>
            Srorn Vanuth · Japanese Pathway
          </span>
        </div>
      </div>
    </footer>
  );
}
