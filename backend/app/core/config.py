from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "RDX LeadFlow"
    app_env: str = "development"
    debug: bool = True
    api_v1_prefix: str = "/api/v1"

    frontend_origin: str = "http://localhost:5173"

    database_url: str = (
        "postgresql+psycopg://postgres:postgres@localhost:5432/rdx_leadflow"
    )

    jwt_secret_key: str = "change_me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
