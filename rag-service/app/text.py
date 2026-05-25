import html
import json
import re
from typing import Any

SEARCH_STOP_WORDS = {
    "а",
    "в",
    "и",
    "к",
    "на",
    "о",
    "об",
    "по",
    "про",
    "с",
    "у",
    "что",
    "как",
    "это",
    "есть",
    "мне",
    "нам",
    "тебя",
    "ты",
    "привет",
    "расскажи",
    "пожалуйста",
}


def extract_plain_text(content: str | None) -> str:
    if not content:
        return ""

    stripped = content.lstrip()
    if stripped.startswith("{"):
        try:
            doc = json.loads(stripped)
            parts: list[str] = []
            _walk_prosemirror(doc, parts)
            return _normalize_spaces(" ".join(parts))
        except json.JSONDecodeError:
            pass

    without_tags = re.sub(r"<[^>]+>", " ", content)
    return _normalize_spaces(html.unescape(without_tags))


def chunk_text(title: str, content: str, chunk_size: int, overlap: int) -> list[str]:
    text = _normalize_spaces(f"{title}\n\n{content}")
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]

    chunks: list[str] = []
    start = 0
    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == len(text):
            break
        start = max(0, end - overlap)

    return chunks


def extract_search_terms(query: str) -> list[str]:
    terms: list[str] = []
    seen: set[str] = set()

    for term in re.findall(r"[0-9A-Za-zА-Яа-яЁё-]+", query.lower()):
        if len(term) < 3 or term in SEARCH_STOP_WORDS or term in seen:
            continue
        for variant in _term_variants(term):
            if len(variant) < 3 or variant in SEARCH_STOP_WORDS or variant in seen:
                continue
            seen.add(variant)
            terms.append(variant)

    return terms[:12]


def _term_variants(term: str) -> list[str]:
    variants = [term]

    if re.search(r"[а-яё]", term, re.IGNORECASE) and len(term) > 5:
        stem = re.sub(
            r"(ами|ями|ого|ему|ыми|ими|ой|ей|ую|юю|ах|ях|ам|ям|ом|ем|ам|ям|ов|ев|ия|ие|ые|ый|ий|ая|яя|а|я|ы|и|у|ю|е|о)$",
            "",
            term,
        )
        if stem and stem != term:
            variants.append(stem)

    return variants


def _walk_prosemirror(node: Any, parts: list[str]) -> None:
    if not isinstance(node, dict):
        return

    text = node.get("text")
    if isinstance(text, str):
        parts.append(text)

    children = node.get("content")
    if isinstance(children, list):
        for child in children:
            _walk_prosemirror(child, parts)


def _normalize_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()
