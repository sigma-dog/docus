from pydantic import BaseModel, Field


class QueryRequest(BaseModel):
    organizationSlug: str
    organizationId: str
    question: str = Field(min_length=1)
    topK: int = Field(default=6, ge=1, le=12)


class Source(BaseModel):
    pageId: str
    title: str
    spaceKey: str
    chunkText: str
    score: float | None = None


class QueryResponse(BaseModel):
    answer: str
    sources: list[Source]
    usedChunksCount: int


class UpsertPageRequest(BaseModel):
    organizationId: str
    organizationSlug: str
    spaceId: str
    spaceKey: str
    pageId: str
    title: str
    content: str | None = None
    isFolder: bool = False
    updatedAt: str


class UpsertPageResponse(BaseModel):
    indexedChunks: int


class DeletePageRequest(BaseModel):
    organizationId: str
    pageId: str


class DeletePageResponse(BaseModel):
    deletedChunks: int
