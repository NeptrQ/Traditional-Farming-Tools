"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client.js";

const FALLBACK_SPECIMEN = {
  title: "នង្គ័លបុរាណ (Traditional Kokir Ox Plough)",
  place: "Kampong Siem · ដីក្រហម Kampong Cham",
  description:
    "Carved from aged Kokir ironwood and tipped with spring steel to slice deep into sticky red basalt earth along the Mekong floodplains before motorized tractors arrived.",
  photo_url: "/images/traditional_plough.jpg",
};

const CURATORIAL_TABS = [
  {
    id: "craft",
    label: "01 Craft",
    heading: "Hand-Angled Kokir Ironwood",
    detail:
      "Village carpenters tilted the beam 38 degrees so twin draft cattle could break hardened basalt clay without snapping the neck joint.",
  },
  {
    id: "memory",
    label: "02 Memory",
    heading: "Recorded from Kampong Cham Elders",
    detail:
      "Every catalog entry pairs Khmer tool vocabulary with its seasonal monsoon role, keeping generational farm knowledge alive.",
  },
  {
    id: "gate",
    label: "03 Review Gate",
    heading: "Protected by Community Moderation",
    detail:
      "New submissions enter the archive queue as pending entries first so volunteer archivists can verify provenance before publishing.",
  },
];

function isCleanSpecimen(item) {
  if (!item || !item.title) return false;
  const title = item.title.trim().toLowerCase();
  if (title.length <= 2 || title === "feet" || title === "test" || title === "j") {
    return false;
  }
  const contributor = (item.contributor || "").toLowerCase();
  if (contributor.includes("@")) return false;
  const url = (item.photo_url || "").toLowerCase();
  if (
    !url ||
    url.includes("wikipedia") ||
    url.includes("1791271294393") ||
    url.includes("1791271336475")
  ) {
    return false;
  }
  return true;
}

export default function AuthExperience({
  initialMode = "login",
  embeddedInContribute = false,
  onAuthSuccess,
}) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [featured, setFeatured] = useState(FALLBACK_SPECIMEN);
  const [activeTab, setActiveTab] = useState("craft");

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("entries")
          .select("id, title, place, description, contributor, photo_url, status")
          .eq("status", "published")
          .not("photo_url", "is", null)
          .limit(12);

        const valid = (data || []).filter(isCleanSpecimen);
        if (valid.length > 0) {
          setFeatured(valid[0]);
        }
      } catch {
        // Fallback specimen remains active
      }
    }
    fetchFeatured();
  }, []);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === "login") {
        const { data: signInData, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (signInError) {
          setError("អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ / Invalid email or password.");
          setLoading(false);
          return;
        }

        if (embeddedInContribute && onAuthSuccess) {
          onAuthSuccess(signInData?.user || null);
          router.refresh();
          return;
        }

        let targetPath = "/";
        if (typeof window !== "undefined") {
          const nextParam = new URLSearchParams(window.location.search).get("next");
          if (nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")) {
            targetPath = nextParam;
          }
        }
        router.push(targetPath);
        router.refresh();
      } else {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        // If instant session was granted, unlock right away
        if (signUpData?.session) {
          if (embeddedInContribute && onAuthSuccess) {
            onAuthSuccess(signUpData.user);
            router.refresh();
            return;
          }
          router.push("/");
          router.refresh();
          return;
        }

        setMessage(
          "បង្កើតគណនីបានជោគជ័យ! សូមចូលគណនីខាងក្រោម / Account registered! Sign in below to continue."
        );
        setMode("login");
        setLoading(false);
      }
    } catch {
      setError("មានបញ្ហាបច្ចេកទេស សូមព្យាយាមម្តងទៀត / Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const currentTab = CURATORIAL_TABS.find((t) => t.id === activeTab) || CURATORIAL_TABS[0];

  return (
    <section
      style={{
        minHeight: "calc(100vh - 90px)",
        backgroundColor: "#F7F4EE",
        color: "#191614",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "36px 20px 64px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Monumental Editorial Watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -52%)",
          fontSize: "clamp(72px, 16vw, 200px)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: "rgba(40, 28, 18, 0.035)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          userSelect: "none",
          zIndex: 0,
          textTransform: "uppercase",
          fontFamily: "var(--font-sans), sans-serif",
        }}
      >
        {embeddedInContribute ? "CONTRIBUTE" : "LIVING ARCHIVE"}
      </div>

      {/* Warm Ambient Sunlight Glow */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "680px",
          height: "360px",
          background:
            "radial-gradient(ellipse at center, rgba(234, 88, 12, 0.11) 0%, rgba(245, 158, 11, 0.06) 45%, transparent 75%)",
          filter: "blur(64px)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Contextual Editorial Intro Strip when arriving via + Contribute Tool */}
      {embeddedInContribute && (
        <div
          style={{
            maxWidth: "1020px",
            width: "100%",
            marginBottom: "22px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            padding: "14px 22px",
            borderRadius: "20px",
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(40, 28, 18, 0.1)",
            boxShadow: "0 10px 28px -8px rgba(40, 28, 18, 0.07)",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F97316, #EA580C)",
                color: "#FFFFFF",
                fontSize: "12px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "monospace",
                flexShrink: 0,
              }}
            >
              01
            </span>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#191614" }}>
                Step 1 of 2 — Contributor Identity
              </div>
              <div style={{ fontSize: "12px", color: "#6B635B" }}>
                Sign in or create an account below to unlock the tool submission studio right on this page.
              </div>
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "6px 14px",
              borderRadius: "9999px",
              backgroundColor: "#FAF8F5",
              border: "1px solid #E8DFD4",
              fontSize: "11px",
              fontFamily: "monospace",
              color: "#78716C",
            }}
          >
            <span style={{ color: "#EA580C", fontWeight: 700 }}>NEXT:</span>
            <span>02 Document Tool &amp; Photo</span>
          </div>
        </div>
      )}

      {/* Unified Architectural Split Stage */}
      <div className="editorial-auth-stage">
        {/* LEFT PANEL: Obsidian Curatorial Showcase */}
        <div
          style={{
            background: "linear-gradient(160deg, #1E1815 0%, #120F0D 100%)",
            color: "#F5EBE1",
            padding: "32px 30px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative corner warm glow */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "240px",
              height: "240px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(234, 88, 12, 0.22) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Archival Pill Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "5px 12px",
                borderRadius: "9999px",
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(245, 158, 11, 0.28)",
                color: "#FBBF24",
                fontSize: "10.5px",
                fontFamily: "monospace",
                letterSpacing: "1px",
                marginBottom: "18px",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#EA580C" }} />
              <span>KAMPONG CHAM ARCHIVAL SPECIMEN</span>
            </div>

            {/* Framed Specimen Photograph */}
            <div
              style={{
                width: "100%",
                height: "220px",
                borderRadius: "20px",
                overflow: "hidden",
                position: "relative",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                backgroundColor: "#0E0B09",
                marginBottom: "18px",
              }}
            >
              <img
                src={featured.photo_url || "/images/traditional_plough.jpg"}
                alt={featured.title}
                onError={(e) => {
                  e.currentTarget.src = "/images/traditional_plough.jpg";
                }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(17, 14, 12, 0.88) 0%, rgba(17, 14, 12, 0.1) 55%, transparent 100%)",
                }}
              />
              <div style={{ position: "absolute", bottom: "14px", left: "16px", right: "16px" }}>
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "monospace",
                    color: "#F59E0B",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "3px",
                  }}
                >
                  {featured.place || "Kampong Siem · Kampong Cham"}
                </div>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 600,
                    color: "#FFFFFF",
                    fontFamily: "var(--font-khmer-title), var(--font-serif), Georgia, serif",
                    lineHeight: 1.35,
                  }}
                >
                  {featured.title}
                </div>
              </div>
            </div>

            {/* Interactive 3-Tab Curatorial Switcher */}
            <div
              style={{
                display: "flex",
                gap: "6px",
                padding: "4px",
                borderRadius: "14px",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                marginBottom: "14px",
              }}
            >
              {CURATORIAL_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      flex: 1,
                      padding: "7px 10px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: isActive ? "#EA580C" : "transparent",
                      color: isActive ? "#FFFFFF" : "#BDB4AA",
                      fontSize: "11px",
                      fontFamily: "monospace",
                      fontWeight: isActive ? 700 : 500,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div style={{ minHeight: "74px" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#FFFFFF",
                  marginBottom: "4px",
                }}
              >
                {currentTab.heading}
              </div>
              <p style={{ margin: 0, fontSize: "12.5px", color: "#B8AEA4", lineHeight: 1.6 }}>
                {currentTab.detail}
              </p>
            </div>
          </div>

          {/* Bottom Provenance Footer Strip */}
          <div
            style={{
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              paddingTop: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
              fontSize: "11px",
              fontFamily: "monospace",
              color: "#9A9086",
              position: "relative",
              zIndex: 1,
            }}
          >
            <span>ICT 340 LIVING ARCHIVE</span>
            <span style={{ color: "#F59E0B" }}>KH / EN BILINGUAL</span>
          </div>
        </div>

        {/* RIGHT PANEL: Daylight Editorial Auth Form */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            padding: "36px 36px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            {/* Mode Switcher Segmented Control */}
            <div
              style={{
                display: "inline-flex",
                padding: "4px",
                borderRadius: "9999px",
                backgroundColor: "#F5F0E8",
                border: "1px solid rgba(40, 28, 18, 0.08)",
                marginBottom: "24px",
              }}
            >
              <button
                type="button"
                onClick={() => switchMode("login")}
                style={{
                  padding: "7px 18px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: mode === "login" ? "#191614" : "transparent",
                  color: mode === "login" ? "#FFFFFF" : "#6B635B",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode("signup")}
                style={{
                  padding: "7px 18px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: mode === "signup" ? "#191614" : "transparent",
                  color: mode === "signup" ? "#FFFFFF" : "#6B635B",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Create Account
              </button>
            </div>

            {/* Editorial Headline */}
            <div style={{ marginBottom: "24px" }}>
              <h1
                style={{
                  margin: "0 0 6px 0",
                  fontSize: "clamp(26px, 3vw, 34px)",
                  fontWeight: 400,
                  color: "#191614",
                  fontFamily: "var(--font-khmer-title), var(--font-serif), Georgia, serif",
                  lineHeight: 1.2,
                }}
              >
                {mode === "login" ? "ចូលគណនី" : "បង្កើតគណនី"}
                <span
                  style={{
                    display: "block",
                    fontFamily: "var(--font-serif), Georgia, serif",
                    fontStyle: "italic",
                    color: "#EA580C",
                    fontSize: "24px",
                    marginTop: "2px",
                  }}
                >
                  {embeddedInContribute
                    ? mode === "login"
                      ? "Sign in to contribute an implement"
                      : "Join as an archive contributor"
                    : mode === "login"
                      ? "Welcome back to the archive"
                      : "Preserve Kampong Cham heritage"}
                </span>
              </h1>
              <p style={{ margin: 0, fontSize: "13.5px", color: "#6B635B", lineHeight: 1.55 }}>
                {mode === "login"
                  ? "Enter your contributor credentials to submit tools, track review status, or edit returned entries."
                  : "Register with an email and password (6+ characters) to share ancestral implements from your elders."}
              </p>
            </div>

            {error && (
              <div
                style={{
                  backgroundColor: "#FEF2F2",
                  border: "1px solid #FECACA",
                  color: "#B91C1C",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div
                style={{
                  backgroundColor: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  color: "#065F46",
                  borderRadius: "14px",
                  padding: "12px 14px",
                  fontSize: "13px",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {/* Email Input */}
              <div>
                <label
                  htmlFor="auth-email"
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#57534E",
                    fontFamily: "monospace",
                    marginBottom: "7px",
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                  }}
                >
                  Email Address / អ៊ីមែល
                </label>
                <div style={{ position: "relative" }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8B8177"
                    strokeWidth="2"
                    style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 6L2 7" />
                  </svg>
                  <input
                    id="auth-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contributor@aupp.edu.kh"
                    className="editorial-input"
                    style={{ paddingLeft: "42px", paddingRight: "14px" }}
                  />
                </div>
              </div>

              {/* Password Input with Show/Hide Toggle */}
              <div>
                <label
                  htmlFor="auth-password"
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#57534E",
                    fontFamily: "monospace",
                    marginBottom: "7px",
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                  }}
                >
                  {mode === "signup" ? "Password (Min 6 Characters) / ពាក្យសម្ងាត់" : "Password / ពាក្យសម្ងាត់"}
                </label>
                <div style={{ position: "relative" }}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8B8177"
                    strokeWidth="2"
                    style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={mode === "signup" ? 6 : undefined}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="editorial-input"
                    style={{ paddingLeft: "42px", paddingRight: "44px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "#78716C",
                      cursor: "pointer",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: "48px",
                  marginTop: "6px",
                  borderRadius: "9999px",
                  background: "linear-gradient(135deg, #FB923C 0%, #EA580C 52%, #C2410C 100%)",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  boxShadow: "0 12px 24px -8px rgba(234, 88, 12, 0.45)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {loading
                  ? mode === "login"
                    ? "កំពុងផ្ទៀងផ្ទាត់... / Signing in..."
                    : "កំពុងបង្កើតគណនី... / Creating account..."
                  : embeddedInContribute
                    ? mode === "login"
                      ? "Sign In & Open Contribution Studio →"
                      : "Create Account & Continue →"
                    : mode === "login"
                      ? "Sign In to Archive →"
                      : "Create Contributor Account →"}
              </button>
            </form>
          </div>

          <div
            style={{
              paddingTop: "16px",
              borderTop: "1px solid #F0EAE1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              fontSize: "12.5px",
              color: "#78716C",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#6B635B",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              &larr; Browse public archive
            </Link>
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#A8A29E" }}>
              RLS PROTECTED PORTAL
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
