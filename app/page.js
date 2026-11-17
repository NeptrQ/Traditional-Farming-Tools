'use client';

import { useEffect, useState } from 'react';
import AtmosphereCanvas from '../components/AtmosphereCanvas';
import EntryModal from '../components/EntryModal';
import { createClient } from '../utils/supabase/client';
import { isJunkEntry, resolveToolPhoto } from '../utils/toolImages';
import { useLanguage } from './LanguageContext';

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
    photo_url: '/images/ironwood_harrow.jpg',
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
    photo_url: '/images/double_ox_yoke.jpg',
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
    photo_url: '/images/basalt_field_hoe.jpg',
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
    photo_url: '/images/traditional_ox_cart.jpg',
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
    photo_url: '/images/harvest_sickle.jpg',
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
    photo_url: '/images/winnowing_platter.jpg',
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
    photo_url: '/images/terracotta_pot.jpg',
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
    photo_url: '/images/bamboo_fish_scoop.jpg',
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
    photo_url: '/images/paddy_granary.jpg',
    status: 'published'
  }
];

// Authentic Oral Field Tape Recordings from Kampong Cham Elders
const ORAL_TAPES = [
  {
    id: 1,
    speaker: 'Grandfather Sok (84 years old)',
    speakerKh: 'លោកតា សុខ (អាយុ ៨៤ ឆ្នាំ)',
    village: 'Kampong Siem District, Kampong Cham',
    villageKh: 'ស្រុកកំពង់សៀម ខេត្តកំពង់ចាម',
    title: 'Reading the Morning Star (មើលផ្កាយព្រឹក) to Begin Plowing',
    titleKh: 'មើលផ្កាយព្រឹក ដើម្បីទម្លាក់នង្គ័លចុះស្រែ',
    khmerQuote: '« នង្គ័លនេះ ធ្វើពីឈើគគីររឹងមាំណាស់ ប្រើជាមួយគោមួយនឹម ភ្ជួរតាំងពីដីរឹងរហូតដល់ភ្លៀងធ្លាក់ដំបូង... ជីតាតែងតែបង្រៀនឱ្យមើលរដូវតាមផ្កាយព្រឹក ដើម្បីដឹងថាតើពេលណាត្រូវទម្លាក់នង្គ័លចុះក្នុងស្រែ »',
    engContext: 'Grandfather Sok explains how elders judged the exact week to hitch cattle by observing astronomical alignments above the Mekong horizon before monsoon downpours flooded the basalt paddies.',
    khmerContext: 'លោកតា សុខ រៀបរាប់អំពីរបៀបដែលចាស់ទុំសង្កេតផ្កាយព្រឹកលើជើងមេឃដងទន្លេមេគង្គ ដើម្បីដឹងពីពេលវេលាច្បាស់លាស់ក្នុងការទឹមគោភ្ជួររាស់ មុនពេលភ្លៀងមូសុងធ្លាក់ជោកជាំលើដីក្រហម។'
  },
  {
    id: 2,
    speaker: 'Grandmother Yan (78 years old)',
    speakerKh: 'លោកយាយ យ៉ាន (អាយុ ៧៨ ឆ្នាំ)',
    village: 'Kang Meas District, Kampong Cham',
    villageKh: 'ស្រុកកងមាស ខេត្តកំពង់ចាម',
    title: 'The Sweep Rhythm of the Serrated Sickle (កណ្ដៀវច្រូតស្រូវ)',
    titleKh: 'ចង្វាក់ច្រូតកាត់ និងកណ្ដៀវធ្មេញត្រីឆ្លាម',
    khmerQuote: '« កណ្ដៀវច្រូតស្រូវនេះ ដំដោយជាងដែកភូមិ មានធ្មេញតូចៗដូចធ្មេញត្រីឆ្លាម។ ពេលច្រូតត្រូវកាន់មួយកណ្តាប់ដៃ ហើយកាត់ដោយចលនាតែមួយ កុំឱ្យជ្រុះគ្រាប់ស្រូវមាសលើដីស្រែ »',
    engContext: 'Grandmother Yan recounts the harvest chants synchronized with the sickle sweep to reap thirty bushels of jasmine rice in late December without shattering fragile grains.',
    khmerContext: 'លោកយាយ យ៉ាន រៀបរាប់អំពីចង្វាក់ច្រៀងពេលច្រូតកាត់ស្រែ និងរបៀបប្រើកណ្ដៀវដើម្បីច្រូតស្រូវផ្ការំដួល ៣០ ថាំង ដោយមិនឱ្យជ្រុះគ្រាប់ស្រូវលើដីស្រែ។'
  },
  {
    id: 3,
    speaker: 'Master Blacksmith Kong (72 years old)',
    speakerKh: 'ជាងដែក គង់ (អាយុ ៧២ ឆ្នាំ)',
    village: 'Prey Chhor District, Kampong Cham',
    villageKh: 'ស្រុកព្រៃឈរ ខេត្តកំពង់ចាម',
    title: 'Tempering Spring Steel for Sticky Basalt Red Clay (ដីក្រហមបាសាល់)',
    titleKh: 'ការដំដែកថែបមុខនង្គ័ល សម្រាប់ដីក្រហមបាសាល់',
    khmerQuote: '« ដីក្រហមកំពង់ចាមស្វិតណាស់! បើប្រើដែកធម្មតា ភ្ជួរតែកន្លះថ្ងៃគឺបាក់ឬរេចរឹលអស់ហើយ។ ជាងដែកត្រូវយកដែកថែបដំកម្តៅឡើងក្រហមដូចផ្លេកបន្ទោរ ហើយជ្រលក់ក្នុងទឹកប្រេងរុក្ខជាតិទើបធន់មិនកោង »',
    engContext: 'Master Kong details the secret botanical oil quenching technique that keeps ploughshares razor-sharp against volcanic basalt silica without snapping under 400kg oxen drag.',
    khmerContext: 'ជាងដែក គង់ បង្ហាញពីអាថ៌កំបាំងនៃការដំដែកថែប និងជ្រលក់ប្រេងរុក្ខជាតិ ដើម្បីឱ្យមុខនង្គ័លមុតស្រួចធន់នឹងដីក្រហមបាសាល់ ដោយមិនបាក់ក្រោមរង្វាស់កម្លាំងអូស ៤០០ គីឡូ។'
  }
];

// Complete authentic Khmer data mapping for living archive implements
const KHMER_TOOL_INFO = {
  '1': {
    title: 'នង្គ័លបុរាណឈើគគីរ',
    category: 'ភ្ជួររាស់ដីស្រែ',
    season: 'ដើមរដូវវស្សា (ឧសភា - មិថុនា)',
    material: 'ឈើគគីរ · ផ្លែដែកថែប',
    place: 'ស្រុកកំពង់សៀម ខេត្តកំពង់ចាម',
    description: 'ច្នៃចេញពីឈើគគីរចាស់។ មុំកោងពិសេសសម្រាប់កាត់ជម្រៅ ២០ សង់ទីម៉ែត្រចូលក្នុងដីក្រហមស្អិត ដោយមិនបាក់ក្រោមរង្វាស់កម្លាំងអូសទាញ។'
  },
  '2': {
    title: 'រាស់ឈើបុរាណ',
    category: 'រាស់បំបែកដី',
    season: 'រាស់ដីពង្រាប (មិថុនា)',
    material: 'តួឈើគគីរ · ធ្មេញឈើ ៧',
    place: 'ស្រុកបាធាយ ខេត្តកំពង់ចាម',
    description: 'រាស់ឈើគគីរមានធ្មេញ ៧ ច្នៃឡើងដោយដៃ ដើម្បីបំបែកដុំដីរឹងឱ្យម៉ដ្ឋល្អ សម្រាប់កូនសំណាបស្រូវដុះឫសស្រូបយកជីវជាតិ។'
  },
  '3': {
    title: 'នឹមគោភ្លោះ',
    category: 'នឹមទឹមគោ',
    season: 'រដូវភ្ជួររាស់ (ឧសភា - កក្កដា)',
    material: 'ឈើអំពិលកោង · ខ្សែស្បែកគោ',
    place: 'ស្រុកកំពង់សៀម ខេត្តកំពង់ចាម',
    description: 'ឈើនឹមទឹមស្មាកោង ច្នៃឡើងដើម្បីចែកចាយកម្លាំងទាញស្មើគ្នារវាងគោមួយនឹម ពេញមួយថ្ងៃ ៨ ម៉ោងលើដីភក់ល្បាប់។'
  },
  '4': {
    title: 'ចបកាប់ដីក្រហម',
    category: 'ចបកាប់ដី និងភ្លឺស្រែ',
    season: 'លើកភ្លឺស្រែ (រដូវវស្សា)',
    material: 'ដែកថែបដំដោយដៃ · ដងឈើអំពិល',
    place: 'ស្រុកព្រៃឈរ ខេត្តកំពង់ចាម',
    description: 'ផ្លែដែកថែបដំដោយដៃដោយជាងដែកភូមិ សម្រាប់ជីកប្រឡាយទឹក និងជួសជុលភ្លឺស្រែដីក្រហមក្នុងរដូវវស្សា។'
  },
  '5': {
    title: 'រទេះគោបុរាណ',
    category: 'រទេះដឹកជញ្ជូន',
    season: 'ដឹកជញ្ជូនស្រូវ (វិច្ឆិកា - មករា)',
    material: 'កង់កាំឈើរឹង · ទ្រុងឫស្សីត្បាញ',
    place: 'ស្រុកចំការលើ ខេត្តកំពង់ចាម',
    description: 'កង់រទេះឈើរឹងកម្ពស់ខ្ពស់ ច្នៃឡើងដើម្បីបរឆ្លងកាត់ភក់ជ្រៅក្នុងរដូវវស្សា ដោយផ្ទុកស្រូវសំបកបានរហូតដល់ ៣០ បាវ។'
  },
  '6': {
    title: 'កណ្ដៀវច្រូតស្រូវ',
    category: 'ច្រូតកាត់ស្រូវ',
    season: 'ប្រមូលផលរដូវប្រាំង (ធ្នូ - មករា)',
    material: 'ដែកថែបធ្មេញត្រីឆ្លាម · ដងឫស្សី',
    place: 'ស្រុកកងមាស ខេត្តកំពង់ចាម',
    description: 'ផ្លែដែកថែបកោងមានធ្មេញល្អិតៗដូចធ្មេញត្រីឆ្លាម ដំឡើងសម្រាប់ច្រូតកាត់ដើមស្រូវយ៉ាងរហ័សដោយដៃម្ខាងក្នុងរដូវប្រមូលផល។'
  },
  '7': {
    title: 'កញ្ជើបក់ស្រូវ',
    category: 'កញ្ជើ និងរោយស្រូវ',
    season: 'បោកបក់ស្រូវ (មករា)',
    material: 'បន្ទះឫស្សីរោលផ្សែង · គែមផ្តៅ',
    place: 'ស្រុកជើងព្រៃ ខេត្តកំពង់ចាម',
    description: 'កញ្ជើត្បាញពីបន្ទះឫស្សីរោលផ្សែង ប្រើសម្រាប់រោយបក់គ្រាប់ស្រូវក្នុងខ្យល់រដូវរំហើយ ដើម្បីញែកអង្កាមចេញពីគ្រាប់ស្រូវមាស។'
  },
  '8': {
    title: 'ក្អមដីដុតបុរាណ',
    category: 'ក្អមទឹកត្រជាក់',
    season: 'ការងារស្រែ (គ្រប់រដូវ)',
    material: 'ដីឥដ្ឋដុតមាត់ទន្លេមេគង្គ',
    place: 'ស្រុកកំពង់សៀម ខេត្តកំពង់ចាម',
    description: 'ក្អមដីដុតទន្លេជួយរក្សាទឹកអណ្តូងឱ្យត្រជាក់ស្រេបក្រោមអាកាសធាតុក្តៅ ៣៨°C តាមរយៈការភាយរំហួតធម្មជាតិ។'
  },
  '9': {
    title: 'ឈ្នាងដងត្រីស្រែ',
    category: 'ឈ្នាងដងត្រី',
    season: 'រដូវទឹកសម្រក (សីហា - តុលា)',
    material: 'បន្ទះឫស្សីត្បាញល្អិត',
    place: 'ស្រុកកោះសូទិន ខេត្តកំពង់ចាម',
    description: 'ឧបករណ៍ត្បាញពីបន្ទះឫស្សីល្អិតៗ ប្រើសម្រាប់ដងត្រីក្រាញ់ ត្រីឆ្លូញ និងត្រីរ៉ស់ ដែលហែលតាមប្រឡាយទឹកស្រែពេលទឹកស្រក។'
  },
  '10': {
    title: 'ជង្រុកស្រូវបុរាណ',
    category: 'ជង្រុកស្រូវ',
    season: 'រក្សាទុកពេញមួយឆ្នាំ',
    material: 'សសរឈើរឹងខ្ពស់ · កំបោរបាយអ',
    place: 'ស្រុកស្រីសន្ធរ ខេត្តកំពង់ចាម',
    description: 'ជង្រុកឈើសសរខ្ពស់ផុតពីដី លាបកំបោរបាយអធម្មជាតិ ដើម្បីការពារស្រូវទុកពីសំណើមរដូវវស្សា សត្វល្អិត និងកណ្ដុរ។'
  }
};

export default function HomePage() {
  const { lang } = useLanguage();
  const [entries, setEntries] = useState(DEFAULT_TOOLS);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [activeTapeIndex, setActiveTapeIndex] = useState(0);
  const [isTapePlaying, setIsTapePlaying] = useState(true);
  const [spotlightTab, setSpotlightTab] = useState('story'); // 'story' | 'season' | 'craft'

  const ploughEntry = entries.find((e) => e.title?.includes('នង្គ័ល') || e.title?.toLowerCase().includes('plough')) || DEFAULT_TOOLS[0];

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
          // Clean out test junk from early lab practice (e.g. 'j', 'Feet', 'test')
          const validPublic = result.data.filter((item) => !isJunkEntry(item));

          if (validPublic.length > 0) {
            // Map all canonical & submitted items to clean real photos
            const enhanced = validPublic.map((item) => ({
              ...item,
              photo_url: resolveToolPhoto(item),
            }));
            setEntries(enhanced);
          }
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
          <div className="watermark-hero">{lang === 'KH' ? 'ដីរស់' : 'LIVING SOIL'}</div>

          <div style={{ position: 'relative', zIndex: 2 }}>
            
            {/* Pill Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', padding: '6px 14px', borderRadius: '9999px', backgroundColor: '#FFFFFF', border: '1px solid rgba(40, 28, 18, 0.14)', color: '#C2410C', fontSize: '10.5px', fontFamily: 'monospace', marginBottom: '22px', boxShadow: '0 4px 12px rgba(40, 28, 18, 0.03)', maxWidth: '100%', boxSizing: 'border-box' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EA580C', flexShrink: 0 }}></span>
              <span>{lang === 'KH' ? 'នរវិទ្យាផ្ទាល់មាត់ខេត្តកំពង់ចាម · ឧបករណ៍ ១០ មុខ' : 'KAMPONG CHAM ORAL ANTHROPOLOGY · 10 IMPLEMENTS'}</span>
            </div>

            {/* Unique Headline (Khmer-first Dominance) */}
            <h1 style={{ fontSize: 'clamp(32px, 6.8vw, 70px)', fontWeight: 600, color: '#191614', margin: '0 auto 16px auto', lineHeight: 1.25, fontFamily: 'var(--font-khmer-title), var(--font-serif), Georgia, serif', maxWidth: '960px', letterSpacing: '-0.01em' }}>
              {lang === 'KH' ? (
                <>
                  ដីរស់នៃ<span style={{ color: '#EA580C', fontStyle: 'italic', textDecoration: 'underline', textDecorationColor: 'rgba(234, 88, 12, 0.3)', textUnderlineOffset: '8px' }}>ខេត្តកំពង់ចាម</span>
                </>
              ) : (
                <>
                  The living soil of <span style={{ color: '#EA580C', fontStyle: 'italic', textDecoration: 'underline', textDecorationColor: 'rgba(234, 88, 12, 0.3)', textUnderlineOffset: '8px' }}>Kampong Cham Province</span>.
                  <span style={{ display: 'block', fontSize: 'clamp(18px, 3.4vw, 30px)', fontWeight: 500, color: '#D97706', marginTop: '8px', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                    ដីរស់នៃខេត្តកំពង់ចាម
                  </span>
                </>
              )}
            </h1>

            {/* Khmer Subtitle */}
            <p style={{ color: '#D97706', fontStyle: 'italic', fontSize: 'clamp(16px, 2.2vw, 21px)', lineHeight: 1.6, margin: '0 auto 16px auto', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
              {lang === 'KH' 
                ? '« រំលឹកដង្ហើមស្រែដូនតា និងកេរ្តិ៍ដំណែលឧបករណ៍កសិកម្មបុរាណ លើទឹកដីដីក្រហម »'
                : '"Remembering ancestral paddy breath and traditional farming implements on basalt red earth."'}
            </p>

            {/* Subheading Narrative */}
            <p style={{ color: '#6B635B', fontSize: '15px', lineHeight: 1.7, margin: '0 auto 36px auto', maxWidth: '720px' }}>
              {lang === 'KH'
                ? 'ឧបករណ៍កសិកម្មធ្វើពីឈើគគីរ និងដែកថែបដំដោយដៃចំនួន ១០ មុខ ដែលដូនតាយើងច្នៃឡើងដើម្បីភ្ជួររាស់ដីក្រហមស្វិត មុនពេលគ្រឿងយន្តទំនើបមកជំនួសការចងចាំតាមដងទន្លេមេគង្គ។'
                : 'Ten ancestral ironwood implements hand-carved by village elders to till heavy volcanic basalt clay before mechanized tractors replaced generational oral memory along the Mekong River.'}
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
              <div
                style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden', backgroundColor: '#0B0907', cursor: activeHotspot ? 'pointer' : 'default' }}
                onClick={() => setActiveHotspot(null)}
              >
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(activeHotspot === 1 ? null : 1);
                  }}
                  aria-label="Kokir Wood Shank Anatomy"
                >
                  1
                </button>

                {/* Hotspot 2: Spring Steel Share */}
                <button
                  type="button"
                  className={`hotspot-pin ${activeHotspot === 2 ? 'active' : ''}`}
                  style={{ top: '68%', left: '68%' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(activeHotspot === 2 ? null : 2);
                  }}
                  aria-label="Forged Steel Share Anatomy"
                >
                  2
                </button>

                {/* Hotspot 3: Draft Pull Line */}
                <button
                  type="button"
                  className={`hotspot-pin ${activeHotspot === 3 ? 'active' : ''}`}
                  style={{ top: '22%', left: '56%' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveHotspot(activeHotspot === 3 ? null : 3);
                  }}
                  aria-label="Ox Draft Pull Bar Anatomy"
                >
                  3
                </button>

                {/* Floating Hotspot Inspection Popover */}
                {activeHotspot && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '20px',
                      right: '20px',
                      backgroundColor: 'rgba(25, 22, 20, 0.96)',
                      backdropFilter: 'blur(16px)',
                      WebkitBackdropFilter: 'blur(16px)',
                      borderRadius: '18px',
                      padding: '18px 22px',
                      border: '1px solid rgba(245, 158, 11, 0.35)',
                      color: '#FFFFFF',
                      textAlign: 'left',
                      boxShadow: '0 16px 36px rgba(0,0,0,0.45)',
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
                        {activeHotspot === 1 && (lang === 'KH' ? 'ផ្នែកកាយវិភាគ ០១ · ឈើគគីរ' : 'ANATOMICAL COMPONENT 01 · KOKIR BEAM SHANK')}
                        {activeHotspot === 2 && (lang === 'KH' ? 'ផ្នែកកាយវិភាគ ០២ · ចង្អុលដែកថែប' : 'ANATOMICAL COMPONENT 02 · FORGED STEEL WEDGE')}
                        {activeHotspot === 3 && (lang === 'KH' ? 'ផ្នែកកាយវិភាគ ០៣ · នឹម និងខ្សែទាញ' : 'ANATOMICAL COMPONENT 03 · RAWHIDE DRAUGHT LINE')}
                      </span>
                      <h4 style={{ fontSize: '17px', margin: '2px 0 4px 0', color: '#FFFFFF', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                        {activeHotspot === 1 && (lang === 'KH' ? 'ដងនង្គ័លធ្វើពីឈើគគីររឹងមាំ' : 'Curved Kokir Ironwood Shank (Hopea odorata)')}
                        {activeHotspot === 2 && (lang === 'KH' ? 'ចង្អុលដែកថែបដំកម្តៅ ៣២ ដឺក្រេ' : 'Hand-Forged Spring Steel Share (32° Soil Incline)')}
                        {activeHotspot === 3 && (lang === 'KH' ? 'នឹម និងខ្សែទាញស្បែកគោទ្រទម្ងន់ ៤០០គីឡូ' : 'Twin Oxen Rawhide Draft Line (400kg Drag Balancing)')}
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#D6D3D1', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
                        {activeHotspot === 1 && (lang === 'KH'
                          ? 'ហាលសម្ងួតធម្មជាតិតាមកម្តៅថ្ងៃ ៣ រដូវប្រាំង។ សរសៃឈើក្រាស់ស្វិត ការពារកុំឱ្យបាក់នៅពេលគោក្របីទាញប៉ះចំថ្មបាសាល់ក្នុងដី។'
                          : 'Naturally cured for three dry seasons. High fiber density prevents snapping when buffaloes lurch against embedded basalt granite boulders.')}
                        {activeHotspot === 2 && (lang === 'KH'
                          ? 'ជាងដែកភូមិដំដែកថែប និងជ្រលក់ប្រេងរុក្ខជាតិដើម្បីទទួលបានភាពរឹងមាំ អាចកាត់ជម្រៅ ២០ សង់ទីម៉ែត្រចូលក្នុងដីស្អិត។'
                          : 'Village blacksmiths temper carbon spring steel in botanical oil baths to achieve 58 HRC hardness, slicing 20cm deep through sticky clay.')}
                        {activeHotspot === 3 && (lang === 'KH'
                          ? 'ខ្សែស្បែកគោព្រៃជួយទប់លំនឹងកម្លាំងទាញភ្លាមៗ ការពារកញ្ចឹងកសត្វពាហនៈ និងរក្សាគន្លងភ្ជួរឱ្យត្រង់តាមបណ្តោយស្រែ។'
                          : 'Rawhide lashings absorb sudden shock loads, protecting the necks of working oxen while maintaining a straight plough furrow across flooded paddies.')}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEntry(ploughEntry);
                        }}
                        style={{
                          padding: '7px 16px',
                          borderRadius: '9999px',
                          backgroundColor: '#EA580C',
                          color: '#FFFFFF',
                          border: 'none',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {lang === 'KH' ? 'ពិនិត្យឯកសារលម្អិត →' : 'Inspect Full Dossier →'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveHotspot(null);
                        }}
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
                        {lang === 'KH' ? 'បិទ' : 'Close'}
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
                    {lang === 'KH' ? 'វត្ថុបុរាណគំរូ ០១ · ភ្ជួររាស់រដូវវស្សា' : 'CANONICAL ARTIFACT #01 · MONSOON TILLING'}
                  </span>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: '#191614', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                    {lang === 'KH' ? 'នង្គ័លបុរាណឈើគគីរ' : 'Traditional Kokir Ox Plough (នង្គ័ល)'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ borderLeft: '2px solid rgba(40, 28, 18, 0.1)', paddingLeft: '14px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6B635B', textTransform: 'uppercase' }}>
                      {lang === 'KH' ? 'ទីតាំងប្រភព' : 'PROVENANCE'}
                    </span>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#191614' }}>
                      {lang === 'KH' ? 'ស្រុកកំពង់សៀម (ដីក្រហម)' : 'Kampong Siem (ដីក្រហម)'}
                    </div>
                  </div>

                  <div style={{ borderLeft: '2px solid rgba(40, 28, 18, 0.1)', paddingLeft: '14px' }}>
                    <span style={{ fontSize: '10px', fontFamily: 'monospace', color: '#6B635B', textTransform: 'uppercase' }}>
                      {lang === 'KH' ? 'កម្លាំងអូសទាញ' : 'DRAUGHT FORCE'}
                    </span>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#191614' }}>
                      {lang === 'KH' ? '~៤០០ គ.ក្រ · គោមួយនឹម' : '~400kg Drag · Twin Oxen'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedEntry(ploughEntry);
                    }}
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
                      transition: 'transform 0.2s ease',
                      position: 'relative',
                      zIndex: 10,
                      touchAction: 'manipulation'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    {lang === 'KH' ? 'ពិនិត្យកាយវិភាគ →' : 'Examine Anatomy →'}
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
              {lang === 'KH' ? 'សសរស្តម្ភទាំង ៤ នៃកសិកម្មបុរាណ' : 'FOUR PILLARS OF ANCESTRAL FARMING'}
            </span>
            <h2 style={{ fontFamily: 'var(--font-khmer-title), var(--font-serif), Georgia, serif', fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 400, margin: '0 0 10px 0', color: '#191614' }}>
              {lang === 'KH' ? 'ប្រតិទិនរដូវស្រូវ និងវិស្វកម្មភូមិ' : 'The Seasonal Rice Calendar & Village Engineering'}
            </h2>
            <p style={{ color: '#6B635B', fontSize: '14.5px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
              {lang === 'KH'
                ? 'ឧបករណ៍ត្រូវបានរៀបចំតាមវដ្តរដូវទឹកជំនន់មូសុង និងរដូវប្រមូលផលស្ងួត។ ចុចលើសសរស្តម្ភណាមួយដើម្បីត្រងមើលឧបករណ៍ក្នុងបណ្ណសារ។'
                : 'Tools curated by their functional phase across the monsoon floodwaters and dry harvest cycles. Click any pillar to filter the archive below.'}
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
                {lang === 'KH' ? 'ដំណាក់កាល ០១ · ឧសភា - មិថុនា' : 'PHASE 01 · MAY - JUNE'}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#191614', margin: '0 0 4px 0', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                ភ្ជួររាស់ដីក្រហម
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6B635B', margin: '0 0 14px 0' }}>
                {lang === 'KH' ? 'រៀបចំដីក្រហមបាសាល់មុនភ្លៀងធ្លាក់' : 'Tilling Basalt Red Earth'}
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
                {lang === 'KH' ? 'ដំណាក់កាល ០២ · កក្កដា - កញ្ញា' : 'PHASE 02 · JULY - SEPT'}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#191614', margin: '0 0 4px 0', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                ទឹក &amp; ការស្ទូង
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6B635B', margin: '0 0 14px 0' }}>
                {lang === 'KH' ? 'ប្រព័ន្ធធារាសាស្ត្រ និងទឹកជំនន់មូសុង' : 'Irrigation & Monsoon Flood'}
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
                {lang === 'KH' ? 'ដំណាក់កាល ០៣ · វិច្ឆិកា - មករា' : 'PHASE 03 · NOV - JAN'}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#191614', margin: '0 0 4px 0', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                ច្រូតកាត់រដូវប្រមូលផល
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6B635B', margin: '0 0 14px 0' }}>
                {lang === 'KH' ? 'ប្រមូលផលរដូវប្រាំង និងបក់ស្រូវ' : 'Dry Season Harvest & Winnowing'}
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
                {lang === 'KH' ? 'ដំណាក់កាល ០៤ · ពេញមួយឆ្នាំ' : 'PHASE 04 · YEAR-ROUND'}
              </span>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#191614', margin: '0 0 4px 0', fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
                ជង្រុក &amp; ការដឹកជញ្ជូន
              </h3>
              <p style={{ fontSize: '12.5px', color: '#6B635B', margin: '0 0 14px 0' }}>
                {lang === 'KH' ? 'រក្សាទុកគ្រាប់ពូជ និងរទេះដឹកជញ្ជូន' : 'Storage & Draft Transport'}
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
                    {lang === 'KH' ? 'បណ្ណសារសំឡេងវាលស្រែ · ខ្សែអាត់ ០១' : 'FIELD RECORDING ARCHIVE · REEL 01'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#A8A29E', fontFamily: 'monospace' }}>
                    {lang === 'KH' ? `ការកត់ត្រាផ្ទាល់មាត់ដងទន្លេមេគង្គ · ខ្សែអាត់ #${activeTape.id}` : `MEKONG BASIN ORAL EXPEDITION · TAPE #${activeTape.id}`}
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
                  {isTapePlaying ? (lang === 'KH' ? 'ផ្អាកសំឡេង' : 'PAUSE SPOOL') : (lang === 'KH' ? 'ចាក់សំឡេង' : 'RESUME TAPE')}
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
                  {lang === 'KH' ? `ខ្សែអាត់ ០${tape.id}៖ ${tape.speakerKh.split('(')[0].trim()}` : `Tape 0${tape.id}: ${tape.speaker.split('(')[0].trim()}`}
                </button>
              ))}
            </div>

            {/* Tape Transcript Quote */}
            <div style={{ minHeight: '120px' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#FCD34D', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                {lang === 'KH' ? `សក្ខីកម្មផ្ទាល់មាត់កត់ត្រាទុក · ${activeTape.villageKh}` : `RECORDED TESTIMONY · ${activeTape.village}`}
              </div>

              <p style={{ fontFamily: 'var(--font-khmer-title), Georgia, serif', fontSize: 'clamp(17px, 2.3vw, 21px)', lineHeight: 1.7, color: '#FED7AA', margin: '0 0 14px 0' }}>
                {activeTape.khmerQuote}
              </p>

              <p style={{ fontSize: '13px', color: '#A8A29E', lineHeight: 1.6, margin: '0 0 14px 0', maxWidth: '780px' }}>
                {lang === 'KH' ? activeTape.khmerContext : activeTape.engContext}
              </p>

              <div style={{ fontSize: '12px', color: '#F59E0B', fontFamily: 'monospace' }}>
                {lang === 'KH' ? `អ្នករៀបរាប់៖ ${activeTape.speakerKh} · ${activeTape.titleKh}` : `Speaker: ${activeTape.speaker} · ${activeTape.title}`}
              </div>
            </div>

          </div>

        </section>

        {/* ======================================================== */}
        {/* SECTION 4: THE "VISUAL ARCHIVE" GALLERY (PRATHAM STYLE)  */}
        {/* ======================================================== */}
        <section id="archive" className="reveal-on-scroll" style={{ padding: '60px 0 84px 0', position: 'relative' }}>
          
          {/* Watermark in background */}
          <div className="watermark-archive">{lang === 'KH' ? 'បណ្ណសាររូបភាព' : 'VISUAL ARCHIVE'}</div>

          <div style={{ textAlign: 'center', marginBottom: '36px', position: 'relative', zIndex: 10 }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', color: '#EA580C', display: 'block', marginBottom: '8px' }}>
              {lang === 'KH' ? 'ថាសតាំងពិព័រណ៍សារមន្ទីរ · MUSEUM SPECIMEN TRAYS' : 'MUSEUM SPECIMEN TRAYS'}
            </span>
            <h2 style={{ fontFamily: 'var(--font-serif), Georgia, serif', fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 400, margin: '0 0 10px 0', color: '#191614' }}>
              {lang === 'KH' ? 'ឧបករណ៍កសិកម្មបុរាណទាំង ១០' : 'The 10 Living Implements'}
            </h2>
            <p style={{ color: '#6B635B', fontSize: '14.5px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
              {lang === 'KH'
                ? 'កម្រងឯកសារសារមន្ទីរ កត់ត្រាការសម្ភាសន៍ផ្ទាល់មាត់ ប្រភេទឈើ និងកម្លាំងទាញដីក្រហម។'
                : 'Asymmetric museum exhibit plates documenting oral interviews, wood species, and red-soil tension mechanics.'}
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
                {lang === 'KH' ? `ទាំងអស់ (${entries.length || 10})` : `ALL (${entries.length || 10})`}
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
                {lang === 'KH' ? 'I. ភ្ជួររាស់ដី' : 'I. Soil Prep'}
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
                {lang === 'KH' ? 'II. ស្ទូង និងទឹក' : 'II. Planting & Water'}
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
                {lang === 'KH' ? 'III. ច្រូតកាត់' : 'III. Harvest'}
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
                {lang === 'KH' ? 'IV. ជង្រុក និងរទេះ' : 'IV. Storage & Cattle'}
              </button>
            </div>

            {/* Live Search */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
              <input
                type="text"
                placeholder={lang === 'KH' ? 'ស្វែងរកឧបករណ៍ ឬភូមិ...' : 'Search tool, village...'}
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
            {filteredEntries.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '56px 20px',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px dashed rgba(40, 28, 18, 0.16)',
                  borderRadius: '24px',
                  margin: '12px 0 24px'
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    backgroundColor: '#FFF7ED',
                    border: '1px solid #FED7AA',
                    color: '#EA580C',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <h3
                  style={{
                    fontSize: '20px',
                    color: '#191614',
                    margin: '0 0 8px',
                    fontFamily: 'var(--font-khmer-title), var(--font-serif), Georgia, serif'
                  }}
                >
                  {lang === 'KH' ? 'រកមិនឃើញឧបករណ៍កសិកម្មទេ' : 'No Farming Implements Found'}
                </h3>
                <p style={{ fontSize: '14.5px', color: '#6B635B', margin: '0 auto 20px', maxWidth: '440px', lineHeight: 1.6 }}>
                  {search
                    ? (lang === 'KH'
                        ? `មិនមានឧបករណ៍ត្រូវគ្នានឹង "${search}" ទេ។ សូមសាកល្បងស្វែងរក "នង្គ័ល", "កណ្ដៀវ", "នឹម" ឬកំណត់ការស្វែងរកឡើងវិញ។`
                        : `No farming implements match "${search}". Try searching for plough (នង្គ័ល), sickle (កណ្ដៀវ), yoke (នឹម), or clearing your search.`)
                    : (lang === 'KH'
                        ? 'មិនមានឧបករណ៍ក្នុងប្រភេទដែលបានជ្រើសរើសទេ។'
                        : 'No tools match the selected category filter.')}
                </p>
                {(search || activeFilter !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setActiveFilter('ALL');
                    }}
                    style={{
                      padding: '8px 22px',
                      borderRadius: '9999px',
                      backgroundColor: '#EA580C',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(234, 88, 12, 0.25)'
                    }}
                  >
                    {lang === 'KH' ? 'កំណត់ឡើងវិញ' : 'Clear Search & Filters'}
                  </button>
                )}
              </div>
            ) : (
              filteredEntries.map((tool, idx) => (
                <ExhibitCard
                  key={tool.id || idx}
                  tool={tool}
                  index={idx}
                  onClick={() => setSelectedEntry(tool)}
                  lang={lang}
                />
              ))
            )}
          </div>

        </section>

        {/* ======================================================== */}
        {/* SECTION 5: ANCESTRAL WOODCRAFT TOOLKIT (PRATHAM TILES)   */}
        {/* ======================================================== */}
        <section id="materials" className="reveal-on-scroll" style={{ padding: '72px 0', borderTop: '1px solid rgba(40, 28, 18, 0.1)', borderBottom: '1px solid rgba(40, 28, 18, 0.1)', margin: '40px 0' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '2px', color: '#EA580C', display: 'block', marginBottom: '8px' }}>
              {lang === 'KH' ? 'ជាងដែក និងជាងឈើភូមិ' : 'VILLAGE METALLURGY & CARPENTRY'}
            </span>
            <h2 style={{ fontFamily: 'var(--font-khmer-title), var(--font-serif), Georgia, serif', fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: 400, margin: '0 0 10px 0', color: '#191614' }}>
              {lang === 'KH' ? 'វត្ថុធាតុដើមនៃដីមានជីវិត' : 'Materials of the Living Soil'}
            </h2>
            <p style={{ color: '#6B635B', fontSize: '14.5px', maxWidth: '580px', margin: '0 auto', lineHeight: 1.6 }}>
              {lang === 'KH'
                ? 'ឈើប្រណីតធម្មជាតិ ដែកថែបដំដោយដៃ និងដីឥដ្ឋទន្លេ ដែលចាស់ទុំជ្រើសរើសដើម្បីធន់នឹងសំណើមរដូវវស្សា។'
                : 'Natural timbers, hand-beaten carbon steel, and river clays selected by elders to endure monsoon moisture and volcanic grit.'}
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
                <strong>{lang === 'KH' ? 'ឈើគគីរ' : 'Kokir Ironwood (ឈើគគីរ)'}</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>
                  {lang === 'KH' ? 'ឈើរឹងធន់នឹងទឹក ប្រើធ្វើតួនង្គ័ល និងរាស់' : 'High-density rot-resistant plough beams'}
                </div>
              </div>
            </div>

            <div className="tool-chip">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
              </div>
              <div>
                <strong>{lang === 'KH' ? 'ដែកថែបដំដោយដៃ' : 'Forged Spring Steel (ដែកថែប)'}</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>
                  {lang === 'KH' ? 'មុខកណ្ដៀវ និងផ្លែចបដំដោយជាងដែកភូមិ' : 'Blacksmith sickle teeth & hoe blades'}
                </div>
              </div>
            </div>

            <div className="tool-chip">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M7 7h10M7 17h10" />
                </svg>
              </div>
              <div>
                <strong>{lang === 'KH' ? 'ឫស្សីទន្លេរោលផ្សែង' : 'Smoked River Bamboo (ឫស្សី)'}</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>
                  {lang === 'KH' ? 'បន្ទះឫស្សីត្បាញឈ្នាង កញ្ច្រែង និងអង្រុត' : 'Flexible weave for winnowers & traps'}
                </div>
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
                <strong>{lang === 'KH' ? 'ដីក្រហមបាសាល់' : 'Basalt Red Earth (ដីក្រហម)'}</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>
                  {lang === 'KH' ? 'ដីភ្នំភ្លើងស្អិត ត្រូវការមុខនង្គ័លកោងកាត់ស្មៅ' : 'Volcanic clay with 84% adhesion index'}
                </div>
              </div>
            </div>

            <div className="tool-chip">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <strong>{lang === 'KH' ? 'គោមួយនឹម' : 'Twin Draft Oxen (គោមួយនឹម)'}</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>
                  {lang === 'KH' ? 'កម្លាំងអូសទាញស៊ីចង្វាក់គ្នាលើដីស្រែរឹង' : 'Synchronous draft cattle navigation'}
                </div>
              </div>
            </div>

            <div className="tool-chip">
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EA580C' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 3h12l2 6H4l2-6zM4 9v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9" />
                </svg>
              </div>
              <div>
                <strong>{lang === 'KH' ? 'ដីដុតទន្លេមេគង្គ' : 'Mekong Terracotta (ដីដុតទន្លេ)'}</strong>
                <div style={{ fontSize: '11px', color: '#6B635B', marginTop: '2px' }}>
                  {lang === 'KH' ? 'ក្អមដីដុតរក្សាទឹកត្រជាក់ធម្មជាតិ ៣៨°C' : '38°C natural evaporative water cooling'}
                </div>
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
                  {lang === 'KH' ? 'កំណត់ត្រាស្រាវជ្រាវសារមន្ទីរ' : 'CURATORIAL RESEARCH NOTE'}
                </span>
                <h3 style={{ fontSize: '22px', color: '#191614', margin: '4px 0 0 0', fontFamily: 'var(--font-khmer-title), var(--font-serif), Georgia, serif' }}>
                  {lang === 'KH' ? 'ចំណេះដឹងផ្ទាល់មាត់ និងរូបវិទ្យាកសិកម្ម' : 'Oral Knowledge & Agricultural Physics'}
                </h3>
              </div>

              {/* 3 Clickable Tabs */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '4px', borderRadius: '12px', backgroundColor: '#F7F4EE', border: '1px solid rgba(40, 28, 18, 0.1)', fontSize: '12px', fontFamily: 'monospace', maxWidth: '100%' }}>
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
                  {lang === 'KH' ? 'សក្ខីកម្មផ្ទាល់មាត់' : 'Oral Testimony'}
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
                  {lang === 'KH' ? 'ចលនាដីក្រហម' : 'Basalt Soil Dynamics'}
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
                  {lang === 'KH' ? 'សិល្បៈចម្លាក់ឈើ' : 'Woodcraft Carpentry'}
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
                    {lang === 'KH'
                      ? '— សក្ខីកម្មផ្ទាល់មាត់ពីលោកតា សុខ ស្រុកកំពង់សៀម ខេត្តកំពង់ចាម'
                      : '— Oral Memory from Grandfather Sok, Kampong Siem District, Kampong Cham Province'}
                  </span>
                </div>
              )}
              {spotlightTab === 'season' && (
                <div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#191614', lineHeight: 1.6 }}>
                    {lang === 'KH' ? (
                      <>
                        ប្រើប្រាស់ក្នុងចន្លោះខែ <strong style={{ color: '#EA580C' }}>ឧសភា ដល់ មិថុនា</strong> នៅពេលភ្លៀងដើមរដូវធ្វើឱ្យដីឥដ្ឋក្រហមបាសាល់ទន់មុនពេលទឹកជំនន់មកដល់។ ដីឥដ្ឋបាសាល់រីកមាឌនៅពេលត្រូវទឹក ដូច្នេះត្រូវការទម្រង់មុខនង្គ័លកោងប្រវែង ២០ សង់ទីម៉ែត្រជាប់រហូត ដើម្បីកុំឱ្យដីស្អិតកកស្ទះលើផ្លែ។
                      </>
                    ) : (
                      <>
                        Deployed in <strong style={{ color: '#EA580C' }}>May - June</strong> when early rains soften basalt red clay before flooding. Basalt clay expands when saturated, requiring blade geometry with continuous 20cm curvature to prevent furrow clogging.
                      </>
                    )}
                  </p>
                  <span style={{ fontSize: '12px', color: '#6B635B', fontFamily: 'monospace' }}>
                    {lang === 'KH' ? 'ដីឥដ្ឋក្រហមបាសាល់ · សន្ទស្សន៍ស្រូបយកល្បាប់ ៨៤%' : 'Basalt Red Clay (ដីក្រហមបាសាល់) · Silt Absorption Index 84%'}
                  </span>
                </div>
              )}
              {spotlightTab === 'craft' && (
                <div>
                  <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#191614', lineHeight: 1.6 }}>
                    {lang === 'KH' ? (
                      <>
                        កាប់ច្នៃចេញពីដើម <strong style={{ color: '#EA580C' }}>ឈើគគីរ</strong> កោងដោយធម្មជាតិ និងហាលសម្ងួតទុក ៣ រដូវប្រាំង។ ចង្អុលមុខនង្គ័លត្រូវបានស្រោបដោយដែកថែបដំដោយដៃពីជាងដែក ដើម្បីធន់នឹងគ្រួសខ្សាច់ភ្នំភ្លើងដែលងាយធ្វើឱ្យរេចរឹល។
                      </>
                    ) : (
                      <>
                        Hewn from curved <strong style={{ color: '#EA580C' }}>Kokir ironwood</strong> (Hopea odorata), naturally cured for 3 dry seasons. The leading wedge is hand-shod in blacksmith-hammered spring steel to resist abrasive volcanic grit.
                      </>
                    )}
                  </p>
                  <span style={{ fontSize: '12px', color: '#6B635B', fontFamily: 'monospace' }}>
                    {lang === 'KH' ? 'កម្លាំងទាញ៖ ~៤០០ គ.ក្រ ជាប់ជាប្រចាំ · នឹមទឹមគោសមួយគូ' : 'Draft Tension: ~400kg continuous drag · Twin White Cattle Harness'}
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
              {lang === 'KH' ? 'បណ្ណសារផ្ទាល់មាត់គ្រួសារ · ខេត្តកំពង់ចាម' : 'FAMILY ORAL ARCHIVE · KAMPONG CHAM'}
            </span>
            <h2 style={{ fontFamily: 'var(--font-khmer-title), var(--font-serif), Georgia, serif', fontSize: 'clamp(32px, 5vw, 54px)', fontWeight: 400, margin: '0 0 12px 0', lineHeight: 1.15 }}>
              {lang === 'KH' ? 'មុនពេលនង្គ័លឈើចុងក្រោយត្រូវបំភ្លេចចោល' : 'Before the Last Wooden Plough is Forgotten.'}
            </h2>
            <p style={{ fontFamily: 'var(--font-khmer-title), Georgia, serif', fontSize: '18px', color: '#FEF08A', margin: '0 0 20px 0' }}>
              « ជួយថែរក្សាកេរ្តិ៍ដំណែលឧបករណ៍កសិកម្មបុរាណ ដើម្បីកូនចៅជំនាន់ក្រោយ »
            </p>
            <p style={{ fontSize: '15px', maxWidth: '620px', margin: '0 auto 36px auto', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.92)' }}>
              {lang === 'KH'
                ? 'រាល់ឧបករណ៍ក្នុងភូមិបង្កប់នូវចំណេះដឹងអាកាសធាតុរាប់ទសវត្សរ៍ អាថ៌កំបាំងសិប្បកម្ម និងសាមគ្គីភាពសហគមន៍។ ចូលរួមចែករំលែកឧបករណ៍គ្រួសាររបស់អ្នកមកកាន់បណ្ណសារអចិន្ត្រៃយ៍។'
                : 'Every village implement holds decades of oral weather lore, carpentry secrets, and communal solidarity. Contribute a tool from your family elders to our permanent collection.'}
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
              <span>{lang === 'KH' ? '+ កត់ត្រាឧបករណ៍គ្រួសារ' : '+ Document a Family Implement'}</span>
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
function ExhibitCard({ tool, index, onClick, lang }) {
  const [imgFailed, setImgFailed] = useState(false);
  const photoUrl = resolveToolPhoto(tool);

  // Look up authentic Khmer dictionary for canonical tools
  const khmerInfo = (lang === 'KH' && (
    KHMER_TOOL_INFO[String(tool.id)] ||
    Object.values(KHMER_TOOL_INFO).find((k) => tool.title && k.title && (tool.title.includes(k.title.split(' ')[0]) || k.title.includes(tool.title.split(' ')[0])))
  )) || null;

  const displayCategory = lang === 'KH' ? (khmerInfo?.category || 'កេរដំណែលកសិកម្ម') : (tool.category || 'FARMING HERITAGE');
  const displayTitle = tool.title || khmerInfo?.title;
  const displayDesc = (lang === 'KH' && khmerInfo?.description) ? khmerInfo.description : tool.description;
  const displayMaterial = (lang === 'KH' && khmerInfo?.material) ? khmerInfo.material : tool.material;
  const displaySeason = (lang === 'KH' && khmerInfo?.season) ? khmerInfo.season : tool.season;
  const displayPlace = (lang === 'KH' && khmerInfo?.place) ? khmerInfo.place : tool.place;

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
          {displayCategory}
        </div>

        {/* Khmer Title */}
        <h3 style={{ fontSize: '20px', color: '#191614', margin: '0 0 2px 0', fontWeight: '700', lineHeight: 1.3, fontFamily: 'var(--font-khmer-title), Georgia, serif' }}>
          {displayTitle}
        </h3>

        {/* English Name Subtitle (Only shown in English mode) */}
        {tool.english_name && lang !== 'KH' && (
          <div style={{ fontSize: '13px', color: '#B45309', fontStyle: 'italic', marginBottom: '8px', fontFamily: 'var(--font-serif), Georgia, serif' }}>
            {tool.english_name}
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: '12.5px', color: '#6B635B', lineHeight: 1.5, margin: '0 0 12px 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {displayDesc}
        </p>

        {/* Micro Badges (Material & Season) */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto', marginBottom: '8px' }}>
          {displayMaterial && (
            <span style={{ fontSize: '10.5px', color: '#9A3412', backgroundColor: 'rgba(234, 88, 12, 0.08)', border: '1px solid rgba(234, 88, 12, 0.18)', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace' }}>
              {displayMaterial.split('·')[0].trim()}
            </span>
          )}
          {displaySeason && (
            <span style={{ fontSize: '10.5px', color: '#B45309', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.18)', padding: '2px 7px', borderRadius: '4px', fontFamily: 'monospace' }}>
              {displaySeason.split('(')[0].trim()}
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
            {displayPlace ? displayPlace.split(',')[0].trim() : (lang === 'KH' ? 'ខេត្តកំពង់ចាម' : 'Kampong Cham')}
          </span>
          {tool.contributor && (
            <span style={{ fontSize: '10.5px', color: '#B45309', fontFamily: 'monospace' }}>
              {lang === 'KH' ? `អ្នកចូលរួម៖ ${tool.contributor}` : `Contributor: ${tool.contributor}`}
            </span>
          )}
        </div>
        <span style={{ color: '#EA580C', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {lang === 'KH' ? 'ពិនិត្យមើល →' : 'Inspect →'}
        </span>
      </div>
    </div>
  );
}
