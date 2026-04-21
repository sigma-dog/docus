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

import { useCreateSpaceMutation } from 'shared/api';

type CreateSpaceDialogProps = {
    isOpen: boolean;
    onClose: () => void;
    organizationSlug: string;
};

export const CreateSpaceDialog: FC<CreateSpaceDialogProps> = ({
    isOpen,
    onClose,
    organizationSlug,
}) => {
    const [name, setName] = useState('');
    const [key, setKey] = useState('');
    const [description, setDescription] = useState('');
    const [keyTouched, setKeyTouched] = useState(false);

    const [createSpace, { isLoading }] = useCreateSpaceMutation();

    const keyError =
        keyTouched && !/^[A-Z0-9]{2,10}$/.test(key)
            ? 'От 2 до 10 символов: заглавные буквы и цифры (например, PROJ, TEAM1)'
            : undefined;

    const handleNameChange = (value: string) => {
        setName(value);
        if (!keyTouched) {
            setKey(
                value
                    .toUpperCase()
                    .replace(/[^A-Z0-9]/g, '')
                    .slice(0, 10)
            );
        }
    };

    const handleClose = () => {
        setName('');
        setKey('');
        setDescription('');
        setKeyTouched(false);
        onClose();
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (keyError || !name || !key) {
            return;
        }

        await createSpace({
            name,
            key,
            organizationSlug,
            description: description || undefined,
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
                                <Dialog.Title>Новое пространство</Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <Stack gap={4}>
                                    <Field.Root required>
                                        <Field.Label>
                                            Название
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            placeholder="Например: Frontend команда"
                                            value={name}
                                            onChange={(e) =>
                                                handleNameChange(e.target.value)
                                            }
                                        />
                                    </Field.Root>

                                    <Field.Root required invalid={!!keyError}>
                                        <Field.Label>
                                            Ключ
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            placeholder="PROJ"
                                            value={key}
                                            onChange={(e) => {
                                                setKey(
                                                    e.target.value
                                                        .toUpperCase()
                                                        .replace(
                                                            /[^A-Z0-9]/g,
                                                            ''
                                                        )
                                                        .slice(0, 10)
                                                );
                                                setKeyTouched(true);
                                            }}
                                        />
                                        {keyError && (
                                            <Field.ErrorText>
                                                {keyError}
                                            </Field.ErrorText>
                                        )}
                                        <Field.HelperText>
                                            Уникальный идентификатор
                                            пространства в URL
                                        </Field.HelperText>
                                    </Field.Root>

                                    <Field.Root>
                                        <Field.Label>Описание</Field.Label>
                                        <Textarea
                                            placeholder="Краткое описание пространства"
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
                                    disabled={!name || !key || !!keyError}
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
