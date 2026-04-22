import { useState } from 'react';

export const useTreeExpandedState = (spaceKey: string) => {
    const storageKey = `tree-expanded:${spaceKey}`;

    const [expandedValue, setExpandedValue] = useState<string[]>(() => {
        try {
            const stored = localStorage.getItem(storageKey);
            return stored ? (JSON.parse(stored) as string[]) : [];
        } catch {
            return [];
        }
    });

    const onExpandedChange = ({
        expandedValue: next,
    }: {
        expandedValue: string[];
    }) => {
        setExpandedValue(next);
        try {
            localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
            // ignore quota errors
        }
    };

    return { expandedValue, onExpandedChange };
};
