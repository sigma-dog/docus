import {
    LuChevronRight,
    LuEllipsis,
    LuFile,
    LuFolder,
    LuPlus,
    LuSearch,
} from 'react-icons/lu';
import {
    Box,
    Breadcrumb,
    Button,
    Grid,
    HStack,
    Icon,
    Input,
    InputGroup,
    Stack,
    Text,
} from '@chakra-ui/react';

import type { SpacePage } from '../lib/types';

type SpaceContentProps = {
    workspaceName: string;
    spaceName: string;
    spaceDescription: string;
    pages: SpacePage[];
};

export const SpaceContent = ({
    workspaceName,
    spaceName,
    spaceDescription,
    pages,
}: SpaceContentProps) => {
    return (
        <Stack gap={6}>
            {/* Breadcrumb + actions */}
            <HStack justify="space-between">
                <Breadcrumb.Root>
                    <Breadcrumb.List>
                        <Breadcrumb.Item>
                            <Breadcrumb.Link href="#">
                                {workspaceName}
                            </Breadcrumb.Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Separator>
                            <LuChevronRight />
                        </Breadcrumb.Separator>
                        <Breadcrumb.Item>
                            <Breadcrumb.CurrentLink>
                                {spaceName}
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
                    {spaceName}
                </Text>
                <Text fontSize="sm" color="fg.muted">
                    {spaceDescription}
                </Text>
            </Box>

            {/* Pages grid */}
            <Grid templateColumns="repeat(4, 250px)" gap={2}>
                {pages.map((page) => (
                    <HStack
                        key={page.id}
                        bg="panel"
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
    );
};
