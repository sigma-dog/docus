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
