export const isPageContentEmpty = (content: string | null) => {
    if (!content?.trim()) {
        return true;
    }

    const documentFragment = new DOMParser().parseFromString(
        content,
        'text/html'
    );
    const textContent = documentFragment.body.textContent?.trim();
    const hasVisualContent = Boolean(
        documentFragment.body.querySelector(
            'img, video, iframe, pre, blockquote, ul, ol, li, table, hr'
        )
    );

    return !textContent && !hasVisualContent;
};

export type TocHeading = {
    id: string;
    level: number;
    text: string;
};

export const extractTocHeadings = (content: string | null): TocHeading[] => {
    if (!content?.trim()) {
        return [];
    }

    const documentFragment = new DOMParser().parseFromString(
        content,
        'text/html'
    );

    return Array.from(
        documentFragment.body.querySelectorAll('h1, h2, h3, h4, h5, h6')
    )
        .map((heading, index) => ({
            id: `toc-heading-${index}`,
            level: Number(heading.tagName.slice(1)),
            text: heading.textContent?.trim() ?? '',
        }))
        .filter((heading) => heading.text.length > 0);
};
