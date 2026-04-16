import {
    type BaseQueryFn,
    type FetchArgs,
    fetchBaseQuery,
    type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';

import {
    getAccessToken,
    getRefreshToken,
    removeAccessToken,
    removeRefreshToken,
    setAccessToken,
    setRefreshToken,
} from './tokensUtils';
import { removeUserInfo } from '../lib/userUtils';

type Tokens = {
    access: string;
    refresh: string;
};

const mutex = new Mutex();

const getApiUrl = () => import.meta.env.VITE_API_URL;

const baseQuery = fetchBaseQuery({
    baseUrl: getApiUrl(),
    prepareHeaders: (headers) => {
        const token = getAccessToken();

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        return headers;
    },
});

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock();

    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                const refresh = getRefreshToken();

                const refreshResult = await baseQuery(
                    {
                        url: 'auth/refresh',
                        method: 'POST',
                        body: { refresh },
                    },
                    api,
                    extraOptions
                );

                const tokens = refreshResult.data as Tokens;

                if (tokens) {
                    setAccessToken(tokens.access);
                    setRefreshToken(tokens.refresh);
                    result = await baseQuery(args, api, extraOptions);
                } else {
                    console.error('Unable to refresh token');

                    removeAccessToken();
                    removeRefreshToken();

                    removeUserInfo();

                    window.location.href = '/auth';
                }
            } finally {
                release();
            }
        } else {
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }
    }
    return result;
};
