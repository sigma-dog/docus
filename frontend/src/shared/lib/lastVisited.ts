const ORG_KEY = 'lastOrgSlug';
const SPACE_KEY = 'lastSpaceKey';

export const getLastOrgSlug = (): string | null =>
    localStorage.getItem(ORG_KEY);
export const getLastSpaceKey = (): string | null =>
    localStorage.getItem(SPACE_KEY);

export const saveLastVisited = (orgSlug: string, spaceKey: string) => {
    localStorage.setItem(ORG_KEY, orgSlug);
    localStorage.setItem(SPACE_KEY, spaceKey);
};

export const removeLastVisited = () => {
    localStorage.removeItem(ORG_KEY);
    localStorage.removeItem(SPACE_KEY);
};
