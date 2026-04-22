import { type FC, useState } from 'react';
import { LuEllipsis, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import {
    Button,
    CloseButton,
    Dialog,
    Field,
    IconButton,
    Input,
    Menu,
    Portal,
    Stack,
} from '@chakra-ui/react';

import { useDeletePageMutation, useUpdatePageMutation } from 'shared/api';
import { ConfirmDialog } from 'shared/ui/confirmDialog/ConfirmDialog';

type Props = {
    nodeId: string;
    nodeTitle: string;
    isFolder?: boolean;
};

export const NodeContextMenu: FC<Props> = ({ nodeId, nodeTitle, isFolder }) => {
    const { spaceKey } = useParams<{ spaceKey?: string }>();
    const [renameOpen, setRenameOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [title, setTitle] = useState('');

    const [updatePage, { isLoading: isUpdating }] = useUpdatePageMutation();
    const [deletePage, { isLoading: isDeleting }] = useDeletePageMutation();

    const handleRenameOpen = () => {
        setTitle(nodeTitle);
        setRenameOpen(true);
    };

    const handleRenameClose = () => {
        setRenameOpen(false);
        setTitle('');
    };

    const handleRenameSubmit = async () => {
        if (!title.trim() || !spaceKey) {
            return;
        }

        await updatePage({
            spaceKey,
            pageId: nodeId,
            body: { title: title.trim() },
        });
        handleRenameClose();
    };

    const handleDeleteConfirm = async () => {
        if (!spaceKey) {
            return;
        }
        await deletePage({ spaceKey, pageId: nodeId });
        setDeleteOpen(false);
    };

    return (
        <>
            <Menu.Root>
                <Menu.Trigger asChild>
                    <IconButton
                        aria-label="Действия"
                        size="2xs"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <LuEllipsis />
                    </IconButton>
                </Menu.Trigger>
                <Portal>
                    <Menu.Positioner>
                        <Menu.Content minW="44">
                            <Menu.Item
                                value="rename"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRenameOpen();
                                }}
                            >
                                <LuPencil />
                                Переименовать
                            </Menu.Item>
                            <Menu.Item
                                value="delete"
                                color="red.500"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteOpen(true);
                                }}
                            >
                                <LuTrash2 />
                                Удалить
                            </Menu.Item>
                        </Menu.Content>
                    </Menu.Positioner>
                </Portal>
            </Menu.Root>

            <ConfirmDialog
                isOpen={deleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDeleteConfirm}
                title={isFolder ? 'Удалить директорию' : 'Удалить страницу'}
                message={
                    isFolder
                        ? `Директория «${nodeTitle}» и все её дочерние страницы будут удалены безвозвратно.`
                        : `Страница «${nodeTitle}» будет удалена безвозвратно.`
                }
                confirmText="Удалить"
                isLoading={isDeleting}
            />

            <Dialog.Root
                lazyMount
                open={renameOpen}
                placement="center"
                onEscapeKeyDown={handleRenameClose}
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>Переименовать</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Stack gap={4}>
                                    <Field.Root required>
                                        <Field.Label>
                                            Название
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            autoFocus
                                        />
                                    </Field.Root>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button
                                    variant="outline"
                                    onClick={handleRenameClose}
                                    type="button"
                                >
                                    Отмена
                                </Button>
                                <Button
                                    colorPalette="blue"
                                    loading={isUpdating}
                                    disabled={!title.trim()}
                                    onClick={handleRenameSubmit}
                                >
                                    Сохранить
                                </Button>
                            </Dialog.Footer>
                            <Dialog.CloseTrigger
                                asChild
                                onClick={handleRenameClose}
                            >
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};
