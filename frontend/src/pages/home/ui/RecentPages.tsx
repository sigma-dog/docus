import { Avatar, Card, Grid, HStack, Stack, Text } from '@chakra-ui/react';

import type { RecentPage } from '../lib/types';

type RecentPagesProps = {
    pages: RecentPage[];
};

export const RecentPages = ({ pages }: RecentPagesProps) => {
    return (
        <Card.Root bg="white" rounded="xl" p={8} shadow="none" borderWidth={0}>
            <Card.Body p={0} gap={5}>
                <Text fontSize="lg" fontWeight="medium" color="fg.muted">
                    Продолжите работу с того места, где закончили
                </Text>

                <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                    {pages.map((page) => (
                        <Card.Root
                            key={page.id}
                            variant="outline"
                            cursor="pointer"
                            _hover={{ shadow: 'sm' }}
                        >
                            <Card.Body p={4}>
                                <HStack gap={4} align="flex-start">
                                    <Avatar.Root
                                        size="sm"
                                        shape="rounded"
                                        flexShrink={0}
                                    >
                                        <Avatar.Fallback name={page.title} />
                                    </Avatar.Root>
                                    <Stack gap={0} minW={0}>
                                        <Text
                                            fontSize="md"
                                            fontWeight="semibold"
                                            lineHeight="24px"
                                        >
                                            {page.title}
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            color="fg.muted"
                                            lineHeight="20px"
                                        >
                                            {page.description}
                                        </Text>
                                    </Stack>
                                </HStack>
                            </Card.Body>
                        </Card.Root>
                    ))}
                </Grid>
            </Card.Body>
        </Card.Root>
    );
};
