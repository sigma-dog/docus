import { useState } from 'react';
import { LuFile, LuFolder, LuPlus, LuSearch } from 'react-icons/lu';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Center,
    HStack,
    Icon,
    Input,
    InputGroup,
    Menu,
    Portal,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react';

import {
    useGetOrganizationQuery,
    useGetPagesQuery,
    useGetSpaceQuery,
} from 'shared/api';
import { useCurrentSpacePermissions } from 'shared/lib';
import type { PageSummary } from 'shared/types';
import { CreatePageOrFolderDialog } from 'widgets/createPageOrFolderDialog';

import { SpaceHomeBreadcrumbs } from './navigation/SpaceHomeBreadcrumbs';
import { SpaceNavigationGrid } from './navigation/SpaceNavigationGrid';

type CreateIntent = {
    isFolder: boolean;
};

const findPagePath = (
    pages: PageSummary[],
    targetId: string
): PageSummary[] | null => {
    for (const page of pages) {
        if (page.id === targetId) {
            return [page];
        }

        const childPath = findPagePath(page.children, targetId);
        if (childPath) {
            return [page, ...childPath];
        }
    }

    return null;
};

export const SpaceHome = () => {
    const { orgSlug, spaceKey } = useParams<{
        orgSlug: string;
        spaceKey: string;
    }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [createIntent, setCreateIntent] = useState<CreateIntent | null>(null);
    const currentFolderId = searchParams.get('folderId');
    const { canEdit } = useCurrentSpacePermissions();

    const { data: org, isLoading: orgLoading } = useGetOrganizationQuery(
        orgSlug!
    );
    const { data: space, isLoading: spaceLoading } = useGetSpaceQuery({
        key: spaceKey!,
        organizationSlug: orgSlug!,
    });
    const { data: pages = [], isLoading: pagesLoading } = useGetPagesQuery(
        { orgSlug: orgSlug!, spaceKey: spaceKey! },
        { skip: !spaceKey || !orgSlug }
    );

    const currentPath = currentFolderId
        ? findPagePath(pages, currentFolderId)
        : null;
    const currentFolder = currentPath?.[currentPath.length - 1]?.isFolder
        ? currentPath[currentPath.length - 1]
        : null;
    const folderPath = currentFolder ? (currentPath ?? []) : [];
    const visiblePages = currentFolder ? currentFolder.children : pages;

    const openFolder = (folderId: string) => {
        setSearchParams({ folderId });
    };

    const openPage = (pageId: string) => {
        navigate(`/${orgSlug}/${spaceKey}/pages/${pageId}`);
    };

    const resetToRoot = () => {
        setSearchParams({});
    };

    const openCreate = (isFolder: boolean) => {
        setCreateIntent({ isFolder });
    };

    if (orgLoading || spaceLoading) {
        return (
            <Center flex="1" h="100vh">
                <Spinner size="lg" />
            </Center>
        );
    }

    return (
        <Box flex="1" overflowY="auto" bg="bg.subtle" p={8}>
            <Stack gap={6}>
                {/* Breadcrumb + actions */}
                <HStack justify="space-between">
                    <SpaceHomeBreadcrumbs
                        orgSlug={orgSlug!}
                        spaceKey={spaceKey!}
                        orgName={org?.name}
                        spaceName={space?.name}
                        folderPath={folderPath}
                        onRootClick={resetToRoot}
                    />

                    <HStack gap={4}>
                        {canEdit && (
                            <Menu.Root>
                                <Menu.Trigger asChild>
                                    <Button
                                        variant="subtle"
                                        colorPalette="blue"
                                        size="sm"
                                    >
                                        <LuPlus />
                                        Создать
                                    </Button>
                                </Menu.Trigger>
                                <Portal>
                                    <Menu.Positioner>
                                        <Menu.Content minW="44">
                                            <Menu.Item
                                                value="page"
                                                onClick={() =>
                                                    openCreate(false)
                                                }
                                            >
                                                <LuFile />
                                                Страница
                                            </Menu.Item>
                                            <Menu.Item
                                                value="folder"
                                                onClick={() => openCreate(true)}
                                            >
                                                <LuFolder />
                                                Директория
                                            </Menu.Item>
                                        </Menu.Content>
                                    </Menu.Positioner>
                                </Portal>
                            </Menu.Root>
                        )}
                        <InputGroup
                            startElement={
                                <Icon color="fg.subtle">
                                    <LuSearch />
                                </Icon>
                            }
                        >
                            <Input
                                placeholder="Поиск в пространстве..."
                                variant="subtle"
                                size="md"
                                w="322px"
                            />
                        </InputGroup>
                    </HStack>
                </HStack>

                {/* Space title + description */}
                <Box px={2}>
                    <Text fontSize="xl" fontWeight="semibold" mb={1}>
                        {space?.name}
                    </Text>
                    {space?.description && (
                        <Text fontSize="sm" color="fg.muted">
                            {space.description}
                        </Text>
                    )}
                </Box>

                {/* Pages grid */}
                {pagesLoading ? (
                    <Center py={8}>
                        <Spinner size="md" />
                    </Center>
                ) : visiblePages.length === 0 ? (
                    <Center py={16}>
                        <Stack align="center" gap={3}>
                            <Text color="fg.muted">
                                {currentFolder
                                    ? 'В этой директории пока пусто'
                                    : 'Страниц пока нет'}
                            </Text>
                            {canEdit && (
                                <Button
                                    size="sm"
                                    colorPalette="blue"
                                    onClick={() => openCreate(false)}
                                >
                                    <LuPlus />
                                    Создать первую страницу
                                </Button>
                            )}
                        </Stack>
                    </Center>
                ) : (
                    <SpaceNavigationGrid
                        pages={visiblePages}
                        onPageClick={(page) => {
                            if (page.isFolder) {
                                openFolder(page.id);
                                return;
                            }

                            openPage(page.id);
                        }}
                    />
                )}
            </Stack>

            {orgSlug && spaceKey && createIntent && (
                <CreatePageOrFolderDialog
                    orgSlug={orgSlug}
                    isOpen
                    onClose={() => setCreateIntent(null)}
                    isFolder={createIntent.isFolder}
                    parentId={currentFolder?.id}
                    spaceKey={spaceKey}
                />
            )}
        </Box>
    );
};
