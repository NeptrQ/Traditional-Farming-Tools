import { Instrument_Serif, Inter, Noto_Serif_Khmer, Kantumruy_Pro } from 'next/font/google';
import "./globals.css";
import "./components/theme.css";
import "./components/immersive.css";
import collection from "../collection.config.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.js";
import { LanguageProvider } from "./LanguageContext.js";

const instrumentSerif = Instrument_Serif({ weight: '400', style: ['normal', 'italic'], subsets: ['latin'], variable: '--font-serif' });
const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const notoKhmerTitle = Noto_Serif_Khmer({ weight: '600', subsets: ['khmer', 'latin'], variable: '--font-khmer-title' });
const kantumruyPro = Kantumruy_Pro({ weight: ['400', '600'], subsets: ['khmer', 'latin'], variable: '--font-khmer' });

export const metadata = {
  title: `${collection.name} — Khmer Living Archive`,
  description: collection.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${instrumentSerif.variable} ${inter.variable} ${notoKhmerTitle.variable} ${kantumruyPro.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t='dark';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();" }} />
      </head>
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#110F0D", color: "#f3ece0" }}>
        <LanguageProvider>
          {/* Pure CSS Harvest Rice Chaff Particles */}
          <div
            aria-hidden="true"
            style={{
              position: "fixed",
              inset: 0,
              pointerEvents: "none",
              overflow: "hidden",
              zIndex: 0,
            }}
          >
            <div className="rice-chaff" style={{ left: "6%", width: "8px", height: "14px", animationDuration: "17s", animationDelay: "0s" }} />
            <div className="rice-chaff" style={{ left: "15%", width: "6px", height: "10px", animationDuration: "21s", animationDelay: "4s" }} />
            <div className="rice-chaff" style={{ left: "27%", width: "7px", height: "13px", animationDuration: "15s", animationDelay: "8s" }} />
            <div className="rice-chaff" style={{ left: "38%", width: "5px", height: "9px", animationDuration: "19s", animationDelay: "2s" }} />
            <div className="rice-chaff" style={{ left: "50%", width: "8px", height: "15px", animationDuration: "22s", animationDelay: "6s" }} />
            <div className="rice-chaff" style={{ left: "64%", width: "6px", height: "11px", animationDuration: "16s", animationDelay: "1s" }} />
            <div className="rice-chaff" style={{ left: "76%", width: "7px", height: "12px", animationDuration: "20s", animationDelay: "9s" }} />
            <div className="rice-chaff" style={{ left: "85%", width: "5px", height: "10px", animationDuration: "18s", animationDelay: "5s" }} />
            <div className="rice-chaff" style={{ left: "93%", width: "7px", height: "13px", animationDuration: "14s", animationDelay: "11s" }} />
            <div className="rice-chaff" style={{ left: "45%", width: "6px", height: "10px", animationDuration: "20s", animationDelay: "3s" }} />
          </div>
          <div style={{ position: "relative", zIndex: 1, flex: 1, display: "flex", flexDirection: "column" }}>
            <Header />
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              {children}
            </div>
            <Footer />
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
