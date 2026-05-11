import {
    type ChangeEvent,
    type FC,
    type ReactElement,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    Avatar,
    Button,
    CloseButton,
    Dialog,
    Field,
    Input,
    Portal,
    Stack,
    Text,
} from '@chakra-ui/react';

import {
    useGetCurrentUserQuery,
    useUpdateCurrentUserMutation,
} from 'shared/api';
import { getUserInfo } from 'shared/lib';
import { toaster } from 'shared/ui/chakra/toaster';

type UserProfileDialogProps = {
    trigger: ReactElement;
};

type ProfileFormState = {
    username: string;
    email: string;
    avatarUrl: string;
};

const getInitialFormState = (): ProfileFormState => {
    const user = getUserInfo();

    return {
        username: user?.username ?? '',
        email: user?.email ?? '',
        avatarUrl: user?.avatarUrl ?? '',
    };
};

export const UserProfileDialog: FC<UserProfileDialogProps> = ({ trigger }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formState, setFormState] = useState<ProfileFormState>(
        getInitialFormState
    );
    const initialFocusRef = useRef<HTMLInputElement>(null);
    const { data: currentUser } = useGetCurrentUserQuery(undefined, {
        skip: !isOpen,
    });
    const [updateCurrentUser, { isLoading: isSaving }] =
        useUpdateCurrentUserMutation();

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setFormState({
            username: currentUser?.username ?? getUserInfo()?.username ?? '',
            email: currentUser?.email ?? getUserInfo()?.email ?? '',
            avatarUrl: currentUser?.avatarUrl ?? getUserInfo()?.avatarUrl ?? '',
        });
    }, [currentUser, isOpen]);

    const handleFieldChange =
        (field: keyof ProfileFormState) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
        };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (!open) {
            setFormState(getInitialFormState());
        }
    };

    const handleSave = async () => {
        const username = formState.username.trim();
        const email = formState.email.trim();
        const avatarUrl = formState.avatarUrl.trim();

        if (!username || !email) {
            toaster.create({
                type: 'error',
                title: 'Заполните обязательные поля',
                description: 'Имя и email не должны быть пустыми',
            });
            return;
        }

        try {
            await updateCurrentUser({
                username,
                email,
                avatarUrl,
            }).unwrap();

            toaster.create({
                type: 'success',
                title: 'Профиль обновлён',
            });
            handleOpenChange(false);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось сохранить профиль',
            });
        }
    };

    const previewName =
        formState.username.trim() || currentUser?.username || 'Пользователь';

    return (
        <Dialog.Root
            lazyMount
            open={isOpen}
            placement="center"
            initialFocusEl={() => initialFocusRef.current}
            onOpenChange={(e) => handleOpenChange(e.open)}
        >
            <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Редактирование профиля</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Stack gap={5}>
                                <Stack align="center" gap={3}>
                                    <Avatar.Root size="2xl" shape="full">
                                        {formState.avatarUrl ? (
                                            <Avatar.Image
                                                src={formState.avatarUrl}
                                            />
                                        ) : null}
                                        <Avatar.Fallback name={previewName} />
                                    </Avatar.Root>
                                    <Text
                                        fontSize="sm"
                                        color="fg.muted"
                                        textAlign="center"
                                    >
                                        Изменения сохранятся сразу для вашего
                                        аккаунта
                                    </Text>
                                </Stack>

                                <Field.Root required>
                                    <Field.Label>Имя</Field.Label>
                                    <Input
                                        ref={initialFocusRef}
                                        value={formState.username}
                                        onChange={handleFieldChange('username')}
                                        placeholder="Ваше имя"
                                    />
                                </Field.Root>

                                <Field.Root required>
                                    <Field.Label>Email</Field.Label>
                                    <Input
                                        type="email"
                                        value={formState.email}
                                        onChange={handleFieldChange('email')}
                                        placeholder="you@example.com"
                                    />
                                </Field.Root>

                                <Field.Root>
                                    <Field.Label>Ссылка на аватар</Field.Label>
                                    <Input
                                        value={formState.avatarUrl}
                                        onChange={handleFieldChange('avatarUrl')}
                                        placeholder="https://example.com/avatar.png"
                                    />
                                    <Field.HelperText>
                                        Можно оставить пустым, тогда покажем
                                        инициалы
                                    </Field.HelperText>
                                </Field.Root>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSaving}
                            >
                                Отмена
                            </Button>
                            <Button
                                colorPalette="blue"
                                onClick={handleSave}
                                loading={isSaving}
                            >
                                Сохранить
                            </Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
