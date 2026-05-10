import type { FC } from 'react';
import { LuFile, LuFolder } from 'react-icons/lu';
import { Box, HStack, Icon, Text } from '@chakra-ui/react';

import type { PageSummary } from 'shared/types';

import { NodeContextMenu } from '../../../layoutWithSidebar/ui/sidebar/navigation/NodeContextMenu';

type SpaceNavigationItemProps = {
    page: PageSummary;
    onClick: (page: PageSummary) => void;
};

export const SpaceNavigationItem: FC<SpaceNavigationItemProps> = ({
    page,
    onClick,
}) => {
    return (
        <HStack
            bg="white"
            rounded="lg"
            p={4}
            justify="space-between"
            minW={0}
            cursor="pointer"
            _hover={{ shadow: 'sm' }}
            onClick={() => onClick(page)}
        >
            <HStack gap={2} minW={0} flex="1">
                {page.icon ? (
                    <Box as="span" lineHeight="1" fontSize="sm">
                        {page.icon}
                    </Box>
                ) : (
                    <Icon boxSize={4} color="fg.muted">
                        {page.isFolder ? <LuFolder /> : <LuFile />}
                    </Icon>
                )}
                <Text fontSize="xs" truncate minW={0} title={page.title}>
                    {page.title}
                </Text>
            </HStack>
            <NodeContextMenu
                nodeId={page.id}
                nodeTitle={page.title}
                nodeIcon={page.icon}
                isFolder={page.isFolder}
            />
        </HStack>
    );
};
