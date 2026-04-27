const ORG_KEY = 'lastOrgSlug';
const spaceKey = (orgSlug: string) => `lastSpaceKey:${orgSlug}`;

export const getLastOrgSlug = (): string | null =>
    localStorage.getItem(ORG_KEY);
export const getLastSpaceKey = (orgSlug: string): string | null =>
    localStorage.getItem(spaceKey(orgSlug));

export const saveLastVisited = (orgSlug: string, spaceKeyValue: string) => {
    localStorage.setItem(ORG_KEY, orgSlug);
    localStorage.setItem(spaceKey(orgSlug), spaceKeyValue);
};

export const removeLastVisited = () => {
    localStorage.removeItem(ORG_KEY);
};
