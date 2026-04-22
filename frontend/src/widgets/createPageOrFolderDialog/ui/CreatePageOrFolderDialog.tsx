import { type FC, type FormEvent, useState } from 'react';
import { LuFile, LuFolder } from 'react-icons/lu';
import {
    Button,
    CloseButton,
    Dialog,
    Field,
    HStack,
    Icon,
    Input,
    Portal,
    Stack,
    Text,
} from '@chakra-ui/react';

import { useCreatePageMutation } from 'shared/api';

type CreatePageOrFolderDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    spaceKey: string;
    parentId?: string;
    isFolder?: boolean;
};

export const CreatePageOrFolderDialog: FC<CreatePageOrFolderDialogProps> = ({
    isOpen,
    onClose,
    spaceKey,
    parentId,
    isFolder = false,
}) => {
    const [title, setTitle] = useState('');
    const [createPage, { isLoading }] = useCreatePageMutation();

    const handleClose = () => {
        setTitle('');
        onClose();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            return;
        }

        await createPage({
            spaceKey,
            body: { title: title.trim(), parentId, isFolder },
        });
        handleClose();
    };

    const dialogTitle = isFolder ? 'Новая директория' : 'Новая страница';
    const placeholder = isFolder
        ? 'Введите название директории'
        : 'Введите название страницы';

    return (
        <Dialog.Root
            lazyMount
            open={isOpen}
            placement="center"
            onEscapeKeyDown={handleClose}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <form onSubmit={handleSubmit}>
                            <Dialog.Header>
                                <Dialog.Title>
                                    <HStack gap={2}>
                                        <Icon color="fg.muted">
                                            {isFolder ? (
                                                <LuFolder />
                                            ) : (
                                                <LuFile />
                                            )}
                                        </Icon>
                                        <Text>{dialogTitle}</Text>
                                    </HStack>
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
                                            placeholder={placeholder}
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
                                    onClick={handleClose}
                                    type="button"
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type="submit"
                                    colorPalette="blue"
                                    loading={isLoading}
                                    disabled={!title.trim()}
                                >
                                    Создать
                                </Button>
                            </Dialog.Footer>

                            <Dialog.CloseTrigger asChild onClick={handleClose}>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </form>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
