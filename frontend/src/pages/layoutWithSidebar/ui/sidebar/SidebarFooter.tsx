import { LuInfo, LuSettings } from 'react-icons/lu';
import { Button, HStack, Icon, Stack, Text } from '@chakra-ui/react';

import { UserSettingsDialog } from 'widgets/userSettingsMenu';

export const SidebarFooter = () => {
    return (
        <Stack gap={2} borderTopWidth="1px" borderColor="border.default" pt={4}>
            <HStack gap={2} cursor="pointer" _hover={{ color: 'fg' }}>
                <Icon boxSize={4} color="fg.muted">
                    <LuInfo />
                </Icon>

                <Text fontSize="xs" color="fg.muted">
                    Помощь
                </Text>
            </HStack>
            <UserSettingsDialog
                trigger={
                    <Button
                        variant="ghost"
                        size="xs"
                        justifyContent="flex-start"
                        px={0}
                        minW={0}
                        color="fg.muted"
                        _hover={{ color: 'fg' }}
                    >
                        <Icon boxSize={4} color="fg.muted">
                            <LuSettings />
                        </Icon>
                        <Text fontSize="xs" color="fg.muted">
                            Настройки
                        </Text>
                    </Button>
                }
            />
        </Stack>
    );
};
