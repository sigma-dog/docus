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

        deleteSpace: build.mutation<void, SpaceActionArgs>({
            query: ({ key, organizationSlug }) => ({
                url: `${getUrl()}/${key}?organizationSlug=${organizationSlug}`,
                method: apiMethods.delete,
            }),
            invalidatesTags: [tagTypes.Spaces],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetSpacesQuery,
    useGetSpaceQuery,
    useCreateSpaceMutation,
    useUpdateSpaceMutation,
    useDeleteSpaceMutation,
} = spacesApi;
