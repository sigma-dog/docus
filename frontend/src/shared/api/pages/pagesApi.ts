import type { Page, PageSummary } from '../../types';
import { api } from '../api';
import { apiMethods, tagTypes } from '../constants';

type CreatePageBody = {
    title: string;
    parentId?: string;
    position?: number;
    content?: string;
    isFolder?: boolean;
};

type UpdatePageBody = {
    title?: string;
    icon?: string | null;
    content?: string;
    position?: number;
};

type MovePageBody = {
    parentId?: string | null;
    position?: number;
};

const getUrl = (spaceKey: string) => `spaces/${spaceKey}/pages`;

export const pagesApi = api.injectEndpoints({
    endpoints: (build) => ({
        getPages: build.query<PageSummary[], string>({
            query: (spaceKey) => getUrl(spaceKey),
            providesTags: (_result, _error, spaceKey) => [
                { type: tagTypes.Pages, id: spaceKey },
            ],
        }),

        getPage: build.query<Page, { spaceKey: string; pageId: string }>({
            query: ({ spaceKey, pageId }) => `${getUrl(spaceKey)}/${pageId}`,
            providesTags: (_result, _error, { pageId }) => [
                { type: tagTypes.Pages, id: pageId },
            ],
        }),

        createPage: build.mutation<
            Page,
            { spaceKey: string; body: CreatePageBody }
        >({
            query: ({ spaceKey, body }) => ({
                url: getUrl(spaceKey),
                method: apiMethods.post,
                body,
            }),
            invalidatesTags: (_result, _error, { spaceKey }) => [
                { type: tagTypes.Pages, id: spaceKey },
            ],
        }),

        updatePage: build.mutation<
            Page,
            { spaceKey: string; pageId: string; body: UpdatePageBody }
        >({
            query: ({ spaceKey, pageId, body }) => ({
                url: `${getUrl(spaceKey)}/${pageId}`,
                method: apiMethods.patch,
                body,
            }),
            invalidatesTags: (_result, _error, { spaceKey, pageId }) => [
                { type: tagTypes.Pages, id: spaceKey },
                { type: tagTypes.Pages, id: pageId },
            ],
        }),

        deletePage: build.mutation<void, { spaceKey: string; pageId: string }>({
            query: ({ spaceKey, pageId }) => ({
                url: `${getUrl(spaceKey)}/${pageId}`,
                method: apiMethods.delete,
            }),
            invalidatesTags: (_result, _error, { spaceKey }) => [
                { type: tagTypes.Pages, id: spaceKey },
            ],
        }),

        movePage: build.mutation<
            Page,
            { spaceKey: string; pageId: string; body: MovePageBody }
        >({
            query: ({ spaceKey, pageId, body }) => ({
                url: `${getUrl(spaceKey)}/${pageId}/move`,
                method: apiMethods.patch,
                body,
            }),
            invalidatesTags: (_result, _error, { spaceKey }) => [
                { type: tagTypes.Pages, id: spaceKey },
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetPagesQuery,
    useGetPageQuery,
    useCreatePageMutation,
    useUpdatePageMutation,
    useDeletePageMutation,
    useMovePageMutation,
} = pagesApi;
