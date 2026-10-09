'use client';

/**
 * ThemeToggle: sun/moon button that switches dark and light mode.
 * - Sets <html data-theme="dark|light"> and remembers the choice (localStorage).
 * - The icons are switched by CSS (theme.css), so there is no flash and no
 *   hydration error. The label is filled in after the page loads.
 *
 * Use it inside the Header, next to the KH/EN toggle:  <ThemeToggle />
 *
 * It needs the small script in app/layout.js that sets the theme BEFORE the
 * page paints (see the prompt). Without it the page flashes the wrong theme.
 */

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState(null); // null until mounted

  useEffect(() => {
    setTheme(document.documentElement.getAttribute('data-theme') || 'dark');
  }, []);

  const toggle = () => {
    const root = document.documentElement;
    const next = (root.getAttribute('data-theme') || 'dark') === 'light' ? 'dark' : 'light';
    root.classList.add('theme-anim'); // smooth fade for ~0.4s only
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {
      /* private mode: the choice just will not be remembered */
    }
    setTheme(next);
    window.setTimeout(() => root.classList.remove('theme-anim'), 400);
  };

  const label =
    theme === null
      ? 'Switch colour theme'
      : theme === 'light'
      ? 'Switch to dark mode'
      : 'Switch to light mode';

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      <svg className="icon-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
      <svg className="icon-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    </button>
  );
}
