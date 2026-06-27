import pytest
from httpx import AsyncClient

BASE = "/api/v1"

FOOD_LOG_PAYLOAD = {
    "entry_type": "food",
    "quantity": "normal",
    "logged_at": "2026-06-27T08:00:00",
}

STOOL_LOG_PAYLOAD = {
    "bristol_type": 4,
    "quality": "normal",
    "logged_at": "2026-06-27T09:00:00",
}

SYMPTOM_LOG_PAYLOAD = {
    "name": "bloating",
    "intensity": 5,
    "logged_at": "2026-06-27T10:00:00",
}


# ---------------------------------------------------------------------------
# Food logs
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_food_log_no_item(client: AsyncClient):
    """Log a free-text entry without linking a food item."""
    r = await client.post(
        f"{BASE}/logs/food", json={**FOOD_LOG_PAYLOAD, "custom_name": "Homemade soup"}
    )
    assert r.status_code == 201
    data = r.json()
    assert data["custom_name"] == "Homemade soup"
    assert data["food_item"] is None


@pytest.mark.asyncio
async def test_create_food_log_with_item(client: AsyncClient):
    food = await client.post(
        f"{BASE}/foods", json={"name": "Banana", "category": "Plant", "is_drink": False}
    )
    food_id = food.json()["id"]

    r = await client.post(f"{BASE}/logs/food", json={**FOOD_LOG_PAYLOAD, "food_item_id": food_id})
    assert r.status_code == 201
    data = r.json()
    assert data["food_item"]["id"] == food_id
    assert data["food_item"]["name"] == "Banana"


@pytest.mark.asyncio
async def test_list_food_logs(client: AsyncClient):
    await client.post(f"{BASE}/logs/food", json={**FOOD_LOG_PAYLOAD, "custom_name": "A"})
    await client.post(f"{BASE}/logs/food", json={**FOOD_LOG_PAYLOAD, "custom_name": "B"})

    r = await client.get(f"{BASE}/logs/food")
    assert r.status_code == 200
    assert len(r.json()) == 2


@pytest.mark.asyncio
async def test_get_food_log(client: AsyncClient):
    created = await client.post(
        f"{BASE}/logs/food", json={**FOOD_LOG_PAYLOAD, "custom_name": "Soup"}
    )
    log_id = created.json()["id"]

    r = await client.get(f"{BASE}/logs/food/{log_id}")
    assert r.status_code == 200
    assert r.json()["id"] == log_id


@pytest.mark.asyncio
async def test_get_food_log_not_found(client: AsyncClient):
    r = await client.get(f"{BASE}/logs/food/99999")
    assert r.status_code == 404


@pytest.mark.asyncio
async def test_patch_food_log(client: AsyncClient):
    created = await client.post(f"{BASE}/logs/food", json={**FOOD_LOG_PAYLOAD, "quantity": "small"})
    log_id = created.json()["id"]

    r = await client.patch(
        f"{BASE}/logs/food/{log_id}", json={"quantity": "large", "notes": "hungry"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["quantity"] == "large"
    assert data["notes"] == "hungry"


@pytest.mark.asyncio
async def test_delete_food_log(client: AsyncClient):
    created = await client.post(f"{BASE}/logs/food", json={**FOOD_LOG_PAYLOAD, "custom_name": "X"})
    log_id = created.json()["id"]

    r = await client.delete(f"{BASE}/logs/food/{log_id}")
    assert r.status_code == 204

    r = await client.get(f"{BASE}/logs/food/{log_id}")
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# Stool logs
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_stool_log(client: AsyncClient):
    r = await client.post(f"{BASE}/logs/stools", json=STOOL_LOG_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["bristol_type"] == 4
    assert data["quality"] == "normal"


@pytest.mark.asyncio
async def test_create_stool_log_invalid_bristol(client: AsyncClient):
    r = await client.post(f"{BASE}/logs/stools", json={**STOOL_LOG_PAYLOAD, "bristol_type": 8})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_patch_stool_log(client: AsyncClient):
    created = await client.post(f"{BASE}/logs/stools", json=STOOL_LOG_PAYLOAD)
    log_id = created.json()["id"]

    r = await client.patch(
        f"{BASE}/logs/stools/{log_id}", json={"bristol_type": 2, "quality": "concerning"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["bristol_type"] == 2
    assert data["quality"] == "concerning"


@pytest.mark.asyncio
async def test_delete_stool_log(client: AsyncClient):
    created = await client.post(f"{BASE}/logs/stools", json=STOOL_LOG_PAYLOAD)
    log_id = created.json()["id"]

    assert (await client.delete(f"{BASE}/logs/stools/{log_id}")).status_code == 204
    assert (await client.get(f"{BASE}/logs/stools/{log_id}")).status_code == 404


# ---------------------------------------------------------------------------
# Symptom logs
# ---------------------------------------------------------------------------


@pytest.mark.asyncio
async def test_create_symptom_log(client: AsyncClient):
    r = await client.post(f"{BASE}/logs/symptoms", json=SYMPTOM_LOG_PAYLOAD)
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "bloating"
    assert data["intensity"] == 5


@pytest.mark.asyncio
async def test_create_symptom_log_invalid_intensity(client: AsyncClient):
    r = await client.post(f"{BASE}/logs/symptoms", json={**SYMPTOM_LOG_PAYLOAD, "intensity": 11})
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_patch_symptom_log(client: AsyncClient):
    created = await client.post(f"{BASE}/logs/symptoms", json=SYMPTOM_LOG_PAYLOAD)
    log_id = created.json()["id"]

    r = await client.patch(
        f"{BASE}/logs/symptoms/{log_id}", json={"intensity": 8, "notes": "after lunch"}
    )
    assert r.status_code == 200
    data = r.json()
    assert data["intensity"] == 8
    assert data["notes"] == "after lunch"


@pytest.mark.asyncio
async def test_delete_symptom_log(client: AsyncClient):
    created = await client.post(f"{BASE}/logs/symptoms", json=SYMPTOM_LOG_PAYLOAD)
    log_id = created.json()["id"]

    assert (await client.delete(f"{BASE}/logs/symptoms/{log_id}")).status_code == 204
    assert (await client.get(f"{BASE}/logs/symptoms/{log_id}")).status_code == 404
