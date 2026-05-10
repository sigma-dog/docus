import { LuFile, LuFolder, LuPlus } from 'react-icons/lu';
import { IconButton, Menu, Portal } from '@chakra-ui/react';

import { useCurrentSpacePermissions } from 'shared/lib';

export const CreateNodeMenu = ({
    nodeId,
    onCreatePage,
    onCreateFolder,
}: {
    nodeId?: string;
    onCreatePage?: (parentId?: string) => void;
    onCreateFolder?: (parentId?: string) => void;
}) => {
    const { canEdit } = useCurrentSpacePermissions();

    if (!canEdit) {
        return null;
    }

    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <IconButton
                    aria-label="Создать внутри"
                    size="2xs"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                >
                    <LuPlus />
                </IconButton>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content minW="44">
                        <Menu.Item
                            value="page"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreatePage?.(nodeId);
                            }}
                        >
                            <LuFile />
                            Страница
                        </Menu.Item>
                        <Menu.Item
                            value="folder"
                            onClick={(e) => {
                                e.stopPropagation();
                                onCreateFolder?.(nodeId);
                            }}
                        >
                            <LuFolder />
                            Директория
                        </Menu.Item>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
};
