import { useState } from 'react';
import { LuPlus, LuSearch } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    Center,
    HStack,
    Icon,
    Input,
    InputGroup,
    Stack,
    Text,
} from '@chakra-ui/react';

import { useGetSpacesQuery } from 'shared/api';
import type { Space } from 'shared/types';
import { CreateSpaceDialog } from 'widgets/createSpaceDialog';

import { SpaceCard } from './spaceCard/SpaceCard';
import { SpaceCardSkeleton } from './SpaceCardSkeleton';

export const Spaces = () => {
    const { orgSlug } = useParams<{ orgSlug: string }>();
    const [search, setSearch] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data: spaces = [], isLoading } = useGetSpacesQuery(orgSlug!);

    const filtered = search.trim()
        ? spaces.filter((s: Space) =>
              s.name.toLowerCase().includes(search.toLowerCase())
          )
        : spaces;

    return (
        <Box flex="1" overflowY="auto" bg="bg.subtle" p={8}>
            <Card.Root variant="outline" bg="bg.panel">
                <Card.Body gap={3}>
                    <HStack justify="space-between" mb={1}>
                        <Text
                            fontSize="lg"
                            fontWeight="medium"
                            color="fg.muted"
                        >
                            Пространства
                        </Text>
                        <HStack gap={4}>
                            <Button
                                variant="subtle"
                                colorPalette="blue"
                                size="sm"
                                onClick={() => setIsCreateOpen(true)}
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
                                    placeholder="Поиск пространства..."
                                    variant="subtle"
                                    size="md"
                                    w="322px"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </InputGroup>
                        </HStack>
                    </HStack>

                    {isLoading ? (
                        <Stack gap={2}>
                            {[...Array(4)].map((_, i) => (
                                <SpaceCardSkeleton key={i} />
                            ))}
                        </Stack>
                    ) : filtered.length === 0 ? (
                        <Center py={16}>
                            {search ? (
                                <Text color="fg.muted">
                                    Пространства не найдены
                                </Text>
                            ) : (
                                <Stack align="center" gap={3}>
                                    <Text color="fg.muted">
                                        Нет доступных пространств
                                    </Text>
                                    <Button
                                        size="sm"
                                        colorPalette="blue"
                                        onClick={() => setIsCreateOpen(true)}
                                    >
                                        <LuPlus />
                                        Создать первое пространство
                                    </Button>
                                </Stack>
                            )}
                        </Center>
                    ) : (
                        <Stack gap={2}>
                            {filtered.map((space: Space) => (
                                <SpaceCard
                                    key={space.id}
                                    space={space}
                                    orgSlug={orgSlug!}
                                />
                            ))}
                        </Stack>
                    )}
                </Card.Body>
            </Card.Root>

            {orgSlug && (
                <CreateSpaceDialog
                    isOpen={isCreateOpen}
                    onClose={() => setIsCreateOpen(false)}
                    organizationSlug={orgSlug}
                />
            )}
        </Box>
    );
};
