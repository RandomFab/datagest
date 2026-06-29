from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

import app.models.food  # noqa: F401 — register models with Base
import app.models.log  # noqa: F401
from app.database.session import get_session
from app.main import app
from app.models.base import Base
from app.models.enums import AllergenName
from app.models.food import Allergen

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture()
async def db_engine():
    # StaticPool forces all sessions to share the same connection,
    # which is required for SQLite in-memory to be visible across sessions.
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest.fixture()
async def client(db_engine):
    session_factory = async_sessionmaker(db_engine, expire_on_commit=False)

    async def override_get_session() -> AsyncGenerator[AsyncSession]:
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_session] = override_get_session

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c

    app.dependency_overrides.clear()


@pytest.fixture()
async def seeded_allergens(db_engine) -> list[int]:
    """Insert Gluten and Eggs allergens, return their IDs."""
    session_factory = async_sessionmaker(db_engine, expire_on_commit=False)
    async with session_factory() as session:
        gluten = Allergen(name=AllergenName.GLUTEN)
        eggs = Allergen(name=AllergenName.EGGS)
        session.add_all([gluten, eggs])
        await session.commit()
        await session.refresh(gluten)
        await session.refresh(eggs)
        return [gluten.id, eggs.id]
