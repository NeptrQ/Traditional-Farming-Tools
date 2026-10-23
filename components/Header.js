"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "../utils/supabase/client.js";
import ThemeToggle from "../app/components/ThemeToggle.jsx";
import { useLanguage } from "../app/LanguageContext.js";

export default function Header() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();
  const sentinelRef = useRef(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { rootMargin: "0px" }
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
  }

  return (
    <>
      <div ref={sentinelRef} style={{ position: "absolute", top: 0, left: 0, right: 0, height: "40px", pointerEvents: "none", zIndex: -1 }}></div>
      <header style={{
        position: "sticky",
        top: 0,
        height: "72px",
        zIndex: 100,
        backgroundColor: scrolled ? "var(--bg)" : "var(--surface)",
        borderBottom: "1px solid var(--surface-soft)",
        transition: "background-color 0.3s ease",
        display: "flex",
        alignItems: "center"
      }}>
        <div className="container" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none", color: "var(--color-paper)", fontFamily: "var(--font-sans)", fontWeight: 600, fontSize: "17px", outline: "none" }} className="focus-ring">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" stroke="var(--color-straw-gold)" strokeWidth="2"/>
              <path d="M12 2 A 10 10 0 0 1 22 12" stroke="var(--color-straw-gold)" strokeWidth="2" fill="var(--color-straw-gold)" />
            </svg>
            Traditional Farming Tools
          </Link>

          <nav className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <NavLink href="/" active={pathname === "/"} lang={lang}>{lang === 'KH' ? 'បណ្ណសារ' : 'Archive'}</NavLink>
            <NavLink href="/about" active={pathname === "/about"} lang={lang}>{lang === 'KH' ? 'អំពីយើង' : 'About'}</NavLink>
            {user && (
              <NavLink href="/my-entries" active={pathname === "/my-entries"} lang={lang}>
                My Entries / កំណត់ត្រារបស់ខ្ញុំ
              </NavLink>
            )}
            
            <button onClick={() => setLang(lang === "EN" ? "KH" : "EN")} className="focus-ring" style={{
              display: "flex", alignItems: "center", padding: "2px", borderRadius: "12px", background: "var(--input-bg)", border: "1px solid var(--border)", cursor: "pointer"
            }}>
              <span style={{ padding: "4px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, background: lang === "KH" ? "var(--accent)" : "transparent", color: lang === "KH" ? "var(--accent-contrast)" : "var(--text-muted)", fontFamily: "var(--font-sans)" }}>KH</span>
              <span style={{ padding: "4px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, background: lang === "EN" ? "var(--accent)" : "transparent", color: lang === "EN" ? "var(--accent-contrast)" : "var(--text-muted)", fontFamily: "var(--font-sans)" }}>EN</span>
            </button>

            <ThemeToggle />

            {user ? (
              <button onClick={handleLogout} className="focus-ring" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontFamily: lang === 'KH' ? 'var(--font-khmer)' : "var(--font-sans)", fontSize: "15px" }}>
                {lang === 'KH' ? 'ចាកចេញ' : 'Log Out'}
              </button>
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <Link href="/login" className="focus-ring" style={{ textDecoration: "none", color: "var(--color-muted)", fontSize: "15px", fontFamily: lang === 'KH' ? 'var(--font-khmer)' : "var(--font-sans)" }}>
                  {lang === 'KH' ? 'ចូលគណនី' : 'Log In'}
                </Link>
                <Link href="/signup" className="focus-ring" style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center", height: "40px", padding: "0 16px", borderRadius: "8px", background: "var(--color-straw-gold)", color: "var(--color-soil)", fontSize: "15px", fontWeight: 500, textDecoration: "none", fontFamily: lang === 'KH' ? 'var(--font-khmer)' : "var(--font-sans)"
                }}>
                  {lang === 'KH' ? 'ចុះឈ្មោះ' : 'Sign Up'}
                </Link>
              </div>
            )}
          </nav>

          <button className="mobile-toggle focus-ring" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-paper)", display: "none" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d={menuOpen ? "M18 6L6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-menu" style={{
          position: "fixed", top: "72px", left: 0, right: 0, background: "var(--bg)", borderBottom: "1px solid var(--surface-soft)", zIndex: 99, padding: "16px 0", display: "flex", flexDirection: "column"
        }}>
          <div className="container" style={{ display: "flex", flexDirection: "column" }}>
            <MobileNavLink href="/" active={pathname === "/"}>{lang === 'KH' ? 'បណ្ណសារ' : 'Archive'}</MobileNavLink>
            <MobileNavLink href="/about" active={pathname === "/about"}>{lang === 'KH' ? 'អំពីយើង' : 'About'}</MobileNavLink>
            {user && (
              <MobileNavLink href="/my-entries" active={pathname === "/my-entries"}>
                My Entries / កំណត់ត្រារបស់ខ្ញុំ
              </MobileNavLink>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "48px" }}>
              <span style={{ color: "var(--color-muted)", fontSize: "15px" }}>{lang === 'KH' ? 'ភាសា' : 'Language'}</span>
              <button onClick={() => setLang(lang === "EN" ? "KH" : "EN")} style={{ display: "flex", alignItems: "center", padding: "2px", borderRadius: "12px", background: "var(--input-bg)", border: "1px solid var(--border)", cursor: "pointer" }}>
                <span style={{ padding: "4px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, background: lang === "KH" ? "var(--accent)" : "transparent", color: lang === "KH" ? "var(--accent-contrast)" : "var(--text-muted)" }}>KH</span>
                <span style={{ padding: "4px 8px", borderRadius: "10px", fontSize: "12px", fontWeight: 600, background: lang === "EN" ? "var(--accent)" : "transparent", color: lang === "EN" ? "var(--accent-contrast)" : "var(--text-muted)" }}>EN</span>
              </button>
            </div>
            
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "48px" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "15px" }}>{lang === 'KH' ? 'ទម្រង់' : 'Theme'}</span>
              <ThemeToggle />
            </div>
            
            {user ? (
              <button onClick={handleLogout} style={{ height: "48px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "15px", textAlign: "left", padding: 0 }}>{lang === 'KH' ? 'ចាកចេញ' : 'Log Out'}</button>
            ) : (
              <>
                <MobileNavLink href="/login">{lang === 'KH' ? 'ចូលគណនី' : 'Log In'}</MobileNavLink>
                <MobileNavLink href="/signup" style={{ color: "var(--accent-text)" }}>{lang === 'KH' ? 'ចុះឈ្មោះ' : 'Sign Up'}</MobileNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function NavLink({ href, active, lang, children }) {
  return (
    <Link href={href} className={`nav-link focus-ring ${active ? 'active' : ''}`} style={{
      textDecoration: "none", fontSize: "15px", fontWeight: 500, fontFamily: lang === "KH" ? "var(--font-khmer)" : "var(--font-sans)",
      color: active ? "var(--color-straw-gold)" : "var(--color-muted)",
      position: "relative", padding: "4px 0", display: "inline-block"
    }}>
      {children}
    </Link>
  );
}

function MobileNavLink({ href, active, children, style = {} }) {
  return (
    <Link href={href} className="focus-ring" style={{
      textDecoration: "none", fontSize: "15px", fontWeight: 500, height: "48px", display: "flex", alignItems: "center",
      color: active ? "var(--color-straw-gold)" : "var(--color-paper)", ...style
    }}>
      {children}
    </Link>
  );
}

