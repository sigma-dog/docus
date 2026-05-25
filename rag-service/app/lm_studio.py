import httpx
from openai import OpenAI

from .config import settings


client = OpenAI(
    base_url=settings.lm_studio_base_url,
    api_key=settings.lm_studio_api_key,
    http_client=httpx.Client(trust_env=False),
)


def create_embedding(text: str) -> list[float]:
    response = client.embeddings.create(
        model=settings.lm_studio_embedding_model,
        input=text,
    )
    embedding = response.data[0].embedding
    if len(embedding) != settings.embedding_dim:
        raise ValueError(
            f"Embedding dimension mismatch: expected {settings.embedding_dim}, got {len(embedding)}"
        )
    return embedding


def create_answer(question: str, context: str) -> str:
    response = client.chat.completions.create(
        model=settings.lm_studio_chat_model,
        temperature=0.2,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an assistant for an internal knowledge base. "
                    "Answer only from the provided context. If the context is insufficient, "
                    "say that there is not enough information in the organization knowledge base. "
                    "Keep the answer concise and cite source numbers like [1], [2] when useful."
                ),
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion: {question}",
            },
        ],
    )
    return response.choices[0].message.content or ""
