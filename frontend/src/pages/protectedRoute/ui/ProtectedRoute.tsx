import { Navigate, Outlet, useParams } from 'react-router-dom';
import { Center, Spinner } from '@chakra-ui/react';

import { useGetOrganizationsQuery } from 'shared/api';
import { getAccessToken } from 'shared/api/tokensUtils';
import { getLastOrgSlug } from 'shared/lib';

export const ProtectedRoute = () => {
    const token = getAccessToken();
    const { orgSlug } = useParams();
    const { data: orgs, isLoading } = useGetOrganizationsQuery(undefined, {
        skip: !token,
    });

    if (!token) {
        return <Navigate to="/auth" replace />;
    }

    if (isLoading) {
        return (
            <Center w="100vw" h="100vh">
                <Spinner size="lg" />
            </Center>
        );
    }

    if (!orgs?.length) {
        return <Navigate to="/onboarding" replace />;
    }

    if (!orgSlug) {
        const lastOrg = getLastOrgSlug();
        const target = orgs.find((o) => o.slug === lastOrg) ?? orgs[0];
        return <Navigate to={`/${target.slug}`} replace />;
    }

    return <Outlet />;
};
