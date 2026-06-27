"""
Seed script — populates initial reference data (allergens + food catalog).
Run once after `alembic upgrade head`:
    uv run python seed.py
"""

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import AsyncSessionLocal
from app.models import Allergen, FoodItem

# ── Allergens (EU 14 major allergens) ────────────────────────────────────────

ALLERGENS = [
    "Gluten",
    "Crustaceans",
    "Eggs",
    "Fish",
    "Peanuts",
    "Soy",
    "Milk",
    "Nuts",
    "Celery",
    "Mustard",
    "Sesame",
    "Sulfites",
    "Lupin",
    "Molluscs",
]

# ── Food catalog ──────────────────────────────────────────────────────────────
# Format: (name, category, sub_category, is_drink, allergen_names)

FOOD_ITEMS: list[tuple[str, str, str | None, bool, list[str]]] = [
    # Fruits
    ("Banana", "Plant", "Fruit", False, []),
    ("Apple", "Plant", "Fruit", False, []),
    ("Orange", "Plant", "Fruit", False, []),
    ("Plantain", "Plant", "Fruit", False, []),
    ("Avocado", "Plant", "Fruit", False, []),
    ("Blueberries", "Plant", "Fruit", False, []),
    ("Strawberries", "Plant", "Fruit", False, []),
    # Vegetables
    ("Broccoli", "Plant", "Vegetable", False, []),
    ("Spinach", "Plant", "Vegetable", False, []),
    ("Carrot", "Plant", "Vegetable", False, []),
    ("Zucchini", "Plant", "Vegetable", False, []),
    ("Sweet potato", "Plant", "Vegetable", False, []),
    ("Tomato", "Plant", "Vegetable", False, []),
    ("Cucumber", "Plant", "Vegetable", False, []),
    # Cereals / Grains
    ("Oatmeal", "Plant", "Cereal", False, ["Gluten"]),
    ("White rice", "Plant", "Cereal", False, []),
    ("Brown rice", "Plant", "Cereal", False, []),
    ("Quinoa", "Plant", "Cereal", False, []),
    ("Whole wheat bread", "Plant", "Bread", False, ["Gluten"]),
    ("Sourdough bread", "Plant", "Bread", False, ["Gluten"]),
    ("Granola", "Plant", "Cereal", False, ["Gluten", "Nuts"]),
    ("Pasta", "Plant", "Cereal", False, ["Gluten"]),
    # Legumes
    ("Lentils", "Plant", "Legume", False, []),
    ("Chickpeas", "Plant", "Legume", False, []),
    ("Black beans", "Plant", "Legume", False, []),
    # Meat
    ("Chicken breast", "Meat", "Poultry", False, []),
    ("Turkey", "Meat", "Poultry", False, []),
    ("Beef steak", "Meat", "Red meat", False, []),
    ("Ground beef", "Meat", "Red meat", False, []),
    ("Pork tenderloin", "Meat", "Pork", False, []),
    ("Lamb", "Meat", "Red meat", False, []),
    # Fish & Seafood
    ("Salmon", "Fish", "Fatty fish", False, ["Fish"]),
    ("Tuna", "Fish", "Fatty fish", False, ["Fish"]),
    ("Cod", "Fish", "White fish", False, ["Fish"]),
    ("Sardines", "Fish", "Fatty fish", False, ["Fish"]),
    ("Shrimp", "Fish", "Shellfish", False, ["Crustaceans"]),
    # Dairy
    ("Whole milk", "Dairy", "Milk", False, ["Milk"]),
    ("Greek yogurt", "Dairy", "Fermented", False, ["Milk"]),
    ("Plain yogurt", "Dairy", "Fermented", False, ["Milk"]),
    ("Cheddar cheese", "Dairy", "Cheese", False, ["Milk"]),
    ("Cottage cheese", "Dairy", "Cheese", False, ["Milk"]),
    ("Butter", "Dairy", "Fat", False, ["Milk"]),
    ("Eggs", "Dairy", "Eggs", False, ["Eggs"]),
    # Meals / Prepared dishes
    ("Chicken salad", "Meal", "Salad", False, []),
    ("Avocado toast", "Meal", "Bread", False, ["Gluten"]),
    ("Banana bread", "Meal", "Bread", False, ["Gluten", "Eggs"]),
    ("Oatmeal with banana", "Meal", "Cereal", False, ["Gluten"]),
    ("Yogurt with granola", "Meal", "Cereal", False, ["Milk", "Gluten", "Nuts"]),
    ("Caesar salad", "Meal", "Salad", False, ["Eggs", "Fish"]),
    ("Stir-fried vegetables", "Meal", "Cooked", False, []),
    ("Grilled chicken", "Meal", "Cooked", False, []),
    ("Salmon with rice", "Meal", "Cooked", False, ["Fish"]),
    # Drinks (is_drink=True)
    ("Water", "Drink", "Cold", True, []),
    ("Sparkling water", "Drink", "Cold", True, []),
    ("Black coffee", "Drink", "Hot", True, []),
    ("Espresso", "Drink", "Hot", True, []),
    ("Green tea", "Drink", "Hot", True, []),
    ("Herbal tea", "Drink", "Hot", True, []),
    ("Orange juice", "Drink", "Cold", True, []),
    ("Apple juice", "Drink", "Cold", True, []),
    ("Whole milk", "Drink", "Cold", True, ["Milk"]),
    ("Oat milk", "Drink", "Cold", True, ["Gluten"]),
    ("Almond milk", "Drink", "Cold", True, ["Nuts"]),
    ("Coconut water", "Drink", "Cold", True, []),
    ("Protein shake", "Drink", "Cold", True, ["Milk"]),
]


# ── Seed logic ────────────────────────────────────────────────────────────────


async def seed(session: AsyncSession) -> None:
    # 1. Allergens
    allergen_map: dict[str, Allergen] = {}
    for name in ALLERGENS:
        result = await session.execute(select(Allergen).where(Allergen.name == name))
        allergen = result.scalar_one_or_none()
        if allergen is None:
            allergen = Allergen(name=name)
            session.add(allergen)
            print(f"  + allergen: {name}")
        allergen_map[name] = allergen

    await session.flush()

    # 2. Food items
    for name, category, sub_category, is_drink, allergen_names in FOOD_ITEMS:
        result = await session.execute(select(FoodItem).where(FoodItem.name == name))
        existing = result.scalar_one_or_none()
        if existing is not None:
            continue
        item = FoodItem(
            name=name,
            category=category,
            sub_category=sub_category,
            is_drink=is_drink,
            allergens=[allergen_map[a] for a in allergen_names],
        )
        session.add(item)
        print(f"  + food: {name}")

    await session.commit()


async def main() -> None:
    print("Seeding database...")
    async with AsyncSessionLocal() as session:
        await seed(session)
    print("Done.")


if __name__ == "__main__":
    asyncio.run(main())
