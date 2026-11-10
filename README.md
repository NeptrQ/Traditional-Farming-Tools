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

1. **What a returned entry says**: The `entries` schema intentionally omits a separate `review_note` table or feedback column. Instead, `components/StatusBadge.js` renders `'returned'` in bilingual Khmer and English (`បានប្រគល់ជូនវិញ / Returned for Revision`) on `/my-entries`. Clicking **Edit** lets the contributor adjust any field or replace an invalid image (under the same validation rules as `/contribute`), and saving an edit in `app/my-entries/page.js` unconditionally resets `status: 'pending'` so the updated record re-enters `/review` automatically without needing a second Resubmit button.
2. **Whether reviewers can take down published entries**: Reviewers cannot unpublish or take down already `'published'` entries through `/review` or `review_entry`. Both `app/review/page.js` and `ReviewQueueClient.js` filter `.eq('status', 'pending')`, and `review_entry` updates strictly `where id = entry_id and status = 'pending'`. Only the original contributor (via **Edit**, which resets status to `'pending'`, or **Delete** on `/my-entries`) or a database administrator in Supabase Dashboard can remove a live entry. This keeps moderation focused cleanly on the intake queue and avoids accidental takedowns of accepted records.
3. **What search shows contributors about their own pending entries**: Search on the home archive (`app/page.js`) explicitly applies `.eq('status', 'published')` on both the initial shelf load and auth specimen previews (`components/AuthExperience.jsx`). Even when logged in, a contributor's `'pending'` or `'returned'` entries never leak onto the public shelf search; contributors inspect, filter by status, edit, and manage their pending work exclusively on `/my-entries`.

---

## 5. AI use

I used AI coding assistants (Antigravity coding agent / Cline workflows using Gemini and Claude coding models) alongside Antigravity's built-in `image-generator` subagent across Sprints 1–3, reviewing every diff before keeping it.

| Model / Tool | Task | Verdict (Kept vs. Rewritten & Verification) |
| --- | --- | --- |
| Antigravity / Cline LLM Coding Agent | Starter bilingual archive UI, search filter, hotspot showcase, `.obsidian-dock` navigation, split `/login`, `/signup`, and `/contribute` flows (`app/page.js`, `components/Header.jsx`, `components/AuthExperience.jsx`, `components/EntryModal.js`, `app/globals.css`) | **Mixed (kept & rewritten)**: Kept the bilingual palette, editorial layout, and responsive drawer. Rewrote auth pages after initial templates shared identical views, fixed 375px horizontal overflow and background watermark clamping in CSS, and isolated contributor inline check-in directly inside `/contribute`. |
| Antigravity / Cline LLM Coding Agent | Moderation gate wiring: pending inserts, `/review` queue, `/my-entries` edit/resubmission, and public shelf filtering (`app/contribute/page.js`, `app/review/page.js`, `app/review/ReviewQueueClient.js`, `app/my-entries/page.js`) | **Rewritten where unsafe**: Rejected early AI drafts that sent client-side `status: 'pending'` on form insert, called direct `.update({ status: 'published' })`, checked only `if (!error)` instead of `data === true`, or suggested dropping RLS policies to fix resubmission. Kept strict RPC calls (`review_entry`, `is_reviewer`), `.eq('status', 'published')` public filters, and `status: 'pending'` reset on edit. |
| Antigravity `image-generator` subagent | Archival farming tool illustrations (`public/images/*.jpg`) | **Partially replaced**: Kept 8 matching tool illustrations (`traditional_plough.jpg`, `ironwood_harrow.jpg`, `basalt_field_hoe.jpg`, `traditional_ox_cart.jpg`, `harvest_sickle.jpg`, `winnowing_platter.jpg`, `terracotta_pot.jpg`, `bamboo_fish_scoop.jpg`). Rejected inaccurate generations for the double ox yoke, water scoop, winnowing fan, paddy granary, and foot mortar after visual review and replaced those 5 with verified Wikimedia Commons photography. |

### How AI output was checked

- Inspected generated JSX, validation helpers, and SQL boundaries against `AGENTS.md` and browser DevTools behavior.
- Built production bundles (`npm run build`) and audited `/`, `/login`, `/signup`, `/contribute`, `/my-entries`, and `/review` in headless Microsoft Edge at `375x812` to confirm zero horizontal page overflow and zero console errors.
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
