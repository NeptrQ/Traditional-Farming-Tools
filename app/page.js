"use client";

import { useState, useEffect } from "react";
import collection from "../collection.config.js";
import EntryModal from "../components/EntryModal.js";
import { createClient } from "../utils/supabase/client.js";

// Canonical list of 10 Traditional Implements from Kampong Cham
const CANONICAL_TOOLS = [
  {
    id: "eb2d63ea-1ac0-4570-8d54-3f98ab3ccdd5",
    title: "នង្គ័ល (Plough)",
    khmer_name: "នង្គ័ល",
    english_name: "Traditional Plough",
    season_id: "soil",
    season_label: "Soil Prep",
    description: "ឧបករណ៍ធ្វើពីឈើមានផ្លែដែកមុត ប្រើសម្រាប់ភ្ជួររាស់ដីស្រែឱ្យផុស និងត្រឡប់ដីមុនពេលព្រោះឬស្ទូង។",
    place: "ខេត្តកំពង់ចាម (Kampong Cham)",
    contributor: "ជីតា និង ជីដូនរបស់ខ្ញុំ (Kampong Siem)",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cambodian_oxen_plowing_rice_field.jpg/640px-Cambodian_oxen_plowing_rice_field.jpg",
    status: "published"
  },
  {
    id: "9d3d4295-8105-42a3-aecd-a85e073dcbbf",
    title: "រនាស់ (Harrow)",
    khmer_name: "រនាស់",
    english_name: "Field Harrow",
    season_id: "soil",
    season_label: "Soil Prep",
    description: "ឧបករណ៍ដែលមានធ្មេញឈើ ឬដែកជាជួរ ប្រើសម្រាប់រាស់បំបែកដីដុំៗឱ្យល្អិត និងពង្រាបដីស្រែឱ្យរាបស្មើ។",
    place: "ខេត្តកំពង់ចាម (Kampong Cham)",
    contributor: "ជីតា និង ជីដូនរបស់ខ្ញុំ (Kampong Siem)",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Harrowing_rice_fields.jpg/640px-Harrowing_rice_fields.jpg",
    status: "published"
  },
  {
    id: "32d34b77-afcb-4088-b953-e77204e160b6",
    title: "នឹម (Yoke)",
    khmer_name: "នឹម",
    english_name: "Double Ox Yoke",
    season_id: "soil",
    season_label: "Soil Prep",
    description: "ឈើកោងសម្រាប់ដាក់លើកញ្ចឹងកគោ ឬក្របីមួយនឹម ដើម្បីទាញនង្គ័ល រនាស់ ឬរទេះ។",
    place: "ខេត្តកំពង់ចាម (Kampong Cham)",
    contributor: "ជីតា និង ជីដូនរបស់ខ្ញុំ (Kampong Siem)",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Plough_and_yoke.jpg/640px-Plough_and_yoke.jpg",
    status: "published"
  },
  {
    id: "ee098f5c-1ef6-4437-b4a2-33b55c6c6b8c",
    title: "ស្នប់បាចទឹក / ធុងបាចទឹក (Water Scoop)",
    khmer_name: "ស្នប់បាចទឹក / ធុងបាចទឹក",
    english_name: "Water Scoop (Snap)",
    season_id: "planting",
    season_label: "Planting & Water",
    description: "ឧបករណ៍ធ្វើពីឫស្សី ឬដែកសម្រាប់ទាញបាចទឹកពីប្រឡាយចូលក្នុងស្រែនៅពេលខ្វះខាតទឹក។",
    place: "ខេត្តកំពង់ចាម (Kampong Cham)",
    contributor: "ជីតា និង ជីដូនរបស់ខ្ញុំ (Kampong Siem)",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Water_scoop_irrigation.jpg/640px-Water_scoop_irrigation.jpg",
    status: "published"
  },
  {
    id: "6ebe1471-9f6d-4014-a291-2b817f0b5755",
    title: "កណ្ដៀវ (Sickle)",
    khmer_name: "កណ្ដៀវ",
    english_name: "Hand Sickle",
    season_id: "harvest",
    season_label: "Harvest",
    description: "ឧបករណ៍កសិកម្មបុរាណដែលមានដងឈើ និងផ្លែកោងមានធ្មេញល្អិត ប្រើសម្រាប់ច្រូតកាត់ស្រូវ និងស្មៅ។",
    place: "ខេត្តកំពង់ចាម (Kampong Cham)",
    contributor: "ជីតា និង ជីដូនរបស់ខ្ញុំ (Kampong Siem)",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Sickle_%28PSF%29.png/640px-Sickle_%28PSF%29.png",
    status: "published"
  },
  {
    id: "f9f10673-a658-4fc3-ba1b-7484fb3ecb8e",
    title: "កញ្ជើ (Harvest Basket)",
    khmer_name: "កញ្ជើ",
    english_name: "Woven Harvest Basket",
    season_id: "harvest",
    season_label: "Harvest",
    description: "ប្រដាប់ត្បាញពីបន្ទះឫស្សីរាងមូល មានមាត់ធំ ប្រើសម្រាប់ដាក់ស្រូវ គ្រាប់ធញ្ញជាតិ ឬផ្លែឈើក្នុងពេលប្រមូលផល។",
    place: "ខេត្តកំពង់ចាម (Kampong Cham)",
    contributor: "ជីតា និង ជីដូនរបស់ខ្ញុំ (Kampong Siem)",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Bamboo_basket_harvest.jpg/640px-Bamboo_basket_harvest.jpg",
    status: "published"
  },
  {
    id: "eb83aca9-f2c7-4030-8233-1528a4bad8a1",
    title: "រហាត់បក់ស្រូវ (Winnowing Fan)",
    khmer_name: "រហាត់បក់ស្រូវ",
    english_name: "Winnowing Fan",
    season_id: "harvest",
    season_label: "Harvest",
    description: "ឧបករណ៍ប្រើសម្រាប់បក់កង្ហារយកកំទេចកំទី ធ្យូង ឬគ្រាប់ស្រូវស្កកចេញពីគ្រាប់ស្រូវពេញ។",
    place: "ខេត្តកំពង់ចាម (Kampong Cham)",
    contributor: "ជីតា និង ជីដូនរបស់ខ្ញុំ (Kampong Siem)",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Winnowing_fan.jpg/640px-Winnowing_fan.jpg",
    status: "published"
  },
  {
    id: "c9626540-ffae-4c24-b7c0-964d76d5287a",
    title: "ត្បាល់ជាន់ (Foot Mortar)",
    khmer_name: "ត្បាល់ជាន់",
    english_name: "Treadle Foot Mortar",
    season_id: "storage",
    season_label: "Storage & Daily Life",
    description: "ត្បាល់បុរាណដែលប្រើកម្លាំងជើងជាន់ដងឈើឱ្យក្បាលត្បាល់ធ្លាក់បុកស្រូវ ដើម្បីកិនយកអង្ករ ឬបុកម្សៅ។",
    place: "ខេត្តកំពង់ចាម (Kampong Cham)",
    contributor: "ជីតា និង ជីដូនរបស់ខ្ញុំ (Kampong Siem)",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Mortar_and_pestle_Cambodia.jpg/640px-Mortar_and_pestle_Cambodia.jpg",
    status: "published"
  },
  {
    id: "bf0c1446-0df4-46a2-9a6a-40f2026ee145",
    title: "ជង្រុកស្រូវ (Paddy Granary)",
    khmer_name: "ជង្រុកស្រូវ",
    english_name: "Elevated Paddy Granary",
    season_id: "storage",
    season_label: "Storage & Daily Life",
    description: "សំណង់ឈើ ឬកន្លែងសម្រាប់ស្តុកទុកស្រូវក្រោយពេលប្រមូលផលឱ្យមានសុវត្ថិភាពពីទឹកភ្លៀង និងសត្វល្អិត។",
    place: "ខេត្តកំពង់ចាម (Kampong Cham)",
    contributor: "ជីតា និង ជីដូនរបស់ខ្ញុំ (Kampong Siem)",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Traditional_rice_barn.jpg/640px-Traditional_rice_barn.jpg",
    status: "published"
  },
  {
    id: "ab7261a3-5414-49f4-bd8e-dbc77eb208f9",
    title: "រទេះគោ (Ox Cart)",
    khmer_name: "រទេះគោ",
    english_name: "Traditional Ox Cart",
    season_id: "storage",
    season_label: "Storage & Daily Life",
    description: "មធ្យោបាយដឹកជញ្ជូនបុរាណទាញដោយគោ ឬក្របី ប្រើសម្រាប់ដឹកស្រូវ ចំបើង ជី និងកសិផលផ្សេងៗពីស្រែមកផ្ទះ។",
    place: "ខេត្តកំពង់ចាម (Kampong Cham)",
    contributor: "ជីតា និង ជីដូនរបស់ខ្ញុំ (Kampong Siem)",
    photo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Ox_cart_Cambodia.jpg/640px-Ox_cart_Cambodia.jpg",
    status: "published"
  }
];

function getToolSeason(tool) {
  if (tool.season_id) return tool.season_id;
  const t = (tool.title || "").toLowerCase();
  if (t.includes("នង្គ័ល") || t.includes("plough") || t.includes("រនាស់") || t.includes("harrow") || t.includes("នឹម") || t.includes("yoke")) {
    return "soil";
  }
  if (t.includes("ស្នប់") || t.includes("scoop") || t.includes("ទឹក") || t.includes("water") || t.includes("ស្ទូង")) {
    return "planting";
  }
  if (t.includes("កណ្ដៀវ") || t.includes("sickle") || t.includes("កញ្ជើ") || t.includes("basket") || t.includes("រហាត់") || t.includes("winnowing") || t.includes("ច្រូត")) {
    return "harvest";
  }
  if (t.includes("ត្បាល់") || t.includes("mortar") || t.includes("ជង្រុក") || t.includes("granary") || t.includes("រទេះ") || t.includes("cart") || t.includes("ទុកដាក់")) {
    return "storage";
  }
  return "soil";
}

function parseNames(title) {
  const match = (title || "").match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return { khmer: match[1].trim(), english: match[2].trim() };
  }
  return { khmer: title || "ឧបករណ៍", english: title || "Traditional Implement" };
}

export default function Home() {
  const [entries, setEntries] = useState(CANONICAL_TOOLS);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [explorerTab, setExplorerTab] = useState("story"); // 'story' | 'season' | 'craft'
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [user, setUser] = useState(null);

  // Add / Edit modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPlace, setNewPlace] = useState("");
  const [newContributor, setNewContributor] = useState("");
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    async function loadEntries() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("entries")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          // Filter out any test artifacts and enrich with canonical metadata
          const validData = data.filter((d) => d.title !== "Feet" && d.title !== "j");
          const merged = CANONICAL_TOOLS.map((canon) => {
            const found = validData.find((d) => d.id === canon.id || d.title === canon.title);
            return found ? { ...canon, ...found } : canon;
          });
          const extraUserTools = validData.filter(
            (d) => !CANONICAL_TOOLS.some((c) => c.id === d.id || c.title === d.title)
          );
          setEntries([...merged, ...extraUserTools]);
        }
      } catch (err) {
        console.error("Error loading tools:", err);
      } finally {
        setLoading(false);
      }
    }
    loadEntries();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("សូមចូលគណនីជាមុនសិន / Please log in to add new tools.");
      return;
    }
    setIsSubmitting(true);
    const supabase = createClient();
    let publicUrl = null;
    if (newPhotoFile) {
      const fileExt = newPhotoFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(filePath, newPhotoFile);
      if (uploadError) {
        alert(`Error uploading photo: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      const { data: { publicUrl: url } } = supabase.storage.from("photos").getPublicUrl(filePath);
      publicUrl = url;
    }

    const { data, error } = await supabase.from("entries").insert([{
      title: newTitle,
      description: newDesc,
      place: newPlace || "ខេត្តកំពង់ចាម (Kampong Cham)",
      contributor: newContributor || user.email,
      photo_url: publicUrl,
      owner: user.id
    }]).select();

    setIsSubmitting(false);
    if (error) {
      alert(`Error adding entry: ${error.message}`);
    } else {
      alert("សំណើរបស់អ្នកត្រូវបានបញ្ជូនសម្រាប់ការត្រួតពិនិត្យ! / Your entry has been submitted for review!");
      setShowAddModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewPlace("");
      setNewContributor("");
      setNewPhotoFile(null);
    }
  };

  const handleDelete = async (entryId) => {
    const supabase = createClient();
    const { data, error } = await supabase.from("entries").delete().eq("id", entryId).select();
    if (error) {
      alert(`Error deleting entry: ${error.message}`);
    } else {
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
      if (selectedEntry?.id === entryId) setSelectedEntry(null);
    }
  };

  const handleEditClick = (entry) => {
    setEditEntry(entry);
    setNewTitle(entry.title || "");
    setNewDesc(entry.description || "");
    setNewPlace(entry.place || "");
    setNewContributor(entry.contributor || "");
    setNewPhotoFile(null);
    setPhotoError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!user || !editEntry) return;
    setIsSubmitting(true);
    const supabase = createClient();
    let publicUrl = editEntry.photo_url;
    if (newPhotoFile) {
      const fileExt = newPhotoFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("photos").upload(filePath, newPhotoFile);
      if (uploadError) {
        alert(`Error uploading photo: ${uploadError.message}`);
        setIsSubmitting(false);
        return;
      }
      const { data: { publicUrl: url } } = supabase.storage.from("photos").getPublicUrl(filePath);
      publicUrl = url;
    }

    const updatePayload = {
      title: newTitle,
      description: newDesc,
      place: newPlace,
      contributor: newContributor,
      photo_url: publicUrl
    };

    const { data, error } = await supabase.from("entries").update(updatePayload).eq("id", editEntry.id).select();
    setIsSubmitting(false);
    if (error) {
      alert(`Error updating entry: ${error.message}`);
    } else {
      setEditEntry(null);
      if (data && data[0]) {
        setEntries((prev) => prev.map((item) => (item.id === editEntry.id ? { ...item, ...data[0] } : item)));
        if (selectedEntry?.id === editEntry.id) setSelectedEntry({ ...selectedEntry, ...data[0] });
      }
    }
  };

  // Filter tools by season and search query
  const trimmed = query.trim().toLowerCase();
  const filteredTools = entries.filter((tool) => {
    const seasonMatch = selectedSeason === "all" || getToolSeason(tool) === selectedSeason;
    if (!seasonMatch) return false;
    if (!trimmed) return true;
    const t = (tool.title || "").toLowerCase();
    const d = (tool.description || "").toLowerCase();
    const p = (tool.place || "").toLowerCase();
    return t.includes(trimmed) || d.includes(trimmed) || p.includes(trimmed);
  });

  return (
    <main style={{ width: "100%", overflowX: "clip", color: "#f3ece0" }}>
      {/* ======================================================== */}
      {/* 3. 50/50 HERO SECTION */}
      {/* ======================================================== */}
      <section
        className="container"
        style={{
          padding: "48px 1.5rem 64px",
          minHeight: "75vh",
          display: "flex",
          alignItems: "center"
        }}
      >
        <div className="hero-split-grid" style={{ width: "100%" }}>
          {/* Left Column (7 cols on desktop) */}
          <div className="hero-col-left" style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
            {/* Badge */}
            <div
              className="rounded-full bg-[#1C1816]/90 border border-[#3A2922] px-4 py-1.5 mb-5 flex items-center gap-2 text-xs font-semibold tracking-wider text-[#F59E0B]"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "9999px",
                backgroundColor: "rgba(28, 24, 22, 0.9)",
                border: "1px solid #3A2922",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                color: "#F59E0B",
                marginBottom: "20px"
              }}
            >
              <span style={{ color: "#EA580C", fontSize: "10px" }}>●</span>
              <span>KAMPONG CHAM COLLECTION · 10 TOOLS PRESERVED</span>
            </div>

            {/* Heading */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-normal text-[#f3ece0] mb-4 leading-tight"
              style={{
                fontFamily: "var(--font-serif), Georgia, serif",
                fontSize: "clamp(34px, 4.4vw, 58px)",
                fontWeight: 400,
                lineHeight: 1.18,
                color: "#f3ece0",
                margin: "0 0 18px"
              }}
            >
              The oral wisdom of <span className="text-[#F59E0B] italic" style={{ color: "#F59E0B", fontStyle: "italic" }}>Cambodia&apos;s fields</span> is a living treasure.
            </h1>

            {/* Khmer Quote */}
            <div
              className="border-l-4 border-[#EA580C] pl-4 mb-5 text-[#f3ece0] font-normal leading-relaxed text-base md:text-lg"
              style={{
                borderLeft: "3.5px solid #EA580C",
                paddingLeft: "16px",
                margin: "0 0 20px",
                fontFamily: "var(--font-khmer)",
                fontSize: "16.5px",
                lineHeight: 1.65,
                color: "#e8dfd3"
              }}
            >
              « នង្គ័ល រាស់ កណ្ដៀវ និងឧបករណ៍ដូនតា ថែរក្សាដង្ហើមស្រែខ្មែរពីជំនាន់មួយទៅជំនាន់មួយ »
            </div>

            {/* Description */}
            <p
              className="text-[#bdb1a1] text-base md:text-lg mb-8 max-w-xl leading-relaxed"
              style={{
                color: "#bdb1a1",
                fontSize: "16px",
                lineHeight: 1.7,
                margin: "0 0 32px",
                maxWidth: "580px"
              }}
            >
              Preserving the tools, memories, and farming seasons of my grandparents before mechanized tractors replace them.
            </p>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="#seasons"
                className="rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white px-7 py-3 font-semibold shadow-lg transition-all"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "46px",
                  padding: "0 28px",
                  borderRadius: "9999px",
                  backgroundColor: "#EA580C",
                  color: "#ffffff",
                  border: "1px solid #EA580C",
                  fontSize: "15px",
                  fontWeight: 600,
                  textDecoration: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(234, 88, 12, 0.35)",
                  transition: "all 0.2s ease"
                }}
              >
                Explore Collection
              </a>
              <a
                href="#seasons"
                className="rounded-full border border-[#3A2922] hover:border-[#F59E0B] text-[#f3ece0] hover:text-[#F59E0B] px-6 py-3 font-medium transition-all"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "46px",
                  padding: "0 26px",
                  borderRadius: "9999px",
                  backgroundColor: "transparent",
                  color: "#f3ece0",
                  border: "1px solid #3A2922",
                  fontSize: "15px",
                  fontWeight: 500,
                  textDecoration: "none",
                  transition: "all 0.2s ease"
                }}
              >
                The 4 Seasons of Rice →
              </a>
            </div>
          </div>

          {/* Right Column (5 cols on desktop): UNIQUE INTERACTIVE TOOL EXPLORER */}
          <div className="hero-col-right">
            <div
              className="rounded-2xl bg-[#1C1816] border border-[#3A2922] p-6 shadow-2xl flex flex-col"
              style={{
                backgroundColor: "#1C1816",
                border: "1px solid #3A2922",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "0 20px 45px rgba(0,0,0,0.6)",
                display: "flex",
                flexDirection: "column"
              }}
            >
              {/* Header Badge */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#F59E0B", textTransform: "uppercase" }}>
                  INTERACTIVE IMPLEMENT EXPLORER
                </span>
                <span style={{ fontSize: "10.5px", padding: "3px 8px", borderRadius: "9999px", backgroundColor: "rgba(245, 158, 11, 0.12)", color: "#F59E0B", fontWeight: 700, border: "1px solid rgba(245, 158, 11, 0.25)" }}>
                  CATALOG #01
                </span>
              </div>

              {/* Photo Container */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/10",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #3A2922",
                  backgroundColor: "#110F0D",
                  marginBottom: "16px"
                }}
              >
                <img
                  src="/images/traditional_plough.jpg"
                  alt="Traditional Wooden Plough (នង្គ័ល)"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.currentTarget.src = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Cambodian_oxen_plowing_rice_field.jpg/640px-Cambodian_oxen_plowing_rice_field.jpg";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: "10px",
                    left: "10px",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(17, 15, 13, 0.9)",
                    backdropFilter: "blur(6px)",
                    border: "1px solid #3A2922",
                    color: "#F59E0B",
                    fontSize: "11px",
                    fontWeight: 600
                  }}
                >
                  នង្គ័ល (Nongkol) · Traditional Ox-Plough
                </div>
              </div>

              {/* 3 Interactive Tabs */}
              <div
                className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#110F0D] border border-[#3A2922] mb-4"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "6px",
                  padding: "4px",
                  borderRadius: "10px",
                  backgroundColor: "#110F0D",
                  border: "1px solid #3A2922",
                  marginBottom: "16px"
                }}
              >
                <button
                  type="button"
                  onClick={() => setExplorerTab("story")}
                  style={{
                    padding: "7px 4px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: explorerTab === "story" ? "#EA580C" : "transparent",
                    color: explorerTab === "story" ? "#ffffff" : "#bdb1a1",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap"
                  }}
                >
                  Oral Story
                </button>
                <button
                  type="button"
                  onClick={() => setExplorerTab("season")}
                  style={{
                    padding: "7px 4px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: explorerTab === "season" ? "#EA580C" : "transparent",
                    color: explorerTab === "season" ? "#ffffff" : "#bdb1a1",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap"
                  }}
                >
                  Farming Season
                </button>
                <button
                  type="button"
                  onClick={() => setExplorerTab("craft")}
                  style={{
                    padding: "7px 4px",
                    borderRadius: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    backgroundColor: explorerTab === "craft" ? "#EA580C" : "transparent",
                    color: explorerTab === "craft" ? "#ffffff" : "#bdb1a1",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap"
                  }}
                >
                  Craftsmanship
                </button>
              </div>

              {/* Swappable Content Box */}
              <div
                style={{
                  minHeight: "135px",
                  padding: "14px",
                  backgroundColor: "rgba(17, 15, 13, 0.6)",
                  border: "1px solid #3A2922",
                  borderRadius: "10px",
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center"
                }}
              >
                {explorerTab === "story" && (
                  <div>
                    <div style={{ color: "#F59E0B", fontSize: "1.4rem", lineHeight: 0.8, marginBottom: "4px" }}>&ldquo;</div>
                    <p style={{ margin: "0 0 8px", fontStyle: "italic", fontSize: "13.5px", lineHeight: 1.6, color: "#e5ded4", fontFamily: "var(--font-khmer)" }}>
                      « នង្គ័លនេះ ធ្វើពីឈើគគីររឹងមាំណាស់ ប្រើជាមួយគោមួយនឹម ភ្ជួរដីក្រហមតាំងពីជំនាន់ឪពុកខ្ញុំមកម្ល៉េះ។ ពេលដីត្រូវទឹកភ្លៀងដំបូង ដីធ្ងន់ខ្លាំងណាស់ បើគ្មាននង្គ័លស្រួលទេ គោឆាប់ហត់ »
                    </p>
                    <div style={{ fontSize: "11.5px", color: "#F59E0B", fontWeight: 600 }}>
                      — Grandfather Sok, Kampong Siem (Red soil district)
                    </div>
                  </div>
                )}

                {explorerTab === "season" && (
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#F59E0B", letterSpacing: "0.06em", marginBottom: "4px" }}>
                      EARLY MONSOON (MAY – JUNE) · ដើមរដូវវស្សា
                    </div>
                    <p style={{ margin: "0 0 6px", fontSize: "13px", lineHeight: 1.6, color: "#e5ded4" }}>
                      When the ground is first softened by rain after the scorching dry season, the plough is brought out at dawn. The soil must be turned before weed seeds sprout and dry clods harden.
                    </p>
                    <div style={{ fontSize: "11.5px", color: "#bdb1a1" }}>
                      Cycle: ភ្ជួរប្រាំង (Opening dry-furrow) &amp; ភ្ជួរវស្សា (Wet-soil preparation)
                    </div>
                  </div>
                )}

                {explorerTab === "craft" && (
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "#EA580C", letterSpacing: "0.06em", marginBottom: "4px" }}>
                      HEWN IRONWOOD &amp; BLACKSMITH-FORGED STEEL
                    </div>
                    <p style={{ margin: "0 0 6px", fontSize: "13px", lineHeight: 1.6, color: "#e5ded4" }}>
                      Hand-carved from Kokir (គគីរ / Ironwood) renowned for timber durability in muddy paddy conditions. Fitted with a forged-steel plowshare shaped by village blacksmiths to cut clean 15cm furrows.
                    </p>
                    <div style={{ fontSize: "11.5px", color: "#bdb1a1" }}>
                      Joinery: Wooden wedge mortise &amp; natural tree resin sealant
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Trigger to View in Archive */}
              <a
                href="#seasons"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  color: "#F59E0B",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  borderTop: "1px solid #3A2922",
                  paddingTop: "12px"
                }}
              >
                <span>Browse All 10 Preserved Implements</span>
                <span>↓</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. "THE 4 SEASONS OF RICE" CATALOG BELOW HERO */}
      {/* ======================================================== */}
      <section
        id="seasons"
        className="container"
        style={{
          padding: "64px 1.5rem",
          borderTop: "1px solid #3A2922"
        }}
      >
        {/* Section Header */}
        <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.14em", color: "#F59E0B", textTransform: "uppercase" }}>
            AGRICULTURAL TAXONOMY · KAMPONG CHAM
          </div>
          <h2
            style={{
              fontFamily: "var(--font-serif), Georgia, serif",
              fontSize: "clamp(28px, 3.5vw, 42px)",
              color: "#f3ece0",
              margin: 0,
              fontWeight: 400
            }}
          >
            The 4 Seasons of Rice
          </h2>
          <p style={{ color: "#bdb1a1", fontSize: "15px", margin: 0, maxWidth: "680px" }}>
            The Kampong Cham agricultural calendar organized into 4 seasonal phases: Soil Preparation, Planting &amp; Water, Harvest, and Storage &amp; Daily Village Life.
          </p>
        </div>

        {/* Filter Bar: Category Tabs & Search Box */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          {/* Seasonal Category Pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              { id: "all", label: `All Tools (${entries.length})` },
              { id: "soil", label: "1. Soil Prep (ភ្ជួររាស់)" },
              { id: "planting", label: "2. Planting & Water (ស្ទូង)" },
              { id: "harvest", label: "3. Harvest (ច្រូតកាត់)" },
              { id: "storage", label: "4. Storage & Daily Life (ទុកដាក់)" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedSeason(tab.id)}
                className={`season-tab-btn ${selectedSeason === tab.id ? "active" : ""}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input & Add Tool Action */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%", maxWidth: "360px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tools, names, province..."
                className="input focus-ring"
                style={{
                  height: "40px",
                  padding: "0 14px",
                  fontSize: "13.5px",
                  borderRadius: "9999px",
                  backgroundColor: "#1C1816",
                  border: "1px solid #3A2922",
                  color: "#f3ece0"
                }}
              />
            </div>
            {user && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
                style={{
                  height: "40px",
                  padding: "0 16px",
                  borderRadius: "9999px",
                  fontSize: "13px",
                  whiteSpace: "nowrap"
                }}
              >
                ＋ Add Tool
              </button>
            )}
          </div>
        </div>

        {/* Clean 3-Column Grid of Cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "64px 0", border: "1px dashed #3A2922", borderRadius: "12px" }}>
            <p style={{ color: "#F59E0B", fontSize: "16px", fontWeight: 600 }}>🌾 កំពុងទាញយកទិន្នន័យ... / Loading implements...</p>
          </div>
        ) : filteredTools.length > 0 ? (
          <div className="seasons-grid">
            {filteredTools.map((tool, index) => {
              const names = parseNames(tool.title);
              const season = getToolSeason(tool);
              const seasonBadge =
                season === "soil"
                  ? "Soil Prep"
                  : season === "planting"
                  ? "Planting & Water"
                  : season === "harvest"
                  ? "Harvest"
                  : "Storage";

              const isOwner = user && tool.owner === user.id;

              return (
                <article
                  key={tool.id || index}
                  onClick={() => setSelectedEntry(tool)}
                  className="card spot-card focus-ring"
                  style={{
                    backgroundColor: "#1C1816",
                    border: "1px solid #3A2922",
                    borderRadius: "14px",
                    overflow: "hidden",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    transition: "transform 0.2s ease, border-color 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.borderColor = "#EA580C";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "#3A2922";
                  }}
                >
                  {/* Photo Framing */}
                  <div
                    style={{
                      width: "100%",
                      aspectRatio: "16/10",
                      backgroundColor: "#110F0D",
                      overflow: "hidden",
                      position: "relative",
                      borderBottom: "1px solid #3A2922"
                    }}
                  >
                    <img
                      src={tool.photo_url || "/images/traditional_plough.jpg"}
                      alt={tool.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.src = "/images/traditional_plough.jpg";
                      }}
                    />
                    {/* Season Tag Pill */}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        padding: "3px 9px",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(17, 15, 13, 0.88)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid #3A2922",
                        color: "#F59E0B",
                        fontSize: "11px",
                        fontWeight: 700
                      }}
                    >
                      {seasonBadge}
                    </div>

                    {/* Owner Controls */}
                    {isOwner && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          display: "flex",
                          gap: "6px"
                        }}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(tool);
                          }}
                          style={{
                            backgroundColor: "rgba(28, 24, 22, 0.9)",
                            border: "1px solid #3A2922",
                            color: "#f3ece0",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Delete this tool entry?")) {
                              handleDelete(tool.id);
                            }
                          }}
                          style={{
                            backgroundColor: "rgba(28, 24, 22, 0.9)",
                            border: "1px solid #3A2922",
                            color: "#EA580C",
                            borderRadius: "6px",
                            padding: "4px 8px",
                            fontSize: "11.5px",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                    {/* Khmer Name in Serif */}
                    <h3
                      style={{
                        fontFamily: "var(--font-khmer-title), var(--font-serif), serif",
                        fontSize: "22px",
                        fontWeight: 600,
                        color: "#F59E0B",
                        margin: "0 0 4px"
                      }}
                    >
                      {names.khmer}
                    </h3>

                    {/* English Name */}
                    <div style={{ fontSize: "14px", color: "#bdb1a1", fontWeight: 500, marginBottom: "10px" }}>
                      {names.english}
                    </div>

                    {/* Province Origin */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "12px",
                        color: "#e8dfd3",
                        marginBottom: "12px"
                      }}
                    >
                      <span style={{ color: "#EA580C" }}>📍</span>
                      <span>{tool.place || "ខេត្តកំពង់ចាម (Kampong Cham)"}</span>
                    </div>

                    {/* Description Excerpt */}
                    <p
                      style={{
                        fontSize: "13.5px",
                        color: "#bdb1a1",
                        lineHeight: 1.6,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}
                    >
                      {tool.description}
                    </p>

                    {/* Card Footer Link */}
                    <div
                      style={{
                        marginTop: "auto",
                        paddingTop: "14px",
                        borderTop: "1px solid #2B1E19",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "12.5px",
                        color: "#F59E0B",
                        fontWeight: 600
                      }}
                    >
                      <span>View details</span>
                      <span>→</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "64px 0", border: "1px dashed #3A2922", borderRadius: "12px" }}>
            <p style={{ color: "#f3ece0", fontSize: "16px", margin: "0 0 8px" }}>រកមិនឃើញឧបករណ៍កសិកម្មទេ</p>
            <p style={{ color: "#bdb1a1", fontSize: "14px", margin: "0 0 16px" }}>No traditional implements found matching &ldquo;{query}&rdquo;.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedSeason("all");
              }}
              className="season-tab-btn"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 5. PROVENANCE FOOTER (3 CLEAN METADATA CARDS) */}
      {/* ======================================================== */}
      <section
        className="container"
        style={{
          padding: "48px 1.5rem 80px",
          borderTop: "1px solid #3A2922"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px"
          }}
        >
          {/* Card 1: PROVENANCE */}
          <div
            style={{
              backgroundColor: "#1C1816",
              border: "1px solid #3A2922",
              borderRadius: "14px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#EA580C", textTransform: "uppercase" }}>
              PROVENANCE
            </div>
            <h4 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: "18px", color: "#f3ece0", margin: 0, fontWeight: 500 }}>
              Oral Knowledge from Kampong Cham
            </h4>
            <p style={{ fontSize: "13.5px", color: "#bdb1a1", lineHeight: 1.6, margin: 0 }}>
              {collection.source}
            </p>
          </div>

          {/* Card 2: COLLECTION */}
          <div
            style={{
              backgroundColor: "#1C1816",
              border: "1px solid #3A2922",
              borderRadius: "14px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#F59E0B", textTransform: "uppercase" }}>
              COLLECTION
            </div>
            <h4 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: "18px", color: "#f3ece0", margin: 0, fontWeight: 500 }}>
              10 Traditional Implements Documented
            </h4>
            <p style={{ fontSize: "13.5px", color: "#bdb1a1", lineHeight: 1.6, margin: 0 }}>
              Comprehensive inventory preserving hand-hewn wood and forged-steel tools across all 4 cycles of Cambodian rice cultivation.
            </p>
          </div>

          {/* Card 3: PROJECT */}
          <div
            style={{
              backgroundColor: "#1C1816",
              border: "1px solid #3A2922",
              borderRadius: "14px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", color: "#EA580C", textTransform: "uppercase" }}>
              PROJECT
            </div>
            <h4 style={{ fontFamily: "var(--font-serif), Georgia, serif", fontSize: "18px", color: "#f3ece0", margin: 0, fontWeight: 500 }}>
              ICT 340 · The Khmer Living Archive
            </h4>
            <p style={{ fontSize: "13.5px", color: "#bdb1a1", lineHeight: 1.6, margin: 0 }}>
              Curated by {collection.curator}. {collection.description}
            </p>
          </div>
        </div>
      </section>

      {/* Entry Details Modal */}
      <EntryModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        currentUser={user}
        onDelete={handleDelete}
        onEdit={handleEditClick}
      />

      {/* Add New Tool Modal */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(17, 15, 13, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              backgroundColor: "#1C1816",
              border: "1px solid #3A2922",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "480px",
              boxSizing: "border-box",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px rgba(0,0,0,0.8)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#F59E0B", fontWeight: 700 }}>
                បន្ថែមឧបករណ៍ថ្មី / Add New Tool
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#bdb1a1" }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#f3ece0" }}>Tool Title *</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. នង្គ័ល (Plough)"
                  className="input focus-ring"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#f3ece0" }}>Description *</label>
                <textarea
                  required
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the tool, its season, materials, and memories..."
                  className="input focus-ring"
                  style={{ height: "auto", padding: "10px 14px" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#f3ece0" }}>Contributor</label>
                <input
                  value={newContributor}
                  onChange={(e) => setNewContributor(e.target.value)}
                  placeholder={user?.email || "e.g. Grandfather Sok"}
                  className="input focus-ring"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#f3ece0" }}>Place of Origin</label>
                <input
                  value={newPlace}
                  onChange={(e) => setNewPlace(e.target.value)}
                  placeholder="e.g. ខេត្តកំពង់ចាម (Kampong Cham)"
                  className="input focus-ring"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#f3ece0" }}>Photo Upload (JPG, PNG, WebP)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) {
                      setNewPhotoFile(null);
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      setPhotoError("Image size must be under 5 MB.");
                      setNewPhotoFile(null);
                      return;
                    }
                    setNewPhotoFile(file);
                    setPhotoError("");
                  }}
                  className="input focus-ring"
                  style={{ height: "auto", padding: "8px 12px" }}
                />
                {photoError && <span style={{ color: "#EA580C", fontSize: "12px" }}>{photoError}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "9999px",
                    border: "1px solid #3A2922",
                    background: "transparent",
                    color: "#bdb1a1",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !!photoError}
                  className="btn btn-primary"
                  style={{ borderRadius: "9999px", padding: "0 22px" }}
                >
                  {isSubmitting ? "Uploading..." : "Submit Tool"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tool Modal */}
      {editEntry && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(17, 15, 13, 0.85)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000
          }}
          onClick={() => setEditEntry(null)}
        >
          <div
            style={{
              backgroundColor: "#1C1816",
              border: "1px solid #3A2922",
              borderRadius: "16px",
              padding: "32px",
              width: "100%",
              maxWidth: "480px",
              boxSizing: "border-box",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px rgba(0,0,0,0.8)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#F59E0B", fontWeight: 700 }}>
                កែប្រែឧបករណ៍ / Edit Tool
              </h3>
              <button
                type="button"
                onClick={() => setEditEntry(null)}
                style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer", color: "#bdb1a1" }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleEditSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#f3ece0" }}>Tool Title *</label>
                <input
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="input focus-ring"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#f3ece0" }}>Description *</label>
                <textarea
                  required
                  rows={4}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="input focus-ring"
                  style={{ height: "auto", padding: "10px 14px" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#f3ece0" }}>Contributor</label>
                <input
                  value={newContributor}
                  onChange={(e) => setNewContributor(e.target.value)}
                  className="input focus-ring"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#f3ece0" }}>Place of Origin</label>
                <input
                  value={newPlace}
                  onChange={(e) => setNewPlace(e.target.value)}
                  className="input focus-ring"
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#f3ece0" }}>Replace Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) {
                      setNewPhotoFile(null);
                      return;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                      setPhotoError("Image size must be under 5 MB.");
                      setNewPhotoFile(null);
                      return;
                    }
                    setNewPhotoFile(file);
                    setPhotoError("");
                  }}
                  className="input focus-ring"
                  style={{ height: "auto", padding: "8px 12px" }}
                />
                {photoError && <span style={{ color: "#EA580C", fontSize: "12px" }}>{photoError}</span>}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setEditEntry(null)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "9999px",
                    border: "1px solid #3A2922",
                    background: "transparent",
                    color: "#bdb1a1",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !!photoError}
                  className="btn btn-primary"
                  style={{ borderRadius: "9999px", padding: "0 22px" }}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
