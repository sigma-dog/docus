import type { DiffTarget } from '../../../lib/types';

export const getDiffNew = (target: DiffTarget): string => {
    if (target.next) {
        return target.next.content ?? '';
    }
    return target.currentContent ?? '';
};

export const getDiffNewTitle = (target: DiffTarget): string => {
    if (target.next) {
        return target.next.title;
    }
    return target.currentTitle;
};
