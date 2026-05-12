import type { VersionState } from './types';

export const formatDate = (iso: string) => {
    return new Intl.DateTimeFormat('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));
};

export const isSameVersion = (left: VersionState, right: VersionState) => {
    return left.title === right.title && left.content === right.content;
};

export const getActionLabel = (
    previous: VersionState,
    next: VersionState,
    olderVersions: VersionState[]
) => {
    const titleChanged = previous.title !== next.title;
    const contentChanged = previous.content !== next.content;
    const looksLikeRestore = olderVersions.some((version) =>
        isSameVersion(version, next)
    );

    if (looksLikeRestore) {
        return 'Восстановление версии';
    }

    if (titleChanged && contentChanged) {
        return 'Изменены заголовок и содержимое';
    }

    if (titleChanged) {
        return 'Изменен заголовок';
    }

    if (contentChanged) {
        return 'Изменено содержимое';
    }

    return 'Изменена страница';
};
