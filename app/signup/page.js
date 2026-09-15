"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import collection from "../../collection.config.js";
import { createClient } from "../../utils/supabase/client.js";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // If Supabase returns a user session immediately, redirect to home
      if (data?.session) {
        router.push("/");
        router.refresh();
      } else {
        // If email confirmation is required
        setNotice(
          "សូមពិនិត្យមើលអ៊ីមែលរបស់អ្នកដើម្បីផ្ទៀងផ្ទាត់គណនី / Please check your email to verify your account."
        );
        setLoading(false);
      }
    } catch (err) {
      setError(err?.message || "An unexpected error occurred.");
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animated-card {
          animation: fadeSlideUp 0.6s ease-out forwards;
        }
        .auth-input:focus {
          border-color: #B87314 !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(184, 115, 20, 0.15) !important;
        }
      `}</style>
      <div style={styles.card} className="animated-card">
        <div style={styles.header}>
          <Link href="/" style={styles.backLink}>
            ← Back to Archive
          </Link>
          <div style={styles.badgeWrap}>
            <span style={styles.badge}>🌾 The Khmer Living Archive</span>
          </div>
          <p style={styles.kicker}>KHMER LIVING ARCHIVE</p>
          <h1 style={styles.title}>បង្កើតគណនី / Sign Up</h1>
          <p style={styles.archiveName}>{collection.name}</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {notice && <div style={styles.noticeBox}>{notice}</div>}

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
              className="auth-input"
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              className="auth-input"
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
            {loading ? "កំពុងដំណើរការ... / Signing Up..." : "ចុះឈ្មោះ / Sign Up"}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{" "}
            <Link href="/login" style={styles.link}>
              Log in
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
  badgeWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 16,
  },
  badge: {
    display: "inline-block",
    padding: "6px 14px",
    backgroundColor: "#FDF9F3",
    border: "1px solid #E4DDD3",
    borderRadius: 20,
    fontSize: 13,
    color: "#B87314",
    fontWeight: 700,
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
  noticeBox: {
    backgroundColor: "#FEF9EC",
    border: "1px solid #FDE047",
    color: "#854D0E",
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
