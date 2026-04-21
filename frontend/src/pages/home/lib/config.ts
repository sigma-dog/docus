import type { RecentPage, SpacePage } from './types';

export const SPACE_PAGES: SpacePage[] = [
    { id: '1', label: 'Общие договоренности', isFolder: true },
    { id: '2', label: 'Инструменты', isFolder: true },
    { id: '3', label: 'Git', isFolder: false },
    { id: '4', label: 'Архитектура', isFolder: false },
];

export const RECENT_PAGES: RecentPage[] = [
    {
        id: '1',
        title: 'Ревью',
        description:
            'Lorem ipsum dolor sit amet consectetur. Aliquam cursus risus augue quis est.',
    },
    {
        id: '2',
        title: 'Архитектура',
        description:
            'Lorem ipsum dolor sit amet consectetur. Aliquam cursus risus augue quis est.',
    },
    {
        id: '3',
        title: 'Git flow',
        description:
            'Lorem ipsum dolor sit amet consectetur. Aliquam cursus risus augue quis est.',
    },
    {
        id: '4',
        title: 'React hooks',
        description:
            'Lorem ipsum dolor sit amet consectetur. Aliquam cursus risus augue quis est.',
    },
    {
        id: '5',
        title: 'TypeScript tips',
        description:
            'Lorem ipsum dolor sit amet consectetur. Aliquam cursus risus augue quis est.',
    },
];
