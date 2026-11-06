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
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("entries")
          .select("*")
          .eq("status", "published")
          .not("photo_url", "is", null)
          .limit(1);
        if (data && data.length > 0) {
          setFeatured(data[0]);
        }
      } catch (err) {
        console.error("Error fetching featured artifact:", err);
      }
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

      setMessage("Registration successful! You can now sign in.");
      setLoading(false);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "calc(100vh - 80px)",
        backgroundColor: "#0C0A09",
        color: "#E7E3DF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background Ambient Glow */}
      <div
        style={{
          position: "fixed",
          top: "10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "450px",
          background: "radial-gradient(ellipse at center, rgba(234, 88, 12, 0.15) 0%, transparent 70%)",
          filter: "blur(90px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          display: "flex",
          flexWrap: "wrap",
          gap: "40px",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Left: Signup Form Card */}
        <div
          style={{
            flex: "1 1 380px",
            maxWidth: "460px",
            backgroundColor: "#16120F",
            border: "1px solid rgba(82, 54, 42, 0.8)",
            borderRadius: "24px",
            padding: "36px 32px",
            boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.7), 0 0 24px rgba(234, 88, 12, 0.08)",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor: "#241610",
                border: "1px solid #4D2D20",
                color: "#F59E0B",
                fontSize: "11px",
                fontFamily: "monospace",
                letterSpacing: "1px",
                marginBottom: "12px",
              }}
            >
              COMMUNITY REGISTRATION
            </span>
            <h1
              style={{
                margin: "0 0 6px 0",
                fontSize: "28px",
                fontWeight: 600,
                color: "#FFFFFF",
                fontFamily: "var(--font-serif), Georgia, serif",
              }}
            >
              បង្កើតគណនី / Join
            </h1>
            <p style={{ margin: 0, fontSize: "13px", color: "#A8A29E" }}>
              Register as a contributor to preserve Kampong Cham&apos;s agricultural heritage.
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: "rgba(220, 38, 38, 0.12)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#FCA5A5",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                backgroundColor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                color: "#6EE7B7",
                borderRadius: "12px",
                padding: "12px 16px",
                fontSize: "13px",
                marginBottom: "20px",
              }}
            >
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#D6D3D1",
                  fontFamily: "monospace",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contributor@aupp.edu.kh"
                style={{
                  width: "100%",
                  height: "46px",
                  backgroundColor: "#0D0A08",
                  border: "1px solid #3A241C",
                  borderRadius: "12px",
                  padding: "0 14px",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#D6D3D1",
                  fontFamily: "monospace",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Password (Min 6 Characters)
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  height: "46px",
                  backgroundColor: "#0D0A08",
                  border: "1px solid #3A241C",
                  borderRadius: "12px",
                  padding: "0 14px",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "48px",
                marginTop: "10px",
                borderRadius: "12px",
                backgroundColor: "#EA580C",
                backgroundImage: "linear-gradient(to right, #EA580C, #C2410C)",
                border: "none",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 12px 24px -8px rgba(234, 88, 12, 0.4)",
                transition: "opacity 0.2s ease, transform 0.2s ease",
              }}
            >
              {loading ? "Registering..." : "Create Contributor Account"}
            </button>
          </form>

          <div
            style={{
              marginTop: "24px",
              paddingTop: "18px",
              borderTop: "1px solid #281D17",
              textAlign: "center",
              fontSize: "13px",
              color: "#A8A29E",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/login"
              style={{
                color: "#F59E0B",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Log in here &rarr;
            </Link>
          </div>
        </div>

        {/* Right: Archival Information Card */}
        <div
          style={{
            flex: "1 1 360px",
            maxWidth: "420px",
            backgroundColor: "#14100D",
            border: "1px solid rgba(75, 48, 36, 0.7)",
            borderRadius: "24px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "220px",
              backgroundColor: "#0A0807",
              borderRadius: "16px",
              border: "1px solid #2A1D16",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {featured && featured.photo_url ? (
              <img
                src={featured.photo_url}
                alt={featured.title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <svg
                  style={{ width: "64px", height: "64px", color: "rgba(234, 88, 12, 0.75)" }}
                  viewBox="0 0 100 80"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M 15,65 Q 40,65 60,35 L 85,15" strokeLinecap="round" />
                  <path d="M 50,45 L 35,70 L 65,70 Z" fill="rgba(234, 88, 12, 0.22)" />
                </svg>
                <span style={{ fontSize: "11px", color: "#A8A29E", fontFamily: "monospace", marginTop: "8px" }}>
                  KAMPONG CHAM ORAL HERITAGE
                </span>
              </div>
            )}
            <span
              style={{
                position: "absolute",
                top: "10px",
                left: "10px",
                padding: "2px 8px",
                borderRadius: "6px",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                fontSize: "10px",
                fontFamily: "monospace",
                color: "#F59E0B",
              }}
            >
              COMMUNITY STEWARDSHIP
            </span>
          </div>

          <div>
            <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#EA580C", marginBottom: "4px" }}>
              WHY WE PRESERVE
            </div>
            <h3
              style={{
                fontSize: "20px",
                color: "#FFFFFF",
                margin: "0 0 8px 0",
                fontFamily: "var(--font-serif), Georgia, serif",
              }}
            >
              {featured ? featured.title : "Oral Knowledge from Grandparents"}
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#A8A29E",
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              As combine harvesters and walking tractors take over the fields of Kampong Cham, the names and making techniques of ironwood implements are disappearing. Contributors help document oral memories directly from elders.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
