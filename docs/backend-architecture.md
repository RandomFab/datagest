# Backend Architecture — datagest

## Stack & principes

| Élément | Choix |
|---|---|
| Framework | FastAPI (Python 3.12+) |
| Langage | Python typé intégralement (`Annotated`, types stricts) |
| ORM | SQLAlchemy 2.0 — mode async (`AsyncSession`) |
| Validation I/O | Pydantic v2 (`BaseModel`, `ConfigDict`, `Field`) |
| Migrations | Alembic |
| Base de données | PostgreSQL (driver `asyncpg`) |
| Serveur | Uvicorn (ASGI) |
| Cible déploiement | Raspberry Pi — Docker ARM slim |

**Principe cardinal** : les routers sont fins. La logique métier vit dans les services, l'accès aux données dans les repositories. Un router FastAPI n'appelle jamais SQLAlchemy directement.

```
Request → Router → Service → Repository → PostgreSQL
                ↕               ↕
           Pydantic          SQLAlchemy
          (schémas I/O)      (modèles DB)
```

---

## Arborescence

```
backend/
├── app/
│   ├── main.py                  # Point d'entrée ASGI, CORS, montage du router
│   │
│   ├── core/
│   │   └── config.py            # Settings via pydantic-settings (.env)
│   │
│   ├── database/
│   │   ├── session.py           # Engine async, AsyncSessionLocal, get_session()
│   │   └── deps.py              # DBSession — type alias FastAPI Depends
│   │
│   ├── models/                  # Tables SQLAlchemy (source de vérité DB)
│   │   ├── base.py              # DeclarativeBase
│   │   ├── enums.py             # Énumérations Python (AllergenName, FoodCategory…)
│   │   ├── food.py              # Allergen, FoodItem, table d'association
│   │   └── log.py               # FoodLog, StoolLog, SymptomLog
│   │
│   ├── schemas/                 # Schémas Pydantic (validation I/O API)
│   │   ├── food.py              # AllergenRead, FoodItemSummary, FoodItemRead/Create/Update
│   │   ├── log.py               # FoodLogRead/Create/Update, StoolLog*, SymptomLog*
│   │   └── dashboard.py         # DaySummary
│   │
│   ├── repositories/            # Requêtes SQL — aucune logique métier
│   │   ├── food.py              # AllergenRepository, FoodItemRepository
│   │   └── log.py               # FoodLogRepository, StoolLogRepository, SymptomLogRepository
│   │
│   ├── services/                # Logique métier — aucune requête SQL directe
│   │   ├── food.py              # AllergenService, FoodItemService
│   │   └── log.py               # FoodLogService, StoolLogService, SymptomLogService
│   │
│   └── api/
│       └── v1/
│           ├── router.py        # Agrège tous les sous-routers sous /api/v1
│           └── routes/
│               ├── health.py        # GET /health, GET /health/db
│               ├── allergens.py     # GET /allergens
│               ├── foods.py         # CRUD /foods
│               ├── logs_food.py     # CRUD /logs/food
│               ├── logs_stools.py   # CRUD /logs/stools
│               ├── logs_symptoms.py # CRUD /logs/symptoms
│               └── dashboard.py     # GET /dashboard/day
│
├── alembic/                     # Migrations de schéma
└── tests/                       # Tests pytest (à venir)
```

---

## Modèles de données (SQLAlchemy)

### `Allergen`

```python
class Allergen(Base):
    __tablename__ = "allergens"

    id       : int          # PK
    name     : AllergenName # unique, NOT NULL (enum 14 valeurs EU)
```

14 allergènes réglementaires EU : Gluten, Crustaceans, Eggs, Fish, Peanuts, Soy, Milk, Nuts, Celery, Mustard, Sesame, Sulfites, Lupin, Molluscs.

### `FoodItem`

```python
class FoodItem(Base):
    __tablename__ = "food_items"

    id           : int          # PK
    name         : str          # unique, NOT NULL, max 255
    category     : FoodCategory # Plant | Meat | Dairy | Fish | Drink | Meal
    sub_category : str | None
    is_drink     : bool         # default False
    created_at   : datetime     # server_default now()
    allergens    : list[Allergen]  # M2M via food_item_allergens
```

### Table d'association `food_item_allergens`

```
food_items  ←──────────────────→  allergens
           food_item_id | allergen_id
           (CASCADE DELETE des deux côtés)
```

### `FoodLog`

```python
class FoodLog(Base):
    __tablename__ = "food_log"

    id           : int               # PK
    food_item_id : int | None        # FK → food_items (SET NULL on delete)
    custom_name  : str | None        # si aliment hors catalogue
    entry_type   : EntryType         # 'food' | 'drink'
    preparation  : Preparation | None # 'raw' | 'cooked'
    quantity     : Quantity | None   # 'small' | 'normal' | 'large'
    volume_ml    : int | None        # pour les boissons
    logged_at    : datetime          # NOT NULL
    notes        : str | None
```

### `StoolLog`

```python
class StoolLog(Base):
    __tablename__ = "stool_log"

    id           : int          # PK
    bristol_type : int          # CHECK 1–7 (échelle de Bristol)
    quality      : StoolQuality # 'ideal' | 'normal' | 'concerning'
    logged_at    : datetime     # NOT NULL
    notes        : str | None
```

### `SymptomLog`

```python
class SymptomLog(Base):
    __tablename__ = "symptom_log"

    id        : int      # PK
    name      : str      # texte libre (presets suggérés côté frontend)
    intensity : int      # CHECK 1–10
    logged_at : datetime # NOT NULL
    notes     : str | None
```

---

## Schémas Pydantic (I/O)

Les schémas sont distincts des modèles SQLAlchemy. Trois variantes par ressource : **Read** (réponse API), **Create** (corps POST), **Update** (corps PATCH — tous les champs optionnels).

### Hiérarchie `food.py`

```
AllergenRead
  └─ id, name

FoodItemSummary              ← embarqué dans FoodLogRead
  └─ id, name, category, sub_category, is_drink

FoodItemRead                 ← réponse GET /foods
  └─ id, name, category, sub_category, is_drink, created_at
     allergens: list[AllergenRead]

FoodItemCreate               ← corps POST /foods
  └─ name, category, sub_category?, is_drink, allergen_ids: list[int]

FoodItemUpdate               ← corps PATCH /foods/{id}
  └─ (tous optionnels) name?, category?, sub_category?, is_drink?, allergen_ids?
```

### Hiérarchie `log.py`

```
FoodLogRead                  ← réponse GET /logs/food
  └─ id, food_item: FoodItemSummary | None, custom_name?,
     entry_type, preparation?, quantity?, volume_ml?, logged_at, notes?

FoodLogCreate                ← corps POST /logs/food
  └─ food_item_id?, custom_name?, entry_type, preparation?,
     quantity?, volume_ml? (≥1), logged_at, notes?

FoodLogUpdate                ← corps PATCH /logs/food/{id}
  └─ preparation?, quantity?, volume_ml?, logged_at?, notes?

StoolLogRead / Create / Update   ← même pattern
SymptomLogRead / Create / Update ← même pattern
```

### `dashboard.py`

```
DaySummary                   ← réponse GET /dashboard/day
  └─ date: date
     food_logs    : list[FoodLogRead]
     stool_logs   : list[StoolLogRead]
     symptom_logs : list[SymptomLogRead]
```

---

## Couche Repository

Les repositories sont des classes recevant une `AsyncSession`. Ils ne contiennent que des requêtes SQLAlchemy — zéro logique métier.

### Pattern commun aux logs

Un helper partagé évite la répétition du filtre date sur les 3 tables :

```python
def _apply_date_filters(stmt, col, *, logged_date, from_, to) -> Select:
    if logged_date:
        # filtre sur la journée entière (00:00:00 → 23:59:59.999999)
        return stmt.where(col.between(start, end))
    if from_: stmt = stmt.where(col >= from_)
    if to:    stmt = stmt.where(col <= to)
    return stmt
```

### Eager loading `FoodLog.food_item`

SQLAlchemy async interdit le lazy-load. Toutes les requêtes `FoodLog` chargent la relation en une seule requête SQL via `selectinload` :

```python
def _base_stmt(self):
    return select(FoodLog).options(selectinload(FoodLog.food_item))
```

Le `create` et l'`update` relisent l'entrée avec `get_by_id` après le commit pour garantir que la relation est présente dans la réponse.

### Interfaces

| Repository | Méthodes |
|---|---|
| `AllergenRepository` | `list_all()`, `get_by_ids(ids)` |
| `FoodItemRepository` | `list_all(category, is_drink, search, allergen_id)`, `get_by_id(id)`, `create(data, allergens)`, `update(item, data, allergens)`, `delete(item)` |
| `FoodLogRepository` | `list_all(logged_date, from_, to, entry_type)`, `get_by_id(id)`, `create(data)`, `update(log, data)`, `delete(log)`, `list_for_day(date)` |
| `StoolLogRepository` | même pattern sans `entry_type` |
| `SymptomLogRepository` | même pattern + filtre `name` (ilike) |

---

## Couche Service

Les services reçoivent une `AsyncSession`, instancient leurs repositories et ajoutent la logique métier : erreurs HTTP 404, validation de cohérence des IDs, etc.

### `FoodItemService` — logique notable

**Résolution des allergènes** : lors d'un `create` ou `update`, le service vérifie que tous les `allergen_ids` fournis existent réellement en base. Si un ID est invalide, il lève un `422 Unprocessable Entity` avant tout `INSERT`.

```python
async def _resolve_allergens(self, ids: list[int]) -> list[Allergen]:
    allergens = await self.allergen_repo.get_by_ids(ids)
    if len(allergens) != len(ids):
        raise HTTPException(422, "One or more allergen IDs are invalid")
    return allergens
```

**404 centralisé** : `get_or_404(id)` est la seule méthode qui lève un `404`. Tous les endpoints passent par elle avant de modifier ou supprimer une ressource.

### Interfaces

| Service | Méthodes publiques |
|---|---|
| `AllergenService` | `list_all()` |
| `FoodItemService` | `list_all(...)`, `get_or_404(id)`, `create(data)`, `update(id, data)`, `delete(id)` |
| `FoodLogService` | `list_all(...)`, `get_or_404(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `list_for_day(date)` |
| `StoolLogService` | même pattern |
| `SymptomLogService` | même pattern |

---

## Endpoints API

Tous les endpoints sont préfixés `/api/v1`.

### Health

| Méthode | URL | Réponse |
|---|---|---|
| `GET` | `/health` | `{"status": "ok"}` |
| `GET` | `/health/db` | `{"status": "ok"}` ou erreur 500 |

### Référentiel alimentaire

| Méthode | URL | Description |
|---|---|---|
| `GET` | `/allergens` | Liste des 14 allergènes EU (lecture seule) |
| `GET` | `/foods` | Liste avec filtres `category`, `is_drink`, `search`, `allergen_id` |
| `POST` | `/foods` | Créer un aliment — `201 Created` |
| `GET` | `/foods/{id}` | Détail d'un aliment — `404` si absent |
| `PATCH` | `/foods/{id}` | Mise à jour partielle |
| `DELETE` | `/foods/{id}` | Suppression — `204 No Content` |

### Journaux

| Méthode | URL | Filtres query |
|---|---|---|
| `GET` | `/logs/food` | `date`, `from_`, `to`, `entry_type` |
| `POST` | `/logs/food` | — |
| `GET` | `/logs/food/{id}` | — |
| `PATCH` | `/logs/food/{id}` | — |
| `DELETE` | `/logs/food/{id}` | — |
| `GET` | `/logs/stools` | `date`, `from_`, `to` |
| `POST` | `/logs/stools` | — |
| `GET` | `/logs/stools/{id}` | — |
| `PATCH` | `/logs/stools/{id}` | — |
| `DELETE` | `/logs/stools/{id}` | — |
| `GET` | `/logs/symptoms` | `date`, `from_`, `to`, `name` |
| `POST` | `/logs/symptoms` | — |
| `GET` | `/logs/symptoms/{id}` | — |
| `PATCH` | `/logs/symptoms/{id}` | — |
| `DELETE` | `/logs/symptoms/{id}` | — |

### Dashboard

| Méthode | URL | Paramètre | Réponse |
|---|---|---|---|
| `GET` | `/dashboard/day` | `?day=YYYY-MM-DD` | `DaySummary` |

---

## Configuration

Toute la config est lue depuis les variables d'environnement via `pydantic-settings` — aucun secret en dur.

```python
# .env (jamais commité)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=datagest
DB_USER=postgres
DB_PASSWORD=postgres
DEBUG=false
```

L'URL de connexion est construite dynamiquement en `@computed_field` :

```
postgresql+asyncpg://{USER}:{PASSWORD}@{HOST}:{PORT}/{NAME}
```

---

## Injection de dépendances

FastAPI injecte la session DB via un type alias `Annotated` — une seule ligne à importer dans chaque router :

```python
# database/deps.py
DBSession = Annotated[AsyncSession, Depends(get_session)]

# dans un router
async def list_foods(db: DBSession, ...):
    return await FoodItemService(db).list_all(...)
```

Le service est instancié à chaque requête avec la session du contexte. Ce pattern garantit qu'une session n'est jamais partagée entre requêtes.

---

## Ce qui reste à faire

| Élément | État |
|---|---|
| Intégration frontend — remplacer les mocks | **Implémenté** |
| Pagination (`limit` / `offset`) sur les listes | Non implémenté |
| Endpoint `GET /dashboard/timeline?from=&to=` | Non implémenté |
| Authentification (optionnel — app mono-utilisateur) | Non implémenté |
| Tests pytest (repositories + services) | Non écrits |
| Dockerisation (Dockerfile + docker-compose) | Non implémenté |
| HTTPS + reverse proxy (Nginx) | Non implémenté |
