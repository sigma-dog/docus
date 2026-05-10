import { type FC, type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    CloseButton,
    Dialog,
    Field,
    Input,
    Portal,
    Stack,
    Text,
} from '@chakra-ui/react';

import { useJoinOrganizationMutation } from 'shared/api';
import { toaster } from 'shared/ui/chakra/toaster';

type JoinOrgDialogProps = {
    isOpen: boolean;
    onClose: () => void;
};

export const JoinOrgDialog: FC<JoinOrgDialogProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [code, setCode] = useState('');
    const [joinOrganization, { isLoading }] = useJoinOrganizationMutation();

    const handleClose = () => {
        setCode('');
        onClose();
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        const trimmedCode = code.trim();

        if (!trimmedCode) {
            return;
        }

        try {
            const member = await joinOrganization({
                code: trimmedCode,
            }).unwrap();

            handleClose();
            navigate(`/${member.organization!.slug}`);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Неверный или устаревший инвайт-код',
            });
        }
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
                                <Dialog.Title>Войти в организацию</Dialog.Title>
                            </Dialog.Header>

                            <Dialog.Body>
                                <Stack gap={4}>
                                    <Text color="fg.muted" fontSize="sm">
                                        Введите инвайт-код, который вам прислал
                                        администратор организации.
                                    </Text>

                                    <Field.Root required>
                                        <Field.Label>
                                            Инвайт-код
                                            <Field.RequiredIndicator />
                                        </Field.Label>
                                        <Input
                                            placeholder="Введите код приглашения"
                                            value={code}
                                            onChange={(e) =>
                                                setCode(e.target.value)
                                            }
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
                                    disabled={!code.trim()}
                                >
                                    Присоединиться
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
