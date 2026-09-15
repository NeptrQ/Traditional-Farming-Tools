"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import collection from "../../collection.config.js";
import { createClient } from "../../utils/supabase/client.js";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Prevent user enumeration by displaying strictly a generic message
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Invalid email or password");
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <Link href="/" style={styles.backLink}>
            ← Back to Archive
          </Link>
          <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
          <h1 style={styles.title}>ចូលគណនី / Log In</h1>
          <p style={styles.archiveName}>{collection.name}</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label} htmlFor="email">
              អ៊ីមែល / Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@domain.com"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label} htmlFor="password">
              ពាក្យសម្ងាត់ / Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "កំពុងចូល... / Logging In..." : "ចូលគណនី / Log In"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={styles.link}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    backgroundColor: "#FAF7F2",
    boxSizing: "border-box",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#FFFFFF",
    border: "1px solid #E8E2D8",
    borderRadius: 16,
    padding: "36px 28px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
    boxSizing: "border-box",
  },
  header: {
    marginBottom: 24,
    textAlign: "center",
  },
  backLink: {
    display: "inline-block",
    fontSize: 13,
    color: "#8C7E72",
    textDecoration: "none",
    marginBottom: 16,
    fontWeight: 500,
  },
  kicker: {
    fontFamily: "'Courier New', monospace",
    color: "#B87314",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: 700,
    margin: "0 0 6px",
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "#2D241E",
    margin: "0 0 4px",
  },
  archiveName: {
    fontSize: 14,
    color: "#5C5248",
    margin: 0,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    textAlign: "left",
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#2D241E",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    fontSize: 15,
    backgroundColor: "#FAF7F2",
    border: "1px solid #E8E2D8",
    borderRadius: 10,
    color: "#2D241E",
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "13px",
    backgroundColor: "#B87314",
    color: "#FFFFFF",
    border: "none",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    marginTop: 4,
    transition: "background-color 0.2s",
  },
  errorBox: {
    backgroundColor: "#FEF2F2",
    border: "1px solid #FCA5A5",
    color: "#991B1B",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    marginBottom: 18,
    lineHeight: 1.4,
  },
  footer: {
    marginTop: 24,
    textAlign: "center",
  },
  footerText: {
    fontSize: 14,
    color: "#5C5248",
    margin: 0,
  },
  link: {
    color: "#B87314",
    fontWeight: 600,
    textDecoration: "none",
  },
};
