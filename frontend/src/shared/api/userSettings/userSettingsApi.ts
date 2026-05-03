import type { EditorWidth, UserSettings } from 'shared/types';

import { api } from '../api';
import { apiMethods, tagTypes } from '../constants';

const getUrl = () => 'user-settings';

type UpdateUserSettingsBody = {
    editorWidth?: EditorWidth;
};

export const userSettingsApi = api.injectEndpoints({
    endpoints: (build) => ({
        getUserSettings: build.query<UserSettings, void>({
            query: () => ({
                url: `${getUrl()}/me`,
                method: apiMethods.get,
            }),
            providesTags: [tagTypes.UserSettings],
        }),
        updateUserSettings: build.mutation<
            UserSettings,
            UpdateUserSettingsBody
        >({
            query: (body) => ({
                url: `${getUrl()}/me`,
                method: apiMethods.patch,
                body,
            }),
            async onQueryStarted(_body, { dispatch, queryFulfilled }) {
                const { data } = await queryFulfilled;

                dispatch(
                    userSettingsApi.util.updateQueryData(
                        'getUserSettings',
                        undefined,
                        () => data
                    )
                );
            },
        }),
    }),
    overrideExisting: false,
});

export const { useGetUserSettingsQuery, useUpdateUserSettingsMutation } =
    userSettingsApi;
