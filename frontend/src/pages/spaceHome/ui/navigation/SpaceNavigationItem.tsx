import type { FC } from 'react';
import { LuFile, LuFolder } from 'react-icons/lu';
import { Box, HStack, Icon, Text, VStack } from '@chakra-ui/react';

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
    const stopEventPropagation = (event: { stopPropagation: () => void }) => {
        event.stopPropagation();
    };

    return (
        <VStack
            bg="white"
            rounded="lg"
            p={4}
            justify="space-between"
            align="flex-start"
            minW={0}
            cursor="pointer"
            _hover={{ shadow: 'sm' }}
            onClick={() => onClick(page)}
        >
            <Text textStyle="xs" color="fg.muted">
                {page.isFolder ? 'Папка' : 'Страница'}
            </Text>
            <HStack w="full">
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
                    <Text fontSize="md" truncate minW={0} title={page.title}>
                        {page.title}
                    </Text>
                </HStack>
                <Box
                    onPointerDown={stopEventPropagation}
                    onClick={stopEventPropagation}
                >
                    <NodeContextMenu
                        nodeId={page.id}
                        nodeTitle={page.title}
                        nodeIcon={page.icon}
                        isFolder={page.isFolder}
                    />
                </Box>
            </HStack>
        </VStack>
    );
};
