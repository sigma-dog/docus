type ProseMirrorNode = {
    type: string;
    text?: string;
    content?: ProseMirrorNode[];
};

function walk(node: ProseMirrorNode, acc: string[]): void {
    if (node.text) acc.push(node.text);
    node.content?.forEach((child) => walk(child, acc));
}

export function extractPlainText(content: string): string {
    if (!content) return '';

    // Try JSON (ProseMirror) first
    if (content.trimStart().startsWith('{')) {
        try {
            const doc = JSON.parse(content) as ProseMirrorNode;
            const parts: string[] = [];
            walk(doc, parts);
            return parts.join(' ');
        } catch {
            // fall through to HTML
        }
    }

    // HTML: strip tags, decode basic entities, collapse whitespace
    return content
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

export type Snippet = { before: string; match: string; after: string } | null;

export function extractSnippet(
    plainText: string,
    query: string,
    radius = 60
): Snippet {
    if (!plainText) return null;

    const firstWord = query.trim().split(/\s+/)[0];
    const re = new RegExp(
        firstWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'i'
    );
    const m = re.exec(plainText);
    if (!m) return null;

    const idx = m.index;
    const matchEnd = idx + m[0].length;
    const start = Math.max(0, idx - radius);
    const end = Math.min(plainText.length, matchEnd + radius);

    const before = (start > 0 ? '…' : '') + plainText.slice(start, idx);
    const match = plainText.slice(idx, matchEnd);
    const after =
        plainText.slice(matchEnd, end) + (end < plainText.length ? '…' : '');

    return { before, match, after };
}
