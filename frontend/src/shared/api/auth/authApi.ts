import type { LoginBody, RegisterBody } from './types';
import type { User } from '../../types';
import { api } from '../api';
import { apiMethods, tagTypes } from '../constants';
import { setUserInfo } from '../../lib';

const getUrl = () => 'auth';

type Tokens = {
    access: string;
    refresh: string;
};

type LoginResponse = Tokens & User;
type RegisterResponse = Tokens & User;

export const authApi = api.injectEndpoints({
    endpoints: (build) => ({
        login: build.mutation<LoginResponse, LoginBody>({
            query: (body: LoginBody) => ({
                url: `${getUrl()}/login`,
                method: apiMethods.post,
                body,
            }),
        }),

        register: build.mutation<RegisterResponse, RegisterBody>({
            query: (body: RegisterBody) => ({
                url: `${getUrl()}/register`,
                method: apiMethods.post,
                body,
            }),
        }),

        getCurrentUser: build.query<User, void>({
            query: () => ({
                url: `${getUrl()}/me`,
                method: apiMethods.get,
            }),
            providesTags: [tagTypes.CurrentUser],
        }),

        updateCurrentUser: build.mutation<
            User,
            Pick<User, 'username' | 'email' | 'avatarUrl'>
        >({
            query: (body) => ({
                url: `${getUrl()}/me`,
                method: apiMethods.patch,
                body,
            }),
            invalidatesTags: [tagTypes.CurrentUser],
            async onQueryStarted(_body, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;

                setUserInfo(data);
                dispatch(
                    authApi.util.updateQueryData(
                        'getCurrentUser',
                        undefined,
                        () => data
                    )
                );
            },
        }),

        logout: build.mutation<void, void>({
            queryFn: () => ({ data: undefined }), // Не делаем реального запроса
            invalidatesTags: [tagTypes.CurrentUser],
        }),
    }),
    overrideExisting: false,
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGetCurrentUserQuery,
    useUpdateCurrentUserMutation,
    useLogoutMutation,
} = authApi;
