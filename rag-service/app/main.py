from fastapi import FastAPI, HTTPException

from .config import settings
from .db import (
    delete_page_chunks,
    find_keyword_chunks,
    find_similar_chunks,
    replace_page_chunks,
)
from .lm_studio import create_answer, create_embedding
from .schemas import (
    DeletePageRequest,
    DeletePageResponse,
    QueryRequest,
    QueryResponse,
    Source,
    UpsertPageRequest,
    UpsertPageResponse,
)
from .text import chunk_text, extract_plain_text, extract_search_terms

app = FastAPI(title="Docus RAG service")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/rag/query", response_model=QueryResponse)
def query(request: QueryRequest) -> QueryResponse:
    try:
        question_embedding = create_embedding(request.question)
        keyword_rows = find_keyword_chunks(
            organization_id=request.organizationId,
            terms=extract_search_terms(request.question),
            limit=request.topK * 2,
        )
        keyword_rows = _filter_weak_keyword_rows(keyword_rows)
        rows = find_similar_chunks(
            organization_id=request.organizationId,
            embedding=question_embedding,
            limit=request.topK * 3,
            min_score=settings.min_vector_score,
        )
        rows = keyword_rows or rows
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"RAG retrieval failed: {exc}") from exc

    if not rows:
        return QueryResponse(
            answer="В базе знаний организации пока нет данных, на которых можно основать ответ.",
            sources=[],
            usedChunksCount=0,
        )

    sources = _dedupe_sources_by_page(rows)[: request.topK]
    context = "\n\n".join(
        f"[{index}] {source.title} ({source.spaceKey})\n{source.chunkText}"
        for index, source in enumerate(sources, start=1)
    )

    try:
        answer = create_answer(request.question, context)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"LM Studio chat failed: {exc}") from exc

    return QueryResponse(answer=answer, sources=sources, usedChunksCount=len(sources))


def _filter_weak_keyword_rows(rows: list[dict]) -> list[dict]:
    if not rows:
        return []

    best_score = float(rows[0].get("score") or 0)
    min_score = max(8.0, best_score * 0.75)
    return [row for row in rows if float(row.get("score") or 0) >= min_score]


def _dedupe_sources_by_page(rows: list[dict]) -> list[Source]:
    sources_by_page: dict[str, Source] = {}
    chunk_counts_by_page: dict[str, int] = {}

    for row in rows:
        page_id = row["pageId"]
        content = row["content"]

        if page_id in sources_by_page:
            if chunk_counts_by_page[page_id] >= 2:
                continue
            if content in sources_by_page[page_id].chunkText:
                continue

            sources_by_page[page_id].chunkText = (
                sources_by_page[page_id].chunkText + "\n\n" + content
            )
            chunk_counts_by_page[page_id] += 1
            continue

        sources_by_page[page_id] = Source(
            pageId=page_id,
            title=row["pageTitle"],
            spaceKey=row["spaceKey"],
            chunkText=content,
            score=float(row["score"]) if row.get("score") is not None else None,
        )
        chunk_counts_by_page[page_id] = 1

    return list(sources_by_page.values())


@app.post("/rag/index/upsert-page", response_model=UpsertPageResponse)
def upsert_page(request: UpsertPageRequest) -> UpsertPageResponse:
    plain_text = extract_plain_text(request.content)

    if request.isFolder or not plain_text:
        delete_page_chunks(
            organization_id=request.organizationId,
            page_id=request.pageId,
        )
        return UpsertPageResponse(indexedChunks=0)

    chunks = chunk_text(
        request.title,
        plain_text,
        chunk_size=settings.chunk_size,
        overlap=settings.chunk_overlap,
    )

    try:
        embedded_chunks = [
            (index, content, create_embedding(content))
            for index, content in enumerate(chunks)
        ]
        indexed = replace_page_chunks(
            organization_id=request.organizationId,
            space_id=request.spaceId,
            space_key=request.spaceKey,
            page_id=request.pageId,
            page_title=request.title,
            chunks=embedded_chunks,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Page indexing failed: {exc}") from exc

    return UpsertPageResponse(indexedChunks=indexed)


@app.post("/rag/index/delete-page", response_model=DeletePageResponse)
def delete_page(request: DeletePageRequest) -> DeletePageResponse:
    try:
        deleted = delete_page_chunks(
            organization_id=request.organizationId,
            page_id=request.pageId,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Page chunk deletion failed: {exc}") from exc

    return DeletePageResponse(deletedChunks=deleted)
