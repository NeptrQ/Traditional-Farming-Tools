import { Instrument_Serif, Inter, Noto_Serif_Khmer, Kantumruy_Pro } from 'next/font/google';
import "./globals.css";
import "./components/theme.css";
import "./components/immersive.css";
import collection from "../collection.config.js";
import Header from "../components/Header.js";
import Footer from "../components/Footer.js";
import AuroraBackground from "./components/AuroraBackground.jsx";
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
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <LanguageProvider>
          <AuroraBackground quality="low" />
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
