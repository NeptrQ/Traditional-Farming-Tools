"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../../utils/supabase/client.js";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [featured, setFeatured] = useState(null);

  useEffect(() => {
    async function fetchFeatured() {
      const supabase = createClient();
      const { data } = await supabase.from('archive_entries').select('*').not('photo_url', 'is', null).limit(1);
      if (data && data.length > 0) setFeatured(data[0]);
    }
    fetchFeatured();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      setMessage("Registration successful. You can now log in.");
      setLoading(false);
    } catch {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  return (
    <main className="container" style={{ flex: 1, display: "flex", flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: "var(--space-64)", padding: "var(--space-64) 1.5rem" }}>
      <div className="page-animate" style={{ flex: "1 1 400px", display: "flex", flexDirection: "column" }}>
        <h1 className="khmer-title" style={{ fontFamily: "var(--font-khmer-title)", fontSize: "clamp(32px, 5vw, 48px)", color: "var(--color-paper)", margin: "0 0 8px" }}>
          បង្កើតគណនី
        </h1>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--color-muted)", margin: "0 0 var(--space-40)", fontWeight: 400 }}>
          Join the Archive
        </h2>

        <div className="page-animate" style={{ background: "var(--input-bg)", border: "1px solid var(--border-strong)", borderRadius: "var(--radius-md)", padding: "var(--space-40)", animationDelay: "80ms" }}>
          {error && <div style={{ backgroundColor: "var(--surface-soft)", border: "1px solid var(--color-ember-clay)", color: "var(--color-paper)", borderRadius: "var(--radius-md)", padding: "12px 16px", fontSize: 14, marginBottom: "var(--space-24)" }}>{error}</div>}
          {message && <div style={{ backgroundColor: "var(--border)", border: "1px solid var(--border-strong)", color: "var(--color-paper)", borderRadius: "var(--radius-md)", padding: "12px 16px", fontSize: 14, marginBottom: "var(--space-24)" }}>{message}</div>}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-24)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label htmlFor="email" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>Email</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@domain.com" className="input focus-ring" style={{ height: 48, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--color-paper)" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label htmlFor="password" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>Password (Min 6 chars)</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input focus-ring" style={{ height: 48, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--color-paper)" }} />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary focus-ring" style={{ width: "100%", height: 48, marginTop: 8, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div style={{ marginTop: "var(--space-24)", textAlign: "center", fontSize: 14, color: "var(--color-muted)", fontFamily: "var(--font-sans)" }}>
            Already have an account? <Link href="/login" className="focus-ring" style={{ color: "var(--color-straw-gold)", textDecoration: "none", fontWeight: 500 }}>Log in</Link>
          </div>
        </div>
      </div>

      <div className="page-animate" style={{ flex: "1 1 400px", display: "flex", justifyContent: "center", animationDelay: "160ms" }}>
        <div className="card spot-card" style={{ width: "100%", maxWidth: "400px", padding: "var(--space-24)", display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "var(--surface-soft)", border: "1px solid var(--surface-soft)" }}>
          <div style={{ width: "100%", aspectRatio: "4/3", backgroundColor: "var(--input-bg)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
            {featured && featured.photo_url ? (
              <img src={featured.photo_url} alt={featured.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <pattern id="pat-signup" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M0 20L20 0ZM20 20L0 0" stroke="var(--color-straw-gold)" strokeWidth="1" fill="none" opacity="0.3"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#pat-signup)" />
              </svg>
            )}
          </div>
          <div>
            <div style={{ fontSize: "14px", fontFamily: "var(--font-mono)", color: "var(--color-muted)", marginBottom: "4px" }}>FEATURED</div>
            <h3 className="khmer-title" style={{ color: "var(--color-straw-gold)", fontSize: "24px", margin: "0 0 8px" }}>
              {featured ? featured.title : "នង្គ័ល / Nongkol"}
            </h3>
            <p style={{ color: "var(--color-muted)", fontSize: "15px", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {featured ? featured.description : "The traditional ox-drawn plow. Pulled by a pair of oxen, the wooden plough turns the hard earth into soft furrows ready for the rains."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

