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
    <header className="sticky top-2 z-50 w-full px-4" style={{ position: "sticky", top: "8px", zIndex: 100, width: "100%", padding: "0 16px", boxSizing: "border-box" }}>
      <div
        className="max-w-5xl mx-auto rounded-full bg-[#1C1816]/95 border border-[#3A2922] px-6 py-3 my-4 shadow-xl flex items-center justify-between text-xs md:text-sm"
        style={{
          maxWidth: "64rem",
          margin: "0.75rem auto",
          borderRadius: "9999px",
          backgroundColor: "rgba(28, 24, 22, 0.95)",
          border: "1px solid #3A2922",
          padding: "10px 22px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Left Links */}
        <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "18px", flex: "1 1 0" }}>
          <Link
            href="/"
            className="hover:text-[#F59E0B] transition-colors"
            style={{ textDecoration: "none", color: pathname === "/" ? "#F59E0B" : "#bdb1a1", fontWeight: 500 }}
          >
            Archive
          </Link>
          <a
            href="/#seasons"
            className="hover:text-[#F59E0B] transition-colors"
            style={{ textDecoration: "none", color: "#bdb1a1", fontWeight: 500 }}
          >
            Seasons
          </a>
        </nav>

        {/* Brand Center Title */}
        <Link
          href="/"
          className="flex flex-col items-center text-center px-2 focus:outline-none"
          style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0 8px" }}
        >
          <span
            className="font-bold text-[#F59E0B] tracking-wider uppercase text-xs md:text-sm"
            style={{ color: "#F59E0B", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}
          >
            KHMER · LIVING · ARCHIVE
          </span>
          <span
            className="text-[10px] md:text-xs text-[#bdb1a1] tracking-normal font-normal"
            style={{ color: "#bdb1a1", fontSize: "11px", letterSpacing: "0.02em" }}
          >
            Traditional Farming Tools · Kampong Cham
          </span>
        </Link>

        {/* Right Links & Auth */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1 1 0", justifyContent: "flex-end" }}>
          <Link
            href="/contribute"
            className="hover:text-[#F59E0B] transition-colors"
            style={{ textDecoration: "none", color: pathname === "/contribute" ? "#F59E0B" : "#bdb1a1", fontWeight: 500 }}
          >
            Contribute
          </Link>
          {user && (
            <Link
              href="/my-entries"
              className="hover:text-[#F59E0B] transition-colors"
              style={{ textDecoration: "none", color: pathname === "/my-entries" ? "#F59E0B" : "#bdb1a1", fontWeight: 500 }}
            >
              My Entries
            </Link>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-full border border-[#3A2922] px-3.5 py-1 text-[#bdb1a1] hover:text-white hover:border-[#EA580C] transition-colors"
              style={{ background: "none", border: "1px solid #3A2922", borderRadius: "9999px", padding: "4px 12px", color: "#bdb1a1", cursor: "pointer", fontSize: "12px" }}
            >
              Log Out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white px-3.5 py-1.5 font-semibold shadow transition-colors"
              style={{ textDecoration: "none", backgroundColor: "#EA580C", color: "#ffffff", padding: "6px 14px", borderRadius: "9999px", fontWeight: 600, fontSize: "12px" }}
            >
              Log In
            </Link>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Navigation"
          style={{ background: "none", border: "none", color: "#f3ece0", cursor: "pointer", padding: "4px", display: "none" }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d={menuOpen ? "M18 6L6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div
          className="mobile-menu max-w-5xl mx-auto rounded-2xl bg-[#1C1816] border border-[#3A2922] p-5 shadow-2xl flex flex-col gap-3"
          style={{ maxWidth: "64rem", margin: "4px auto 0", backgroundColor: "#1C1816", border: "1px solid #3A2922", borderRadius: "16px", padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ color: "#f3ece0", textDecoration: "none" }}>Archive</Link>
          <a href="/#seasons" onClick={() => setMenuOpen(false)} style={{ color: "#f3ece0", textDecoration: "none" }}>Seasons</a>
          <Link href="/contribute" onClick={() => setMenuOpen(false)} style={{ color: "#f3ece0", textDecoration: "none" }}>Contribute</Link>
          {user && <Link href="/my-entries" onClick={() => setMenuOpen(false)} style={{ color: "#f3ece0", textDecoration: "none" }}>My Entries</Link>}
          <div style={{ paddingTop: "8px", borderTop: "1px solid #3A2922" }}>
            {user ? (
              <button onClick={handleLogout} style={{ background: "none", border: "none", color: "#EA580C", cursor: "pointer", padding: 0 }}>Log Out</button>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ color: "#F59E0B", textDecoration: "none", fontWeight: 600 }}>Log In</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
