# datagest — Application Description

> Personal food & gut-transit tracking application.
> This document is the functional reference for the **data collection** phase (phase 1).
> Analysis features are explicitly out of scope for now but kept in mind in the design.

---

## 1. Concept

**datagest** is a personal health-tracking application that lets a single user log
**what they eat** and **how their digestive system reacts**, in order to later
understand the influence of food on intestinal transit.

The first version focuses **exclusively on data collection**: fast, low-friction
logging of meals, drinks, bowel movements and symptoms throughout the day.
Analysis, correlations and insights are a deliberate **future phase** — but the data
model is designed now so that this evolution is possible without rework.

---

## 2. Target & value

- **Target user**: the developer/owner, single user, personal use. No multi-user,
  no account system required in phase 1 (kept simple and local).
- **Problem solved**: there is currently no easy, structured way to capture the
  day-to-day relationship between diet and digestive comfort. Memory is unreliable;
  paper notes are not exploitable.
- **Value**: build a clean, structured, timestamped dataset that is pleasant to feed
  daily and ready to be analyzed later (patterns, trigger foods, transit quality
  over time).

---

## 3. Scope

### In scope (phase 1 — collection)
- Log **food** intake (item, preparation, time).
- Log **drinks / hydration**.
- Log **bowel movements** with quality (Bristol scale) and time.
- Log **symptoms** (abdominal pain, bloating, gas…) with intensity and time.
- Browse / edit / delete past entries (a daily timeline).
- Manage an enriched **food reference database** (allergens + nature/type per food).

### Out of scope (later phases)
- Data analysis, charts, correlations, food–symptom causality.
- Recommendations or diagnostics.
- Multi-user, sharing, export to a doctor (may come later).
- Notifications / reminders (nice-to-have, not phase 1).

---

## 4. Core domain model

The application is built around **time-stamped events** of different types, all
attached to a day. Every event has a precise timestamp because timing is central to
the future analysis.

### 4.1 Food entry
A single food eaten at a given moment.
- **Food** — selected from the **food reference database** (see 4.6) with
  autocompletion; the user can create a new food on the fly. The food carries its own
  enrichment (allergens, nature), so logging stays fast while the data stays rich.
- **Preparation / form** — `raw` / `cooked` (extensible enum, e.g. later: fried,
  steamed, fermented…).
- **Quantity** *(optional, lightweight)* — free indication for now (e.g. small /
  normal / large) to avoid friction; precise grams are not required in phase 1.
- **Time** — timestamp of consumption (defaults to "now", editable).

> Note: a "meal" is **not** a rigid entity. The user logs individual foods; meals can
> be reconstructed later by grouping foods close in time. This keeps logging fast.

### 4.2 Drink entry
A drink consumed at a given moment (hydration matters for transit).
- **Drink** — from the catalog (water, coffee, tea, alcohol, soda…), with
  autocompletion.
- **Quantity** *(optional)* — light scale (glass / cup / bottle…) for now.
- **Time** — timestamp.

### 4.3 Bowel movement entry
- **Stool quality** — **Bristol Stool Scale (types 1–7)**:
  1. Separate hard lumps (very constipated)
  2. Lumpy, sausage-shaped (slightly constipated)
  3. Sausage with cracks on surface (normal)
  4. Smooth, soft sausage (normal / ideal)
  5. Soft blobs with clear edges (lacking fiber)
  6. Mushy, ragged edges (mild diarrhea)
  7. Watery, no solid pieces (diarrhea)
  The UI shows simple labels (and ideally an icon/description per type) so the user
  does not need to memorize the scale.
- **Time** — timestamp.
- **Note** *(optional)* — free text.

### 4.4 Symptom entry
- **Symptom type** — abdominal pain, bloating, gas… (extensible enum).
- **Intensity** — scale **1 to 10**.
- **Time** — timestamp (and optionally a duration / "still ongoing" later).
- **Note** *(optional)* — free text.

### 4.5 Day / timeline
All entries are grouped and displayed by **day**, ordered by time, forming a single
chronological timeline mixing foods, drinks, bowel movements and symptoms.

### 4.6 Food reference database
The heart of structured logging: a reusable, user-owned library of foods and drinks,
**enriched with metadata** so that future analysis can group and correlate by
properties — not only by name.

- Created and enriched progressively (add-on-the-fly while logging, then refined).
- Provides **autocompletion** during entry → structured, deduplicated data.
- Each item carries:
  - **Name** — display name (e.g. "Beef steak", "White bread", "Apple").
  - **Category** — `food` / `drink`.
  - **Allergens** — a **set** (many-to-many): a food can contain several allergens.
    Backed by a controlled reference list rather than free text, so filtering is
    reliable. Recommended baseline = the **14 EU regulated allergens**: gluten,
    crustaceans, eggs, fish, **peanuts**, soybeans, milk/lactose, nuts (tree nuts),
    celery, mustard, sesame, sulphites, lupin, molluscs. Extensible.
  - **Nature / type** — a **classification (taxonomy)** describing what the food
    fundamentally is, for analysis like "roots vs leaves" or "red meat vs poultry".
    Modeled as a **main category + subtype**, e.g.:
    - *Meat* → bovine, pork, poultry, lamb, game…
    - *Fish / seafood* → fish, shellfish, mollusc…
    - *Plant* → fruit, vegetable (leaf), root/tuber, legume, cereal/grain, nut/seed,
      herb/spice…
    - *Dairy*, *Egg*, *Fat/oil*, *Beverage*, *Processed/other*…
  - **Notes** *(optional)* — free text.

> **Design note — controlled vocabularies.** Allergens and the nature taxonomy are
> **reference enums/tables**, not free text. This is what makes future analysis
> possible (reliable grouping, no typos/duplicates). The nature taxonomy is kept as a
> two-level structure (category → subtype) to stay simple while allowing meaningful
> aggregation.

> **Design note — reference vs. log separation.** The enriched food belongs to the
> reference database; a food *entry* (4.1) just points to it plus the
> moment-specific data (preparation, quantity, time). Editing a food's metadata later
> retroactively enriches all past entries that reference it.

---

## 5. Key screens

The app is **mobile-first** (installable PWA) — designed for quick logging on the
phone right after eating or after a bowel movement.

1. **Today (home / timeline)**
   - Default landing screen.
   - Chronological list of the day's events (food, drink, stool, symptom), each with
     its time and a clear type indicator (icon + color).
   - Prominent **quick-add** actions (the main job of the app).
   - States handled: empty (no entry yet), populated, loading, error.

2. **Quick add (food / drink)**
   - Search/autocomplete from the food database, choose preparation (raw/cooked) for
     food, optional quantity, time pre-filled to now.
   - "Add new food" path when not found → quick create with name + category, allergens
     and nature can be filled now or later.

3. **Quick add (bowel movement)**
   - Bristol scale selector (visual, 1–7), time, optional note.

4. **Quick add (symptom)**
   - Symptom type, intensity slider (1–10), time, optional note.

5. **History**
   - Browse previous days, scroll back in time, edit or delete past entries.

6. **Food database management**
   - View / search / edit / merge / delete foods.
   - Edit each food's **allergens** and **nature/type**; bulk-clean the library over
     time (filter by allergen or nature, find duplicates).

---

## 6. UX / UI principles

- **Speed of entry is the #1 priority.** Logging a food or a bowel movement must take
  a few taps. Default the time to "now"; make corrections optional.
- **Mobile-first**, thumb-reachable primary actions, large touch targets.
- **Clear visual hierarchy** by event type: consistent icon + color for food, drink,
  stool, symptom across the whole app.
- **Explicit states**: loading, empty, error, success — never a blank ambiguous
  screen.
- **Low cognitive load**: the Bristol scale and intensity scale are shown with plain
  labels/visuals, not raw numbers alone.
- **Accessibility**: sufficient contrast, keyboard navigation, proper labels,
  responsive layout.
- A small **design system / UI kit** lives in `frontend/src/app/shared/` (spacing,
  colors, typography, reusable components).

---

## 7. Technical constraints

- **Frontend**: Angular (standalone components, signals, OnPush), TypeScript strict,
  delivered as an installable **PWA** (offline-friendly entry is a desirable goal so
  logging works even with poor connectivity).
- **Backend**: FastAPI (Python 3.12+), async, Pydantic v2.
- **Database**: PostgreSQL via SQLAlchemy 2.0 + Alembic migrations.
- **Deployment target**: personal **Raspberry Pi**, everything in Docker
  (`docker-compose`): Nginx serving the Angular build, Uvicorn/Gunicorn backend,
  Postgres. ARM-compatible, lightweight images, resource-conscious.
- All configuration via environment variables; no secret in code.

> Phase 1 can technically start as a front-end-driven collector, but the backend +
> Postgres design is defined from the start so that collected data is persisted in a
> structured, analyzable store rather than only in the browser.

---

## 8. Future phases (vision, not committed)

- **Analysis**: timelines, food↔symptom and food↔stool correlations, identification
  of likely trigger foods, transit-quality trends over time.
- **Insights & reminders**: gentle prompts to log, daily summaries.
- **Export**: shareable report (e.g. for a gastroenterologist).
- **Richer factors**: stress, sleep, medication/supplements (known transit
  influencers) — explicitly considered now so the event model stays extensible.

---

## 9. Design decisions log

| Decision | Choice | Rationale |
|---|---|---|
| Food input | Reusable **catalog + autocomplete** | Structured, deduplicated data for future analysis. |
| Food enrichment | Each food carries **allergens (set) + nature/type (taxonomy)** | Enables analysis by property (allergen, food family), not just by name. |
| Allergen list | **14 EU regulated allergens** as controlled list | Recognized standard; reliable filtering; extensible. |
| Nature taxonomy | **Two-level (category → subtype)** controlled vocabulary | Meaningful aggregation (e.g. roots vs leaves) while staying simple. |
| Stool quality | **Bristol Stool Scale (1–7)** | Recognized medical standard; clinically exploitable; covers the user's categories. |
| Primary platform | **Mobile PWA** | Daily on-the-go logging right after meals. |
| Extra factors (phase 1) | **Drinks/hydration + detailed symptoms** | Direct, high-value transit influencers; stress/sleep/medication deferred. |
| Meal modeling | **Individual food events**, not rigid meals | Faster logging; meals reconstructed later by time grouping. |
