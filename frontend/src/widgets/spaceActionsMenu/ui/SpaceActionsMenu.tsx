import { type FC, useState } from 'react';
import { LuEllipsis, LuPencil, LuTrash2 } from 'react-icons/lu';
import {
    Button,
    Dialog,
    IconButton,
    Menu,
    Portal,
    Text,
} from '@chakra-ui/react';

import { useDeleteSpaceMutation } from 'shared/api';
import type { Space } from 'shared/types';
import { RenameSpaceDialog } from 'widgets/renameSpaceDialog';

type SpaceActionsMenuProps = {
    space: Space;
    organizationSlug: string;
    triggerProps?: React.ComponentProps<typeof IconButton>;
};

export const SpaceActionsMenu: FC<SpaceActionsMenuProps> = ({
    space,
    organizationSlug,
    triggerProps,
}) => {
    const [isRenameOpen, setIsRenameOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [deleteSpace, { isLoading: isDeleting }] = useDeleteSpaceMutation();

    const handleDelete = async () => {
        await deleteSpace({ key: space.key, organizationSlug });
        setIsDeleteOpen(false);
    };

    return (
        <>
            <Menu.Root>
                <Menu.Trigger asChild>
                    <IconButton
                        aria-label="Действия с пространством"
                        variant="ghost"
                        size="sm"
                        {...triggerProps}
                    >
                        <LuEllipsis />
                    </IconButton>
                </Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content minW="160px">
                            <Menu.Item
                                value="rename"
                                onClick={() => setIsRenameOpen(true)}
                            >
                                <LuPencil />
                                Изменить
                            </Menu.Item>
                            <Menu.Item
                                value="delete"
                                color="red.500"
                                onClick={() => setIsDeleteOpen(true)}
                            >
                                <LuTrash2 />
                                Удалить
                            </Menu.Item>
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>

            <RenameSpaceDialog
                key={String(isRenameOpen)}
                isOpen={isRenameOpen}
                onClose={() => setIsRenameOpen(false)}
                space={space}
                organizationSlug={organizationSlug}
            />

            <Dialog.Root
                open={isDeleteOpen}
                placement="center"
                onEscapeKeyDown={() => setIsDeleteOpen(false)}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>
                                    Удалить пространство
                                </Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Text>
                                    Вы уверены, что хотите удалить пространство{' '}
                                    <Text as="span" fontWeight="semibold">
                                        {space.name}
                                    </Text>
                                    ? Все страницы будут удалены безвозвратно.
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsDeleteOpen(false)}
                                    disabled={isDeleting}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    colorPalette="red"
                                    onClick={handleDelete}
                                    loading={isDeleting}
                                >
                                    Удалить
                                </Button>
                            </Dialog.Footer>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};
