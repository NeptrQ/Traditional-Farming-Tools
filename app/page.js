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
    english_name: 'Traditional Kokir Ox Plough',
    category: 'SOIL PREPARATION',
    season_id: 'SOIL',
    season: 'Early Monsoon (May - June)',
    material: 'Kokir Ironwood · Spring Steel Tip',
    place: 'Kampong Siem, Kampong Cham',
    description: 'Carved from aged Kokir ironwood. Specially angled to slice 20cm deep into sticky basalt red soil without snapping under draft tension.',
    photo_url: '/images/traditional_plough.jpg',
    status: 'published'
  },
  {
    id: '2',
    title: 'រាស់ឈើបុរាណ',
    english_name: '7-Tooth Ironwood Harrow',
    category: 'LEVELING FIELD',
    season_id: 'SOIL',
    season: 'Field Leveling (June)',
    material: 'Ironwood Frame · Chiseled Teeth',
    place: 'Batheay, Kampong Cham',
    description: 'Hand-chiseled ironwood comb with 7 teeth that pulverize hardened mud clods so baby rice seedlings can take root and breathe.',
    photo_url: '',
    status: 'published'
  },
  {
    id: '3',
    title: 'នឹមគោភ្លោះ',
    english_name: 'Double Ox Yoke',
    category: 'OXEN HARNESS',
    season_id: 'STORAGE',
    season: 'Plowing Season (May - July)',
    material: 'Curved Tamarind Wood · Rawhide Ties',
    place: 'Kampong Siem, Kampong Cham',
    description: 'Curved neck beam designed to balance pulling tension across twin draft cattle over 8 continuous hours of muddy drag.',
    photo_url: '',
    status: 'published'
  },
  {
    id: '4',
    title: 'ចបកាប់ដីក្រហម',
    english_name: 'Heavy Basalt Field Hoe',
    category: 'CANAL DITCHING',
    season_id: 'SOIL',
    season: 'Dike Maintenance (Monsoon)',
    material: 'Blacksmith Carbon Steel · Tamarind Shaft',
    place: 'Prey Chhor, Kampong Cham',
    description: 'Heavy steel blade hand-forged by village blacksmiths for digging irrigation ditches and repairing earthen paddy bunds.',
    photo_url: '',
    status: 'published'
  },
  {
    id: '5',
    title: 'រទេះគោបុរាណ',
    english_name: 'Traditional Ox Cart',
    category: 'HAULING HARVEST',
    season_id: 'STORAGE',
    season: 'Harvest Hauling (Nov - Jan)',
    material: 'Solid Spoke Hubs · Woven Bamboo Rack',
    place: 'Chamkar Leu, Kampong Cham',
    description: 'Solid high-clearance spoke wheels engineered to roll through deep wet mud during monsoon season carrying 30 sacks of unhusked rice.',
    photo_url: '',
    status: 'published'
  },
  {
    id: '6',
    title: 'កណ្ដៀវច្រូតស្រូវ',
    english_name: 'Serrated Harvest Sickle',
    category: 'CUTTING PADDY',
    season_id: 'HARVEST',
    season: 'Dry Season Harvest (Dec - Jan)',
    material: 'Serrated Blacksmith Steel · Bamboo Grip',
    place: 'Kang Meas, Kampong Cham',
    description: 'Fine-toothed curved steel blade forged to slice rice stalks in rapid one-handed sweeps during the golden dry season harvest.',
    photo_url: '',
    status: 'published'
  },
  {
    id: '7',
    title: 'អង្រែ និងកញ្ជើ',
    english_name: 'Woven Winnowing Platter',
    category: 'GRAIN SEPARATION',
    season_id: 'HARVEST',
    season: 'Grain Threshing (January)',
    material: 'Smoked Bamboo Splints · Rattan Trim',
    place: 'Cheung Prey, Kampong Cham',
    description: 'Woven bamboo platter tossed into evening Mekong breezes to separate empty husks from golden grain by natural aerodynamics.',
    photo_url: '',
    status: 'published'
  },
  {
    id: '8',
    title: 'ក្អមដីដុតបុរាណ',
    english_name: 'Porous Field Terracotta Pot',
    category: 'FIELD WATER',
    season_id: 'WATER',
    season: 'Midday Fieldwork (All Seasons)',
    material: 'Mekong River Basin Clay',
    place: 'Kampong Siem, Kampong Cham',
    description: 'Porous terracotta vessel that keeps well water icy cool under 38°C midday field heat through natural evaporative cooling.',
    photo_url: '',
    status: 'published'
  },
  {
    id: '9',
    title: 'ឈ្នាងដងត្រីស្រែ',
    english_name: 'Bamboo Fish Scoop Trap',
    category: 'MONSOON FORAGING',
    season_id: 'WATER',
    season: 'Flood Recession (Aug - Oct)',
    material: 'Fine Split Bamboo · Water Reed Mesh',
    place: 'Koh Sotin, Kampong Cham',
    description: 'Fine woven bamboo scoop used by farmers to catch climbing perch and mudfish swimming in flooded paddy furrows.',
    photo_url: '',
    status: 'published'
  },
  {
    id: '10',
    title: 'ជង្រុកស្រូវបុរាណ',
    english_name: 'High-Stilt Paddy Granary',
    category: 'GRAIN PRESERVATION',
    season_id: 'STORAGE',
    season: 'Year-Round Safe Storage',
    material: 'Elevated Hardwood Stilts · Lime Mortar',
    place: 'Srei Santhor, Kampong Cham',
    description: 'Elevated wooden granary built high on stilts with natural lime plaster to protect stored rice from monsoon damp, insects, and mice.',
    photo_url: '',
    status: 'published'
  }
];

// Authentic Oral Field Tape Recordings from Kampong Cham Elders
const ORAL_TAPES = [
  {
    id: 1,
    speaker: 'Grandfather Sok (84 years old)',
    village: 'Kampong Siem District, Kampong Cham',
    title: 'Reading the Morning Star (មើលផ្កាយព្រឹក) to Begin Plowing',
    khmerQuote: '« នង្គ័លនេះ ធ្វើពីឈើគគីររឹងមាំណាស់ ប្រើជាមួយគោមួយនឹម ភ្ជួរតាំងពីដីរឹងរហូតដល់ភ្លៀងធ្លាក់ដំបូង... ជីតាតែងតែបង្រៀនឱ្យមើលរដូវតាមផ្កាយព្រឹក ដើម្បីដឹងថាតើពេលណាត្រូវទម្លាក់នង្គ័លចុះក្នុងស្រែ »',
    engContext: 'Grandfather Sok explains how elders judged the exact week to hitch cattle by observing astronomical alignments above the Mekong horizon before monsoon downpours flooded the basalt paddies.'
  },
  {
    id: 2,
    speaker: 'Grandmother Yan (78 years old)',
    village: 'Kang Meas District, Kampong Cham',
    title: 'The Sweep Rhythm of the Serrated Sickle (កណ្ដៀវច្រូតស្រូវ)',
    khmerQuote: '« កណ្ដៀវច្រូតស្រូវនេះ ដំដោយជាងដែកភូមិ មានធ្មេញតូចៗដូចធ្មេញត្រីឆ្លាម។ ពេលច្រូតត្រូវកាន់មួយកណ្តាប់ដៃ ហើយកាត់ដោយចលនាតែមួយ កុំឱ្យជ្រុះគ្រាប់ស្រូវមាសលើដីស្រែ »',
    engContext: 'Grandmother Yan recounts the harvest chants synchronized with the sickle sweep to reap thirty bushels of jasmine rice in late December without shattering fragile grains.'
  },
  {
    id: 3,
    speaker: 'Master Blacksmith Kong (72 years old)',
    village: 'Prey Chhor District, Kampong Cham',
    title: 'Tempering Spring Steel for Sticky Basalt Red Clay (ដីក្រហមបាសាល់)',
    khmerQuote: '« ដីក្រហមកំពង់ចាមស្វិតណាស់! បើប្រើដែកធម្មតា ភ្ជួរតែកន្លះថ្ងៃគឺបាក់ឬរេចរឹលអស់ហើយ។ ជាងដែកត្រូវយកដែកថែបដំកម្តៅឡើងក្រហមដូចផ្លេកបន្ទោរ ហើយជ្រលក់ក្នុងទឹកប្រេងរុក្ខជាតិទើបធន់មិនកោង »',
    engContext: 'Master Kong details the secret botanical oil quenching technique that keeps ploughshares razor-sharp against volcanic basalt silica without snapping under 400kg oxen drag.'
  }
];

export default function HomePage() {
  const [entries, setEntries] = useState(DEFAULT_TOOLS);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [activeTapeIndex, setActiveTapeIndex] = useState(0);
  const [isTapePlaying, setIsTapePlaying] = useState(true);
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
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        if (result && result.data && result.data.length > 0) {
          // Clean out test junk from early lab practice (e.g. 'j', 'Feet')
          const validPublic = result.data.filter(
            (item) => item.title && item.title.trim().length > 1 && item.title.toLowerCase() !== 'feet' && item.title.toLowerCase() !== 'test'
          );

          // Merge local photo for plough if not present
          const enhanced = (validPublic.length > 0 ? validPublic : result.data).map((item) => {
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

  // Track scroll direction for bi-directional fluid entrance
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
    if (activeFilter === 'WATER') {
      return matchesSearch && (cat.includes('water') || cat.includes('flood') || cat.includes('foraging') || title.includes('ស្នប់') || title.includes('ឈ្នាង') || title.includes('ក្អម') || title.includes('scoop') || title.includes('pot'));
    }
    if (activeFilter === 'HARVEST') {
      return matchesSearch && (cat.includes('harvest') || cat.includes('grain') || title.includes('កណ្ដៀវ') || title.includes('អង្រែ') || title.includes('កញ្ជើ') || title.includes('sickle') || title.includes('winnowing'));
    }
    if (activeFilter === 'STORAGE') {
      return matchesSearch && (cat.includes('ox') || cat.includes('harness') || cat.includes('storage') || cat.includes('hauling') || title.includes('នឹម') || title.includes('រទេះ') || title.includes('ជង្រុក') || title.includes('yoke') || title.includes('cart') || title.includes('granary'));
    }
    return matchesSearch;
  });

  // Smooth scroll and set filter when clicking a Pillar card
  const handlePillarClick = (filterName) => {
    setActiveFilter(filterName);
    const archiveEl = document.getElementById('archive');
    if (archiveEl) {
      archiveEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // BI-DIRECTIONAL SCROLL REVEAL OBSERVER
  useEffect(() => {
    const observer = new IntersectionObserver(
      (items) => {
        items.forEach((item) => {
          if (item.isIntersecting) {
            item.target.classList.add('in-view');
          } else {
            item.target.classList.remove('in-view');
          }
        });
      },
      {
        threshold: 0.05,
        rootMargin: '60px 0px 60px 0px'
      }
    );

    const targets = document.querySelectorAll('.reveal-on-scroll');
    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [filteredEntries]);

  const activeTape = ORAL_TAPES[activeTapeIndex];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F4EE', color: '#191614', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Subtle Sunlight Glow & Canvas Particles */}
      <AtmosphereCanvas />

      {/* Main Content Container */}
      <main style={{ maxWidth: '1160px', margin: '0 auto', padding: '16px 24px 80px 24px', position: 'relative', zIndex: 10 }}>

        {/* ======================================================== */}
        {/* SECTION 1: PANORAMIC EDITORIAL HERO                      */}
        {/* ======================================================== */}
        <section id="overview" className="reveal-on-scroll in-view" style={{ textAlign: 'center', padding: '48px 0 72px 0', position: 'relative' }}>
          
          {/* Giant Background Watermark */}
          <div className="watermark-hero">LIVING SOIL</div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            
            {/* Pill Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: '9999px', backgroundColor: '#FFFFFF', border: '1px solid rgba(40, 28, 18, 0.14)', color: '#C2410C', fontSize: '11px', fontFamily: 'monospace', marginBottom: '22px', boxShadow: '0 4px 12px rgba(40, 28, 18, 0.03)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EA580C' }}></span>
              <span>KAMPONG CHAM ORAL ANTHROPOLOGY · 10 CANONICAL IMPLEMENTS</span>
            </div>

            {/* Unique Headline (Completely original, NO friend's copy) */}
            <h1 style={{ fontSize: 'clamp(42px, 6.2vw, 76px)', fontWeight: 400, color: '#191614', margin: '0 auto 16px auto', lineHeight: 1.08, fontFamily: 'var(--font-serif), Georgia, serif', maxWidth: '920px', letterSpacing: '-0.02em' }}>
              The living soil of <span style={{ color: '#EA580C', fontStyle: 'italic', textDecoration: 'underline', textDecorationColor: 'rgba(234, 88, 12, 0.3)', textUnderlineOffset: '8px' }}>Kampong Cham Province</span>.
            </h1>

            {/* Khmer Subtitle */}
            <p style={{ color: '#D97706', fontStyle: 'italic', fontSize: 'clamp(16px, 2.2vw, 21px)', lineHeight: 1.6, margin: '0 auto 16px auto', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
              « រំលឹកដង្ហើមស្រែដូនតា និងកេរ្តិ៍ដំណែលឧបករណ៍កសិកម្មបុរាណ លើទឹកដីដីក្រហម »
            </p>

            {/* Subheading Narrative */}
            <p style={{ color: '#6B635B', fontSize: '15px', lineHeight: 1.65, margin: '0 auto 36px auto', maxWidth: '660px' }}>
              Ten ancestral ironwood implements hand-carved by village elders to till heavy volcanic basalt clay before mechanized tractors replaced generational oral memory along the Mekong River.
            </p>

            {/* ======================================================== */}
            {/* CENTERPIECE PEDESTAL STAGE WITH INTERACTIVE HOTSPOTS     */}
            {/* ======================================================== */}
            <div
              style={{
                maxWidth: '960px',
                margin: '0 auto',
                borderRadius: '28px',
                overflow: 'hidden',
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(40, 28, 18, 0.12)',
                boxShadow: '0 28px 60px -15px rgba(40, 28, 18, 0.14)',
                position: 'relative'
              }}
            >
              {/* Photo Showcase Area */}
              <div style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden', backgroundColor: '#0B0907' }}>
                <img
                  src="/images/traditional_plough.jpg"
                  alt="Traditional Kokir Plough"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {/* Hotspot 1: Kokir Beam */}
                <button
                  type="button"
                  className={`hotspot-pin ${activeHotspot === 1 ? 'active' : ''}`}
                  style={{ top: '34%', left: '27%' }}
                  onClick={() => setActiveHotspot(activeHotspot === 1 ? null : 1)}
                  aria-label="Kokir Wood Shank Anatomy"
                >
                  1
                </button>

                {/* Hotspot 2: Spring Steel Share */}
                <button
                  type="button"
                  className={`hotspot-pin ${activeHotspot === 2 ? 'active' : ''}`}
                  style={{ top: '68%', left: '68%' }}
                  onClick={() => setActiveHotspot(activeHotspot === 2 ? null : 2)}
                  aria-label="Forged Steel Share Anatomy"
                >
                  2
                </button>

                {/* Hotspot 3: Draft Pull Line */}
                <button
                  type="button"
                  className={`hotspot-pin ${activeHotspot === 3 ? 'active' : ''}`}
                  style={{ top: '22%', left: '56%' }}
                  onClick={() => setActiveHotspot(activeHotspot === 3 ? null : 3)}
                  aria-label="Ox Draft Pull Bar Anatomy"
                >
                  3
                </button>

                {/* Floating Hotspot Inspection Popover */}
                {activeHotspot && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '24px',
                      left: '24px',
                      right: '24px',
                      backgroundColor: 'rgba(25, 22, 20, 0.94)',
                      backdropFilter: 'blur(16px)',
                      borderRadius: '18px',
                      padding: '18px 22px',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      boxShadow: '0 16px 36px rgba(0,0,0,0.4)',
                      zIndex: 30,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {activeHotspot === 1 && 'ANATOMICAL COMPONENT 01 · ឈើគគីរ (BEAM SHANK)'}
                        {activeHotspot === 2 && 'ANATOMICAL COMPONENT 02 · ចង្អុលដែកថែប (STEEL WEDGE)'}
                        {activeHotspot === 3 && 'ANATOMICAL COMPONENT 03 · នឹម & ខ្សែទាញ (DRAUGHT LINE)'}
                      </span>
                      <h4 style={{ fontSize: '17px', margin: '2px 0 4px 0', color: '#FFFFFF', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                        {activeHotspot === 1 && 'Curved Kokir Ironwood Shank (Hopea odorata)'}
                        {activeHotspot === 2 && 'Hand-Forged Spring Steel Share (32° Soil Incline)'}
                        {activeHotspot === 3 && 'Twin Oxen Rawhide Draft Line (400kg Drag Balancing)'}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#D6D3D1', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
                        {activeHotspot === 1 && 'Naturally cured for three dry seasons. High fiber density prevents snapping when buffaloes lurch against embedded basalt granite boulders.'}
                        {activeHotspot === 2 && 'Village blacksmiths temper carbon spring steel in botanical oil baths to achieve 58 HRC hardness, slicing 20cm deep through sticky clay.'}
                        {activeHotspot === 3 && 'Rawhide lashings absorb sudden shock loads, protecting the necks of working oxen while maintaining a straight plough furrow across flooded paddies.'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedEntry(entries[0] || DEFAULT_TOOLS[0])}
                        style={{
                          padding: '7px 16px',
                          borderRadius: '9999px',
                          backgroundColor: '#EA580C',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Inspect Full Dossier &rarr;
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveHotspot(null)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(255,255,255,0.15)',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Pedestal Bottom Metadata Bar */}
              <div
                style={{
                  padding: '22px 28px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  backgroundColor: '#FFFFFF',
                  borderTop: '1px solid rgba(40, 28, 18, 0.08)',
                  textAlign: 'left'
                }}
              >
                <div>
                  <span style={{ fontSize: '10.5px', fontFamily: 'monospace', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '1.2px', display: 'block' }}>
                    CANONICAL ARTIFACT #01 · MONSOON TILLING
                  </span>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#191614', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                    នង្គ័លបុរាណ (Traditional Kokir Ox Plough)
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ borderLeft: '2px solid rgba(40, 28, 18, 0.1)', paddingLeft: '14px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6B635B', textTransform: 'uppercase' }}>PROVENANCE</span>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#191614' }}>Kampong Siem (ដីក្រហម)</div>
                  </div>

                  <div style={{ borderLeft: '2px solid rgba(40, 28, 18, 0.1)', paddingLeft: '14px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6B635B', textTransform: 'uppercase' }}>DRAUGHT FORCE</span>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#191614' }}>~400kg Drag · Twin Oxen</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedEntry(entries[0] || DEFAULT_TOOLS[0])}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '9999px',
                      backgroundColor: '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.35)',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    Examine Anatomy &rarr;
                  </button>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 2: FOUR AGRICULTURAL PILLARS (3D PERSPECTIVE)    */}
        {/* ======================================================== */}
        <section id="pillars" className="reveal-on-scroll" style={{ padding: '72px 0 56px 0', position: 'relative' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '44px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', color: '#EA580C', display: 'block', marginBottom: '8px' }}>
              FOUR PILLARS OF ANCESTRAL FARMING
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 400, margin: '0 0 10px 0', color: '#191614' }}>
              The Seasonal Rice Calendar &amp; Village Engineering
            </h2>
            <p style={{ color: '#6B635B', fontSize: '14.5px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
              Tools curated by their functional phase across the monsoon floodwaters and dry harvest cycles. Click any pillar to filter the archive below.
            </p>
          </div>

          {/* 4 Perspective Cards with Hypnotic Radiating Circles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '22px' }}>
            
            {/* Pillar 1: Soil Prep */}
            <div
              className={`pillar-card ${activeFilter === 'SOIL' ? 'active' : ''}`}
              onClick={() => handlePillarClick('SOIL')}
            >
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #F97316 0%, #EA580C 50%, #9A3412 100%)', boxShadow: '0 12px 28px rgba(234, 88, 12, 0.3)' }}>
                <svg width="56" height="56" viewBox="0 0 100 100" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                  <circle cx="50" cy="50" r="12" strokeDasharray="3,3" />
                  <circle cx="50" cy="50" r="26" />
                  <circle cx="50" cy="50" r="40" strokeDasharray="4,4" />
                  <line x1="12" y1="50" x2="88" y2="50" strokeWidth="2" />
                </svg>
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                PHASE 01 · MAY - JUNE
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#191614', margin: '0 0 4px 0', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                ភ្ជួររាស់ដីក្រហម
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6B635B', margin: '0 0 14px 0' }}>
                Tilling Basalt Red Earth
              </p>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#F7F4EE', color: '#191614', border: '1px solid rgba(40,28,18,0.1)' }}>
                នង្គ័ល · រាស់ · នឹម
              </span>
            </div>

            {/* Pillar 2: Water & Planting */}
            <div
              className={`pillar-card ${activeFilter === 'WATER' ? 'active' : ''}`}
              onClick={() => handlePillarClick('WATER')}
            >
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #06B6D4 0%, #0284C7 50%, #0369A1 100%)', boxShadow: '0 12px 28px rgba(2, 132, 199, 0.3)' }}>
                <svg width="56" height="56" viewBox="0 0 100 100" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                  <path d="M 50,15 C 30,45 20,60 20,72 C 20,88 34,95 50,95 C 66,95 80,88 80,72 C 80,60 70,45 50,15 Z" />
                  <circle cx="50" cy="72" r="12" strokeDasharray="2,2" />
                </svg>
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#0284C7', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                PHASE 02 · JULY - SEPT
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#191614', margin: '0 0 4px 0', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                ទឹក &amp; ការស្ទូង
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6B635B', margin: '0 0 14px 0' }}>
                Irrigation &amp; Monsoon Flood
              </p>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#F7F4EE', color: '#191614', border: '1px solid rgba(40,28,18,0.1)' }}>
                ស្នប់បាចទឹក · ឈ្នាង
              </span>
            </div>

            {/* Pillar 3: Harvest */}
            <div
              className={`pillar-card ${activeFilter === 'HARVEST' ? 'active' : ''}`}
              onClick={() => handlePillarClick('HARVEST')}
            >
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #FBBF24 0%, #F59E0B 50%, #B45309 100%)', boxShadow: '0 12px 28px rgba(245, 158, 11, 0.3)' }}>
                <svg width="56" height="56" viewBox="0 0 100 100" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                  <circle cx="50" cy="50" r="14" />
                  <path d="M 50,10 L 50,30 M 50,70 L 50,90 M 10,50 L 30,50 M 70,50 L 90,50" />
                  <path d="M 22,22 L 36,36 M 64,64 L 78,78 M 22,78 L 36,64 M 64,36 L 78,22" />
                </svg>
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#B45309', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                PHASE 03 · NOV - JAN
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#191614', margin: '0 0 4px 0', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                ច្រូតកាត់រដូវប្រមូលផល
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6B635B', margin: '0 0 14px 0' }}>
                Dry Season Harvest &amp; Winnowing
              </p>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#F7F4EE', color: '#191614', border: '1px solid rgba(40,28,18,0.1)' }}>
                កណ្ដៀវ · អង្រែ · កញ្ជើ
              </span>
            </div>

            {/* Pillar 4: Storage & Cart */}
            <div
              className={`pillar-card ${activeFilter === 'STORAGE' ? 'active' : ''}`}
              onClick={() => handlePillarClick('STORAGE')}
            >
              <div style={{ width: '110px', height: '110px', borderRadius: '50%', marginBottom: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #A855F7 0%, #7E22CE 50%, #581C87 100%)', boxShadow: '0 12px 28px rgba(126, 34, 206, 0.3)' }}>
                <svg width="56" height="56" viewBox="0 0 100 100" fill="none" stroke="#FFFFFF" strokeWidth="2.5">
                  <polygon points="50,15 85,50 50,85 15,50" />
                  <polygon points="50,30 70,50 50,70 30,50" strokeDasharray="2,2" />
                  <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
                </svg>
              </div>
              <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#7E22CE', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                PHASE 04 · YEAR-ROUND
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#191614', margin: '0 0 4px 0', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                ជង្រុក &amp; ការដឹកជញ្ជូន
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6B635B', margin: '0 0 14px 0' }}>
                Storage &amp; Draft Transport
              </p>
              <span style={{ fontSize: '11px', fontFamily: 'monospace', padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#F7F4EE', color: '#191614', border: '1px solid rgba(40,28,18,0.1)' }}>
                រទេះគោ · ជង្រុកស្រូវ
              </span>
            </div>

          </div>

        </section>

        {/* ======================================================== */}
        {/* SECTION 3: VINTAGE ORAL HISTORY FIELD RECORDER TAPE      */}
        {/* ======================================================== */}
        <section id="tape" className="reveal-on-scroll" style={{ padding: '60px 0 80px 0' }}>
          
          <div
            style={{
              maxWidth: '920px',
              margin: '0 auto',
              backgroundColor: '#191614',
              borderRadius: '28px',
              padding: '36px 40px',
              color: '#F5EBE1',
              boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
              border: '1px solid #3A3129',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Reel-to-Reel Background Mechanism */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #332B25', paddingBottom: '18px', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* Twin Rotating Spools */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg className={isTapePlaying ? 'tape-spool-rotating' : ''} width="32" height="32" viewBox="0 0 100 100" fill="none" stroke="#F59E0B" strokeWidth="4">
                    <circle cx="50" cy="50" r="46" />
                    <circle cx="50" cy="50" r="14" fill="#F59E0B" />
                    <line x1="50" y1="4" x2="50" y2="36" />
                    <line x1="50" y1="64" x2="50" y2="96" />
                    <line x1="4" y1="50" x2="36" y2="50" />
                    <line x1="64" y1="50" x2="96" y2="50" />
                  </svg>
                  <svg className={isTapePlaying ? 'tape-spool-rotating' : ''} width="32" height="32" viewBox="0 0 100 100" fill="none" stroke="#EA580C" strokeWidth="4">
                    <circle cx="50" cy="50" r="46" />
                    <circle cx="50" cy="50" r="14" fill="#EA580C" />
                    <line x1="50" y1="4" x2="50" y2="36" />
                    <line x1="50" y1="64" x2="50" y2="96" />
                    <line x1="4" y1="50" x2="36" y2="50" />
                    <line x1="64" y1="50" x2="96" y2="50" />
                  </svg>
                </div>

                <div>
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#F59E0B', letterSpacing: '1.5px', textTransform: 'uppercase', display: 'block' }}>
                    FIELD RECORDING ARCHIVE · REEL 01
                  </span>
                  <span style={{ fontSize: '12px', color: '#A8A29E', fontFamily: 'monospace' }}>
                    MEKONG BASIN ORAL EXPEDITION · TAPE #{activeTape.id}
                  </span>
                </div>
              </div>

              {/* Sound Equalizer Bars & Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '20px' }}>
                  <div className={`sound-bar eq-bar-1`} style={{ width: '3px', backgroundColor: '#EA580C', borderRadius: '2px' }} />
                  <div className={`sound-bar eq-bar-2`} style={{ width: '3px', backgroundColor: '#EA580C', borderRadius: '2px' }} />
                  <div className={`sound-bar eq-bar-3`} style={{ width: '3px', backgroundColor: '#EA580C', borderRadius: '2px' }} />
                  <div className={`sound-bar eq-bar-4`} style={{ width: '3px', backgroundColor: '#EA580C', borderRadius: '2px' }} />
                  <div className={`sound-bar eq-bar-5`} style={{ width: '3px', backgroundColor: '#EA580C', borderRadius: '2px' }} />
                  <div className={`sound-bar eq-bar-6`} style={{ width: '3px', backgroundColor: '#EA580C', borderRadius: '2px' }} />
                </div>

                <button
                  type="button"
                  onClick={() => setIsTapePlaying(!isTapePlaying)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontSize: '11.5px',
                    fontFamily: 'monospace',
                    cursor: 'pointer'
                  }}
                >
                  {isTapePlaying ? 'PAUSE SPOOL' : 'RESUME TAPE'}
                </button>
              </div>

            </div>

            {/* Tape Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
              {ORAL_TAPES.map((tape, idx) => (
                <button
                  key={tape.id}
                  type="button"
                  onClick={() => setActiveTapeIndex(idx)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: activeTapeIndex === idx ? '#EA580C' : 'rgba(255,255,255,0.08)',
                    color: activeTapeIndex === idx ? '#FFFFFF' : '#D6D3D1',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Tape 0{tape.id}: {tape.speaker.split('(')[0].trim()}
                </button>
              ))}
            </div>

            {/* Tape Transcript Quote */}
            <div style={{ minHeight: '120px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                RECORDED TESTIMONY · {activeTape.village}
              </div>

              <p style={{ fontFamily: 'var(--font-khmer-title), Georgia, serif', fontSize: 'clamp(17px, 2.3vw, 21px)', lineHeight: 1.7, color: '#FED7AA', margin: '0 0 14px 0' }}>
                {activeTape.khmerQuote}
              </p>

              <p style={{ fontSize: '13px', color: '#A8A29E', lineHeight: 1.6, margin: '0 0 14px 0', maxWidth: '780px' }}>
                {activeTape.engContext}
              </p>

              <div style={{ fontSize: '12px', color: '#F59E0B', fontFamily: 'monospace' }}>
                Speaker: {activeTape.speaker} · {activeTape.title}
              </div>
            </div>

          </div>

        </section>

        {/* ======================================================== */}
        {/* SECTION 4: THE "VISUAL ARCHIVE" GALLERY (PRATHAM STYLE)  */}
        {/* ======================================================== */}
        <section id="archive" className="reveal-on-scroll" style={{ padding: '60px 0 84px 0', position: 'relative' }}>
          
          {/* Watermark in background */}
          <div className="watermark-archive">VISUAL ARCHIVE</div>

          <div style={{ textAlign: 'center', marginBottom: '36px', position: 'relative', zIndex: 10 }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', color: '#EA580C', display: 'block', marginBottom: '8px' }}>
              MUSEUM SPECIMEN TRAYS
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 400, margin: '0 0 10px 0', color: '#191614' }}>
              The 10 Living Implements
            </h2>
            <p style={{ color: '#6B635B', fontSize: '14.5px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
              Asymmetric museum exhibit plates documenting oral interviews, wood species, and red-soil tension mechanics.
            </p>
          </div>

          {/* Controls Bar: Filter Pills & Live Search */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 10 }}>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setActiveFilter('ALL')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  border: activeFilter === 'ALL' ? '1px solid #191614' : '1px solid rgba(40, 28, 18, 0.16)',
                  backgroundColor: activeFilter === 'ALL' ? '#191614' : '#FFFFFF',
                  color: activeFilter === 'ALL' ? '#FFFFFF' : '#6B635B',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                ALL ({entries.length || 10})
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('SOIL')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  border: activeFilter === 'SOIL' ? '1px solid #EA580C' : '1px solid rgba(40, 28, 18, 0.16)',
                  backgroundColor: activeFilter === 'SOIL' ? '#EA580C' : '#FFFFFF',
                  color: activeFilter === 'SOIL' ? '#FFFFFF' : '#6B635B',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                I. Soil Prep
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('WATER')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  border: activeFilter === 'WATER' ? '1px solid #0284C7' : '1px solid rgba(40, 28, 18, 0.16)',
                  backgroundColor: activeFilter === 'WATER' ? '#0284C7' : '#FFFFFF',
                  color: activeFilter === 'WATER' ? '#FFFFFF' : '#6B635B',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                II. Planting &amp; Water
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('HARVEST')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  border: activeFilter === 'HARVEST' ? '1px solid #D97706' : '1px solid rgba(40, 28, 18, 0.16)',
                  backgroundColor: activeFilter === 'HARVEST' ? '#D97706' : '#FFFFFF',
                  color: activeFilter === 'HARVEST' ? '#FFFFFF' : '#6B635B',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                III. Harvest
              </button>
              <button
                type="button"
                onClick={() => setActiveFilter('STORAGE')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '9999px',
                  border: activeFilter === 'STORAGE' ? '1px solid #7E22CE' : '1px solid rgba(40, 28, 18, 0.16)',
                  backgroundColor: activeFilter === 'STORAGE' ? '#7E22CE' : '#FFFFFF',
                  color: activeFilter === 'STORAGE' ? '#FFFFFF' : '#6B635B',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                IV. Storage &amp; Cattle
              </button>
            </div>

            {/* Live Search */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder="ស្វែងរកឧបករណ៍... / Search tool, village..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 16px 9px 38px',
                  borderRadius: '9999px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(40, 28, 18, 0.16)',
                  color: '#191614',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: '#9CA3AF' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>

          </div>

          {/* Staggered Asymmetric Exhibit Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '26px',
            alignItems: 'stretch',
            position: 'relative',
            zIndex: 10
          }}>
            {filteredEntries.map((tool, idx) => (
              <ExhibitCard
                key={tool.id || idx}
                tool={tool}
                index={idx}
                onClick={() => setSelectedEntry(tool)}
              />
            ))}
          </div>

        </section>

        {/* ======================================================== */}
        {/* SECTION 5: ANCESTRAL WOODCRAFT TOOLKIT (PRATHAM TILES)   */}
        {/* ======================================================== */}
        <section id="materials" className="reveal-on-scroll" style={{ padding: '72px 0', borderTop: '1px solid rgba(40, 28, 18, 0.1)', borderBottom: '1px solid rgba(40, 28, 18, 0.1)', margin: '40px 0' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', color: '#EA580C', display: 'block', marginBottom: '8px' }}>
              VILLAGE METALLURGY &amp; CARPENTRY
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 400, margin: '0 0 10px 0', color: '#191614' }}>
              Materials of the Living Soil
            </h2>
            <p style={{ color: '#6B635B', fontSize: '14.5px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
              Natural timbers, hand-beaten carbon steel, and river clays selected by elders to endure monsoon moisture and volcanic grit.
            </p>
          </div>

          {/* Dynamic 3D Material Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'center' }}>
            
            <div className="tool-chip">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 20h16M4 4h16M8 4v16M16 4v16" />
                </svg>
              </div>
              <div>
                <strong>Kokir Ironwood (ឈើគគីរ)</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>High-density rot-resistant plough beams</div>
              </div>
            </div>

            <div className="tool-chip">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div>
                <strong>Forged Spring Steel (ដែកថែប)</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>Blacksmith sickle teeth &amp; hoe blades</div>
              </div>
            </div>

            <div className="tool-chip">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M7 7h10M7 17h10" />
                </svg>
              </div>
              <div>
                <strong>Smoked River Bamboo (ឫស្សី)</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>Flexible weave for winnowers &amp; traps</div>
              </div>
            </div>

            <div className="tool-chip">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 3v18M3 12h18" strokeDasharray="2,2" />
                </svg>
              </div>
              <div>
                <strong>Basalt Red Earth (ដីក្រហម)</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>Volcanic clay with 84% adhesion index</div>
              </div>
            </div>

            <div className="tool-chip">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <strong>Twin Draft Oxen (គោមួយនឹម)</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>Synchronous draft cattle navigation</div>
              </div>
            </div>

            <div className="tool-chip">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3h12l2 6H4l2-6zM4 9v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
                </svg>
              </div>
              <div>
                <strong>Mekong Terracotta (ដីដុតទន្លេ)</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>38°C natural evaporative water cooling</div>
              </div>
            </div>

          </div>

        </section>

        {/* ======================================================== */}
        {/* SECTION 6: CURATORIAL RESEARCH NOTE                      */}
        {/* ======================================================== */}
        <section className="reveal-on-scroll" style={{ padding: '40px 0 60px 0' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid rgba(40, 28, 18, 0.1)',
              borderRadius: '26px',
              padding: '36px',
              boxShadow: '0 20px 40px -10px rgba(40, 28, 18, 0.06)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block' }}>
                  CURATORIAL RESEARCH NOTE
                </span>
                <h3 style={{ fontSize: '22px', color: '#191614', margin: '4px 0 0 0', fontFamily: 'var(--font-serif), Georgia, serif' }}>
                  Oral Knowledge &amp; Agricultural Physics
                </h3>
              </div>

              {/* 3 Clickable Tabs */}
              <div style={{ display: 'flex', gap: '6px', padding: '4px', borderRadius: '12px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', fontSize: '12px', fontFamily: 'monospace' }}>
                <button
                  type="button"
                  onClick={() => setSpotlightTab('story')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: spotlightTab === 'story' ? '#FFFFFF' : 'transparent',
                    color: spotlightTab === 'story' ? '#EA580C' : '#6B635B',
                    fontWeight: spotlightTab === 'story' ? 'bold' : 'normal',
                    boxShadow: spotlightTab === 'story' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Oral Testimony
                </button>
                <button
                  type="button"
                  onClick={() => setSpotlightTab('season')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: spotlightTab === 'season' ? '#FFFFFF' : 'transparent',
                    color: spotlightTab === 'season' ? '#EA580C' : '#6B635B',
                    fontWeight: spotlightTab === 'season' ? 'bold' : 'normal',
                    boxShadow: spotlightTab === 'season' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Basalt Soil Dynamics
                </button>
                <button
                  type="button"
                  onClick={() => setSpotlightTab('craft')}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: spotlightTab === 'craft' ? '#FFFFFF' : 'transparent',
                    color: spotlightTab === 'craft' ? '#EA580C' : '#6B635B',
                    fontWeight: spotlightTab === 'craft' ? 'bold' : 'normal',
                    boxShadow: spotlightTab === 'craft' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Woodcraft Carpentry
                </button>
              </div>
            </div>

            {/* Tab Details */}
            <div style={{ minHeight: '70px', borderTop: '1px solid rgba(40, 28, 18, 0.08)', paddingTop: '16px' }}>
              {spotlightTab === 'story' && (
                <div>
                  <p style={{ margin: '0 0 6px 0', fontStyle: 'italic', fontSize: '15px', color: '#9A3412', lineHeight: 1.7, fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                    « នង្គ័លនេះ ធ្វើពីឈើគគីររឹងមាំណាស់ ប្រើជាមួយគោមួយនឹម ភ្ជួរតាំងពីដីរឹងរហូតដល់ភ្លៀងធ្លាក់ដំបូង... ជីតាតែងតែបង្រៀនឱ្យមើលរដូវតាមផ្កាយព្រឹក »
                  </p>
                  <span style={{ fontSize: '12px', color: '#6B635B', fontFamily: 'monospace' }}>
                    — Oral Memory from Grandfather Sok, Kampong Siem District, Kampong Cham Province
                  </span>
                </div>
              )}
              {spotlightTab === 'season' && (
                <div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#191614', lineHeight: 1.6 }}>
                    Deployed in <strong style={{ color: '#EA580C' }}>May - June</strong> when early rains soften basalt red clay before flooding. Basalt clay expands when saturated, requiring blade geometry with continuous 20cm curvature to prevent furrow clogging.
                  </p>
                  <span style={{ fontSize: '12px', color: '#6B635B', fontFamily: 'monospace' }}>
                    Basalt Red Clay (ដីក្រហមបាសាល់) · Silt Absorption Index 84%
                  </span>
                </div>
              )}
              {spotlightTab === 'craft' && (
                <div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#191614', lineHeight: 1.6 }}>
                    Hewn from curved <strong style={{ color: '#EA580C' }}>Kokir ironwood</strong> (Hopea odorata), naturally cured for 3 dry seasons. The leading wedge is hand-shod in blacksmith-hammered spring steel to resist abrasive volcanic grit.
                  </p>
                  <span style={{ fontSize: '12px', color: '#6B635B', fontFamily: 'monospace' }}>
                    Draft Tension: ~400kg continuous drag · Twin White Cattle Harness
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* SECTION 7: WARM TERRACOTTA HERITAGE CTA BANNER           */}
        {/* ======================================================== */}
        <section className="reveal-on-scroll" style={{ padding: '40px 0 60px 0' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 50%, #9A3412 100%)',
              borderRadius: '32px',
              padding: '60px 40px',
              color: '#FFFFFF',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 30px 60px -15px rgba(234, 88, 12, 0.35)'
            }}
          >
            <span style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase', color: '#FDE047', marginBottom: '12px', display: 'block' }}>
              FAMILY ORAL ARCHIVE · KAMPONG CHAM
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(36px, 5.5vw, 60px)', fontWeight: 400, margin: '0 0 12px 0', lineHeight: 1.1 }}>
              Before the Last Wooden Plough is Forgotten.
            </h2>
            <p style={{ fontFamily: 'var(--font-khmer-title), Georgia, serif', fontSize: '18px', color: '#FEF08A', margin: '0 0 20px 0' }}>
              « ជួយថែរក្សាកេរ្តិ៍ដំណែលឧបករណ៍កសិកម្មបុរាណ ដើម្បីកូនចៅជំនាន់ក្រោយ »
            </p>
            <p style={{ fontSize: '15px', maxWidth: '620px', margin: '0 auto 36px auto', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.92)' }}>
              Every village implement holds decades of oral weather lore, carpentry secrets, and communal solidarity. Contribute a tool from your family elders to our permanent collection.
            </p>
            <a
              href="/contribute"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '13px 30px',
                borderRadius: '9999px',
                backgroundColor: '#FFFFFF',
                color: '#9A3412',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 700,
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.boxShadow = '0 14px 32px rgba(0,0,0,0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
              }}
            >
              <span>+ Document a Family Implement</span>
              <span>&rarr;</span>
            </a>
          </div>
        </section>

      </main>

      {/* 8. Detail Modal Popup */}
      {selectedEntry && (
        <EntryModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}

    </div>
  );
}

// Compact, crisp Exhibit Card with Staggered Visual Frame
function ExhibitCard({ tool, index, onClick }) {
  const [imgFailed, setImgFailed] = useState(false);
  const photoUrl = tool.photo_url || tool.image_url;

  // Render authentic woodcraft silhouette plate for implements without photos
  const renderFallbackPlate = (category, title) => {
    const text = (category + ' ' + title).toLowerCase();
    let iconPath;

    if (text.includes('harrow') || text.includes('រាស់')) {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <rect x="18" y="26" width="64" height="8" rx="2" fill="rgba(234, 88, 12, 0.15)" />
          <line x1="24" y1="34" x2="24" y2="60" strokeLinecap="round" />
          <line x1="36" y1="34" x2="36" y2="60" strokeLinecap="round" />
          <line x1="50" y1="34" x2="50" y2="60" strokeLinecap="round" />
          <line x1="64" y1="34" x2="64" y2="60" strokeLinecap="round" />
          <line x1="76" y1="34" x2="76" y2="60" strokeLinecap="round" />
        </g>
      );
    } else if (text.includes('yoke') || text.includes('នឹម')) {
      iconPath = (
        <g stroke="#EA580C" strokeWidth="2.5" fill="none">
          <path d="M 12,46 Q 32,24 50,46 Q 68,24 88,46" strokeLinecap="round" strokeWidth="3.5" />
          <circle cx="30" cy="54" r="4" fill="#F59E0B" />
          <circle cx="70" cy="54" r="4" fill="#F59E0B" />
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
        background: 'radial-gradient(circle at center, #FDFBF7 0%, #F4EFEB 100%)',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Subtle Blueprint Grid */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(40, 28, 18, 0.08) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
          opacity: 0.5
        }} />

        {/* Faint Khmer Script Watermark */}
        <div style={{
          position: 'absolute',
          bottom: '6px',
          right: '10px',
          fontSize: '24px',
          fontFamily: 'var(--font-khmer-title), Georgia, serif',
          color: 'rgba(234, 88, 12, 0.08)',
          fontWeight: 'bold',
          userSelect: 'none',
          pointerEvents: 'none'
        }}>
          {tool.title}
        </div>

        {/* SVG Silhouette */}
        <svg style={{ width: '64px', height: '64px', filter: 'drop-shadow(0 0 6px rgba(234, 88, 12, 0.2))', position: 'relative', zIndex: 2 }} viewBox="0 0 100 80">
          {iconPath}
        </svg>
      </div>
    );
  };

  return (
    <div
      onClick={onClick}
      className="exhibit-card reveal-on-scroll"
    >
      {/* 180px Visual Frame */}
      <div style={{
        width: '100%',
        height: '180px',
        borderRadius: '16px',
        backgroundColor: '#F4EFEB',
        border: '1px solid rgba(40, 28, 18, 0.08)',
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
        <span style={{ position: 'absolute', top: '10px', left: '10px', padding: '3px 8px', borderRadius: '6px', backgroundColor: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(4px)', fontSize: '10px', color: '#191614', fontFamily: 'monospace', fontWeight: 600, border: '1px solid rgba(40, 28, 18, 0.1)' }}>
          #{String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Content */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Category Tag */}
        <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#EA580C', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
          {tool.category || 'FARMING HERITAGE'}
        </div>

        {/* Khmer Title */}
        <h3 style={{ fontSize: '20px', color: '#191614', margin: '0 0 2px 0', fontWeight: '700', lineHeight: 1.3, fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
          {tool.title}
        </h3>

        {/* English Name Subtitle */}
        {tool.english_name && (
          <div style={{ fontSize: '13px', color: '#B45309', fontStyle: 'italic', marginBottom: '8px', fontFamily: 'var(--font-serif), Georgia, serif' }}>
            {tool.english_name}
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: '12.5px', color: '#6B635B', lineHeight: 1.5, margin: '0 0 12px 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {tool.description}
        </p>

        {/* Micro Badges (Material & Season) */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto', marginBottom: '8px' }}>
          {tool.material && (
            <span style={{ fontSize: '10.5px', color: '#9A3412', backgroundColor: 'rgba(234, 88, 12, 0.08)', border: '1px solid rgba(234, 88, 12, 0.18)', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace' }}>
              {tool.material.split('·')[0].trim()}
            </span>
          )}
          {tool.season && (
            <span style={{ fontSize: '10.5px', color: '#B45309', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.18)', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace' }}>
              {tool.season.split('(')[0].trim()}
            </span>
          )}
        </div>

      </div>

      {/* Card Footer with Location, Contributor Credit & Inspect */}
      <div style={{ borderTop: '1px solid rgba(40, 28, 18, 0.08)', paddingTop: '10px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#6B635B' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <svg style={{ width: '12px', height: '12px', color: '#EA580C' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {tool.place ? tool.place.split(',')[0].trim() : 'Kampong Cham'}
          </span>
          {tool.contributor && (
            <span style={{ fontSize: '10.5px', color: '#B45309', fontFamily: 'monospace' }}>
              Contributor: {tool.contributor}
            </span>
          )}
        </div>
        <span style={{ color: '#EA580C', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          Inspect &rarr;
        </span>
      </div>
    </div>
  );
}
