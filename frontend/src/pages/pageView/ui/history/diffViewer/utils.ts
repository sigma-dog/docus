import { diffWords } from 'diff';

import type { Part } from '../../../lib/types';

const BG_ADDED = 'var(--chakra-colors-green-50)';
const BG_REMOVED = 'var(--chakra-colors-red-50)';
const BG_NONE = 'transparent';

const ADDED_MARK = 'background:#bbf7d0;border-radius:2px;padding:0 1px';
const REMOVED_MARK =
    'background:#fecaca;border-radius:2px;padding:0 1px;text-decoration:line-through';

type Op =
    | { kind: 'same'; old: Element; next: Element }
    | { kind: 'remove'; old: Element }
    | { kind: 'add'; next: Element }
    | { kind: 'change'; old: Element; next: Element };

export const parseNodes = (html: string): Element[] => {
    const template = document.createElement('template');
    template.innerHTML = html;
    return Array.from(template.content.children);
};

export const outerHtml = (el: Element): string => {
    return el.outerHTML;
};

export const highlightInnerHtml = (
    oldEl: Element,
    newEl: Element,
    side: 'old' | 'new'
): string => {
    const oldText = oldEl.textContent ?? '';
    const newText = newEl.textContent ?? '';
    const parts = diffWords(oldText, newText);

    let inner = '';
    for (const part of parts) {
        if (part.added && side === 'new') {
            inner += `<mark style="${ADDED_MARK}">${part.value}</mark>`;
        } else if (part.removed && side === 'old') {
            inner += `<mark style="${REMOVED_MARK}">${part.value}</mark>`;
        } else if (!part.added && !part.removed) {
            inner += part.value;
        }
    }

    const tag = oldEl.tagName.toLowerCase();
    const attrs = Array.from((side === 'old' ? oldEl : newEl).attributes)
        .map((a) => `${a.name}="${a.value}"`)
        .join(' ');
    const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
    return `${open}${inner}</${tag}>`;
};

export const buildParts = (
    oldHtml: string,
    newHtml: string,
    side: 'old' | 'new'
): Part[] => {
    const oldEls = parseNodes(oldHtml);
    const newEls = parseNodes(newHtml);
    const ops = lcsOps(oldEls, newEls);
    const parts: Part[] = [];

    for (const op of ops) {
        if (op.kind === 'same') {
            parts.push({
                html: outerHtml(side === 'old' ? op.old : op.next),
                bg: BG_NONE,
            });
        } else if (op.kind === 'remove') {
            if (side === 'old') {
                parts.push({ html: outerHtml(op.old), bg: BG_REMOVED });
            }
        } else if (op.kind === 'add') {
            if (side === 'new') {
                parts.push({ html: outerHtml(op.next), bg: BG_ADDED });
            }
        } else {
            parts.push({
                html: highlightInnerHtml(op.old, op.next, side),
                bg: BG_NONE,
            });
        }
    }

    return parts;
};

function lcsOps(oldEls: Element[], newEls: Element[]): Op[] {
    const m = oldEls.length;
    const n = newEls.length;

    const dp: number[][] = Array.from({ length: m + 1 }, () =>
        new Array(n + 1).fill(0)
    );
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            if (outerHtml(oldEls[i]) === outerHtml(newEls[j])) {
                dp[i][j] = 1 + dp[i + 1][j + 1];
            } else {
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    const ops: Op[] = [];
    let i = 0;
    let j = 0;
    while (i < m || j < n) {
        if (i < m && j < n && outerHtml(oldEls[i]) === outerHtml(newEls[j])) {
            ops.push({ kind: 'same', old: oldEls[i], next: newEls[j] });
            i++;
            j++;
        } else if (j < n && (i >= m || dp[i][j + 1] >= dp[i + 1][j])) {
            ops.push({ kind: 'add', next: newEls[j] });
            j++;
        } else if (i < m && (j >= n || dp[i + 1][j] > dp[i][j + 1])) {
            ops.push({ kind: 'remove', old: oldEls[i] });
            i++;
        } else {
            ops.push({ kind: 'change', old: oldEls[i], next: newEls[j] });
            i++;
            j++;
        }
    }
    return ops;
}
