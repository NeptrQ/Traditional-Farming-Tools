// Shared filtering & archival specimen photo resolution helpers

const JUNK_TITLES = new Set([
  "feet",
  "feet feet j",
  "j",
  "j kj",
  "test",
  "testing",
  "demo",
  "sample",
  "asdf",
]);

const JUNK_PLACE = new Set(["m", "pp", "test"]);

export function isJunkEntry(item) {
  if (!item || !item.title) return true;
  const title = item.title.trim().toLowerCase();
  if (title.length <= 2 || JUNK_TITLES.has(title)) return true;

  const contributor = (item.contributor || "").trim().toLowerCase();
  if (contributor.includes("@") || contributor === "m") return true;

  const place = (item.place || "").trim().toLowerCase();
  if (JUNK_PLACE.has(place)) return true;

  const url = (item.photo_url || "").toLowerCase();
  if (url.includes("1791271294393") || url.includes("1791271336475")) {
    return true;
  }

  return false;
}

const TOOL_PHOTO_RULES = [
  { keywords: ["នង្គ័ល", "plough", "plow"], path: "/images/traditional_plough.jpg" },
  { keywords: ["រាស់", "រនាស់", "harrow"], path: "/images/ironwood_harrow.jpg" },
  { keywords: ["នឹម", "yoke"], path: "/images/double_ox_yoke.jpg" },
  { keywords: ["ចប", "hoe"], path: "/images/basalt_field_hoe.jpg" },
  { keywords: ["រទេះ", "cart"], path: "/images/traditional_ox_cart.jpg" },
  { keywords: ["កណ្ដៀវ", "sickle"], path: "/images/harvest_sickle.jpg" },
  { keywords: ["ត្បាល់", "mortar"], path: "/images/foot_mortar.jpg" },
  { keywords: ["រហាត់", "winnowing fan", "blower"], path: "/images/winnowing_fan.jpg" },
  { keywords: ["អង្រែ", "កញ្ជើ", "winnowing", "basket"], path: "/images/winnowing_platter.jpg" },
  { keywords: ["ក្អម", "pot", "terracotta"], path: "/images/terracotta_pot.jpg" },
  { keywords: ["ឈ្នាង", "fish scoop"], path: "/images/bamboo_fish_scoop.jpg" },
  { keywords: ["ជង្រុក", "granary", "barn"], path: "/images/paddy_granary.jpg" },
  { keywords: ["ស្នប់", "ធុងបាច", "water scoop"], path: "/images/water_scoop.svg" },
];

export function resolveToolPhoto(item) {
  if (!item) return "/images/traditional_plough.jpg";
  const raw = (item.photo_url || item.image_url || "").trim();
  const isBrokenExternal =
    !raw || raw.includes("wikimedia.org") || raw.includes("wikipedia.org");

  if (!isBrokenExternal) {
    return raw;
  }

  const searchText = `${item.title || ""} ${item.english_name || ""} ${item.category || ""}`.toLowerCase();
  for (const rule of TOOL_PHOTO_RULES) {
    if (rule.keywords.some((kw) => searchText.includes(kw))) {
      return rule.path;
    }
  }
  return raw || "";
}
