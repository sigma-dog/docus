import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flex, Stack } from '@chakra-ui/react';

import { useGetOrganizationsQuery } from 'shared/api';
import { saveLastVisited } from 'shared/lib';

import { SpaceSelect } from './spaceSelect/SpaceSelect';
import { AddButton } from './AddButton';
import { Company } from './Company';
import { Navigation } from './Navigation';
import { SidebarFooter } from './SidebarFooter';
import { SidebarHeader } from './SidebarHeader';

const EXPANDED_WIDTH = 375;
const COLLAPSED_WIDTH = 90;

export const Sidebar = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const { data: organizations = [] } = useGetOrganizationsQuery();
    const { orgSlug, spaceKey } = useParams<{
        orgSlug: string;
        spaceKey?: string;
    }>();
    const navigate = useNavigate();

    const selectedOrg =
        organizations.find((o) => o.slug === orgSlug) ?? organizations[0];

    useEffect(() => {
        if (orgSlug && spaceKey) {
            saveLastVisited(orgSlug, spaceKey);
        }
    }, [orgSlug, spaceKey]);

    const handleSelectSpace = (key: string) => {
        if (!selectedOrg) {
            return;
        }
        saveLastVisited(selectedOrg.slug, key);
        navigate(`/${selectedOrg.slug}/${key}`);
    };

    const toggleExpanded = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <Flex
            direction="column"
            w={isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH}
            flexShrink={0}
            borderRightWidth="1px"
            borderColor="border.default"
            h="full"
            overflow="hidden"
            transition="all 0.3s ease"
        >
            <SidebarHeader
                toggleExpanded={toggleExpanded}
                isExpanded={isExpanded}
            />
            <Flex
                direction="column"
                justify="space-between"
                flex="1"
                overflow="hidden"
                bg="bg.subtle"
                p={4}
            >
                <Stack gap={5} alignItems={isExpanded ? 'stretch' : 'center'}>
                    <Company
                        organization={selectedOrg}
                        isExpanded={isExpanded}
                    />

                    {isExpanded && selectedOrg && (
                        <SpaceSelect
                            selectedKey={spaceKey ?? ''}
                            onSelect={handleSelectSpace}
                            organizationSlug={selectedOrg.slug}
                        />
                    )}

                    <Stack gap={4}>
                        <AddButton isExpanded={isExpanded} />
                        {isExpanded && <Navigation />}
                    </Stack>
                </Stack>

                <SidebarFooter isExpanded={isExpanded} />
            </Flex>
        </Flex>
    );
};
