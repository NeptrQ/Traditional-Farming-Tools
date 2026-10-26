'use client';
import { useEffect, useState } from 'react';
import AtmosphereCanvas from '../components/AtmosphereCanvas';
import EntryModal from '../components/EntryModal';
import { createClient } from '../utils/supabase/client';

// 10 Canonical Kampong Cham Implements with Authentic Oral Lore & Provenance
const DEFAULT_TOOLS = [
  {
    id: '1',
    title: 'នង្គ័លបុរាណ',
    english_name: 'Traditional Kokir Plough',
    category: 'SOIL PREPARATION',
    season: 'Early Monsoon (May - June)',
    material: 'Kokir Ironwood · Spring Steel Tip',
    place: 'Kampong Siem, Kampong Cham',
    description: 'Carved from aged Kokir ironwood. Specially angled to slice 20cm deep into sticky basalt red soil without snapping under draft tension.',
    photo_url: '/images/traditional_plough.jpg'
  },
  {
    id: '2',
    title: 'រាស់ឈើបុរាណ',
    english_name: '7-Tooth Ironwood Harrow',
    category: 'LEVELING FIELD',
    season: 'Field Leveling (June)',
    material: 'Ironwood Frame · Chiseled Teeth',
    place: 'Batheay, Kampong Cham',
    description: 'Hand-chiseled ironwood comb with 7 teeth that pulverize hardened mud clods so baby rice seedlings can take root and breathe.',
    photo_url: ''
  },
  {
    id: '3',
    title: 'នឹមគោភ្លោះ',
    english_name: 'Double Ox Yoke',
    category: 'OXEN HARNESS',
    season: 'Plowing Season (May - July)',
    material: 'Curved Tamarind Wood · Rawhide Ties',
    place: 'Kampong Siem, Kampong Cham',
    description: 'Curved neck beam designed to balance pulling tension across twin draft cattle over 8 continuous hours of muddy drag.',
    photo_url: ''
  },
  {
    id: '4',
    title: 'ចបកាប់ដីក្រហម',
    english_name: 'Heavy Basalt Field Hoe',
    category: 'CANAL DITCHING',
    season: 'Dike Maintenance (Monsoon)',
    material: 'Blacksmith Carbon Steel · Tamarind Shaft',
    place: 'Prey Chhor, Kampong Cham',
    description: 'Heavy steel blade hand-forged by village blacksmiths for digging irrigation ditches and repairing earthen paddy bunds.',
    photo_url: ''
  },
  {
    id: '5',
    title: 'រទេះគោបុរាណ',
    english_name: 'Traditional Ox Cart',
    category: 'HAULING HARVEST',
    season: 'Harvest Hauling (Nov - Jan)',
    material: 'Solid Spoke Hubs · Woven Bamboo Rack',
    place: 'Chamkar Leu, Kampong Cham',
    description: 'Solid high-clearance spoke wheels engineered to roll through deep wet mud during monsoon season carrying 30 sacks of unhusked rice.',
    photo_url: ''
  },
  {
    id: '6',
    title: 'កណ្ដៀវច្រូតស្រូវ',
    english_name: 'Serrated Harvest Sickle',
    category: 'CUTTING PADDY',
    season: 'Dry Season Harvest (Dec - Jan)',
    material: 'Serrated Blacksmith Steel · Bamboo Grip',
    place: 'Kang Meas, Kampong Cham',
    description: 'Fine-toothed curved steel blade forged to slice rice stalks in rapid one-handed sweeps during the golden dry season harvest.',
    photo_url: ''
  },
  {
    id: '7',
    title: 'អង្រែ និងកញ្ជើ',
    english_name: 'Woven Winnowing Platter',
    category: 'GRAIN SEPARATION',
    season: 'Grain Threshing (January)',
    material: 'Smoked Bamboo Splints · Rattan Trim',
    place: 'Cheung Prey, Kampong Cham',
    description: 'Woven bamboo platter tossed into evening Mekong breezes to separate empty husks from golden grain by natural aerodynamics.',
    photo_url: ''
  },
  {
    id: '8',
    title: 'ក្អមដីដុតបុរាណ',
    english_name: 'Porous Field Terracotta Pot',
    category: 'FIELD WATER',
    season: 'Midday Fieldwork (All Seasons)',
    material: 'Mekong River Basin Clay',
    place: 'Kampong Siem, Kampong Cham',
    description: 'Porous terracotta vessel that keeps well water icy cool under 38°C midday field heat through natural evaporative cooling.',
    photo_url: ''
  },
  {
    id: '9',
    title: 'ឈ្នាងដងត្រីស្រែ',
    english_name: 'Bamboo Fish Scoop Trap',
    category: 'MONSOON FORAGING',
    season: 'Flood Recession (Aug - Oct)',
    material: 'Fine Split Bamboo · Water Reed Mesh',
    place: 'Koh Sotin, Kampong Cham',
    description: 'Fine woven bamboo scoop used by farmers to catch climbing perch and mudfish swimming in flooded paddy furrows.',
    photo_url: ''
  },
  {
    id: '10',
    title: 'ជង្រុកស្រូវបុរាណ',
    english_name: 'High-Stilt Paddy Granary',
    category: 'GRAIN PRESERVATION',
    season: 'Year-Round Safe Storage',
    material: 'Elevated Hardwood Stilts · Lime Mortar',
    place: 'Srei Santhor, Kampong Cham',
    description: 'Elevated wooden granary built high on stilts with natural lime plaster to protect stored rice from monsoon damp, insects, and mice.',
    photo_url: ''
  }
];

export default function HomePage() {
  const [entries, setEntries] = useState(DEFAULT_TOOLS);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [spotlightTab, setSpotlightTab] = useState('story'); // 'story' | 'season' | 'craft'

  // Load from Supabase in background with 3-second guard (never stuck loading!)
  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        if (!supabase) return;

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000));
        const fetchPromise = supabase
          .from('entries')
          .select('*')
          .order('created_at', { ascending: false });

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        if (result && result.data && result.data.length > 0) {
          // Merge local photo for plough if not present
          const enhanced = result.data.map((item) => {
            if ((!item.photo_url || item.photo_url.includes('wikipedia')) && item.title && (item.title.includes('នង្គ័ល') || item.title.includes('Plough'))) {
              return { ...item, photo_url: '/images/traditional_plough.jpg' };
            }
            return item;
          });
          setEntries(enhanced);
        }
      } catch (err) {
        console.warn('Using default 10 catalog entries:', err);
      }
    }
    loadData();
  }, []);

  // Track scroll direction for true bi-directional fluid entrance
  useEffect(() => {
    let lastY = window.scrollY;
    const handleScrollDir = () => {
      const currentY = window.scrollY;
      const dir = currentY < lastY ? 'up' : 'down';
      document.documentElement.setAttribute('data-scroll-dir', dir);
      lastY = currentY;
    };
    window.addEventListener('scroll', handleScrollDir, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollDir);
  }, []);

  // Filter entries by search query and category pills
  const filteredEntries = entries.filter((e) => {
    const q = search.toLowerCase().trim();
    const matchesSearch = !q || (
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.english_name && e.english_name.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q)) ||
      (e.category && e.category.toLowerCase().includes(q)) ||
      (e.place && e.place.toLowerCase().includes(q))
    );

    if (activeFilter === 'ALL') return matchesSearch;
    const cat = (e.category || '').toLowerCase();
    const title = ((e.title || '') + ' ' + (e.english_name || '')).toLowerCase();
    if (activeFilter === 'SOIL') {
      return matchesSearch && (cat.includes('soil') || cat.includes('prep') || title.includes('នង្គ័ល') || title.includes('រាស់') || title.includes('ចប') || title.includes('plough') || title.includes('harrow'));
    }
    if (activeFilter === 'HARVEST') {
      return matchesSearch && (cat.includes('harvest') || cat.includes('grain') || title.includes('កណ្ដៀវ') || title.includes('អង្រែ') || title.includes('ជង្រុក') || title.includes('sickle') || title.includes('winnowing'));
    }
    if (activeFilter === 'CATTLE') {
      return matchesSearch && (cat.includes('ox') || cat.includes('harness') || title.includes('នឹម') || title.includes('រទេះ') || title.includes('yoke') || title.includes('cart'));
    }
    return matchesSearch;
  });

  // BI-DIRECTIONAL SCROLL REVEAL OBSERVER (Works smoothly scrolling UP and DOWN!)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (items) => {
        items.forEach((item) => {
          if (item.isIntersecting) {
            item.target.classList.add('in-view');
          } else {
            // Re-triggers smoothly when scrolling back into view
            item.target.classList.remove('in-view');
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '60px 0px 60px 0px' // Generous buffer prevents late pop-ins
      }
    );

    const targets = document.querySelectorAll('.reveal-on-scroll');
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredEntries]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0C0A09', color: '#E7E3DF', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', position: 'relative', overflowX: 'hidden' }}>
      
      {/* 1. Deep Atmospheric Dusk Glow */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1000px',
          height: '550px',
          background: 'radial-gradient(ellipse at 50% 0%, rgba(234, 88, 12, 0.2) 0%, rgba(30, 16, 10, 0.75) 45%, transparent 75%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* 2. Floating Particles & Cursor Glow */}
      <AtmosphereCanvas />

      {/* 3. Main Page Content */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '16px 20px 80px 20px', position: 'relative', zIndex: 10 }}>

        {/* ======================================================== */}
        {/* SECTION 1: HERO & INTERACTIVE IMPLEMENT SPOTLIGHT        */}
        {/* ======================================================== */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '36px', alignItems: 'center', marginBottom: '56px', paddingTop: '10px' }}>
          
          {/* Left: Narrative & Search (Reveals smoothly) */}
          <div className="reveal-on-scroll in-view">
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 14px', borderRadius: '9999px', backgroundColor: '#241610', border: '1px solid #522E1F', color: '#F59E0B', fontSize: '11px', fontFamily: 'monospace', marginBottom: '16px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EA580C' }}></span>
              <span>LIVING ORAL ARCHIVE · 10 TOOLS PRESERVED</span>
            </div>

            <h1 style={{ fontSize: '38px', fontWeight: 'normal', color: '#FFFFFF', margin: '0 0 14px 0', lineHeight: 1.2, fontFamily: 'var(--font-serif), Georgia, serif' }}>
              The oral wisdom of <span style={{ color: '#F59E0B', fontStyle: 'italic', textDecoration: 'underline', textDecorationColor: 'rgba(234, 88, 12, 0.4)', textUnderlineOffset: '8px' }}>Cambodia&apos;s fields</span> is a living treasure.
            </h1>

            <p style={{ color: 'rgba(254, 215, 170, 0.95)', fontStyle: 'italic', fontSize: '15px', lineHeight: 1.7, margin: '0 0 14px 0', fontFamily: 'var(--font-serif), Georgia, serif' }}>
              « រំលឹកដង្ហើមស្រែដូនតា និងកេរ្តិ៍ដំណែលឧបករណ៍កសិកម្មបុរាណ លើទឹកដីដីក្រហម »
            </p>

            <p style={{ color: '#A8A29E', fontSize: '13px', lineHeight: 1.6, margin: '0 0 22px 0', maxWidth: '500px' }}>
              Preserving traditional ironwood implements and oral field memories from Kampong Cham elders before mechanized tractors replace generational heritage.
            </p>

            {/* Quick Filter Pills (CLEAN NUMBERED TAXONOMY — ZERO EMOJIS) */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  border: activeFilter === 'ALL' ? '1px solid #EA580C' : '1px solid #38251C',
                  backgroundColor: activeFilter === 'ALL' ? '#EA580C' : '#1A1410',
                  color: activeFilter === 'ALL' ? '#FFFFFF' : '#A8A29E',
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                ALL ({entries.length || 10})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('SOIL')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  border: activeFilter === 'SOIL' ? '1px solid #EA580C' : '1px solid #38251C',
                  backgroundColor: activeFilter === 'SOIL' ? '#EA580C' : '#1A1410',
                  color: activeFilter === 'SOIL' ? '#FFFFFF' : '#A8A29E',
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                I. Soil Prep (ភ្ជួររាស់)
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('HARVEST')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  border: activeFilter === 'HARVEST' ? '1px solid #EA580C' : '1px solid #38251C',
                  backgroundColor: activeFilter === 'HARVEST' ? '#EA580C' : '#1A1410',
                  color: activeFilter === 'HARVEST' ? '#FFFFFF' : '#A8A29E',
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                II. Harvest (ប្រមូលផល)
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('CATTLE')}
                style={{
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  border: activeFilter === 'CATTLE' ? '1px solid #EA580C' : '1px solid #38251C',
                  backgroundColor: activeFilter === 'CATTLE' ? '#EA580C' : '#1A1410',
                  color: activeFilter === 'CATTLE' ? '#FFFFFF' : '#A8A29E',
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                III. Draft Cattle (នឹម &amp; រទេះ)
              </button>
            </div>

            {/* Search Input with Clean SVG Icon (NO EMOJI) */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '420px' }}>
              <input
                type="text"
                placeholder="ស្វែងរកឧបករណ៍... / Search tools, village..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 36px',
                  borderRadius: '12px',
                  backgroundColor: '#15110E',
                  border: '1px solid #3E251A',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#78716C' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>

          {/* Right: Interactive Implement Spotlight */}
          <div
            className="reveal-on-scroll in-view"
            style={{
              backgroundColor: '#16120E',
              border: '1px solid rgba(82, 54, 42, 0.8)',
              borderRadius: '24px',
              padding: '20px',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.8), 0 0 24px rgba(234, 88, 12, 0.08)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '11px', fontFamily: 'monospace', color: '#F59E0B' }}>
              <span style={{ letterSpacing: '1px', textTransform: 'uppercase' }}>FEATURED IMPLEMENT</span>
              <span style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: '#241610', border: '1px solid #4D2D20' }}>CATALOG #01</span>
            </div>

            {/* Photo */}
            <div style={{ width: '100%', height: '190px', borderRadius: '14px', backgroundColor: '#0B0907', border: '1px solid #2B1D16', overflow: 'hidden', position: 'relative', marginBottom: '14px' }}>
              <img
                src="/images/traditional_plough.jpg"
                alt="Plough in Red Soil"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', bottom: '8px', left: '8px', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(6px)', fontSize: '11px', color: '#FED7AA' }}>
                នង្គ័លបុរាណ (Kokir Ironwood Ox Plough)
              </div>
            </div>

            {/* 3 Clickable Tabs */}
            <div style={{ display: 'flex', gap: '6px', padding: '3px', borderRadius: '10px', backgroundColor: '#0E0B09', border: '1px solid #281B14', marginBottom: '12px', fontSize: '11.5px', fontFamily: 'monospace' }}>
              <button
                type="button"
                onClick={() => setSpotlightTab('story')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: spotlightTab === 'story' ? '#271811' : 'transparent',
                  color: spotlightTab === 'story' ? '#F59E0B' : '#A8A29E',
                  fontWeight: spotlightTab === 'story' ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
              >
                Oral Memory
              </button>
              <button
                type="button"
                onClick={() => setSpotlightTab('season')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: spotlightTab === 'season' ? '#271811' : 'transparent',
                  color: spotlightTab === 'season' ? '#F59E0B' : '#A8A29E',
                  fontWeight: spotlightTab === 'season' ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
              >
                Season &amp; Soil
              </button>
              <button
                type="button"
                onClick={() => setSpotlightTab('craft')}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: spotlightTab === 'craft' ? '#271811' : 'transparent',
                  color: spotlightTab === 'craft' ? '#F59E0B' : '#A8A29E',
                  fontWeight: spotlightTab === 'craft' ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
              >
                Woodcraft
              </button>
            </div>

            {/* Tab Details */}
            <div style={{ minHeight: '70px' }}>
              {spotlightTab === 'story' && (
                <div>
                  <p style={{ margin: '0 0 4px 0', fontStyle: 'italic', fontSize: '12.5px', color: 'rgba(254, 215, 170, 0.95)', lineHeight: 1.6, fontFamily: 'var(--font-serif), Georgia, serif' }}>
                    « នង្គ័លនេះ ធ្វើពីឈើគគីររឹងមាំណាស់ ប្រើជាមួយគោមួយនឹម ភ្ជួរតាំងពីដីរឹងរហូតដល់ភ្លៀងធ្លាក់ដំបូង... »
                  </p>
                  <span style={{ fontSize: '10.5px', color: '#A8A29E', fontFamily: 'monospace' }}>
                    — Grandfather Sok, Kampong Siem
                  </span>
                </div>
              )}
              {spotlightTab === 'season' && (
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12.5px', color: '#E7E3DF', lineHeight: 1.5 }}>
                    Deployed in <strong style={{ color: '#F59E0B' }}>May - June</strong> when early rains soften basalt red clay before flooding.
                  </p>
                  <span style={{ fontSize: '10.5px', color: '#A8A29E', fontFamily: 'monospace' }}>
                    Basalt Red Earth (ដីក្រហមបាសាល់)
                  </span>
                </div>
              )}
              {spotlightTab === 'craft' && (
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '12.5px', color: '#E7E3DF', lineHeight: 1.5 }}>
                    Hewn from curved <strong style={{ color: '#F59E0B' }}>Kokir ironwood</strong>. Tip clad in blacksmith-hammered spring steel.
                  </p>
                  <span style={{ fontSize: '10.5px', color: '#A8A29E', fontFamily: 'monospace' }}>
                    Tension: ~400kg draft pull · 2 Oxen
                  </span>
                </div>
              )}
            </div>

          </div>

        </section>

        {/* ======================================================== */}
        {/* SECTION 2: THE 10 PRESERVED TOOLS (CINEMATIC CARD GRID)  */}
        {/* ======================================================== */}
        <section id="tools" style={{ marginBottom: '64px' }}>
          
          <div className="reveal-on-scroll" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid #281D17', paddingBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block' }}>
                KAMPONG CHAM ARCHIVE
              </span>
              <h2 style={{ fontSize: '24px', color: '#FFFFFF', margin: '4px 0 0 0', fontWeight: 500, fontFamily: 'var(--font-serif), Georgia, serif' }}>
                The 10 Preserved Implements
              </h2>
            </div>
            <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#F59E0B' }}>
              Showing {filteredEntries.length} of {entries.length || 10} Tools
            </div>
          </div>

          {/* STAGGERED BI-DIRECTIONAL WAVE GRID (WORKS SCROLLING UP & DOWN) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '22px',
            alignItems: 'stretch'
          }}>
            {filteredEntries.map((tool, idx) => (
              <MuseumCard
                key={tool.id || idx}
                tool={tool}
                index={idx}
                onClick={() => setSelectedEntry(tool)}
                staggerDelay={(idx % 3) * 80}
              />
            ))}
          </div>

        </section>

        {/* ======================================================== */}
        {/* SECTION 3: UNIFIED HERITAGE & WOODCRAFT COMPASS FOOTER   */}
        {/* ======================================================== */}
        <section
          id="heritage"
          className="reveal-on-scroll"
          style={{
            backgroundColor: '#14100D',
            border: '1px solid rgba(82, 54, 42, 0.75)',
            borderRadius: '24px',
            padding: '32px 28px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '32px',
            alignItems: 'center'
          }}
        >
          {/* Left: Oral Quote & 4 Clean Stat Tags */}
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '8px' }}>
              FAMILY ORAL ARCHIVE · KAMPONG CHAM
            </span>
            <p style={{ fontSize: '14px', color: 'rgba(254, 215, 170, 0.95)', fontStyle: 'italic', lineHeight: 1.6, margin: '0 0 18px 0', fontFamily: 'var(--font-serif), Georgia, serif' }}>
              « របស់ទាំងនេះ មិនមែនគ្រាន់តែជាឈើ ឬដែកនោះទេ តែជាញើសឈាម និងជីវិតអ្នកស្រែកំពង់ចាមរាប់តំណរ... »
            </p>

            {/* 4 Clean Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ backgroundColor: '#1A1410', border: '1px solid #38251C', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '10px', color: '#EA580C', fontFamily: 'monospace', textTransform: 'uppercase', display: 'block' }}>CURATED BY</span>
                <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>Srorn Vanuth</span>
              </div>
              <div style={{ backgroundColor: '#1A1410', border: '1px solid #38251C', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '10px', color: '#EA580C', fontFamily: 'monospace', textTransform: 'uppercase', display: 'block' }}>PROVINCE</span>
                <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>Kampong Cham (ដីក្រហម)</span>
              </div>
              <div style={{ backgroundColor: '#1A1410', border: '1px solid #38251C', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '10px', color: '#EA580C', fontFamily: 'monospace', textTransform: 'uppercase', display: 'block' }}>COURSE</span>
                <span style={{ fontSize: '12px', color: '#FFFFFF', fontWeight: 600 }}>ICT 340 · Web Coding</span>
              </div>
              <div style={{ backgroundColor: '#1A1410', border: '1px solid #38251C', borderRadius: '12px', padding: '10px 14px' }}>
                <span style={{ fontSize: '10px', color: '#EA580C', fontFamily: 'monospace', textTransform: 'uppercase', display: 'block' }}>COLLECTION</span>
                <span style={{ fontSize: '12px', color: '#F59E0B', fontWeight: 600 }}>10 Living Tools</span>
              </div>
            </div>
          </div>

          {/* Right: Golden Khmer Woodcraft Lotus Compass (*Kbach Pka Chan*) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ width: '180px', height: '180px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
              <svg
                style={{ width: '100%', height: '100%', color: '#F59E0B', filter: 'drop-shadow(0 0 10px rgba(245, 158, 11, 0.3))' }}
                viewBox="0 0 200 200"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
              >
                <circle cx="100" cy="100" r="14" />
                <circle cx="100" cy="100" r="34" strokeDasharray="3,3" />
                <circle cx="100" cy="100" r="68" />
                <circle cx="100" cy="100" r="92" strokeDasharray="2,4" />
                <line x1="100" y1="8" x2="100" y2="192" />
                <line x1="8" y1="100" x2="192" y2="100" />
                <path d="M 100,34 Q 130,65 100,100 Q 70,65 100,34 Z" fill="rgba(234, 88, 12, 0.15)" />
                <path d="M 100,166 Q 130,135 100,100 Q 70,135 100,166 Z" fill="rgba(234, 88, 12, 0.15)" />
                <path d="M 34,100 Q 65,130 100,100 Q 65,70 34,100 Z" fill="rgba(234, 88, 12, 0.15)" />
                <path d="M 166,100 Q 135,130 100,100 Q 135,70 166,100 Z" fill="rgba(234, 88, 12, 0.15)" />
              </svg>
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#F59E0B', letterSpacing: '1px' }}>
              KBACH PKA CHAN · ក្បាច់ផ្កាចន្ទ័៍
            </span>
            <span style={{ fontSize: '10px', color: '#78716C', fontFamily: 'monospace', marginTop: '2px' }}>
              Woodcraft Carpentry Geometry · Kampong Cham
            </span>
          </div>

        </section>

      </main>

      {/* 4. Detail Modal Popup */}
      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

    </div>
  );
}

// Compact, crisp Museum Card with Smooth Bi-directional Scroll Wave Transition
function MuseumCard({ tool, index, onClick, staggerDelay }) {
  const [imgFailed, setImgFailed] = useState(false);
  const photoUrl = tool.photo_url || tool.image_url;

  // Render authentic woodcraft silhouette plates for implements
  const renderFallbackPlate = (category, title) => {
    const text = (category + ' ' + title).toLowerCase();
    let iconPath;

    if (text.includes('harrow') || text.includes('រាស់')) {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <rect x="18" y="26" width="64" height="8" rx="2" fill="rgba(234, 88, 12, 0.2)" />
          <line x1="24" y1="34" x2="24" y2="60" strokeLinecap="round" />
          <line x1="34" y1="34" x2="34" y2="60" strokeLinecap="round" />
          <line x1="44" y1="34" x2="44" y2="60" strokeLinecap="round" />
          <line x1="50" y1="18" x2="50" y2="26" stroke="#F59E0B" strokeWidth="3" />
          <line x1="56" y1="34" x2="56" y2="60" strokeLinecap="round" />
          <line x1="66" y1="34" x2="66" y2="60" strokeLinecap="round" />
          <line x1="76" y1="34" x2="76" y2="60" strokeLinecap="round" />
        </g>
      );
    } else if (text.includes('yoke') || text.includes('នឹម')) {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <path d="M 12,46 Q 32,24 50,46 Q 68,24 88,46" strokeLinecap="round" strokeWidth="3.5" />
          <circle cx="30" cy="54" r="4" fill="#F59E0B" />
          <circle cx="70" cy="54" r="4" fill="#F59E0B" />
          <line x1="30" y1="42" x2="30" y2="62" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2,2" />
          <line x1="70" y1="42" x2="70" y2="62" stroke="#F59E0B" strokeWidth="2" strokeDasharray="2,2" />
        </g>
      );
    } else if (text.includes('sickle') || text.includes('កណ្ដៀវ')) {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <path d="M 68,18 C 36,18 20,42 32,68 C 38,56 48,46 62,40" strokeLinecap="round" fill="rgba(234, 88, 12, 0.2)" />
          <rect x="28" y="65" width="8" height="15" rx="2" transform="rotate(-25 28 65)" fill="#F59E0B" stroke="#F59E0B" />
        </g>
      );
    } else if (text.includes('cart') || text.includes('រទេះ')) {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <circle cx="35" cy="52" r="18" fill="rgba(234, 88, 12, 0.15)" />
          <circle cx="35" cy="52" r="4" fill="#F59E0B" />
          <line x1="17" y1="52" x2="53" y2="52" />
          <line x1="35" y1="34" x2="35" y2="70" />
          <line x1="35" y1="42" x2="86" y2="30" strokeWidth="3.5" stroke="#F59E0B" strokeLinecap="round" />
        </g>
      );
    } else if (text.includes('hoe') || text.includes('ចប')) {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <line x1="22" y1="68" x2="72" y2="18" strokeWidth="3.5" stroke="#F59E0B" strokeLinecap="round" />
          <rect x="66" y="14" width="16" height="22" rx="2" transform="rotate(30 66 14)" fill="rgba(234, 88, 12, 0.3)" />
        </g>
      );
    } else if (text.includes('pot') || text.includes('ក្អម')) {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <ellipse cx="50" cy="22" rx="14" ry="4" stroke="#F59E0B" />
          <path d="M 38,24 C 22,40 22,66 50,68 C 78,66 78,40 62,24" fill="rgba(234, 88, 12, 0.2)" />
        </g>
      );
    } else if (text.includes('granary') || text.includes('ជង្រុក')) {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <polygon points="50,18 18,38 82,38" fill="rgba(234, 88, 12, 0.25)" stroke="#F59E0B" />
          <rect x="25" y="38" width="50" height="24" rx="2" fill="rgba(234, 88, 12, 0.15)" />
          <line x1="32" y1="62" x2="32" y2="74" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="68" y1="62" x2="68" y2="74" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );
    } else if (text.includes('scoop') || text.includes('ឈ្នាង')) {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <ellipse cx="50" cy="45" rx="30" ry="18" fill="rgba(234, 88, 12, 0.2)" />
          <line x1="50" y1="27" x2="50" y2="63" strokeDasharray="3,3" />
          <line x1="20" y1="45" x2="80" y2="45" strokeDasharray="3,3" />
          <line x1="50" y1="27" x2="50" y2="12" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
        </g>
      );
    } else {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <path d="M 15,62 Q 42,62 62,35 L 86,16" strokeLinecap="round" strokeWidth="3.5" stroke="#F59E0B" />
          <path d="M 52,42 L 36,68 L 68,68 Z" fill="rgba(234, 88, 12, 0.3)" />
        </g>
      );
    }

    return (
      <div style={{
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at center, #221611 0%, #0F0C0A 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Woodcraft Geometry Blueprint Grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(245, 158, 11, 0.12) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          opacity: 0.6
        }} />

        {/* Faint Khmer Script Watermark */}
        <div style={{
          position: 'absolute',
          bottom: '6px',
          right: '10px',
          fontSize: '26px',
          fontFamily: 'var(--font-serif), Georgia, serif',
          color: 'rgba(234, 88, 12, 0.08)',
          fontWeight: 'bold',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          {tool.title}
        </div>

        {/* SVG Silhouette */}
        <svg style={{ width: '64px', height: '64px', filter: 'drop-shadow(0 0 8px rgba(234, 88, 12, 0.4))', position: 'relative', zIndex: 2 }} viewBox="0 0 100 80">
          {iconPath}
        </svg>

        {/* Curatorial Seal */}
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          fontSize: '9px',
          fontFamily: 'monospace',
          color: '#8C827A',
          letterSpacing: '1px',
          backgroundColor: 'rgba(0,0,0,0.65)',
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid rgba(82, 54, 42, 0.5)'
        }}>
          ORAL HERITAGE PLATE
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className="museum-card reveal-on-scroll"
      style={{
        transitionDelay: `${staggerDelay || 0}ms`
      }}
    >
      {/* 150px Visual Exhibit Frame */}
      <div style={{
        width: '100%',
        height: '150px',
        borderRadius: '12px',
        backgroundColor: '#0B0907',
        border: '1px solid #2B1D16',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '14px'
      }}>
        {photoUrl && !imgFailed ? (
          <img
            src={photoUrl}
            alt={tool.title || 'Tool'}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          renderFallbackPlate(tool.category || '', tool.title || '')
        )}
        <span style={{ position: 'absolute', top: '8px', left: '8px', padding: '2px 7px', borderRadius: '5px', backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)', fontSize: '9.5px', color: '#F59E0B', fontFamily: 'monospace', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
          CATALOG #{String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Content */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Category Pill */}
        <div style={{ fontSize: '9.5px', fontFamily: 'monospace', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
          {tool.category || 'FARMING HERITAGE'}
        </div>

        {/* Khmer Title */}
        <h3 style={{ fontSize: '18px', color: '#FFFFFF', margin: '0 0 2px 0', fontWeight: '500', lineHeight: 1.35, fontFamily: 'var(--font-serif), Georgia, serif' }}>
          {tool.title}
        </h3>

        {/* English Name Subtitle */}
        {tool.english_name && (
          <div style={{ fontSize: '12px', color: '#F59E0B', fontStyle: 'italic', marginBottom: '8px', fontFamily: 'var(--font-serif), Georgia, serif' }}>
            {tool.english_name}
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: '12px', color: '#A8A29E', lineHeight: 1.5, margin: '0 0 10px 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {tool.description}
        </p>

        {/* Micro Badges (Material & Season) */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto', marginBottom: '6px' }}>
          {tool.material && (
            <span style={{ fontSize: '10px', color: '#C2410C', backgroundColor: 'rgba(194, 65, 12, 0.1)', border: '1px solid rgba(194, 65, 12, 0.25)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
              {tool.material.split('·')[0].trim()}
            </span>
          )}
          {tool.season && (
            <span style={{ fontSize: '10px', color: '#D97706', backgroundColor: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.25)', padding: '2px 6px', borderRadius: '4px', fontFamily: 'monospace' }}>
              {tool.season.split('(')[0].trim()}
            </span>
          )}
        </div>

      </div>

      {/* Card Footer with Clean Map Pin SVG (ZERO EMOJIS) */}
      <div style={{ borderTop: '1px solid #281D17', paddingTop: '10px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11.5px', color: '#A8A29E' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
          <svg style={{ width: '12px', height: '12px', color: '#EA580C' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {tool.place ? tool.place.split(',')[0].trim() : 'Kampong Cham'}
        </span>
        <span style={{ color: '#F59E0B', fontWeight: '600' }}>Inspect &rarr;</span>
      </div>
    </div>
  );
}
