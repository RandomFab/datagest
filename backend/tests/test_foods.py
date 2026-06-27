import pytest
from httpx import AsyncClient

BASE = "/api/v1"

FOOD_PLANT = {"name": "Banana", "category": "Plant", "is_drink": False}


@pytest.mark.asyncio
async def test_list_allergens_empty(client: AsyncClient):
    r = await client.get(f"{BASE}/allergens")
    assert r.status_code == 200
    assert r.json() == []


@pytest.mark.asyncio
async def test_list_allergens_seeded(client: AsyncClient, seeded_allergens: list[int]):
    r = await client.get(f"{BASE}/allergens")
    assert r.status_code == 200
    assert len(r.json()) == 2


@pytest.mark.asyncio
async def test_create_food_minimal(client: AsyncClient):
    r = await client.post(f"{BASE}/foods", json=FOOD_PLANT)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Banana"
    assert data["category"] == "Plant"
    assert data["allergens"] == []
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_food_with_allergens(client: AsyncClient, seeded_allergens: list[int]):
    r = await client.post(
        f"{BASE}/foods",
        json={
            "name": "Bread",
            "category": "Plant",
            "is_drink": False,
            "allergen_ids": seeded_allergens,
        },
    )
    assert r.status_code == 201
    assert len(r.json()["allergens"]) == 2


@pytest.mark.asyncio
async def test_create_food_invalid_allergen(client: AsyncClient):
    r = await client.post(
        f"{BASE}/foods",
        json={"name": "Test", "category": "Plant", "is_drink": False, "allergen_ids": [9999]},
    )
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_get_food(client: AsyncClient):
    created = await client.post(
        f"{BASE}/foods", json={"name": "Apple", "category": "Plant", "is_drink": False}
    )
    food_id = created.json()["id"]

    r = await client.get(f"{BASE}/foods/{food_id}")
    assert r.status_code == 200
    assert r.json()["name"] == "Apple"


@pytest.mark.asyncio
async def test_get_food_not_found(client: AsyncClient):
    r = await client.get(f"{BASE}/foods/99999")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_list_foods(client: AsyncClient):
    await client.post(
        f"{BASE}/foods", json={"name": "Apple", "category": "Plant", "is_drink": False}
    )
    await client.post(
        f"{BASE}/foods", json={"name": "Milk", "category": "Dairy", "is_drink": False}
    )

    r = await client.get(f"{BASE}/foods")
    assert r.status_code == 200
    assert len(r.json()) == 2


@pytest.mark.asyncio
async def test_list_foods_filter_category(client: AsyncClient):
    await client.post(
        f"{BASE}/foods", json={"name": "Apple", "category": "Plant", "is_drink": False}
    )
    await client.post(
        f"{BASE}/foods", json={"name": "Water", "category": "Drink", "is_drink": True}
    )

    r = await client.get(f"{BASE}/foods?category=Plant")
    assert r.status_code == 200
    names = [f["name"] for f in r.json()]
    assert "Apple" in names
    assert "Water" not in names


@pytest.mark.asyncio
async def test_patch_food(client: AsyncClient, seeded_allergens: list[int]):
    created = await client.post(
        f"{BASE}/foods", json={"name": "Old name", "category": "Plant", "is_drink": False}
    )
    food_id = created.json()["id"]

    r = await client.patch(
        f"{BASE}/foods/{food_id}",
        json={"name": "New name", "allergen_ids": [seeded_allergens[0]]},
    )
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "New name"
    assert len(data["allergens"]) == 1


@pytest.mark.asyncio
async def test_delete_food(client: AsyncClient):
    created = await client.post(
        f"{BASE}/foods", json={"name": "ToDelete", "category": "Plant", "is_drink": False}
    )
    food_id = created.json()["id"]

    r = await client.delete(f"{BASE}/foods/{food_id}")
    assert r.status_code == 204

    r = await client.get(f"{BASE}/foods/{food_id}")
    assert r.status_code == 404
