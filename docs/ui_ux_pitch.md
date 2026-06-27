# datagest — UI/UX Pitch (Claude Design brief)

> Design brief ready to paste into a generative UI tool (Claude Design).
> Source of truth for scope & domain: [`app_description.md`](./app_description.md).
> Written in English on purpose: design tools are more precise in English, and the
> functional reference is already in English.

---

## 1. Concept
A mobile-first personal health app to log, in just a few taps, what I eat/drink and how my
digestive system reacts (bowel movements + symptoms), building a clean timestamped dataset
to later understand the link between food and gut transit. Phase 1 = fast daily data entry only
(no charts/analytics yet).

## 2. Target & value
Single user (the owner), personal use, no login/account in this phase. The #1 value is
SPEED & LOW FRICTION: logging an event right after a meal or a bathroom visit must feel
instant and effortless, while producing structured, analyzable data.

## 3. Key screens

1. **TODAY (home / timeline)** — default screen.
   - Chronological feed of the day's events mixing 4 types: food, drink, bowel movement,
     symptom. Each item shows time + a consistent type icon & color + a short summary.
   - Sticky, thumb-reachable QUICK-ADD as the hero action (a prominent FAB or a 4-button
     speed-dial: Food / Drink / Stool / Symptom).
   - Show all states: empty (no entry yet, friendly prompt to log first event), populated,
     loading (skeletons), error.
   - Lightweight day header with date and a way to step to previous/next day.

2. **QUICK ADD — FOOD/DRINK** (bottom sheet or full-screen mobile modal)
   - Big search/autocomplete field on the food reference database.
   - For food: raw/cooked toggle, optional light quantity (small / normal / large), time
     pre-filled to "now" but editable.
   - "Add new food" path when no match → quick create (name + category food/drink);
     allergens & nature/type can be filled now OR later (don't block logging).

3. **QUICK ADD — BOWEL MOVEMENT**
   - Visual Bristol Stool Scale selector, types 1–7, each as a tappable card with a simple
     icon + plain label (e.g. "Hard lumps", "Smooth soft sausage", "Watery") and a color
     gradient from constipated → ideal → diarrhea. Time + optional note.

4. **QUICK ADD — SYMPTOM**
   - Symptom type chips (abdominal pain, bloating, gas…), intensity slider 1–10 with clear
     low/high labeling and color feedback, time, optional note.

5. **HISTORY**
   - Browse previous days, scroll back in time, edit/delete past entries (swipe actions or
     per-item menu).

6. **FOOD DATABASE MANAGEMENT**
   - Search/list of foods & drinks; edit each item's allergens (multi-select from the 14 EU
     regulated allergens) and its nature/type (two-level: category → subtype, e.g. Meat →
     poultry, Plant → root/tuber). Filter by allergen or nature; merge/delete duplicates.

## 4. Tone & visual style
- Clean, calm, "health & wellness" feel — trustworthy and clinical-but-friendly, NOT playful
  or childish, NOT a heavy medical/enterprise dashboard.
- Mobile-first PWA: large touch targets, primary actions in the thumb zone, generous spacing,
  big readable type. Light mode primary; design with a dark mode in mind.
- A clear, consistent COLOR + ICON system per event type, reused everywhere:
  - Food = green, Drink = blue, Bowel movement = amber/brown, Symptom = red/orange.
- Neutral background, one calm primary accent (soft teal/green) for main CTAs, semantic colors
  for states (success/warning/error). Rounded cards, soft shadows, comfortable padding.
- Modern sans-serif, strong visual hierarchy, minimal cognitive load. Numbers (Bristol 1–7,
  intensity 1–10) always paired with plain labels/visuals, never raw numbers alone.
- Accessible: high contrast, visible focus states, proper labels, fully responsive.

## 5. Main features (actionable)
- One-tap-to-open quick add for the 4 event types from the Today screen.
- Autocomplete from a reusable food/drink reference database, with on-the-fly creation.
- Bristol scale (1–7) and intensity (1–10) as friendly visual selectors.
- Time defaults to "now", editable; corrections optional.
- Daily timeline merging all event types, ordered by time.
- History browsing with edit/delete.
- Food database management with allergens (14 EU set) + two-level nature taxonomy, filtering
  and de-duplication.
- Explicit empty / loading / error / success states on every screen.

## 6. Technical constraints (for layout realism)
- Frontend Angular (standalone components, signals, OnPush), TypeScript strict, delivered as an
  installable mobile PWA (offline-friendly entry desirable).
- Backend FastAPI + PostgreSQL (SQLAlchemy 2.0). Deployed in Docker on a personal Raspberry Pi
  (ARM, resource-conscious) — keep the UI lightweight.
- Design primarily for phone screens (~390px wide); ensure it scales gracefully to tablet/desktop.

## What I want from you
Mobile-first high-fidelity mockups of: (1) Today/timeline (empty + populated), (2) the food
quick-add bottom sheet with autocomplete, (3) the Bristol scale selector, (4) the symptom add
with intensity slider. Show the shared color/icon system across event types.
