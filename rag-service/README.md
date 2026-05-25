# Docus RAG service

Minimal FastAPI service for organization-level RAG over page chunks stored in Postgres `pgvector`.

## Environment

```bash
DATABASE_URL=postgresql://docus:docus_secret@localhost:5432/docus
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio
LM_STUDIO_CHAT_MODEL=local-chat-model
LM_STUDIO_EMBEDDING_MODEL=local-embedding-model
EMBEDDING_DIM=768
```

`EMBEDDING_DIM` must match `backend/prisma/migrations/20260520000000_add_page_chunks_pgvector/migration.sql`.

## Run

```bash
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```
