import pytest
from httpx import AsyncClient

BASE = "/api/v1"
DAY = "2026-06-27"


@pytest.mark.asyncio
async def test_dashboard_day_empty(client: AsyncClient):
    r = await client.get(f"{BASE}/dashboard/day?day={DAY}")
    assert r.status_code == 200
    data = r.json()
    assert data["date"] == DAY
    assert data["food_logs"] == []
    assert data["stool_logs"] == []
    assert data["symptom_logs"] == []


@pytest.mark.asyncio
async def test_dashboard_day_missing_param(client: AsyncClient):
    r = await client.get(f"{BASE}/dashboard/day")
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_dashboard_day_aggregates_logs(client: AsyncClient):
    food = await client.post(
        f"{BASE}/foods", json={"name": "Banana", "category": "Plant", "is_drink": False}
    )
    food_id = food.json()["id"]

    await client.post(
        f"{BASE}/logs/food",
        json={"food_item_id": food_id, "entry_type": "food", "logged_at": f"{DAY}T08:00:00"},
    )
    await client.post(
        f"{BASE}/logs/stools",
        json={"bristol_type": 4, "quality": "normal", "logged_at": f"{DAY}T09:00:00"},
    )
    await client.post(
        f"{BASE}/logs/symptoms",
        json={"name": "bloating", "intensity": 3, "logged_at": f"{DAY}T10:00:00"},
    )

    r = await client.get(f"{BASE}/dashboard/day?day={DAY}")
    assert r.status_code == 200
    data = r.json()
    assert len(data["food_logs"]) == 1
    assert len(data["stool_logs"]) == 1
    assert len(data["symptom_logs"]) == 1
    assert data["food_logs"][0]["food_item"]["name"] == "Banana"


@pytest.mark.asyncio
async def test_dashboard_day_isolates_by_date(client: AsyncClient):
    """Logs from another day must not appear in today's summary."""
    await client.post(
        f"{BASE}/logs/stools",
        json={"bristol_type": 3, "quality": "ideal", "logged_at": "2026-06-26T09:00:00"},
    )
    await client.post(
        f"{BASE}/logs/stools",
        json={"bristol_type": 4, "quality": "normal", "logged_at": f"{DAY}T09:00:00"},
    )

    r = await client.get(f"{BASE}/dashboard/day?day={DAY}")
    assert r.status_code == 200
    assert len(r.json()["stool_logs"]) == 1
