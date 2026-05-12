import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Flex, Stack } from '@chakra-ui/react';

import { useGetOrganizationsQuery } from 'shared/api';
import { saveLastVisited } from 'shared/lib';
import { CreatePageOrFolderDialog } from 'widgets/createPageOrFolderDialog';

import { Navigation } from './navigation/Navigation';
import { SpaceSelect } from './spaceSelect/SpaceSelect';
import { AddButton } from './AddButton';
import { Company } from './Company';
import { SidebarFooter } from './SidebarFooter';
import { SidebarHeader } from './SidebarHeader';

type CreateIntent = {
    isFolder: boolean;
    parentId?: string;
};

export const Sidebar = () => {
    const [createIntent, setCreateIntent] = useState<CreateIntent | null>(null);
    const { data: organizations = [] } = useGetOrganizationsQuery();
    const { orgSlug, spaceKey } = useParams<{
        orgSlug: string;
        spaceKey?: string;
    }>();
    const navigate = useNavigate();

    const openCreate = (isFolder: boolean, parentId?: string) => {
        setCreateIntent({ isFolder, parentId });
    };

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

    return (
        <Flex
            direction="column"
            w={375}
            flexShrink={0}
            borderRightWidth="1px"
            borderColor="border.default"
            h="full"
            overflow="hidden"
            transition="all 0.3s ease"
        >
            <SidebarHeader />
            <Flex
                direction="column"
                justify="space-between"
                flex="1"
                overflow="hidden"
                bg="bg.panel"
                p={4}
            >
                <Stack gap={5} alignItems="stretch">
                    <Company organization={selectedOrg} />

                    {selectedOrg && spaceKey && (
                        <SpaceSelect
                            key={selectedOrg.slug}
                            selectedKey={spaceKey}
                            onSelect={handleSelectSpace}
                            organizationSlug={selectedOrg.slug}
                        />
                    )}

                    <Stack gap={4}>
                        {spaceKey && (
                            <AddButton
                                onCreatePage={() => openCreate(false)}
                                onCreateFolder={() => openCreate(true)}
                            />
                        )}
                        <Navigation
                            key={`${orgSlug}:${spaceKey}`}
                            onCreatePage={(parentId) =>
                                openCreate(false, parentId)
                            }
                            onCreateFolder={(parentId) =>
                                openCreate(true, parentId)
                            }
                        />
                    </Stack>
                </Stack>

                <SidebarFooter />
            </Flex>

            {orgSlug && spaceKey && createIntent && (
                <CreatePageOrFolderDialog
                    isOpen
                    onClose={() => setCreateIntent(null)}
                    orgSlug={orgSlug}
                    spaceKey={spaceKey}
                    parentId={createIntent.parentId}
                    isFolder={createIntent.isFolder}
                />
            )}
        </Flex>
    );
};
