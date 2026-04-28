import { Card, HStack, Skeleton, SkeletonText, Stack } from '@chakra-ui/react';

export const SpaceCardSkeleton = () => {
    return (
        <Card.Root variant="outline">
            <Card.Body>
                <HStack gap={5}>
                    <Skeleton boxSize="40px" borderRadius="md" flexShrink={0} />
                    <Stack gap={1} flex="1" minW={0}>
                        <Skeleton h="4" w="40%" />
                        <SkeletonText noOfLines={2} />
                    </Stack>
                </HStack>
            </Card.Body>
        </Card.Root>
    );
};
