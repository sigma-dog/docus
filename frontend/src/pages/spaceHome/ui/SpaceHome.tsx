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

import { useGetOrganizationQuery, useGetSpaceQuery } from 'shared/api';

export const SpaceHome = () => {
    const { orgSlug, spaceKey } = useParams<{
        orgSlug: string;
        spaceKey: string;
    }>();

    const { data: org, isLoading: orgLoading } = useGetOrganizationQuery(
        orgSlug!
    );
    const { data: space, isLoading: spaceLoading } = useGetSpaceQuery({
        key: spaceKey!,
        organizationSlug: orgSlug!,
    });

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
                        <Button variant="subtle" colorPalette="blue" size="sm">
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

                {/* Placeholder — страницы будут здесь */}
                <Grid templateColumns="repeat(4, 250px)" gap={2}>
                    {[
                        { id: '1', label: 'Документация', isFolder: true },
                        { id: '2', label: 'API Reference', isFolder: false },
                        { id: '3', label: 'Changelog', isFolder: false },
                    ].map((page) => (
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
                                    {page.isFolder ? <LuFolder /> : <LuFile />}
                                </Icon>
                                <Text fontSize="xs">{page.label}</Text>
                            </HStack>
                            <Icon boxSize={4} color="fg.muted">
                                <LuEllipsis />
                            </Icon>
                        </HStack>
                    ))}
                </Grid>
            </Stack>
        </Box>
    );
};
