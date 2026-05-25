from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://docus:docus_secret@localhost:5432/docus"
    lm_studio_base_url: str = "http://localhost:1234/v1"
    lm_studio_api_key: str = "lm-studio"
    lm_studio_chat_model: str = "local-chat-model"
    lm_studio_embedding_model: str = "local-embedding-model"
    embedding_dim: int = 768
    chunk_size: int = 1400
    chunk_overlap: int = 200
    min_vector_score: float = 0.3

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
