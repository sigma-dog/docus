import { type FC, type FormEvent } from 'react';
import { LuPencil, LuTrash2, LuUpload } from 'react-icons/lu';
import {
    Avatar,
    Box,
    Button,
    CloseButton,
    Dialog,
    Field,
    FileUpload,
    HStack,
    IconButton,
    Input,
    Portal,
    Stack,
    Text,
    Textarea,
} from '@chakra-ui/react';

type OrganizationProfileSectionProps = {
    name: string;
    slug: string;
    description: string | null;
    avatarUrl: string | null;
    canEditOrganization: boolean;
    editingName: string;
    editingDescription: string;
    isEditingName: boolean;
    isEditingDescription: boolean;
    isSaving: boolean;
    isUpdatingAvatar: boolean;
    onNameChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onStartEditingName: () => void;
    onStartEditingDescription: () => void;
    onResetName: () => void;
    onResetDescription: () => void;
    onAvatarChange: (file: File | null) => void;
    onAvatarReject: () => void;
    onAvatarRemove: () => void;
    onSubmitName: (event: FormEvent) => void;
    onSubmitDescription: (event: FormEvent) => void;
};

export const OrganizationProfileSection: FC<
    OrganizationProfileSectionProps
> = ({
    name,
    slug,
    description,
    avatarUrl,
    canEditOrganization,
    editingName,
    editingDescription,
    isEditingName,
    isEditingDescription,
    isSaving,
    isUpdatingAvatar,
    onNameChange,
    onDescriptionChange,
    onStartEditingName,
    onStartEditingDescription,
    onResetName,
    onResetDescription,
    onAvatarChange,
    onAvatarReject,
    onAvatarRemove,
    onSubmitName,
    onSubmitDescription,
}) => {
    return (
        <HStack gap={4} align="flex-start" minW={0}>
            <Dialog.Root placement="center">
                <Box position="relative" flexShrink={0}>
                    <Avatar.Root size="xl" shape="rounded">
                        {avatarUrl ? <Avatar.Image src={avatarUrl} /> : null}
                        <Avatar.Fallback name={name} />
                    </Avatar.Root>

                    {canEditOrganization && (
                        <Dialog.Trigger asChild>
                            <IconButton
                                aria-label="Изменить аватар организации"
                                size="2xs"
                                rounded="full"
                                colorPalette="blue"
                                position="absolute"
                                right="-2"
                                bottom="-2"
                                boxShadow="sm"
                            >
                                <LuPencil />
                            </IconButton>
                        </Dialog.Trigger>
                    )}
                </Box>

                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header>
                                <Dialog.Title>Аватар организации</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.Body>
                                <Stack gap={4}>
                                    <Stack align="center" gap={3}>
                                        <Avatar.Root size="2xl" shape="rounded">
                                            {avatarUrl ? (
                                                <Avatar.Image src={avatarUrl} />
                                            ) : null}
                                            <Avatar.Fallback name={name} />
                                        </Avatar.Root>
                                        <Text
                                            fontSize="sm"
                                            color="fg.muted"
                                            textAlign="center"
                                        >
                                            Загрузите новый файл или удалите
                                            текущую аватарку
                                        </Text>
                                    </Stack>

                                    <Field.Root>
                                        <Field.Label>Файл</Field.Label>
                                        <Stack gap={3}>
                                            <FileUpload.Root
                                                accept={{
                                                    'image/jpeg': [
                                                        '.jpg',
                                                        '.jpeg',
                                                    ],
                                                    'image/png': ['.png'],
                                                    'image/webp': ['.webp'],
                                                    'image/gif': ['.gif'],
                                                }}
                                                maxFiles={1}
                                                maxFileSize={5 * 1024 * 1024}
                                                onFileChange={(details) =>
                                                    onAvatarChange(
                                                        details
                                                            .acceptedFiles[0] ??
                                                            null
                                                    )
                                                }
                                                onFileReject={onAvatarReject}
                                            >
                                                <FileUpload.HiddenInput />
                                                <HStack>
                                                    <FileUpload.Trigger asChild>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            loading={
                                                                isUpdatingAvatar
                                                            }
                                                        >
                                                            <LuUpload />
                                                            Загрузить файл
                                                        </Button>
                                                    </FileUpload.Trigger>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={onAvatarRemove}
                                                        disabled={
                                                            !avatarUrl ||
                                                            isUpdatingAvatar
                                                        }
                                                        loading={
                                                            isUpdatingAvatar
                                                        }
                                                    >
                                                        <LuTrash2 />
                                                        Удалить
                                                    </Button>
                                                </HStack>
                                            </FileUpload.Root>
                                            <Field.HelperText>
                                                JPG, PNG, WEBP или GIF до 5 МБ.
                                            </Field.HelperText>
                                        </Stack>
                                    </Field.Root>
                                </Stack>
                            </Dialog.Body>
                            <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                            </Dialog.CloseTrigger>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>

            <Stack gap={3} minW={0} flex="1">
                <Stack gap={1}>
                    {isEditingName ? (
                        <form onSubmit={onSubmitName}>
                            <HStack gap={2} align="center">
                                <Input
                                    size="sm"
                                    value={editingName}
                                    onChange={(event) =>
                                        onNameChange(event.target.value)
                                    }
                                    onBlur={onResetName}
                                    autoFocus
                                    maxW="full"
                                    fontSize="md"
                                    fontWeight="semibold"
                                    h="8"
                                />
                                <Button
                                    type="submit"
                                    size="xs"
                                    colorPalette="blue"
                                    loading={isSaving}
                                    disabled={!editingName.trim()}
                                    onMouseDown={(event) =>
                                        event.preventDefault()
                                    }
                                >
                                    Сохранить
                                </Button>
                            </HStack>
                        </form>
                    ) : (
                        <HStack gap={2} align="center">
                            <Text
                                fontSize="xl"
                                fontWeight="semibold"
                                lineHeight="short"
                                lineClamp={1}
                                maxW="full"
                            >
                                {name}
                            </Text>
                            {canEditOrganization && (
                                <IconButton
                                    aria-label="Редактировать название организации"
                                    variant="ghost"
                                    size="xs"
                                    onClick={onStartEditingName}
                                >
                                    <LuPencil />
                                </IconButton>
                            )}
                        </HStack>
                    )}

                    <Text color="fg.muted" fontSize="sm">
                        @{slug}
                    </Text>
                </Stack>

                {isEditingDescription ? (
                    <form onSubmit={onSubmitDescription}>
                        <Stack gap={3}>
                            <Field.Root>
                                <Field.Label>Описание</Field.Label>
                                <Textarea
                                    value={editingDescription}
                                    onChange={(event) =>
                                        onDescriptionChange(event.target.value)
                                    }
                                    resize="none"
                                    rows={4}
                                    placeholder="Краткое описание организации"
                                />
                            </Field.Root>
                            <HStack justify="flex-end">
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={onResetDescription}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    type="submit"
                                    colorPalette="blue"
                                    loading={isSaving}
                                >
                                    Сохранить
                                </Button>
                            </HStack>
                        </Stack>
                    </form>
                ) : (
                    <HStack align="flex-start" gap={2}>
                        <Text color="fg.muted" fontSize="sm" flex="1">
                            {description || 'Описание пока не добавлено'}
                        </Text>
                        {canEditOrganization && (
                            <IconButton
                                aria-label="Редактировать описание организации"
                                variant="ghost"
                                size="xs"
                                onClick={onStartEditingDescription}
                            >
                                <LuPencil />
                            </IconButton>
                        )}
                    </HStack>
                )}
            </Stack>
        </HStack>
    );
};
