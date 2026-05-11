import type { Space } from '../../types';
import { api } from '../api';
import { apiMethods, tagTypes } from '../constants';

type CreateSpaceBody = {
    name: string;
    key: string;
    organizationSlug: string;
    description?: string;
};

type UpdateSpaceBody = {
    name?: string;
    description?: string;
    avatarUrl?: string;
};

type SpaceActionArgs = {
    key: string;
    organizationSlug: string;
};

type UpdateSpaceMemberBody = {
    role?: 'ADMIN' | 'EDITOR' | 'VIEWER';
    inherit?: boolean;
};

const getUrl = () => 'spaces';

export const spacesApi = api.injectEndpoints({
    endpoints: (build) => ({
        getSpaces: build.query<Space[], string | void>({
            query: (organizationSlug) =>
                organizationSlug
                    ? `${getUrl()}?organizationSlug=${organizationSlug}`
                    : getUrl(),
            providesTags: [tagTypes.Spaces],
        }),

        getSpace: build.query<Space, { key: string; organizationSlug: string }>(
            {
                query: ({ key, organizationSlug }) =>
                    `${getUrl()}/${key}?organizationSlug=${organizationSlug}`,
                providesTags: (_result, _error, { key }) => [
                    { type: tagTypes.Spaces, id: key },
                ],
            }
        ),

        createSpace: build.mutation<Space, CreateSpaceBody>({
            query: (body) => ({
                url: getUrl(),
                method: apiMethods.post,
                body,
            }),
            invalidatesTags: [tagTypes.Spaces],
        }),

        updateSpace: build.mutation<
            Space,
            SpaceActionArgs & { body: UpdateSpaceBody }
        >({
            query: ({ key, organizationSlug, body }) => ({
                url: `${getUrl()}/${key}?organizationSlug=${organizationSlug}`,
                method: apiMethods.patch,
                body,
            }),
            invalidatesTags: (_result, _error, { key }) => [
                { type: tagTypes.Spaces, id: key },
                tagTypes.Spaces,
            ],
        }),

        uploadSpaceAvatar: build.mutation<
            Space,
            SpaceActionArgs & { file: File }
        >({
            query: ({ key, organizationSlug, file }) => {
                const formData = new FormData();

                formData.append('file', file);

                return {
                    url: `${getUrl()}/${key}/avatar?organizationSlug=${organizationSlug}`,
                    method: apiMethods.post,
                    body: formData,
                };
            },
            invalidatesTags: (_result, _error, { key }) => [
                { type: tagTypes.Spaces, id: key },
                tagTypes.Spaces,
            ],
        }),

        removeSpaceAvatar: build.mutation<Space, SpaceActionArgs>({
            query: ({ key, organizationSlug }) => ({
                url: `${getUrl()}/${key}/avatar?organizationSlug=${organizationSlug}`,
                method: apiMethods.delete,
            }),
            invalidatesTags: (_result, _error, { key }) => [
                { type: tagTypes.Spaces, id: key },
                tagTypes.Spaces,
            ],
        }),

        deleteSpace: build.mutation<void, SpaceActionArgs>({
            query: ({ key, organizationSlug }) => ({
                url: `${getUrl()}/${key}?organizationSlug=${organizationSlug}`,
                method: apiMethods.delete,
            }),
            invalidatesTags: [tagTypes.Spaces],
        }),

        updateSpaceMember: build.mutation<
            void,
            SpaceActionArgs & {
                userId: string;
                body: UpdateSpaceMemberBody;
            }
        >({
            query: ({ key, userId, body }) => ({
                url: `${getUrl()}/${key}/members/${userId}`,
                method: apiMethods.patch,
                body,
            }),
            invalidatesTags: (_result, _error, { key }) => [
                { type: tagTypes.Spaces, id: key },
                tagTypes.Spaces,
            ],
        }),

        removeSpaceMember: build.mutation<
            void,
            SpaceActionArgs & { userId: string }
        >({
            query: ({ key, userId }) => ({
                url: `${getUrl()}/${key}/members/${userId}`,
                method: apiMethods.delete,
            }),
            invalidatesTags: (_result, _error, { key }) => [
                { type: tagTypes.Spaces, id: key },
                tagTypes.Spaces,
            ],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetSpacesQuery,
    useGetSpaceQuery,
    useCreateSpaceMutation,
    useUpdateSpaceMutation,
    useUploadSpaceAvatarMutation,
    useRemoveSpaceAvatarMutation,
    useDeleteSpaceMutation,
    useUpdateSpaceMemberMutation,
    useRemoveSpaceMemberMutation,
} = spacesApi;
