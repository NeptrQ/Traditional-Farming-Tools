"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "../utils/supabase/client.js";

export default function Header() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
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
  }

  return (
    <div style={{ position: "sticky", top: "14px", zIndex: 100, padding: "0 16px", width: "100%", boxSizing: "border-box" }}>
      <header
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          borderRadius: "9999px",
          border: "1px solid rgba(82, 54, 42, 0.85)",
          backgroundColor: "rgba(20, 16, 13, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: "10px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 20px rgba(234, 88, 12, 0.12)",
          boxSizing: "border-box",
          position: "relative"
        }}
      >
        {/* Left: Brand with Clean Geometric SVG Icon (NO EMOJI) */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "#271710", border: "1px solid #522E1F", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: "16px", height: "16px", color: "#F59E0B" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v3M12 18v3M3 12h3M18 12h3" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "var(--font-serif), Georgia, serif",
                fontWeight: 700,
                fontSize: "17px",
                color: "#FFFFFF",
                letterSpacing: "0.02em",
                lineHeight: 1.2
              }}
            >
              The Khmer Living Archive
            </span>
            <span style={{ fontSize: "10px", color: "#A8A29E", fontFamily: "monospace", letterSpacing: "1px", textTransform: "uppercase" }}>
              Kampong Cham Oral Collection
            </span>
          </div>
        </Link>

        {/* Center/Right Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <a
            href="/#tools"
            style={{ textDecoration: "none", color: "#D6D3D1", fontSize: "13px", fontWeight: 500, transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F59E0B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#D6D3D1")}
          >
            10 Implements
          </a>
          <a
            href="/#heritage"
            style={{ textDecoration: "none", color: "#D6D3D1", fontSize: "13px", fontWeight: 500, transition: "color 0.2s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#F59E0B")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#D6D3D1")}
          >
            Woodcraft Compass
          </a>

          <span style={{ width: "1px", height: "16px", backgroundColor: "rgba(82, 54, 42, 0.7)" }} />

          {user && (
            <Link
              href="/my-entries"
              style={{ textDecoration: "none", color: "#D6D3D1", fontSize: "13px", fontWeight: 500 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#F59E0B")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#D6D3D1")}
            >
              My Entries
            </Link>
          )}

          <Link
            href="/contribute"
            style={{
              textDecoration: "none",
              color: "#FED7AA",
              backgroundColor: "#261710",
              border: "1px solid #4D2D20",
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "12px",
              fontFamily: "monospace",
              transition: "border-color 0.2s ease"
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#EA580C")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#4D2D20")}
          >
            + Contribute Tool
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              style={{
                background: "none",
                border: "1px solid #3E2920",
                borderRadius: "9999px",
                padding: "5px 14px",
                color: "#A8A29E",
                cursor: "pointer",
                fontSize: "12px"
              }}
            >
              Log Out
            </button>
          ) : (
            <Link
              href="/login"
              style={{
                textDecoration: "none",
                backgroundColor: "#EA580C",
                backgroundImage: "linear-gradient(to right, #EA580C, #C2410C)",
                color: "#ffffff",
                padding: "6px 18px",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "12px",
                boxShadow: "0 4px 14px rgba(234, 88, 12, 0.35)"
              }}
            >
              Log In
            </Link>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          style={{ background: "none", border: "none", color: "#E7E3DF", cursor: "pointer", display: "none", padding: "4px" }}
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
              top: "calc(100% + 10px)",
              left: 0,
              right: 0,
              backgroundColor: "#16120E",
              border: "1px solid #4D2D20",
              borderRadius: "20px",
              padding: "18px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.9)",
              zIndex: 100
            }}
          >
            <a href="/#tools" onClick={() => setMenuOpen(false)} style={{ color: "#E7E3DF", textDecoration: "none" }}>10 Implements</a>
            <a href="/#heritage" onClick={() => setMenuOpen(false)} style={{ color: "#E7E3DF", textDecoration: "none" }}>Woodcraft Compass</a>
            <Link href="/contribute" onClick={() => setMenuOpen(false)} style={{ color: "#F59E0B", textDecoration: "none" }}>+ Contribute Tool</Link>
            {user && <Link href="/my-entries" onClick={() => setMenuOpen(false)} style={{ color: "#E7E3DF", textDecoration: "none" }}>My Entries</Link>}
            <div style={{ height: "1px", backgroundColor: "#2E221C", margin: "4px 0" }} />
            {user ? (
              <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#EA580C", textAlign: "left", padding: 0, cursor: "pointer" }}>Log Out</button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ color: "#EA580C", textDecoration: "none", fontWeight: 600 }}>Log In</Link>
            )}
          </div>
        )}
      </header>
    </div>
  );
}
