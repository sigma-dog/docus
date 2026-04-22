import { useState } from 'react';
import {
    LuChevronRight,
    LuEllipsis,
    LuFile,
    LuFolder,
    LuPlus,
    LuSearch,
} from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import {
    Box,
    Breadcrumb,
    Button,
    Center,
    Grid,
    HStack,
    Icon,
    Input,
    InputGroup,
    Skeleton,
    Spinner,
    Stack,
    Text,
} from '@chakra-ui/react';

import {
    useGetOrganizationQuery,
    useGetPagesQuery,
    useGetSpaceQuery,
} from 'shared/api';
import { CreatePageOrFolderDialog } from 'widgets/createPageOrFolderDialog';

export const SpaceHome = () => {
    const { orgSlug, spaceKey } = useParams<{
        orgSlug: string;
        spaceKey: string;
    }>();

    const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);

    const { data: org, isLoading: orgLoading } = useGetOrganizationQuery(
        orgSlug!
    );
    const { data: space, isLoading: spaceLoading } = useGetSpaceQuery({
        key: spaceKey!,
        organizationSlug: orgSlug!,
    });
    const { data: pages = [], isLoading: pagesLoading } = useGetPagesQuery(
        spaceKey!,
        {
            skip: !spaceKey,
        }
    );

    if (orgLoading || spaceLoading) {
        return (
            <Center flex="1" h="100vh">
                <Spinner size="lg" />
            </Center>
        );
    }

    const rootPages = pages.filter((p) => !p.parentId);

    return (
        <Box flex="1" overflowY="auto" bg="bg.subtle" p={8}>
            <Stack gap={6}>
                {/* Breadcrumb + actions */}
                <HStack justify="space-between">
                    <Breadcrumb.Root>
                        <Breadcrumb.List>
                            <Breadcrumb.Item>
                                <Breadcrumb.Link href="#">
                                    {org?.name ?? <Skeleton h="4" w="24" />}
                                </Breadcrumb.Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Separator>
                                <LuChevronRight />
                            </Breadcrumb.Separator>
                            <Breadcrumb.Item>
                                <Breadcrumb.CurrentLink>
                                    {space?.name ?? <Skeleton h="4" w="32" />}
                                </Breadcrumb.CurrentLink>
                            </Breadcrumb.Item>
                        </Breadcrumb.List>
                    </Breadcrumb.Root>

                    <HStack gap={4}>
                        <Button
                            variant="subtle"
                            colorPalette="blue"
                            size="sm"
                            onClick={() => setIsCreatePageOpen(true)}
                        >
                            <LuPlus />
                            Создать
                        </Button>
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
                ) : rootPages.length === 0 ? (
                    <Center py={16}>
                        <Stack align="center" gap={3}>
                            <Text color="fg.muted">Страниц пока нет</Text>
                            <Button
                                size="sm"
                                colorPalette="blue"
                                onClick={() => setIsCreatePageOpen(true)}
                            >
                                <LuPlus />
                                Создать первую страницу
                            </Button>
                        </Stack>
                    </Center>
                ) : (
                    <Grid templateColumns="repeat(4, 250px)" gap={2}>
                        {rootPages.map((page) => {
                            const isFolder = page.children.length > 0;
                            return (
                                <HStack
                                    key={page.id}
                                    bg="white"
                                    rounded="lg"
                                    p={4}
                                    justify="space-between"
                                    cursor="pointer"
                                    _hover={{ shadow: 'sm' }}
                                >
                                    <HStack gap={2}>
                                        <Icon boxSize={4} color="fg.muted">
                                            {isFolder ? (
                                                <LuFolder />
                                            ) : (
                                                <LuFile />
                                            )}
                                        </Icon>
                                        <Text fontSize="xs">{page.title}</Text>
                                    </HStack>
                                    <Icon boxSize={4} color="fg.muted">
                                        <LuEllipsis />
                                    </Icon>
                                </HStack>
                            );
                        })}
                    </Grid>
                )}
            </Stack>

            {spaceKey && (
                <CreatePageOrFolderDialog
                    isOpen={isCreatePageOpen}
                    onClose={() => setIsCreatePageOpen(false)}
                    spaceKey={spaceKey}
                />
            )}
        </Box>
    );
};
