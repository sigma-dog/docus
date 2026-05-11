import {
    type ChangeEvent,
    type FC,
    type ReactElement,
    useRef,
    useState,
} from 'react';
import { LuTrash2, LuUpload } from 'react-icons/lu';
import {
    Avatar,
    Button,
    CloseButton,
    Dialog,
    Field,
    FileUpload,
    HStack,
    Input,
    Portal,
    Stack,
    Text,
} from '@chakra-ui/react';

import {
    useGetCurrentUserQuery,
    useRemoveCurrentUserAvatarMutation,
    useUpdateCurrentUserMutation,
    useUploadCurrentUserAvatarMutation,
} from 'shared/api';
import { getUserInfo } from 'shared/lib';
import { toaster } from 'shared/ui/chakra/toaster';

type UserProfileDialogProps = {
    trigger: ReactElement;
};

type ProfileFormState = {
    username: string;
    email: string;
};

const ACCEPTED_AVATAR_TYPES = {
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'image/webp': ['.webp'],
    'image/gif': ['.gif'],
};

const getFormStateFromUser = (
    user:
        | {
              username?: string | null;
              email?: string | null;
              avatarUrl?: string | null;
          }
        | null
        | undefined
): ProfileFormState => {
    const fallbackUser = getUserInfo();
    const sourceUser = user ?? fallbackUser;

    return {
        username: sourceUser?.username ?? '',
        email: sourceUser?.email ?? '',
    };
};

export const UserProfileDialog: FC<UserProfileDialogProps> = ({ trigger }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [formState, setFormState] = useState<ProfileFormState>(() =>
        getFormStateFromUser(null)
    );
    const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
        null
    );
    const [avatarPreviewUrl, setAvatarPreviewUrl] = useState('');
    const [isAvatarMarkedForRemoval, setIsAvatarMarkedForRemoval] =
        useState(false);
    const initialFocusRef = useRef<HTMLInputElement>(null);
    const { data: currentUser } = useGetCurrentUserQuery();
    const [updateCurrentUser, { isLoading: isSaving }] =
        useUpdateCurrentUserMutation();
    const [uploadCurrentUserAvatar, { isLoading: isUploadingAvatar }] =
        useUploadCurrentUserAvatarMutation();
    const [removeCurrentUserAvatar, { isLoading: isRemovingAvatar }] =
        useRemoveCurrentUserAvatarMutation();

    const isSubmitting = isSaving || isUploadingAvatar || isRemovingAvatar;

    const handleFieldChange =
        (field: keyof ProfileFormState) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            setFormState((prev) => ({
                ...prev,
                [field]: event.target.value,
            }));
        };

    const resetFormState = (
        user:
            | {
                  username?: string | null;
                  email?: string | null;
                  avatarUrl?: string | null;
              }
            | null
            | undefined
    ) => {
        setFormState(getFormStateFromUser(user));
        setSelectedAvatarFile(null);
        setAvatarPreviewUrl('');
        setIsAvatarMarkedForRemoval(false);
    };

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open);

        if (open) {
            resetFormState(currentUser);
            return;
        }

        resetFormState(currentUser);
    };

    const handleSave = async () => {
        const username = formState.username.trim();
        const email = formState.email.trim();

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
            }).unwrap();

            if (selectedAvatarFile) {
                await uploadCurrentUserAvatar(selectedAvatarFile).unwrap();
            } else if (isAvatarMarkedForRemoval) {
                await removeCurrentUserAvatar().unwrap();
            }

            toaster.create({
                type: 'success',
                title: 'Профиль обновлён',
            });
            handleOpenChange(false);
        } catch {
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: selectedAvatarFile
                    ? 'Не удалось сохранить профиль или загрузить аватар'
                    : 'Не удалось сохранить профиль',
            });
        }
    };

    const handleAvatarRemove = () => {
        if (selectedAvatarFile) {
            setSelectedAvatarFile(null);
            setAvatarPreviewUrl('');
            return;
        }

        setIsAvatarMarkedForRemoval(true);
    };

    const handleAvatarFileChange = (details: { acceptedFiles: File[] }) => {
        const nextFile = details.acceptedFiles[0] ?? null;

        setSelectedAvatarFile(nextFile);
        setIsAvatarMarkedForRemoval(false);

        if (!nextFile) {
            setAvatarPreviewUrl('');
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            setAvatarPreviewUrl(
                typeof reader.result === 'string' ? reader.result : ''
            );
        };
        reader.onerror = () => {
            setAvatarPreviewUrl('');
            toaster.create({
                type: 'error',
                title: 'Ошибка',
                description: 'Не удалось прочитать файл для предпросмотра',
            });
        };
        reader.readAsDataURL(nextFile);
    };

    const handleAvatarReject = () => {
        toaster.create({
            type: 'error',
            title: 'Неподходящий файл',
            description: 'Поддерживаются JPG, PNG, WEBP и GIF до 5 МБ',
        });
    };

    const previewName =
        formState.username.trim() || currentUser?.username || 'Пользователь';
    const previewAvatarUrl = isAvatarMarkedForRemoval
        ? ''
        : avatarPreviewUrl ||
          currentUser?.avatarUrl ||
          getUserInfo()?.avatarUrl ||
          '';

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
                                        {previewAvatarUrl ? (
                                            <Avatar.Image
                                                src={previewAvatarUrl}
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
                                    <Field.Label>Аватар</Field.Label>
                                    <Stack gap={3}>
                                        <FileUpload.Root
                                            accept={ACCEPTED_AVATAR_TYPES}
                                            maxFiles={1}
                                            maxFileSize={5 * 1024 * 1024}
                                            acceptedFiles={
                                                selectedAvatarFile
                                                    ? [selectedAvatarFile]
                                                    : []
                                            }
                                            onFileChange={
                                                handleAvatarFileChange
                                            }
                                            onFileReject={handleAvatarReject}
                                        >
                                            <FileUpload.HiddenInput />
                                            <FileUpload.Trigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <LuUpload />
                                                    Загрузить файл
                                                </Button>
                                            </FileUpload.Trigger>
                                            <FileUpload.List clearable />
                                        </FileUpload.Root>

                                        <HStack>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleAvatarRemove}
                                                disabled={
                                                    !selectedAvatarFile &&
                                                    !currentUser?.avatarUrl &&
                                                    !getUserInfo()?.avatarUrl
                                                }
                                            >
                                                <LuTrash2 />
                                                {selectedAvatarFile
                                                    ? 'Убрать выбранный файл'
                                                    : 'Удалить аватар'}
                                            </Button>
                                        </HStack>
                                    </Stack>
                                    <Field.HelperText>
                                        JPG, PNG, WEBP или GIF до 5 МБ. Если
                                        аватар не выбран, покажем инициалы.
                                    </Field.HelperText>
                                </Field.Root>
                            </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button
                                variant="outline"
                                onClick={() => handleOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Отмена
                            </Button>
                            <Button
                                colorPalette="blue"
                                onClick={handleSave}
                                loading={isSubmitting}
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
