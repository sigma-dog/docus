import { type FC, useRef, useState } from 'react';
import { LuEllipsis, LuPencil, LuSmile, LuTrash2, LuX } from 'react-icons/lu';
import { useParams } from 'react-router-dom';
import {
    Button,
    CloseButton,
    Dialog,
    Field,
    IconButton,
    Input,
    Menu,
    Popover,
    Portal,
    Stack,
} from '@chakra-ui/react';

import { useDeletePageMutation, useUpdatePageMutation } from 'shared/api';
import { EmojiPicker } from 'shared/ui';
import { ConfirmDialog } from 'shared/ui/confirmDialog/ConfirmDialog';

type Props = {
    nodeId: string;
    nodeTitle: string;
    nodeIcon?: string | null;
    isFolder?: boolean;
};

export const NodeContextMenu: FC<Props> = ({
    nodeId,
    nodeTitle,
    nodeIcon,
    isFolder,
}) => {
    const { spaceKey } = useParams<{ spaceKey?: string }>();
    const [menuEverOpened, setMenuEverOpened] = useState(false);
    const [renameOpen, setRenameOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [title, setTitle] = useState('');
    const buttonRef = useRef<HTMLButtonElement>(null);

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

    const handleEmojiSelect = async (emoji: string) => {
        if (!spaceKey) {
            return;
        }
        await updatePage({ spaceKey, pageId: nodeId, body: { icon: emoji } });
        setEmojiOpen(false);
    };

    const handleRemoveIcon = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!spaceKey) {
            return;
        }
        await updatePage({ spaceKey, pageId: nodeId, body: { icon: null } });
    };

    return (
        <>
            <Popover.Root
                open={emojiOpen}
                onOpenChange={(details) => setEmojiOpen(details.open)}
                positioning={{
                    placement: 'right-start',
                    getAnchorRect: () =>
                        buttonRef.current?.getBoundingClientRect() ?? null,
                }}
            >
                <Menu.Root
                    onOpenChange={(details) => {
                        if (details.open) {
                            setMenuEverOpened(true);
                        }
                    }}
                    onSelect={(details) => {
                        if (details.value === 'icon') {
                            setEmojiOpen(true);
                        } else if (details.value === 'rename') {
                            handleRenameOpen();
                        } else if (details.value === 'delete') {
                            setDeleteOpen(true);
                        }
                    }}
                >
                    <Menu.Trigger asChild>
                        <IconButton
                            ref={buttonRef}
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
                            <Menu.Content
                                minW="44"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Menu.Item value="icon">
                                    <LuSmile />
                                    Выбрать иконку
                                </Menu.Item>
                                {nodeIcon && (
                                    <Menu.Item
                                        value="remove-icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveIcon(e);
                                        }}
                                    >
                                        <LuX />
                                        Убрать иконку
                                    </Menu.Item>
                                )}
                                <Menu.Item value="rename">
                                    <LuPencil />
                                    Переименовать
                                </Menu.Item>
                                <Menu.Item value="delete" color="red.500">
                                    <LuTrash2 />
                                    Удалить
                                </Menu.Item>
                            </Menu.Content>
                        </Menu.Positioner>
                    </Portal>
                </Menu.Root>
                {menuEverOpened && (
                    <Portal>
                        <Popover.Positioner>
                            <Popover.Content p={0} w="auto">
                                <EmojiPicker onSelect={handleEmojiSelect} />
                            </Popover.Content>
                        </Popover.Positioner>
                    </Portal>
                )}
            </Popover.Root>

            {menuEverOpened && (
                <>
                    <ConfirmDialog
                        isOpen={deleteOpen}
                        onClose={() => setDeleteOpen(false)}
                        onConfirm={handleDeleteConfirm}
                        title={
                            isFolder ? 'Удалить директорию' : 'Удалить страницу'
                        }
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
                                        <Dialog.Title>
                                            Переименовать
                                        </Dialog.Title>
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
            )}
        </>
    );
};
