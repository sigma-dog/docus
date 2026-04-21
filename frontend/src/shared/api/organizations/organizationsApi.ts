import type {
    Organization,
    OrganizationInvite,
    OrgMember,
    OrgRole,
    Space,
} from '../../types';
import { api } from '../api';
import { apiMethods, tagTypes } from '../constants';

type CreateOrganizationBody = {
    name: string;
    slug: string;
    description?: string;
};

type UpdateOrganizationBody = {
    name?: string;
    description?: string;
    avatarUrl?: string;
};

type AddOrgMemberBody = {
    userId: string;
    role: Exclude<OrgRole, 'OWNER'>;
};

const getUrl = () => 'organizations';

export const organizationsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getOrganizations: build.query<Organization[], void>({
            query: () => getUrl(),
            providesTags: [tagTypes.Organizations],
        }),

        getOrganization: build.query<Organization, string>({
            query: (slug) => `${getUrl()}/${slug}`,
            providesTags: (_result, _error, slug) => [
                { type: tagTypes.Organizations, id: slug },
            ],
        }),

        createOrganization: build.mutation<
            Organization,
            CreateOrganizationBody
        >({
            query: (body) => ({
                url: getUrl(),
                method: apiMethods.post,
                body,
            }),
            invalidatesTags: [tagTypes.Organizations],
        }),

        updateOrganization: build.mutation<
            Organization,
            { slug: string; body: UpdateOrganizationBody }
        >({
            query: ({ slug, body }) => ({
                url: `${getUrl()}/${slug}`,
                method: apiMethods.patch,
                body,
            }),
            invalidatesTags: (_result, _error, { slug }) => [
                { type: tagTypes.Organizations, id: slug },
                tagTypes.Organizations,
            ],
        }),

        deleteOrganization: build.mutation<void, string>({
            query: (slug) => ({
                url: `${getUrl()}/${slug}`,
                method: apiMethods.delete,
            }),
            invalidatesTags: [tagTypes.Organizations],
        }),

        addOrgMember: build.mutation<
            OrgMember,
            { slug: string; body: AddOrgMemberBody }
        >({
            query: ({ slug, body }) => ({
                url: `${getUrl()}/${slug}/members`,
                method: apiMethods.post,
                body,
            }),
            invalidatesTags: (_result, _error, { slug }) => [
                { type: tagTypes.Organizations, id: slug },
            ],
        }),

        removeOrgMember: build.mutation<void, { slug: string; userId: string }>(
            {
                query: ({ slug, userId }) => ({
                    url: `${getUrl()}/${slug}/members/${userId}`,
                    method: apiMethods.delete,
                }),
                invalidatesTags: (_result, _error, { slug }) => [
                    { type: tagTypes.Organizations, id: slug },
                ],
            }
        ),

        getOrgSpaces: build.query<Space[], string>({
            query: (slug) => `${getUrl()}/${slug}/spaces`,
            providesTags: (_result, _error, slug) => [
                { type: tagTypes.Organizations, id: slug },
            ],
        }),

        createInvite: build.mutation<
            OrganizationInvite,
            {
                slug: string;
                role?: Exclude<OrgRole, 'OWNER'>;
                expiresAt?: string;
            }
        >({
            query: ({ slug, ...body }) => ({
                url: `${getUrl()}/${slug}/invites`,
                method: apiMethods.post,
                body,
            }),
        }),

        joinOrganization: build.mutation<OrgMember, { code: string }>({
            query: (body) => ({
                url: `${getUrl()}/join`,
                method: apiMethods.post,
                body,
            }),
            invalidatesTags: [tagTypes.Organizations],
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetOrganizationsQuery,
    useGetOrganizationQuery,
    useCreateOrganizationMutation,
    useUpdateOrganizationMutation,
    useDeleteOrganizationMutation,
    useAddOrgMemberMutation,
    useRemoveOrgMemberMutation,
    useGetOrgSpacesQuery,
    useCreateInviteMutation,
    useJoinOrganizationMutation,
} = organizationsApi;
