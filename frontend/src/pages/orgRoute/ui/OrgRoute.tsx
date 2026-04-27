import { Navigate, Outlet, useParams } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';

import { useGetSpacesQuery } from 'shared/api';
import { getLastSpaceKey } from 'shared/lib';

export const OrgRoute = () => {
    const { orgSlug, spaceKey } = useParams<{
        orgSlug: string;
        spaceKey?: string;
    }>();

    const { data: spaces, isLoading } = useGetSpacesQuery(orgSlug!);

    if (isLoading) {
        return (
            <Center w="100vw" h="100vh">
                <Spinner size="lg" />
            </Center>
        );
    }

    if (spaceKey) {
        return <Outlet />;
    }

    if (!spaces?.length) {
        // Орг есть, но нет пространств — показываем layout с подсказкой создать space
        return <Outlet />;
    }

    const lastKey = getLastSpaceKey(orgSlug!);
    const target = spaces.find((s) => s.key === lastKey) ?? spaces[0];
    return <Navigate to={`/${orgSlug}/${target.key}`} replace />;
};
