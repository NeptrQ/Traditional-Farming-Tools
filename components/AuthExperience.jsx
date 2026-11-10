"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/supabase/client.js";
import { isJunkEntry, resolveToolPhoto } from "../utils/toolImages.js";

const CURATED_SPECIMENS = [
  {
    id: "plough",
    title: "នង្គ័លបុរាណ",
    place: "Kampong Siem, Kampong Cham",
    photo_url: "/images/traditional_plough.jpg",
  },
  {
    id: "sickle",
    title: "កណ្ដៀវច្រូតស្រូវ",
    place: "Kang Meas, Kampong Cham",
    photo_url: "/images/harvest_sickle.jpg",
  },
  {
    id: "cart",
    title: "រទេះគោបុរាណ",
    place: "Chamkar Leu, Kampong Cham",
    photo_url: "/images/traditional_ox_cart.jpg",
  },
];

const SIGNUP_STEPS = [
  {
    num: "01",
    title: "Create a Free Contributor Account",
    detail: "Register once with your email to save drafts and upload specimen photos.",
  },
  {
    num: "02",
    title: "Document Elder Knowledge",
    detail: "Pair Khmer tool titles with rural provenance and seasonal oral history.",
  },
  {
    num: "03",
    title: "Pass Curatorial Review",
    detail: "Submissions enter Pending Review so archivists verify clarity before publishing.",
  },
];

export default function AuthExperience({
  initialMode = "login",
  onAuthSuccess,
}) {
  const router = useRouter();
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [specimens, setSpecimens] = useState(CURATED_SPECIMENS);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("entries")
          .select("id, title, place, contributor, photo_url, status")
          .eq("status", "published")
          .limit(12);

        const clean = (data || []).filter((item) => !isJunkEntry(item)).slice(0, 3);
        if (clean.length > 0) {
          setSpecimens(
            clean.map((item, idx) => ({
              id: item.id || String(idx),
              title: item.title,
              place: item.place || "Kampong Cham, Cambodia",
              photo_url:
                resolveToolPhoto(item) ||
                CURATED_SPECIMENS[idx % CURATED_SPECIMENS.length].photo_url,
            }))
          );
        }
      } catch {
        // Fallback specimens stay active
      }
    }
    fetchFeatured();
  }, []);

  function switchMode(nextMode) {
    setMode(nextMode);
    setError(null);
    setMessage(null);
    setConfirmPassword("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (mode === "signup" && password !== confirmPassword) {
      setError("ពាក្យសម្ងាត់ទាំងពីរមិនដូចគ្នាទេ / Passwords do not match.");
      return;
    }

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

        if (onAuthSuccess) {
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

        if (signUpData?.session) {
          if (onAuthSuccess) {
            onAuthSuccess(signUpData.user);
            router.refresh();
            return;
          }
          router.push("/");
          router.refresh();
          return;
        }

        setMessage(
          "បង្កើតគណនីបានជោគជ័យ! សូមប្រើ Log In ខាងក្រោម / Account registered! Log in below to continue."
        );
        setMode("login");
        setConfirmPassword("");
        setLoading(false);
      }
    } catch {
      setError("មានបញ្ហាបច្ចេកទេស សូមព្យាយាមម្តងទៀត / Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const isSignup = mode === "signup";
  const currentSpecimen = specimens[activeSlide] || CURATED_SPECIMENS[0];

  return (
    <section
      style={{
        minHeight: "calc(100vh - 88px)",
        backgroundColor: "#F7F4EE",
        color: "#191614",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "36px 24px 72px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Editorial Top Watermark */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "28px",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: "clamp(64px, 13vw, 170px)",
          fontWeight: 900,
          letterSpacing: "-0.05em",
          color: "rgba(40, 28, 18, 0.03)",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          userSelect: "none",
          zIndex: 0,
          textTransform: "uppercase",
          fontFamily: "var(--font-sans), sans-serif",
        }}
      >
        {isSignup ? "JOIN ARCHIVE" : "KAMPONG CHAM"}
      </div>

      {/* Main 2-Column Editorial Grid */}
      <div className="editorial-auth-layout">
        {/* LEFT COLUMN: Visually changes cleanly between Log In showcase vs Sign Up onboarding */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "5px 14px",
              borderRadius: "9999px",
              backgroundColor: isSignup ? "#191614" : "#FFFFFF",
              border: isSignup ? "1px solid #3D2B22" : "1px solid rgba(40, 28, 18, 0.11)",
              color: isSignup ? "#F59E0B" : "#C2410C",
              fontSize: "10.5px",
              fontFamily: "monospace",
              letterSpacing: "1px",
              marginBottom: "18px",
              boxShadow: "0 4px 12px rgba(40, 28, 18, 0.04)",
            }}
          >
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#EA580C" }} />
            <span>
              {isSignup ? "COMMUNITY SIGN UP · OPEN ACCESS" : "STEWARD LOG IN PORTAL"}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "clamp(36px, 4.4vw, 54px)",
              fontWeight: 400,
              color: "#191614",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              margin: "0 0 10px 0",
            }}
          >
            {isSignup ? (
              <>
                Become a keeper of{" "}
                <span style={{ color: "#EA580C", fontStyle: "italic" }}>Khmer memory</span>.
              </>
            ) : (
              <>
                Step back into the{" "}
                <span style={{ color: "#EA580C", fontStyle: "italic" }}>Living Archive</span>.
              </>
            )}
          </h1>

          <p
            style={{
              color: "#B45309",
              fontStyle: "italic",
              fontSize: "17px",
              lineHeight: 1.5,
              margin: "0 0 10px 0",
              fontFamily: "var(--font-khmer-title), Georgia, serif",
            }}
          >
            « រំលឹកដង្ហើមស្រែដូនតា និងកេរ្តិ៍ដំណែលឧបករណ៍កសិកម្មបុរាណ »
          </p>

          <p style={{ color: "#6B635B", fontSize: "14px", lineHeight: 1.6, margin: 0, maxWidth: "460px" }}>
            {isSignup
              ? "Help document hand-forged sickles, ironwood ploughs, and village memories across Kampong Cham before modern machines replace them."
              : "Log in with your contributor credentials to manage tool records, check moderation status, or revise returned items."}
          </p>

          {isSignup ? (
            /* Sign Up Mode Left Visual: 3 Clear Community Steps */
            <div style={{ width: "100%", maxWidth: "460px", marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {SIGNUP_STEPS.map((step) => (
                <div
                  key={step.num}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid rgba(40, 28, 18, 0.09)",
                    borderRadius: "18px",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "14px",
                    boxShadow: "0 8px 24px -10px rgba(40, 28, 18, 0.08)",
                  }}
                >
                  <span
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "10px",
                      backgroundColor: "#FFF7ED",
                      border: "1px solid #FED7AA",
                      color: "#EA580C",
                      fontFamily: "monospace",
                      fontSize: "12px",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {step.num}
                  </span>
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#191614" }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: "12px", color: "#6B635B", lineHeight: 1.5, marginTop: "2px" }}>
                      {step.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Log In Mode Left Visual: Tilted Archival Specimen Stack */
            <div className="specimen-stack" style={{ width: "100%" }}>
              <div className="specimen-backplate" aria-hidden="true" />
              <div className="specimen-card-tilt">
                <div
                  style={{
                    width: "100%",
                    height: "210px",
                    borderRadius: "16px",
                    overflow: "hidden",
                    backgroundColor: "#EFE7DA",
                    position: "relative",
                    marginBottom: "12px",
                  }}
                >
                  <img
                    src={currentSpecimen.photo_url}
                    alt={currentSpecimen.title}
                    onError={(e) => {
                      e.currentTarget.src = "/images/traditional_plough.jpg";
                    }}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                  <span
                    style={{
                      position: "absolute",
                      top: "10px",
                      left: "10px",
                      padding: "3px 9px",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(255, 255, 255, 0.92)",
                      color: "#191614",
                      fontSize: "10px",
                      fontFamily: "monospace",
                      fontWeight: 700,
                      border: "1px solid rgba(40, 28, 18, 0.08)",
                    }}
                  >
                    PLATE #{String(activeSlide + 1).padStart(2, "0")}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    padding: "0 4px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "15.5px",
                        fontWeight: 700,
                        color: "#191614",
                        fontFamily: "var(--font-khmer-title), Georgia, serif",
                        lineHeight: 1.3,
                      }}
                    >
                      {currentSpecimen.title}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "#78716C", marginTop: "2px" }}>
                      {currentSpecimen.place}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "5px", flexShrink: 0 }}>
                    {specimens.map((spec, idx) => (
                      <button
                        key={spec.id}
                        type="button"
                        onClick={() => setActiveSlide(idx)}
                        aria-label={`View specimen ${idx + 1}`}
                        style={{
                          padding: "4px 9px",
                          borderRadius: "9999px",
                          border: "1px solid",
                          borderColor: activeSlide === idx ? "#EA580C" : "rgba(40, 28, 18, 0.12)",
                          backgroundColor: activeSlide === idx ? "#EA580C" : "#FAF8F5",
                          color: activeSlide === idx ? "#FFFFFF" : "#6B635B",
                          fontSize: "10.5px",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        0{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Light Card for Log In, Dark Obsidian Card for Sign Up */}
        <div className={`editorial-auth-card ${isSignup ? "signup-obsidian" : ""}`}>
          {/* Navigation Mode Toggle: Links cleanly or toggles seamlessly */}
          <div
            style={{
              display: "inline-flex",
              padding: "4px",
              borderRadius: "9999px",
              backgroundColor: isSignup ? "rgba(255, 255, 255, 0.08)" : "#F5F0E8",
              border: isSignup ? "1px solid rgba(255, 255, 255, 0.12)" : "1px solid rgba(40, 28, 18, 0.08)",
              marginBottom: "22px",
            }}
          >
            <button
              type="button"
              onClick={() => switchMode("login")}
              style={{
                padding: "7px 20px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: !isSignup ? "#191614" : "transparent",
                color: !isSignup ? "#FFFFFF" : "#B8AEA4",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              style={{
                padding: "7px 20px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: isSignup ? "#EA580C" : "transparent",
                color: isSignup ? "#FFFFFF" : "#6B635B",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Sign Up
            </button>
          </div>

          <div style={{ marginBottom: "22px" }}>
            <h2
              style={{
                margin: "0 0 4px 0",
                fontSize: "26px",
                fontWeight: 600,
                color: isSignup ? "#FFFFFF" : "#191614",
                fontFamily: "var(--font-khmer-title), var(--font-serif), Georgia, serif",
                lineHeight: 1.3,
              }}
            >
              {isSignup ? "បង្កើតគណនី" : "ចូលគណនី"}
              <span
                style={{
                  marginLeft: "10px",
                  fontFamily: "var(--font-serif), Georgia, serif",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: isSignup ? "#F59E0B" : "#EA580C",
                  fontSize: "24px",
                }}
              >
                {isSignup ? "/ Sign Up" : "/ Log In"}
              </span>
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: isSignup ? "#B8AEA4" : "#6B635B", lineHeight: 1.5 }}>
              {isSignup
                ? "Create a new contributor account with email & password (min 6 characters)."
                : "Log in with your email and password to manage or submit tools."}
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: isSignup ? "rgba(220, 38, 38, 0.16)" : "#FEF2F2",
                border: isSignup ? "1px solid rgba(248, 113, 113, 0.4)" : "1px solid #FECACA",
                color: isSignup ? "#FCA5A5" : "#B91C1C",
                borderRadius: "14px",
                padding: "11px 14px",
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
                backgroundColor: isSignup ? "rgba(16, 185, 129, 0.16)" : "#ECFDF5",
                border: isSignup ? "1px solid rgba(110, 231, 183, 0.4)" : "1px solid #A7F3D0",
                color: isSignup ? "#6EE7B7" : "#065F46",
                borderRadius: "14px",
                padding: "11px 14px",
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

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label
                htmlFor="auth-email"
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: isSignup ? "#D6CEC5" : "#57534E",
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
                  className={`editorial-input ${isSignup ? "signup-dark" : ""}`}
                  style={{ paddingLeft: "42px", paddingRight: "14px" }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="auth-password"
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: isSignup ? "#D6CEC5" : "#57534E",
                  fontFamily: "monospace",
                  marginBottom: "7px",
                  textTransform: "uppercase",
                  letterSpacing: "0.7px",
                }}
              >
                {isSignup ? "Password (Min 6 Characters) / ពាក្យសម្ងាត់" : "Password / ពាក្យសម្ងាត់"}
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
                  minLength={isSignup ? 6 : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`editorial-input ${isSignup ? "signup-dark" : ""}`}
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

            {isSignup && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "#D6CEC5",
                    fontFamily: "monospace",
                    marginBottom: "7px",
                    textTransform: "uppercase",
                    letterSpacing: "0.7px",
                  }}
                >
                  Confirm Password / បញ្ជាក់ពាក្យសម្ងាត់
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
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <input
                    id="auth-confirm-password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="editorial-input signup-dark"
                    style={{ paddingLeft: "42px", paddingRight: "14px" }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: "48px",
                marginTop: "6px",
                borderRadius: "9999px",
                background: isSignup
                  ? "linear-gradient(135deg, #F59E0B 0%, #EA580C 100%)"
                  : "linear-gradient(135deg, #FB923C 0%, #EA580C 52%, #C2410C 100%)",
                border: "none",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                boxShadow: "0 12px 24px -8px rgba(234, 88, 12, 0.45)",
              }}
            >
              {loading
                ? isSignup
                  ? "កំពុងបង្កើតគណនី... / Creating account..."
                  : "កំពុងផ្ទៀងផ្ទាត់... / Logging in..."
                : isSignup
                  ? "Sign Up as Contributor →"
                  : "Log In to Archive →"}
            </button>
          </form>

          <div
            style={{
              marginTop: "22px",
              paddingTop: "16px",
              borderTop: isSignup ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid #F0EAE1",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "10px",
              fontSize: "12.5px",
              color: isSignup ? "#A8A29E" : "#78716C",
            }}
          >
            <Link
              href="/"
              style={{
                color: isSignup ? "#E7E3DF" : "#6B635B",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              &larr; Browse public archive
            </Link>
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: isSignup ? "#F59E0B" : "#A8A29E" }}>
              {isSignup ? "NEW STEWARD SIGN UP" : "RLS PROTECTED PORTAL"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
