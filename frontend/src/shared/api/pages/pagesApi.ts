import type { Page, PageHistoryEntry, PageSummary } from '../../types';
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

type RestorePageBody = {
    historyEntryId: string;
};

const getUrl = (orgSlug: string, spaceKey: string) =>
    `organizations/${orgSlug}/spaces/${spaceKey}/pages`;

export const pagesApi = api.injectEndpoints({
    endpoints: (build) => ({
        getPages: build.query<
            PageSummary[],
            { orgSlug: string; spaceKey: string }
        >({
            query: ({ orgSlug, spaceKey }) => getUrl(orgSlug, spaceKey),
            providesTags: (_result, _error, { orgSlug, spaceKey }) => [
                { type: tagTypes.Pages, id: `${orgSlug}:${spaceKey}` },
            ],
        }),

        getPage: build.query<
            Page,
            { orgSlug: string; spaceKey: string; pageId: string }
        >({
            query: ({ orgSlug, spaceKey, pageId }) =>
                `${getUrl(orgSlug, spaceKey)}/${pageId}`,
            providesTags: (_result, _error, { pageId }) => [
                { type: tagTypes.Pages, id: pageId },
            ],
        }),

        createPage: build.mutation<
            Page,
            { orgSlug: string; spaceKey: string; body: CreatePageBody }
        >({
            query: ({ orgSlug, spaceKey, body }) => ({
                url: getUrl(orgSlug, spaceKey),
                method: apiMethods.post,
                body,
            }),
            invalidatesTags: (_result, _error, { orgSlug, spaceKey }) => [
                { type: tagTypes.Pages, id: `${orgSlug}:${spaceKey}` },
            ],
        }),

        updatePage: build.mutation<
            Page,
            {
                orgSlug: string;
                spaceKey: string;
                pageId: string;
                body: UpdatePageBody;
            }
        >({
            query: ({ orgSlug, spaceKey, pageId, body }) => ({
                url: `${getUrl(orgSlug, spaceKey)}/${pageId}`,
                method: apiMethods.patch,
                body,
            }),
            invalidatesTags: (
                _result,
                _error,
                { orgSlug, spaceKey, pageId }
            ) => [
                { type: tagTypes.Pages, id: `${orgSlug}:${spaceKey}` },
                { type: tagTypes.Pages, id: pageId },
                { type: tagTypes.Pages, id: `history:${pageId}` },
            ],
        }),

        deletePage: build.mutation<
            void,
            { orgSlug: string; spaceKey: string; pageId: string }
        >({
            query: ({ orgSlug, spaceKey, pageId }) => ({
                url: `${getUrl(orgSlug, spaceKey)}/${pageId}`,
                method: apiMethods.delete,
            }),
            invalidatesTags: (_result, _error, { orgSlug, spaceKey }) => [
                { type: tagTypes.Pages, id: `${orgSlug}:${spaceKey}` },
            ],
        }),

        movePage: build.mutation<
            Page,
            {
                orgSlug: string;
                spaceKey: string;
                pageId: string;
                body: MovePageBody;
            }
        >({
            query: ({ orgSlug, spaceKey, pageId, body }) => ({
                url: `${getUrl(orgSlug, spaceKey)}/${pageId}/move`,
                method: apiMethods.patch,
                body,
            }),
            invalidatesTags: (_result, _error, { orgSlug, spaceKey }) => [
                { type: tagTypes.Pages, id: `${orgSlug}:${spaceKey}` },
            ],
        }),

        restorePageVersion: build.mutation<
            Page,
            {
                orgSlug: string;
                spaceKey: string;
                pageId: string;
                body: RestorePageBody;
            }
        >({
            query: ({ orgSlug, spaceKey, pageId, body }) => ({
                url: `${getUrl(orgSlug, spaceKey)}/${pageId}/restore`,
                method: apiMethods.post,
                body,
            }),
            invalidatesTags: (
                _result,
                _error,
                { orgSlug, spaceKey, pageId }
            ) => [
                { type: tagTypes.Pages, id: `${orgSlug}:${spaceKey}` },
                { type: tagTypes.Pages, id: pageId },
                { type: tagTypes.Pages, id: `history:${pageId}` },
            ],
        }),

        getPageHistory: build.query<
            PageHistoryEntry[],
            { orgSlug: string; spaceKey: string; pageId: string }
        >({
            query: ({ orgSlug, spaceKey, pageId }) =>
                `${getUrl(orgSlug, spaceKey)}/${pageId}/history`,
            providesTags: (_result, _error, { pageId }) => [
                { type: tagTypes.Pages, id: `history:${pageId}` },
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
    useRestorePageVersionMutation,
    useGetPageHistoryQuery,
} = pagesApi;
