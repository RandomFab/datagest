from pathlib import Path

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict

# Racine du projet (4 niveaux au-dessus de backend/app/core/config.py)
_ROOT_ENV = Path(__file__).resolve().parents[3] / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(_ROOT_ENV), env_file_encoding="utf-8")

    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "datagest"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"

    DEBUG: bool = False
    CORS_ORIGINS: list[str] = ["http://localhost:4200"]

    @computed_field
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"


settings = Settings()
