"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "../utils/supabase/client.js";
import { useLanguage } from "../app/LanguageContext.js";

const NAV_ANCHORS = [
  { href: "/#overview", label: "Overview" },
  { href: "/#pillars", label: "Pillars" },
  { href: "/#archive", label: "Archive" },
  { href: "/#materials", label: "Materials" },
  { href: "/#tape", label: "Oral Tape" },
];

export default function Header() {
  const { lang, setLang } = useLanguage();
  const [user, setUser] = useState(null);
  const [isReviewer, setIsReviewer] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    async function checkReviewer(currentUser) {
      setUser(currentUser ?? null);
      if (currentUser) {
        try {
          const { data: rev } = await supabase.rpc("is_reviewer");
          setIsReviewer(rev === true);
        } catch {
          setIsReviewer(false);
        }
      } else {
        setIsReviewer(false);
      }
    }

    supabase.auth.getUser().then(({ data }) => checkReviewer(data?.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      checkReviewer(session?.user);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setIsReviewer(false);
    setMenuOpen(false);
  }

  return (
    <div
      style={{
        position: "sticky",
        top: "14px",
        zIndex: 100,
        padding: "0 16px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <header className={`obsidian-dock ${scrolled ? "scrolled" : ""}`}>
        {/* Left: Compact Brand Medallion */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            paddingRight: "6px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "linear-gradient(145deg, #2D1B12 0%, #16110E 100%)",
              border: "1px solid rgba(245, 158, 11, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F59E0B",
              boxShadow: "0 2px 10px rgba(234, 88, 12, 0.18)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: lang === "KH" ? "var(--font-khmer-title), var(--font-sans), system-ui" : "var(--font-sans), system-ui, sans-serif",
                fontWeight: 700,
                fontSize: "14px",
                color: "#FFFFFF",
                letterSpacing: "-0.01em",
                lineHeight: 1.15,
                whiteSpace: "nowrap",
              }}
            >
              {lang === "KH" ? "បណ្ណសារខ្មែរ" : "Khmer Archive"}
            </span>
            <span
              style={{
                fontSize: "9px",
                color: "#B7ACA2",
                fontFamily: lang === "KH" ? "var(--font-khmer-body), monospace" : "monospace",
                letterSpacing: "1px",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#F59E0B" }} />
              {lang === "KH" ? "ខេត្តកំពង់ចាម" : "Kampong Cham"}
            </span>
          </div>
        </Link>

        {/* Center/Right Desktop Links */}
        <nav className="obsidian-desktop" aria-label="Primary Navigation">
          <span style={{ width: "1px", height: "16px", backgroundColor: "rgba(255, 255, 255, 0.12)", marginRight: "4px" }} />

          {NAV_ANCHORS.map((item) => {
            const labelMap = {
              "Overview": lang === "KH" ? "ទិដ្ឋភាពទូទៅ" : "Overview",
              "Pillars": lang === "KH" ? "សសរស្តម្ភ ៤" : "Pillars",
              "Archive": lang === "KH" ? "បណ្ណសាររូបភាព" : "Archive",
              "Materials": lang === "KH" ? "សម្ភារៈ" : "Materials",
              "Oral Tape": lang === "KH" ? "សំឡេងដូនតា" : "Oral Tape",
            };
            return (
              <a key={item.href} href={item.href} className="obsidian-link">
                {labelMap[item.label] || item.label}
              </a>
            );
          })}

          {user && (
            <Link
              href="/my-entries"
              className={`obsidian-link ${pathname === "/my-entries" ? "active" : ""}`}
            >
              {lang === "KH" ? "កំណត់ត្រាខ្ញុំ" : "My Entries"}
            </Link>
          )}

          {isReviewer && (
            <Link
              href="/review"
              style={{
                textDecoration: "none",
                color: pathname === "/review" ? "#FFFFFF" : "#FCD34D",
                fontSize: "12px",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "9999px",
                backgroundColor:
                  pathname === "/review" ? "rgba(245, 158, 11, 0.28)" : "rgba(245, 158, 11, 0.14)",
                border: "1px solid rgba(245, 158, 11, 0.38)",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#F97316" }} />
              {lang === "KH" ? "ជួរត្រួតពិនិត្យ" : "Review Queue"}
            </Link>
          )}

          <span style={{ width: "1px", height: "16px", backgroundColor: "rgba(255, 255, 255, 0.12)", margin: "0 4px" }} />

          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={() => setLang(lang === "KH" ? "EN" : "KH")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "9999px",
              padding: "6px 12px",
              color: "#FCD34D",
              fontSize: "11.5px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "monospace",
              transition: "all 0.2s ease",
            }}
            title="ប្តូរភាសា / Switch Language"
          >
            <span style={{ color: lang === "KH" ? "#F59E0B" : "#8A8179" }}>ខ្មែរ</span>
            <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>|</span>
            <span style={{ color: lang === "EN" ? "#F59E0B" : "#8A8179" }}>EN</span>
          </button>

          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              style={{
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                borderRadius: "9999px",
                padding: "8px 14px",
                color: "#E7E3DF",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: 500,
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.16)";
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                e.currentTarget.style.color = "#E7E3DF";
              }}
            >
              {lang === "KH" ? "ចាកចេញ" : "Log Out"}
            </button>
          ) : (
            <Link
              href="/login"
              style={{
                textDecoration: "none",
                backgroundColor:
                  pathname === "/login" || pathname === "/signup"
                    ? "rgba(245, 158, 11, 0.22)"
                    : "rgba(255, 255, 255, 0.09)",
                border:
                  pathname === "/login" || pathname === "/signup"
                    ? "1px solid rgba(245, 158, 11, 0.45)"
                    : "1px solid rgba(255, 255, 255, 0.14)",
                color: pathname === "/login" || pathname === "/signup" ? "#FCD34D" : "#F5EBE1",
                padding: "8px 15px",
                borderRadius: "9999px",
                fontWeight: 600,
                fontSize: "12.5px",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
              }}
            >
              {lang === "KH" ? "ចូលគណនី" : "Log In"}
            </Link>
          )}

          <Link href="/contribute" className="obsidian-cta">
            <span>{lang === "KH" ? "+ បន្ថែមឧបករណ៍" : "+ Contribute Tool"}</span>
          </Link>
        </nav>

        {/* Mobile Actions + Menu Toggle */}
        <div
          className="obsidian-mobile-btn"
          style={{ alignItems: "center", gap: "6px" }}
        >
          {/* Mobile Language Switcher Pill */}
          <button
            type="button"
            onClick={() => setLang(lang === "KH" ? "EN" : "KH")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "9999px",
              padding: "5px 9px",
              color: "#FCD34D",
              fontSize: "11px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "monospace",
            }}
            title="ប្តូរភាសា / Switch Language"
          >
            <span style={{ color: lang === "KH" ? "#F59E0B" : "#8A8179" }}>KH</span>
            <span style={{ color: "rgba(255, 255, 255, 0.25)" }}>|</span>
            <span style={{ color: lang === "EN" ? "#F59E0B" : "#8A8179" }}>EN</span>
          </button>

          <Link
            href="/contribute"
            className="obsidian-cta"
            style={{ padding: "7px 11px", fontSize: "11.5px" }}
          >
            {lang === "KH" ? "+ បន្ថែម" : "+ Contribute"}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.09)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              color: "#FFFFFF",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={menuOpen ? "M18 6L6 18M6 6l12 12" : "M4 7h16M4 12h16M4 17h16"} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Mobile Obsidian Dropdown Drawer */}
        {menuOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 12px)",
              left: 0,
              right: 0,
              backgroundColor: "rgba(21, 18, 16, 0.98)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "24px",
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4)",
              zIndex: 100,
            }}
          >
            <a href="/#overview" onClick={() => setMenuOpen(false)} className="obsidian-link">
              {lang === "KH" ? "ទិដ្ឋភាពទូទៅ · Overview" : "Overview"}
            </a>
            <a href="/#pillars" onClick={() => setMenuOpen(false)} className="obsidian-link">
              {lang === "KH" ? "សសរស្តម្ភ ៤ · Four Pillars" : "Four Pillars"}
            </a>
            <a href="/#archive" onClick={() => setMenuOpen(false)} className="obsidian-link">
              {lang === "KH" ? "បណ្ណសាររូបភាព · Visual Archive" : "Visual Archive"}
            </a>
            <a href="/#materials" onClick={() => setMenuOpen(false)} className="obsidian-link">
              {lang === "KH" ? "សម្ភារៈឧបករណ៍ · Materials" : "Materials Toolkit"}
            </a>
            <a href="/#tape" onClick={() => setMenuOpen(false)} className="obsidian-link">
              {lang === "KH" ? "សំឡេងដូនតា · Oral Tape" : "Oral Tapes"}
            </a>
            {user && (
              <Link href="/my-entries" onClick={() => setMenuOpen(false)} className="obsidian-link">
                {lang === "KH" ? "កំណត់ត្រាខ្ញុំ · My Entries" : "My Entries"}
              </Link>
            )}
            {isReviewer && (
              <Link
                href="/review"
                onClick={() => setMenuOpen(false)}
                className="obsidian-link"
                style={{ color: "#FCD34D" }}
              >
                {lang === "KH" ? "ជួរត្រួតពិនិត្យ · Review Queue" : "Review Queue"}
              </Link>
            )}
            <div style={{ height: "1px", backgroundColor: "rgba(255, 255, 255, 0.1)", margin: "4px 0" }} />
            <div style={{ display: "flex", gap: "10px", alignItems: "center", justifyContent: "space-between" }}>
              <Link href="/contribute" onClick={() => setMenuOpen(false)} className="obsidian-cta" style={{ flex: 1, justifyContent: "center" }}>
                + Contribute Tool
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    borderRadius: "9999px",
                    padding: "9px 16px",
                    color: "#FFFFFF",
                    cursor: "pointer",
                    fontSize: "12.5px",
                    fontWeight: 600,
                  }}
                >
                  Log Out
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    textDecoration: "none",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    borderRadius: "9999px",
                    padding: "9px 16px",
                    color: "#FFFFFF",
                    fontSize: "12.5px",
                    fontWeight: 600,
                  }}
                >
                  Log In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}
