"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "../utils/supabase/client.js";

export default function Header() {
  const [user, setUser] = useState(null);
  const [isReviewer, setIsReviewer] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    async function checkReviewer(currentUser) {
      setUser(currentUser ?? null);
      if (currentUser) {
        try {
          const { data: rev } = await supabase.rpc('is_reviewer');
          setIsReviewer(rev === true);
        } catch {
          setIsReviewer(false);
        }
      } else {
        setIsReviewer(false);
      }
    }

    supabase.auth.getUser().then(({ data }) => checkReviewer(data?.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkReviewer(session?.user);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsReviewer(false);
  }

  return (
    <div style={{ position: "sticky", top: "18px", zIndex: 100, padding: "0 20px", width: "100%", boxSizing: "border-box" }}>
      <header
        style={{
          maxWidth: "1140px",
          margin: "0 auto",
          borderRadius: "9999px",
          border: "1px solid rgba(40, 28, 18, 0.12)",
          backgroundColor: "rgba(255, 255, 255, 0.88)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 10px 30px -5px rgba(40, 28, 18, 0.08)",
          boxSizing: "border-box",
          position: "relative"
        }}
      >
        {/* Left: Brand with Clean Geometric SVG Mark (NO EMOJI) */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "34px", height: "34px", borderRadius: "50%", backgroundColor: "#191614", display: "flex", alignItems: "center", justifyContent: "center", color: "#F59E0B" }}>
            <svg style={{ width: "17px", height: "17px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "var(--font-sans), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "16px",
                color: "#191614",
                letterSpacing: "-0.01em",
                lineHeight: 1.2
              }}
            >
              The Khmer Living Archive
            </span>
            <span style={{ fontSize: "9.5px", color: "#78716C", fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase" }}>
              Kampong Cham Oral Collection
            </span>
          </div>
        </Link>

        {/* Center/Right Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <a
            href="/#overview"
            style={{ textDecoration: "none", color: "#57534E", fontSize: "13.5px", fontWeight: 500, transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EA580C")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#57534E")}
          >
            Overview
          </a>
          <a
            href="/#pillars"
            style={{ textDecoration: "none", color: "#57534E", fontSize: "13.5px", fontWeight: 500, transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EA580C")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#57534E")}
          >
            Pillars
          </a>
          <a
            href="/#archive"
            style={{ textDecoration: "none", color: "#57534E", fontSize: "13.5px", fontWeight: 500, transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EA580C")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#57534E")}
          >
            Visual Archive
          </a>
          <a
            href="/#materials"
            style={{ textDecoration: "none", color: "#57534E", fontSize: "13.5px", fontWeight: 500, transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#EA580C")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#57534E")}
          >
            Materials
          </a>

          <span style={{ width: "1px", height: "16px", backgroundColor: "rgba(40, 28, 18, 0.15)" }} />

          {user && (
            <Link
              href="/my-entries"
              style={{ textDecoration: "none", color: "#57534E", fontSize: "13.5px", fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#EA580C")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#57534E")}
            >
              My Entries
            </Link>
          )}

          {isReviewer && (
            <Link
              href="/review"
              style={{
                textDecoration: "none",
                color: "#B45309",
                fontSize: "12.5px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 12px",
                borderRadius: "9999px",
                backgroundColor: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.35)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D97706")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.35)")}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#EA580C" }} />
              Review Queue
            </Link>
          )}

          <Link
            href="/contribute"
            style={{
              textDecoration: "none",
              color: "#FFFFFF",
              background: "linear-gradient(135deg, #EA580C, #C2410C)",
              padding: "7px 18px",
              borderRadius: "9999px",
              fontSize: "12.5px",
              fontWeight: 600,
              boxShadow: "0 4px 14px rgba(234, 88, 12, 0.25)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(234, 88, 12, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(234, 88, 12, 0.25)";
            }}
          >
            + Contribute Tool
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid rgba(40, 28, 18, 0.15)",
                borderRadius: "9999px",
                padding: "6px 14px",
                color: "#78716C",
                cursor: "pointer",
                fontSize: "12px",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#EA580C")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#78716C")}
            >
              Log Out
            </button>
          ) : (
            <Link
              href="/login"
              style={{
                textDecoration: "none",
                backgroundColor: "#191614",
                color: "#FFFFFF",
                padding: "7px 18px",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "12px",
                transition: "opacity 0.2s ease"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Log In
            </Link>
          )}
        </nav>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          style={{ background: "none", border: "none", color: "#191614", cursor: "pointer", display: "none", padding: "4px" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={menuOpen ? "M18 6L6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              left: 0,
              right: 0,
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(40, 28, 18, 0.15)",
              borderRadius: "24px",
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
              zIndex: 100
            }}
          >
            <a href="/#overview" onClick={() => setMenuOpen(false)} style={{ color: "#191614", textDecoration: "none", fontWeight: 500 }}>Overview</a>
            <a href="/#pillars" onClick={() => setMenuOpen(false)} style={{ color: "#191614", textDecoration: "none", fontWeight: 500 }}>Four Pillars</a>
            <a href="/#archive" onClick={() => setMenuOpen(false)} style={{ color: "#191614", textDecoration: "none", fontWeight: 500 }}>Visual Archive</a>
            <a href="/#materials" onClick={() => setMenuOpen(false)} style={{ color: "#191614", textDecoration: "none", fontWeight: 500 }}>Materials Toolkit</a>
            <Link href="/contribute" onClick={() => setMenuOpen(false)} style={{ color: "#EA580C", textDecoration: "none", fontWeight: 600 }}>+ Contribute Tool</Link>
            {user && <Link href="/my-entries" onClick={() => setMenuOpen(false)} style={{ color: "#191614", textDecoration: "none" }}>My Entries</Link>}
            {isReviewer && (
              <Link
                href="/review"
                onClick={() => setMenuOpen(false)}
                style={{
                  color: "#B45309",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#EA580C" }} />
                Review Queue
              </Link>
            )}
            <div style={{ height: "1px", backgroundColor: "rgba(40, 28, 18, 0.1)", margin: "4px 0" }} />
            {user ? (
              <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#EA580C", textAlign: "left", padding: 0, cursor: "pointer", fontWeight: 600 }}>Log Out</button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ color: "#EA580C", textDecoration: "none", fontWeight: 600 }}>Log In</Link>
            )}
          </div>
        )}
      </header>
    </div>
  );
}
