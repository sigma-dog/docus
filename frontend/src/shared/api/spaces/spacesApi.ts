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

        getSpace: build.query<Space, string>({
            query: (key) => `${getUrl()}/${key}`,
            providesTags: (_result, _error, key) => [
                { type: tagTypes.Spaces, id: key },
            ],
        }),

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
            { key: string; body: UpdateSpaceBody }
        >({
            query: ({ key, body }) => ({
                url: `${getUrl()}/${key}`,
                method: apiMethods.patch,
                body,
            }),
            invalidatesTags: (_result, _error, { key }) => [
                { type: tagTypes.Spaces, id: key },
                tagTypes.Spaces,
            ],
        }),

        deleteSpace: build.mutation<void, string>({
            query: (key) => ({
                url: `${getUrl()}/${key}`,
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
