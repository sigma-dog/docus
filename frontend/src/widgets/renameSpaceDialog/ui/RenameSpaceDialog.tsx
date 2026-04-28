import { type FC, type FormEvent, useState } from 'react';
import {
    Button,
    CloseButton,
    Dialog,
    Field,
    Input,
    Portal,
    Stack,
    Textarea,
} from '@chakra-ui/react';

import { useUpdateSpaceMutation } from 'shared/api';
import type { Space } from 'shared/types';

type RenameSpaceDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    space: Space;
    organizationSlug: string;
};

export const RenameSpaceDialog: FC<RenameSpaceDialogProps> = ({
    isOpen,
    onClose,
    space,
    organizationSlug,
}) => {
    const [name, setName] = useState(space.name);
    const [description, setDescription] = useState(space.description ?? '');

    const [updateSpace, { isLoading }] = useUpdateSpaceMutation();

    const handleClose = () => {
        onClose();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            return;
        }

        await updateSpace({
            key: space.key,
            organizationSlug,
            body: {
                name: name.trim(),
                description: description.trim() || undefined,
            },
        });

        handleClose();
    };

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
                                    Переименовать пространство
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
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            autoFocus
                                        />
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label>Описание</Field.Label>
                                        <Textarea
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                            resize="none"
                                            rows={3}
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
                                    disabled={!name.trim()}
                                >
                                    Сохранить
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
