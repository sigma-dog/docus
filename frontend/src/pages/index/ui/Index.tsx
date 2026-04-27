import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Center, Spinner } from '@chakra-ui/react';

import { useGetOrganizationsQuery } from 'shared/api';
import { getAccessToken } from 'shared/api/tokensUtils';
import { getLastOrgSlug, getLastSpaceKey } from 'shared/lib';

const Index = () => {
    const navigate = useNavigate();
    const token = getAccessToken();

    const { data: orgs, isLoading } = useGetOrganizationsQuery(undefined, {
        skip: !token,
    });

    useEffect(() => {
        if (!token) {
            navigate('/auth');
            return;
        }

        if (isLoading) {
            return;
        }

        if (!orgs?.length) {
            navigate('/onboarding');
            return;
        }

        const lastOrg = getLastOrgSlug();
        const targetOrg = orgs.find((o) => o.slug === lastOrg) ?? orgs[0];
        const lastSpace = getLastSpaceKey(targetOrg.slug);

        if (lastSpace) {
            navigate(`/${targetOrg.slug}/${lastSpace}`);
        } else {
            navigate(`/${targetOrg.slug}`);
        }
    }, [isLoading, orgs]);

    return (
        <Center w="100vw" h="100vh">
            <Spinner />
        </Center>
    );
};

export default Index;
