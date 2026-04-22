import type { FC } from 'react';
import { LuFile, LuFolder, LuPlus } from 'react-icons/lu';
import { Button, Menu, Portal } from '@chakra-ui/react';

type AddButtonProps = {
    isExpanded: boolean;
    onCreatePage: () => void;
    onCreateFolder: () => void;
};

export const AddButton: FC<AddButtonProps> = ({
    isExpanded,
    onCreatePage,
    onCreateFolder,
}) => {
    return (
        <Menu.Root>
            <Menu.Trigger asChild>
                <Button variant="subtle" colorPalette="blue" w="full" size="md">
                    <LuPlus />
                    {isExpanded && 'Создать'}
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
