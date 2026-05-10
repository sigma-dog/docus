import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useGetSpaceQuery } from 'shared/api';
import type { SpaceRole } from 'shared/types';

import { getUserInfo } from './userUtils';

type CurrentSpacePermissions = {
    role: SpaceRole | null;
    canEdit: boolean;
    isViewer: boolean;
    isLoading: boolean;
};

export const useCurrentSpacePermissions = (): CurrentSpacePermissions => {
    const { orgSlug, spaceKey } = useParams<{
        orgSlug?: string;
        spaceKey?: string;
    }>();
    const currentUser = getUserInfo();
    const {
        data: space,
        isFetching,
        isLoading,
    } = useGetSpaceQuery(
        {
            key: spaceKey ?? '',
            organizationSlug: orgSlug ?? '',
        },
        {
            skip: !orgSlug || !spaceKey || !currentUser?.id,
        }
    );

    const role = useMemo(() => {
        if (!space || !currentUser) {
            return null;
        }

        return (
            space.accessMembers?.find(
                (member) => member.userId === currentUser.id
            )?.role ?? null
        );
    }, [currentUser, space]);

    return {
        role,
        canEdit: role !== 'VIEWER' && role !== null,
        isViewer: role === 'VIEWER',
        isLoading: isLoading || isFetching,
    };
};
