import type { FC } from 'react';
import { LuFile, LuFolder, LuPlus } from 'react-icons/lu';
import { Button, Menu, Portal } from '@chakra-ui/react';

import { useCurrentSpacePermissions } from 'shared/lib';

type AddButtonProps = {
    onCreatePage: () => void;
    onCreateFolder: () => void;
};

export const AddButton: FC<AddButtonProps> = ({
    onCreatePage,
    onCreateFolder,
}) => {
    const { canEdit } = useCurrentSpacePermissions();

    if (!canEdit) {
        return null;
    }

    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button variant="subtle" colorPalette="blue" w="full" size="md">
                    <LuPlus />
                    Создать
                </Button>
            </Menu.Trigger>
            <Portal>
                <Menu.Positioner>
                    <Menu.Content minW="44">
                        <Menu.Item value="page" onClick={onCreatePage}>
                            <LuFile />
                            Страница
                        </Menu.Item>
                        <Menu.Item value="folder" onClick={onCreateFolder}>
                            <LuFolder />
                            Директория
                        </Menu.Item>
                    </Menu.Content>
                </Menu.Positioner>
            </Portal>
        </Menu.Root>
    );
};
