import uuid
from collections.abc import Iterable

import psycopg
from psycopg.rows import dict_row

from .config import settings


def get_connection() -> psycopg.Connection:
    return psycopg.connect(settings.database_url, row_factory=dict_row)


def replace_page_chunks(
    *,
    organization_id: str,
    space_id: str,
    space_key: str,
    page_id: str,
    page_title: str,
    chunks: Iterable[tuple[int, str, list[float]]],
) -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute('DELETE FROM "PageChunk" WHERE "pageId" = %s', (page_id,))
            inserted = 0
            for chunk_index, content, embedding in chunks:
                cur.execute(
                    """
                    INSERT INTO "PageChunk" (
                        "id", "organizationId", "spaceId", "spaceKey", "pageId",
                        "pageTitle", "chunkIndex", "content", "embedding", "updatedAt"
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::vector, CURRENT_TIMESTAMP)
                    """,
                    (
                        str(uuid.uuid4()),
                        organization_id,
                        space_id,
                        space_key,
                        page_id,
                        page_title,
                        chunk_index,
                        content,
                        _to_vector_literal(embedding),
                    ),
                )
                inserted += 1
        conn.commit()
        return inserted


def delete_page_chunks(*, organization_id: str, page_id: str) -> int:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                'DELETE FROM "PageChunk" WHERE "organizationId" = %s AND "pageId" = %s',
                (organization_id, page_id),
            )
            deleted = cur.rowcount
        conn.commit()
        return deleted


def find_similar_chunks(
    *,
    organization_id: str,
    embedding: list[float],
    limit: int,
    min_score: float,
) -> list[dict]:
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                    "pageId",
                    "pageTitle",
                    "spaceKey",
                    "content",
                    1 - ("embedding" <=> %s::vector) AS score
                FROM "PageChunk"
                WHERE "organizationId" = %s
                  AND 1 - ("embedding" <=> %s::vector) >= %s
                ORDER BY "embedding" <=> %s::vector
                LIMIT %s
                """,
                (
                    _to_vector_literal(embedding),
                    organization_id,
                    _to_vector_literal(embedding),
                    min_score,
                    _to_vector_literal(embedding),
                    limit,
                ),
            )
            return list(cur.fetchall())


def find_keyword_chunks(
    *,
    organization_id: str,
    terms: list[str],
    limit: int,
) -> list[dict]:
    if not terms:
        return []

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                WITH terms AS (
                    SELECT unnest(%s::text[]) AS term
                )
                SELECT
                    pc."pageId",
                    pc."pageTitle",
                    pc."spaceKey",
                    pc."content",
                    SUM(LENGTH(t.term))::float AS score
                FROM "PageChunk" pc
                JOIN terms t
                    ON pc."content" ILIKE '%%' || t.term || '%%'
                    OR pc."pageTitle" ILIKE '%%' || t.term || '%%'
                WHERE pc."organizationId" = %s
                GROUP BY pc."pageId", pc."pageTitle", pc."spaceKey", pc."content"
                ORDER BY SUM(LENGTH(t.term)) DESC, LENGTH(pc."content") ASC
                LIMIT %s
                """,
                (terms, organization_id, limit),
            )
            return list(cur.fetchall())


def _to_vector_literal(values: list[float]) -> str:
    return "[" + ",".join(str(value) for value in values) + "]"
