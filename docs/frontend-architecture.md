# Frontend Architecture — datagest

## Stack & principes

| Élément | Choix |
|---|---|
| Framework | Angular 21 (standalone components) |
| Langage | TypeScript strict (`strict: true`) |
| État réactif | Signals Angular (`signal`, `computed`, `effect`) |
| Change detection | `OnPush` sur tous les composants |
| Style | SCSS, variables CSS custom properties, mobile-first |
| Build | esbuild/Vite (Angular 21 défaut) |
| Lazy loading | Feature `today` chargée à la demande via `loadChildren` |

---

## Arborescence

```
frontend/src/app/
│
├── app.ts                  # Root component (RouterOutlet uniquement)
├── app.html                # Shell <div class="app-shell">
├── app.scss                # Contrainte max-width 430px, height 100%
├── app.routes.ts           # Route racine → redirect vers /today
├── app.config.ts           # provideRouter, provideZonelessChangeDetection
│
├── layout/
│   └── bottom-nav/         # Barre de navigation inférieure + FAB central
│
└── features/
    └── today/              # Feature lazy-loadée
        ├── today.routes.ts
        ├── models/
        │   └── entry.model.ts      # Types, interfaces, constantes
        ├── services/
        │   └── today.service.ts    # État global de la feature (signals)
        ├── pages/
        │   └── today-page/         # Composant "smart" — orchestre tout
        └── components/             # Composants "dumb" — affichage seul
            ├── timeline-entry/
            ├── speed-dial/
            ├── entry-actions-sheet/
            ├── add-food-sheet/
            ├── add-stool-sheet/
            └── add-symptom-sheet/
```

---

## Modèles de données (`entry.model.ts`)

### `Entry` — entrée du journal

```typescript
interface Entry {
  id: string;
  type: 'food' | 'drink' | 'stool' | 'symptom';
  name: string;
  detail: string;       // texte libre résumant les options choisies
  time: string;         // format "HH:mm"
  date: string;         // format "YYYY-MM-DD"
  quality?: 'ideal' | 'normal' | 'concerning';  // selles uniquement
  intensity?: number;   // 1-10, symptômes uniquement
  bristolType?: number; // 1-7, selles uniquement
}
```

### `Food` — aliment du catalogue

```typescript
interface Food {
  id: string;
  name: string;
  category: string;
  subCategory: string;
  allergens: string[];
}
```

### Constantes

- **`BRISTOL_TYPES`** — 7 types d'échelle de Bristol avec label, description et qualité associée (`ideal` / `normal` / `concerning`)
- **`SYMPTOM_PRESETS`** — 8 symptômes fréquents (Bloating, Nausea, Abdominal pain…)

---

## Service (`today.service.ts`)

Service singleton (`providedIn: 'root'`). Contient l'intégralité de l'état de la feature sous forme de signals. Il n'y a **aucun appel HTTP** à ce stade — les données sont mockées en dur dans le service (à remplacer par des appels FastAPI).

### État

| Signal | Type | Rôle |
|---|---|---|
| `allEntries` (privé) | `signal<Entry[]>` | Toutes les entrées en mémoire |
| `currentDate` | `signal<Date>` | Jour affiché (navigation) |

### Computed

| Computed | Rôle |
|---|---|
| `currentDateEntries` | Filtre `allEntries` sur `currentDate`, trie par heure croissante |
| `hasNextDay` | `true` si `currentDate` est strictement antérieur à aujourd'hui |

### Méthodes

| Méthode | Rôle |
|---|---|
| `goToPreviousDay()` | Recule `currentDate` d'un jour |
| `goToNextDay()` | Avance `currentDate` d'un jour |
| `addEntry(data)` | Crée une entrée avec un id auto (timestamp) |
| `updateEntry(entry)` | Remplace l'entrée de même `id` |
| `deleteEntry(id)` | Supprime l'entrée |
| `searchFoods(query)` | Filtre le catalogue mock, retourne max 6 résultats |
| `formatDate(date)` | → `"YYYY-MM-DD"` |
| `formatDisplayDate(date)` | → `"Friday, 27 Jun"` |
| `isToday(date)` | Comparaison avec la date mock courante |

---

## Composant page (`today-page`)

C'est le **composant smart** : il lit le service, gère l'état UI local et orchestre tous les sous-composants. Il n'effectue aucun rendu de contenu métier directement.

### État local (signals)

```typescript
fabOpen        = signal<boolean>(false)
activeSheet    = signal<ActiveSheet>(null)   // null | 'actions' | 'food' | 'drink' | 'stool' | 'symptom'
selectedEntry  = signal<Entry | null>(null)
```

### Flux d'interaction

#### Ajouter une entrée
```
[FAB +] → fabOpen = true
  → SpeedDial s'affiche
  → [clic type] → onTypeSelected(type)
    → fabOpen = false, selectedEntry = null
    → activeSheet = type ('food' | 'drink' | 'stool' | 'symptom')
    → sheet d'ajout s'affiche (existingEntry = null → mode ajout)
    → [confirm] → svc.addEntry() → closed.emit() → closeSheet()
```

#### Modifier / supprimer une entrée
```
[tap sur TimelineEntry] → onEntryTapped(entry)
  → selectedEntry = entry, activeSheet = 'actions'
  → EntryActionsSheet s'affiche

  → [Edit] → onEditEntry()
    → activeSheet = entry.type
    → sheet correspondante s'affiche (existingEntry = entry → mode édition)
    → champs pré-remplis via effect() sur existingEntry
    → [confirm] → svc.updateEntry() → closed.emit() → closeSheet()

  → [Delete] → onDeleteEntry()
    → svc.deleteEntry(entry.id) → closeSheet()
```

#### Navigation entre jours
```
[← flèche] → svc.goToPreviousDay()
[→ flèche] → svc.goToNextDay()  (désactivée si currentDate = aujourd'hui)
```

---

## Composants présentationnels (dumb)

Ces composants **ne connaissent pas le service**. Ils reçoivent des données via `input()` et communiquent vers le parent via `output()`.

### `BottomNavComponent`

```
input:  fabOpen: boolean
output: fabClick: void
```

Affiche 4 onglets de navigation (Today, History, Foods, More) + le bouton FAB central. L'icône du FAB bascule entre `+` et `×` selon `fabOpen`.

### `SpeedDialComponent`

```
output: typeSelected: EntryType
```

Affiche 4 boutons circulaires (Food vert, Drink bleu, Stool ambre, Symptom orange). Un clic émet le type sélectionné vers `TodayPage`.

### `TimelineEntryComponent`

```
input:  entry: Entry
output: tapped: Entry
```

Carte affichant une entrée du journal. Le clic sur la carte émet `tapped` avec l'entrée complète, ce qui déclenche le sheet d'actions dans `TodayPage`.

### `EntryActionsSheetComponent`

```
input:  entry: Entry
output: edit: void | delete: void | closed: void
```

Bottom sheet contextuel affiché lors du tap sur une entrée. Présente un aperçu de l'entrée et deux boutons (Edit / Delete).

---

## Sheets de saisie (add/edit)

Les trois sheets partagent la même logique duale **ajout / édition** via l'input `existingEntry`.

| Input | Comportement |
|---|---|
| `existingEntry = null` | Mode ajout — heure pré-remplie avec l'heure actuelle |
| `existingEntry = Entry` | Mode édition — champs pré-remplis via `effect()` sur l'input |

Le CTA affiche `"Add to Today"` en ajout et `"Save changes"` en édition.

### `AddFoodSheetComponent`

```
input:  entryType: 'food' | 'drink'
        existingEntry: Entry | null
output: closed: void
```

**2 étapes** :
1. `search` — toggle Food/Drink, champ de recherche, liste de résultats du catalogue, option "Add as new"
2. `details` — préparation (Raw/Cooked), quantité (Small/Normal/Large), heure, bouton retour

En mode édition, l'étape `search` est sautée — on démarre directement à `details`.

### `AddStoolSheetComponent`

```
input:  existingEntry: Entry | null
output: closed: void
```

Affiche la légende et la barre dégradée de l'échelle de Bristol, puis les 7 types sous forme de cards cliquables. Le type sélectionné détermine la `quality` (`ideal` / `normal` / `concerning`) stockée avec l'entrée.

### `AddSymptomSheetComponent`

```
input:  existingEntry: Entry | null
output: closed: void
```

Grille de 8 presets cliquables + champ de saisie libre (mutuellement exclusifs). Slider d'intensité 1-10 avec label dynamique (mild / moderate / severe).

---

## Design system

Toutes les variables de design sont définies dans `src/styles.scss` en CSS custom properties et disponibles globalement.

### Palette de couleurs

```css
--color-teal / --color-teal-dark  /* couleur principale */
--color-bg                         /* fond général #f6f8f8 */
--color-text                       /* texte principal #0f2727 */
--color-muted                      /* texte secondaire #5f7070 */

/* par type d'entrée */
--color-food / --color-food-bg / --color-food-light
--color-drink / --color-drink-bg / --color-drink-light
--color-stool / --color-stool-bg / --color-stool-light
--color-symptom / --color-symptom-bg / --color-symptom-light
```

### Variables de layout

```css
--nav-height: 84px   /* hauteur de la bottom nav */
--fab-size: 62px     /* diamètre du FAB */
--safe-bottom: env(safe-area-inset-bottom, 0px)  /* encoche iPhone */
```

### Typographie

Police `Manrope` (Google Fonts), poids 400/500/600/700/800.

---

## Chaîne de hauteur mobile

L'app doit occuper 100% de l'écran sur mobile. La chaîne CSS est :

```
html, body        → height: 100%
app-root          → display: block; height: 100%
.app-shell        → height: 100%; display: flex; flex-direction: column
:host (today-page)→ display: block; flex: 1; min-height: 0
.today-page       → height: 100%; display: flex; flex-direction: column
.timeline-scroll  → flex: 1; overflow-y: auto
```

Le shell est contraint à `max-width: 430px; margin: 0 auto` pour simuler un format téléphone sur desktop.

---

## Animations

Deux animations CSS sont définies dans `today-page.component.scss` :

```scss
@keyframes fadeIn  { from { opacity: 0 }    to { opacity: 1 } }
@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
```

- **Scrim** (fond semi-transparent) : `fadeIn 0.2s ease`
- **Speed dial** : `slideUp 0.22s ease`
- **Bottom sheets** : `slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)`

---

## Lazy loading

La feature `today` est chargée à la demande :

```typescript
// app.routes.ts
{ path: 'today', loadChildren: () => import('./features/today/today.routes').then(m => m.TODAY_ROUTES) }

// today.routes.ts
{ path: '', loadComponent: () => import('./pages/today-page/today-page.component').then(m => m.TodayPageComponent) }
```

Le bundle de production génère un chunk séparé `today-page-component` (~57 KB brut), chargé uniquement à la première navigation vers `/today`.

---

## Ce qui reste à faire

| Élément | État |
|---|---|
| Page History | Non implémentée |
| Page Foods (catalogue) | Non implémentée |
| Intégration backend FastAPI | Non implémentée — données mockées dans `today.service.ts` |
| Dark mode | Variables CSS prêtes, classes non appliquées |
| Layout desktop (>768px) | Prévu, non implémenté |
| Tests unitaires | Non écrits |
