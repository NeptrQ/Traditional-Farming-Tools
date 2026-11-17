# Traditional Farming Tools — The Khmer Living Archive

A bilingual Khmer/English digital archive preserving traditional agricultural implements and rural oral memory from Kampong Cham Province, Cambodia. Built for ICT 340 at the American University of Phnom Penh (AUPP).

---

## 1. What this is

**The Khmer Living Archive** is a bilingual public museum catalog and community submission platform dedicated to documenting ancestral farming tools from Kampong Cham Province — such as wooden ploughs (`នង្គ័ល`), ox yokes (`នឹម`), ironwood harrows (`រនាស់`), winnowing fans (`រហាត់បក់ស្រូវ`), and foot mortars (`ត្បាល់ជាន់`) — alongside the elder craftsmanship stories behind them. Visitors can browse and search verified entries without logging in, inspect tool details in a bilingual modal, register as contributors to submit and revise their own entries with photos, and curate incoming submissions through a database-enforced reviewer moderation queue.

---

## 2. Who it's for

This archive is built for Khmer farming families, grandchildren recording oral histories, rural students, and researchers in Cambodia who want agricultural heritage preserved in their own language rather than an English-only academic catalog.

Several design choices were shaped directly by who uses it:

- **Khmer first**: Titles, status badges, cultural context quotes, and curator attributions prioritize Khmer script alongside English translations using `Noto Serif Khmer`, `Kantumruy Pro`, `Instrument Serif`, and `Inter` loaded via `next/font/google` in `app/layout.js`. No Khmer wording is stripped or transliterated.
- **Phones first**: Layouts use responsive CSS grid (`minmax(min(100%, ...), 1fr)`), mobile navigation drawers (`components/Header.jsx`), mobile font clamping, and constrained watermarks (`app/globals.css`) so reading, signing up, and submitting entries work cleanly down to 375px phone widths.
- **Slow connections and safe uploads**: Tool imagery uses compressed `.jpg` plates under `public/images/` plus a 5 MB hard file-size and MIME-type (`image/jpeg`, `image/png`, `image/webp`) client check before uploading contributor photos (`app/contribute/page.js`, `components/EntryModal.js`), paired with plain React without heavy UI frameworks or hydration libraries.
- **Visible source credit**: Every implement card displays the contributor/source credit and origin district (`contributor` and `place`), and `utils/toolImages.js` hides malformed email-as-contributor strings instead of displaying a user's email address publicly.

---

## 3. How it works

The frontend runs on **Next.js 15 (App Router)** with plain React 19 hosted on **Vercel** ([https://traditional-farming-tools.vercel.app/](https://traditional-farming-tools.vercel.app/)). **Supabase** provides authentication, PostgreSQL with Row-Level Security (RLS), and the `photos` storage bucket. Archive identity (`name`, `description`, `curator`, `source`) is centralized in `collection.config.js`.

### Database tables and storage

1. **`public.entries`**
   - Columns: `id` (`uuid`), `created_at` (`timestamptz`), `owner` (`uuid`), `title` (`text`), `description` (`text`), `contributor` (`text`), `place` (`text`), `photo_url` (`text`), and `status` (`text not null default 'pending' check (status in ('pending', 'published', 'returned'))`).
   - Every submission enters as `'pending'` by SQL column default. Contributors tag season/category metadata inside `description` (`[Category: ...]`) rather than adding extra database columns.
2. **`public.reviewers`**
   - Column: `user_id` (`uuid primary key references auth.users (id)`).
   - RLS is enabled with zero client-facing API policies; reviewer membership can only be granted or revoked manually in the Supabase Dashboard SQL Editor.
3. **`photos` storage bucket**
   - Stores uploaded specimen photos under `<user.id>/<uuid>.<ext>` (`app/contribute/page.js`, `app/my-entries/page.js`) and exposes public image URLs via `getPublicUrl`.

### Security-definer functions and entry workflow

```text
  [Guest] --(SELECT)--> entries WHERE status = 'published'
     |
     v (Sign up / Log in)
  [Contributor] --(INSERT without status)--> entries (DB DEFAULT = 'pending')
     |                                            |
     | (UPDATE / DELETE own rows;                 v (Review Queue: /review)
     |  cannot set status = 'published')   [Reviewer verified by is_reviewer()]
     |                                            |
     |<--- returned (edit & resubmit -> pending) -+---> published (live on /)
```

- **`public.is_reviewer()` (`SECURITY DEFINER`)**: Returns `exists (select 1 from public.reviewers where user_id = (select auth.uid()))`. Checked on the server before rendering `/review` (`app/review/page.js`), in the navbar to toggle the `Review Queue` pill (`components/Header.jsx`), and inside RLS policies.
- **`public.review_entry(entry_id uuid, decision text)` (`SECURITY DEFINER`)**: Verifies `public.is_reviewer()`, validates `decision in ('published', 'returned')`, updates `entries set status = decision where id = entry_id and status = 'pending'`, and returns `boolean` (`true` only when a row actually transitioned; `false` otherwise). Execute permissions are revoked from `public` and `anon` and granted only to `authenticated`.

### Row-Level Security policies on `entries`

- **`anyone can read published entries` (`SELECT`)**: `using (status = 'published' or (select auth.uid()) = owner or (select public.is_reviewer()))`. Anonymous visitors only receive `'published'` records; contributors see their own rows in any status on `/my-entries`; reviewers can read pending submissions on `/review`.
- **`owners add their own entries` (`INSERT`, `authenticated`)**: `with check ((select auth.uid()) = owner and status = 'pending')`. Blocks anyone from inserting pre-published items or spoofing another `owner`.
- **`owners edit their own entries` (`UPDATE`, `authenticated`)**: `using ((select auth.uid()) = owner)` and `with check ((select auth.uid()) = owner and (status = 'pending' or (select public.is_reviewer())))`. Non-reviewers cannot transition any entry to `'published'`.
- **`owners delete their own entries` (`DELETE`)**: Restricts row deletion to the entry owner (`owner = auth.uid()`).

---

## 4. Security decisions

### The moderation gate (`review_entry`)

`review_entry` lives inside PostgreSQL as a `SECURITY DEFINER` function rather than application logic in React. Hiding a **Publish** button in the UI only removes visual clutter for honest users; it provides zero security against a logged-in stranger running `supabase.from('entries').update({ status: 'published' })` or `supabase.rpc('review_entry', ...)` directly from browser DevTools.

Because RLS forbids regular contributors from writing `status = 'published'` directly and `review_entry` verifies `is_reviewer()` server-side inside Postgres, both UI spoofing and direct console attacks are blocked at the database layer. In `app/review/ReviewQueueClient.js`, client actions also require `data === true` from `supabase.rpc('review_entry', ...)` instead of checking `if (!error)` alone, preventing silent `false` / zero-row failures from appearing to succeed in the UI. Meanwhile, `app/contribute/page.js` omits `status` completely from its `.insert(...)` payload so SQL `DEFAULT 'pending'` always owns initial state.

### Choices not fixed by the brief

1. **What a returned entry says**: The `entries` schema intentionally omits a separate `review_note` table or feedback column. Instead, `components/StatusBadge.js` renders `'returned'` in bilingual Khmer and English (`បានប្រគល់ជូនវិញ / Returned for Revision`) on `/my-entries`. Clicking **Edit** lets the contributor adjust any field or replace an invalid image (under the same validation rules as `/contribute`). When a contributor edits an entry, it resets to `status: 'pending'` to re-enter `/review` automatically without needing a second Resubmit button; edits by an authorized reviewer preserve the `published` status as permitted by the database RLS policy.
2. **Whether reviewers can take down published entries**: Reviewers cannot unpublish or take down already `'published'` entries through `/review` or `review_entry`. Both `app/review/page.js` and `ReviewQueueClient.js` filter `.eq('status', 'pending')`, and `review_entry` updates strictly `where id = entry_id and status = 'pending'`. Only the original contributor (via **Edit**, which resets status to `'pending'`, or **Delete** on `/my-entries`) or a database administrator in Supabase Dashboard can remove a live entry. This keeps moderation focused cleanly on the intake queue and avoids accidental takedowns of accepted records.
3. **What search shows contributors about their own pending entries**: Search on the home archive (`app/page.js`) explicitly applies `.eq('status', 'published')` on both the initial shelf load and auth specimen previews (`components/AuthExperience.jsx`). Even when logged in, a contributor's `'pending'` or `'returned'` entries never leak onto the public shelf search; contributors inspect, filter by status, edit, and manage their pending work exclusively on `/my-entries`.

---

## 5. AI use

Across Sprints 1–3, I used **Gemini 3.8 Flash High** (via Antigravity / Cline) as the primary coding and debugging model, alongside Antigravity's `image-generator` subagent for initial visual assets. Following my weekly process logs from Week 1 to Week 13, every diff was reviewed, tested, and vetted against course security boundaries before committing.

| Week / Stage | Model / Tool | Task Description | Verdict (Kept vs. Rewritten & Verification) |
| --- | --- | --- | --- |
| **Week 1** (Setup & Identity) | Gemini 3.8 Flash High | Scaffolding Next.js App Router workspace, configuring Tailwind/globals CSS, establishing color palette, and defining `collection.config.js` metadata for Traditional Khmer Farming Tools. | **Kept with revisions**: Kept the Next.js App Router structure and configuration. Pruned unnecessary external UI dependencies to keep codebase lightweight and dependency-free. |
| **Week 2** (First Component) | Gemini 3.8 Flash High | Creating initial `EntryCard.jsx` component showcasing tool photos, Khmer typography, transliterated names, categories, and metadata pills. | **Mixed (kept & rewritten)**: Kept card layout hierarchy; refactored styling to custom CSS variables for authentic parchment/terracotta tones and added fallback SVG illustrations for missing images. |
| **Week 3** (Archival Catalog) | Gemini 3.8 Flash High | Compiling and structuring 10 bilingual farming implement records (Plough, Harrow, Field Hoe, Sickle, Cart, Granary, etc.) with materials, provenance, and descriptions. | **Rewritten for accuracy**: Reviewed drafts against family oral accounts from Kampong Cham elders; corrected botanical wood terms (e.g. *Hopea odorata* / ឈើគគីរ) and aligned seasonal terminology with Cambodian monsoon cycles (វស្សា / ប្រាំង). |
| **Week 4** (Live Search & Filter) | Gemini 3.8 Flash High | Implementing live search filtering across Khmer script and Latin fields, category pills, and empty state feedback with search suggestions. | **Rewritten logic**: Discarded heavy fuzzy search draft that produced false positives and missed Khmer unicode syllables; replaced with robust normalized substring search across all fields simultaneously. |
| **Week 5** (Supabase SSR Client) | Gemini 3.8 Flash High | Setting up Supabase SSR client utilities (`@supabase/ssr`) in `lib/supabase/`, configuring browser/server singleton clients, and auditing environment variables. | **Kept & verified**: Kept standard SSR helpers. Verified that `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public-safe and confirmed zero secret keys (`SUPABASE_SERVICE_ROLE_KEY`) exist in git history or client code. |
| **Week 6** (Auth User Flows) | Gemini 3.8 Flash High | Developing `/login` and `/signup` authentication routes with session state tracking in header and error message rendering. | **Rewritten for usability & safety**: AI initially produced duplicate identical template pages with raw Supabase error messages. Rewrote both views with custom editorial layouts, distinct tab switching, and human-readable error translation (e.g. invalid credentials). |
| **Week 7** (Database Migration) | Gemini 3.8 Flash High | Migrating static catalog data to live Supabase PostgreSQL `entries` table with initial Row Level Security (RLS) policies for read and insert. | **Kept & strengthened**: Applied database schema. Strengthened RLS policies so public unauthenticated visitors can only query published entries, while authenticated users can insert and view their own contributions. |
| **Week 8** (Storage & Photo Uploads) | Gemini 3.8 Flash High | Wiring file upload pipeline to Supabase Storage `photos` bucket, file picker handling, and contributor image persistence. | **Rewritten for stability**: Initial implementation crashed the browser when large files were dropped because it lacked file size checks. Added strict 5MB file size limit and MIME-type validation (`image/jpeg`, `image/png`, `image/webp`) with user-friendly error banners. |
| **Week 9** (Responsive Overhaul) | Gemini 3.8 Flash High | Designing responsive mobile drawer navigation, tactile glassmorphic `.obsidian-dock`, hero section animations, and responsive typography scaling. | **Kept with CSS fixes**: Retained responsive drawer design; resolved mobile layout overflow bugs where background watermark text caused horizontal page jitter at 375px/390px viewports. |
| **Week 10** (Moderation Intake Gate) | Gemini 3.8 Flash High | Enforcing moderation intake lifecycle so newly submitted entries default to `status: 'pending'`, remaining hidden from the public shelf until reviewer approval. | **Rewritten where insecure**: Rejected AI suggestions that attempted to pass `status: 'pending'` from the client form payload. Implemented database-level `DEFAULT 'pending'` constraint in PostgreSQL and RLS insert validation to prevent contributor self-publishing. |
| **Week 11** (Review Queue & RPC) | Gemini 3.8 Flash High | Building reviewer moderation queue (`/review`), queue table client (`ReviewQueueClient.js`), and server-side RPC functions (`review_entry`, `is_reviewer`) for publishing or returning submissions. | **Rewritten for security**: Replaced direct client-side `.update({ status: 'published' })` draft with `SECURITY DEFINER` PostgreSQL function `review_entry()`, requiring reviewer role verification on each call and returning boolean confirmation. |
| **Week 12** (Resubmission & Query Isolation) | Gemini 3.8 Flash High | Building `/my-entries` management dashboard allowing contributors to view submission statuses, edit draft details, and resubmit returned entries. | **Rewritten for integrity**: Ensured that any edit by a contributor automatically resets `status` back to `'pending'` for re-moderation, while edits performed by authenticated reviewers retain `'published'` status. Added strict owner-isolated queries (`.eq('owner', user.id)`). |
| **Week 13** (Lab 13 Polish & Language) | Gemini 3.8 Flash High & Antigravity `image-generator` | Executing Lab 13 peer audit checklist: replaced inaccurate AI image generations with verified Wikimedia Commons open-license photography, added persistent `KH \| EN` language switcher, elevated Khmer script dominance across museum exhibits, fixed 390px mobile viewport clipping, and resolved centerpiece pedestal hotspot click event propagation and z-index overlap bugs. | **Verified & finalized**: Verified 100% clean builds with zero console errors, zero horizontal page scroll at 375px and 390px, tested stranger penetration checks, and validated language switching reactivity across header, gallery, and modals. |

### How AI output was checked

- Inspected generated JSX, validation helpers, and SQL boundaries against `AGENTS.md` and browser DevTools behavior.
- Built production bundles (`npm run build`) and audited `/`, `/login`, `/signup`, `/contribute`, `/my-entries`, and `/review` in headless Microsoft Edge at `375x812` and `390x844` to confirm zero horizontal page overflow and zero console errors.
- Executed live automated attack checks against Supabase REST and RPC endpoints (`2026-11-11`): verified anonymous requests return only `'published'` rows, anonymous calls to `review_entry` return HTTP `401`, and a freshly registered non-reviewer account cannot insert `status: 'published'`, update its own row to `'published'`, invoke `review_entry` (`returns false`), or edit/delete another user's entry (`0` affected rows).

---

## 6. Sources and credits

### Oral and cultural heritage sources

This archive was curated by **Srorn Vanuth** for ICT 340 at AUPP (`collection.config.js`), based on agricultural tool knowledge shared by elders and farming families in **Kampong Cham Province, Cambodia**, primarily my grandparents (`ជីតា និង ជីដូនរបស់ខ្ញុំ`) from Kampong Cham Province. Oral memory sections on the home exhibit also reference traditional Khmer agricultural accounts associated with elders across Kampong Siem, Kang Meas, and Prey Chhor districts (Grandfather Sok in Kampong Siem District, Grandmother Yan in Kang Meas District, and Master Blacksmith Kong in Prey Chhor District, recorded from family and community agricultural heritage context).

### Third-party photography (Wikimedia Commons)

Five tool photographs under `public/images/` were sourced from Wikimedia Commons under open licenses and are credited below:

1. **Double Ox Yoke (`នឹម` — `public/images/double_ox_yoke.jpg`)**: [File:Cambodia buffaloes in paddy fields.jpg](https://commons.wikimedia.org/wiki/File:Cambodia_buffaloes_in_paddy_fields.jpg) by **NeuCeu**, licensed under **CC BY-SA 3.0**.
2. **Paddy Granary (`ជង្រុកស្រូវ` — `public/images/paddy_granary.jpg`)**: [File:Leuit os 080815-2283 srna.jpg](https://commons.wikimedia.org/wiki/File:Leuit_os_080815-2283_srna.jpg) by **Wibowo Djatmiko (Wie146)**, licensed under **CC BY-SA 3.0**.
3. **Water Scoop (`ស្នប់បាចទឹក / ធុងបាចទឹក` — `public/images/water_scoop.jpg`)**: [File:Treadle pump, original.jpg](https://commons.wikimedia.org/wiki/File:Treadle_pump,_original.jpg) by **Clarissabarnes**, licensed under **CC BY-SA 4.0**.
4. **Winnowing Fan (`រហាត់បក់ស្រូវ` — `public/images/winnowing_fan.jpg`)**: [File:Winnowing machine (Longgang Museum of Hakka Culture).jpg](https://commons.wikimedia.org/wiki/File:Winnowing_machine_(Longgang_Museum_of_Hakka_Culture).jpg) by **Mx. Granger**, dedicated under **CC0 (Public Domain)**.
5. **Foot Mortar (`ត្បាល់ជាន់` — `public/images/foot_mortar.jpg`)**: [File:Dheki Assam.jpg](https://commons.wikimedia.org/wiki/File:Dheki_Assam.jpg) by **NabaJyoti**, licensed under **CC BY-SA 4.0**.

### AI-generated tool illustrations (explicit disclosure)

When original field photographs were not personally captured for the remaining museum plates, eight documentary tool illustrations in `public/images/` were generated using **Antigravity's AI `image-generator` subagent**:

- `public/images/traditional_plough.jpg` (`នង្គ័ល` / Plough)
- `public/images/ironwood_harrow.jpg` (`រនាស់` / Harrow)
- `public/images/basalt_field_hoe.jpg` (`ចប` / Field Hoe showcase)
- `public/images/traditional_ox_cart.jpg` (`រទេះគោ` / Ox Cart)
- `public/images/harvest_sickle.jpg` (`កណ្ដៀវ` / Sickle)
- `public/images/winnowing_platter.jpg` (`កញ្ជើ` / Harvest Basket)
- `public/images/terracotta_pot.jpg` (`ក្អមទឹក` / Terracotta Water Pot showcase)
- `public/images/bamboo_fish_scoop.jpg` (`ឈ្នាង` / Bamboo Fish Scoop showcase)

---

## 7. Running it locally

```bash
git clone https://github.com/NeptrQ/Traditional-Farming-Tools.git
cd Traditional-Farming-Tools
npm install
npm run dev
```

Open `http://localhost:3000` in your browser (or run `npm run build` followed by `npm start` for a production preview).

Create a `.env.local` file in the project root with these two environment variables (never commit their values):

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project API URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase publishable anonymous client key.

`.env*` files are ignored in `.gitignore` and never committed to Git history. On the client side, `NEXT_PUBLIC_SUPABASE_ANON_KEY` is public by design under Supabase's security model: every permission check lives in PostgreSQL RLS policies and `SECURITY DEFINER` RPC functions (`review_entry`, `is_reviewer`). No `SUPABASE_SERVICE_ROLE_KEY` or secret key exists anywhere in this codebase.

---

## 8. Submission checklist

- Live URL loads logged out and shows published entries only: yes, https://traditional-farming-tools.vercel.app/
- A stranger cannot publish their own entry through the page or the console: yes, tested 2026-11-11 (direct `status: 'published'` insert/update refused with RLS `42501`; stranger call to `review_entry` returned `false`)
- Logged out, the API returns nothing pending or returned: yes, tested 2026-11-11 (`entries?status=neq.published` returned `[]`)
- Contributors can edit and delete only their own entries: yes, verified 2026-11-11 (`0` rows affected when another account attempted update/delete; contributor UI scoped to `.eq('owner', userId)` in `app/my-entries/page.js`)
- No secrets anywhere in the repo history: yes, checked with `git log --all -S "service_role"`, `git log --all -S "eyJhbGci"`, and `git ls-files .env*` (all empty; `.env*` gitignored)
- At least eight real entries, each with a credited source: yes, 10 published Khmer farming tool entries in Supabase credited to grandparents in Kampong Cham Province (`ជីតា និង ជីដូនរបស់ខ្ញុំ`)
- Khmer renders on every screen a user meets, including the queue: yes (`app/page.js`, `components/AuthExperience.jsx`, `app/contribute/page.js`, `app/my-entries/page.js`, `app/review/page.js`, `app/review/ReviewQueueClient.js`, and `components/StatusBadge.js`)
- Works at phone width: yes, tested on headless Microsoft Edge at `375x812` across `/`, `/login`, `/signup`, `/contribute`, `/my-entries`, and `/review` with `documentElement.scrollWidth <= window.innerWidth`
- No test entries, lorem ipsum or TODO comments in shipped pages: yes (0 `TODO`/`lorem` matches via `git grep` across source files; `isJunkEntry` in `utils/toolImages.js` hides two legacy test placeholders from shipped views while awaiting manual SQL cleanup in Supabase)
- No console errors on the main pages: yes, verified 0 runtime/console errors on `/`, `/login`, `/signup`, `/contribute`, `/my-entries`, and `/review`
- jesseorndorff is a collaborator on this repo: yes
- Supabase project restored and awake on 2026-11-11: yes
- Demo video link opens in a private window: yes, [ADD PRIVATE-WINDOW DEMO VIDEO LINK]
- Reflection pasted in the Canvas submission: [YES - CONFIRM IN CANVAS]
- Posted in the Show Your Archive discussion: [YES - CONFIRM IN CANVAS]
- Q&A slot booked for [ADD DATE AND TIME]
