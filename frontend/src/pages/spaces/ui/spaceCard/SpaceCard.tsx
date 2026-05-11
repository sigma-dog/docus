import { type FC } from 'react';
import { useNavigate } from 'react-router';
import { Avatar, Box, Card, HStack, Stack, Text } from '@chakra-ui/react';

import type { Space } from 'shared/types';
import { SpaceActionsMenu } from 'widgets/spaceActionsMenu';

import { getInitials } from './utils';

type SpaceCardProps = {
    space: Space;
    orgSlug: string;
};

export const SpaceCard: FC<SpaceCardProps> = ({ space, orgSlug }) => {
    const { id, name, description, key } = space;
    const navigate = useNavigate();

    return (
        <Card.Root
            key={id}
            variant="outline"
            cursor="pointer"
            onClick={() => navigate(`/${orgSlug}/${key}`)}
        >
            <Card.Body py={4}>
                <HStack gap={5}>
                    <Avatar.Root size="md" shape="rounded">
                        {space.avatarUrl ? (
                            <Avatar.Image src={space.avatarUrl} />
                        ) : null}
                        <Avatar.Fallback name={getInitials(name)} />
                    </Avatar.Root>
                    <Stack gap={0} flex="1" minW={0} align="flex-start">
                        <Text fontWeight="semibold" fontSize="md">
                            {name}
                        </Text>
                        {description && (
                            <Text fontSize="sm" color="fg.muted" lineClamp={2}>
                                {description}
                            </Text>
                        )}
                    </Stack>
                    <Box onClick={(e) => e.stopPropagation()}>
                        <SpaceActionsMenu
                            space={space}
                            organizationSlug={orgSlug}
                        />
                    </Box>
                </HStack>
            </Card.Body>
        </Card.Root>
    );
};
