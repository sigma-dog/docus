import type { FC } from 'react';
import { LuInfo, LuSettings } from 'react-icons/lu';
import { HStack, Icon, Stack, Text } from '@chakra-ui/react';

type SidebarFooterProps = {
    isExpanded: boolean;
};

export const SidebarFooter: FC<SidebarFooterProps> = ({ isExpanded }) => {
    return (
        <Stack gap={2} borderTopWidth="1px" borderColor="border.default" pt={4}>
            <HStack gap={2} cursor="pointer" _hover={{ color: 'fg' }}>
                <Icon boxSize={4} color="fg.muted">
                    <LuInfo />
                </Icon>

                {isExpanded && (
                    <Text fontSize="xs" color="fg.muted">
                        Помощь
                    </Text>
                )}
            </HStack>
            <HStack gap={2} cursor="pointer" _hover={{ color: 'fg' }}>
                <Icon boxSize={4} color="fg.muted">
                    <LuSettings />
                </Icon>
                {isExpanded && (
                    <Text fontSize="xs" color="fg.muted">
                        Настройки
                    </Text>
                )}
            </HStack>
        </Stack>
    );
};
